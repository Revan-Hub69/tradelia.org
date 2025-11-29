import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import webpush from 'web-push';

/**
 * Endpoint per inviare notifiche push
 * POST /api/notifications/send
 * 
 * Body: {
 *   userId?: string, // Se specificato, invia solo a questo utente
 *   type: 'info' | 'success' | 'warning' | 'error' | 'analysis_completed' | 'plan_expiring' | 'credits_low' | 'system',
 *   title: string,
 *   message: string,
 *   link?: string
 * }
 */

// Inizializza web-push con VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@tradelia.org';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface SendNotificationPayload {
  userId?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'analysis_completed' | 'plan_expiring' | 'credits_low' | 'system';
  title: string;
  message: string;
  link?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Solo admin o utente stesso può inviare notifiche
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body = (await request.json()) as SendNotificationPayload;
    const { userId, type, title, message, link } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    // Se userId è specificato, verifica che sia l'utente stesso o admin
    const targetUserId = userId || user.id;
    if (targetUserId !== user.id) {
      // Verifica se è admin
      const { data: adminData } = await supabaseAdmin
        .from('admin_emails')
        .select('email')
        .eq('email', user.email?.toLowerCase())
        .single();

      if (!adminData) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
      }
    }

    // 1. Salva notifica nel database
    const { data: notification, error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type,
        title,
        message,
        link: link || null,
        is_read: false,
      })
      .select()
      .single();

    if (notifError) {
      console.error('Errore salvataggio notifica:', notifError);
      return NextResponse.json({ error: 'Errore salvataggio notifica' }, { status: 500 });
    }

    // 2. Recupera tutte le push subscriptions dell'utente
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', targetUserId);

    if (subError) {
      console.error('Errore lettura subscriptions:', subError);
      // Non fallire se non ci sono subscriptions
    }

    // 3. Invia push notification a tutte le subscriptions
    const pushResults = [];
    if (subscriptions && subscriptions.length > 0 && vapidPublicKey && vapidPrivateKey) {
      const payload = JSON.stringify({
        title,
        body: message,
        url: link || '/dashboard',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });

      for (const sub of subscriptions) {
        try {
          const subscription = sub.subscription as {
            endpoint: string;
            keys: {
              p256dh: string;
              auth: string;
            };
          };

          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
              },
            },
            payload
          );

          pushResults.push({ endpoint: subscription.endpoint, status: 'sent' });
        } catch (error) {
          console.error('Errore invio push:', error);
          pushResults.push({
            endpoint: sub.subscription?.endpoint || 'unknown',
            status: 'error',
            error: error instanceof Error ? error.message : 'Errore sconosciuto',
          });

          // Se la subscription è invalida, rimuovila
          if (error instanceof Error && error.message.includes('410')) {
            await supabaseAdmin
              .from('push_subscriptions')
              .delete()
              .eq('user_id', targetUserId)
              .eq('endpoint', subscription.endpoint);
          }
        }
      }
    }

    return NextResponse.json({
      notification,
      pushSent: pushResults.filter((r) => r.status === 'sent').length,
      pushErrors: pushResults.filter((r) => r.status === 'error').length,
      pushResults,
    });
  } catch (error) {
    console.error('Errore invio notifica:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

