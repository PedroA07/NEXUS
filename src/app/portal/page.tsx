import Link from "next/link";
import { redirect } from "next/navigation";
import { Marca } from "@/components/marca";
import { criarClienteServidor, perfilAtual, ehEquipe } from "@/lib/supabase/servidor";
import { sair } from "@/app/acoes";
import { brl, dataCurta } from "@/lib/formato";

export const metadata = { title: "Meus projetos" };

const ROTULO: Record<string, string> = {
  planejamento: "Planejamento",
  em_andamento: "Em andamento",
  em_revisao: "Em revisão",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export default async function Portal() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/entrar");
  const podeVerValores = !ehEquipe(perfil) || perfil.papel === "admin" || !!perfil.ve_valores;

  const sb = await criarClienteServidor();
  const { data: projetos } = await sb
    .from("projetos").select("*").order("criado_em", { ascending: false });

  return (
    <>
      <header className="sticky top-0 z-40 bg-papel/90 backdrop-blur border-b border-linha">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href="/"><Marca /></Link>
          <span className="text-[14px] text-suave">Área do cliente</span>
          <div className="flex-1" />
          <Link href="/conta" className="hidden sm:block text-[13.5px] text-suave hover:text-acento">
            {perfil.nome || perfil.email}
          </Link>
          <form action={sair}><button className="text-[14px] text-suave hover:text-erro">Sair</button></form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold">Olá, {(perfil.nome || "").split(" ")[0] || "tudo bem?"}</h1>
        <p className="mt-2 text-[16px] text-tinta2 leading-relaxed">
          Aqui você acompanha o andamento de cada projeto e fala direto comigo.
        </p>

        {!projetos?.length ? (
          <div className="mt-9 cartao p-8">
            <h2 className="text-lg font-bold">Nenhum projeto por aqui ainda</h2>
            <p className="mt-2 text-[15px] text-suave leading-relaxed">
              Assim que a gente fechar o escopo, o projeto aparece nesta página com as
              atualizações e o chat liberados.
            </p>
            <Link href="/solicitar" className="btn-s mt-5">Enviar um novo briefing</Link>
          </div>
        ) : (
          <div className="mt-9 grid gap-4">
            {projetos.map((p) => (
              <Link key={p.id} href={`/portal/${p.id}`} className="cartao p-6 hover:border-acento transition-colors">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-xl font-bold">{p.nome}</h2>
                  <span className="selo bg-acento-fundo border border-acento-borda text-acento">
                    {ROTULO[p.status] ?? p.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-linha overflow-hidden">
                    <div className="h-full bg-acento rounded-full transition-[width]" style={{ width: `${p.progresso}%` }} />
                  </div>
                  <span className="font-mono text-[12px] text-suave tabular-nums">{p.progresso}%</span>
                </div>
                <p className="mt-3 text-[13.5px] text-suave">
                  Entrega prevista: {dataCurta(p.entrega_prevista)}
                  {podeVerValores && p.valor_fechado ? ` · ${brl(Number(p.valor_fechado))}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
