-- =====================================================================
-- Nexus — papel de funcionário, visibilidade de valores, RLS de equipe
-- Rode no SQL Editor do Supabase, depois de 0001 e 0002.
-- =====================================================================

alter type papel_usuario add value if not exists 'funcionario';

alter table perfis add column if not exists ve_valores boolean not null default false;
