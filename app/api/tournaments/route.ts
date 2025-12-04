import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournaments API
 * 
 * Best Practice: Tournament management per paper trading
 * Academic references: Competitive trading analysis, leaderboard systems
 */

/**
 * GET /api/tournaments
 * Get all tournaments (filtered by status)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const format = searchParams.get('format');

    let query = supabase
      .from('paper_trading_tournaments')
      .select('*')
      .order('start_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    } else {
      // Default: show active tournaments
      query = query.in('status', ['open_registration', 'in_progress']);
    }

    if (format) {
      query = query.eq('format', format);
    }

    const { data: tournaments, error } = await query;

    if (error) {
      console.error('Error fetching tournaments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tournaments || []);
  } catch (error) {
    console.error('Error in GET /api/tournaments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tournaments
 * Create new tournament (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      format,
      templateId, // Optional: use template as base
      registrationStart,
      registrationEnd,
      startDate,
      endDate,
      initialCapital,
      maxLeverage,
      maxPositionSizePercent,
      minTradesRequired,
      scoringMethod,
      minSharpeRatio,
      maxDrawdownLimit,
      minWinRate,
      minLevel,
      requirePro,
      maxParticipants,
      entryFeeXP,
      prizeType,
      prizeProAccessDays,
      prizeDeskAccessDays,
      prizePoolXP,
      prizeTopN,
      prizeAchievements,
      prizeCustomDescription,
      rules,
    } = body;

    // If template provided, load defaults
    let templateDefaults: any = {};
    if (templateId) {
      const { data: template } = await supabase
        .from('paper_trading_tournament_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (template) {
        templateDefaults = {
          initial_capital: template.default_initial_capital,
          max_leverage: template.default_max_leverage,
          max_position_size_percent: template.default_max_position_size_percent,
          min_trades_required: template.default_min_trades_required,
          scoring_method: template.default_scoring_method,
          min_sharpe_ratio: template.default_min_sharpe_ratio,
          max_drawdown_limit: template.default_max_drawdown_limit,
          min_win_rate: template.default_min_win_rate,
          entry_fee_xp: template.default_entry_fee_xp,
          prize_type: template.default_prize_type,
          prize_pro_access_duration_days: template.default_prize_pro_access_days,
          prize_desk_access_duration_days: template.default_prize_desk_access_days,
          prize_pool_xp: template.default_prize_pool_xp,
          prize_top_n: template.default_prize_top_n,
        };
      }
    }

    // Validation
    if (!name || !startDate || !endDate || !registrationStart || !registrationEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const regStart = new Date(registrationStart);
    const regEnd = new Date(registrationEnd);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (regStart >= regEnd || regEnd >= start || start >= end) {
      return NextResponse.json(
        { error: 'Invalid date sequence' },
        { status: 400 }
      );
    }

    // Create tournament (use template defaults if not provided)
    const { data: tournament, error: tournamentError } = await supabase
      .from('paper_trading_tournaments')
      .insert({
        name,
        description: description || null,
        format: format || templateDefaults.format || 'weekly',
        status: 'draft',
        registration_start: regStart.toISOString(),
        registration_end: regEnd.toISOString(),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        initial_capital: initialCapital ?? templateDefaults.initial_capital ?? 10000,
        max_leverage: maxLeverage ?? templateDefaults.max_leverage ?? 2.0,
        max_position_size_percent: maxPositionSizePercent ?? templateDefaults.max_position_size_percent ?? 20.0,
        min_trades_required: minTradesRequired ?? templateDefaults.min_trades_required ?? 5,
        scoring_method: scoringMethod || templateDefaults.scoring_method || 'sharpe_ratio',
        min_sharpe_ratio: minSharpeRatio ?? templateDefaults.min_sharpe_ratio ?? 0.5,
        max_drawdown_limit: maxDrawdownLimit ?? templateDefaults.max_drawdown_limit ?? 20.0,
        min_win_rate: minWinRate ?? templateDefaults.min_win_rate ?? 40.0,
        min_level: minLevel ?? 1,
        require_pro: requirePro || false,
        max_participants: maxParticipants || null,
        entry_fee_xp: entryFeeXP ?? templateDefaults.entry_fee_xp ?? 0,
        prize_type: prizeType || templateDefaults.prize_type || 'xp_pool',
        prize_pro_access_duration_days: prizeProAccessDays ?? templateDefaults.prize_pro_access_duration_days ?? null,
        prize_desk_access_duration_days: prizeDeskAccessDays ?? templateDefaults.prize_desk_access_duration_days ?? null,
        prize_pool_xp: prizePoolXP ?? templateDefaults.prize_pool_xp ?? 0,
        prize_top_n: prizeTopN ?? templateDefaults.prize_top_n ?? 10,
        prize_achievements: prizeAchievements || [],
        prize_custom_description: prizeCustomDescription || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('Error creating tournament:', tournamentError);
      return NextResponse.json({ error: tournamentError.message }, { status: 500 });
    }

    // Add rules if provided
    if (rules && Array.isArray(rules)) {
      const ruleInserts = rules.map((rule: any) => ({
        tournament_id: tournament.id,
        rule_type: rule.type,
        rule_value: rule.value,
        rule_description: rule.description,
        is_required: rule.isRequired !== false,
        violation_penalty: rule.violationPenalty || 'disqualification',
      }));

      const { error: rulesError } = await supabase
        .from('paper_trading_tournament_rules')
        .insert(ruleInserts);

      if (rulesError) {
        console.error('Error creating tournament rules:', rulesError);
        // Continue anyway, rules can be added later
      }
    }

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tournaments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
