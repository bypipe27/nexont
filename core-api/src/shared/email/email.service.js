const nodemailer = require('nodemailer');

// ─── Verificar configuración al arrancar ──────────────────────────────────────
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('⚠️  EMAIL_USER o EMAIL_PASS no están configurados en .env');
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // smtp.gmail.com
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,                       // STARTTLS en puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,      // App Password de Google (16 caracteres)
  },
  // Timeout más generoso para redes lentas
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// ─── Verificar conexión SMTP al iniciar ───────────────────────────────────────
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP no disponible:', error.message);
    console.error('   Revisa EMAIL_HOST, EMAIL_PORT, EMAIL_USER y EMAIL_PASS en .env');
  } else {
    console.log('✅ SMTP listo para enviar correos');
  }
});

// ─── Enviar correo de verificación ───────────────────────────────────────────
const sendVerificationEmail = async (to, firstName, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  console.log(`📧 Intentando enviar correo de verificación a: ${to}`);
  console.log(`   URL de verificación: ${verifyUrl}`);

  const info = await transporter.sendMail({
    from: `"Nexont" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verifica tu correo electrónico - Nexont',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#0a0908;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#111009;border:1px solid rgba(212,163,62,0.2);border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#0d0b09,#1a1612);padding:36px 40px;border-bottom:1px solid rgba(212,163,62,0.15);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="font-size:22px;font-weight:900;color:#f0ece4;letter-spacing:0.02em;">Nexont</span>
                          <span style="display:block;font-size:11px;color:rgba(212,163,62,0.7);letter-spacing:0.18em;text-transform:uppercase;margin-top:3px;">Marketplace Colombiano</span>
                        </td>
                        <td align="right">
                          <span style="background:rgba(212,163,62,0.12);border:1px solid rgba(212,163,62,0.25);color:#d4a33e;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:5px 12px;border-radius:20px;">
                            ✦ Verificación
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#f0ece4;line-height:1.1;">
                      ¡Hola, ${firstName}! 👋
                    </h1>
                    <p style="margin:0 0 28px;font-size:15px;color:rgba(240,236,228,0.5);line-height:1.75;">
                      Gracias por registrarte en <strong style="color:#d4a33e;">Nexont</strong>. 
                      Para activar tu cuenta y empezar a explorar el marketplace, 
                      confirma tu correo electrónico haciendo clic en el botón de abajo.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:8px 0 32px;">
                          <a href="${verifyUrl}"
                             style="display:inline-block;background:#d4a33e;color:#0a0908;font-size:15px;font-weight:800;letter-spacing:0.04em;text-decoration:none;padding:14px 36px;border-radius:8px;">
                            Verificar mi cuenta →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Info boxes -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(212,163,62,0.1);border-radius:8px;overflow:hidden;margin-bottom:28px;">
                      <tr>
                        <td style="background:rgba(212,163,62,0.04);padding:14px 18px;border-bottom:1px solid rgba(212,163,62,0.08);">
                          <span style="font-size:12px;color:rgba(240,236,228,0.35);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px;">⏱ Expiración</span>
                          <span style="font-size:14px;color:#f0ece4;font-weight:600;">Este enlace expira en <strong style="color:#d4a33e;">24 horas</strong></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:rgba(212,163,62,0.02);padding:14px 18px;">
                          <span style="font-size:12px;color:rgba(240,236,228,0.35);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px;">🔒 Seguridad</span>
                          <span style="font-size:14px;color:rgba(240,236,228,0.5);">Si no creaste esta cuenta, puedes ignorar este correo.</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback URL -->
                    <p style="margin:0;font-size:12px;color:rgba(240,236,228,0.25);line-height:1.6;">
                      Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                      <a href="${verifyUrl}" style="color:#d4a33e;word-break:break-all;font-size:11px;">${verifyUrl}</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#0d0b09;padding:20px 40px;border-top:1px solid rgba(212,163,62,0.08);">
                    <p style="margin:0;font-size:11px;color:rgba(240,236,228,0.2);text-align:center;letter-spacing:0.02em;">
                      Nexont &copy; ${new Date().getFullYear()} · Marketplace Colombiano<br>
                      Este es un correo automático, no respondas a este mensaje.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  console.log(`✅ Correo enviado exitosamente. MessageId: ${info.messageId}`);
  return info;
};

module.exports = { sendVerificationEmail };