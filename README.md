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

## Deploy (Vercel — mesma conta do site)

Como o site já está no Vercel, dá pra hospedar essa API lá também, como um **segundo projeto** (sem precisar de conta em outro lugar). O Vercel roda a API como função serverless — o arquivo `api/[...path].js` encaminha qualquer requisição em `/api/*` pro Express (`src/app.js`).

1. Suba este repositório no GitHub (separado do repositório do site).
2. No [vercel.com](https://vercel.com): **Add New → Project** → importe o repositório `reviva-backend`.
3. Framework Preset: deixa como **"Other"** (não é Next.js nem nada específico — o Vercel detecta a pasta `api/` sozinho). Não precisa configurar build command nem output directory.
4. Em **Environment Variables**, adiciona as mesmas do `.env`: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_ORIGIN` (use o domínio real do site, ex: `https://projetoreviva.vercel.app`).
5. Clica em **Deploy**. Ao terminar, você recebe uma URL tipo `https://reviva-backend.vercel.app`.
6. Rode as migrations e crie seu colaborador **localmente antes** (rodando `npm run migrate` e `npm run seed:colaborador` na sua máquina, já que eles gravam direto no banco via `DATABASE_URL` — não precisam rodar "na nuvem").
7. Copie a URL do passo 5 e cole em `API_BASE_URL` (`app.js` e `painel.js`, no repositório do site).

> **Importante sobre o banco:** como funções serverless podem rodar várias instâncias ao mesmo tempo, use a connection string do **pooler** do Supabase (a que tem `pooler.supabase.com` no meio) — é exatamente a que você já está usando, então não precisa mudar nada.

### Alternativa: Render

Se preferir um servidor "tradicional" (sempre ligado, sem cold start) em vez de serverless, o [Render](https://render.com) também funciona bem — plano free, só que "dorme" depois de um tempo sem uso:

1. New → Web Service → conecte o repositório.
2. Build command: `npm install` — Start command: `npm start` (esse comando usa `src/server.js`, que só é usado localmente/no Render, nunca no Vercel).
3. Configure as mesmas variáveis de ambiente do `.env`.
4. Rode as migrations pela aba "Shell" do painel do Render, ou local mesmo (como no passo 6 acima).

## Segurança

- Senhas nunca são guardadas em texto puro — só o hash (bcrypt).
- O JWT expira sozinho (padrão 8h) — colaborador precisa logar de novo depois disso.
- Rate limit no login (10 tentativas / 15 min) e no formulário público (5 envios / hora por IP).
- CORS restrito à origem configurada em `FRONTEND_ORIGIN` — nenhum outro site consegue chamar a API do navegador.
- Este repositório não guarda dados pessoais no código — tudo fica só no banco.
