"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { opDica, opTexto, type Campo } from "@/lib/briefing";
import { montarPlano, type Modo, type PassoBriefing } from "@/lib/briefing-plano";
import { lerRaioX, type Respostas } from "@/lib/briefing-raiox";
import { BriefingMaquete } from "./briefing-maquete";
import { BriefingAberturaCena } from "./briefing-abertura-cena";
import { enviarBriefing } from "@/app/acoes";

const CHAVE = "nexus-hub-briefing-wizard";
/** Tempo que a resposta única fica visível marcada antes de avançar sozinha. */
const ESPERA_AUTOAVANCO = 450;

type Rascunho = { modo: Modo; dados: Respostas; indice: number };

/**
 * Regras condicionais do briefing: uma pergunta só aparece quando as respostas
 * anteriores a tornam relevante. Sem isso a versão completa perguntaria sobre
 * loja de aplicativo para quem pediu um site institucional.
 */
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
  if (campo.id === "banco") return tipo !== "Página única de vendas";
  if (campo.id === "backup") return Boolean(respostas.banco) && respostas.banco !== "Acho que não vou precisar guardar informações";
  if (campo.id === "lojas") return tipo === "Aplicativo de celular" || plataformas.some((valor) => /Android|iPhone/.test(valor));
  if (campo.id === "pagamentos") return ["Site institucional", "Página única de vendas", "Loja virtual", "Sistema interno / painel de gestão", "Aplicativo de celular", "Jogo"].includes(String(tipo));
  if (campo.id === "gateway") return pagamentos.length > 0 && !pagamentos.includes("Não vou receber pagamento pelo sistema");
  if (campo.id === "integracoesQuais") return integracoes.includes("Sistema que já uso (ERP, CRM, sistema do contador)");
  if (campo.id === "politicas") return dadosPessoais.length > 0 && !dadosPessoais.includes("Nenhuma informação pessoal");
  if (campo.id === "prazoData") return Boolean(respostas.prazo) && respostas.prazo !== "Sem data definida";
  return true;
}

const NAO_PRECISA = ["Saber programar", "Conhecer termos técnicos", "Ter as funções definidas", "Saber quanto vai custar"];
const SO_PRECISA = ["Contar o que tem em mente", "Explicar o problema", "Dizer o que quer alcançar", "O resto construímos juntos"];
const COMO_FUNCIONA: [string, string][] = [
  ["Você conta", "sua ideia e o problema"],
  ["A gente organiza", "as perguntas conforme suas respostas"],
  ["Você revisa", "tudo antes de enviar"],
  ["A Nexus Hub analisa", "e volta com os próximos passos"],
];

const tipoDoCampo = (t: Campo["t"]) =>
  t === "tel" ? "tel" : t === "email" ? "email" : t === "data" ? "date" : "text";

