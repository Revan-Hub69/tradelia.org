/**
 * White Label Configuration API
 * GET /api/whitelabel/config - Get current user's white label config
 * POST /api/whitelabel/config - Create or update white label config
 * DELETE /api/whitelabel/config - Delete white label config
 *
 * Best Practice: Academic white label for professional partners
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET - Get current user's white label configuration
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get white label config for current user
    const { data, error } = await supabase.rpc("get_partner_whitelabel_config", {
      p_partner_id: user.id,
    });

    if (error) {
      console.error("Error fetching whitelabel config:", error);
      return NextResponse.json({ error: "Failed to fetch whitelabel config" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({ config: data[0] });
  } catch (error) {
    console.error("Error in GET /api/whitelabel/config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST - Create or update white label configuration
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const {
      logo_url,
      logo_width,
      logo_height,
      primary_color,
      secondary_color,
      accent_color,
      text_color,
      background_color,
      font_family,
      heading_font_family,
      font_size_base,
      font_size_heading,
      font_size_title,
      footer_enabled,
      footer_text,
      footer_contact_email,
      footer_contact_phone,
      footer_website,
      footer_address,
      watermark_enabled,
      watermark_text,
      watermark_opacity,
      show_academic_disclaimer,
      academic_disclaimer_text,
      is_active,
    } = body;

    // Validate color format (hex)
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (primary_color && !colorRegex.test(primary_color)) {
      return NextResponse.json(
        { error: "Invalid primary_color format. Must be hex (#RRGGBB)" },
        { status: 400 }
      );
    }
    if (secondary_color && !colorRegex.test(secondary_color)) {
      return NextResponse.json(
        { error: "Invalid secondary_color format. Must be hex (#RRGGBB)" },
        { status: 400 }
      );
    }
    if (accent_color && !colorRegex.test(accent_color)) {
      return NextResponse.json(
        { error: "Invalid accent_color format. Must be hex (#RRGGBB)" },
        { status: 400 }
      );
    }
    if (text_color && !colorRegex.test(text_color)) {
      return NextResponse.json(
        { error: "Invalid text_color format. Must be hex (#RRGGBB)" },
        { status: 400 }
      );
    }
    if (background_color && !colorRegex.test(background_color)) {
      return NextResponse.json(
        { error: "Invalid background_color format. Must be hex (#RRGGBB)" },
        { status: 400 }
      );
    }

    // Validate watermark opacity
    if (watermark_opacity !== undefined && (watermark_opacity < 0 || watermark_opacity > 1)) {
      return NextResponse.json(
        { error: "watermark_opacity must be between 0 and 1" },
        { status: 400 }
      );
    }

    // Validate logo dimensions
    if (logo_width !== undefined && logo_width <= 0) {
      return NextResponse.json({ error: "logo_width must be greater than 0" }, { status: 400 });
    }
    if (logo_height !== undefined && logo_height <= 0) {
      return NextResponse.json({ error: "logo_height must be greater than 0" }, { status: 400 });
    }

    // Check if config exists
    const { data: existingConfig } = await supabase
      .from("partner_whitelabel_configs")
      .select("id")
      .eq("partner_id", user.id)
      .single();

    let result;
    if (existingConfig) {
      // Update existing config
      const { data, error } = await supabase
        .from("partner_whitelabel_configs")
        .update({
          logo_url,
          logo_width,
          logo_height,
          primary_color,
          secondary_color,
          accent_color,
          text_color,
          background_color,
          font_family,
          heading_font_family,
          font_size_base,
          font_size_heading,
          font_size_title,
          footer_enabled,
          footer_text,
          footer_contact_email,
          footer_contact_phone,
          footer_website,
          footer_address,
          watermark_enabled,
          watermark_text,
          watermark_opacity,
          show_academic_disclaimer,
          academic_disclaimer_text,
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("partner_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating whitelabel config:", error);
        return NextResponse.json({ error: "Failed to update whitelabel config" }, { status: 500 });
      }

      result = data;
    } else {
      // Insert new config
      const { data, error } = await supabase
        .from("partner_whitelabel_configs")
        .insert({
          partner_id: user.id,
          logo_url,
          logo_width,
          logo_height,
          primary_color,
          secondary_color,
          accent_color,
          text_color,
          background_color,
          font_family,
          heading_font_family,
          font_size_base,
          font_size_heading,
          font_size_title,
          footer_enabled,
          footer_text,
          footer_contact_email,
          footer_contact_phone,
          footer_website,
          footer_address,
          watermark_enabled,
          watermark_text,
          watermark_opacity,
          show_academic_disclaimer,
          academic_disclaimer_text,
          is_active,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating whitelabel config:", error);
        return NextResponse.json({ error: "Failed to create whitelabel config" }, { status: 500 });
      }

      result = data;
    }

    return NextResponse.json({ config: result });
  } catch (error) {
    console.error("Error in POST /api/whitelabel/config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE - Delete white label configuration
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("partner_whitelabel_configs")
      .delete()
      .eq("partner_id", user.id);

    if (error) {
      console.error("Error deleting whitelabel config:", error);
      return NextResponse.json({ error: "Failed to delete whitelabel config" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/whitelabel/config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
