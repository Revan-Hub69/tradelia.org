// api/send-email.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { asset, analisi, metodo, contatto, nome } = req.body;

  try {
    const result = await resend.emails.send({
      from: 'Tradelia Reports <noreply@tradelia.org>', // Usa un dominio verified su Resend
      to: ['miodominio@gmail.com'], // Cambia con l'email dove ricevi le richieste
      subject: '📩 Nuova Richiesta Tradelia',
      html: `
        <h2>Nuova Richiesta da Tradelia</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Contatto (${metodo}):</strong> ${contatto}</p>
        ${asset ? `<p><strong>Asset:</strong> ${asset}</p>` : ''}
        ${analisi ? `<p><strong>Tipo Analisi:</strong> ${analisi}</p>` : ''}
        <p><em>Ricevuta tramite modulo gratuito Tradelia</em></p>
      `,
    });

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Errore invio:', error);
    return res.status(500).json({ error: 'Errore durante invio email' });
  }
}
