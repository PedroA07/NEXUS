# Papéis de Equipe, Visibilidade de Valores e Edição de Perfil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um papel `funcionario` (quase todas as capacidades de admin, exceto
gerenciar acessos), controle por pessoa de quem vê valores financeiros no painel, e uma
página `/conta` para qualquer usuário logado editar nome/telefone/empresa.

**Architecture:** Uma nova migration adiciona o valor de enum, a coluna de visibilidade
e troca as políticas RLS de `e_admin()` para `e_equipe()` (admin OU funcionário) nas
tabelas operacionais. Server actions em `acoes.ts` seguem o padrão já usado por
`abrirProjeto` (convite por e-mail via `criarClienteAdmin()` + `inviteUserByEmail`). A
UI usa Server Components para buscar dados e Client Components com `useTransition`/
`useActionState` para as ações, replicando exatamente os padrões de
`acoes-solicitacao.tsx` e `formulario-entrar.tsx` já existentes no projeto.

**Tech Stack:** Next.js 15 (App Router, Server Actions), Supabase (Postgres + RLS +
Auth Admin API), TypeScript, Tailwind v4.

**Spec:** [docs/superpowers/specs/2026-08-28-papeis-equipe-perfil-design.md](../specs/2026-08-28-papeis-equipe-perfil-design.md)

## Global Constraints

- Este repositório não tem framework de testes automatizados configurado
  (`package.json` só tem `dev`/`build`/`start`/`lint`/`typecheck`; o próprio README
  lista "Testes automatizados" em "O que ainda não existe"). Não introduzir um
  framework de testes como parte desta mudança — isso é uma decisão separada. A
  verificação de cada task é: `npm run typecheck` (deve passar sem erro) + `npm run
  build` no fim do plano + um roteiro de verificação manual contra `npm run dev` e o
  projeto Supabase real do usuário.
- Nomes de tabelas/colunas/funções em português, seguindo o padrão de
  `supabase/migrations/0001_init.sql`.
- Toda action nova em `src/app/acoes.ts` segue o formato `Promise<Resultado>`
  (`{ ok: boolean; msg?: string; dado?: string }`), igual às existentes.
- Classes CSS: reusar exatamente as classes utilitárias já existentes no projeto
  (`cartao`, `campo`, `rotulo`, `btn-p`, `btn-s`, `selo`, `bg-erro-fundo
  border-erro/25 text-erro`, `bg-ok-fundo border-ok/25 text-ok`) — não criar novas
  classes utilitárias.

---

## Task 1: Migration — papel de equipe, visibilidade de valores e RLS

**Files:**
- Create: `supabase/migrations/0003_equipe_e_perfil.sql`

**Interfaces:**
- Produces: enum `papel_usuario` com valor `'funcionario'`; coluna `perfis.ve_valores
  boolean not null default false`; função `public.e_equipe() returns boolean` (true se
  `papel in ('admin','funcionario')`); políticas RLS de `solicitacoes`, `projetos`,
  `atualizacoes`, `mensagens`, `portfolio` usando `e_equipe()` no lugar de `e_admin()`
  para leitura/escrita geral.

- [ ] **Step 1: Escrever a migration**

```sql
-- =====================================================================
-- Nexus — papel de funcionário, visibilidade de valores, RLS de equipe
-- Rode no SQL Editor do Supabase, depois de 0001 e 0002.
-- =====================================================================

alter type papel_usuario add value if not exists 'funcionario';

alter table perfis add column if not exists ve_valores boolean not null default false;

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
```

- [ ] **Step 2: Rodar no SQL Editor do projeto Supabase real do usuário**

Cole o conteúdo inteiro no SQL Editor e rode. Resultado esperado: `Success. No rows
returned`.

**Se der erro contendo "unsafe use of new value of enum type"**: o Postgres não deixa
usar um valor de enum recém-criado na mesma transação em certas comparações. Divida o
arquivo em dois e rode em duas execuções separadas no SQL Editor (cada `Run` do SQL
Editor é a sua própria transação):
- `0003_papel_funcionario.sql`: só os dois primeiros comandos (`alter type` e `alter table`)
- `0004_rls_equipe.sql`: o resto (função `e_equipe()` e todas as políticas)

Rode o primeiro, confirme sucesso, depois rode o segundo.

- [ ] **Step 3: Confirmar visualmente**

