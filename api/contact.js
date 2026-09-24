import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido.',
    })
  }

  try {
    const { name, email, phone, message, website } = req.body || {}

    // Honeypot antispam
    if (website) {
      return res.status(200).json({ ok: true })
    }

    // Validación básica
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        error: 'Completá todos los campos obligatorios.',
      })
    }

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'legadomatero.sr@gmail.com',
      subject: `Nueva consulta de ${name}`,
      replyTo: email,
      text: `
Nueva consulta desde Legado Matero

Nombre: ${name}
Email: ${email}
Teléfono: ${phone}

Consulta:
${message}
      `,
    })

    if (error) {
      console.error('Resend error:', error)

      return res.status(500).json({
        error: 'No pudimos enviar tu consulta.',
      })
    }

    return res.status(200).json({
      ok: true,
    })
  } catch (error) {
    console.error('Contact API error:', error)

    return res.status(500).json({
      error: 'No pudimos enviar tu consulta.',
    })
  }
}