const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const inscricoesRoutes = require('./routes/inscricoes');

const app = express();

// Headers de segurança básicos — feito à mão (sem helmet) pra não adicionar
// mais uma dependência a instalar/dar deploy de novo.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json({ limit: '10kb' }));

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // permite chamadas sem "origin" (ex: Postman, curl) e as origens configuradas
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Origem não permitida pelo CORS.'));
    },
  })
);

app.get('/', (req, res) => {
  res.json({ status: 'ok', servico: 'API Projeto Reviva' });
});

app.use('/api/auth', authRoutes);
app.use('/api/inscricoes', inscricoesRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// handler de erro genérico (ex: erro de CORS lançado acima)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ erro: err.message || 'Erro interno.' });
});

module.exports = app;
