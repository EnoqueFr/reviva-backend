const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL não configurada. Copie .env.example para .env e preencha com a string de conexão do seu Postgres.'
  );
}

// A maioria dos provedores de Postgres gerenciado (Supabase, Render, Railway, Neon)
// exige SSL. Em desenvolvimento local (localhost) o SSL costuma vir desligado.
const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do Postgres:', err);
});

module.exports = pool;
