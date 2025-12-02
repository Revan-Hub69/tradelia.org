/**
 * White Label Loader
 * Carica configurazioni white label per partner professionali
 * Best Practice: Academic white label maintains professional standards
 */

import { createClient } from "@/lib/supabase/server";

export interface WhitelabelConfig {
  id: string;
  partner_id: string;
  logo_url: string | null;
  logo_width: number;
  logo_height: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  font_family: string;
  heading_font_family: string;
  font_size_base: number;
  font_size_heading: number;
  font_size_title: number;
  footer_enabled: boolean;
  footer_text: string | null;
  footer_contact_email: string | null;
  footer_contact_phone: string | null;
  footer_website: string | null;
  footer_address: string | null;
  watermark_enabled: boolean;
  watermark_text: string | null;
  watermark_opacity: number;
  show_academic_disclaimer: boolean;
  academic_disclaimer_text: string | null;
  is_active: boolean;
}

/**
 * Default Tradelia white label config (fallback)
 */
export const DEFAULT_WHITELABEL_CONFIG: Omit<WhitelabelConfig, "id" | "partner_id" | "is_active"> =
  {
    logo_url: null, // Will use Tradelia logo
    logo_width: 120,
    logo_height: 40,
    primary_color: "#1e40af",
    secondary_color: "#3b82f6",
    accent_color: "#2563eb",
    text_color: "#0f172a",
    background_color: "#FFFFFF",
    font_family: "Helvetica",
    heading_font_family: "Helvetica-Bold",
    font_size_base: 10,
    font_size_heading: 16,
    font_size_title: 24,
    footer_enabled: true,
    footer_text: null,
    footer_contact_email: null,
    footer_contact_phone: null,
    footer_website: null,
    footer_address: null,
    watermark_enabled: false,
    watermark_text: null,
    watermark_opacity: 0.1,
    show_academic_disclaimer: true,
    academic_disclaimer_text:
      "Questo documento è a scopo informativo e non costituisce consulenza finanziaria. Le informazioni sono basate su fonti accademiche verificate.",
  };

/**
 * Carica configurazione white label per un partner
 * Best Practice: Fallback a configurazione Tradelia standard se non trovata
 */
export async function loadWhitelabelConfig(partnerId?: string): Promise<WhitelabelConfig | null> {
  if (!partnerId) {
    return null; // Use default Tradelia config
  }

  try {
    const supabase = await createClient();

    // Call the database function
    const { data, error } = await supabase.rpc("get_partner_whitelabel_config", {
      p_partner_id: partnerId,
    });

    if (error) {
      console.error("Error loading whitelabel config:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null; // No config found, use default
    }

    const config = data[0];

    // Validate and return config
    return {
      id: config.id,
      partner_id: config.partner_id,
      logo_url: config.logo_url,
      logo_width: config.logo_width || DEFAULT_WHITELABEL_CONFIG.logo_width,
      logo_height: config.logo_height || DEFAULT_WHITELABEL_CONFIG.logo_height,
      primary_color: config.primary_color || DEFAULT_WHITELABEL_CONFIG.primary_color,
      secondary_color: config.secondary_color || DEFAULT_WHITELABEL_CONFIG.secondary_color,
      accent_color: config.accent_color || DEFAULT_WHITELABEL_CONFIG.accent_color,
      text_color: config.text_color || DEFAULT_WHITELABEL_CONFIG.text_color,
      background_color: config.background_color || DEFAULT_WHITELABEL_CONFIG.background_color,
      font_family: config.font_family || DEFAULT_WHITELABEL_CONFIG.font_family,
      heading_font_family:
        config.heading_font_family || DEFAULT_WHITELABEL_CONFIG.heading_font_family,
      font_size_base: config.font_size_base || DEFAULT_WHITELABEL_CONFIG.font_size_base,
      font_size_heading: config.font_size_heading || DEFAULT_WHITELABEL_CONFIG.font_size_heading,
      font_size_title: config.font_size_title || DEFAULT_WHITELABEL_CONFIG.font_size_title,
      footer_enabled: config.footer_enabled ?? DEFAULT_WHITELABEL_CONFIG.footer_enabled,
      footer_text: config.footer_text,
      footer_contact_email: config.footer_contact_email,
      footer_contact_phone: config.footer_contact_phone,
      footer_website: config.footer_website,
      footer_address: config.footer_address,
      watermark_enabled: config.watermark_enabled ?? DEFAULT_WHITELABEL_CONFIG.watermark_enabled,
      watermark_text: config.watermark_text,
      watermark_opacity: config.watermark_opacity || DEFAULT_WHITELABEL_CONFIG.watermark_opacity,
      show_academic_disclaimer:
        config.show_academic_disclaimer ?? DEFAULT_WHITELABEL_CONFIG.show_academic_disclaimer,
      academic_disclaimer_text:
        config.academic_disclaimer_text || DEFAULT_WHITELABEL_CONFIG.academic_disclaimer_text,
      is_active: config.is_active ?? true,
    };
  } catch (error) {
    console.error("Error loading whitelabel config:", error);
    return null;
  }
}

/**
 * Carica configurazione white label per l'utente corrente
 * Best Practice: Auto-detect partner ID from current user
 */
export async function loadCurrentUserWhitelabelConfig(): Promise<WhitelabelConfig | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return await loadWhitelabelConfig(user.id);
  } catch (error) {
    console.error("Error loading current user whitelabel config:", error);
    return null;
  }
}

