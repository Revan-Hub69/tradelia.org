/**
 * PDF Report Template
 * Template professionale per report PDF con logo Tradelia
 * Riferimento: Few (2006) - Information Dashboard Design, Tufte (2001) - Visual Display
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from '@react-pdf/renderer';
import type { WhitelabelConfig } from '../utils/WhitelabelLoader';

// Register fonts (se necessario)
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf' },
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
//   ],
// });

// Logo Tradelia come base64 (da convertire da SVG)
// In produzione, caricare da file system o CDN
const TRADELIA_LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNjAgNjAiIHdpZHRoPSIyNjAiIGhlaWdodD0iNjAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0ibG9nb0dyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzI1NjNlYjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjgyZjY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRleHQgeD0iMTMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0idXJsKCNsb2dvR3JhZGllbnQpIj5UUkFERUxJQTwvdGV4dD48L3N2Zz4=';

// Styles seguendo principi Few (2006) - Information Density, Visual Hierarchy
const styles = StyleSheet.create({
  // Page layout - Few: Margins appropriate per leggibilità
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40, // Margini generosi per leggibilità
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
  },

  // Header - Few: Branding prominente ma non invasivo
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af', // Accent color
  },

  logoContainer: {
    width: 120,
    height: 40,
  },

  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },

  headerInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a', // Text primary
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 10,
    color: '#64748b', // Text secondary
  },

  headerMeta: {
    fontSize: 8,
    color: '#94a3b8', // Text tertiary
    marginTop: 4,
  },

  // Content sections - Few: Clear visual hierarchy
  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // Border subtle
  },

  sectionSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b', // Text primary
    marginTop: 15,
    marginBottom: 8,
  },

  // Text content - Few: Readable typography
  paragraph: {
    fontSize: 10,
    color: '#334155', // Text secondary
    marginBottom: 10,
    lineHeight: 1.6,
    textAlign: 'justify',
  },

  // Lists - Few: Clear structure
  list: {
    marginLeft: 15,
    marginBottom: 10,
  },

  listItem: {
    fontSize: 10,
    color: '#334155',
    marginBottom: 6,
    lineHeight: 1.5,
  },

  // Tables - Few: Clear data presentation
  table: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  tableHeader: {
    backgroundColor: '#f1f5f9', // Bg soft
    fontWeight: 'bold',
  },

  tableCell: {
    padding: 8,
    fontSize: 9,
    color: '#334155',
    flex: 1,
  },

  // Charts/Images - Few: Appropriate sizing
  chartContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },

  chartImage: {
    maxWidth: '100%',
    height: 'auto',
    marginBottom: 10,
  },

  chartCaption: {
    fontSize: 8,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },

  // Footer - Few: Metadata non invasivo
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    fontSize: 8,
    color: '#94a3b8',
  },

  // Highlights - Few: Visual emphasis
  highlight: {
    backgroundColor: '#dbeafe', // Accent/20
    padding: 8,
    borderRadius: 4,
    marginVertical: 10,
  },

  highlightText: {
    fontSize: 10,
    color: '#1e40af', // Accent
    fontWeight: 'bold',
  },

  // Statistics - Few: Prominent metrics
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f8fafc', // Bg soft
    borderRadius: 4,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af', // Accent
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },

  // Page break
  pageBreak: {
    marginVertical: 20,
  },
});

export interface ReportSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string | React.ReactNode;
  type: 'text' | 'table' | 'chart' | 'stats' | 'list';
  data?: any;
}

interface ReportPDFProps {
  title: string;
  description?: string;
  reportType: string;
  sections: ReportSection[];
  metadata?: {
    author?: string;
    date?: string;
    version?: string;
  };
  logoUrl?: string;
  whitelabelConfig?: WhitelabelConfig;
}

/**
 * Report PDF Document
 * Template completo seguendo principi accademici con supporto white label
 * Best Practice: Academic white label maintains professional standards
 */
