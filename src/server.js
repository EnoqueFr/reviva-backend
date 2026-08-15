// Usado só pra rodar a API localmente (npm run dev).
// Em produção no Vercel, quem serve as requisições é api/[...path].js (funções serverless) —
// esse arquivo aqui nunca roda lá.
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`API do Projeto Reviva rodando em http://localhost:${PORT}`);
});
