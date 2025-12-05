/**
 * Format AI Message - Utility per formattare messaggi AI con markdown e evidenziare MIFID
 * 
 * Best Practice: Parsing markdown, evidenziazione disclaimer, formattazione paragrafi
 */

import * as React from 'react';

export interface FormattedMessage {
  parts: Array<{
    type: 'text' | 'mifid' | 'heading' | 'list' | 'bold' | 'section' | 'source';
    content: string;
    level?: number; // Per heading (h1, h2, etc.)
    items?: string[]; // Per liste
    sectionType?: 'definition' | 'explanation' | 'examples' | 'mistakes' | 'further';
  }>;
}

/**
 * Estrae e formatta il messaggio AI con evidenziazione MIFID
 */
export function formatAIMessage(message: string): FormattedMessage {
  const parts: FormattedMessage['parts'] = [];
  
  // Pattern per MIFID disclaimer (case insensitive)
  // Cattura tutto dalla parola MIFID fino alla fine della frase/paragrafo
  const mifidPattern = /(\*?[Nn]ota\s+)?MIFID\s*II?[^\n]*[^\n]*/gi;
  const mifidMatches: Array<{ start: number; end: number; text: string }> = [];
  
  let lastIndex = 0;
  let match;
  
  // Trova tutti i match MIFID
  while ((match = mifidPattern.exec(message)) !== null) {
    mifidMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
    });
  }
  
  // Se non ci sono match MIFID, formatta normalmente
  if (mifidMatches.length === 0) {
    return formatMarkdown(message);
  }
  
  // Processa il messaggio separando testo normale da MIFID
  mifidMatches.forEach((mifidMatch) => {
    // Testo prima del MIFID
    if (mifidMatch.start > lastIndex) {
      const textBefore = message.substring(lastIndex, mifidMatch.start);
      if (textBefore.trim()) {
        const formatted = formatMarkdown(textBefore);
        parts.push(...formatted.parts);
      }
    }
    
    // MIFID disclaimer (evidenziato)
    // Pulisci il testo MIFID rimuovendo asterischi iniziali/finali
    const cleanedMifid = mifidMatch.text
      .replace(/^\*+/, '')
      .replace(/\*+$/, '')
      .trim();
    
    parts.push({
      type: 'mifid',
      content: cleanedMifid,
    });
    
    lastIndex = mifidMatch.end;
  });
  
  // Testo dopo l'ultimo MIFID
  if (lastIndex < message.length) {
    const textAfter = message.substring(lastIndex);
    if (textAfter.trim()) {
      const formatted = formatMarkdown(textAfter);
      parts.push(...formatted.parts);
    }
  }
  
  return { parts };
}

/**
 * Formatta markdown base (heading, bold, liste, paragrafi)
 * Riconosce anche schema Tradelia 5 punti
 */
