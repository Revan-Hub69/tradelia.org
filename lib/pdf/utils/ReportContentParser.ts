/**
 * Report Content Parser
 * Parse report content JSON e estrae sezioni, tabelle, chart
 * Riferimento: Few (2006) - Information Dashboard Design
 */

export interface ParsedReportSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  type: 'text' | 'table' | 'chart' | 'stats' | 'list';
  data?: any;
  order: number;
}

/**
 * Parse report content JSON in sezioni strutturate
 */
export function parseReportContent(content: any): ParsedReportSection[] {
  const sections: ParsedReportSection[] = [];

  if (!content) {
    return sections;
  }

  // Se content è stringa, prova a parse JSON
  let contentData: any = content;
  if (typeof content === 'string') {
    try {
      contentData = JSON.parse(content);
    } catch {
      // Se non è JSON, trattalo come testo semplice
      sections.push({
        id: 'content',
        title: 'Contenuto',
        content: content,
        type: 'text',
        order: 0,
      });
      return sections;
    }
  }

  let order = 0;

  // 1. Executive Summary (Few: Always first)
  if (contentData.executiveSummary) {
    sections.push({
      id: 'executive-summary',
      title: 'Executive Summary',
      subtitle: 'Riepilogo Esecutivo',
      content: typeof contentData.executiveSummary === 'string'
        ? contentData.executiveSummary
        : JSON.stringify(contentData.executiveSummary),
      type: 'text',
      order: order++,
    });
  }

  // 2. Key Metrics / Statistics (Few: Prominent metrics)
  if (contentData.metrics || contentData.statistics || contentData.keyMetrics) {
    const metrics = contentData.metrics || contentData.statistics || contentData.keyMetrics;
    sections.push({
      id: 'key-metrics',
      title: 'Metriche Chiave',
      subtitle: 'Indicatori Principali',
      content: '',
      type: 'stats',
      data: Array.isArray(metrics) ? metrics : Object.entries(metrics || {}).map(([key, value]) => ({
        label: key,
        value: String(value),
      })),
      order: order++,
    });
  }

  // 3. Main Content Sections
  if (contentData.sections && Array.isArray(contentData.sections)) {
    contentData.sections.forEach((section: any, index: number) => {
      sections.push({
        id: section.id || `section-${index}`,
        title: section.title || `Sezione ${index + 1}`,
        subtitle: section.subtitle,
        content: section.content || section.text || '',
        type: section.type || 'text',
        data: section.data,
        order: order++,
      });
    });
  }

  // 4. Analysis Sections
  if (contentData.analysis && Array.isArray(contentData.analysis)) {
    contentData.analysis.forEach((analysis: any, index: number) => {
      sections.push({
        id: `analysis-${index}`,
        title: analysis.title || `Analisi ${index + 1}`,
        subtitle: analysis.subtitle,
        content: analysis.content || analysis.text || '',
        type: analysis.type || 'text',
        data: analysis.data,
        order: order++,
      });
    });
  }

  // 5. Data Tables (Few: Clear data presentation)
  if (contentData.tables && Array.isArray(contentData.tables)) {
    contentData.tables.forEach((table: any, index: number) => {
      sections.push({
        id: `table-${index}`,
        title: table.title || `Tabella ${index + 1}`,
        subtitle: table.subtitle,
        content: '',
        type: 'table',
        data: table.data || table.rows || [],
        order: order++,
      });
    });
  }

  // 6. Charts (Few: Appropriate sizing and context)
  if (contentData.charts && Array.isArray(contentData.charts)) {
    contentData.charts.forEach((chart: any, index: number) => {
      sections.push({
        id: `chart-${index}`,
        title: chart.title || `Grafico ${index + 1}`,
        subtitle: chart.subtitle,
        content: '',
        type: 'chart',
        data: {
          caption: chart.caption || chart.title,
          imageUrl: chart.imageUrl || chart.url || chart.base64,
          description: chart.description,
        },
        order: order++,
      });
    });
  }

  // 7. Lists
  if (contentData.lists && Array.isArray(contentData.lists)) {
    contentData.lists.forEach((list: any, index: number) => {
      sections.push({
        id: `list-${index}`,
        title: list.title || `Lista ${index + 1}`,
        content: '',
        type: 'list',
        data: list.items || list.data || [],
        order: order++,
      });
    });
  }

  // 8. Conclusions (Few: Always last)
  if (contentData.conclusions || contentData.conclusion) {
    sections.push({
      id: 'conclusions',
      title: 'Conclusioni',
      subtitle: 'Riepilogo e Raccomandazioni',
      content: contentData.conclusions || contentData.conclusion || '',
      type: 'text',
      order: order++,
    });
  }

  // 9. Recommendations
  if (contentData.recommendations) {
    sections.push({
      id: 'recommendations',
      title: 'Raccomandazioni',
      content: typeof contentData.recommendations === 'string'
        ? contentData.recommendations
        : Array.isArray(contentData.recommendations)
        ? contentData.recommendations.join('\n')
        : '',
      type: Array.isArray(contentData.recommendations) ? 'list' : 'text',
      data: Array.isArray(contentData.recommendations) ? contentData.recommendations : undefined,
      order: order++,
    });
  }

  // Se non ci sono sezioni, crea sezione default dal content
  if (sections.length === 0) {
    sections.push({
      id: 'content',
      title: 'Contenuto Report',
      content: typeof contentData === 'string'
        ? contentData
        : JSON.stringify(contentData, null, 2),
      type: 'text',
      order: 0,
    });
  }

  // Ordina per order
  return sections.sort((a, b) => a.order - b.order);
}

/**
 * Estrae tutti i chart da content per conversione
 */
export function extractChartsFromContent(content: any): Array<{ id: string; url: string; caption: string }> {
  const charts: Array<{ id: string; url: string; caption: string }> = [];

  if (!content) return charts;

  let contentData: any = content;
  if (typeof content === 'string') {
    try {
      contentData = JSON.parse(content);
    } catch {
      return charts;
    }
  }

  if (contentData.charts && Array.isArray(contentData.charts)) {
    contentData.charts.forEach((chart: any, index: number) => {
      if (chart.url || chart.imageUrl || chart.base64) {
        charts.push({
          id: chart.id || `chart-${index}`,
          url: chart.url || chart.imageUrl || chart.base64,
          caption: chart.caption || chart.title || `Grafico ${index + 1}`,
        });
      }
    });
  }

  return charts;
}