No SQL Editor, rode `select enum_range(null::papel_usuario);` — deve retornar
`{admin,cliente,funcionario}`. Rode `select column_name from
information_schema.columns where table_name = 'perfis' and column_name =
've_valores';` — deve retornar uma linha.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0003_equipe_e_perfil.sql
git commit -m "feat: adiciona papel funcionario, ve_valores e RLS de equipe"
```

(Se você teve que dividir em dois arquivos no Step 2, adicione e commite os dois.)

---

## Task 2: Tipos e controle de acesso — `perfilAtual`, `exigirEquipe`, gate do painel

**Files:**
- Modify: `src/lib/supabase/servidor.ts`
- Modify: `src/app/acoes.ts:103-107` (função `exigirAdmin`) e todas as chamadas dela
  exceto nas ações de gestão de equipe (que virão na Task 3)
- Modify: `src/app/painel/layout.tsx`

**Interfaces:**
- Consumes: nada de tasks anteriores (a migration já rodou direto no banco).
- Produces: `perfilAtual()` retornando `papel: "admin" | "funcionario" | "cliente"` e
  `ve_valores: boolean`; nova função `exigirEquipe()` em `acoes.ts` com a mesma forma
  de `exigirAdmin()` (`async () => Perfil`, lança erro se não for admin nem funcionário).

- [ ] **Step 1: Atualizar o tipo de retorno de `perfilAtual`**

Em `src/lib/supabase/servidor.ts`, troque o `return data as {...}` final:

```ts
  return data as {
    id: string; nome: string | null; email: string | null;
    telefone: string | null; empresa: string | null;
    papel: "admin" | "funcionario" | "cliente"; ve_valores: boolean;
  } | null;
```

- [ ] **Step 2: Adicionar `exigirEquipe` em `acoes.ts`**

Logo abaixo de `exigirAdmin` (linha ~107):

```ts
async function exigirEquipe() {
  const perfil = await perfilAtual();
  if (perfil?.papel !== "admin" && perfil?.papel !== "funcionario") throw new Error("Acesso restrito.");
  return perfil;
}
```

- [ ] **Step 3: Trocar `exigirAdmin()` por `exigirEquipe()` nas ações operacionais**

Em `src/app/acoes.ts`, troque a chamada (não a definição) dentro de cada uma destas
funções — `mudarStatusSolicitacao`, `salvarObservacoes`, `abrirProjeto`,
`mudarStatusProjeto`, e a linha `const perfil = await exigirAdmin();` dentro de
`publicarAtualizacao` vira `const perfil = await exigirEquipe();`. Não mexa em mais
nada dessas funções. `exigirAdmin()` continua existindo (vai ser usada pela Task 3).

- [ ] **Step 4: Ajustar o gate de acesso do painel**

Em `src/app/painel/layout.tsx`, troque:

```ts
  if (perfil.papel !== "admin") redirect("/portal");
```

por:

```ts
  if (perfil.papel === "cliente") redirect("/portal");
```

- [ ] **Step 5: Verificar tipos**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 6: Verificação manual**

Com `npm run dev` rodando e logado como o admin que você já criou: entre em
`/painel` e confirme que continua acessando normalmente (nada deve ter mudado
visualmente ainda).

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase/servidor.ts src/app/acoes.ts src/app/painel/layout.tsx
git commit -m "feat: reconhece papel funcionario no controle de acesso"
```

---

## Task 3: Página `/painel/equipe` — convidar, listar, remover

**Files:**
- Create: `src/components/equipe.tsx`
- Create: `src/app/painel/equipe/page.tsx`
- Modify: `src/app/acoes.ts` (novas actions `convidarMembroEquipe`, `removerAcessoEquipe`)
- Modify: `src/app/painel/layout.tsx` (link "Equipe" no menu, só para admin)

**Interfaces:**
- Consumes: `exigirAdmin()`, `criarClienteAdmin()`, `criarClienteServidor()`, tipo
  `Resultado` (já existentes em `acoes.ts`).
- Produces: `type Papel = "admin" | "funcionario"`; `convidarMembroEquipe(dados: {
  email: string; nome: string; papel: Papel; veValores: boolean }): Promise<Resultado>`;
  `removerAcessoEquipe(perfilId: string): Promise<Resultado>`; componente `<Equipe
  membros={...} idAtual={...} />`.

- [ ] **Step 1: Adicionar as duas server actions em `acoes.ts`**

