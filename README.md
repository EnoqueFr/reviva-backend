# Projeto Reviva — API

API REST em Node.js/Express que recebe inscrições e autentica colaboradores do [Projeto Reviva](https://projetoreviva.vercel.app).

🔗 **[reviva-backend.vercel.app](https://reviva-backend.vercel.app)**

---

## Funcionalidades

- Recebimento público de inscrições (formulário do site)
- Autenticação de colaboradores via JWT
- Listagem e atualização de status das inscrições (rota protegida)
- Rate limiting básico contra spam e força bruta

## Stack

- **Node.js + Express**
- **PostgreSQL** (via [`pg`](https://node-postgres.com/))
- **JWT** (`jsonwebtoken`) + **bcrypt** (`bcryptjs`) para autenticação
- Deploy: Vercel (Serverless Functions)

## Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/inscricoes` | público | Cria uma inscrição |
| `GET` | `/api/inscricoes` | colaborador | Lista inscrições (`?status=pendente`) |
| `PATCH` | `/api/inscricoes/:id` | colaborador | Atualiza status |
| `POST` | `/api/auth/login` | público | Login, retorna JWT |
| `GET` | `/api/auth/me` | colaborador | Valida sessão |

Rotas de colaborador exigem `Authorization: Bearer <token>`.

## Estrutura

```
src/
├── app.js              → configuração do Express (rotas, middlewares)
├── server.js            → entrypoint local (dev/Render)
├── config/db.js         → pool de conexão Postgres
├── controllers/
├── middleware/          → auth (JWT) e rate limiting
├── routes/
└── db/
    ├── schema.sql
    ├── migrate.js
    └── seedColaborador.js
api/
└── index.js              → entrypoint serverless (Vercel)
```

## Rodando localmente

```bash
git clone https://github.com/EnoqueFr/reviva-backend.git
cd reviva-backend
npm install
cp .env.example .env   # preencher DATABASE_URL e JWT_SECRET
npm run migrate
npm run seed:colaborador -- "Nome" "email@exemplo.com" "senha123"
npm run dev
```

## Deploy

Configurado para **Vercel** (Serverless Functions) via `vercel.json`, com `api/index.js` como entrypoint e `src/server.js` reservado a execução local ou em servidores tradicionais (Render, Railway).

Variáveis de ambiente necessárias em produção: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_ORIGIN`.

## Segurança

- Senhas com hash bcrypt — nunca texto puro
- JWT com expiração (padrão 8h)
- Rate limit: 5 inscrições/hora por IP, 10 tentativas de login/15min
- CORS restrito à origem configurada em `FRONTEND_ORIGIN`

## LGPD

- **Minimização:** apenas os 4 campos necessários para a matrícula (nome, idade, responsável, WhatsApp) — nenhum dado sensível
- **Acesso restrito:** leitura só via rota autenticada
- **Sem exposição em logs:** erros logados não incluem corpo da requisição
- **Exclusão sob pedido:** manual, via banco, mediante solicitação do responsável

## Licença

Projeto social sem fins lucrativos. Código aberto para fins de portfólio.
