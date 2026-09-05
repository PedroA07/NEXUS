import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { Revelar } from "@/components/revelar";

export const metadata = { title: "Briefing recebido" };

const PASSOS: [string, string][] = [
  ["Análise do briefing", "Lemos tudo com calma e verificamos se dá para fazer do jeito que você imaginou, no prazo e no orçamento indicados."],
  ["Retorno", "Se fizer sentido para os dois lados, entramos em contato pelo WhatsApp ou e-mail que você deixou."],
  ["Conversa de levantamento", "Detalhamos requisitos, especificações e escopo. É onde as ideias viram uma lista concreta do que será feito."],
  ["Proposta com os valores reais", "Só depois desse levantamento é que prazo e valor definitivos são fechados, por escrito."],
];

export default async function Enviado({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;

  return (
    <>
      <Cabecalho />
      <main>
        <section className="pt-[clamp(140px,20vh,220px)] pb-[clamp(56px,9vh,110px)]">
          <div className="secao">
            <div className="grid gap-[clamp(32px,5vw,80px)] lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <div className="flex items-center gap-4">
                  <span aria-hidden className="w-10 h-10 shrink-0 border border-ok text-ok grid place-items-center text-xl">✓</span>
                  <span className="olho text-ok">Briefing recebido</span>
                </div>
                <h1 className="mt-[clamp(28px,4vh,48px)] text-[clamp(3rem,8vw,7.5rem)] font-bold leading-[.92] tracking-[-.045em]">
                  Recebido.
                </h1>
              </div>
              {codigo && (
                <div>
                  <span className="olho-suave">Protocolo</span>
                  <p className="mt-3.5 inline-block font-mono text-[clamp(1.4rem,2.6vw,2.2rem)] font-medium tracking-[.02em] text-tinta border border-linha px-5 py-4">
                    {codigo}
                  </p>
                  <p className="mt-4 text-[14.5px] text-suave leading-[1.7] max-w-[34ch]">
                    Guarde este número. É por ele que a gente localiza o seu briefing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-linha py-[clamp(56px,9vh,110px)]">
          <div className="secao">
            <div className="flex items-end justify-between gap-8 flex-wrap">
              <Revelar className="max-w-[24ch]">
                <span className="olho-suave">A partir daqui</span>
                <h2 className="mt-5 text-[clamp(1.7rem,3.4vw,3rem)] font-bold leading-[1.04] tracking-[-.03em]">
                  O caminho até a proposta real.
                </h2>
              </Revelar>
              <Revelar atraso={70}>
                <p className="text-[15.5px] text-suave leading-[1.7] max-w-[38ch]">
                  Qualquer número citado antes do levantamento é estimativa. O valor definitivo
                  sai por escrito no fim desta sequência.
                </p>
              </Revelar>
            </div>

            <div className="mt-[clamp(48px,7vh,88px)] grid lg:grid-cols-2">
              {PASSOS.map(([titulo, corpo], i) => {
                const direita = i % 2 === 0;
                const ultimaFila = i >= PASSOS.length - 2;
                return (
                  <Revelar key={titulo}>
                    <div
                      className={`grid grid-cols-[72px_1fr] lg:grid-cols-[96px_1fr] gap-[clamp(16px,2vw,28px)] items-start border-t border-linha py-[clamp(28px,4vh,44px)] ${
                        ultimaFila ? "lg:border-b" : ""
                      } ${direita ? "lg:pr-[clamp(24px,3vw,48px)]" : "lg:pl-[clamp(24px,3vw,48px)]"}`}
                    >
                      <span
                        className={`font-mono text-[clamp(2rem,3.4vw,3.2rem)] font-medium leading-[.9] tracking-[-.04em] ${
                          i === PASSOS.length - 1 ? "text-ember" : "text-linha"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[clamp(1.1rem,1.6vw,1.4rem)] font-semibold leading-[1.15] tracking-[-.02em]">
                          {titulo}
                        </h3>
                        <p className="mt-3 text-[15px] text-tinta2 leading-[1.7]">{corpo}</p>
                      </div>
                    </div>
                  </Revelar>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pt-[clamp(56px,9vh,110px)] pb-[clamp(96px,16vh,180px)]">
          <div className="secao">
            <Revelar>
              <div className="border border-linha p-[clamp(28px,4vw,56px)] flex flex-wrap items-start justify-between gap-[clamp(24px,4vw,64px)]">
                <div className="max-w-[40ch]">
                  <span className="olho">Depois que o projeto começar</span>
                  <h2 className="mt-5 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-[1.15] tracking-[-.025em]">
                    Você recebe acesso à área do cliente.
                  </h2>
                  <p className="mt-4 text-[15.5px] text-tinta2 leading-[1.7]">
                    Convite por e-mail, e a partir dali você acompanha as atualizações do projeto
                    e fala com a gente pelo chat, sem precisar caçar mensagem no WhatsApp.
                  </p>
                </div>
                <div className="flex flex-col gap-3.5">
                  <Link href="/" className="btn-s">Voltar ao início</Link>
                  <Link href="/projetos" className="btn-s">Ver outros projetos</Link>
                </div>
              </div>
            </Revelar>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  );
}
