require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  console.log('Aplicando schema.sql no banco...');
  try {
    await pool.query(sql);
    console.log('Pronto! Tabelas "inscricoes" e "colaboradores" criadas (ou já existiam).');
  } catch (err) {
    console.error('Erro ao aplicar o schema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