export function ReportPDF({
  title,
  description,
  reportType,
  sections,
  metadata,
  logoUrl = '/logos/tradelia-logo.svg',
  whitelabelConfig,
}: ReportPDFProps) {
  const currentDate = metadata?.date || new Date().toLocaleDateString('it-IT');
  const author = metadata?.author || 'Tradelia AI';

  // Create dynamic styles based on white label config
  const dynamicStyles = whitelabelConfig ? StyleSheet.create({
    page: {
      ...styles.page,
      backgroundColor: whitelabelConfig.background_color,
      fontFamily: whitelabelConfig.font_family,
      fontSize: whitelabelConfig.font_size_base,
    },
    header: {
      ...styles.header,
      borderBottomColor: whitelabelConfig.accent_color,
    },
    headerTitle: {
      ...styles.headerTitle,
      fontSize: whitelabelConfig.font_size_title,
      fontFamily: whitelabelConfig.heading_font_family,
      color: whitelabelConfig.text_color,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      fontSize: whitelabelConfig.font_size_heading,
      fontFamily: whitelabelConfig.heading_font_family,
      color: whitelabelConfig.text_color,
      borderBottomColor: whitelabelConfig.primary_color,
    },
    paragraph: {
      ...styles.paragraph,
      fontSize: whitelabelConfig.font_size_base,
      fontFamily: whitelabelConfig.font_family,
      color: whitelabelConfig.text_color,
    },
    footer: {
      ...styles.footer,
      color: whitelabelConfig.text_color,
    },
    statValue: {
      ...styles.statValue,
      color: whitelabelConfig.accent_color,
    },
    highlight: {
      ...styles.highlight,
      backgroundColor: `${whitelabelConfig.accent_color}20`, // 20% opacity
    },
    highlightText: {
      ...styles.highlightText,
      color: whitelabelConfig.accent_color,
    },
  }) : styles;

  // Get logo dimensions from white label config
  const logoWidth = whitelabelConfig?.logo_width || 120;
  const logoHeight = whitelabelConfig?.logo_height || 40;

  // Build footer text from white label config
  const buildFooterText = () => {
    if (!whitelabelConfig?.footer_enabled) {
      return author;
    }

    const footerParts: string[] = [];
    if (whitelabelConfig.footer_text) {
      footerParts.push(whitelabelConfig.footer_text);
    }
    if (whitelabelConfig.footer_contact_email) {
      footerParts.push(`Email: ${whitelabelConfig.footer_contact_email}`);
    }
    if (whitelabelConfig.footer_contact_phone) {
      footerParts.push(`Tel: ${whitelabelConfig.footer_contact_phone}`);
    }
    if (whitelabelConfig.footer_website) {
      footerParts.push(whitelabelConfig.footer_website);
    }
    if (whitelabelConfig.footer_address) {
      footerParts.push(whitelabelConfig.footer_address);
    }

    return footerParts.length > 0 ? footerParts.join(' • ') : author;
  };

  const footerText = buildFooterText();

  // Watermark style
  const watermarkStyle = whitelabelConfig?.watermark_enabled && whitelabelConfig?.watermark_text
    ? {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'rotate(-45deg) translate(-50%, -50%)',
        fontSize: 60,
        color: `${whitelabelConfig.text_color}${Math.round((whitelabelConfig.watermark_opacity || 0.1) * 255).toString(16).padStart(2, '0')}`,
        opacity: whitelabelConfig.watermark_opacity || 0.1,
        zIndex: 0,
      }
    : null;

  return (
    <Document
      title={title}
      author={author}
      subject={reportType}
      creator="Tradelia Platform"
      producer="Tradelia PDF Generator"
      keywords={`${reportType}, report, analisi, tradelia`}
    >
      {/* Cover Page */}
      <Page size="A4" style={dynamicStyles.page}>
        {/* Watermark */}
        {watermarkStyle && whitelabelConfig?.watermark_text && (
          <Text style={watermarkStyle}>{whitelabelConfig.watermark_text}</Text>
        )}
        
        <View style={dynamicStyles.header}>
          <View style={[styles.logoContainer, { width: logoWidth, height: logoHeight }]}>
            {/* Logo - White label or Tradelia default */}
            {logoUrl && logoUrl.startsWith('data:') ? (
              <Image
                src={logoUrl}
                style={{ width: logoWidth, height: logoHeight, objectFit: 'contain' }}
                cache={false}
              />
            ) : (
              <Image
                src={TRADELIA_LOGO_BASE64}
                style={{ width: logoWidth, height: logoHeight, objectFit: 'contain' }}
                cache={false}
              />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerSubtitle}>Report Analisi</Text>
            <Text style={styles.headerMeta}>{currentDate}</Text>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <Text style={[dynamicStyles.headerTitle, { fontSize: whitelabelConfig?.font_size_title ? whitelabelConfig.font_size_title + 8 : 32, marginBottom: 20 }]}>
            {title}
          </Text>
          {description && (
            <Text style={[dynamicStyles.paragraph, { fontSize: (whitelabelConfig?.font_size_base || 10) + 2, textAlign: 'center', maxWidth: 400 }]}>
              {description}
            </Text>
          )}
          <View style={{ marginTop: 40, padding: 20, backgroundColor: whitelabelConfig ? `${whitelabelConfig.accent_color}10` : '#f1f5f9', borderRadius: 8 }}>
            <Text style={[styles.headerSubtitle, { fontSize: (whitelabelConfig?.font_size_base || 10) + 4, textAlign: 'center', color: whitelabelConfig?.accent_color || '#64748b' }]}>
              {reportType}
            </Text>
          </View>
        </View>

        {/* Academic Disclaimer */}
        {whitelabelConfig?.show_academic_disclaimer && whitelabelConfig?.academic_disclaimer_text && (
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f8fafc', borderRadius: 4 }}>
            <Text style={[dynamicStyles.paragraph, { fontSize: 8, fontStyle: 'italic', textAlign: 'center' }]}>
              {whitelabelConfig.academic_disclaimer_text}
            </Text>
          </View>
        )}

        <View style={dynamicStyles.footer}>
          <Text>{footerText}</Text>
          <Text>Pagina 1</Text>
        </View>
      </Page>

      {/* Content Pages */}
      {sections.map((section, index) => (
        <Page key={section.id} size="A4" style={dynamicStyles.page} wrap={false}>
          {/* Watermark */}
          {watermarkStyle && whitelabelConfig?.watermark_text && (
            <Text style={watermarkStyle}>{whitelabelConfig.watermark_text}</Text>
          )}
          
          <View style={dynamicStyles.header}>
            <View style={[styles.logoContainer, { width: logoWidth, height: logoHeight }]}>
              {/* Logo - White label or Tradelia default */}
              {logoUrl && logoUrl.startsWith('data:') ? (
                <Image
                  src={logoUrl}
                  style={{ width: logoWidth, height: logoHeight, objectFit: 'contain' }}
                  cache={false}
                />
              ) : (
                <Image
                  src={TRADELIA_LOGO_BASE64}
                  style={{ width: logoWidth, height: logoHeight, objectFit: 'contain' }}
                  cache={false}
                />
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerSubtitle}>{title}</Text>
              <Text style={styles.headerMeta}>{currentDate}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>{section.title}</Text>
            {section.subtitle && (
              <Text style={[styles.sectionSubtitle, { color: whitelabelConfig?.text_color || '#1e293b' }]}>{section.subtitle}</Text>
            )}

            {/* Render content based on type */}
            {section.type === 'text' && (
              <Text style={dynamicStyles.paragraph}>
                {typeof section.content === 'string' ? section.content : ''}
              </Text>
            )}

            {section.type === 'list' && section.data && (
              <View style={styles.list}>
                {section.data.map((item: string, i: number) => (
                  <Text key={i} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            )}

            {section.type === 'table' && section.data && (
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {Object.keys(section.data[0] || {}).map((key) => (
                    <Text key={key} style={styles.tableCell}>
                      {key}
                    </Text>
                  ))}
                </View>
                {/* Table Rows */}
                {section.data.map((row: any, i: number) => (
                  <View key={i} style={styles.tableRow}>
                    {Object.values(row).map((value: any, j: number) => (
                      <Text key={j} style={styles.tableCell}>
                        {String(value)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {section.type === 'chart' && section.data && (
              <View style={styles.chartContainer}>
                {/* Chart convertito in immagine base64 */}
                {section.data.imageUrl && (
                  <Image
                    src={section.data.imageUrl}
                    style={styles.chartImage}
                    cache={false}
                  />
                )}
                <Text style={styles.chartCaption}>
                  {section.data.caption || section.title || 'Grafico'}
                </Text>
              </View>
            )}

            {section.type === 'stats' && section.data && (
              <View style={styles.statsContainer}>
                {section.data.map((stat: { label: string; value: string | number }, i: number) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={dynamicStyles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={dynamicStyles.footer}>
            <Text>{footerText}</Text>
            <Text>Pagina {index + 2}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}

