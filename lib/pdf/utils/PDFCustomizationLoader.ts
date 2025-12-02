/**
 * PDF Customization Loader
 * Carica configurazioni PDF personalizzate per utenti Desk
 * Best Practice: Professional PDF generation with logo and header customization
 */

import { createClient } from "@/lib/supabase/server";

export interface PDFCustomization {
  id: string;
  user_id: string;
  template: "default" | "minimal" | "detailed";
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
  header_text: string;
  footer_text: string;
  footer_enabled: boolean;
  footer_contact_email: string | null;
  footer_contact_phone: string | null;
  footer_website: string | null;
  footer_address: string | null;
  watermark_enabled: boolean;
  watermark_text: string | null;
  show_academic_disclaimer: boolean;
  academic_disclaimer_text: string | null;
}

/**
 * Default PDF customization (Tradelia standard)
 */
export const DEFAULT_PDF_CUSTOMIZATION: Omit<PDFCustomization, "id" | "user_id"> = {
  template: "default",
  logo_url: null, // Will use Tradelia logo
  logo_width: 120,
  logo_height: 40,
  primary_color: "#2563eb",
  secondary_color: "#3b82f6",
  accent_color: "#1e40af",
  text_color: "#0f172a",
  background_color: "#FFFFFF",
  font_family: "Helvetica",
  heading_font_family: "Helvetica-Bold",
  font_size_base: 10,
  font_size_heading: 16,
  font_size_title: 24,
  header_text: "Report Analisi Finanziaria",
  footer_text: "Confidential - Tradelia AI",
  footer_enabled: true,
  footer_contact_email: null,
  footer_contact_phone: null,
  footer_website: null,
  footer_address: null,
  watermark_enabled: false,
  watermark_text: null,
  show_academic_disclaimer: true,
  academic_disclaimer_text:
    "Questo documento è a scopo informativo e non costituisce consulenza finanziaria. Le informazioni sono basate su fonti accademiche verificate.",
};

/**
 * Carica configurazione PDF personalizzata per un utente
 * Best Practice: Fallback a configurazione Tradelia standard se non trovata
 */
export async function loadPDFCustomization(userId?: string): Promise<PDFCustomization | null> {
  if (!userId) {
    return null; // Use default Tradelia config
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pdf_customizations")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - user has no customization
        return null;
      }
      console.error("Error loading PDF customization:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Return with defaults for missing fields
    return {
      id: data.id,
      user_id: data.user_id,
      template: data.template || DEFAULT_PDF_CUSTOMIZATION.template,
      logo_url: data.logo_url,
      logo_width: data.logo_width || DEFAULT_PDF_CUSTOMIZATION.logo_width,
      logo_height: data.logo_height || DEFAULT_PDF_CUSTOMIZATION.logo_height,
      primary_color: data.primary_color || DEFAULT_PDF_CUSTOMIZATION.primary_color,
      secondary_color: data.secondary_color || DEFAULT_PDF_CUSTOMIZATION.secondary_color,
      accent_color: data.accent_color || DEFAULT_PDF_CUSTOMIZATION.accent_color,
      text_color: data.text_color || DEFAULT_PDF_CUSTOMIZATION.text_color,
      background_color: data.background_color || DEFAULT_PDF_CUSTOMIZATION.background_color,
      font_family: data.font_family || DEFAULT_PDF_CUSTOMIZATION.font_family,
      heading_font_family:
        data.heading_font_family || DEFAULT_PDF_CUSTOMIZATION.heading_font_family,
      font_size_base: data.font_size_base || DEFAULT_PDF_CUSTOMIZATION.font_size_base,
      font_size_heading: data.font_size_heading || DEFAULT_PDF_CUSTOMIZATION.font_size_heading,
      font_size_title: data.font_size_title || DEFAULT_PDF_CUSTOMIZATION.font_size_title,
      header_text: data.header_text || DEFAULT_PDF_CUSTOMIZATION.header_text,
      footer_text: data.footer_text || DEFAULT_PDF_CUSTOMIZATION.footer_text,
      footer_enabled: data.footer_enabled ?? DEFAULT_PDF_CUSTOMIZATION.footer_enabled,
      footer_contact_email: data.footer_contact_email,
      footer_contact_phone: data.footer_contact_phone,
      footer_website: data.footer_website,
      footer_address: data.footer_address,
      watermark_enabled: data.watermark_enabled ?? DEFAULT_PDF_CUSTOMIZATION.watermark_enabled,
      watermark_text: data.watermark_text,
      show_academic_disclaimer:
        data.show_academic_disclaimer ?? DEFAULT_PDF_CUSTOMIZATION.show_academic_disclaimer,
      academic_disclaimer_text:
        data.academic_disclaimer_text || DEFAULT_PDF_CUSTOMIZATION.academic_disclaimer_text,
    };
  } catch (error) {
    console.error("Error loading PDF customization:", error);
    return null;
  }
}