function formatMarkdown(text: string): FormattedMessage {
  const parts: FormattedMessage['parts'] = [];
  
  // Pattern per riconoscere schema Tradelia 5 punti
  const tradeliaSectionPatterns = {
    definition: /^(\d+\.\s*)?(DEFINIZIONE|DEFINITION|DEFINIZIONE ACCADEMICA|ACADEMIC DEFINITION)[:\s]*/i,
    explanation: /^(\d+\.\s*)?(SPIEGAZIONE|EXPLANATION|COME FUNZIONA|HOW IT WORKS)[:\s]*/i,
    examples: /^(\d+\.\s*)?(ESEMPI|EXAMPLES|ESEMPI PRATICI|PRACTICAL EXAMPLES)[:\s]*/i,
    mistakes: /^(\d+\.\s*)?(ERRORI|MISTAKES|ERRORI COMUNI|COMMON MISTAKES)[:\s]*/i,
    further: /^(\d+\.\s*)?(APPROFONDIMENTI|FURTHER|LEARN MORE|PER SAPERNE DI PIÙ)[:\s]*/i,
  };

  // Pattern per fonti accademiche (es: "Fonte:", "Source:", "Riferimento:")
  const sourcePattern = /^(Fonte|Source|Riferimento|Reference|Bibliografia|Bibliography)[:\s]+(.+)$/i;
  
  // Split per paragrafi (doppio newline o newline seguito da spazio)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  
  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    
    // Check for source
    const sourceMatch = trimmed.match(sourcePattern);
    if (sourceMatch) {
      parts.push({
        type: 'source',
        content: sourceMatch[2] || sourceMatch[1],
      });
      return;
    }
    
    // Check for Tradelia sections
    let sectionType: 'definition' | 'explanation' | 'examples' | 'mistakes' | 'further' | undefined;
    let sectionContent = trimmed;
    
    for (const [type, pattern] of Object.entries(tradeliaSectionPatterns)) {
      if (pattern.test(trimmed)) {
        sectionType = type as any;
        sectionContent = trimmed.replace(pattern, '').trim();
        break;
      }
    }
    
    if (sectionType) {
      parts.push({
        type: 'section',
        content: sectionContent,
        sectionType,
      });
      return;
    }
    
    // Heading (## o ###)
    if (trimmed.startsWith('##')) {
      const level = trimmed.match(/^#+/)?.[0].length || 2;
      const content = trimmed.replace(/^#+\s*/, '');
      parts.push({
        type: 'heading',
        content,
        level: Math.min(level, 6),
      });
      return;
    }
    
    // Liste (• o -)
    if (trimmed.match(/^[•\-\*]\s/)) {
      const items = trimmed
        .split(/\n/)
        .filter(line => line.trim().match(/^[•\-\*]\s/))
        .map(line => line.replace(/^[•\-\*]\s+/, '').trim())
        .filter(item => item);
      
      if (items.length > 0) {
        parts.push({
          type: 'list',
          content: '',
          items,
        });
        return;
      }
    }
    
    // Bold (**text**)
    if (trimmed.includes('**')) {
      parts.push({
        type: 'bold',
        content: trimmed,
      });
      return;
    }
    
    // Testo normale (paragrafo)
    if (trimmed) {
      parts.push({
        type: 'text',
        content: trimmed,
      });
    }
  });
  
  return { parts };
}

/**
 * Renderizza il messaggio formattato come React component
 */
