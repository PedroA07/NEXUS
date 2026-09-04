"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { camposDoModo, opDica, opTexto, secoesDoModo, type Campo } from "@/lib/briefing";
import { enviarBriefing } from "@/app/acoes";

type Modo = "rapido" | "completo";
type Respostas = Record<string, string | string[]>;
const CHAVE = "nexus-hub-briefing-wizard";

function campoSeAplica(campo: Campo, respostas: Respostas) {
  const tipo = respostas.tipo;
  const plataformas = Array.isArray(respostas.plataformas) ? respostas.plataformas : [];
  const pagamentos = Array.isArray(respostas.pagamentos) ? respostas.pagamentos : [];
  const integracoes = Array.isArray(respostas.integracoes) ? respostas.integracoes : [];
  const dadosPessoais = Array.isArray(respostas.dadosPessoais) ? respostas.dadosPessoais : [];

  if (campo.id === "existenteLink") return Boolean(respostas.existente) && respostas.existente !== "Não, é do zero" && respostas.existente !== "Não sei";
  if (campo.id === "plataformas") return !["Automação / robô", "Painel de dados e relatórios", "Inteligência artificial"].includes(String(tipo));
  if (campo.id === "offline") return plataformas.some((valor) => /Android|iPhone|Windows|Mac/.test(valor));
  if (["logo", "identidade", "estilo"].includes(campo.id)) return ["Site institucional", "Página única de vendas", "Loja virtual", "Sistema interno / painel de gestão", "Aplicativo de celular", "Jogo", "Ainda não sei, preciso de ajuda pra decidir", "Outro (explico abaixo)"].includes(String(tipo));
  if (["textos", "imagens"].includes(campo.id)) return ["Site institucional", "Página única de vendas", "Loja virtual"].includes(String(tipo));
  if (["dominio", "emailProf"].includes(campo.id)) return !["Programa de computador", "Jogo"].includes(String(tipo));
  if (["banco"].includes(campo.id)) return tipo !== "Página única de vendas";
  if (campo.id === "backup") return Boolean(respostas.banco) && respostas.banco !== "Acho que não vou precisar guardar informações";
  if (campo.id === "lojas") return tipo === "Aplicativo de celular" || plataformas.some((valor) => /Android|iPhone/.test(valor));
  if (campo.id === "pagamentos") return ["Site institucional", "Página única de vendas", "Loja virtual", "Sistema interno / painel de gestão", "Aplicativo de celular", "Jogo"].includes(String(tipo));
  if (campo.id === "gateway") return pagamentos.length > 0 && !pagamentos.includes("Não vou receber pagamento pelo sistema");
  if (campo.id === "integracoesQuais") return integracoes.includes("Sistema que já uso (ERP, CRM, sistema do contador)");
  if (campo.id === "politicas") return dadosPessoais.length > 0 && !dadosPessoais.includes("Nenhuma informação pessoal");
  if (campo.id === "prazoData") return Boolean(respostas.prazo) && respostas.prazo !== "Sem data definida";
  return true;
}

