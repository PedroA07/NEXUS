import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { HeroScrollytelling } from "@/components/hero-scrollytelling";
import { Revelar } from "@/components/revelar";
import { CasoDestaque } from "@/components/caso-destaque";
import { ServicosHorizontal } from "@/components/servicos-horizontal";
import { ProcessoHorizontal } from "@/components/processo-horizontal";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const DESTAQUE = {
  numero: "01",
  titulo: "Sites e páginas de venda",
  corpo:
    "Da vitrine institucional à página feita para converter, com texto, layout e medição de resultado pensados para o seu público.",
};

const SERVICOS = [
  {
    numero: "02",
    titulo: "Sistemas sob medida",
    corpo:
      "Cadastros, pedidos, agendamento e relatórios: o que vive numa planilha ganha login, permissão e histórico.",
  },
  {
    numero: "03",
    titulo: "Aplicativos",
    corpo: "Android e iPhone a partir de uma base só, publicados nas lojas e prontos para atualizar.",
  },
  {
    numero: "04",
    titulo: "Automações e bots",
    corpo:
      "A tarefa repetitiva que consome sua semana passa a rodar sozinha, sem depender de ninguém lembrar.",
  },
  {
    numero: "05",
    titulo: "Dados e relatórios",
    corpo: "Os números do negócio em um painel só, atualizados na fonte, sem planilha no meio.",
  },
  {
    numero: "06",
    titulo: "Inteligência artificial",
    corpo:
      "Atendimento automático, classificação e análise integrados ao que você já usa, sem trocar de sistema.",
  },
];

const SERVICOS_COM_IMAGENS = [
  { ...DESTAQUE, imagem: "/hero/01-site-poster.jpg" },
  { ...SERVICOS[0], imagem: "/hero/02-sistema-poster.jpg" },
  { ...SERVICOS[1], imagem: "/hero/03-app-poster.jpg" },
  { ...SERVICOS[2], imagem: "/hero/04-automacao-poster.jpg" },
  { ...SERVICOS[3], imagem: "/hero/05-dados-poster.jpg" },
  { ...SERVICOS[4], imagem: "/hero/06-ia-poster.jpg" },
];

