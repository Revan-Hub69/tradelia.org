import { getServiceSupabase } from '../_lib/supabase.js';
import { requireAdmin } from '../_lib/adminAuth.js';
import { handleRouteError, methodNotAllowed, sendJSON, HttpError } from '../_lib/http.js';

const supabase = getServiceSupabase();

const fetchAll = async (builder, label) => {
  const { data, error } = await builder;
  if (error) {
    throw new HttpError(500, `Errore caricamento ${label}`, error.message);
  }
  return data || [];
};

const computeStats = (users = []) => {
  const totalUsers = users.length;
  const activePlans = users.filter((u) => u.role && !u.isExpired).length;
  const expiredPlans = users.filter((u) => u.role && u.isExpired).length;
  const totalCredits = users.reduce((sum, u) => sum + (u.credits || 0), 0);
  return { totalUsers, activePlans, expiredPlans, totalCredits };
};

const buildUsersSnapshot = async () => {
  const [roles, profiles, credits, tokens, subscriptions] = await Promise.all([
    fetchAll(
      supabase
        .from('user_roles')
        .select('user_id,email,role,plan_source,valid_until,created_at'),
      'user_roles'
    ),
    fetchAll(supabase.from('user_profiles').select('user_id,display_name'), 'user_profiles'),
    fetchAll(supabase.from('user_analysis_credits').select('user_id,credits_balance'), 'credits'),
    fetchAll(
      supabase
        .from('dashboard_access_tokens')
        .select('user_id,email,plan_role,valid_until,source,revoked')
        .eq('revoked', false),
      'dashboard_access_tokens'
    ),
    fetchAll(
      supabase
        .from('subscriptions')
        .select('user_id,plan,status,gateway,renew_at,cancelled_at,started_at')
        .order('started_at', { ascending: false }),
      'subscriptions'
    )
  ]);

  const profilesMap = new Map(profiles.map((p) => [p.user_id, p]));
  const creditsMap = new Map(credits.map((c) => [c.user_id, c]));
  const tokensByEmail = new Map();
  const tokensByUserId = new Map();

  tokens.forEach((token) => {
    const emailKey = token.email?.toLowerCase();
    if (!emailKey) return;
    const existing = tokensByEmail.get(emailKey);
    const tokenDate = token.valid_until ? new Date(token.valid_until).getTime() : 0;
    const existingDate = existing?.valid_until ? new Date(existing.valid_until).getTime() : 0;
    if (!existing || tokenDate > existingDate) {
      tokensByEmail.set(emailKey, token);
    }
    if (token.user_id) {
      const current = tokensByUserId.get(token.user_id);
      if (!current || tokenDate > (current.valid_until ? new Date(current.valid_until).getTime() : 0)) {
        tokensByUserId.set(token.user_id, token);
      }
    }
  });

  const usersByEmail = new Map();
  const userKeyById = new Map();

  const ensureEntry = (email, defaults = {}) => {
    if (!email) return null;
    const key = email.toLowerCase();
    if (!usersByEmail.has(key)) {
      usersByEmail.set(key, {
        email,
        user_id: defaults.user_id || null,
        display_name: '—',
        role: null,
        plan_source: null,
        valid_until: null,
        credits: 0,
        subscription_status: null,
        subscription_gateway: null,
        subscription_plan: null,
        token_valid_until: null,
        token_plan_role: null,
        token_source: null,
        created_at: defaults.created_at || null,
        source: defaults.source || null
      });
    }
    const entry = usersByEmail.get(key);
    if (defaults.user_id && !entry.user_id) {
      entry.user_id = defaults.user_id;
      userKeyById.set(defaults.user_id, key);
    }
    return entry;
  };

  const ensureEntryByUserId = (userId, emailHint = null) => {
    if (!userId) return null;
    const existingKey = userKeyById.get(userId);
    if (existingKey) return usersByEmail.get(existingKey);
    const token = tokensByUserId.get(userId);
    const email = token?.email || emailHint;
    if (!email) return null;
    return ensureEntry(email, { user_id: userId });
  };

  roles.forEach((role) => {
    const entry = ensureEntry(role.email, {
      user_id: role.user_id,
      source: 'user_roles',
      created_at: role.created_at
    });
    if (!entry) return;
    entry.role = role.role || entry.role;
    entry.plan_source = role.plan_source || entry.plan_source;
    entry.valid_until = role.valid_until || entry.valid_until;
  });

  tokens.forEach((token) => {
    const entry = ensureEntry(token.email, {
      user_id: token.user_id,
      source: 'dashboard_access_tokens'
    });
    if (!entry) return;
    if (!entry.valid_until) {
      entry.valid_until = token.valid_until || entry.valid_until;
    }
    entry.token_valid_until = token.valid_until;
    entry.token_plan_role = token.plan_role;
    entry.token_source = token.source || entry.token_source;
  });

  credits.forEach((credit) => {
    const entry =
      ensureEntryByUserId(credit.user_id) ||
      (credit.user_id && tokensByUserId.get(credit.user_id)
        ? ensureEntry(tokensByUserId.get(credit.user_id).email, { user_id: credit.user_id })
        : null);
    if (!entry) return;
    entry.credits = credit.credits_balance || 0;
  });

  profiles.forEach((profile) => {
    const entry = ensureEntryByUserId(profile.user_id);
    if (!entry) return;
    if (profile.display_name) {
      entry.display_name = profile.display_name;
    }
  });

  const subscriptionByUserId = new Map();
  subscriptions.forEach((sub) => {
    if (!sub.user_id || subscriptionByUserId.has(sub.user_id)) return;
    subscriptionByUserId.set(sub.user_id, sub);
  });

  subscriptionByUserId.forEach((sub, userId) => {
    const entry = ensureEntryByUserId(userId);
    if (!entry) return;
    entry.subscription_status = sub.status;
    entry.subscription_gateway = sub.gateway;
    entry.subscription_plan = sub.plan;
    if (!entry.valid_until && sub.renew_at) {
      entry.valid_until = sub.renew_at;
    }
  });

  const users = Array.from(usersByEmail.values()).map((user) => {
    const profile = user.user_id ? profilesMap.get(user.user_id) : null;
    if (profile?.display_name) {
      user.display_name = profile.display_name;
    }
    if (user.user_id && creditsMap.has(user.user_id)) {
      user.credits = creditsMap.get(user.user_id).credits_balance || 0;
    }
    const now = Date.now();
    const expiryTime = user.valid_until ? new Date(user.valid_until).getTime() : null;
    user.isExpired = user.role ? !!(expiryTime && expiryTime < now) : false;
    if (user.subscription_status === 'active') {
      user.isExpired = false;
    }
    return user;
  });

  return { users, stats: computeStats(users) };
};