export function renderFormattedMessage(parts: FormattedMessage['parts'], locale: 'it' | 'en'): React.ReactNode[] {
  return parts.map((part, index) => {
    switch (part.type) {
      case 'mifid':
        return (
          <div
            key={`mifid-${index}`}
            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-400/50 dark:border-amber-500/50 shadow-md relative overflow-hidden"
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
              }} />
            </div>
            
            {/* MIFID Badge */}
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 dark:bg-amber-600/30 border border-amber-500/40 dark:border-amber-500/50">
                <svg className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <strong className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  MIFID II
                </strong>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed font-medium">
                {part.content
                  .replace(/^([Nn]ota\s+)?MIFID\s*II?[:\s]*/i, '')
                  .replace(/\*+/g, '')
                  .trim()}
              </p>
            </div>
          </div>
        );
      
      case 'heading':
        const HeadingTag = `h${Math.min(part.level || 2, 6)}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          2: 'text-base font-semibold text-text-primary mt-4 mb-2 leading-relaxed',
          3: 'text-sm font-semibold text-text-primary mt-3 mb-1.5 leading-relaxed',
          4: 'text-sm font-medium text-text-primary mt-2 mb-1 leading-relaxed',
        }[part.level || 2] || 'text-sm font-semibold text-text-primary mt-2 mb-1 leading-relaxed';
        
        return (
          <HeadingTag key={`heading-${index}`} className={headingClasses}>
            {part.content}
          </HeadingTag>
        );
      
      case 'list':
        return (
          <ul key={`list-${index}`} className="mt-2 mb-2 space-y-1.5 list-none">
            {part.items?.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start gap-2 text-sm text-text-primary leading-relaxed">
                <span className="text-accent mt-1.5 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      
      case 'bold':
        // Estrai testo bold e normale
        const boldRegex = /\*\*(.*?)\*\*/g;
        const elements: (string | React.ReactElement)[] = [];
        let lastIndex = 0;
        let match;
        
        while ((match = boldRegex.exec(part.content)) !== null) {
          // Testo prima del bold
          if (match.index > lastIndex) {
            elements.push(part.content.substring(lastIndex, match.index));
          }
          // Testo bold
          elements.push(
            <strong key={`bold-${match.index}`} className="font-semibold text-text-primary">
              {match[1]}
            </strong>
          );
          lastIndex = match.index + match[0].length;
        }
        
        // Testo dopo l'ultimo bold
        if (lastIndex < part.content.length) {
          elements.push(part.content.substring(lastIndex));
        }
        
        return (
          <p key={`bold-${index}`} className="text-sm text-text-primary leading-relaxed mb-2">
            {elements.length > 0 ? elements : part.content}
          </p>
        );
      
      case 'section':
        const sectionLabels = {
          definition: locale === 'it' ? '📚 Definizione' : '📚 Definition',
          explanation: locale === 'it' ? '💡 Spiegazione' : '💡 Explanation',
          examples: locale === 'it' ? '📝 Esempi' : '📝 Examples',
          mistakes: locale === 'it' ? '⚠️ Errori Comuni' : '⚠️ Common Mistakes',
          further: locale === 'it' ? '🔍 Approfondimenti' : '🔍 Further Learning',
        };
        
        // Processa il contenuto della sezione per estrarre liste, bold, etc.
        const sectionContent = part.content;
        const hasBold = sectionContent.includes('**');
        const hasList = sectionContent.match(/^[•\-\*]\s/m);
        
        return (
          <div
            key={`section-${index}`}
            className="mt-6 mb-4 pb-4 border-b border-border-subtle last:border-b-0"
          >
            <h4 className="text-sm font-semibold text-accent mb-2.5">
              {sectionLabels[part.sectionType || 'definition']}
            </h4>
            <div className="text-sm text-text-primary leading-relaxed space-y-2">
              {hasList ? (
                <ul className="mt-2 mb-2 space-y-1.5 list-none">
                  {sectionContent
                    .split(/\n/)
                    .filter(line => line.trim().match(/^[•\-\*]\s/))
                    .map((line, itemIndex) => {
                      const item = line.replace(/^[•\-\*]\s+/, '').trim();
                      return (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <span className="text-accent mt-1.5 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      );
                    })}
                </ul>
              ) : hasBold ? (
                (() => {
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  const elements: (string | React.ReactElement)[] = [];
                  let lastIdx = 0;
                  let match;
                  
                  while ((match = boldRegex.exec(sectionContent)) !== null) {
                    if (match.index > lastIdx) {
                      elements.push(sectionContent.substring(lastIdx, match.index));
                    }
                    elements.push(
                      <strong key={`bold-${match.index}`} className="font-semibold">
                        {match[1]}
                      </strong>
                    );
                    lastIdx = match.index + match[0].length;
                  }
                  if (lastIdx < sectionContent.length) {
                    elements.push(sectionContent.substring(lastIdx));
                  }
                  return <p>{elements.length > 0 ? elements : sectionContent}</p>;
                })()
              ) : (
                <p>{sectionContent}</p>
              )}
            </div>
          </div>
        );
      
      case 'source':
        return (
          <div
            key={`source-${index}`}
            className="mt-4 pt-3 border-t border-border-subtle"
          >
            <p className="text-[10px] text-text-tertiary leading-tight font-medium uppercase tracking-wide mb-1">
              {locale === 'it' ? 'Fonte' : 'Source'}
            </p>
            <p className="text-[11px] text-text-secondary leading-relaxed italic">
              {part.content}
            </p>
          </div>
        );
      
      case 'text':
      default:
        return (
          <p key={`text-${index}`} className="text-sm text-text-primary leading-relaxed mb-4">
            {part.content}
          </p>
        );
    }
  });
}
