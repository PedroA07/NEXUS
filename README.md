# Nexus — site, briefing e portal do cliente

Site institucional da Nexus com portfólio, formulário de briefing, painel administrativo
e área do cliente com acompanhamento de projeto e chat em tempo real.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres, Auth, Realtime, RLS) · Tailwind v4 · TypeScript

---

## O que já está pronto

| Rota | O que faz | Quem acessa |
|---|---|---|
| `/` | Home: serviços, como funciona, projetos em destaque | público |
| `/projetos` | Portfólio completo | público |
| `/solicitar` | Briefing em 2 versões (rápida e completa), 59 campos, com ícones de informação e o bloco de responsabilidades | público |
| `/solicitar/enviado` | Confirmação com protocolo e os 4 passos até o orçamento real | público |
| `/entrar` | Login | público |
| `/painel` | Lista de solicitações, indicadores e projetos | admin, funcionário |
| `/painel/[id]` | Briefing completo + estimativa automática de prazo e valor + decisão + abrir projeto | admin, funcionário |
| `/painel/equipe` | Convidar, listar e remover acesso de funcionários | admin |
| `/portal` | Projetos do cliente | cliente |
| `/portal/[id]` | Progresso, linha do tempo de atualizações e chat | cliente, admin e funcionário |
| `/conta` | Editar nome, telefone e empresa | qualquer logado |

A **estimativa é calculada no servidor** no momento em que a solicitação chega
(`src/lib/estimativa.ts`) e fica gravada em `solicitacoes.estimativa`. É a mesma
conta do estimador interno: horas por item, gestão, buffer, prazo em semanas
corridas e composição do preço (desenvolvimento, IA e APIs, infraestrutura, margem
e impostos).

---

## Como colocar no ar

### 1. Criar o projeto no Supabase

Crie um projeto novo em [supabase.com](https://supabase.com/dashboard) (não reaproveite
o de outro sistema — este esquema tem RLS próprio).

No **SQL Editor**, rode na ordem:

1. `supabase/migrations/0001_init.sql` — tabelas, políticas de acesso e realtime
2. `supabase/migrations/0002_seed_portfolio.sql` — portfólio inicial (revise os textos antes)
3. `supabase/migrations/0003_perfis_colunas_restritas.sql` — trava colunas de `perfis` pra evitar auto-promoção de papel
4. `supabase/migrations/0004_papel_funcionario.sql` — papel de funcionário e coluna de visibilidade de valores
5. `supabase/migrations/0005_rls_equipe.sql` — **em execução separada da 0004** (função `e_equipe()` e políticas de RLS de equipe — rodar junto dá erro de enum)

> Em `0002` há um projeto descrito como "autarquia previdenciária municipal".
> Confirme com o cliente antes de publicar qualquer nome real.

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha com os valores de **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` — públicas
- `SUPABASE_SERVICE_ROLE_KEY` — **nunca** vai para o navegador; é usada só para convidar
  o cliente por e-mail quando você abre um projeto
- `NEXT_PUBLIC_SITE_URL` — endereço público, usado nos links de convite

### 3. Rodar

```bash
npm install
npm run dev
```

### 4. Criar o seu acesso de administrador

1. Em **Authentication → Users**, clique em *Add user* e crie o seu usuário com senha.
2. No SQL Editor, promova esse usuário:

```sql
update perfis set papel = 'admin' where email = 'seu@email.com';
```

3. Entre em `/entrar` — você cai direto no `/painel`.

### 5. Publicar na Vercel

```bash
npx vercel
```

Cole as mesmas variáveis de ambiente no painel da Vercel. Depois, em
**Supabase → Authentication → URL Configuration**, coloque o domínio final em
*Site URL* e em *Redirect URLs*, senão o convite por e-mail cai no lugar errado.

---

## Como o fluxo funciona

```
visitante preenche /solicitar
        ↓  (estimativa calculada no servidor)
solicitação cai no /painel com status "nova"
        ↓  você lê, marca "em análise" e anota observações internas
        ↓  conversa com o cliente, levanta requisitos e fecha o valor real
"Abrir projeto e dar acesso"
        ↓  cria o projeto, convida o cliente por e-mail, publica a 1ª atualização
cliente entra em /portal
        ↓  acompanha progresso e linha do tempo, conversa pelo chat
```

O chat usa Supabase Realtime: mensagem enviada por um lado aparece no outro sem recarregar.

---

## Ajustes que valem a pena fazer

- **Preços e horas** — `src/lib/estimativa.ts`, constante `PADRAO` e os catálogos
  `TIPOS`/`FUNCS`/`PLATS`/`INTEGRA`/`EXTRAS`. Troque pelos números que você pratica.
- **Perguntas do briefing** — `src/lib/briefing.ts`. É a fonte única: mudou aqui,
  muda no formulário, no painel e no resumo.
- **Textos do site** — `src/app/page.tsx` (serviços e processo) e `src/components/rodape.tsx`.
- **Contato** — o rodapé ainda não tem WhatsApp nem e-mail; coloque os seus.

## O que ainda não existe

- Upload de arquivos no chat e nas atualizações (o Supabase Storage já dá conta, falta a tela)
- Notificação por e-mail quando chega uma solicitação ou uma mensagem nova
- Edição do portfólio pelo painel (hoje se cadastra pelo SQL)
- Testes automatizados

---

## Subir para o GitHub

```bash
cd nexus-site
git init
git add .
git commit -m "Site da Nexus: portfólio, briefing, painel e portal do cliente"
git branch -M main
gh repo create nexus-site --private --source=. --push
```

Sem o `gh` instalado, crie o repositório vazio pelo site e depois:

```bash
git remote add origin https://github.com/SEU-USUARIO/nexus-site.git
git push -u origin main
```

O `.gitignore` já bloqueia `.env` e `.env.local` — confira que nenhuma chave foi junto
antes do primeiro push.
