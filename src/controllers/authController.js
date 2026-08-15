const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function login(req, res) {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  try {
    const { rows } = await pool.query(
      'select id, nome, email, senha_hash from colaboradores where email = $1',
      [String(email).toLowerCase().trim()]
    );
    const colaborador = rows[0];

    // Mensagem genérica de propósito em ambos os casos (usuário não existe / senha errada),
    // pra não revelar pra quem está tentando adivinhar se um e-mail existe na base.
    if (!colaborador) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const senhaConfere = await bcrypt.compare(senha, colaborador.senha_hash);
    if (!senhaConfere) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const token = jwt.sign(
      { sub: colaborador.id, nome: colaborador.nome, email: colaborador.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      colaborador: { id: colaborador.id, nome: colaborador.nome, email: colaborador.email },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno ao tentar fazer login.' });
  }
}

// Usado pelo painel pra confirmar que o token ainda é válido ao recarregar a página.
async function me(req, res) {
  res.json({ colaborador: req.colaborador });
}

module.exports = { login, me };
