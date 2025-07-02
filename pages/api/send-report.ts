// /pages/api/send-report.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend('re_cfMzxDnt_8H714FSKpWgyUnhYH1gqdbqo');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  const { asset, categoria, focus, nome, metodo, contatto } = req.body;

  try {
    await resend.emails.send({
      from: 'Tradelia Reports <noreply@on.resend.dev>',
      to: 'analisi@tradelia.org',
      subject: `📩 Nuova richiesta report AI – ${asset}`,
      html: `
        <div style="font-family:Inter,sans-serif;font-size:15px;line-height:1.5">
          <h2>📊 Nuova Richiesta Analisi AI</h2>
          <p><strong>Asset:</strong> ${asset}</p>
          <p><strong>Categoria:</strong> ${categoria}</p>
          <p><strong>Focus:</strong> ${focus}</p>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Metodo di ricezione:</strong> ${metodo}</p>
          <p><strong>Contatto:</strong> ${contatto}</p>
          <hr/>
          <p>Inviata automaticamente da Tradelia.org</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Errore invio email:', error);
    return res.status(500).json({ success: false, message: 'Errore invio email' });
  }
}
