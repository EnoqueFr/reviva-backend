const pool = require('../config/db');

const STATUS_VALIDOS = ['pendente', 'contatado', 'matriculado', 'descartado'];

function validarInscricao(body) {
  const erros = [];
  const nomeCrianca = String(body.nome_crianca || '').trim();
  const nomeResponsavel = String(body.nome_responsavel || '').trim();
  const telefone = String(body.telefone_whatsapp || '').trim();
  const idade = Number(body.idade);

  if (!nomeCrianca || nomeCrianca.length > 100) erros.push('Nome da criança inválido.');
  if (!nomeResponsavel || nomeResponsavel.length > 100) erros.push('Nome do responsável inválido.');
  if (!telefone || telefone.replace(/\D/g, '').length < 10) erros.push('WhatsApp inválido.');
  if (!Number.isInteger(idade) || idade < 4 || idade > 18) erros.push('Idade inválida.');

  return { erros, dados: { nomeCrianca, idade, nomeResponsavel, telefone } };
}

// POST /api/inscricoes — rota pública, chamada pelo formulário do site
async function criar(req, res) {
  const { erros, dados } = validarInscricao(req.body || {});

  if (erros.length) {
    return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  }

  try {
    const { rows } = await pool.query(
      `insert into inscricoes (nome_crianca, idade, nome_responsavel, telefone_whatsapp)
       values ($1, $2, $3, $4)
       returning id, created_at`,
      [dados.nomeCrianca, dados.idade, dados.nomeResponsavel, dados.telefone]
    );

    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error('Erro ao salvar inscrição:', err);
    res.status(500).json({ erro: 'Não foi possível salvar a inscrição agora. Tente novamente.' });
  }
}

// GET /api/inscricoes — rota protegida, usada pelo painel de colaboradores
async function listar(req, res) {
  const status = req.query.status;

  try {
    const query = status && STATUS_VALIDOS.includes(status)
      ? { text: 'select * from inscricoes where status = $1 order by created_at desc', values: [status] }
      : { text: 'select * from inscricoes order by created_at desc', values: [] };

    const { rows } = await pool.query(query);
    res.json({ inscricoes: rows });
  } catch (err) {
    console.error('Erro ao listar inscrições:', err);
    res.status(500).json({ erro: 'Não foi possível carregar as inscrições.' });
  }
}

// PATCH /api/inscricoes/:id — rota protegida, atualiza o status de acompanhamento
async function atualizarStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use um de: ${STATUS_VALIDOS.join(', ')}.` });
  }

  try {
    const { rows } = await pool.query(
      'update inscricoes set status = $1 where id = $2 returning id, status',
      [status, id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: 'Inscrição não encontrada.' });
    }

    res.json({ ok: true, inscricao: rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ erro: 'Não foi possível atualizar o status.' });
  }
}

module.exports = { criar, listar, atualizarStatus };
