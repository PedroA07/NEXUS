import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClienteServidor, perfilAtual } from "@/lib/supabase/servidor";
import { brl, brl2, dataCurta, dataHora } from "@/lib/formato";
import { AcoesSolicitacao } from "@/components/acoes-solicitacao";
import { SECOES, camposDoModo } from "@/lib/briefing";
import type { Estimativa } from "@/lib/estimativa";

export default async function DetalheSolicitacao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfil = await perfilAtual();
  const podeVerValores = perfil?.papel === "admin" || !!perfil?.ve_valores;
  const sb = await criarClienteServidor();
  const { data: s } = await sb.from("solicitacoes").select("*").eq("id", id).single();
  if (!s) notFound();

  const est = s.estimativa as Estimativa | null;
  const respostas = (s.respostas ?? {}) as Record<string, string | string[]>;
  const modo = (s.modo === "rapido" ? "rapido" : "completo") as "rapido" | "completo";

  const partes = est
    ? [
        ["Desenvolvimento", est.desenvolvimento],
        ["IA e APIs (1º ano)", est.anualIA],
        ["Infraestrutura e gestão (1º ano)", est.anualInfra],
        ["Margem e impostos", est.margemImposto],
      ] as [string, number][]
    : [];
  const somaPartes = partes.reduce((a, [, v]) => a + v, 0) || 1;
  const cores = ["bg-[#4372D6]", "bg-[#0F8A6B]", "bg-[#C2790E]", "bg-[#A64AA0]"];

  return (
    <>
      <Link href="/painel" className="text-[14px] text-suave hover:text-acento">← Todas as solicitações</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[13px] text-acento">{s.codigo}</p>
          <h1 className="mt-1 text-3xl font-bold">{s.nome}</h1>
          <p className="mt-1.5 text-[15px] text-suave">
            {[s.empresa, s.whatsapp, s.email].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 text-[13px] text-suave">
            Formulário {modo === "rapido" ? "rápido" : "completo"} · recebido em {dataHora(s.criado_em)}
          </p>
        </div>
        <div className="flex gap-2">
          {s.whatsapp && (
            <a className="btn-s" target="_blank" rel="noreferrer"
               href={`https://wa.me/55${String(s.whatsapp).replace(/\D/g, "")}`}>
              WhatsApp
            </a>
          )}
          {s.email && <a className="btn-s" href={`mailto:${s.email}`}>E-mail</a>}
        </div>
      </div>

      {podeVerValores && est && (
        <section className="cartao p-6 mt-7">
          <h2 className="text-xl font-bold">Estimativa automática</h2>
          <p className="mt-1 text-[13.5px] text-suave">
            Calculada a partir das respostas, com os parâmetros padrão. Serve para triagem —
            o valor real sai depois do levantamento.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              ["Esforço", `${est.horas} h`, `${est.gerencia}h de gestão · ${est.buffer}h de buffer`],
              ["Prazo", `${est.semanas} sem`, `entrega ~ ${dataCurta(est.entrega)}`],
              ["Valor", brl(est.total), `faixa ${brl(est.minimo)}–${brl(est.maximo)}`],
              ["Recorrente", brl2(est.recorrenteMes), "por mês, depois do 1º ano"],
            ].map(([r, v, o], i) => (
              <div key={r} className={`rounded-xl p-4 border ${i === 2 ? "bg-acento-fundo border-acento-borda" : "bg-cartao2 border-linha"}`}>
                <p className="font-mono text-[10px] tracking-widest uppercase text-suave">{r}</p>
                <p className={`mt-1.5 font-display font-bold text-[22px] tabular-nums ${i === 2 ? "text-acento" : ""}`}>{v}</p>
                <p className="mt-1 text-[12px] text-suave leading-snug">{o}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex gap-0.5 h-7 rounded-md overflow-hidden">
              {partes.map(([nome, v], i) => (
                <div key={nome} className={cores[i]} style={{ flex: v / somaPartes }} title={`${nome}: ${brl(v)}`} />
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-tinta2">
              {partes.map(([nome, v], i) => (
                <li key={nome} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-sm ${cores[i]}`} />
                  {nome} · {brl(v)}
                </li>
              ))}
            </ul>
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-[14px] font-semibold text-acento">Ver cronograma e itens</summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-linha">
                    {["Fase", "Horas", "Semanas", "Começa", "Termina"].map((h) => (
                      <th key={h} className="text-left font-mono text-[10px] tracking-widest uppercase text-suave font-medium py-2 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {est.fases.map((f) => (
                    <tr key={f.nome} className="border-b border-linha last:border-0">
                      <td className="py-2 pr-4">{f.nome}</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">{f.horas}</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">{f.semanas}</td>
                      <td className="py-2 pr-4">{dataCurta(f.inicio)}</td>
                      <td className="py-2 pr-4">{dataCurta(f.fim)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="mt-4 grid gap-1 text-[13px] text-tinta2">
                {est.itens.map((it, i) => (
                  <li key={i} className="flex justify-between gap-4 border-b border-linha/60 py-1">
                    <span><span className="text-suave">{it.grupo} ·</span> {it.nome}</span>
                    <span className="font-mono tabular-nums shrink-0">{it.horas}h</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </section>
      )}

      <AcoesSolicitacao
        id={s.id}
        status={s.status}
        observacoes={s.observacoes_internas ?? ""}
        podeVerValores={podeVerValores}
        sugestao={{
          nome: `${String(respostas.tipo || "Projeto")} — ${s.empresa || s.nome}`,
          valor: podeVerValores && est ? Math.round(est.total) : 0,
          prazoSemanas: est?.semanas ?? 8,
          inicio: est?.inicio ?? "",
          entrega: est?.entrega ?? "",
        }}
      />

      <section className="cartao p-6 mt-6">
        <h2 className="text-xl font-bold">Respostas do briefing</h2>
        <div className="mt-4 grid gap-6">
          {SECOES.map((secao) => {
            const campos = camposDoModo(secao, modo).filter((c) => {
              const v = respostas[c.id];
              return c.t !== "aviso" && v && (Array.isArray(v) ? v.length : String(v).trim());
            });
            if (!campos.length) return null;
            return (
              <div key={secao.id}>
                <h3 className="font-mono text-[10.5px] tracking-widest uppercase text-acento">{secao.titulo}</h3>
                <dl className="mt-2.5 grid gap-2.5">
                  {campos.map((c) => {
                    const v = respostas[c.id];
                    return (
                      <div key={c.id} className="grid sm:grid-cols-[minmax(0,15rem)_1fr] gap-1 sm:gap-4 border-b border-linha/70 pb-2.5">
                        <dt className="text-[13.5px] text-suave">{c.r}</dt>
                        <dd className="text-[14.5px] text-tinta2 whitespace-pre-line">
                          {Array.isArray(v) ? (
                            <ul className="grid gap-0.5">{v.map((x) => <li key={x}>• {x}</li>)}</ul>
                          ) : String(v)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
