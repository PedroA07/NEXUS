"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publicarAtualizacao, mudarStatusProjeto } from "@/app/acoes";
import { FASES } from "@/lib/estimativa";

const STATUS: [string, string][] = [
  ["planejamento", "Planejamento"],
  ["em_andamento", "Em andamento"],
  ["em_revisao", "Em revisão"],
  ["pausado", "Pausado"],
  ["concluido", "Concluído"],
];

export function PublicarAtualizacao({
  projetoId,
  progressoAtual,
  status,
}: {
  projetoId: string;
  progressoAtual: number;
  status: string;
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState({ titulo: "", corpo: "", fase: FASES[0][0], progresso: progressoAtual });
  const [erro, setErro] = useState("");

  const publicar = () =>
    iniciar(async () => {
      setErro("");
      if (!f.titulo.trim()) return setErro("Dê um título à atualização.");
      const r = await publicarAtualizacao(projetoId, f);
      if (!r.ok) return setErro(r.msg || "Não consegui publicar.");
      setF({ ...f, titulo: "", corpo: "" });
      setAberto(false);
      router.refresh();
    });

  const trocarStatus = (novo: string) =>
    iniciar(async () => {
      await mudarStatusProjeto(projetoId, novo);
      router.refresh();
    });

  return (
    <section className="cartao p-6 mt-6 border-acento-borda bg-acento-fundo/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Área da equipe</h2>
        <button onClick={() => setAberto(!aberto)} className="btn-p !py-2 !px-4 !text-[14px]">
          {aberto ? "Fechar" : "Publicar atualização"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS.map(([v, r]) => (
          <button key={v} onClick={() => trocarStatus(v)} disabled={pendente}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold border transition-colors disabled:opacity-60 ${
                    status === v ? "bg-acento text-white border-acento" : "bg-cartao text-tinta2 border-linha2 hover:border-acento hover:text-acento"
                  }`}>
            {r}
          </button>
        ))}
      </div>

      {aberto && (
        <div className="mt-5 grid gap-4">
          <div className="grid gap-1.5">
            <label className="rotulo text-[14px]">Título</label>
            <input className="campo" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })}
                   placeholder="Ex.: telas de cadastro prontas para você testar" />
          </div>
          <div className="grid gap-1.5">
            <label className="rotulo text-[14px]">Detalhes</label>
            <textarea className="campo min-h-24" value={f.corpo} onChange={(e) => setF({ ...f, corpo: e.target.value })}
                      placeholder="Escreva para o cliente, sem jargão. O que ficou pronto, o que vem agora, o que você precisa dele." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="rotulo text-[14px]">Fase</label>
              <select className="campo" value={f.fase} onChange={(e) => setF({ ...f, fase: e.target.value })}>
                {FASES.map(([nome]) => <option key={nome} value={nome}>{nome}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label className="rotulo text-[14px]">Progresso: {f.progresso}%</label>
              <input type="range" min={0} max={100} step={5} value={f.progresso}
                     onChange={(e) => setF({ ...f, progresso: Number(e.target.value) })}
                     className="accent-[var(--color-acento)] h-10" />
            </div>
          </div>
          {erro && <p className="text-[13.5px] font-semibold text-erro">{erro}</p>}
          <button onClick={publicar} disabled={pendente} className="btn-p justify-self-start disabled:opacity-60">
            {pendente ? "Publicando…" : "Publicar para o cliente"}
          </button>
        </div>
      )}
    </section>
  );
}
