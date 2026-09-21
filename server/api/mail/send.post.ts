import nodemailer from 'nodemailer'
import { defineEventHandler, readBody, createError } from 'h3'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)

  const type = String(body?.type || '').trim()

  if (!type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing mail type'
    })
  }

  if (
    !config.smtpHost ||
    !config.smtpPort ||
    !config.smtpUser ||
    !config.smtpPass ||
    !config.mailTo
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: 'SMTP environment variables are missing'
    })
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: Number(config.smtpPort) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  })

  if (type === 'contact') {
    const name = String(body?.name || '').trim()
    const phone = String(body?.phone || '').trim()
    const email = String(body?.email || '').trim()
    const subject = String(body?.subject || '').trim()
    const message = String(body?.message || '').trim()

    if (!name || !email || !subject || !message) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Please fill in all required fields'
      })
    }

    await transporter.sendMail({
      from: `"E-MOTION MK Website" <${config.smtpUser}>`,
      to: config.mailTo,
      replyTo: email,
      subject: `[E-MOTION MK] ${subject}`,
      text: `
New contact form message from E-MOTION MK

Name: ${name}
Phone: ${phone || '-'}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New contact form message - E-MOTION MK</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || '-')}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        </div>
      `.trim()
    })

    return { ok: true }
  }

  if (type === 'test-ride') {
    const model = String(body?.model || '').trim()
    const date = String(body?.date || '').trim()
    const hour = String(body?.hour || '').trim()
    const name = String(body?.name || '').trim()
    const phone = String(body?.phone || '').trim()
    const note = String(body?.note || '').trim()

    if (!model || !date || !hour || !name || !phone) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required booking fields'
      })
    }

    await transporter.sendMail({
      from: `"E-MOTION MK Website" <${config.smtpUser}>`,
      to: config.mailTo,
      replyTo: config.smtpUser,
      subject: '[E-MOTION MK] Нова резервација за тест возење',
      text: `
Нова резервација за тест возење

Модел: ${model}
Датум: ${date}
Час: ${hour}
Име и презиме: ${name}
Телефон: ${phone}
Забелешка: ${note || '-'}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Нова резервација за тест возење</h2>
          <p><strong>Модел:</strong> ${escapeHtml(model)}</p>
          <p><strong>Датум:</strong> ${escapeHtml(date)}</p>
          <p><strong>Час:</strong> ${escapeHtml(hour)}</p>
          <p><strong>Име и презиме:</strong> ${escapeHtml(name)}</p>
          <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Забелешка:</strong> ${escapeHtml(note || '-')}</p>
        </div>
      `.trim()
    })

    return { ok: true }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Unsupported mail type'
  })
})