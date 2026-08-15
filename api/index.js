require('dotenv').config();
const app = require('../src/app');

// O Vercel invoca funções Node.js com a assinatura (req, res) — que é exatamente
// como um app Express já funciona quando chamado diretamente (é assim que
// http.createServer(app) funciona por baixo dos panos). Por isso, exportamos o
// app direto, sem nenhum "tradutor" no meio (nada de serverless-http, que serve
// pra outro formato de invocação, o da AWS Lambda, e não o do Vercel).
module.exports = app;