Logo depois de `mudarStatusProjeto` (antes da seção `/* chat */`):

```ts
/* ------------------------------------------------------------------ */
/* equipe                                                              */
/* ------------------------------------------------------------------ */

export type Papel = "admin" | "funcionario";

export async function convidarMembroEquipe(dados: {
  email: string; nome: string; papel: Papel; veValores: boolean;
}): Promise<Resultado> {
  await exigirAdmin();
  const email = dados.email.trim().toLowerCase();
  const nome = dados.nome.trim();
  if (!email) return { ok: false, msg: "Informe um e-mail." };

  const admin = criarClienteAdmin();
  if (!admin) return { ok: false, msg: "Defina SUPABASE_SERVICE_ROLE_KEY para convidar." };

  const { data: existente } = await admin
    .from("perfis").select("id").eq("email", email).maybeSingle();

  let perfilId = existente?.id as string | undefined;

  if (!perfilId) {
    const { data: convite, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/entrar`,
    });
    if (error || !convite?.user) return { ok: false, msg: "Não consegui convidar: " + (error?.message ?? "") };
    perfilId = convite.user.id;
  }

  const { error: e2 } = await admin
    .from("perfis")
    .update({ nome, papel: dados.papel, ve_valores: dados.veValores })
    .eq("id", perfilId);
  if (e2) return { ok: false, msg: e2.message };

  revalidatePath("/painel/equipe");
  return { ok: true };
}

