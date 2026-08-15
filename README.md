# Projeto Reviva — API

Backend em Node.js/Express do [Projeto Reviva](https://projetoreviva.vercel.app). Recebe as inscrições enviadas pelo formulário do site e autentica os colaboradores que acessam o painel administrativo.

## Stack

- **Node.js + Express** — API REST
- **PostgreSQL** (via [`pg`](https://node-postgres.com/)) — banco de dados
- **JWT** (`jsonwebtoken`) — autenticação dos colaboradores
- **bcrypt** (`bcryptjs`) — hash de senha
- **express-rate-limit** — proteção contra spam/força bruta

## Estrutura

```
src/
├── server.js              → ponto de entrada, monta o Express e as rotas
├── config/db.js           → pool de conexão com o Postgres
├── controllers/
│   ├── authController.js       → login e verificação de sessão
│   └── inscricoesController.js → criar / listar / atualizar inscrições
├── middleware/
│   ├── auth.js             → valida o JWT nas rotas protegidas
│   └── rateLimiters.js     → limita tentativas de login e envios de formulário
├── routes/
│   ├── auth.js
│   └── inscricoes.js
└── db/
    ├── schema.sql           → criação das tabelas
    ├── migrate.js           → aplica o schema.sql no banco
    └── seedColaborador.js   → cria/atualiza um login de colaborador
```

## Rodando localmente

### 1. Pré-requisitos
- Node.js 18+
- Um banco Postgres — mais fácil usar o **Postgres do Supabase** (você já tem/vai criar um projeto Supabase pro Projeto Reviva de qualquer forma): Project Settings → Database → Connection string → URI.

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Edite o `.env` e preencha `DATABASE_URL` com a connection string do seu Postgres, e gere um `JWT_SECRET` forte:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Criar as tabelas
```bash
npm run migrate
```

### 5. Criar o primeiro colaborador (pra poder logar no painel)
```bash
npm run seed:colaborador -- "Seu Nome" "seu@email.com" "umaSenhaForte123"
```

### 6. Subir a API
```bash
npm run dev
```
A API sobe em `http://localhost:3333`.

## Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/inscricoes` | público | Cria uma inscrição (usado pelo formulário do site) |
| `GET` | `/api/inscricoes` | colaborador | Lista as inscrições (aceita `?status=pendente`) |
| `PATCH` | `/api/inscricoes/:id` | colaborador | Atualiza o status de uma inscrição |
| `POST` | `/api/auth/login` | público | Login do colaborador, retorna um JWT |
| `GET` | `/api/auth/me` | colaborador | Confirma se o token ainda é válido |

Rotas de colaborador exigem o header `Authorization: Bearer <token>`.

### Exemplo — criar inscrição
```bash
curl -X POST http://localhost:3333/api/inscricoes \
  -H "Content-Type: application/json" \
  -d '{"nome_crianca":"Maria","idade":9,"nome_responsavel":"Ana","telefone_whatsapp":"85999999999"}'
```

### Exemplo — login
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","senha":"umaSenhaForte123"}'
```

## Deploy (recomendado: Render)

O site principal continua estático no Vercel — só a API precisa de um lugar que rode Node.js o tempo todo (o Vercel free tier é voltado a funções serverless, então pra um Express "tradicional" o [Render](https://render.com) é mais direto e tem plano free):

1. Suba este repositório no GitHub (separado do repositório do site).
2. No Render: **New → Web Service** → conecte o repositório.
3. Build command: `npm install` — Start command: `npm start`.
4. Em **Environment**, adicione as mesmas variáveis do `.env` (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_ORIGIN`).
5. Depois do primeiro deploy, rode as migrations uma vez (Render tem uma aba "Shell" no painel do serviço): `npm run migrate` e `npm run seed:colaborador -- "Nome" "email" "senha"`.
6. Copie a URL pública que o Render gerar (algo como `https://reviva-backend.onrender.com`) — ela vai no `API_BASE_URL` do frontend (`app.js` do site).

> Observação: no plano free do Render, o serviço "dorme" depois de um tempo sem uso e demora alguns segundos pra acordar na primeira requisição — normal para um projeto desse porte, sem custo.

## Segurança

- Senhas nunca são guardadas em texto puro — só o hash (bcrypt).
- O JWT expira sozinho (padrão 8h) — colaborador precisa logar de novo depois disso.
- Rate limit no login (10 tentativas / 15 min) e no formulário público (5 envios / hora por IP).
- CORS restrito à origem configurada em `FRONTEND_ORIGIN` — nenhum outro site consegue chamar a API do navegador.
- Este repositório não guarda dados pessoais no código — tudo fica só no banco.
