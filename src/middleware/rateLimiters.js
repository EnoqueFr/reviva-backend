// Rate limiter simples, em memória, sem timers de fundo — importante em ambiente
// serverless (Vercel): um setInterval "vivo" impede a função de finalizar a resposta
// a tempo, o que causava timeout em TODA requisição, não só nas rotas com limite.

function createLimiter({ windowMs, max, message }) {
  const hits = new Map(); // chave: IP -> { count, resetAt }

  return function limiter(req, res, next) {
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({ erro: message });
    }

    entry.count += 1;
    next();
  };
}

const inscricaoLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: 'Muitas tentativas em pouco tempo. Tenta de novo mais tarde ou fala com a gente no Instagram.',
});

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: 'Muitas tentativas de login. Aguarde alguns minutos e tente de novo.',
});

module.exports = { inscricaoLimiter, loginLimiter };
