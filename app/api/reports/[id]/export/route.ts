import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReportPDF, generateReportExcel, generateReportCSV } from '@/lib/pdf/generators/ReportPDFGenerator';

/**
 * GET /api/reports/[id]/export
 * Esporta un report in vari formati (PDF, Excel, CSV)
 * Riferimento: REST API Best Practices, Error Handling
 * PDF Generation: Few (2006) - Information Dashboard Design
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';
    const quality = searchParams.get('quality') || 'standard';
    const includeCharts = searchParams.get('charts') === 'true';

    // Verifica che il report esista
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', params.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Verifica che l'utente sia Pro (per download PDF)
    if (format === 'pdf') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || (profile.role !== 'pro' && profile.role !== 'admin')) {
        return NextResponse.json(
          { error: 'Pro account required for PDF export' },
          { status: 403 }
        );
      }
    }

    // Genera file in base al formato
    let content: string | Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'pdf': {
        // Genera PDF con template accademico
        const pdfBuffer = await generateReportPDF(
          {
            id: report.id,
            title: report.title,
            description: report.description,
            report_type: report.report_type,
            content: report.content || report.content_json,
            metadata: {
              date: new Date(report.created_at).toLocaleDateString('it-IT'),
              author: 'Tradelia AI',
            },
          },
          {
            quality: quality as 'standard' | 'high',
            includeCharts,
            format: 'pdf',
          }
        );

        content = pdfBuffer;
        contentType = 'application/pdf';
        filename = `${report.slug || report.id}-${quality}.pdf`;
        break;
      }
      case 'excel': {
        // Genera Excel
        const excelBuffer = await generateReportExcel(
          {
            id: report.id,
            title: report.title,
            description: report.description,
            report_type: report.report_type,
            content: report.content || report.content_json,
          },
          {
            quality: quality as 'standard' | 'high',
            includeCharts,
            format: 'excel',
          }
        );

        content = excelBuffer;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${report.slug || report.id}.xlsx`;
        break;
      }
      case 'csv': {
        // Genera CSV
        const csvContent = await generateReportCSV(
          {
            id: report.id,
            title: report.title,
            description: report.description,
            report_type: report.report_type,
            content: report.content || report.content_json,
          },
          {
            quality: quality as 'standard' | 'high',
            includeCharts,
            format: 'csv',
          }
        );

        content = csvContent;
        contentType = 'text/csv; charset=utf-8';
        filename = `${report.slug || report.id}.csv`;
        break;
      }
      default:
        return NextResponse.json(
          { error: 'Invalid format' },
          { status: 400 }
        );
    }

    // Log download per analytics
    await supabase.from('report_downloads').insert({
      user_id: session.user.id,
      report_id: params.id,
      format,
      quality: format === 'pdf' ? quality : null,
      include_charts: format === 'pdf' ? includeCharts : null,
    }).catch((err) => {
      // Non bloccare se il log fallisce
      console.error('Error logging download:', err);
    });

    // Return file with proper headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in report export API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

