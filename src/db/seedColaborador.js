// Cria (ou atualiza a senha de) um colaborador que pode logar no painel.
// Uso:
//   node src/db/seedColaborador.js "Nome Completo" "email@exemplo.com" "senhaForte123"
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const [nome, email, senha] = process.argv.slice(2);

  if (!nome || !email || !senha) {
    console.error('Uso: node src/db/seedColaborador.js "Nome Completo" "email@exemplo.com" "senhaForte123"');
    process.exitCode = 1;
    return;
  }

  if (senha.length < 8) {
    console.error('A senha precisa ter pelo menos 8 caracteres.');
    process.exitCode = 1;
    return;
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 12);

    await pool.query(
      `insert into colaboradores (nome, email, senha_hash)
       values ($1, $2, $3)
       on conflict (email) do update set senha_hash = excluded.senha_hash, nome = excluded.nome`,
      [nome, email.toLowerCase().trim(), senhaHash]
    );

    console.log(`Colaborador "${nome}" (${email}) pronto pra logar no painel.`);
  } catch (err) {
    console.error('Erro ao criar colaborador:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
