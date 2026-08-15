require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const inscricoesRoutes = require('./routes/inscricoes');

const app = express();

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

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`API do Projeto Reviva rodando em http://localhost:${PORT}`);
});
