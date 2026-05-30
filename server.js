import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          background-color: #0A0A0B;
          color: #F5F5F0;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 40px 20px;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #121214;
          border: 1px solid rgba(245, 245, 240, 0.1);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .header {
          border-bottom: 1px solid rgba(245, 245, 240, 0.1);
          padding-bottom: 24px;
          margin-bottom: 32px;
          text-align: center;
        }
        .title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #F5F5F0;
        }
        .field {
          margin-bottom: 28px;
        }
        .label {
          font-size: 11px;
          color: rgba(245, 245, 240, 0.5);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .value {
          font-size: 16px;
          color: #F5F5F0;
          margin: 0;
        }
        .message-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(245, 245, 240, 0.08);
          border-radius: 12px;
          padding: 24px;
          margin-top: 12px;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(245, 245, 240, 0.9);
          white-space: pre-wrap;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: rgba(245, 245, 240, 0.3);
          letter-spacing: 1px;
        }
        .highlight {
          color: #fff;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Nuevo Mensaje</h1>
        </div>
        
        <div class="field">
          <div class="label">Remitente</div>
          <div class="value"><span class="highlight">${name}</span></div>
        </div>

        <div class="field">
          <div class="label">Email de Contacto</div>
          <div class="value"><a href="mailto:${email}" style="color: #F5F5F0; text-decoration: none; border-bottom: 1px solid rgba(245, 245, 240, 0.3); padding-bottom: 2px;">${email}</a></div>
        </div>
        
        <div class="field">
          <div class="label">Mensaje</div>
          <div class="message-box">${message}</div>
        </div>
        
        <div class="footer">
          Enviado desde el formulario de contacto de tu portafolio.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${name}" <${email}>`, // sender address
    to: process.env.GMAIL_USER, // receiver (you)
    subject: ` Nuevo Mensaje de Portafolio: ${name}`, // Subject line
    text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`, // plain text fallback
    html: htmlTemplate,
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
