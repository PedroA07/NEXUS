-- =====================================================================
-- Nexus — corrige auto-promoção de papel via RLS
-- Rode no SQL Editor do Supabase, depois de 0001 e 0002.
-- =====================================================================

-- A policy perfis_editar_proprio (0001) permite "update where id = auth.uid()"
-- sem WITH CHECK — o Postgres reaproveita o USING como check, que também passa
-- pra linha nova (o id não muda). Isso deixa qualquer usuário logado alterar
-- QUALQUER coluna da própria linha, inclusive `papel`, direto pelo cliente
-- Supabase — ou seja, qualquer cliente pode se autopromover a admin.
--
-- A correção certa aqui não é reescrever a policy (RLS não restringe coluna),
-- é revogar UPDATE amplo do role `authenticated` e conceder só nas colunas que
-- o próprio usuário deve poder editar. Mudança de `papel` (e de `ve_valores`,
-- quando essa coluna existir) passa a exigir a service role.
revoke update on perfis from authenticated;
grant update (nome, telefone, empresa) on perfis to authenticated;
