/**
 * Admin API Routes - Users Management
 * GET: List all users
 * POST: Create/update user
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminEmail } from '@/lib/supabase/admin';

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const userType = searchParams.get('user_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search'); // Search by email or display_name

    // Build query for user_profiles with user_roles
    let query = supabaseAdmin
      .from('user_profiles')
      .select(`
        *,
        user_roles (
          id,
          role,
          plan_source,
          valid_until,
          created_at
        ),
        auth_users:user_id (
          id,
          email,
          created_at,
          last_sign_in_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userType) {
      query = query.eq('user_type', userType);
    }

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      );
    }

    // Filter by role if specified
    let filteredData = data || [];
    if (role) {
      filteredData = filteredData.filter((user: any) =>
        user.user_roles?.some((r: any) => r.role === role)
      );
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    if (userType) {
      countQuery = countQuery.eq('user_type', userType);
    }
    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      data: filteredData,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (totalCount || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users - Create or update user
export async function POST(request: NextRequest) {
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
      user_id,
      email: userEmail,
      display_name,
      company,
      country,
      user_type,
      role,
      plan_source,
      valid_until,
      metadata = {},
    } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 }
      );
    }

    // Find or create auth user
    let userId = user_id;
    if (!userId) {
      // Check if user exists by listing users with email filter
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users?.users?.find((u) => u.email === userEmail.toLowerCase());
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userEmail,
          email_confirm: true,
        });
        if (createError || !newUser.user) {
          return NextResponse.json(
            { error: 'Failed to create user', details: createError?.message },
            { status: 500 }
          );
        }
        userId = newUser.user.id;
      }
    }

    // Update or create user_profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        display_name,
        company,
        country,
        user_type,
        metadata,
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to update user profile', details: profileError.message },
        { status: 500 }
      );
    }

    // Update or create user_role if role is provided
    if (role) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: userId,
          email: userEmail.toLowerCase(),
          role,
          plan_source,
          valid_until,
        });

      if (roleError) {
        console.error('Error updating user role:', roleError);
        // Continue even if role update fails
      }
    }

    return NextResponse.json({ data: profile }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
