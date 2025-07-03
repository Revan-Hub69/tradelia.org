// /api/send-email.js
import { Resend } from 'resend';

const resend = new Resend('re_P2UTQkLc_HxqSWp8w3qxZ2ghHJhaSZrN3');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const { asset, analisi, metodo, contatto, nome } = req.body;

  if (!metodo || !contatto || !nome) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  const subject = asset ? `Richiesta Analisi Asset – ${asset}` : 'Richiesta Servizio Gratuito';

  const content = `
    ✅ Nuova richiesta da modulo Tradelia

    Nome: ${nome}
    Metodo: ${metodo}
    Contatto: ${contatto}
    ${asset ? `Asset: ${asset}\nTipo Analisi: ${analisi}` : '(Richiesta predefinita)'}
  `;

  try {
    await resend.emails.send({
      from: 'Tradelia <support@tradelia.org>',
      to: 'affiliazioni@parola-ai-trader.net',
      subject,
      text: content
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Errore invio email', details: err.message });
  }
}
