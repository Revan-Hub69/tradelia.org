/**
 * PDF Customization API (Desk Plan)
 * GET /api/pdf/customization - Get current user's PDF customization
 * POST /api/pdf/customization - Create or update PDF customization
 * DELETE /api/pdf/customization - Delete PDF customization
 *
 * Best Practice: Professional PDF generation with logo and header customization
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET - Get current user's PDF customization
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

    // Get PDF customization for current user
    const { data, error } = await supabase
      .from("pdf_customizations")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - user has no customization
        return NextResponse.json({ customization: null });
      }
      console.error("Error fetching PDF customization:", error);
      return NextResponse.json({ error: "Failed to fetch PDF customization" }, { status: 500 });
    }

    return NextResponse.json({ customization: data });
  } catch (error) {
    console.error("Error in GET /api/pdf/customization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST - Create or update PDF customization
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

    // Validate color format (hex)
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    const colors = [
      "primary_color",
      "secondary_color",
      "accent_color",
      "text_color",
      "background_color",
    ];

    for (const colorField of colors) {
      if (body[colorField] && !colorRegex.test(body[colorField])) {
        return NextResponse.json(
          { error: `Invalid ${colorField} format. Must be hex (#RRGGBB)` },
          { status: 400 }
        );
      }
    }

    // Validate logo dimensions
    if (body.logo_width !== undefined && body.logo_width <= 0) {
      return NextResponse.json({ error: "logo_width must be greater than 0" }, { status: 400 });
    }
    if (body.logo_height !== undefined && body.logo_height <= 0) {
      return NextResponse.json({ error: "logo_height must be greater than 0" }, { status: 400 });
    }

    // Check if customization exists
    const { data: existingCustomization } = await supabase
      .from("pdf_customizations")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let result;
    if (existingCustomization) {
      // Update existing customization
      const { data, error } = await supabase
        .from("pdf_customizations")
        .update({
          template: body.template,
          logo_url: body.logo_url,
          logo_width: body.logo_width,
          logo_height: body.logo_height,
          primary_color: body.primary_color,
          secondary_color: body.secondary_color,
          accent_color: body.accent_color,
          text_color: body.text_color,
          background_color: body.background_color,
          font_family: body.font_family,
          heading_font_family: body.heading_font_family,
          font_size_base: body.font_size_base,
          font_size_heading: body.font_size_heading,
          font_size_title: body.font_size_title,
          header_text: body.header_text,
          footer_text: body.footer_text,
          footer_enabled: body.footer_enabled,
          footer_contact_email: body.footer_contact_email,
          footer_contact_phone: body.footer_contact_phone,
          footer_website: body.footer_website,
          footer_address: body.footer_address,
          watermark_enabled: body.watermark_enabled,
          watermark_text: body.watermark_text,
          show_academic_disclaimer: body.show_academic_disclaimer,
          academic_disclaimer_text: body.academic_disclaimer_text,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating PDF customization:", error);
        return NextResponse.json({ error: "Failed to update PDF customization" }, { status: 500 });
      }

      result = data;
    } else {
      // Insert new customization
      const { data, error } = await supabase
        .from("pdf_customizations")
        .insert({
          user_id: user.id,
          template: body.template,
          logo_url: body.logo_url,
          logo_width: body.logo_width,
          logo_height: body.logo_height,
          primary_color: body.primary_color,
          secondary_color: body.secondary_color,
          accent_color: body.accent_color,
          text_color: body.text_color,
          background_color: body.background_color,
          font_family: body.font_family,
          heading_font_family: body.heading_font_family,
          font_size_base: body.font_size_base,
          font_size_heading: body.font_size_heading,
          font_size_title: body.font_size_title,
          header_text: body.header_text,
          footer_text: body.footer_text,
          footer_enabled: body.footer_enabled,
          footer_contact_email: body.footer_contact_email,
          footer_contact_phone: body.footer_contact_phone,
          footer_website: body.footer_website,
          footer_address: body.footer_address,
          watermark_enabled: body.watermark_enabled,
          watermark_text: body.watermark_text,
          show_academic_disclaimer: body.show_academic_disclaimer,
          academic_disclaimer_text: body.academic_disclaimer_text,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating PDF customization:", error);
        return NextResponse.json({ error: "Failed to create PDF customization" }, { status: 500 });
      }

      result = data;
    }

    return NextResponse.json({ customization: result });
  } catch (error) {
    console.error("Error in POST /api/pdf/customization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE - Delete PDF customization
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

    const { error } = await supabase.from("pdf_customizations").delete().eq("user_id", user.id);

    if (error) {
      console.error("Error deleting PDF customization:", error);
      return NextResponse.json({ error: "Failed to delete PDF customization" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/pdf/customization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
