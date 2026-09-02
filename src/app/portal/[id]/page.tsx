import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Marca } from "@/components/marca";
import { criarClienteServidor, perfilAtual, ehEquipe } from "@/lib/supabase/servidor";
import { sair } from "@/app/acoes";
import { brl, dataCurta, dataHora } from "@/lib/formato";
import { Chat } from "@/components/chat";
import { PublicarAtualizacao } from "@/components/publicar-atualizacao";

const ROTULO: Record<string, string> = {
  planejamento: "Planejamento",
  em_andamento: "Em andamento",
  em_revisao: "Em revisão",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export default async function ProjetoPortal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perfil = await perfilAtual();
  if (!perfil) redirect("/entrar");

  const sb = await criarClienteServidor();
  const { data: projeto } = await sb.from("projetos").select("*").eq("id", id).single();
  if (!projeto) notFound();

  const [{ data: atualizacoes }, { data: mensagens }] = await Promise.all([
    sb.from("atualizacoes").select("*").eq("projeto_id", id).order("criado_em", { ascending: false }),
    sb.from("mensagens").select("*").eq("projeto_id", id).order("criado_em"),
  ]);

  const admin = ehEquipe(perfil);
  const podeVerValores = !admin || perfil.papel === "admin" || !!perfil.ve_valores;

  return (
    <>
      <header className="sticky top-0 z-40 bg-papel/90 backdrop-blur border-b border-linha">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href={admin ? "/painel" : "/portal"}><Marca /></Link>
          <Link href={admin ? "/painel" : "/portal"} className="text-[14px] text-suave hover:text-acento">
            ← {admin ? "Painel" : "Meus projetos"}
          </Link>
          <div className="flex-1" />
          <form action={sair}><button className="text-[14px] text-suave hover:text-erro">Sair</button></form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-9">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-bold">{projeto.nome}</h1>
          <span className="selo bg-acento-fundo border border-acento-borda text-acento">
            {ROTULO[projeto.status] ?? projeto.status}
          </span>
        </div>

        <div className="cartao p-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-linha overflow-hidden">
              <div className="h-full bg-acento rounded-full transition-[width] duration-500" style={{ width: `${projeto.progresso}%` }} />
            </div>
            <span className="font-mono text-[13px] font-semibold tabular-nums">{projeto.progresso}%</span>
          </div>
          <dl className={`mt-5 grid gap-4 text-[14px] ${podeVerValores ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            {(
              podeVerValores
                ? [
                    ["Início", dataCurta(projeto.inicio)],
                    ["Entrega prevista", dataCurta(projeto.entrega_prevista)],
                    ["Valor fechado", projeto.valor_fechado ? brl(Number(projeto.valor_fechado)) : "-"],
                  ]
                : [
                    ["Início", dataCurta(projeto.inicio)],
                    ["Entrega prevista", dataCurta(projeto.entrega_prevista)],
                  ]
            ).map(([r, v]) => (
              <div key={r}>
                <dt className="font-mono text-[10px] tracking-widest uppercase text-suave">{r}</dt>
                <dd className="mt-1 font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {admin && <PublicarAtualizacao projetoId={id} progressoAtual={projeto.progresso} status={projeto.status} />}

        <section className="mt-8">
          <h2 className="text-xl font-bold">Atualizações</h2>
          {!atualizacoes?.length ? (
            <p className="mt-4 cartao p-6 text-[14.5px] text-suave">
              Ainda não há atualizações. Assim que o trabalho começar, elas aparecem aqui.
            </p>
          ) : (
            <ol className="mt-5 relative pl-6 border-l-2 border-linha">
              {atualizacoes.map((a) => (
                <li key={a.id} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-acento ring-4 ring-papel" />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-bold text-[16.5px]">{a.titulo}</h3>
                    {a.fase && (
                      <span className="selo bg-cartao2 border border-linha text-suave !font-normal font-mono !text-[11px]">{a.fase}</span>
                    )}
                    <span className="font-mono text-[11.5px] text-suave">{dataHora(a.criado_em)}</span>
                  </div>
                  {a.corpo && <p className="mt-1.5 text-[15px] text-tinta2 leading-relaxed whitespace-pre-line">{a.corpo}</p>}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Conversa</h2>
          <p className="mt-1.5 text-[14px] text-suave">
            Tudo que for combinado por aqui fica registrado, melhor que caçar mensagem no WhatsApp.
          </p>
          <Chat projetoId={id} eu={perfil.id} souAdmin={admin} iniciais={mensagens ?? []} />
        </section>
      </main>
    </>
  );
}
