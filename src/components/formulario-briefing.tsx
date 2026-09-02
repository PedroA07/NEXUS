"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SECOES, camposDoModo, secoesDoModo, opTexto, opDica, type Campo } from "@/lib/briefing";
import { enviarBriefing } from "@/app/acoes";

type Modo = "rapido" | "completo";
type Respostas = Record<string, string | string[]>;
const CHAVE = "nexus-briefing-rascunho";

export function FormularioBriefing() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo | null>(null);
  const [dados, setDados] = useState<Respostas>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [infos, setInfos] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState("");

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (bruto) {
        const r = JSON.parse(bruto);
        if (r?.dados && Object.keys(r.dados).length) {
          setDados(r.dados);
          setModo(r.modo || "completo");
        }
      }
    } catch {}
  }, []);

  const guardar = useCallback((m: Modo | null, d: Respostas) => {
    try { localStorage.setItem(CHAVE, JSON.stringify({ modo: m, dados: d })); } catch {}
  }, []);

  const definir = (id: string, valor: string | string[]) => {
    const novo = { ...dados, [id]: valor };
    setDados(novo);
    guardar(modo, novo);
    if (erros[id]) setErros((e) => { const c = { ...e }; delete c[id]; return c; });
  };

  const preenchido = (v: unknown) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim());

  if (!modo) {
    return (
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {([
          ["rapido", "5 a 7 minutos", "Versão rápida", "O essencial para a gente entender a ideia e dar uma estimativa inicial de prazo e valor."],
          ["completo", "15 a 20 minutos", "Versão completa", "Todos os detalhes: funcionalidades, domínio, hospedagem, banco de dados, prazo e manutenção. Gera uma proposta bem mais precisa."],
        ] as const).map(([id, tempo, titulo, texto]) => (
          <button key={id} onClick={() => { setModo(id); guardar(id, dados); }}
                  className="cartao p-6 text-left hover:border-acento hover:-translate-y-0.5 transition-all">
            <span className="olho">{tempo}</span>
            <h2 className="mt-2 text-[21px] font-bold">{titulo}</h2>
            <p className="mt-1.5 text-[14.5px] text-suave leading-relaxed">{texto}</p>
            <span className="mt-3 inline-block text-[14px] font-semibold text-acento">Começar →</span>
          </button>
        ))}
      </div>
    );
  }

  const secoes = secoesDoModo(modo);
  const todos = secoes.flatMap((s) => camposDoModo(s, modo)).filter((c) => c.t !== "aviso");
  const respondidos = todos.filter((c) => preenchido(dados[c.id])).length;

  async function enviar() {
    const novos: Record<string, string> = {};
    for (const c of todos) {
      if (c.req && !preenchido(dados[c.id])) novos[c.id] = "Preciso desta informação para conseguir te responder.";
    }
    if (Object.keys(novos).length) {
      setErros(novos);
      document.querySelector(`[data-campo="${Object.keys(novos)[0]}"]`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setEnviando(true);
    setFalha("");
    const r = await enviarBriefing(modo!, dados);
    setEnviando(false);
    if (!r.ok) { setFalha(r.msg || "Não consegui enviar agora."); return; }
    try { localStorage.removeItem(CHAVE); } catch {}
    router.push(`/solicitar/enviado?codigo=${encodeURIComponent(r.dado || "")}`);
  }

  const alternarInfo = (id: string) => setInfos((s) => ({ ...s, [id]: !s[id] }));

  const renderCampo = (c: Campo) => {
    if (c.t === "aviso") {
      return (
        <div key={c.id} className="my-6 rounded-2xl bg-ambar-fundo border border-ambar-linha p-5">
          <h3 className="font-display font-bold text-[16.5px] text-ambar">{c.r}</h3>
          {c.p?.map((par, i) => (
            <p key={i} className="mt-2.5 text-[14.5px] text-tinta2 leading-relaxed">{par}</p>
          ))}
        </div>
      );
    }

    const v = dados[c.id];
    const invalido = Boolean(erros[c.id]);

    return (
      <div key={c.id} data-campo={c.id} className="py-5 border-t border-linha">
        <div className="flex items-start gap-2">
          <label htmlFor={`f-${c.id}`} className="rotulo flex-1">
            {c.r} {c.req && <span className="text-erro">*</span>}
          </label>
          {c.i && (
            <button type="button" onClick={() => alternarInfo(c.id)} title="O que é isso?"
                    aria-expanded={!!infos[c.id]}
                    className={`shrink-0 w-[23px] h-[23px] rounded-full border text-[13px] font-display font-bold grid place-items-center transition-colors ${
                      infos[c.id] ? "bg-acento text-white border-acento" : "bg-acento-fundo text-acento border-acento-borda hover:bg-acento hover:text-white"
                    }`}>
              i<span className="sr-only"> O que é isso?</span>
            </button>
          )}
        </div>

        {c.i && infos[c.id] && (
          <p className="mt-2.5 rounded-xl bg-acento-fundo border border-acento-borda p-3.5 text-[14.5px] text-tinta2 leading-relaxed">
            {c.i}
          </p>
        )}
        {c.a && <p className="mt-1 mb-3 text-[14px] text-suave leading-relaxed max-w-[62ch]">{c.a}</p>}

        {c.t === "longo" ? (
          <textarea id={`f-${c.id}`} className="campo min-h-24 leading-relaxed" placeholder={c.ph}
                    value={(v as string) || ""} onChange={(e) => definir(c.id, e.target.value)} />
        ) : c.t === "escolha" || c.t === "multipla" ? (
          <div className={`grid gap-2 ${invalido ? "outline outline-1 outline-erro outline-offset-[6px] rounded-xl" : ""}`}>
            {c.o?.map((o) => {
              const texto = opTexto(o);
              const dica = opDica(o);
              const multi = c.t === "multipla";
              const marcado = multi ? Array.isArray(v) && v.includes(texto) : v === texto;
              return (
                <label key={texto}
                       className={`flex gap-3 items-start p-3 rounded-xl border cursor-pointer transition-colors ${
                         marcado ? "border-acento bg-acento-fundo" : "border-linha bg-cartao2 hover:border-linha2"
                       }`}>
                  <input type={multi ? "checkbox" : "radio"} name={`n-${c.id}`} value={texto} checked={marcado}
                         className="mt-0.5 w-[17px] h-[17px] accent-[var(--color-acento)] shrink-0"
                         onChange={(e) => {
                           if (!multi) return definir(c.id, texto);
                           const atual = Array.isArray(v) ? [...v] : [];
                           definir(c.id, e.target.checked ? [...atual, texto] : atual.filter((x) => x !== texto));
                         }} />
                  <span className="text-[15.5px] leading-snug">
                    {texto}
                    {dica && <small className="block text-suave text-[13.5px] leading-snug mt-0.5">{dica}</small>}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <input id={`f-${c.id}`} className="campo" placeholder={c.ph}
                 type={c.t === "tel" ? "tel" : c.t === "email" ? "email" : c.t === "data" ? "date" : "text"}
                 value={(v as string) || ""} onChange={(e) => definir(c.id, e.target.value)} />
        )}

        {erros[c.id] && <p className="mt-2 text-[13.5px] font-semibold text-erro">{erros[c.id]}</p>}
      </div>
    );
  };

  return (
    <>
      <div className="sticky top-14 z-30 -mx-5 px-5 py-2.5 bg-papel/90 backdrop-blur border-b border-linha flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-linha overflow-hidden">
          <div className="h-full bg-acento rounded-full transition-[width] duration-300"
               style={{ width: `${todos.length ? (respondidos / todos.length) * 100 : 0}%` }} />
        </div>
        <span className="font-mono text-xs text-suave tabular-nums">{respondidos}/{todos.length}</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-3 pt-7">
        <h2 className="text-[26px] font-bold">
          {modo === "rapido" ? "Formulário rápido" : "Formulário completo"}
        </h2>
        <button onClick={() => { const m = modo === "rapido" ? "completo" : "rapido"; setModo(m); guardar(m, dados); }}
                className="text-[14.5px] font-semibold text-acento underline underline-offset-4 hover:text-acento-forte">
          {modo === "rapido" ? "quero responder o completo" : "prefiro a versão rápida"}
        </button>
      </div>

      {secoes.map((s, i) => (
        <section key={s.id} className="cartao p-6 my-5">
          <div className="flex gap-3.5 items-start">
            <span className="shrink-0 w-[30px] h-[30px] rounded-lg bg-acento-fundo text-acento font-mono text-[13px] grid place-items-center mt-0.5">
              {i + 1}
            </span>
            <div>
              <h3 className="text-[21px] font-bold">{s.titulo}</h3>
              <p className="mt-1 text-[14.5px] text-suave leading-relaxed">{s.resumo}</p>
            </div>
          </div>
          {s.nota && (
            <div className="mt-4 rounded-xl bg-acento-fundo border border-acento-borda p-4 text-[14.5px] text-tinta2 leading-relaxed"
                 dangerouslySetInnerHTML={{ __html: s.nota }} />
          )}
          {camposDoModo(s, modo).map(renderCampo)}
        </section>
      ))}

      {falha && <p className="rounded-xl bg-erro-fundo border border-erro/30 p-4 text-[14.5px] font-semibold text-erro">{falha}</p>}

      <div className="flex flex-wrap gap-3 mt-6">
        <button onClick={enviar} disabled={enviando} className="btn-p disabled:opacity-60">
          {enviando ? "Enviando…" : "Finalizar e enviar"}
        </button>
        <button onClick={() => setModo(null)} className="btn-s">Voltar ao início</button>
      </div>
      <p className="mt-8 pt-5 border-t border-linha text-[13.5px] text-suave leading-relaxed">
        O que você escrever aqui é usado só para montar a sua proposta. Pode responder em partes:
        o rascunho fica salvo neste navegador.
      </p>
    </>
  );
}
