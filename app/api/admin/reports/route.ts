/**
 * Admin API Routes - Reports Management
 * GET: List all reports
 * POST: Create new report
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminEmail } from '@/lib/supabase/admin';

// GET /api/admin/reports - List all reports
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization - usa sessione Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let email: string | null = null;
    let isAdmin = false;

    if (user?.email) {
      email = user.email;
      isAdmin = await isAdminEmail(email);
    } else {
      // Fallback a authorization header se disponibile
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        email = token;
        isAdmin = await isAdminEmail(email);
      }
    }

    if (!isAdmin) {
      // Restituisci dati vuoti invece di 401/403
      return NextResponse.json({
        data: [],
        pagination: {
          total: 0,
          limit: 50,
          offset: 0,
          hasMore: false,
        },
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const reportType = searchParams.get('report_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('reports')
      .select(`
        *,
        report_modules (*),
        report_template_versions (
          id,
          version,
          template_id,
          report_templates (
            id,
            slug,
            label
          )
        ),
        created_by_user:admin_users!reports_created_by_fkey (
          user_id,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (reportType) {
      query = query.eq('report_type', reportType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports', details: error.message },
        { status: 500 }
      );
    }

    // Get total count
    let countQuery = supabaseAdmin.from('reports').select('*', { count: 'exact', head: true });
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    if (reportType) {
      countQuery = countQuery.eq('report_type', reportType);
    }
    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      data: data || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (totalCount || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/reports - Create new report
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const email = token; // Temporary - should decode JWT
    const isAdmin = await isAdminEmail(email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      report_type,
      template_version_id,
      slug,
      title,
      status = 'draft',
      notes,
      chart_path,
      metadata = {},
      modules = [],
    } = body;

    // Validation
    if (!report_type || !slug || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: report_type, slug, title' },
        { status: 400 }
      );
    }

    // Get admin user ID
    const adminUser = await supabaseAdmin
      .from('admin_users')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .single();

    // Create report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert({
        report_type,
        template_version_id,
        slug,
        title,
        status,
        notes,
        chart_path,
        created_by: adminUser?.data?.user_id || null,
        metadata,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      return NextResponse.json(
        { error: 'Failed to create report', details: reportError.message },
        { status: 500 }
      );
    }

    // Create report modules if provided
    if (modules && modules.length > 0) {
      const modulesToInsert = modules.map((module: any, index: number) => ({
        report_id: report.id,
        module_key: module.module_key,
        order_index: module.order_index ?? index,
        content: module.content || {},
        locked: module.locked || false,
      }));

      const { error: modulesError } = await supabaseAdmin
        .from('report_modules')
        .insert(modulesToInsert);

      if (modulesError) {
        console.error('Error creating report modules:', modulesError);
        // Report created but modules failed - return partial success
      }
    }

    // Create audit log entry
    await supabaseAdmin.from('report_audit_log').insert({
      report_id: report.id,
      action: 'created',
      performed_by: adminUser?.data?.user_id || null,
      payload: { report_type, slug, title },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
