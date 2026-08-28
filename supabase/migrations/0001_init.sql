-- =====================================================================
-- Nexus — esquema inicial
-- Rode no SQL Editor do Supabase, ou com: supabase db push
-- =====================================================================

create extension if not exists "pgcrypto";

-- ------------------------- tipos -------------------------
do $$ begin
  create type papel_usuario as enum ('admin', 'cliente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_solicitacao as enum ('nova','em_analise','aprovada','recusada','convertida');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_projeto as enum ('planejamento','em_andamento','em_revisao','pausado','concluido','cancelado');
exception when duplicate_object then null; end $$;

-- ------------------------- perfis -------------------------
create table if not exists perfis (
  id         uuid primary key references auth.users on delete cascade,
  nome       text,
  email      text,
  telefone   text,
  empresa    text,
  papel      papel_usuario not null default 'cliente',
  criado_em  timestamptz not null default now()
);

-- cria o perfil automaticamente quando alguém se cadastra
create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into perfis (id, email, nome, telefone, empresa)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'empresa'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- quem é admin? (usada nas policies; security definer evita recursão de RLS)
create or replace function public.e_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and papel = 'admin');
$$;

-- ------------------------- solicitações -------------------------
create table if not exists solicitacoes (
  id                  uuid primary key default gen_random_uuid(),
  codigo              text unique not null,
  modo                text not null default 'completo',   -- rapido | completo
  nome                text not null,
  empresa             text,
  whatsapp            text,
  email               text,
  respostas           jsonb not null default '{}'::jsonb,
  resumo              text,
  estimativa          jsonb,
  status              status_solicitacao not null default 'nova',
  observacoes_internas text,
  cliente_id          uuid references perfis(id) on delete set null,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);
create index if not exists idx_solicitacoes_status on solicitacoes (status, criado_em desc);
create index if not exists idx_solicitacoes_cliente on solicitacoes (cliente_id);

-- código legível: NX-2608-4F2A
create or replace function public.gerar_codigo_solicitacao()
returns trigger language plpgsql as $$
begin
  if new.codigo is null or new.codigo = '' then
    new.codigo := 'NX-' || to_char(now(), 'DDMM') || '-' || upper(substr(md5(random()::text), 1, 4));
  end if;
  return new;
end $$;

drop trigger if exists ao_inserir_solicitacao on solicitacoes;
create trigger ao_inserir_solicitacao
  before insert on solicitacoes
  for each row execute function public.gerar_codigo_solicitacao();

-- ------------------------- projetos -------------------------
create table if not exists projetos (
  id               uuid primary key default gen_random_uuid(),
  solicitacao_id   uuid references solicitacoes(id) on delete set null,
  cliente_id       uuid not null references perfis(id) on delete cascade,
  nome             text not null,
  descricao        text,
  status           status_projeto not null default 'planejamento',
  progresso        int not null default 0 check (progresso between 0 and 100),
  valor_fechado    numeric(12,2),
  prazo_semanas    int,
  inicio           date,
  entrega_prevista date,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);
create index if not exists idx_projetos_cliente on projetos (cliente_id, criado_em desc);

-- ------------------------- atualizações -------------------------
create table if not exists atualizacoes (
  id         uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references projetos(id) on delete cascade,
  autor_id   uuid references perfis(id) on delete set null,
  titulo     text not null,
  corpo      text,
  fase       text,
  progresso  int check (progresso between 0 and 100),
  criado_em  timestamptz not null default now()
);
create index if not exists idx_atualizacoes_projeto on atualizacoes (projeto_id, criado_em desc);

-- ------------------------- mensagens (chat) -------------------------
create table if not exists mensagens (
  id         uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references projetos(id) on delete cascade,
  autor_id   uuid not null references perfis(id) on delete cascade,
  corpo      text not null check (length(trim(corpo)) > 0),
  criado_em  timestamptz not null default now()
);
create index if not exists idx_mensagens_projeto on mensagens (projeto_id, criado_em);

-- ------------------------- portfólio -------------------------
create table if not exists portfolio (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  titulo     text not null,
  resumo     text,
  descricao  text,
  categoria  text,
  stack      text[] default '{}',
  ano        int,
  destaque   boolean not null default false,
  imagem_url text,
  link       text,
  ordem      int not null default 0,
  publicado  boolean not null default true
);

-- =====================================================================
-- RLS
-- =====================================================================
alter table perfis        enable row level security;
alter table solicitacoes  enable row level security;
alter table projetos      enable row level security;
alter table atualizacoes  enable row level security;
alter table mensagens     enable row level security;
alter table portfolio     enable row level security;

-- perfis
drop policy if exists perfis_ler_proprio on perfis;
create policy perfis_ler_proprio on perfis for select
  using (id = auth.uid() or public.e_admin());

drop policy if exists perfis_editar_proprio on perfis;
create policy perfis_editar_proprio on perfis for update
  using (id = auth.uid() or public.e_admin());

-- solicitações: qualquer visitante pode enviar; só admin (ou o próprio cliente) lê
drop policy if exists solicitacoes_enviar on solicitacoes;
create policy solicitacoes_enviar on solicitacoes for insert
  to anon, authenticated with check (true);

drop policy if exists solicitacoes_ler on solicitacoes;
create policy solicitacoes_ler on solicitacoes for select
  using (public.e_admin() or cliente_id = auth.uid());

drop policy if exists solicitacoes_atualizar on solicitacoes;
create policy solicitacoes_atualizar on solicitacoes for update
  using (public.e_admin());

-- projetos
drop policy if exists projetos_ler on projetos;
create policy projetos_ler on projetos for select
  using (public.e_admin() or cliente_id = auth.uid());

drop policy if exists projetos_escrever on projetos;
create policy projetos_escrever on projetos for all
  using (public.e_admin()) with check (public.e_admin());

-- atualizações: participante lê, admin escreve
drop policy if exists atualizacoes_ler on atualizacoes;
create policy atualizacoes_ler on atualizacoes for select
  using (
    public.e_admin() or exists (
      select 1 from projetos p where p.id = projeto_id and p.cliente_id = auth.uid()
    )
  );

drop policy if exists atualizacoes_escrever on atualizacoes;
create policy atualizacoes_escrever on atualizacoes for all
  using (public.e_admin()) with check (public.e_admin());

-- mensagens: participante lê e escreve (como ele mesmo)
drop policy if exists mensagens_ler on mensagens;
create policy mensagens_ler on mensagens for select
  using (
    public.e_admin() or exists (
      select 1 from projetos p where p.id = projeto_id and p.cliente_id = auth.uid()
    )
  );

drop policy if exists mensagens_enviar on mensagens;
create policy mensagens_enviar on mensagens for insert
  with check (
    autor_id = auth.uid() and (
      public.e_admin() or exists (
        select 1 from projetos p where p.id = projeto_id and p.cliente_id = auth.uid()
      )
    )
  );

-- portfólio: leitura pública do que está publicado
drop policy if exists portfolio_publico on portfolio;
create policy portfolio_publico on portfolio for select
  using (publicado or public.e_admin());

drop policy if exists portfolio_escrever on portfolio;
create policy portfolio_escrever on portfolio for all
  using (public.e_admin()) with check (public.e_admin());

-- chat em tempo real
alter publication supabase_realtime add table mensagens;
alter publication supabase_realtime add table atualizacoes;
