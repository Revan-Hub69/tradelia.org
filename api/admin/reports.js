import { getServiceSupabase } from '../_lib/supabase.js';
import { requireAdmin } from '../_lib/adminAuth.js';
import { handleRouteError, methodNotAllowed, sendJSON, HttpError } from '../_lib/http.js';

const supabase = getServiceSupabase();

const sanitizeReportPayload = (payload = {}) => ({
  slug: payload.slug?.trim(),
  title: payload.title?.trim(),
  status: payload.status || 'draft',
  report_type: payload.report_type || payload.reportType || null,
  template_version_id: payload.template_version_id || payload.templateVersionId || null,
  chart_path: payload.chart_path || payload.chartPath || null,
  notes: payload.notes || null,
  metadata: payload.metadata || {}
});

const replaceReportModules = async (reportId, modules = []) => {
  await supabase.from('report_modules').delete().eq('report_id', reportId);
  if (!modules.length) return [];

  const normalized = modules.map((module, index) => ({
    report_id: reportId,
    module_key: module.module_key,
    order_index:
      typeof module.order_index === 'number'
        ? module.order_index
        : module.order_index === null
          ? null
          : index,
    content: module.content || {}
  }));

  const { data, error } = await supabase.from('report_modules').insert(normalized).select();
  if (error) {
    throw new HttpError(500, 'Errore nel salvataggio dei moduli', error.message);
  }
  return data;
};

const logAudit = async (reportId, action, performedBy, payload = {}) => {
  await supabase.from('report_audit_log').insert({
    report_id: reportId,
    action,
    performed_by: performedBy,
    payload
  });
};

const handleListReports = async (req, res) => {
  const search = (req.query?.search || '').trim();
  const statusFilter = (req.query?.status || '').trim();

  let query = supabase
    .from('reports')
    .select(
      'id, slug, title, status, report_type, template_version_id, chart_path, published_at, updated_at, metadata, report_modules(count)'
    )
    .order('updated_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  if (search) {
    query = query.or(
      `slug.ilike.%${search}%,title.ilike.%${search}%,report_type.ilike.%${search}%`
    );
  }

  const { data, error } = await query.limit(200);
  if (error) {
    throw new HttpError(500, 'Errore durante il caricamento dei report', error.message);
  }

  const normalized =
    data?.map((row) => ({
      ...row,
      modules_count: row.report_modules?.[0]?.count ?? 0
    })) || [];

  return sendJSON(res, 200, {
    ok: true,
    reports: normalized
  });
};

const handleGetReport = async (req, res) => {
  const id = req.query?.id;
  if (!id) {
    throw new HttpError(400, 'ID report mancante');
  }

  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Errore durante il recupero del report', error.message);
  }

  if (!report) {
    throw new HttpError(404, 'Report non trovato');
  }

  const [{ data: modules }, { data: assets }, { data: audit }] = await Promise.all([
    supabase
      .from('report_modules')
      .select('id, module_key, order_index, content, locked')
      .eq('report_id', id)
      .order('order_index', { ascending: true, nullsFirst: true }),
    supabase
      .from('report_assets')
      .select('id, asset_type, storage_path, metadata, created_at')
      .eq('report_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('report_audit_log')
      .select('id, action, payload, created_at, performed_by')
      .eq('report_id', id)
      .order('created_at', { ascending: false })
      .limit(20)
  ]);

  return sendJSON(res, 200, {
    ok: true,
    report,
    modules: modules || [],
    assets: assets || [],
    audit: audit || []
  });
};

const handleCreateReport = async (req, res, ctx) => {
  const payload = sanitizeReportPayload(req.body?.report || req.body);
  const modules = req.body?.modules || [];

  if (!payload.slug || !payload.title) {
    throw new HttpError(400, 'Slug e titolo sono obbligatori');
  }

  if (!payload.template_version_id) {
    throw new HttpError(400, 'Template version ID mancante');
  }

  const now = new Date().toISOString();
  if (payload.status === 'active' && !payload.published_at) {
    payload.published_at = now;
  }

  payload.created_by = ctx.userId;

  const { data: inserted, error } = await supabase
    .from('reports')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new HttpError(500, 'Errore durante la creazione del report', error.message);
  }

  const savedModules = await replaceReportModules(inserted.id, modules);
  await logAudit(inserted.id, 'create', ctx.userId, { report: inserted });

  return sendJSON(res, 201, {
    ok: true,
    report: inserted,
    modules: savedModules
  });
};

const handleUpdateReport = async (req, res, ctx) => {
  const payload = sanitizeReportPayload(req.body?.report || req.body);
  const modules = req.body?.modules || [];
  const reportId = req.body?.report?.id || req.body?.id || payload.id;

  if (!reportId) {
    throw new HttpError(400, 'ID report mancante');
  }

  if (!payload.slug || !payload.title) {
    throw new HttpError(400, 'Slug e titolo sono obbligatori');
  }

  if (!payload.template_version_id) {
    throw new HttpError(400, 'Template version ID mancante');
  }

  if (payload.status === 'active' && !payload.published_at) {
    payload.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from('reports')
    .update(payload)
    .eq('id', reportId)
    .select('*')
    .single();

  if (error) {
    throw new HttpError(500, 'Errore durante l\'aggiornamento del report', error.message);
  }

  const savedModules = await replaceReportModules(reportId, modules);
  await logAudit(reportId, 'update', ctx.userId, { report: updated });

  return sendJSON(res, 200, {
    ok: true,
    report: updated,
    modules: savedModules
  });
};

const handleArchiveReport = async (req, res, ctx) => {
  const reportId = req.body?.id;
  if (!reportId) {
    throw new HttpError(400, 'ID report mancante');
  }

  const { data: updated, error } = await supabase
    .from('reports')
    .update({ status: 'archived' })
    .eq('id', reportId)
    .select('*')
    .single();

  if (error) {
    throw new HttpError(500, 'Errore durante l\'archiviazione del report', error.message);
  }

  await logAudit(reportId, 'archive', ctx.userId, {});

  return sendJSON(res, 200, {
    ok: true,
    report: updated
  });
};

export default async function handler(req, res) {
  try {
    const ctx = await requireAdmin(req);

    if (req.method === 'GET') {
      if (req.query?.id) {
        return await handleGetReport(req, res);
      }
      return await handleListReports(req, res);
    }

    if (req.method === 'POST') {
      return await handleCreateReport(req, res, ctx);
    }

    if (req.method === 'PUT') {
      return await handleUpdateReport(req, res, ctx);
    }

    if (req.method === 'DELETE') {
      return await handleArchiveReport(req, res, ctx);
    }

    return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

