const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, firstName, token) => {
  // El enlace apunta al frontend, que luego llama al backend vía proxy
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Nexont" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verifica tu correo electrónico - Nexont',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hola, ${firstName}! 👋</h2>
        <p>Gracias por registrarte en <strong>Nexont</strong>. Para activar tu cuenta y empezar a usar el servicio, necesitas verificar tu correo electrónico.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}"
             style="background-color: #4F46E5; color: white; padding: 14px 28px;
                    text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
            Verificar correo
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Este enlace expira en <strong>24 horas</strong>.</p>
        <p style="color: #666; font-size: 14px;">Si no creaste una cuenta, puedes ignorar este correo.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="color: #aaa; font-size: 12px;">Nexont &copy; ${new Date().getFullYear()}</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };
