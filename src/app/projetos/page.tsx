import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: "Projetos" };

export default async function Projetos() {
  const sb = await criarClienteServidor();
  const { data: projetos } = await sb
    .from("portfolio").select("*").eq("publicado", true).order("ordem");

  return (
    <>
      <Cabecalho />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-[clamp(24px,5vw,96px)] pt-[clamp(140px,20vh,220px)] pb-[clamp(64px,10vh,120px)]">
        <p className="olho">Portfólio</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <h1 className="text-[clamp(3rem,9vw,9rem)] font-bold leading-[.9] tracking-[-.045em]">Projetos</h1>
          <p className="m-0 text-[clamp(1rem,1.3vw,1.2rem)] text-tinta2 max-w-[40ch] leading-[1.65]">
            Trabalhos autorais e para clientes, de aplicativos e jogos a sistemas internos. Seis projetos publicados, três em destaque.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-5 font-mono text-[11px] tracking-[.18em] uppercase text-suave">
          <span className="text-ember">{String(projetos?.length ?? 0).padStart(2, "0")} projetos</span>
          <span className="h-px w-10 bg-linha" />
          <span>Desktop</span><span>Aplicativo</span><span>Web</span><span>Jogo</span><span>Sistema interno</span>
        </div>

        {!projetos?.length ? (
          <p className="mt-16 border-t border-linha py-8 text-suave">
            Nenhum projeto publicado ainda. Cadastre na tabela <code className="font-mono">portfolio</code>.
          </p>
        ) : (
          <div className="mt-16">
            {projetos.map((p) => (
              <article key={p.slug} id={p.slug} className="border-t border-linha py-10 scroll-mt-20 lg:grid lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:items-center">
                <div className="mb-8 aspect-[16/10] border border-linha bg-[#101219] grid place-items-center lg:mb-0">
                  <span className="text-[clamp(1.5rem,3vw,2.8rem)] font-bold tracking-[-.04em] text-tinta">{p.titulo}</span>
                </div>
                <div>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="font-mono text-[11px] tracking-[.2em] uppercase text-ember">{p.categoria}</span>
                  <span className="font-mono text-xs text-suave">{p.ano}</span>
                </div>
                <h2 className="mt-4 text-[clamp(1.7rem,3.2vw,2.8rem)] font-bold leading-[1.04] tracking-[-.032em]">{p.titulo}</h2>
                <p className="mt-4 text-[16.5px] text-tinta2 leading-[1.65] max-w-[44ch]">{p.resumo}</p>
                {p.descricao && <p className="mt-3 text-[15.5px] text-suave leading-[1.7] max-w-[46ch]">{p.descricao}</p>}
                {p.stack?.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {p.stack.map((s: string) => (
                      <li key={s} className="border border-linha px-2.5 py-1.5 text-[11px] text-suave font-mono">{s}</li>
                    ))}
                  </ul>
                )}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer"
                     className="mt-5 inline-block font-mono text-[12px] tracking-[.14em] uppercase text-tinta border-b border-linha2 pb-1 hover:text-tinta hover:border-ember">
                    Abrir projeto →
                  </a>
                )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-20 border-t border-linha pt-16">
          <p className="font-mono text-[11px] tracking-[.22em] uppercase text-ember">Próximo projeto</p>
          <h2 className="mt-6 text-[clamp(2rem,5.6vw,5rem)] font-bold leading-[.96] tracking-[-.038em] max-w-[22ch]">Quer algo parecido para o seu negócio?</h2>
          <p className="mt-8 text-[16.5px] text-tinta2 max-w-[44ch] leading-[1.7]">
            Conte o que precisa no briefing e a gente retorna dizendo se é viável, quanto custa e quanto leva.
          </p>
          <Link href="/solicitar" className="btn-p mt-8">Solicitar orçamento <span className="font-mono font-normal">→</span></Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
