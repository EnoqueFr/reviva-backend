const rateLimit = require('express-rate-limit');

// Limita quantas inscrições o mesmo IP pode enviar, pra evitar spam/bot no formulário.
const inscricaoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas em pouco tempo. Tenta de novo mais tarde ou fala com a gente no Instagram.' },
});

// Limita tentativas de login, pra dificultar ataque de força bruta na senha.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente de novo.' },
});

module.exports = { inscricaoLimiter, loginLimiter };
