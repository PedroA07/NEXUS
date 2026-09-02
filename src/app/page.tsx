import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { HeroScrollytelling } from "@/components/hero-scrollytelling";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const PASSOS = [
  { t: "Você preenche o briefing", d: "Um formulário em linguagem simples, sem termo técnico. Leva de 5 a 20 minutos, dependendo da versão que escolher." },
  { t: "A gente analisa", d: "Lemos tudo e verificamos se dá para fazer do jeito que você imaginou, no prazo e no orçamento indicados." },
  { t: "A gente conversa", d: "Levantamos requisitos, especificações e escopo em detalhe. É aqui que a ideia vira uma lista concreta." },
  { t: "Proposta e execução", d: "Prazo e valor fechados por escrito. Durante o projeto, você acompanha tudo pela área do cliente e fala com a gente por lá." },
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
        <HeroScrollytelling />

        {/* quem somos */}
        <section id="quem-somos" className="max-w-6xl mx-auto px-5 py-14 border-t border-linha grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <h2 className="text-2xl font-bold">Quem somos</h2>
          <div className="grid gap-4 text-[15.5px] text-tinta2 leading-relaxed max-w-2xl">
            <p>
              A Nexus nasceu de um jeito simples de pensar software: cada projeto merece ser
              resolvido do zero para o problema real de quem pede, não encaixado num molde pronto.
            </p>
            <p>
              Por trás dela está o <a href="https://github.com/PedroA07" target="_blank" rel="noreferrer" className="text-tinta font-semibold hover:text-acento-forte">Pedro Andrade</a>,
              e a equipe cresce projeto a projeto, conforme o que cada trabalho pede, sem inflar
              quadro nem terceirizar sem avisar. O <Link href="/projetos" className="text-acento-forte font-semibold hover:underline">portfólio</Link> mostra
              essa amplitude: de aplicativos autorais a sistemas internos de gestão, sempre com o mesmo cuidado.
            </p>
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
              existe sempre a opção “não sei”, e a gente explica depois, com calma.
            </p>
            <Link href="/solicitar" className="btn-p mt-6">Preencher o briefing</Link>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  );
}