const handleListUsers = async (res) => {
  const snapshot = await buildUsersSnapshot();
  return sendJSON(res, 200, { ok: true, ...snapshot });
};

const handleUpdateUser = async (req, res) => {
  const {
    identifier,
    identifierType = 'user_id',
    email: inputEmail,
    userId: inputUserId,
    displayName,
    role,
    validUntil,
    planSource
  } = req.body || {};

  if (!identifier) {
    throw new HttpError(400, 'Identificatore utente mancante');
  }

  let userId = identifierType === 'user_id' ? identifier : inputUserId || null;
  let email =
    (identifierType === 'email' ? identifier : inputEmail)?.trim().toLowerCase() || null;

  if (!email && userId) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('email')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      throw new HttpError(500, 'Errore nel recupero email utente', error.message);
    }
    email = data?.email || null;
  }

  if (!email) {
    throw new HttpError(400, 'Email necessaria per aggiornare l\'utente');
  }

  const updates = [];

  if (userId && displayName !== undefined) {
    updates.push(
      supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: userId,
            display_name: displayName || null
          },
          { onConflict: 'user_id' }
        )
    );
  }

  if (role || validUntil || planSource || userId) {
    const rolePayload = {
      email,
      role: role || null,
      plan_source: planSource || null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null
    };
    if (userId) {
      rolePayload.user_id = userId;
    }
    updates.push(
      supabase.from('user_roles').upsert(rolePayload, {
        onConflict: 'email'
      })
    );
  }

  if (updates.length) {
    const results = await Promise.all(updates);
    results.forEach(({ error }) => {
      if (error) {
        throw new HttpError(500, 'Errore durante l\'aggiornamento utente', error.message);
      }
    });
  }

  if (role || validUntil) {
    const tokenUpdate = {};
    if (role) tokenUpdate.plan_role = role;
    if (validUntil) tokenUpdate.valid_until = new Date(validUntil).toISOString();
    if (Object.keys(tokenUpdate).length) {
      const { error } = await supabase
        .from('dashboard_access_tokens')
        .update(tokenUpdate)
        .eq('email', email)
        .eq('revoked', false);
      if (error) {
        throw new HttpError(500, 'Errore aggiornamento token', error.message);
      }
    }
  }

  return sendJSON(res, 200, { ok: true });
};

export default async function handler(req, res) {
  try {
    await requireAdmin(req);

    if (req.method === 'GET') {
      return await handleListUsers(res);
    }

    if (req.method === 'PUT') {
      return await handleUpdateUser(req, res);
    }

    return methodNotAllowed(res, ['GET', 'PUT']);
  } catch (error) {
    return handleRouteError(res, error);
  }
}

