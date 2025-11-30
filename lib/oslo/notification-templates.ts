/**
 * Oslo Notification Templates
 * Template predefiniti per notifiche push con tone gaming/casual
 */

import { type OsloLocale } from '@/lib/i18n/oslo/oslo-config';

interface EventInfo {
  name: string;
  time: string;
  type?: string;
}

interface DailySummaryEvents {
  events: Array<{ name: string; time: string }>;
}

/**
 * Genera template per riepilogo giornaliero
 */
export function generateDailySummaryTemplate(
  locale: OsloLocale,
  data: DailySummaryEvents
): { title: string; body: string } {
  const eventsList = data.events
    .map((e) => `• ${e.name} - ${e.time}`)
    .join('\n');

  const templates: Record<OsloLocale, { title: string; body: string }> = {
    it: {
      title: '📊 Riepilogo Eventi di Oggi',
      body: `${eventsList}\n\nApri per dettagli`,
    },
    en: {
      title: '📊 Today\'s Events Summary',
      body: `${eventsList}\n\nTap for details`,
    },
    ru: {
      title: '📊 Сводка Событий Сегодня',
      body: `${eventsList}\n\nНажмите для деталей`,
    },
    fr: {
      title: '📊 Résumé des Événements Aujourd\'hui',
      body: `${eventsList}\n\nAppuyez pour détails`,
    },
    de: {
      title: '📊 Zusammenfassung der Heutigen Ereignisse',
      body: `${eventsList}\n\nTippen für Details`,
    },
    es: {
      title: '📊 Resumen de Eventos de Hoy',
      body: `${eventsList}\n\nToca para detalles`,
    },
    zh: {
      title: '📊 今天的事件摘要',
      body: `${eventsList}\n\n点击查看详情`,
    },
    ja: {
      title: '📊 今日のイベント要約',
      body: `${eventsList}\n\nタップして詳細を表示`,
    },
    ro: {
      title: '📊 Rezumat Evenimente Astăzi',
      body: `${eventsList}\n\nApasă pentru detalii`,
    },
  };

  return templates[locale] || templates.en;
}

/**
 * Genera template per pre-evento (40 minuti prima)
 */
export function generatePreEventTemplate(
  locale: OsloLocale,
  data: EventInfo
): { title: string; body: string } {
  const templates: Record<OsloLocale, { title: string; body: string }> = {
    it: {
      title: `⚔️ ${data.name} tra 40 minuti!`,
      body: `Inizia alle ${data.time}\nUnisciti ora!`,
    },
    en: {
      title: `⚔️ ${data.name} in 40 minutes!`,
      body: `Starts at ${data.time}\nJoin now!`,
    },
    ru: {
      title: `⚔️ ${data.name} через 40 минут!`,
      body: `Начинается в ${data.time}\nПрисоединяйся сейчас!`,
    },
    fr: {
      title: `⚔️ ${data.name} dans 40 minutes!`,
      body: `Commence à ${data.time}\nRejoignez maintenant!`,
    },
    de: {
      title: `⚔️ ${data.name} in 40 Minuten!`,
      body: `Beginnt um ${data.time}\nJetzt beitreten!`,
    },
    es: {
      title: `⚔️ ${data.name} en 40 minutos!`,
      body: `Comienza a las ${data.time}\n¡Únete ahora!`,
    },
    zh: {
      title: `⚔️ ${data.name} 40分钟后开始!`,
      body: `开始时间: ${data.time}\n立即加入!`,
    },
    ja: {
      title: `⚔️ ${data.name} 40分後!`,
      body: `${data.time}に開始\n今すぐ参加!`,
    },
    ro: {
      title: `⚔️ ${data.name} în 40 de minute!`,
      body: `Începe la ${data.time}\nAlătură-te acum!`,
    },
  };

  return templates[locale] || templates.en;
}

/**
 * Genera template per evento iniziato
 */
export function generateEventStartedTemplate(
  locale: OsloLocale,
  data: EventInfo
): { title: string; body: string } {
  const templates: Record<OsloLocale, { title: string; body: string }> = {
    it: {
      title: `🎮 ${data.name} è iniziato!`,
      body: `Unisciti subito!`,
    },
    en: {
      title: `🎮 ${data.name} has started!`,
      body: `Join now!`,
    },
    ru: {
      title: `🎮 ${data.name} начался!`,
      body: `Присоединяйся сейчас!`,
    },
    fr: {
      title: `🎮 ${data.name} a commencé!`,
      body: `Rejoignez maintenant!`,
    },
    de: {
      title: `🎮 ${data.name} hat begonnen!`,
      body: `Jetzt beitreten!`,
    },
    es: {
      title: `🎮 ${data.name} ha comenzado!`,
      body: `¡Únete ahora!`,
    },
    zh: {
      title: `🎮 ${data.name} 已开始!`,
      body: `立即加入!`,
    },
    ja: {
      title: `🎮 ${data.name} が開始しました!`,
      body: `今すぐ参加!`,
    },
    ro: {
      title: `🎮 ${data.name} a început!`,
      body: `Alătură-te acum!`,
    },
  };

  return templates[locale] || templates.en;
}

/**
 * Genera template per evento terminato
 */
export function generateEventEndedTemplate(
  locale: OsloLocale,
  data: EventInfo
): { title: string; body: string } {
  const templates: Record<OsloLocale, { title: string; body: string }> = {
    it: {
      title: `✅ ${data.name} completato!`,
      body: `Grazie per la partecipazione!`,
    },
    en: {
      title: `✅ ${data.name} completed!`,
      body: `Thanks for participating!`,
    },
    ru: {
      title: `✅ ${data.name} завершено!`,
      body: `Спасибо за участие!`,
    },
    fr: {
      title: `✅ ${data.name} terminé!`,
      body: `Merci d'avoir participé!`,
    },
    de: {
      title: `✅ ${data.name} abgeschlossen!`,
      body: `Danke für die Teilnahme!`,
    },
    es: {
      title: `✅ ${data.name} completado!`,
      body: `¡Gracias por participar!`,
    },
    zh: {
      title: `✅ ${data.name} 已完成!`,
      body: `感谢参与!`,
    },
    ja: {
      title: `✅ ${data.name} 完了しました!`,
      body: `参加ありがとうございました!`,
    },
    ro: {
      title: `✅ ${data.name} completat!`,
      body: `Mulțumim pentru participare!`,
    },
  };

  return templates[locale] || templates.en;
}

/**
 * Genera template per push immediato personalizzato
 */
export function generateCustomPushTemplate(
  locale: OsloLocale,
  title: string,
  message: string
): { title: string; body: string } {
  // Aggiungi emoji se non presente
  const emojiPrefix = title.match(/^[🎮⚔️🛡️📊✅❌🔒]/) ? '' : '📢 ';
  
  return {
    title: `${emojiPrefix}${title}`,
    body: message,
  };
}