/**
 * Merge white label config with defaults
 * Best Practice: Always provide fallback values
 */
export function mergeWhitelabelConfig(config: Partial<WhitelabelConfig> | null): WhitelabelConfig {
  if (!config) {
    return {
      id: "",
      partner_id: "",
      is_active: true,
      ...DEFAULT_WHITELABEL_CONFIG,
    };
  }

  return {
    id: config.id || "",
    partner_id: config.partner_id || "",
    is_active: config.is_active ?? true,
    logo_url: config.logo_url ?? DEFAULT_WHITELABEL_CONFIG.logo_url,
    logo_width: config.logo_width ?? DEFAULT_WHITELABEL_CONFIG.logo_width,
    logo_height: config.logo_height ?? DEFAULT_WHITELABEL_CONFIG.logo_height,
    primary_color: config.primary_color || DEFAULT_WHITELABEL_CONFIG.primary_color,
    secondary_color: config.secondary_color || DEFAULT_WHITELABEL_CONFIG.secondary_color,
    accent_color: config.accent_color || DEFAULT_WHITELABEL_CONFIG.accent_color,
    text_color: config.text_color || DEFAULT_WHITELABEL_CONFIG.text_color,
    background_color: config.background_color || DEFAULT_WHITELABEL_CONFIG.background_color,
    font_family: config.font_family || DEFAULT_WHITELABEL_CONFIG.font_family,
    heading_font_family:
      config.heading_font_family || DEFAULT_WHITELABEL_CONFIG.heading_font_family,
    font_size_base: config.font_size_base ?? DEFAULT_WHITELABEL_CONFIG.font_size_base,
    font_size_heading: config.font_size_heading ?? DEFAULT_WHITELABEL_CONFIG.font_size_heading,
    font_size_title: config.font_size_title ?? DEFAULT_WHITELABEL_CONFIG.font_size_title,
    footer_enabled: config.footer_enabled ?? DEFAULT_WHITELABEL_CONFIG.footer_enabled,
    footer_text: config.footer_text ?? DEFAULT_WHITELABEL_CONFIG.footer_text,
    footer_contact_email:
      config.footer_contact_email ?? DEFAULT_WHITELABEL_CONFIG.footer_contact_email,
    footer_contact_phone:
      config.footer_contact_phone ?? DEFAULT_WHITELABEL_CONFIG.footer_contact_phone,
    footer_website: config.footer_website ?? DEFAULT_WHITELABEL_CONFIG.footer_website,
    footer_address: config.footer_address ?? DEFAULT_WHITELABEL_CONFIG.footer_address,
    watermark_enabled: config.watermark_enabled ?? DEFAULT_WHITELABEL_CONFIG.watermark_enabled,
    watermark_text: config.watermark_text ?? DEFAULT_WHITELABEL_CONFIG.watermark_text,
    watermark_opacity: config.watermark_opacity ?? DEFAULT_WHITELABEL_CONFIG.watermark_opacity,
    show_academic_disclaimer:
      config.show_academic_disclaimer ?? DEFAULT_WHITELABEL_CONFIG.show_academic_disclaimer,
    academic_disclaimer_text:
      config.academic_disclaimer_text || DEFAULT_WHITELABEL_CONFIG.academic_disclaimer_text,
  };
}
