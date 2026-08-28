# Papéis de equipe, visibilidade de valores e edição de perfil

Data: 2026-08-28
Status: aprovado para plano de implementação

## Contexto

O sistema só reconhece dois papéis (`admin`, `cliente`). O dono do site precisa:
1. dar acesso a funcionários, com quase todas as capacidades do admin, exceto gerenciar
   quem tem acesso;
2. controlar, por funcionário, se ele vê valores financeiros (estimativas, valor fechado,
   carteira);
3. deixar qualquer usuário logado editar os próprios dados de contato.

Fora de escopo por enquanto (anotado para não fechar portas, não implementado):
equipes por projeto (restringir cada funcionário aos projetos em que foi alocado). O
desenho abaixo não impede evoluir para isso depois — troca-se a política de RLS de
"todo `e_equipe()` vê tudo" por uma que consulta uma futura tabela `projeto_membros`,
sem mexer no resto.

## Seção 1 — Modelo de permissões (banco)

Nova migration `supabase/migrations/0003_equipe_e_perfil.sql`:

- `papel_usuario` ganha o valor `'funcionario'` (via `alter type ... add value if not exists`)
- `perfis` ganha `ve_valores boolean not null default false` — só é consultado quando
  `papel = 'funcionario'`; admin sempre vê valores independente do campo
- Nova função `public.e_equipe()` (`security definer`, mesmo padrão de `e_admin()`):
  `true` se `papel in ('admin', 'funcionario')`
- Políticas RLS de `solicitacoes`, `projetos`, `atualizacoes`, `mensagens` e `portfolio`
  trocam `public.e_admin()` por `public.e_equipe()` nos casos de leitura/escrita geral
  (mantendo as condições de "ou é o próprio cliente/participante" já existentes)
- Gestão de acesso (convidar, remover, promover) continua exigida via `e_admin()` —
  isso é reforçado na camada de aplicação (Seção 2), não no banco, porque não há tabela
  dedicada de "convites" para colocar RLS

**Risco a validar na implementação:** `ALTER TYPE ... ADD VALUE` tem restrições de uso
do valor novo dentro da mesma transação, dependendo de como o SQL Editor do Supabase
agrupa os statements. Se der erro de "unsafe use of new value", separar em duas
migrations (`0003_papel_funcionario.sql` só com o enum/coluna, `0004_rls_equipe.sql`
com funções/políticas).

## Seção 2 — Convite e gestão de equipe (UI)

- Nova rota `/painel/equipe`, link no menu do painel visível só quando `perfil.papel === 'admin'`
- Lista todos os perfis com `papel in ('admin','funcionario')`: nome, e-mail, papel,
  badge "vê valores" quando aplicável, botão "Remover acesso"
- Formulário (admin only): e-mail, nome, papel (`admin`/`funcionario`), checkbox
  "Pode ver valores" (só relevante se papel = funcionário)
- Server action `convidarMembroEquipe(dados)` em `acoes.ts`, mesmo padrão de
  `abrirProjeto`: usa `criarClienteAdmin()` + `auth.admin.inviteUserByEmail`, depois
  `update perfis set papel=..., ve_valores=... where id = <id do convite>`
- Server action `removerAcessoEquipe(perfilId)`: rebaixa `papel` para `'cliente'` e
  zera `ve_valores` — não apaga a conta (preserva autoria de mensagens/atualizações já
  postadas, evita `on delete cascade` em cascata)
- Travas em `removerAcessoEquipe`: recusa se `perfilId === perfil do próprio admin
  logado`, e recusa se for o último `papel = 'admin'` restante no sistema
- Ambas exigem `exigirAdmin()` (já existe em `acoes.ts`)

## Seção 3 — Esconder valores de quem não pode ver

Regra única usada em toda a UI do painel: `perfil.papel === 'admin' || perfil.ve_valores`.
Quando falsa, o campo/linha correspondente simplesmente não é renderizado (sem
placeholder tipo "***").

Pontos a ajustar:
- [painel/page.tsx](../../../src/app/painel/page.tsx): indicador "Carteira fechada",
  coluna "Estimativa" da tabela, valor nos cards de projeto
- [painel/[id]/page.tsx](../../../src/app/painel/[id]/page.tsx): bloco "Estimativa
  automática" inteiro (valor, faixa, recorrente, composição, breakdown de itens)
- `AcoesSolicitacao` ([acoes-solicitacao.tsx](../../../src/components/acoes-solicitacao.tsx)):
  campo de valor no formulário de abrir projeto — se `ve_valores` for falso, o campo
  vem vazio/desabilitado e quem preenche precisa pedir pra um admin fechar o valor
  (não bloqueia o resto do fluxo de abrir projeto)

`/portal` (área do cliente) não muda — lá o valor é do próprio cliente sobre o próprio
projeto, sempre visível a ele.

## Seção 4 — Editar meus dados (`/conta`)

- Nova rota `/conta`, acessível a qualquer perfil logado (admin, funcionário, cliente)
- Adicionar `/conta` à lista `protegida` em [middleware.ts](../../../src/middleware.ts)
- Formulário: nome, telefone, empresa. E-mail fica de fora (trocar e-mail de login
  exige fluxo de confirmação separado do Supabase Auth — fica para depois, se pedido)
- Server action `atualizarPerfil(dados)`: `update perfis set ... where id = auth.uid()`
  — a política `perfis_editar_proprio` já existente cobre isso, sem mudança de RLS
- Link para `/conta` no nome/e-mail do cabeçalho do painel
  ([painel/layout.tsx](../../../src/app/painel/layout.tsx)) e do portal
  ([portal/page.tsx](../../../src/app/portal/page.tsx)), hoje só texto sem link

## Mudanças transversais

- `perfilAtual()` em [servidor.ts](../../../src/lib/supabase/servidor.ts): tipo de
  retorno ganha `papel: "admin" | "funcionario" | "cliente"` e `ve_valores: boolean`
- [painel/layout.tsx](../../../src/app/painel/layout.tsx): hoje redireciona quem não é
  `admin` para `/portal`. Passa a redirecionar só quem é `cliente` (admin e funcionário
  entram)
- `exigirAdmin()` em [acoes.ts](../../../src/app/acoes.ts) continua existindo tal como
  está (usado só nas ações de gestão de equipe). Nova função `exigirEquipe()` (aceita
  admin ou funcionário) substitui `exigirAdmin()` nas ações que devem ficar abertas a
  funcionário: `mudarStatusSolicitacao`, `salvarObservacoes`, `abrirProjeto`,
  `publicarAtualizacao`, `mudarStatusProjeto`

## Testes

- Manual, contra o projeto Supabase real do usuário (sem ambiente de teste automatizado
  no repo hoje): criar um funcionário com e sem `ve_valores`, confirmar o que cada um
  vê/edita no painel, confirmar que RLS bloqueia um `cliente` comum de acessar
  `solicitacoes`/`projetos` de outros, confirmar trava de "não remove o último admin"
