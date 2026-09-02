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
      <main className="max-w-6xl mx-auto px-5 pt-16 pb-8">
        <p className="olho">Portfólio</p>
        <h1 className="mt-3 text-[clamp(2rem,5vw,2.8rem)] font-bold">Projetos</h1>
        <p className="mt-4 text-[17px] text-tinta2 max-w-2xl leading-relaxed">
          Trabalhos autorais e para clientes, de aplicativos e jogos a sistemas internos.
        </p>

        {!projetos?.length ? (
          <p className="mt-12 cartao p-8 text-center text-suave">
            Nenhum projeto publicado ainda. Cadastre na tabela <code className="font-mono">portfolio</code>.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {projetos.map((p) => (
              <article key={p.slug} id={p.slug} className="cartao p-6 scroll-mt-20">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="olho">{p.categoria}</span>
                  <span className="font-mono text-xs text-suave">{p.ano}</span>
                </div>
                <h2 className="mt-2 text-[21px] font-bold">{p.titulo}</h2>
                <p className="mt-2 text-[15px] text-tinta2 leading-relaxed">{p.resumo}</p>
                {p.descricao && <p className="mt-3 text-[14.5px] text-suave leading-relaxed">{p.descricao}</p>}
                {p.stack?.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.stack.map((s: string) => (
                      <li key={s} className="selo bg-cartao2 border border-linha text-suave font-mono !font-normal">{s}</li>
                    ))}
                  </ul>
                )}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer"
                     className="mt-4 inline-block text-[14.5px] font-semibold text-acento hover:text-acento-forte">
                    Abrir projeto →
                  </a>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="mt-14 cartao p-8 bg-acento-fundo border-acento-borda">
          <h2 className="text-xl font-bold">Quer algo parecido para o seu negócio?</h2>
          <p className="mt-2 text-[15px] text-tinta2 max-w-xl leading-relaxed">
            Conte o que precisa no briefing e a gente retorna dizendo se é viável, quanto custa e quanto leva.
          </p>
          <Link href="/solicitar" className="btn-p mt-5">Solicitar orçamento</Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
