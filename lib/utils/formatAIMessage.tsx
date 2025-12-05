/**
 * Format AI Message - Utility per formattare messaggi AI con markdown e evidenziare MIFID
 * 
 * Best Practice: Parsing markdown, evidenziazione disclaimer, formattazione paragrafi
 */

import * as React from 'react';

export interface FormattedMessage {
  parts: Array<{
    type: 'text' | 'mifid' | 'heading' | 'list' | 'bold';
    content: string;
    level?: number; // Per heading (h1, h2, etc.)
    items?: string[]; // Per liste
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
 */
function formatMarkdown(text: string): FormattedMessage {
  const parts: FormattedMessage['parts'] = [];
  
  // Split per paragrafi (doppio newline o newline seguito da spazio)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  
  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    
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
            className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed"
          >
            <strong className="text-amber-300 font-semibold">
              {locale === 'it' ? 'Nota MIFID II:' : 'MIFID II Note:'}
            </strong>{' '}
            <span className="text-amber-200/90">
              {part.content
                .replace(/^([Nn]ota\s+)?MIFID\s*II?[:\s]*/i, '')
                .replace(/\*+/g, '')
                .trim()}
            </span>
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
      
      case 'text':
      default:
        return (
          <p key={`text-${index}`} className="text-sm text-text-primary leading-relaxed mb-3">
            {part.content}
          </p>
        );
    }
  });
}
