import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const SERVICOS = [
  { t: "Sites e páginas de venda", d: "Da vitrine institucional à página feita para converter, com texto, layout e medição de resultado." },
  { t: "Sistemas sob medida", d: "Cadastros, pedidos, agendamento, relatórios — o que hoje vive numa planilha vira um sistema com login e histórico." },
  { t: "Aplicativos", d: "Android e iPhone a partir de uma base só, publicados nas lojas e prontos para atualizar." },
  { t: "Automações e bots", d: "Aquela tarefa repetitiva que consome sua semana passa a acontecer sozinha." },
  { t: "Dados e relatórios", d: "Os números do negócio em um painel só, atualizados sem ninguém montar planilha." },
  { t: "Inteligência artificial", d: "Atendimento automático, classificação e análise, integrados ao que você já usa." },
];

const PASSOS = [
  { t: "Você preenche o briefing", d: "Um formulário em linguagem simples, sem termo técnico. Leva de 5 a 20 minutos, dependendo da versão que escolher." },
  { t: "Eu analiso", d: "Leio tudo e verifico se dá para fazer do jeito que você imaginou, no prazo e no orçamento indicados." },
  { t: "A gente conversa", d: "Levantamos requisitos, especificações e escopo em detalhe. É aqui que a ideia vira uma lista concreta." },
  { t: "Proposta e execução", d: "Prazo e valor fechados por escrito. Durante o projeto, você acompanha tudo pela área do cliente e fala comigo por lá." },
];

export default async function Home() {
  const sb = await criarClienteServidor();
  const { data: destaques } = await sb
    .from("portfolio")
    .select("slug,titulo,resumo,categoria,ano")
    .eq("publicado", true)
    .eq("destaque", true)
    .order("ordem")
    .limit(3);

  return (
    <>
      <Cabecalho />
      <main>
        {/* hero */}
        <section className="max-w-6xl mx-auto px-5 pt-20 pb-16">
          <p className="olho">Desenvolvimento de software</p>
          <h1 className="mt-4 text-[clamp(2.2rem,6vw,3.6rem)] font-bold leading-[1.05] max-w-3xl text-balance">
            Software feito para o seu problema, não para o catálogo de alguém.
          </h1>
          <p className="mt-5 text-lg text-tinta2 max-w-2xl leading-relaxed">
            Sites, sistemas, aplicativos e automações sob medida. Começa com um briefing
            em linguagem que qualquer pessoa entende e termina com você acompanhando cada
            etapa por uma área própria.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/solicitar" className="btn-p">Solicitar orçamento</Link>
            <Link href="/projetos" className="btn-s">Ver projetos</Link>
          </div>
          <p className="mt-6 text-sm text-suave">
            Sem compromisso. O briefing serve para eu entender o projeto e dizer, com honestidade, se vale a pena.
          </p>
        </section>

        {/* serviços */}
        <section id="servicos" className="max-w-6xl mx-auto px-5 py-14 border-t border-linha">
          <h2 className="text-2xl font-bold">O que eu faço</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICOS.map((s) => (
              <article key={s.t} className="cartao p-5">
                <h3 className="text-[17px] font-bold">{s.t}</h3>
                <p className="mt-2 text-[14.5px] text-suave leading-relaxed">{s.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* processo */}
        <section id="processo" className="max-w-6xl mx-auto px-5 py-14 border-t border-linha">
          <h2 className="text-2xl font-bold">Como funciona</h2>
          <p className="mt-2 text-[15px] text-suave max-w-2xl">
            Nada de orçamento no escuro: o valor real só é fechado depois que a gente
            conversa e o escopo está claro para os dois lados.
          </p>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((p, i) => (
              <li key={p.t} className="cartao p-5">
                <span className="font-mono text-xs text-acento bg-acento-fundo border border-acento-borda rounded-lg w-7 h-7 grid place-items-center">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-[16px] font-bold">{p.t}</h3>
                <p className="mt-1.5 text-[14px] text-suave leading-relaxed">{p.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* destaques */}
        {destaques && destaques.length > 0 && (
          <section className="max-w-6xl mx-auto px-5 py-14 border-t border-linha">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="text-2xl font-bold">Alguns projetos</h2>
              <Link href="/projetos" className="text-[14.5px] font-semibold text-acento hover:text-acento-forte">
                Ver todos →
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destaques.map((p) => (
                <Link key={p.slug} href={`/projetos#${p.slug}`} className="cartao p-5 hover:border-acento transition-colors">
                  <span className="olho">{p.categoria} · {p.ano}</span>
                  <h3 className="mt-2 text-[18px] font-bold">{p.titulo}</h3>
                  <p className="mt-1.5 text-[14.5px] text-suave leading-relaxed">{p.resumo}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* chamada final */}
        <section className="max-w-6xl mx-auto px-5 py-14 border-t border-linha">
          <div className="cartao p-8 sm:p-10 bg-acento-fundo border-acento-borda">
            <h2 className="text-2xl font-bold max-w-xl text-balance">
              Tem uma ideia e não sabe por onde começar?
            </h2>
            <p className="mt-3 text-[15.5px] text-tinta2 max-w-2xl leading-relaxed">
              O briefing foi escrito para quem não é da área. Onde a pergunta for técnica,
              existe sempre a opção “não sei” — e eu explico depois, com calma.
            </p>
            <Link href="/solicitar" className="btn-p mt-6">Preencher o briefing</Link>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  );
}
