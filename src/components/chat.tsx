"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { enviarMensagem } from "@/app/acoes";
import { relativo } from "@/lib/formato";

type Mensagem = { id: string; projeto_id: string; autor_id: string; corpo: string; criado_em: string };

export function Chat({
  projetoId,
  eu,
  souAdmin,
  iniciais,
}: {
  projetoId: string;
  eu: string;
  souAdmin: boolean;
  iniciais: Mensagem[];
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(iniciais);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [pendente, iniciar] = useTransition();
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = criarClienteNavegador();
    const canal = sb
      .channel(`projeto-${projetoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensagens", filter: `projeto_id=eq.${projetoId}` },
        (payload) => {
          const nova = payload.new as Mensagem;
          setMensagens((atual) => (atual.some((m) => m.id === nova.id) ? atual : [...atual, nova]));
        },
      )
      .subscribe();
    return () => { sb.removeChannel(canal); };
  }, [projetoId]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mensagens.length]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const corpo = texto.trim();
    if (!corpo) return;
    setTexto("");
    setErro("");
    iniciar(async () => {
      const r = await enviarMensagem(projetoId, corpo);
      if (!r.ok) {
        setErro(r.msg || "Não consegui enviar.");
        setTexto(corpo);
      }
    });
  }

  return (
    <div className="cartao mt-5 overflow-hidden">
      <div className="max-h-[26rem] overflow-y-auto p-5 grid gap-3 bg-cartao2">
        {mensagens.length === 0 && (
          <p className="text-center text-[14px] text-suave py-8">
            Nenhuma mensagem ainda. {souAdmin ? "Diga um oi para o cliente." : "Pode escrever à vontade."}
          </p>
        )}
        {mensagens.map((m) => {
          const meu = m.autor_id === eu;
          return (
            <div key={m.id} className={`max-w-[85%] ${meu ? "justify-self-end" : "justify-self-start"}`}>
              <div className={`rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-line ${
                meu ? "bg-acento text-white rounded-br-md" : "bg-cartao border border-linha text-tinta rounded-bl-md"
              }`}>
                {m.corpo}
              </div>
              <span className={`block mt-1 font-mono text-[10.5px] text-suave ${meu ? "text-right" : ""}`}>
                {relativo(m.criado_em)}
              </span>
            </div>
          );
        })}
        <div ref={fim} />
      </div>

      <form onSubmit={enviar} className="border-t border-linha p-3 flex gap-2 items-end bg-cartao">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(e); }
          }}
          rows={1}
          placeholder="Escreva uma mensagem…"
          className="campo min-h-11 max-h-40 resize-y text-[15px] py-2.5"
        />
        <button className="btn-p !py-2.5 !px-5 shrink-0 disabled:opacity-60" disabled={pendente || !texto.trim()}>
          Enviar
        </button>
      </form>
      {erro && <p className="px-4 pb-3 text-[13.5px] font-semibold text-erro">{erro}</p>}
    </div>
  );
}
