/**
 * Glossary Term Validator
 * Valida la qualità e completezza dei termini del glossario
 */

import type { GlossaryTerm } from "./terms";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100, qualità del termine
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Valida un termine del glossario
 */
export function validateGlossaryTerm(term: Partial<GlossaryTerm>, key?: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let score = 100;

  // Validazione campi obbligatori
  if (!term.title || term.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "Il titolo è obbligatorio",
      severity: "error",
    });
    score -= 20;
  } else if (term.title.length < 2) {
    errors.push({
      field: "title",
      message: "Il titolo deve essere almeno 2 caratteri",
      severity: "error",
    });
    score -= 10;
  }

  if (!term.what || term.what.trim().length === 0) {
    errors.push({
      field: "what",
      message: "La spiegazione accademica è obbligatoria",
      severity: "error",
    });
    score -= 25;
  } else if (term.what.length < 50) {
    warnings.push({
      field: "what",
      message: "La spiegazione accademica è troppo breve (minimo 50 caratteri consigliato)",
      suggestion: "Aggiungi più dettagli sulla definizione formale",
    });
    score -= 5;
  } else if (term.what.length > 500) {
    warnings.push({
      field: "what",
      message: "La spiegazione accademica è molto lunga (massimo 500 caratteri consigliato)",
      suggestion: "Considera di semplificare o dividere in più sezioni",
    });
  }

  if (!term.how || term.how.trim().length === 0) {
    errors.push({
      field: "how",
      message: "La spiegazione Tradelia AI è obbligatoria",
      severity: "error",
    });
    score -= 25;
  } else if (term.how.length < 100) {
    warnings.push({
      field: "how",
      message: "La spiegazione Tradelia AI è troppo breve (minimo 100 caratteri consigliato)",
      suggestion: "Aggiungi esempi pratici o dettagli su come Tradelia usa il termine",
    });
    score -= 5;
  }

  if (!term.source || term.source.trim().length === 0) {
    errors.push({
      field: "source",
      message: "Le fonti sono obbligatorie",
      severity: "error",
    });
    score -= 20;
  } else {
    const sources = term.source
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (sources.length === 0) {
      errors.push({
        field: "source",
        message: "Almeno una fonte è richiesta",
        severity: "error",
      });
      score -= 20;
    } else if (sources.length === 1) {
      warnings.push({
        field: "source",
        message: "Solo una fonte presente (2-3 fonti consigliate)",
        suggestion: "Aggiungi altre fonti accademiche per maggiore credibilità",
      });
      score -= 3;
    }

    // Valida formato fonti (dovrebbero contenere autore e anno)
    const hasAuthorYear = sources.some((s) => /\([0-9]{4}\)/.test(s));
    if (!hasAuthorYear) {
      warnings.push({
        field: "source",
        message: "Le fonti potrebbero non essere in formato accademico standard",
        suggestion: 'Formato consigliato: "Autore (Anno). Titolo. Rivista..."',
      });
      score -= 2;
    }
  }

  // Validazione campo opzionale technical
  if (term.technical) {
    if (term.technical.length < 50) {
      warnings.push({
        field: "technical",
        message: "La spiegazione tecnica è troppo breve (minimo 50 caratteri consigliato)",
        suggestion: "Espandi la spiegazione tecnica semplificata",
      });
      score -= 3;
    }
  } else {
    warnings.push({
      field: "technical",
      message: "Spiegazione tecnica semplificata mancante (opzionale ma consigliata)",
      suggestion: "Aggiungi una spiegazione tecnica accessibile per utenti non esperti",
    });
    score -= 5;
  }

  // Validazione relatedTerms
  if (term.relatedTerms) {
    if (term.relatedTerms.length === 0) {
      warnings.push({
        field: "relatedTerms",
        message: "Nessun termine correlato (consigliato per contesto)",
        suggestion: "Aggiungi 2-5 termini correlati per aiutare la navigazione",
      });
      score -= 3;
    } else if (term.relatedTerms.length > 5) {
      warnings.push({
        field: "relatedTerms",
        message: "Troppi termini correlati (massimo 5 consigliato)",
        suggestion: "Mantieni solo i termini più strettamente correlati",
      });
      score -= 2;
    }

    // Verifica che i termini correlati esistano (richiede accesso al database)
    // Questo verrà fatto in fase di import
  }

  // Validazione key
  if (key) {
    if (!/^[A-Z][a-zA-Z0-9_]*$/.test(key)) {
      warnings.push({
        field: "key",
        message: "La chiave dovrebbe essere in camelCase (es. RegimeScore)",
        suggestion: `Formato consigliato: ${term.title?.replace(/\s+/g, "") || "TermKey"}`,
      });
    }
  }

  // Validazione qualità generale
  if (term.what && term.how && term.what === term.how) {
    errors.push({
      field: "content",
      message: "Le spiegazioni accademica e Tradelia AI sono identiche",
      severity: "error",
    });
    score -= 15;
  }

  // Controllo duplicati parziali (richiede accesso al database)
  // Questo verrà fatto in fase di import

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, Math.min(100, score)),
  };
}

/**
 * Valida un batch di termini
 */
export function validateGlossaryBatch(terms: Record<string, Partial<GlossaryTerm>>): {
  results: Record<string, ValidationResult>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    averageScore: number;
  };
} {
  const results: Record<string, ValidationResult> = {};
  let totalScore = 0;
  let validCount = 0;

  for (const [key, term] of Object.entries(terms)) {
    const result = validateGlossaryTerm(term, key);
    results[key] = result;
    totalScore += result.score;
    if (result.isValid) {
      validCount++;
    }
  }

  return {
    results,
    summary: {
      total: Object.keys(terms).length,
      valid: validCount,
      invalid: Object.keys(terms).length - validCount,
      averageScore: totalScore / Object.keys(terms).length,
    },
  };
}

/**
 * Suggerisce miglioramenti per un termine
 */
export function suggestImprovements(term: Partial<GlossaryTerm>): string[] {
  const suggestions: string[] = [];
  const validation = validateGlossaryTerm(term);

  for (const warning of validation.warnings) {
    if (warning.suggestion) {
      suggestions.push(`${warning.field}: ${warning.suggestion}`);
    }
  }

  return suggestions;
}
