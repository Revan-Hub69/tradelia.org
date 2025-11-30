import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/watchlist/check-alerts
 * Controlla tutti gli alert attivi e invia notifiche se necessario
 * 
 * Questo endpoint dovrebbe essere chiamato periodicamente (cron job)
 * o tramite Supabase Edge Function
 * 
 * Multi-Provider con rate limits generosi:
 * - Finnhub: 60 calls/min (stocks/forex)
 * - Binance: 1200 calls/min (crypto)
 * - Yahoo Finance: illimitato (fallback)
 * 
 * Batch check ogni 5 minuti
 * - Max 50 asset per batch (grazie a rate limits generosi)
 */
export async function POST(request: NextRequest) {
  try {
    // Ottieni tutti gli alert attivi non ancora triggerati
    const { data: activeAlerts, error: alertsError } = await supabaseAdmin
      .from('watchlist_alerts')
      .select('*, watchlist(asset_symbol, asset_name, asset_type, user_id)')
      .eq('is_active', true)
      .eq('is_triggered', false)
      .order('last_checked_at', { ascending: true, nullsFirst: true })
      .limit(50); // Limite per batch (Finnhub: 60/min, Binance: 1200/min)

    if (alertsError) {
      console.error('Error fetching active alerts:', alertsError);
      return NextResponse.json({ error: alertsError.message }, { status: 500 });
    }

    if (!activeAlerts || activeAlerts.length === 0) {
      return NextResponse.json({ checked: 0, triggered: 0 });
    }

    let checked = 0;
    let triggered = 0;

    // Raggruppa per asset_symbol per ridurre chiamate API
    const alertsBySymbol = new Map<string, typeof activeAlerts>();
    for (const alert of activeAlerts) {
      const symbol = alert.watchlist?.asset_symbol;
      if (!symbol) continue;

      if (!alertsBySymbol.has(symbol)) {
        alertsBySymbol.set(symbol, []);
      }
      alertsBySymbol.get(symbol)!.push(alert);
    }

    // Controlla ogni asset
    // Finnhub: 60 calls/min (12x Alpha Vantage!)
    // Binance: 1200 calls/min (estremamente generoso!)
    // Possiamo controllare molti più asset per batch
    const symbolsToCheck = Array.from(alertsBySymbol.keys()).slice(0, 50); // 50 asset per batch

    for (const symbol of symbolsToCheck) {
      const alerts = alertsBySymbol.get(symbol)!;
      const firstAlert = alerts[0];
      const assetType = firstAlert.watchlist?.asset_type || 'stock';

      try {
        // Ottieni prezzo corrente (Alpha Vantage o altro)
        const currentPrice = await getCurrentPrice(symbol, assetType);

        if (currentPrice === null) {
          console.warn(`Could not fetch price for ${symbol}`);
          continue;
        }

        // Controlla ogni alert per questo asset
        for (const alert of alerts) {
          checked++;

          const shouldTrigger = checkAlertCondition(
            alert.alert_type,
            currentPrice,
            alert.target_value,
            alert.comparison_operator || '>='
          );

          if (shouldTrigger) {
            // Trigger alert
            await triggerAlert(alert, currentPrice);
            triggered++;
          } else {
            // Aggiorna last_checked_at
            await supabaseAdmin
              .from('watchlist_alerts')
              .update({ last_checked_at: new Date().toISOString(), current_value: currentPrice })
              .eq('id', alert.id);
          }
        }
      } catch (error) {
        console.error(`Error checking alerts for ${symbol}:`, error);
      }
    }

    return NextResponse.json({ checked, triggered, symbolsChecked: symbolsToCheck.length });
  } catch (error) {
    console.error('Error in POST /api/watchlist/check-alerts:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Ottiene il prezzo corrente di un asset
 * Usa multi-provider con fallback automatico:
 * 1. Finnhub (stocks/forex) - 60 calls/min
 * 2. Binance (crypto) - 1200 calls/min
 * 3. Yahoo Finance (fallback) - illimitato
 */
async function getCurrentPrice(symbol: string, assetType: string): Promise<number | null> {
  try {
    const { getCurrentPriceCached } = await import('@/lib/price-apis');
    
    const result = await getCurrentPriceCached(
      symbol,
      assetType as 'stock' | 'crypto' | 'forex' | 'commodity' | 'other'
    );

    if (result.price !== null) {
      console.log(`Price for ${symbol} from ${result.source}: ${result.price}`);
      return result.price;
    }

    console.warn(`Could not fetch price for ${symbol} from any provider`);
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Controlla se un alert dovrebbe essere triggerato
 */
function checkAlertCondition(
  alertType: string,
  currentValue: number,
  targetValue: number,
  operator: string
): boolean {
  switch (alertType) {
    case 'price_above':
      return operator === '>=' ? currentValue >= targetValue : currentValue > targetValue;
    case 'price_below':
      return operator === '<=' ? currentValue <= targetValue : currentValue < targetValue;
    case 'price_change_pct':
      // TODO: Calcola variazione percentuale
      return false;
    default:
      return false;
  }
}

/**
 * Triggera un alert e invia notifiche
 */
async function triggerAlert(alert: any, triggeredValue: number) {
  const watchlist = alert.watchlist;
  const userId = watchlist?.user_id;

  if (!userId) return;

  // Segna alert come triggerato
  await supabaseAdmin
    .from('watchlist_alerts')
    .update({
      is_triggered: true,
      triggered_at: new Date().toISOString(),
      current_value: triggeredValue,
      last_checked_at: new Date().toISOString(),
    })
    .eq('id', alert.id);

  // Salva in history
  await supabaseAdmin.from('watchlist_alert_history').insert({
    alert_id: alert.id,
    watchlist_id: alert.watchlist_id,
    user_id: userId,
    alert_type: alert.alert_type,
    target_value: alert.target_value,
    triggered_value: triggeredValue,
    notification_sent: false,
  });

  // Prepara notifica
  const channels: string[] = [];
  if (alert.notify_via_push) channels.push('push');
  if (alert.notify_via_email) channels.push('email');
  if (alert.notify_via_sms) channels.push('sms');

  const message = getAlertMessage(alert, watchlist, triggeredValue);

  // Invia notifiche
  if (channels.length > 0) {
    try {
      const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'info',
          title: `Alert: ${watchlist?.asset_symbol}`,
          message,
          channels,
        }),
      });

      if (notificationResponse.ok) {
        // Aggiorna history con notification_sent
        await supabaseAdmin
          .from('watchlist_alert_history')
          .update({
            notification_sent: true,
            notification_sent_at: new Date().toISOString(),
            notification_channels: channels,
          })
          .eq('alert_id', alert.id)
          .eq('triggered_at', new Date().toISOString().split('T')[0]); // Approximativo
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

/**
 * Genera messaggio per alert
 */
function getAlertMessage(alert: any, watchlist: any, triggeredValue: number): string {
  const symbol = watchlist?.asset_symbol || 'Asset';
  const target = alert.target_value;
  const type = alert.alert_type;

  switch (type) {
    case 'price_above':
      return `${symbol} ha raggiunto $${triggeredValue.toFixed(2)} (target: $${target.toFixed(2)})`;
    case 'price_below':
      return `${symbol} è sceso a $${triggeredValue.toFixed(2)} (target: $${target.toFixed(2)})`;
    default:
      return `${symbol} ha raggiunto il target di $${target.toFixed(2)}`;
  }
}

