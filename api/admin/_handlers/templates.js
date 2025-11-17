import { getServiceSupabase } from '../../_lib/supabase.js';
import { methodNotAllowed, sendJSON } from '../../_lib/http.js';

const supabase = getServiceSupabase();

const normalizeTemplate = (raw) => ({
  id: raw.id,
  slug: raw.slug,
  label: raw.label,
  description: raw.description,
  status: raw.status,
  defaultVersionId: raw.default_version_id,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  versions: (raw.report_template_versions || []).map((version) => ({
    id: version.id,
    version: version.version,
    changelog: version.changelog,
    createdAt: version.created_at,
    modules: (version.report_template_modules || []).map((module) => ({
      id: module.id,
      module_key: module.module_key,
      order_index: module.order_index,
      required: module.required,
      default_content: module.default_content || {}
    }))
  }))
});

export const handleTemplatesRequest = async (req, res) => {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  const { data, error } = await supabase
    .from('report_templates')
    .select(
      `
        id,
        slug,
        label,
        description,
        status,
        default_version_id,
        created_at,
        updated_at,
        report_template_versions (
          id,
          version,
          changelog,
          created_at,
          report_template_modules (
            id,
            module_key,
            order_index,
            required,
            default_content
          )
        )
      `
    )
    .order('label', { ascending: true });

  if (error) {
    throw error;
  }

  const templates = (data || []).map(normalizeTemplate);
  return sendJSON(res, 200, { ok: true, templates });
};