const PASSOS = [
  {
    numero: "01",
    etapa: "Ideia",
    titulo: "Você preenche o briefing",
    corpo: "Formulário em linguagem simples, sem termo técnico. De 5 a 20 minutos, dependendo da versão.",
  },
  {
    numero: "02",
    etapa: "Análise",
    titulo: "A gente analisa",
    corpo:
      "Lemos tudo e verificamos se dá para fazer do jeito que você imaginou, no prazo e no orçamento indicados.",
  },
  {
    numero: "03",
    etapa: "Escopo",
    titulo: "A gente conversa",
    corpo:
      "Levantamos requisitos, especificações e escopo em detalhe. É aqui que a ideia vira uma lista concreta.",
  },
  {
    numero: "04",
    etapa: "Execução",
    titulo: "Proposta e execução",
    corpo:
      "Prazo e valor fechados por escrito. Você acompanha tudo pela área do cliente e fala com a gente por lá.",
  },
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
      <Cabecalho sobreposto />
      <main>
        <HeroScrollytelling />

        {/* ponte: respiro entre o hero preso e o corpo da página */}
        <section className="relative bg-papel pt-[clamp(6rem,18vh,12.5rem)] pb-[clamp(4rem,10vh,7.5rem)]">
          <div className="secao">
            <Revelar className="max-w-[24ch]">
              <span className="olho-suave">Seis frentes</span>
              <p className="mt-[22px] text-[clamp(1.6rem,3.2vw,2.9rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                Um jeito de trabalhar, aplicado a seis tipos de problema.
              </p>
            </Revelar>
          </div>
        </section>

        {/* serviços */}
        <section id="servicos" className="relative bg-papel border-t border-linha pt-[clamp(4.5rem,12vh,8.75rem)] pb-[clamp(6rem,16vh,11.25rem)]">
          <ServicosHorizontal servicos={SERVICOS_COM_IMAGENS} />
        </section>

        {/* estúdio */}
        <section
          id="quem-somos"
          className="bg-papel border-t border-linha py-[clamp(6rem,16vh,11.25rem)]"
        >
          <div className="secao">
            <Revelar>
              <span className="olho-suave">02 — Estúdio</span>
            </Revelar>
            <Revelar>
              <blockquote className="mt-[clamp(2rem,5vh,3.5rem)] max-w-[22ch]">
                <p className="text-[clamp(2rem,5.4vw,4.6rem)] font-bold leading-[1] tracking-[-0.035em]">
                  Cada projeto merece ser resolvido do zero para o problema real de quem pede.
                </p>
              </blockquote>
            </Revelar>
            <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(1.5rem,4vw,4rem)] sm:grid-cols-2 max-w-[1000px]">
              <Revelar>
                <p className="text-[16.5px] text-tinta2 leading-[1.7]">
                  Nada de molde pronto. A Nexus nasceu de um jeito simples de pensar software:
                  entender o problema antes de escolher a ferramenta, e escrever só o que resolve.
                </p>
              </Revelar>
              <Revelar atraso={70}>
                <p className="text-[16.5px] text-tinta2 leading-[1.7]">
                  A equipe cresce projeto a projeto, conforme o que cada trabalho pede, sem inflar
                  quadro nem terceirizar sem avisar. O{" "}
                  <Link
                    href="/projetos"
                    className="text-tinta border-b border-linha2 transition-colors hover:border-ember"
                  >
                    portfólio
                  </Link>{" "}
                  mostra a amplitude: de aplicativos autorais a sistemas internos de gestão.
                </p>
              </Revelar>
            </div>
            <Revelar>
              <a
                href="https://github.com/PedroA07"
                target="_blank"
                rel="noreferrer"
                className="mt-[clamp(3rem,7vh,5.5rem)] inline-flex flex-wrap items-baseline gap-5 border-t border-linha pt-6 transition-colors duration-[350ms] hover:border-ember"
              >
                <span className="olho-suave">Quem escreve o código</span>
                <span className="text-[clamp(1.1rem,1.8vw,1.5rem)] font-semibold tracking-[-0.02em] text-tinta">
                  Pedro Andrade
                </span>
                <span className="font-mono text-[13px] text-ember">↗</span>
              </a>
            </Revelar>
          </div>
        </section>

        {/* processo */}
        <section
          id="processo"
          className="bg-papel border-t border-linha py-[clamp(6rem,16vh,11.25rem)]"
        >
          <div className="secao">
            <div className="flex items-end justify-between gap-8 flex-wrap">
              <Revelar className="max-w-[26ch]">
                <span className="olho-suave">03 — Processo</span>
                <h2 className="mt-[22px] text-[clamp(1.8rem,3.6vw,3.2rem)] font-bold leading-[1.04]">
                  Do briefing ao escopo fechado por escrito.
                </h2>
              </Revelar>
              <Revelar atraso={70}>
                <p className="text-[15.5px] text-suave leading-[1.7] max-w-[38ch]">
                  Nada de orçamento no escuro: o valor real só é fechado depois que a gente conversa
                  e o escopo está claro para os dois lados.
                </p>
              </Revelar>
            </div>

            <div className="mt-[clamp(3.5rem,9vh,6.875rem)] -mx-[clamp(1.5rem,5vw,6rem)]">
              <ProcessoHorizontal passos={PASSOS} />
            </div>
          </div>
        </section>

        {/* projetos */}
        {destaques && destaques.length > 0 && (
          <section
            id="projetos"
            className="bg-papel border-t border-linha pt-[clamp(6rem,16vh,11.25rem)] pb-[clamp(3rem,8vh,6rem)]"
          >
            <div className="secao">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <Revelar>
                  <span className="olho-suave">04 — Projetos</span>
                  <h2 className="mt-[22px] text-[clamp(1.8rem,3.6vw,3.2rem)] font-bold leading-[1.04]">
                    Alguns projetos
                  </h2>
                </Revelar>
                <Revelar atraso={70}>
                  <Link
                    href="/projetos"
                    className="font-mono text-[12px] tracking-[0.14em] uppercase text-tinta2 border-b border-linha2 pb-1.5 transition-[color,border-color] duration-300 hover:text-tinta hover:border-ember"
                  >
                    Ver todos →
                  </Link>
                </Revelar>
              </div>

              <div className="mt-[clamp(3rem,7vh,5.5rem)]">
                {destaques.map((projeto, i) => (
                  <Revelar key={projeto.slug}>
                    <CasoDestaque
                      projeto={projeto}
                      invertido={i % 2 === 1}
                      legenda={projeto.categoria ?? undefined}
                      ultimo={i === destaques.length - 1}
                    />
                  </Revelar>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* chamada final */}
        <section className="bg-papel pt-[clamp(7.5rem,22vh,15rem)] pb-[clamp(6rem,16vh,11.25rem)]">
          <div className="secao">
            <Revelar>
              <span className="olho">Agora é o momento de começar</span>
            </Revelar>
            <Revelar>
              <h2 className="mt-[clamp(1.75rem,4vh,3rem)] text-[clamp(2.4rem,7vw,7rem)] font-bold leading-[0.94] tracking-[-0.04em] max-w-[20ch] text-balance">
                Tem uma ideia e não sabe por onde começar?
              </h2>
            </Revelar>
            <Revelar atraso={70}>
              <div className="mt-[clamp(2.5rem,6vh,4.5rem)] flex items-end justify-between gap-10 flex-wrap">
                <p className="text-[16.5px] text-tinta2 leading-[1.7] max-w-[44ch]">
                  O briefing foi escrito para quem não é da área. Onde a pergunta for técnica,
                  existe sempre a opção “não sei”, e a gente explica depois, com calma.
                </p>
                <Link href="/solicitar" className="btn-p">
                  Preencher o briefing <span className="font-mono font-medium">→</span>
                </Link>
              </div>
            </Revelar>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  );
}
