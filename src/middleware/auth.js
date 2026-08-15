const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Faça login para acessar o painel.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.colaborador = { id: payload.sub, nome: payload.nome, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Sessão expirada ou inválida. Faça login novamente.' });
  }
}

module.exports = { requireAuth };
