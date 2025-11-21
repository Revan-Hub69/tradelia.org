import { getServiceSupabase } from '../../_lib/supabase.js';
import { HttpError, methodNotAllowed, sendJSON } from '../../_lib/http.js';

const supabase = getServiceSupabase();

const getCurrentCredits = async (userId) => {
  const { data, error } = await supabase
    .from('user_analysis_credits')
    .select('credits_balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Errore nel recupero crediti utente', error.message);
  }

  return data?.credits_balance || 0;
};

export const handleCreditsRequest = async (req, res) => {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  const { userId, delta, reason, relatedRequestId } = req.body || {};

  if (!userId) {
    throw new HttpError(400, 'userId obbligatorio');
  }

  const parsedDelta = Number(delta);
  if (!Number.isFinite(parsedDelta) || parsedDelta === 0) {
    throw new HttpError(400, 'Delta crediti non valido');
  }

  const currentBalance = await getCurrentCredits(userId);
  const newBalance = currentBalance + parsedDelta;

  if (newBalance < 0) {
    throw new HttpError(400, 'Il saldo crediti non può essere negativo');
  }

  const { error: upsertError } = await supabase.from('user_analysis_credits').upsert(
    {
      user_id: userId,
      credits_balance: newBalance,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (upsertError) {
    throw new HttpError(500, "Errore durante l'aggiornamento dei crediti", upsertError.message);
  }

  const { error: logError } = await supabase.from('user_analysis_credits_log').insert({
    user_id: userId,
    delta: parsedDelta,
    reason: reason || 'manual_adjustment',
    related_request_id: relatedRequestId || null,
  });

  if (logError) {
    throw new HttpError(500, 'Errore durante il log dei crediti', logError.message);
  }

  return sendJSON(res, 200, {
    ok: true,
    credits: newBalance,
  });
};
