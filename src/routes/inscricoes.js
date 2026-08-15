const express = require('express');
const { criar, listar, atualizarStatus } = require('../controllers/inscricoesController');
const { requireAuth } = require('../middleware/auth');
const { inscricaoLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// pública — usada pelo formulário do site
router.post('/', inscricaoLimiter, criar);

// protegidas — usadas pelo painel de colaboradores
router.get('/', requireAuth, listar);
router.patch('/:id', requireAuth, atualizarStatus);

module.exports = router;