/**
 * Carica configurazione PDF per l'utente corrente
 * Best Practice: Auto-detect user ID from current session
 */
export async function loadCurrentUserPDFCustomization(): Promise<PDFCustomization | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return await loadPDFCustomization(user.id);
  } catch (error) {
    console.error("Error loading current user PDF customization:", error);
    return null;
  }
}

/**
 * Merge PDF customization with defaults
 * Best Practice: Always provide fallback values
 */
export function mergePDFCustomization(config: Partial<PDFCustomization> | null): PDFCustomization {
  if (!config) {
    return {
      id: "",
      user_id: "",
      ...DEFAULT_PDF_CUSTOMIZATION,
    };
  }

  return {
    id: config.id || "",
    user_id: config.user_id || "",
    template: config.template || DEFAULT_PDF_CUSTOMIZATION.template,
    logo_url: config.logo_url ?? DEFAULT_PDF_CUSTOMIZATION.logo_url,
    logo_width: config.logo_width ?? DEFAULT_PDF_CUSTOMIZATION.logo_width,
    logo_height: config.logo_height ?? DEFAULT_PDF_CUSTOMIZATION.logo_height,
    primary_color: config.primary_color || DEFAULT_PDF_CUSTOMIZATION.primary_color,
    secondary_color: config.secondary_color || DEFAULT_PDF_CUSTOMIZATION.secondary_color,
    accent_color: config.accent_color || DEFAULT_PDF_CUSTOMIZATION.accent_color,
    text_color: config.text_color || DEFAULT_PDF_CUSTOMIZATION.text_color,
    background_color: config.background_color || DEFAULT_PDF_CUSTOMIZATION.background_color,
    font_family: config.font_family || DEFAULT_PDF_CUSTOMIZATION.font_family,
    heading_font_family:
      config.heading_font_family || DEFAULT_PDF_CUSTOMIZATION.heading_font_family,
    font_size_base: config.font_size_base ?? DEFAULT_PDF_CUSTOMIZATION.font_size_base,
    font_size_heading: config.font_size_heading ?? DEFAULT_PDF_CUSTOMIZATION.font_size_heading,
    font_size_title: config.font_size_title ?? DEFAULT_PDF_CUSTOMIZATION.font_size_title,
    header_text: config.header_text || DEFAULT_PDF_CUSTOMIZATION.header_text,
    footer_text: config.footer_text || DEFAULT_PDF_CUSTOMIZATION.footer_text,
    footer_enabled: config.footer_enabled ?? DEFAULT_PDF_CUSTOMIZATION.footer_enabled,
    footer_contact_email:
      config.footer_contact_email ?? DEFAULT_PDF_CUSTOMIZATION.footer_contact_email,
    footer_contact_phone:
      config.footer_contact_phone ?? DEFAULT_PDF_CUSTOMIZATION.footer_contact_phone,
    footer_website: config.footer_website ?? DEFAULT_PDF_CUSTOMIZATION.footer_website,
    footer_address: config.footer_address ?? DEFAULT_PDF_CUSTOMIZATION.footer_address,
    watermark_enabled: config.watermark_enabled ?? DEFAULT_PDF_CUSTOMIZATION.watermark_enabled,
    watermark_text: config.watermark_text ?? DEFAULT_PDF_CUSTOMIZATION.watermark_text,
    show_academic_disclaimer:
      config.show_academic_disclaimer ?? DEFAULT_PDF_CUSTOMIZATION.show_academic_disclaimer,
    academic_disclaimer_text:
      config.academic_disclaimer_text || DEFAULT_PDF_CUSTOMIZATION.academic_disclaimer_text,
  };
}
