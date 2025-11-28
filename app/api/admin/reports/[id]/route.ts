/**
 * Admin API Routes - Single Report Management
 * GET: Get report by ID
 * PATCH: Update report
 * DELETE: Delete report
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminEmail } from '@/lib/supabase/admin';

// GET /api/admin/reports/[id] - Get report by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const email = token;
    const isAdmin = await isAdminEmail(email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
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
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to fetch report', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/admin/reports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/reports/[id] - Update report
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const email = token;
    const isAdmin = await isAdminEmail(email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      status,
      notes,
      chart_path,
      published_at,
      metadata,
      modules,
    } = body;

    // Update report
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (chart_path !== undefined) updateData.chart_path = chart_path;
    if (published_at !== undefined) updateData.published_at = published_at;
    if (metadata !== undefined) updateData.metadata = metadata;

    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (reportError) {
      return NextResponse.json(
        { error: 'Failed to update report', details: reportError.message },
        { status: 500 }
      );
    }

    // Update modules if provided
    if (modules && Array.isArray(modules)) {
      // Delete existing modules
      await supabaseAdmin.from('report_modules').delete().eq('report_id', params.id);

      // Insert new modules
      if (modules.length > 0) {
        const modulesToInsert = modules.map((module: any, index: number) => ({
          report_id: params.id,
          module_key: module.module_key,
          order_index: module.order_index ?? index,
          content: module.content || {},
          locked: module.locked || false,
        }));

        await supabaseAdmin.from('report_modules').insert(modulesToInsert);
      }
    }

    // Create audit log
    const adminUser = await supabaseAdmin
      .from('admin_users')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .single();

    await supabaseAdmin.from('report_audit_log').insert({
      report_id: params.id,
      action: 'updated',
      performed_by: adminUser?.data?.user_id || null,
      payload: updateData,
    });

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error('Error in PATCH /api/admin/reports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/reports/[id] - Delete report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const email = token;
    const isAdmin = await isAdminEmail(email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete report (cascade will delete modules and audit logs)
    const { error } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete report', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/reports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
