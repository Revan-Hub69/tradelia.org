import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import webpush from 'web-push';

/**
 * API per inviare notifica push immediata a tutti i membri di un'alleanza
 * POST /api/oslo/notifications/push-all
 * 
 * Body: {
 *   alliance_id: string,
 *   title: string,
 *   message: string,
 *   link?: string
 * }
 */

// Inizializza web-push con VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@oslo.app';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface PushAllPayload {
  alliance_id: string;
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

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const body: PushAllPayload = await request.json();

    if (!body.alliance_id || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'alliance_id, title e message sono richiesti' },
        { status: 400 }
      );
    }

    // Verifica che l'utente sia admin o officer dell'alleanza
    const { data: member, error: memberError } = await supabase
      .from('alliance_members')
      .select('role')
      .eq('alliance_id', body.alliance_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Non sei membro di questa alleanza' }, { status: 403 });
    }

    if (member.role !== 'admin' && member.role !== 'officer') {
      return NextResponse.json(
        { error: 'Solo admin e officer possono inviare notifiche a tutti' },
        { status: 403 }
      );
    }

    // Recupera tutti i membri dell'alleanza
    const { data: members, error: membersError } = await supabaseAdmin
      .from('alliance_members')
      .select('user_id')
      .eq('alliance_id', body.alliance_id);

    if (membersError) {
      console.error('Errore recupero membri:', membersError);
      return NextResponse.json({ error: 'Errore recupero membri' }, { status: 500 });
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'Nessun membro trovato',
      });
    }

    // Recupera push subscriptions per tutti i membri
    const userIds = members.map(m => m.user_id);
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('user_id, subscription')
      .in('user_id', userIds);

    if (membersError) {
      console.error('Errore recupero membri:', membersError);
      return NextResponse.json({ error: 'Errore recupero membri' }, { status: 500 });
    }

    if (subsError) {
      console.error('Errore recupero subscriptions:', subsError);
      return NextResponse.json({ error: 'Errore recupero subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'Nessun membro con push subscription trovato',
      });
    }

    // Prepara payload notifica con emoji se non presente
    const titleWithEmoji = body.title.match(/^[🎮⚔️🛡️📊✅❌🔒📢]/) 
      ? body.title 
      : `📢 ${body.title}`;
    
    const payload = JSON.stringify({
      title: titleWithEmoji,
      body: body.message,
      url: body.link || '/dashboard/oslo',
      icon: '/favicon.png',
      badge: '/favicon-32x32.png',
      tag: `alliance-${body.alliance_id}-${Date.now()}`,
      timestamp: Date.now(),
      requireInteraction: false,
      dir: 'ltr',
      lang: 'it',
    });

    // Invia push a tutti i membri
    const results = [];
    let sentCount = 0;
    let errorCount = 0;

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

        sentCount++;
        results.push({
          user_id: sub.user_id,
          endpoint: subscription.endpoint,
          status: 'sent',
        });
      } catch (error) {
        errorCount++;
        const subscription = sub.subscription as {
          endpoint: string;
          keys: {
            p256dh: string;
            auth: string;
          };
        } | null;

        results.push({
          user_id: sub.user_id,
          endpoint: subscription?.endpoint || 'unknown',
          status: 'error',
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
        });

        // Rimuovi subscription invalida (410 Gone)
        if (error instanceof Error && error.message.includes('410') && subscription?.endpoint) {
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('user_id', sub.user_id)
            .eq('endpoint', subscription.endpoint);
        }
      }
    }

    // Salva log notifica
    await supabaseAdmin.from('event_notifications').insert({
      alliance_id: body.alliance_id,
      event_id: null,
      notification_type: 'immediate_push',
      status: sentCount > 0 ? 'sent' : 'failed',
      recipients_count: sentCount,
    });

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total_members: members.length,
      members_with_push: subscriptions.length,
      results,
    });
  } catch (error) {
    console.error('Errore push all:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

