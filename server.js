import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

/* ── CORS — restrict to known origins ── */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.SITE_URL, // e.g. https://paulojimenez.dev
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman in dev)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
}));

app.use(express.json({ limit: '10kb' })); // reject large payloads

/* ── Rate limiting (in-memory) ── */
const rateLimitMap = new Map();
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT = 5; // max requests per window per IP

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return next();
  }

  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  entry.count++;
  return next();
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > RATE_WINDOW) rateLimitMap.delete(ip);
  }
}, 60 * 1000);

/* ── Sanitization helpers ── */
const sanitize = (str) =>
  String(str).replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);

const LIMITS = { name: 100, email: 254, message: 500 };

/* ── Nodemailer transporter ── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/* ── Contact endpoint ── */
app.post('/api/contact', rateLimit, async (req, res) => {
  const { name: rawName, email: rawEmail, message: rawMessage } = req.body;

  // Sanitize all inputs
  const name = sanitize(rawName || '');
  const email = sanitize(rawEmail || '');
  const message = sanitize(rawMessage || '');

  // Validate
  if (!name || name.length < 2 || name.length > LIMITS.name) {
    return res.status(400).json({ error: 'Invalid name.' });
  }
  if (!email || !isValidEmail(email) || email.length > LIMITS.email) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (!message || message.length < 10 || message.length > LIMITS.message) {
    return res.status(400).json({ error: 'Message must be between 10 and 500 characters.' });
  }

  // Escape for safe HTML insertion (double-defense after sanitize)
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

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
          <div class="value"><span class="highlight">${esc(name)}</span></div>
        </div>

        <div class="field">
          <div class="label">Email de Contacto</div>
          <div class="value"><a href="mailto:${esc(email)}" style="color: #F5F5F0; text-decoration: none; border-bottom: 1px solid rgba(245, 245, 240, 0.3); padding-bottom: 2px;">${esc(email)}</a></div>
        </div>
        
        <div class="field">
          <div class="label">Mensaje</div>
          <div class="message-box">${esc(message)}</div>
        </div>
        
        <div class="footer">
          Enviado desde el formulario de contacto de tu portafolio.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `Nuevo Mensaje de Portafolio: ${esc(name)}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
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