export async function removerAcessoEquipe(perfilId: string): Promise<Resultado> {
  const eu = await exigirAdmin();
  if (perfilId === eu.id) return { ok: false, msg: "Você não pode remover o próprio acesso." };

  const sb = await criarClienteServidor();

  const { data: alvo } = await sb.from("perfis").select("papel").eq("id", perfilId).single();
  if (alvo?.papel === "admin") {
    const { count } = await sb
      .from("perfis")
      .select("id", { count: "exact", head: true })
      .eq("papel", "admin");
    if ((count ?? 0) <= 1) return { ok: false, msg: "Não é possível remover o último admin." };
  }

  const { error } = await sb
    .from("perfis")
    .update({ papel: "cliente", ve_valores: false })
    .eq("id", perfilId);
  if (error) return { ok: false, msg: error.message };

  revalidatePath("/painel/equipe");
  return { ok: true };
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit das actions**

```bash
git add src/app/acoes.ts
git commit -m "feat: actions para convidar e remover acesso de equipe"
```

- [ ] **Step 4: Criar o componente `Equipe`**

Create `src/components/equipe.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convidarMembroEquipe, removerAcessoEquipe, type Papel } from "@/app/acoes";

type Membro = { id: string; nome: string | null; email: string | null; papel: string; ve_valores: boolean };

const ROTULO_PAPEL: Record<string, string> = { admin: "Admin", funcionario: "Funcionário" };

export function Equipe({ membros, idAtual }: { membros: Membro[]; idAtual: string }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [form, setForm] = useState({ email: "", nome: "", papel: "funcionario" as Papel, veValores: false });
  const [aviso, setAviso] = useState("");

  const convidar = () =>
    iniciar(async () => {
      setAviso("");
      const r = await convidarMembroEquipe(form);
      if (!r.ok) return setAviso(r.msg || "Não consegui convidar.");
      setForm({ email: "", nome: "", papel: "funcionario", veValores: false });
      router.refresh();
    });

  const remover = (id: string) =>
    iniciar(async () => {
      setAviso("");
      const r = await removerAcessoEquipe(id);
      if (!r.ok) setAviso(r.msg || "Não consegui remover.");
      router.refresh();
    });

  return (
    <>
      <div className="mt-8 cartao overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-linha">
              {["Nome", "E-mail", "Papel", "Vê valores", ""].map((h) => (
                <th key={h} className="text-left font-mono text-[10.5px] tracking-widest uppercase text-suave font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {membros.map((m) => (
              <tr key={m.id} className="border-b border-linha last:border-0">
                <td className="px-4 py-3 font-semibold">{m.nome || "—"}</td>
                <td className="px-4 py-3 text-tinta2">{m.email}</td>
                <td className="px-4 py-3">{ROTULO_PAPEL[m.papel] ?? m.papel}</td>
                <td className="px-4 py-3">{m.papel === "admin" || m.ve_valores ? "Sim" : "Não"}</td>
                <td className="px-4 py-3 text-right">
                  {m.id !== idAtual && (
                    <button onClick={() => remover(m.id)} disabled={pendente}
                            className="text-[13.5px] text-suave hover:text-erro disabled:opacity-60">
                      Remover acesso
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cartao p-6 mt-6">
        <h2 className="text-xl font-bold">Convidar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className="rotulo text-[14px]">E-mail</label>
            <input className="campo" type="email" value={form.email}
                   onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <label className="rotulo text-[14px]">Nome</label>
            <input className="campo" value={form.nome}
                   onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <label className="rotulo text-[14px]">Papel</label>
            <select className="campo" value={form.papel}
                    onChange={(e) => setForm({ ...form, papel: e.target.value as Papel })}>
              <option value="funcionario">Funcionário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-[14px] text-tinta2 mt-6">
            <input type="checkbox" checked={form.veValores}
                   onChange={(e) => setForm({ ...form, veValores: e.target.checked })} />
            Pode ver valores
          </label>
        </div>
        {aviso && (
          <p className="mt-4 rounded-xl bg-erro-fundo border border-erro/25 p-3 text-[14px] font-semibold text-erro">{aviso}</p>
        )}
        <button onClick={convidar} disabled={pendente} className="btn-p mt-5 disabled:opacity-60">
          {pendente ? "Convidando…" : "Convidar"}
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Criar a página `/painel/equipe`**

Create `src/app/painel/equipe/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { criarClienteServidor, perfilAtual } from "@/lib/supabase/servidor";
import { Equipe } from "@/components/equipe";

export const metadata = { title: "Equipe" };

export default async function PainelEquipe() {
  const perfil = await perfilAtual();
  if (perfil?.papel !== "admin") redirect("/painel");

  const sb = await criarClienteServidor();
  const { data: membros } = await sb
    .from("perfis")
    .select("id,nome,email,papel,ve_valores")
    .in("papel", ["admin", "funcionario"])
    .order("papel")
    .order("nome");

  return (
    <>
      <p className="olho">Painel interno</p>
      <h1 className="mt-2 text-3xl font-bold">Equipe</h1>
      <p className="mt-2 text-[15px] text-suave max-w-2xl">
        Quem tem acesso ao painel. Funcionários enxergam solicitações e projetos como
        admin, exceto gerenciar quem tem acesso.
      </p>
      <Equipe membros={membros ?? []} idAtual={perfil.id} />
    </>
  );
}
```

- [ ] **Step 6: Adicionar o link "Equipe" ao menu do painel**

Em `src/app/painel/layout.tsx`, dentro do `<nav>`, adicione o link condicionalmente
antes de "Ver o site":

```tsx
            <Link href="/painel" className="hover:text-acento">Solicitações</Link>
            {perfil.papel === "admin" && (
              <Link href="/painel/equipe" className="hover:text-acento">Equipe</Link>
            )}
            <Link href="/" className="hover:text-acento">Ver o site</Link>
```

- [ ] **Step 7: Verificar tipos**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 8: Verificação manual**

Com `npm run dev`, logado como admin: acesse `/painel/equipe`, confirme que aparece
você na lista como Admin. Convide um segundo e-mail seu (ou um e-mail de teste) como
Funcionário com "Pode ver valores" desmarcado, confirme que aparece na lista. Tente
acessar `/painel/equipe` logado como o funcionário recém-criado (depois de definir
senha pelo link de convite) — deve dar redirect para `/painel` (não é admin). Teste o
botão "Remover acesso" nesse funcionário de teste e confirme que ele some da lista.

- [ ] **Step 9: Commit**

```bash
git add src/components/equipe.tsx src/app/painel/equipe/page.tsx src/app/painel/layout.tsx
git commit -m "feat: pagina /painel/equipe para convidar e remover acesso"
```

---

## Task 4: Esconder valores de quem não pode ver

**Files:**
- Modify: `src/app/painel/page.tsx`
- Modify: `src/app/painel/[id]/page.tsx`
- Modify: `src/components/acoes-solicitacao.tsx`

**Interfaces:**
- Consumes: `perfilAtual()` retornando `ve_valores` (Task 2).
- Produces: prop nova `podeVerValores: boolean` em `<AcoesSolicitacao>`.

- [ ] **Step 1: Calcular `podeVerValores` em `painel/page.tsx`**

Troque o import:

```ts
import { criarClienteServidor, perfilAtual } from "@/lib/supabase/servidor";
```

E troque a primeira linha do corpo da função `Painel` (`const sb = await
criarClienteServidor();`) por estas três linhas, na ordem:

```ts
export default async function Painel() {
  const perfil = await perfilAtual();
  const podeVerValores = perfil?.papel === "admin" || !!perfil?.ve_valores;
  const sb = await criarClienteServidor();
```

- [ ] **Step 2: Esconder "Carteira fechada" e ajustar o grid**

Troque o array de indicadores e o grid:

```tsx
      <div className={`mt-7 grid gap-3 ${podeVerValores ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {(
          podeVerValores
            ? [
                ["Novas para analisar", String(novas), novas > 0 ? "precisa de resposta" : "tudo em dia"],
                ["Projetos em andamento", String(emAndamento), "com cliente ativo"],
                ["Carteira fechada", brl(carteira), "soma dos projetos abertos"],
              ]
            : [
                ["Novas para analisar", String(novas), novas > 0 ? "precisa de resposta" : "tudo em dia"],
                ["Projetos em andamento", String(emAndamento), "com cliente ativo"],
              ]
        ).map(([r, v, o], i) => (
```

(o resto do `.map` continua igual)

- [ ] **Step 3: Esconder a coluna "Estimativa" da tabela**

No cabeçalho da tabela:

```tsx
                {["Código", "Cliente", "Tipo", ...(podeVerValores ? ["Estimativa"] : []), "Status", "Recebida"].map((h) => (
```

No corpo, envolva o `<td>` de estimativa em uma condicional:

```tsx
                    {podeVerValores && (
                      <td className="px-4 py-3 tabular-nums font-mono text-[12.5px]">
                        {est?.total ? (
                          <>
                            {brl(est.total)}
                            <span className="block text-suave">{est.semanas} sem</span>
                          </>
                        ) : "—"}
                      </td>
                    )}
```

- [ ] **Step 4: Esconder o valor nos cards de projeto**

```tsx
                <p className="mt-3 text-[13px] text-suave">
                  {podeVerValores && p.valor_fechado ? `${brl(Number(p.valor_fechado))} · ` : ""}
                  entrega {dataCurta(p.entrega_prevista)}
                </p>
```

- [ ] **Step 5: Esconder o bloco de estimativa em `painel/[id]/page.tsx`**

Importe `perfilAtual` e calcule a mesma flag no topo da função `DetalheSolicitacao`:

```ts
import { criarClienteServidor, perfilAtual } from "@/lib/supabase/servidor";
```

```ts
  const { id } = await params;
  const perfil = await perfilAtual();
  const podeVerValores = perfil?.papel === "admin" || !!perfil?.ve_valores;
  const sb = await criarClienteServidor();
```

Envolva a seção inteira do bloco de estimativa:

```tsx
      {podeVerValores && est && (
        <section className="cartao p-6 mt-7">
          {/* ... conteúdo existente sem mudança ... */}
        </section>
      )}
```

(troque só a condição `{est && (` por `{podeVerValores && est && (`, o resto do bloco
não muda)

- [ ] **Step 6: Passar `podeVerValores` para `AcoesSolicitacao`**

No fim do arquivo, no uso do componente:

```tsx
      <AcoesSolicitacao
        id={s.id}
        status={s.status}
        observacoes={s.observacoes_internas ?? ""}
        podeVerValores={podeVerValores}
        sugestao={{
```

- [ ] **Step 7: Esconder o campo de valor em `acoes-solicitacao.tsx`**

Adicione a prop e ajuste o estado inicial e o campo:

```tsx
export function AcoesSolicitacao({
  id,
  status,
  observacoes,
  sugestao,
  podeVerValores,
}: {
  id: string;
  status: string;
  observacoes: string;
  sugestao: { nome: string; valor: number; prazoSemanas: number; inicio: string; entrega: string };
  podeVerValores: boolean;
}) {
```

```tsx
  const [form, setForm] = useState(podeVerValores ? sugestao : { ...sugestao, valor: 0 });
```

E o campo de valor:

```tsx
              <div className="grid gap-1.5">
                <label className="rotulo text-[14px]">Valor fechado (R$)</label>
                {podeVerValores ? (
                  <input className="campo font-mono" type="number" min={0} value={form.valor}
                         onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} />
                ) : (
                  <input className="campo font-mono opacity-60" disabled placeholder="peça a um admin para preencher" />
                )}
              </div>
```

- [ ] **Step 8: Verificar tipos**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 9: Verificação manual**

Logado como o funcionário de teste (`ve_valores = false`): confirme em `/painel` que
não aparece "Carteira fechada" nem coluna "Estimativa"; confirme em `/painel/[id]` de
uma solicitação que o bloco "Estimativa automática" não aparece, e que ao abrir "Virar
projeto" o campo de valor vem desabilitado. Depois, marque `ve_valores = true` para
esse funcionário em `/painel/equipe` (edite convidando de novo com o checkbox
marcado, ou rode o UPDATE direto no SQL Editor) e confirme que tudo volta a aparecer.

- [ ] **Step 10: Commit**

```bash
git add src/app/painel/page.tsx src/app/painel/[id]/page.tsx src/components/acoes-solicitacao.tsx
git commit -m "feat: esconde valores financeiros de quem nao tem ve_valores"
```

---

## Task 5: Página `/conta` — editar nome, telefone e empresa

**Files:**
- Modify: `src/middleware.ts`
- Modify: `src/app/acoes.ts` (nova action `atualizarPerfil`)
- Create: `src/components/formulario-conta.tsx`
- Create: `src/app/conta/page.tsx`
- Modify: `src/app/painel/layout.tsx` (nome vira link)
- Modify: `src/app/portal/page.tsx` (nome vira link)

**Interfaces:**
- Consumes: `perfilAtual()`, `criarClienteServidor()`, tipo `Resultado` (existentes).
- Produces: `atualizarPerfil(dados: { nome: string; telefone: string; empresa: string
  }): Promise<Resultado>`; componente `<FormularioConta perfil={...} />`.

- [ ] **Step 1: Proteger a rota `/conta` no middleware**

Em `src/middleware.ts`, troque:

```ts
  const protegida = ["/painel", "/portal"].some((p) => request.nextUrl.pathname.startsWith(p));
```

por:

```ts
  const protegida = ["/painel", "/portal", "/conta"].some((p) => request.nextUrl.pathname.startsWith(p));
```

- [ ] **Step 2: Adicionar a action `atualizarPerfil`**

Em `src/app/acoes.ts`, no fim da seção "equipe" (depois de `removerAcessoEquipe`):

```ts
export async function atualizarPerfil(dados: {
  nome: string; telefone: string; empresa: string;
}): Promise<Resultado> {
  const perfil = await perfilAtual();
  if (!perfil) return { ok: false, msg: "Entre para editar seus dados." };

  const nome = dados.nome.trim();
  if (!nome) return { ok: false, msg: "Nome é obrigatório." };

  const sb = await criarClienteServidor();
  const { error } = await sb
    .from("perfis")
    .update({
      nome,
      telefone: dados.telefone.trim() || null,
      empresa: dados.empresa.trim() || null,
    })
    .eq("id", perfil.id);
  if (error) return { ok: false, msg: error.message };

  revalidatePath("/conta");
  revalidatePath("/painel");
  revalidatePath("/portal");
  return { ok: true, msg: "Dados atualizados." };
}
```

- [ ] **Step 3: Criar o formulário**

Create `src/components/formulario-conta.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { atualizarPerfil, type Resultado } from "@/app/acoes";

type Perfil = { nome: string | null; telefone: string | null; empresa: string | null };

export function FormularioConta({ perfil }: { perfil: Perfil }) {
  const [estado, acao, pendente] = useActionState<Resultado | null, FormData>(
    async (_estadoAnterior, form) =>
      atualizarPerfil({
        nome: String(form.get("nome") || ""),
        telefone: String(form.get("telefone") || ""),
        empresa: String(form.get("empresa") || ""),
      }),
    null,
  );

  return (
    <form action={acao} className="mt-8 grid gap-4 max-w-md">
      <div className="grid gap-1.5">
        <label htmlFor="nome" className="rotulo text-[14.5px]">Nome</label>
        <input id="nome" name="nome" defaultValue={perfil.nome ?? ""} required className="campo" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="telefone" className="rotulo text-[14.5px]">Telefone</label>
        <input id="telefone" name="telefone" defaultValue={perfil.telefone ?? ""} className="campo" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="empresa" className="rotulo text-[14.5px]">Empresa</label>
        <input id="empresa" name="empresa" defaultValue={perfil.empresa ?? ""} className="campo" />
      </div>
      {estado && (
        <p className={
          estado.ok
            ? "rounded-xl bg-ok-fundo border border-ok/25 p-3 text-[14px] font-semibold text-ok"
            : "rounded-xl bg-erro-fundo border border-erro/25 p-3 text-[14px] font-semibold text-erro"
        }>
          {estado.msg}
        </p>
      )}
      <button className="btn-p mt-1 disabled:opacity-60" disabled={pendente}>
        {pendente ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Criar a página `/conta`**

Create `src/app/conta/page.tsx`:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Marca } from "@/components/marca";
import { perfilAtual } from "@/lib/supabase/servidor";
import { sair } from "@/app/acoes";
import { FormularioConta } from "@/components/formulario-conta";

export const metadata = { title: "Minha conta" };

export default async function Conta() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/entrar");

  const voltar = perfil.papel === "cliente" ? "/portal" : "/painel";

  return (
    <>
      <header className="sticky top-0 z-40 bg-papel/90 backdrop-blur border-b border-linha">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href="/"><Marca /></Link>
          <div className="flex-1" />
          <Link href={voltar} className="text-[14px] text-suave hover:text-acento">Voltar</Link>
          <form action={sair}><button className="text-[14px] text-suave hover:text-erro">Sair</button></form>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold">Minha conta</h1>
        <p className="mt-2 text-[15px] text-suave">{perfil.email}</p>
        <FormularioConta perfil={perfil} />
      </main>
    </>
  );
}
```

- [ ] **Step 5: Linkar o nome no cabeçalho do painel**

Em `src/app/painel/layout.tsx`, troque:

```tsx
          <span className="hidden sm:block text-[13.5px] text-suave">{perfil.nome || perfil.email}</span>
```

por:

```tsx
          <Link href="/conta" className="hidden sm:block text-[13.5px] text-suave hover:text-acento">
            {perfil.nome || perfil.email}
          </Link>
```

- [ ] **Step 6: Linkar o nome no cabeçalho do portal**

Em `src/app/portal/page.tsx`, troque:

```tsx
          <span className="hidden sm:block text-[13.5px] text-suave">{perfil.nome || perfil.email}</span>
```

por:

```tsx
          <Link href="/conta" className="hidden sm:block text-[13.5px] text-suave hover:text-acento">
            {perfil.nome || perfil.email}
          </Link>
```

- [ ] **Step 7: Verificar tipos**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 8: Verificação manual**

Com `npm run dev`: logado como cliente, clique no seu nome no cabeçalho do `/portal`,
confirme que abre `/conta` com os dados atuais preenchidos, mude o telefone, salve,
confirme a mensagem de sucesso e que o dado persiste ao recarregar. Repita logado como
admin a partir do `/painel`. Tente acessar `/conta` deslogado — deve redirecionar para
`/entrar`.

- [ ] **Step 9: Commit**

```bash
git add src/middleware.ts src/app/acoes.ts src/components/formulario-conta.tsx src/app/conta/page.tsx src/app/painel/layout.tsx src/app/portal/page.tsx
git commit -m "feat: pagina /conta para editar nome, telefone e empresa"
```

---

## Task 6: Verificação final

- [ ] **Step 1: Build de produção**

Run: `npm run build`
Expected: build completo sem erros (mesmas 10 rotas de antes + `/painel/equipe` e `/conta`).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 3: Roteiro manual completo**

Repetir, em sequência, contra o `npm run dev` (ou o deploy depois do push):
1. Admin convida um funcionário sem `ve_valores` → funcionário loga → vê `/painel` sem
   nenhum valor financeiro, não vê o link "Equipe", não consegue abrir `/painel/equipe`
   direto pela URL (redireciona).
2. Admin marca `ve_valores` desse funcionário (via `/painel/equipe`, convidando de
   novo com o checkbox marcado) → funcionário loga de novo → agora vê os valores.
3. Admin remove o acesso do funcionário → ele passa a cair em `/portal` como cliente
   comum ao logar.
4. Admin tenta remover o próprio acesso e tenta remover o último admin restante →
   ambos bloqueados com mensagem de erro clara.
5. Cliente, funcionário e admin editam nome/telefone/empresa em `/conta` e confirmam
   que salva.

- [ ] **Step 4: Push**

```bash
git push
```

(dispara o deploy automático na Vercel — confirme o resultado com
`get_deployment`/`get_deployment_build_logs` antes de considerar concluído.)
