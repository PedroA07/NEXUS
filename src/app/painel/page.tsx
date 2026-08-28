import Link from "next/link";
import { criarClienteServidor, perfilAtual } from "@/lib/supabase/servidor";
import { brl, relativo, dataCurta } from "@/lib/formato";

const CORES: Record<string, string> = {
  nova: "bg-acento-fundo text-acento border-acento-borda",
  em_analise: "bg-ambar-fundo text-ambar border-ambar-linha",
  aprovada: "bg-ok-fundo text-ok border-ok/25",
  recusada: "bg-erro-fundo text-erro border-erro/25",
  convertida: "bg-cartao2 text-suave border-linha",
};
const ROTULOS: Record<string, string> = {
  nova: "Nova",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
  convertida: "Virou projeto",
};

export default async function Painel() {
  const perfil = await perfilAtual();
  const podeVerValores = perfil?.papel === "admin" || !!perfil?.ve_valores;
  const sb = await criarClienteServidor();

  const [{ data: solicitacoes }, { data: projetos }] = await Promise.all([
    sb.from("solicitacoes").select("*").order("criado_em", { ascending: false }).limit(100),
    sb.from("projetos").select("id,nome,status,progresso,valor_fechado,entrega_prevista").order("criado_em", { ascending: false }).limit(20),
  ]);

  const novas = solicitacoes?.filter((s) => s.status === "nova").length ?? 0;
  const emAndamento = projetos?.filter((p) => p.status === "em_andamento").length ?? 0;
  const carteira = projetos?.reduce((a, p) => a + Number(p.valor_fechado || 0), 0) ?? 0;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="olho">Painel interno</p>
          <h1 className="mt-2 text-3xl font-bold">Solicitações</h1>
        </div>
      </div>

      <div className={`mt-7 grid gap-3 ${podeVerValores ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {(
          podeVerValores
            ? [
                ["Novas para analisar", String(novas), novas > 0 ? "precisa de resposta" : "tudo em dia"],
                ["Projetos em andamento", String(emAndamento), "com cliente ativo"],
                ["Carteira fechada", brl(carteira), "soma dos projetos abertos"],
              ]
            : [
                ["Novas para analisar", String(novas), novas > 0 ? "precisa de resposta" : "tudo em dia"],
                ["Projetos em andamento", String(emAndamento), "com cliente ativo"],
              ]
        ).map(([r, v, o], i) => (
          <div key={r} className={`cartao p-5 ${i === 0 && novas > 0 ? "bg-acento-fundo border-acento-borda" : ""}`}>
            <p className="font-mono text-[10.5px] tracking-widest uppercase text-suave">{r}</p>
            <p className={`mt-2 font-display font-bold text-[27px] tabular-nums ${i === 0 && novas > 0 ? "text-acento" : ""}`}>{v}</p>
            <p className="mt-1 text-[12.5px] text-suave">{o}</p>
          </div>
        ))}
      </div>

      {!solicitacoes?.length ? (
        <p className="mt-8 cartao p-10 text-center text-suave">
          Nenhuma solicitação ainda. Divulgue o link <span className="font-mono">/solicitar</span> e elas aparecem aqui.
        </p>
      ) : (
        <div className="mt-8 cartao overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-linha">
                {["Código", "Cliente", "Tipo", ...(podeVerValores ? ["Estimativa"] : []), "Status", "Recebida"].map((h) => (
                  <th key={h} className="text-left font-mono text-[10.5px] tracking-widest uppercase text-suave font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((s) => {
                const est = s.estimativa as { total?: number; semanas?: number } | null;
                return (
                  <tr key={s.id} className="border-b border-linha last:border-0 hover:bg-cartao2">
                    <td className="px-4 py-3 font-mono text-[12.5px]">
                      <Link href={`/painel/${s.id}`} className="text-acento font-semibold hover:underline">{s.codigo}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.nome}</span>
                      {s.empresa && <span className="block text-[12.5px] text-suave">{s.empresa}</span>}
                    </td>
                    <td className="px-4 py-3 text-tinta2">{String((s.respostas as Record<string, string>)?.tipo || "—")}</td>
                    {podeVerValores && (
                      <td className="px-4 py-3 tabular-nums font-mono text-[12.5px]">
                        {est?.total ? (
                          <>
                            {brl(est.total)}
                            <span className="block text-suave">{est.semanas} sem</span>
                          </>
                        ) : "—"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className={`selo border ${CORES[s.status] ?? CORES.convertida}`}>{ROTULOS[s.status] ?? s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-suave text-[12.5px] whitespace-nowrap">{relativo(s.criado_em)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {projetos && projetos.length > 0 && (
        <>
          <h2 className="mt-12 text-2xl font-bold">Projetos</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projetos.map((p) => (
              <Link key={p.id} href={`/portal/${p.id}`} className="cartao p-5 hover:border-acento transition-colors">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-bold text-[17px]">{p.nome}</h3>
                  <span className="font-mono text-[11px] text-suave tabular-nums">{p.progresso}%</span>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-linha overflow-hidden">
                  <div className="h-full bg-acento rounded-full" style={{ width: `${p.progresso}%` }} />
                </div>
                <p className="mt-3 text-[13px] text-suave">
                  {podeVerValores && p.valor_fechado ? `${brl(Number(p.valor_fechado))} · ` : ""}
                  entrega {dataCurta(p.entrega_prevista)}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
