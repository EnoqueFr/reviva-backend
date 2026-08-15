-- Schema do Projeto Reviva
-- Rode com: npm run migrate
-- (ou cole direto no SQL Editor do Supabase / do seu provedor de Postgres)

create extension if not exists pgcrypto;

create table if not exists inscricoes (
  id uuid primary key default gen_random_uuid(),
  nome_crianca text not null,
  idade int not null check (idade between 4 and 18),
  nome_responsavel text not null,
  telefone_whatsapp text not null,
  status text not null default 'pendente' check (status in ('pendente', 'contatado', 'matriculado', 'descartado')),
  created_at timestamptz not null default now()
);

create table if not exists colaboradores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  senha_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_inscricoes_created_at on inscricoes (created_at desc);
create index if not exists idx_inscricoes_status on inscricoes (status);
