-- =====================================================================
-- Nexus — papel de funcionário, visibilidade de valores, RLS de equipe
-- Rode no SQL Editor do Supabase, depois de 0001 e 0002.
-- =====================================================================

-- quem é admin OU funcionário (acesso operacional amplo)
create or replace function public.e_equipe()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and papel in ('admin', 'funcionario'));
$$;

-- solicitações
drop policy if exists solicitacoes_ler on solicitacoes;
create policy solicitacoes_ler on solicitacoes for select
  using (public.e_equipe() or cliente_id = auth.uid());

drop policy if exists solicitacoes_atualizar on solicitacoes;
create policy solicitacoes_atualizar on solicitacoes for update
  using (public.e_equipe());

-- projetos
drop policy if exists projetos_ler on projetos;
create policy projetos_ler on projetos for select
  using (public.e_equipe() or cliente_id = auth.uid());

drop policy if exists projetos_escrever on projetos;
create policy projetos_escrever on projetos for all
  using (public.e_equipe()) with check (public.e_equipe());

-- atualizações
drop policy if exists atualizacoes_ler on atualizacoes;
create policy atualizacoes_ler on atualizacoes for select
  using (
    public.e_equipe() or exists (
      select 1 from projetos p where p.id = projeto_id and p.cliente_id = auth.uid()
    )
  );

drop policy if exists atualizacoes_escrever on atualizacoes;
create policy atualizacoes_escrever on atualizacoes for all
  using (public.e_equipe()) with check (public.e_equipe());

-- mensagens
drop policy if exists mensagens_ler on mensagens;
create policy mensagens_ler on mensagens for select
  using (
    public.e_equipe() or exists (
      select 1 from projetos p where p.id = projeto_id and p.cliente_id = auth.uid()
    )
  );

drop policy if exists mensagens_enviar on mensagens;
create policy mensagens_enviar on mensagens for insert
  with check (
    autor_id = auth.uid() and (
      public.e_equipe() or exists (
        select 1 from projetos p where p.id = projeto_id and p.cliente_id = auth.uid()
      )
    )
  );

-- portfólio
drop policy if exists portfolio_publico on portfolio;
create policy portfolio_publico on portfolio for select
  using (publicado or public.e_equipe());

drop policy if exists portfolio_escrever on portfolio;
create policy portfolio_escrever on portfolio for all
  using (public.e_equipe()) with check (public.e_equipe());
