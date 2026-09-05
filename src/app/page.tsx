import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { HeroScrollytelling } from "@/components/hero-scrollytelling";
import { Revelar } from "@/components/revelar";
import { CasoDestaque } from "@/components/caso-destaque";
import { ServicosHorizontal } from "@/components/servicos-horizontal";
import { ProcessoTrilho, type Passo } from "@/components/processo-trilho";
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
  { ...DESTAQUE, imagem: "/hero/01-site.png" },
  { ...SERVICOS[0], imagem: "/hero/02-sistema.png" },
  { ...SERVICOS[1], imagem: "/hero/03-app.png" },
  { ...SERVICOS[2], imagem: "/hero/04-automacao.png" },
  { ...SERVICOS[3], imagem: "/hero/05-dados.png" },
  { ...SERVICOS[4], imagem: "/hero/06-ia.png" },
];

const PASSOS: Passo[] = [
  {
    numero: "01",
    rotulo: "Você conta",
    titulo: "Tudo começa com a sua ideia.",
    paragrafos: [
      "Você preenche o briefing em linguagem de gente, sem termo técnico. Onde a pergunta for técnica, existe sempre “não sei”.",
      "Leva de 5 a 20 minutos, dependendo da versão que escolher.",
    ],
  },
  {
    numero: "02",
    rotulo: "A gente entende",
    titulo: "Antes de construir, a gente entende.",
    paragrafos: [
      "Lemos tudo e checamos se dá para fazer do jeito que você imaginou, no prazo e no orçamento que você indicou.",
      "Se fizer sentido para os dois lados, a gente chama para conversar.",
    ],
  },
  {
    numero: "03",
    rotulo: "O escopo fecha",
    titulo: "A ideia vira uma lista concreta.",
    paragrafos: [
      "Na conversa, levantamos requisitos e especificações em detalhe — o que entra, o que fica para depois.",
      "Prazo e valor saem daí, por escrito. Nada de orçamento no escuro.",
    ],
  },
  {
    numero: "04",
    rotulo: "Você acompanha",
    titulo: "Seu projeto deixa de ser uma ideia.",
    paragrafos: [
      "A construção começa e você acompanha cada etapa pela área do cliente, sem caçar mensagem no WhatsApp.",
      "Quando estiver no ar, a conversa não precisa terminar: dá para seguir evoluindo o projeto junto.",
    ],
  },
];

