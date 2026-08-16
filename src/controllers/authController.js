const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Hash "fantasma" usado só pra igualar o tempo de resposta quando o e-mail não existe.
// Sem isso, "e-mail não encontrado" responde na hora e "senha errada" demora (bcrypt.compare
// é lento de propósito) — essa diferença de tempo permite descobrir quais e-mails existem
// na base mesmo com a mensagem de erro sendo genérica nos dois casos.
const HASH_FANTASMA = '$2a$12$C6UzMDM.H6dfI/f/IKcEeOMSHYE9WQjMPGvzMj1cN1Sq7bR7VFT4a';

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

    // Roda o bcrypt.compare SEMPRE (mesmo sem colaborador encontrado), contra o hash
    // fantasma nesse caso — assim o tempo de resposta é parecido nos dois cenários.
    const senhaConfere = await bcrypt.compare(senha, colaborador ? colaborador.senha_hash : HASH_FANTASMA);

    // Mensagem genérica de propósito em ambos os casos (usuário não existe / senha errada),
    // pra não revelar pra quem está tentando adivinhar se um e-mail existe na base.
    if (!colaborador || !senhaConfere) {
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