export function FormularioBriefingWizard() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo | null>(null);
  const [dados, setDados] = useState<Respostas>({});
  const [indice, setIndice] = useState(0);
  const [erro, setErro] = useState("");
  const [falha, setFalha] = useState("");
  const [enviando, setEnviando] = useState(false);

  const passos = useMemo(() => {
    if (!modo) return [];
    return secoesDoModo(modo).flatMap((secao) => camposDoModo(secao, modo)).filter((campo) => campo.t !== "aviso" && campoSeAplica(campo, dados));
  }, [modo, dados]);
  const campo = passos[indice];
  const respondidos = passos.filter((item) => {
    const valor = dados[item.id];
    return Array.isArray(valor) ? valor.length > 0 : Boolean(valor && String(valor).trim());
  }).length;
  const percentual = passos.length ? (indice / Math.max(1, passos.length - 1)) * 100 : 0;

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) || "null");
      if (salvo?.modo && salvo?.dados) {
        setModo(salvo.modo);
        setDados(salvo.dados);
        setIndice(salvo.indice || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (passos.length && indice >= passos.length) setIndice(passos.length - 1);
  }, [passos.length, indice]);

  const salvar = (novoModo: Modo | null, novasRespostas: Respostas, novoIndice = indice) => {
    try { localStorage.setItem(CHAVE, JSON.stringify({ modo: novoModo, dados: novasRespostas, indice: novoIndice })); } catch {}
  };

  const definir = (id: string, valor: string | string[]) => {
    const novo = { ...dados, [id]: valor };
    setDados(novo);
    setErro("");
    salvar(modo, novo);
  };

  const respondido = (item: Campo) => {
    const valor = dados[item.id];
    return Array.isArray(valor) ? valor.length > 0 : Boolean(valor && String(valor).trim());
  };

  const iniciar = (novoModo: Modo) => {
    setModo(novoModo);
    setIndice(0);
    salvar(novoModo, dados, 0);
  };

  const continuar = () => {
    if (!campo) return;
    if (campo.req && !respondido(campo)) {
      setErro("Responda esta pergunta para continuar.");
      return;
    }
    if (indice >= passos.length - 1) {
      void enviar();
      return;
    }
    const proximo = indice + 1;
    setIndice(proximo);
    salvar(modo, dados, proximo);
    setErro("");
  };

  const enviar = async () => {
    if (!modo) return;
    const faltando = passos.find((item) => item.req && !respondido(item));
    if (faltando) {
      const alvo = passos.indexOf(faltando);
      setIndice(alvo);
      setErro("Responda esta pergunta para continuar.");
      return;
    }
    setEnviando(true);
    setFalha("");
    const resultado = await enviarBriefing(modo, dados);
    setEnviando(false);
    if (!resultado.ok) {
      setFalha(resultado.msg || "Não consegui enviar agora.");
      return;
    }
    try { localStorage.removeItem(CHAVE); } catch {}
    router.push(`/solicitar/enviado?codigo=${encodeURIComponent(resultado.dado || "")}`);
  };

  if (!modo) {
    return (
      <div className="mt-12 grid gap-px border-t border-linha sm:grid-cols-2">
        <button type="button" onClick={() => iniciar("rapido")} className="border-b border-linha p-7 text-left transition-colors hover:bg-[#12141c] sm:pr-10">
          <span className="olho-suave">5 a 7 minutos</span>
          <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.6rem)] font-bold leading-[1.04]">Versão rápida</h2>
          <p className="mt-4 max-w-[38ch] text-[15.5px] text-tinta2 leading-[1.7]">O essencial para entender a ideia e dar uma estimativa inicial de prazo e valor.</p>
          <span className="mt-7 inline-flex font-mono text-[12px] tracking-[.14em] uppercase">Começar <span className="ml-3">→</span></span>
        </button>
        <button type="button" onClick={() => iniciar("completo")} className="border-b border-linha p-7 text-left transition-colors hover:bg-[#12141c] sm:border-l sm:pl-10">
          <span className="olho">15 a 20 minutos · recomendado</span>
          <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.6rem)] font-bold leading-[1.04]">Versão completa</h2>
          <p className="mt-4 max-w-[38ch] text-[15.5px] text-tinta2 leading-[1.7]">Todos os detalhes para gerar uma proposta bem mais precisa.</p>
          <span className="mt-7 inline-flex font-mono text-[12px] tracking-[.14em] uppercase">Começar <span className="ml-3">→</span></span>
        </button>
      </div>
    );
  }

  if (!campo) return null;
  const valor = dados[campo.id];
  const multi = campo.t === "multipla";
  const escolhas = campo.t === "escolha" || multi;

  return (
    <div className="mt-12 -mx-6 sm:-mx-[clamp(24px,5vw,96px)] border-t border-linha">
      <header className="sticky top-[76px] z-30 border-b border-linha bg-papel/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1360px] items-center gap-5 px-6 py-3 sm:px-[clamp(24px,5vw,96px)]">
          <span className="font-mono text-[11px] tracking-[.18em] uppercase text-suave whitespace-nowrap">{modo === "rapido" ? "Versão rápida" : "Versão completa"}</span>
          <div className="h-px flex-1 bg-linha"><div className="h-px bg-ember transition-[width] duration-500" style={{ width: `${percentual}%` }} /></div>
          <span className="font-mono text-[12px] text-tinta2 tabular-nums whitespace-nowrap">{String(indice + 1).padStart(2, "0")} / {String(passos.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => { const outro = modo === "rapido" ? "completo" : "rapido"; iniciar(outro); }} className="hidden border-b border-linha2 pb-1 font-mono text-[11px] tracking-[.14em] uppercase text-tinta2 hover:border-ember hover:text-tinta sm:block">Versão {modo === "rapido" ? "completa" : "rápida"}</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1360px] gap-12 px-6 py-10 sm:px-[clamp(24px,4vw,56px)] lg:grid-cols-[1fr_288px] lg:gap-16">
        <main className="min-h-[min(56vh,520px)]">
          <div className="mb-10 flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-[.2em] uppercase text-ember">{campo.id}</span>
            <span className="h-px w-8 bg-linha2" />
            <span className="font-mono text-[11px] tracking-[.18em] uppercase text-suave">{campo.req ? "Obrigatório" : "Opcional"}</span>
          </div>
          <h2 className="max-w-[18ch] text-[clamp(2rem,5vw,4.6rem)] font-bold leading-[.98] tracking-[-.04em]">{campo.r}</h2>
          {campo.a && <p className="mt-5 max-w-[54ch] text-[16px] text-tinta2 leading-[1.7]">{campo.a}</p>}
          {campo.i && <p className="mt-5 max-w-[54ch] border-l-2 border-ember bg-acento-fundo p-4 text-[14.5px] text-tinta2 leading-[1.7]">{campo.i}</p>}

          <div className="mt-9 max-w-[760px]">
            {escolhas ? (
              <div className="grid gap-px sm:grid-cols-2">
                {campo.o?.map((opcao) => {
                  const texto = opTexto(opcao);
                  const marcado = multi ? Array.isArray(valor) && valor.includes(texto) : valor === texto;
                  return (
                    <label key={texto} className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${marcado ? "border-ember bg-[#15131a]" : "border-linha hover:border-linha2"}`}>
                      <input type={multi ? "checkbox" : "radio"} name={`wizard-${campo.id}`} checked={marcado} value={texto} className="mt-1 h-4 w-4 accent-[var(--color-ember)]" onChange={(event) => {
                        if (!multi) return definir(campo.id, texto);
                        const atual = Array.isArray(valor) ? valor : [];
                        definir(campo.id, event.target.checked ? [...atual, texto] : atual.filter((item) => item !== texto));
                      }} />
                      <span className="text-[15px] leading-[1.45]">{texto}{opDica(opcao) && <small className="mt-1 block text-[13px] text-suave">{opDica(opcao)}</small>}</span>
                    </label>
                  );
                })}
              </div>
            ) : campo.t === "longo" ? (
              <textarea className="campo min-h-36 resize-y leading-[1.6]" placeholder={campo.ph} value={(valor as string) || ""} onChange={(event) => definir(campo.id, event.target.value)} />
            ) : (
              <input className="campo" type={campo.t === "tel" ? "tel" : campo.t === "email" ? "email" : campo.t === "data" ? "date" : "text"} placeholder={campo.ph} value={(valor as string) || ""} onChange={(event) => definir(campo.id, event.target.value)} />
            )}
          </div>

          {erro && <p className="mt-5 border-l-2 border-erro bg-erro-fundo p-3 text-[14px] font-semibold text-erro">{erro}</p>}
          {falha && <p className="mt-5 border-l-2 border-erro bg-erro-fundo p-3 text-[14px] font-semibold text-erro">{falha}</p>}

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-linha pt-5">
            <button type="button" onClick={() => { if (indice === 0) setModo(null); else setIndice(indice - 1); }} className="btn-s">← Voltar</button>
            {!campo.req && <button type="button" onClick={() => { setIndice(Math.min(indice + 1, passos.length - 1)); setErro(""); }} className="font-mono text-[12px] tracking-[.14em] uppercase text-suave hover:text-tinta">Pular</button>}
            <button type="button" onClick={continuar} disabled={enviando} className="btn-p ml-auto">{enviando ? "Enviando…" : indice === passos.length - 1 ? "Enviar briefing" : "Continuar"} <span className="font-mono">→</span></button>
          </div>
        </main>

        <aside className="hidden border-l border-linha pl-7 lg:block">
          <span className="font-mono text-[10px] tracking-[.22em] uppercase text-suave">O que já respondemos</span>
          <div className="mt-5 grid gap-3">
            {passos.filter((item) => respondido(item)).slice(-8).map((item) => <button key={item.id} type="button" onClick={() => setIndice(passos.indexOf(item))} className="text-left text-[13px] text-tinta2 hover:text-tinta"><span className="mr-2 text-ember">✓</span>{item.r}</button>)}
            {!respondidos && <p className="text-[13px] text-suave leading-[1.6]">Suas respostas aparecem aqui conforme você avança.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