export function FormularioBriefingWizard() {
  const router = useRouter();
  const reduzMovimento = useReducedMotion();
  const [modo, setModo] = useState<Modo | null>(null);
  const [dados, setDados] = useState<Respostas>({});
  const [indice, setIndice] = useState(0);
  const [direcao, setDirecao] = useState(1);
  const [erro, setErro] = useState("");
  const [falha, setFalha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [gaveta, setGaveta] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);

  const passos = useMemo<PassoBriefing[]>(() => {
    if (!modo) return [];
    return montarPlano(modo).filter((p) => p.tipo !== "campo" || campoSeAplica(p.campo, dados));
  }, [modo, dados]);

  const atual = passos[indice];
  const raiox = useMemo(() => lerRaioX(dados), [dados]);
  const percentual = passos.length > 1 ? (indice / (passos.length - 1)) * 100 : 0;

  const preenchido = (campo: Campo) => {
    const v = dados[campo.id];
    return Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim());
  };

  const respondido = (passo: PassoBriefing): boolean => {
    if (passo.tipo === "campo") return preenchido(passo.campo);
    if (passo.tipo === "grupo") return passo.campos.filter((c) => c.req).every(preenchido);
    return false;
  };

  const obrigatorioOk = (passo: PassoBriefing) => {
    if (passo.tipo === "campo") return !passo.campo.req || preenchido(passo.campo);
    if (passo.tipo === "grupo") return passo.campos.filter((c) => c.req).every(preenchido);
    return true;
  };

  const avisoDe = (passo: PassoBriefing) =>
    passo.tipo === "grupo"
      ? "Precisamos do seu nome e do WhatsApp para conseguir te responder."
      : "Precisamos dessa resposta para continuar.";

  /* Capítulos: corridas consecutivas do mesmo `cap`, para a trilha refletir a
     ordem real das perguntas depois do filtro condicional. */
  const capitulos = useMemo(() => {
    const saida: { nome: string; ids: string[] }[] = [];
    for (const passo of passos) {
      const ultimo = saida[saida.length - 1];
      if (ultimo && ultimo.nome === passo.cap) ultimo.ids.push(passo.id);
      else saida.push({ nome: passo.cap, ids: [passo.id] });
    }
    return saida;
  }, [passos]);

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CHAVE) || "null");
      if (guardado?.modo && guardado?.dados && Object.keys(guardado.dados).length) setRascunho(guardado as Rascunho);
    } catch {
      /* rascunho ilegível: começa do zero */
    }
  }, []);

  useEffect(() => {
    if (passos.length && indice >= passos.length) setIndice(passos.length - 1);
  }, [passos.length, indice]);

  const salvar = (m: Modo | null, d: Respostas, i = indice) => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ modo: m, dados: d, indice: i }));
    } catch {
      /* armazenamento bloqueado: segue sem rascunho */
    }
  };

  const definir = (id: string, valor: string | string[]) => {
    const novo = { ...dados, [id]: valor };
    setDados(novo);
    setErro("");
    salvar(modo, novo);
    setSalvo(true);
    window.setTimeout(() => setSalvo(false), 1400);
  };

  const irParaIndice = (alvo: number, dir: number) => {
    setDirecao(dir);
    setIndice(alvo);
    setErro("");
    salvar(modo, dados, alvo);
  };

  const enviar = async () => {
    if (!modo) return;
    const faltando = passos.find((p) => !obrigatorioOk(p));
    if (faltando) {
      irParaIndice(passos.indexOf(faltando), -1);
      setErro(avisoDe(faltando));
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
    try {
      localStorage.removeItem(CHAVE);
    } catch {
      /* nada a limpar */
    }
    router.push(`/solicitar/enviado?codigo=${encodeURIComponent(resultado.dado || "")}`);
  };

  const continuar = () => {
    if (!atual) return;
    if (atual.tipo === "revisao") {
      void enviar();
      return;
    }
    if (!obrigatorioOk(atual)) {
      setErro(avisoDe(atual));
      return;
    }
    irParaIndice(Math.min(indice + 1, passos.length - 1), 1);
  };

  const voltar = () => {
    if (indice === 0) {
      setModo(null);
      return;
    }
    irParaIndice(indice - 1, -1);
  };

  /* O auto-avanço dispara depois que o estado já assentou, então a validação
     do passo corrente enxerga a resposta recém-marcada. */
  const continuarRef = useRef(continuar);
  continuarRef.current = continuar;
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const escolherUnica = (campo: Campo, texto: string) => {
    definir(campo.id, texto);
    window.clearTimeout(timerRef.current);
    if (reduzMovimento) {
      timerRef.current = window.setTimeout(() => continuarRef.current(), 0);
      return;
    }
    timerRef.current = window.setTimeout(() => continuarRef.current(), ESPERA_AUTOAVANCO);
  };

  const iniciar = (m: Modo, de = 0) => {
    setModo(m);
    setIndice(de);
    setDirecao(1);
    setRascunho(null);
    salvar(m, dados, de);
  };

  useEffect(() => {
    if (!modo) return;
    const aoTeclar = (ev: KeyboardEvent) => {
      const alvo = ev.target as HTMLElement | null;
      const emTexto = alvo?.tagName === "TEXTAREA" || alvo?.tagName === "INPUT";
      if (ev.key === "Escape" && gaveta) {
        ev.preventDefault();
        setGaveta(false);
        return;
      }
      if (ev.key === "Enter" && !ev.shiftKey) {
        if (alvo?.tagName === "TEXTAREA" && !ev.metaKey && !ev.ctrlKey) return;
        ev.preventDefault();
        continuarRef.current();
      }
      if (!emTexto && ev.key === "ArrowLeft") {
        ev.preventDefault();
        voltar();
      }
      if (!emTexto && ev.key === "ArrowRight") {
        ev.preventDefault();
        continuarRef.current();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  });

  const respondidos = passos.filter(respondido);

  const textoDe = (passo: PassoBriefing, curto = true) => {
    if (passo.tipo === "grupo") {
      return passo.campos.map((c) => dados[c.id]).filter(Boolean).join(" · ");
    }
    if (passo.tipo !== "campo") return "";
    const v = dados[passo.campo.id];
    if (Array.isArray(v)) {
      return curto && v.length > 2 ? `${v.slice(0, 2).join(", ")} +${v.length - 2}` : v.join(", ");
    }
    return String(v || "");
  };

  const rotuloDe = (passo: PassoBriefing) =>
    passo.tipo === "campo" ? passo.campo.r : passo.tipo === "grupo" ? "Contato" : "Revisão";

  /* ---------------------------------------------------------------- */
  /* abertura                                                          */
  /* ---------------------------------------------------------------- */

  if (!modo) {
    return (
      <div className="mt-[clamp(2.25rem,6vh,4rem)]">
        <div className="grid gap-[clamp(1.75rem,5vw,4.5rem)] items-start lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="olho">Mas o que é um briefing?</span>
            <p className="mt-[18px] text-[clamp(1.05rem,1.5vw,1.35rem)] font-medium leading-[1.45] tracking-[-.015em] text-tinta max-w-[30ch]">
              Briefing é um jeito organizado de contar o que você quer construir, por que precisa
              disso e como imagina que deveria funcionar.
            </p>
            <p className="mt-4 text-[15.5px] text-tinta2 leading-[1.7] max-w-[42ch]">
              É uma conversa guiada, não um formulário. A partir das suas respostas conseguimos
              entender o projeto e preparar uma proposta adequada. Não existe resposta certa ou errada.
            </p>

            <div className="mt-[clamp(1.75rem,4vh,2.75rem)] grid gap-[clamp(1.25rem,3vw,2.5rem)] sm:grid-cols-2">
              <div>
                <span className="block font-mono text-[10.5px] tracking-[.2em] uppercase text-suave2">Você não precisa</span>
                <ul className="mt-3.5 m-0 p-0 list-none grid gap-2.5">
                  {NAO_PRECISA.map((item) => (
                    <li key={item} className="grid grid-cols-[16px_1fr] gap-2.5 items-baseline">
                      <span aria-hidden className="text-suave2 text-[12px]">—</span>
                      <span className="text-[14.5px] text-suave leading-[1.5]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="block font-mono text-[10.5px] tracking-[.2em] uppercase text-ok">Você só precisa</span>
                <ul className="mt-3.5 m-0 p-0 list-none grid gap-2.5">
                  {SO_PRECISA.map((item) => (
                    <li key={item} className="grid grid-cols-[16px_1fr] gap-2.5 items-baseline">
                      <span aria-hidden className="text-ok text-[12px]">✓</span>
                      <span className="text-[14.5px] text-leitura leading-[1.5]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <figure className="m-0 border border-linha bg-painel2 p-[clamp(20px,3vw,32px)] aspect-[16/10]">
              <BriefingAberturaCena />
            </figure>
            <div className="mt-[clamp(1.5rem,3.4vh,2.25rem)]">
              <span className="block font-mono text-[10.5px] tracking-[.2em] uppercase text-suave2">Como funciona</span>
              <ol className="mt-4 m-0 p-0 list-none grid">
                {COMO_FUNCIONA.map(([forte, resto], i) => (
                  <li
                    key={forte}
                    className={`grid grid-cols-[34px_1fr] gap-3.5 items-baseline border-t border-linha py-3.5 ${
                      i === COMO_FUNCIONA.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <span className={`font-mono text-[11px] ${i === 0 ? "text-ember" : "text-suave"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14.5px] text-leitura leading-[1.5]">
                      <strong className="font-semibold text-tinta">{forte}</strong> {resto}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <p className="mt-[clamp(2rem,5vh,3.5rem)] font-mono text-[11px] tracking-[.2em] uppercase text-suave">
          Escolha por onde começar
        </p>

        <div className="mt-[clamp(1.125rem,2.6vh,1.75rem)] grid gap-0.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => iniciar("rapido")}
            className="text-left bg-painel border border-linha p-[clamp(26px,3.4vw,40px)] cursor-pointer transition-[border-color,background-color,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:border-linha3 hover:bg-cartao-hover hover:-translate-y-0.5"
          >
            <span className="olho-suave">5 a 7 minutos</span>
            <span className="block mt-[18px] text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-[1.08] tracking-[-.028em] text-tinta">Versão rápida</span>
            <span className="block mt-3.5 text-[15.5px] text-tinta2 leading-[1.7]">O essencial para a gente entender a ideia e dar uma estimativa inicial.</span>
            <span className="mt-6 inline-flex items-center gap-2.5 font-mono text-[11.5px] tracking-[.16em] uppercase text-tinta">Contar minha ideia →</span>
          </button>
          <button
            type="button"
            onClick={() => iniciar("completo")}
            className="text-left bg-painel border border-ember-borda p-[clamp(26px,3.4vw,40px)] cursor-pointer transition-[border-color,background-color,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:border-ember hover:bg-cartao-hover hover:-translate-y-0.5"
          >
            <span className="olho">15 a 20 min · recomendado</span>
            <span className="block mt-[18px] text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-[1.08] tracking-[-.028em] text-tinta">Versão completa</span>
            <span className="block mt-3.5 text-[15.5px] text-tinta2 leading-[1.7]">Todos os detalhes: funções, infraestrutura, prazo e manutenção. Gera uma proposta bem mais precisa.</span>
            <span className="mt-6 inline-flex items-center gap-2.5 font-mono text-[11.5px] tracking-[.16em] uppercase text-tinta">Contar minha ideia →</span>
          </button>
        </div>

        {rascunho && (
          <div className="mt-7 border-l-2 border-ember pl-5 py-1">
            <p className="text-[15.5px] text-leitura leading-[1.6]">Encontramos um briefing em andamento neste navegador.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setDados(rascunho.dados);
                  setModo(rascunho.modo);
                  setIndice(rascunho.indice || 0);
                  setRascunho(null);
                }}
                className="btn-p px-[22px] py-3.5 text-[13px]"
              >
                Continuar de onde parei
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem(CHAVE);
                  } catch {
                    /* nada a limpar */
                  }
                  setRascunho(null);
                }}
                className="btn-s px-[22px] py-3.5 text-[11.5px]"
              >
                Começar de novo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!atual) return null;

  const listaRespostas = (
    <div className="grid gap-4">
      {respondidos.length === 0 ? (
        <p className="text-[13.5px] text-suave2 leading-[1.6]">Suas respostas aparecem aqui conforme você avança.</p>
      ) : (
        respondidos.map((passo) => (
          <button
            key={passo.id}
            type="button"
            onClick={() => {
              setGaveta(false);
              irParaIndice(passos.indexOf(passo), passos.indexOf(passo) > indice ? 1 : -1);
            }}
            className="grid gap-1.5 text-left group"
          >
            <span className="font-mono text-[10px] tracking-[.18em] uppercase text-suave2">{rotuloDe(passo)}</span>
            <span className="text-[14px] text-leitura leading-[1.45] transition-colors group-hover:text-ember">{textoDe(passo)}</span>
          </button>
        ))
      )}
    </div>
  );

  const animacao: CSSProperties | undefined = reduzMovimento
    ? undefined
    : ({ animation: "wizard-entra .42s cubic-bezier(.16,1,.3,1) both", "--dx": direcao === -1 ? "-14px" : "14px" } as CSSProperties);

  return (
    <div className="mt-12 -mx-6 sm:-mx-[clamp(24px,5vw,96px)] border-t border-linha">
      <header className="sticky top-[76px] z-30 border-b border-linha bg-papel/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1360px] items-center gap-4 px-6 py-3 sm:px-[clamp(24px,5vw,96px)]">
          <div className="hidden min-[1220px]:flex flex-1 min-w-0 items-center gap-1 overflow-hidden">
            {capitulos.map((cap) => {
              const ativo = cap.nome === atual.cap;
              const feito = cap.ids.every((id) => {
                const p = passos.find((x) => x.id === id);
                return p ? p.tipo === "revisao" || respondido(p) : false;
              });
              return (
                <button
                  key={cap.nome + cap.ids[0]}
                  type="button"
                  onClick={() => irParaIndice(passos.findIndex((p) => p.id === cap.ids[0]), -1)}
                  aria-current={ativo ? "step" : undefined}
                  title={`Ir para ${cap.nome}`}
                  className={`shrink-0 px-2.5 py-1.5 font-mono text-[10.5px] tracking-[.14em] uppercase whitespace-nowrap border-b transition-[color,border-color] duration-300 ${
                    ativo ? "text-tinta border-ember" : feito ? "text-tinta2 border-transparent hover:text-tinta" : "text-suave2 border-transparent hover:text-tinta2"
                  }`}
                >
                  {cap.nome}
                </button>
              );
            })}
          </div>

          <span className="font-mono text-[11px] tracking-[.18em] uppercase text-suave whitespace-nowrap min-[1220px]:hidden">
            {atual.cap}
          </span>
          <div className="h-px flex-1 bg-linha min-[1220px]:hidden">
            <div className="h-px bg-ember transition-[width] duration-500" style={{ width: `${percentual}%` }} />
          </div>

          <span className="font-mono text-[12px] text-tinta2 tabular-nums whitespace-nowrap">
            {String(indice + 1).padStart(2, "0")} / {String(passos.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => iniciar(modo === "rapido" ? "completo" : "rapido", 0)}
            className="hidden border-b border-linha2 pb-1 font-mono text-[11px] tracking-[.14em] uppercase text-tinta2 transition-colors hover:border-ember hover:text-tinta sm:block"
          >
            Versão {modo === "rapido" ? "completa" : "rápida"}
          </button>
        </div>
        <div className="h-0.5 bg-cartao">
          <div className="h-0.5 bg-ember transition-[width] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" style={{ width: `${percentual}%` }} />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1360px] gap-12 px-6 py-10 sm:px-[clamp(24px,4vw,56px)] min-[1100px]:grid-cols-[minmax(0,1fr)_320px] min-[1100px]:gap-16">
        <main className="min-h-[min(56vh,520px)]">
          <div key={indice} style={animacao}>
            {atual.tipo === "revisao" ? (
              <>
                <span className="olho">{atual.olho}</span>
                <h2 className="mt-[18px] max-w-[20ch] text-[clamp(1.6rem,3.4vw,2.9rem)] font-bold leading-[1.05] tracking-[-.03em] text-balance">Tudo pronto?</h2>
                <p className="mt-4 max-w-[54ch] text-[16px] text-tinta2 leading-[1.65]">
                  Reunimos suas respostas abaixo. Clique em qualquer item para voltar e alterar.
                  Depois de enviar, a gente analisa a ideia e volta com os próximos passos.
                </p>

                <div className="mt-[clamp(26px,3.6vh,40px)] grid gap-[clamp(24px,4vw,56px)] items-start lg:grid-cols-[1.15fr_1fr]">
                  <figure className="m-0 border border-linha bg-painel2 p-[clamp(14px,2vw,22px)] aspect-[320/236]">
                    <BriefingMaquete raiox={raiox} />
                  </figure>
                  <div>
                    <span className="block font-mono text-[10.5px] tracking-[.2em] uppercase text-ember">Raio-X do projeto</span>
                    <p className="mt-3.5 max-w-[40ch] text-[15px] text-tinta2 leading-[1.65]">
                      Uma leitura inicial do que entendemos até aqui — não é o projeto final, é o
                      retrato das suas respostas.
                    </p>
                  </div>
                </div>

                <div className="mt-[clamp(26px,3.6vh,40px)] border-t border-linha pt-[clamp(20px,2.6vh,30px)] grid gap-x-[clamp(24px,4vw,56px)] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                  {respondidos.length === 0 ? (
                    <p className="text-[15px] text-suave leading-[1.6]">Você ainda não respondeu nada — volte e conte um pouco da sua ideia.</p>
                  ) : (
                    respondidos.map((passo) => (
                      <button
                        key={passo.id}
                        type="button"
                        onClick={() => irParaIndice(passos.indexOf(passo), -1)}
                        className="grid gap-1.5 text-left border-t border-linha py-4 transition-colors hover:border-ember group"
                      >
                        <span className="font-mono text-[10px] tracking-[.2em] uppercase text-suave2">{rotuloDe(passo)}</span>
                        <span className="text-[15px] text-leitura leading-[1.55] transition-colors group-hover:text-tinta">{textoDe(passo, false)}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : atual.tipo === "grupo" ? (
              <>
                <span className="olho">{atual.olho}</span>
                <h2 className="mt-[18px] max-w-[22ch] text-[clamp(1.6rem,3.4vw,2.9rem)] font-bold leading-[1.05] tracking-[-.03em] text-balance">{atual.pergunta}</h2>
                <div className="mt-[clamp(26px,3.6vh,40px)] grid gap-[clamp(20px,3vw,36px)] max-w-[760px] sm:grid-cols-2">
                  {atual.campos.map((campo) => (
                    <div key={campo.id} className="grid gap-2.5">
                      <label htmlFor={`c-${campo.id}`} className="font-mono text-[11px] tracking-[.18em] uppercase text-tinta2">
                        {campo.r} {campo.req && <span className="text-ember">*</span>}
                      </label>
                      <input
                        id={`c-${campo.id}`}
                        className="campo"
                        type={tipoDoCampo(campo.t)}
                        placeholder={campo.ph}
                        value={(dados[campo.id] as string) || ""}
                        onChange={(ev) => definir(campo.id, ev.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-[clamp(24px,3.4vh,36px)] max-w-[60ch] text-[13.5px] text-suave2 leading-[1.7]">{atual.nota}</p>
              </>
            ) : (
              <>
                <div className="mb-10 flex items-center gap-4">
                  <span className="font-mono text-[11px] tracking-[.2em] uppercase text-ember">{atual.olho}</span>
                  <span className="h-px w-8 bg-linha2" />
                  <span className="font-mono text-[11px] tracking-[.18em] uppercase text-suave">
                    {atual.campo.req ? "Obrigatório" : "Opcional"}
                  </span>
                </div>

                <h2 className="max-w-[22ch] text-[clamp(1.6rem,3.4vw,2.9rem)] font-bold leading-[1.05] tracking-[-.03em] text-balance">{atual.campo.r}</h2>
                {atual.campo.a && <p className="mt-4 max-w-[54ch] text-[16px] text-tinta2 leading-[1.65]">{atual.campo.a}</p>}
                {atual.campo.i && (
                  <p className="mt-5 max-w-[54ch] border-l-2 border-ember bg-acento-fundo p-4 text-[14.5px] text-tinta2 leading-[1.7]">{atual.campo.i}</p>
                )}

                <div className="mt-9 max-w-[760px]">
                  {atual.campo.t === "escolha" || atual.campo.t === "multipla" ? (
                    <Opcoes campo={atual.campo} valor={dados[atual.campo.id]} aoEscolher={escolherUnica} aoAlternar={definir} />
                  ) : atual.campo.t === "longo" ? (
                    <textarea
                      className="campo min-h-36 resize-y leading-[1.6]"
                      placeholder={atual.campo.ph}
                      value={(dados[atual.campo.id] as string) || ""}
                      onChange={(ev) => definir(atual.campo.id, ev.target.value)}
                    />
                  ) : (
                    <input
                      className="campo"
                      type={tipoDoCampo(atual.campo.t)}
                      placeholder={atual.campo.ph}
                      value={(dados[atual.campo.id] as string) || ""}
                      onChange={(ev) => definir(atual.campo.id, ev.target.value)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </main>

        <aside className="hidden min-[1100px]:block border-l border-linha pl-7">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10.5px] tracking-[.22em] uppercase text-suave">Seu projeto</span>
            <span className="font-mono text-[10px] tracking-[.14em] uppercase text-ok transition-opacity duration-300" style={{ opacity: salvo ? 1 : 0 }}>
              Salvo
            </span>
          </div>
          <figure className="mt-[18px] m-0 border border-linha bg-painel2 p-2 aspect-[320/236]">
            <BriefingMaquete raiox={raiox} />
          </figure>
          <p className="mt-2.5 font-mono text-[9.5px] tracking-[.14em] uppercase text-suave2">{raiox.nota}</p>
          <div className="mt-5 max-h-[46vh] overflow-y-auto">{listaRespostas}</div>
        </aside>
      </div>

      {/* Rodapé fixo: navegação sempre ao alcance, sem depender de onde a
          pergunta terminou na tela. */}
      <div className="sticky bottom-0 z-30 border-t border-linha bg-papel/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-3 px-6 py-4 sm:px-[clamp(24px,4vw,56px)]">
          <button type="button" onClick={voltar} className="btn-s">← Voltar</button>
          <p role="status" aria-live="polite" className="m-0 flex-1 text-[14.5px] text-ember transition-opacity duration-300" style={{ opacity: erro || falha ? 1 : 0 }}>
            {erro || falha || " "}
          </p>
          <button type="button" onClick={() => setGaveta(true)} className="btn-s">Ver meu projeto</button>
          {atual.tipo === "campo" && !atual.campo.req && (
            <button
              type="button"
              onClick={() => irParaIndice(Math.min(indice + 1, passos.length - 1), 1)}
              className="font-mono text-[11.5px] tracking-[.14em] uppercase text-suave transition-colors hover:text-tinta"
            >
              Pular
            </button>
          )}
          <button type="button" onClick={continuar} disabled={enviando} className="btn-p disabled:opacity-60">
            {enviando ? "Enviando…" : atual.tipo === "revisao" ? "Enviar briefing" : atual.tipo === "grupo" ? "Revisar" : "Continuar"}{" "}
            <span className="font-mono font-medium">→</span>
          </button>
        </div>
      </div>

      {gaveta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Seu projeto"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) setGaveta(false);
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-papel/[.86] backdrop-blur-[10px] p-[clamp(16px,5vw,40px)]"
        >
          <div className="w-full max-w-[560px] bg-painel2 border border-linha p-[clamp(18px,4vw,28px)]">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-[10.5px] tracking-[.22em] uppercase text-tinta2">Seu projeto</span>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setGaveta(false)}
                className="w-[34px] h-[34px] border border-linha2 text-tinta2 text-[15px] transition-colors hover:border-ember hover:text-tinta"
              >
                ✕
              </button>
            </div>
            <figure className="mt-4 m-0 border border-linha bg-painel p-3 aspect-[320/236]">
              <BriefingMaquete raiox={raiox} />
            </figure>
            <p className="mt-3 font-mono text-[10.5px] tracking-[.14em] uppercase text-suave">{raiox.nota}</p>
            <div className="mt-[18px] border-t border-linha pt-4 max-h-[34vh] overflow-y-auto">{listaRespostas}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Opções de resposta. Na escolha única o cartão inteiro acende e a etapa
 * avança sozinha; na múltipla o marcador quadrado preenche e a pessoa segue
 * pelo botão. O input fica só para leitor de tela e teclado — quem enxerga lê
 * o estado pela borda, como no desenho.
 */
function Opcoes({
  campo,
  valor,
  aoEscolher,
  aoAlternar,
}: {
  campo: Campo;
  valor: string | string[] | undefined;
  aoEscolher: (campo: Campo, texto: string) => void;
  aoAlternar: (id: string, valor: string[]) => void;
}) {
  const multipla = campo.t === "multipla";
  return (
    <div className="grid gap-px sm:grid-cols-2">
      {campo.o?.map((opcao) => {
        const texto = opTexto(opcao);
        const dica = opDica(opcao);
        const marcado = multipla ? Array.isArray(valor) && valor.includes(texto) : valor === texto;
        return (
          <label
            key={texto}
            className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
              marcado ? "border-ember bg-selecao" : "border-linha hover:border-linha3 hover:bg-cartao-hover"
            }`}
          >
            <input
              type={multipla ? "checkbox" : "radio"}
              name={`wizard-${campo.id}`}
              checked={marcado}
              value={texto}
              className="sr-only"
              onChange={(ev) => {
                if (!multipla) return aoEscolher(campo, texto);
                const atual = Array.isArray(valor) ? valor : [];
                aoAlternar(campo.id, ev.target.checked ? [...atual, texto] : atual.filter((x) => x !== texto));
              }}
            />
            {multipla && (
              <span
                aria-hidden
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border text-[12px] transition-colors ${
                  marcado ? "border-ember bg-ember text-papel" : "border-linha3 text-transparent"
                }`}
              >
                ✓
              </span>
            )}
            <span className="text-[15px] leading-[1.45]">
              {texto}
              {dica && <small className="mt-1 block text-[13px] text-suave">{dica}</small>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
