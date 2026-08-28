"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { mudarStatusSolicitacao, salvarObservacoes, abrirProjeto } from "@/app/acoes";

const STATUS: [string, string][] = [
  ["nova", "Nova"],
  ["em_analise", "Em análise"],
  ["aprovada", "Aprovada"],
  ["recusada", "Recusada"],
];

export function AcoesSolicitacao({
  id,
  status,
  observacoes,
  sugestao,
  podeVerValores,
}: {
  id: string;
  status: string;
  observacoes: string;
  sugestao: { nome: string; valor: number; prazoSemanas: number; inicio: string; entrega: string };
  podeVerValores: boolean;
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [notas, setNotas] = useState(observacoes);
  const [salvo, setSalvo] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const [form, setForm] = useState(podeVerValores ? sugestao : { ...sugestao, valor: 0 });
  const [aviso, setAviso] = useState("");

  const mudar = (novo: string) =>
    iniciar(async () => {
      await mudarStatusSolicitacao(id, novo);
      router.refresh();
    });

  const guardarNotas = () =>
    iniciar(async () => {
      await salvarObservacoes(id, notas);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    });

  const criar = () =>
    iniciar(async () => {
      setAviso("");
      const r = await abrirProjeto(id, form);
      if (!r.ok) return setAviso(r.msg || "Não consegui abrir o projeto.");
      router.push(`/portal/${r.dado}`);
    });

  return (
    <section className="cartao p-6 mt-6">
      <h2 className="text-xl font-bold">Decisão</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS.map(([valor, rotulo]) => (
          <button key={valor} onClick={() => mudar(valor)} disabled={pendente}
                  className={`rounded-xl px-4 py-2 text-[14px] font-semibold border transition-colors disabled:opacity-60 ${
                    status === valor
                      ? "bg-acento text-white border-acento"
                      : "bg-cartao2 text-tinta2 border-linha2 hover:border-acento hover:text-acento"
                  }`}>
            {rotulo}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label htmlFor="notas" className="rotulo text-[14.5px]">Observações internas</label>
        <p className="text-[13px] text-suave mb-2">O cliente nunca vê este campo.</p>
        <textarea id="notas" className="campo min-h-24 text-[14.5px]" value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="O que chamou atenção, riscos, o que perguntar na conversa…" />
        <div className="mt-2 flex items-center gap-3">
          <button onClick={guardarNotas} disabled={pendente} className="btn-s !py-2 !px-4 !text-[14px]">Salvar</button>
          {salvo && <span className="text-[13.5px] font-semibold text-ok">Salvo.</span>}
        </div>
      </div>

      <div className="mt-7 pt-6 border-t border-linha">
        {!abrindo ? (
          <>
            <h3 className="font-bold text-[16.5px]">Virar projeto</h3>
            <p className="mt-1.5 text-[14px] text-suave leading-relaxed max-w-2xl">
              Abre o projeto, convida o cliente por e-mail e libera a área onde ele acompanha as
              atualizações e conversa com você. Faça isso depois da conversa de levantamento,
              com o valor real já acertado.
            </p>
            <button onClick={() => setAbrindo(true)} className="btn-p mt-4">Abrir projeto e dar acesso</button>
          </>
        ) : (
          <>
            <h3 className="font-bold text-[16.5px]">Dados do projeto</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 grid gap-1.5">
                <label className="rotulo text-[14px]">Nome do projeto</label>
                <input className="campo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <label className="rotulo text-[14px]">Valor fechado (R$)</label>
                {podeVerValores ? (
                  <input className="campo font-mono" type="number" min={0} value={form.valor}
                         onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} />
                ) : (
                  <input className="campo font-mono opacity-60" disabled placeholder="peça a um admin para preencher" />
                )}
              </div>
              <div className="grid gap-1.5">
                <label className="rotulo text-[14px]">Prazo (semanas)</label>
                <input className="campo font-mono" type="number" min={1} value={form.prazoSemanas}
                       onChange={(e) => setForm({ ...form, prazoSemanas: Number(e.target.value) })} />
              </div>
              <div className="grid gap-1.5">
                <label className="rotulo text-[14px]">Início</label>
                <input className="campo" type="date" value={form.inicio}
                       onChange={(e) => setForm({ ...form, inicio: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <label className="rotulo text-[14px]">Entrega prevista</label>
                <input className="campo" type="date" value={form.entrega}
                       onChange={(e) => setForm({ ...form, entrega: e.target.value })} />
              </div>
            </div>
            {aviso && (
              <p className="mt-4 rounded-xl bg-erro-fundo border border-erro/25 p-3 text-[14px] font-semibold text-erro">{aviso}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={criar} disabled={pendente} className="btn-p disabled:opacity-60">
                {pendente ? "Abrindo…" : "Confirmar e convidar o cliente"}
              </button>
              <button onClick={() => setAbrindo(false)} className="btn-s">Cancelar</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