const GARANTIAS = [
  "Não precisa saber de tecnologia nem usar termo técnico",
  "Não precisa ter tudo definido nem saber o custo",
  "Leva alguns minutos — e dá para voltar e editar qualquer resposta",
  "Onde a pergunta for técnica, existe sempre “não sei”",
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
            <div className="flex items-baseline gap-5">
              <Revelar>
                <span className="olho-suave whitespace-nowrap">02 — Estúdio</span>
              </Revelar>
              <span className="flex-1 h-px bg-linha" />
            </div>

            <div className="mt-[clamp(3rem,8vh,6rem)] grid items-start gap-[clamp(2.5rem,6vw,6rem)] lg:grid-cols-[1.35fr_1fr]">
              <Revelar>
                <blockquote className="m-0">
                  <p className="text-[clamp(1.9rem,4.6vw,4.2rem)] font-bold leading-[1.02] tracking-[-0.036em] text-pretty">
                    Cada projeto merece ser resolvido <em className="not-italic text-ember">do zero</em> para o problema real de quem pede.
                  </p>
                  <footer className="mt-[clamp(28px,4vh,44px)] flex items-center gap-4">
                    <span className="h-px w-12 bg-ember" />
                    <span className="olho-suave">O princípio da casa</span>
                  </footer>
                </blockquote>
              </Revelar>

              <Revelar atraso={120} className="hidden lg:block">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-linha bg-painel">
                  <img src="/hero/00-cristal-poster.jpg" alt="Cristal Nexus Hub" className="h-full w-full object-cover opacity-60" />
                  <span className="absolute inset-0 bg-gradient-to-t from-papel/90 via-papel/20 to-transparent" />
                  <span className="absolute bottom-5 left-5 right-5 font-mono text-[10.5px] tracking-[.2em] uppercase text-tinta2">Nexus Hub · estúdio de software</span>
                </div>
              </Revelar>
            </div>

            <div className="mt-[clamp(3rem,8vh,6rem)] grid items-start gap-[clamp(1.5rem,4vw,4rem)] border-t border-linha pt-[clamp(2rem,5vh,3.5rem)] lg:grid-cols-[190px_1fr_1fr]">
              <Revelar className="hidden lg:block">
                <span className="olho-suave">Como pensamos</span>
              </Revelar>
              <Revelar>
                <p className="text-[16.5px] text-tinta2 leading-[1.75]">
                  Nada de molde pronto. A Nexus nasceu de um jeito simples de pensar software:
                  entender o problema antes de escolher a ferramenta, e escrever só o que resolve.
                </p>
              </Revelar>
              <Revelar atraso={70}>
                <p className="text-[16.5px] text-tinta2 leading-[1.75]">
                  A equipe cresce projeto a projeto, conforme o que cada trabalho pede, sem inflar
                  quadro nem terceirizar sem avisar. O{" "}
                  <Link href="/projetos" className="text-tinta border-b border-linha2 transition-colors hover:border-ember">portfólio</Link>{" "}
                  mostra a amplitude: de aplicativos autorais a sistemas internos de gestão.
                </p>
              </Revelar>
            </div>

            <Revelar>
              <a
                href="https://github.com/PedroA07"
                target="_blank"
                rel="noreferrer"
                className="mt-[clamp(2.5rem,6vh,4.5rem)] flex flex-wrap items-baseline gap-5 border-t border-linha pt-[26px] transition-colors duration-[350ms] hover:border-ember"
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
            <Revelar className="max-w-[24ch]">
              <span className="olho-suave">03 — Processo</span>
              <h2 className="mt-[22px] text-[clamp(2rem,5vw,4.2rem)] font-bold leading-[.98] tracking-[-0.038em]">
                Da ideia ao produto.
              </h2>
            </Revelar>
            <Revelar atraso={70}>
              <p className="mt-[clamp(22px,3vh,34px)] text-[clamp(1rem,1.3vw,1.2rem)] text-leitura leading-[1.65] max-w-[46ch]">
                Um caminho curto entre o problema real e o software que resolve. Sem orçamento no
                escuro, sem etapa surpresa.
              </p>
            </Revelar>

            <ProcessoTrilho passos={PASSOS} />
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

            {/* O briefing é a única porta de entrada do site, então a chamada
                final não vende de novo: ela desarma o receio de quem nunca
                preencheu um, dizendo o que NÃO é exigido. */}
            <Revelar atraso={70}>
              <div className="mt-[clamp(2.25rem,5vh,3.75rem)] grid gap-[clamp(1.75rem,4vw,4.5rem)] max-w-[1060px] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
                <div>
                  <span className="olho-suave">Antes de começar</span>
                  <p className="mt-[18px] text-[clamp(1.15rem,1.7vw,1.5rem)] font-semibold leading-[1.35] tracking-[-0.02em] text-tinta max-w-[26ch]">
                    O que é um briefing?
                  </p>
                  <p className="mt-4 text-[16.5px] text-tinta2 leading-[1.7] max-w-[42ch]">
                    É uma conversa guiada para entendermos a sua ideia, o problema que você quer
                    resolver e o que o projeto precisa fazer. Não é formulário: são perguntas em
                    linguagem de gente, uma de cada vez.
                  </p>
                  <p className="mt-4 text-[16.5px] text-tinta leading-[1.7] max-w-[42ch]">
                    Conte o que você sabe. A gente ajuda a descobrir o resto.
                  </p>
                </div>

                <ul className="m-0 p-0 list-none grid content-start">
                  {GARANTIAS.map((item, i) => (
                    <li
                      key={item}
                      className={`grid grid-cols-[20px_1fr] gap-3.5 items-baseline border-t border-linha py-4 ${
                        i === GARANTIAS.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <span aria-hidden className="text-ok text-[13px]">✓</span>
                      <span className="text-[15.5px] text-leitura leading-[1.55]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Revelar>

            <Revelar atraso={140}>
              <div className="mt-[clamp(2rem,5vh,3.5rem)] flex items-center gap-6 flex-wrap">
                <Link href="/solicitar" className="btn-p px-[34px] py-[22px] text-[15px]">
                  Contar minha ideia <span className="font-mono font-medium">→</span>
                </Link>
                <span className="font-mono text-[11.5px] tracking-[0.14em] uppercase text-suave">
                  Leva alguns minutos
                </span>
              </div>
            </Revelar>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  );
}
