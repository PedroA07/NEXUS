"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { camposDoModo, opDica, opTexto, secoesDoModo, type Campo } from "@/lib/briefing";
import { lerRaioX, type Respostas } from "@/lib/briefing-raiox";
import { BriefingMaquete } from "./briefing-maquete";
import { BriefingAberturaCena } from "./briefing-abertura-cena";
import { enviarBriefing } from "@/app/acoes";

type Modo = "rapido" | "completo";
const CHAVE = "nexus-hub-briefing-wizard";
const REVISAO = "__revisao";

type PassoWizard = { id: string; cap: string; campo: Campo | null };

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

const NAO_PRECISA = [
  "Saber programar",
  "Conhecer termos técnicos",
  "Ter as funções definidas",
  "Saber quanto vai custar",
];

const SO_PRECISA = [
  "Contar o que tem em mente",
  "Explicar o problema",
  "Dizer o que quer alcançar",
  "O resto construímos juntos",
];

const COMO_FUNCIONA: [string, string][] = [
  ["Você conta", "sua ideia e o problema"],
  ["A gente organiza", "as perguntas conforme suas respostas"],
  ["Você revisa", "tudo antes de enviar"],
  ["A Nexus Hub analisa", "e volta com os próximos passos"],
];

export function FormularioBriefingWizard() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo | null>(null);
  const [dados, setDados] = useState<Respostas>({});
  const [indice, setIndice] = useState(0);
  const [erro, setErro] = useState("");
  const [falha, setFalha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [gaveta, setGaveta] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);

  const passos = useMemo<PassoWizard[]>(() => {
    if (!modo) return [];
    const campos = secoesDoModo(modo).flatMap((secao) =>
      camposDoModo(secao, modo)
        .filter((campo) => campo.t !== "aviso" && campoSeAplica(campo, dados))
        .map((campo) => ({ id: campo.id, cap: secao.titulo, campo })),
    );
    return [...campos, { id: REVISAO, cap: "Revisão", campo: null }];
  }, [modo, dados]);

  const atual = passos[indice];
  const raiox = useMemo(() => lerRaioX(dados), [dados]);
  const percentual = passos.length > 1 ? (indice / (passos.length - 1)) * 100 : 0;

  /* Capítulos da trilha: corridas consecutivas de passos que vieram da mesma
     seção. Agrupar por corrida, e não por seção, mantém a ordem da trilha
     igual à ordem real das perguntas depois do filtro condicional. */
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
      if (guardado?.modo && guardado?.dados && Object.keys(guardado.dados).length) {
        setRascunho(guardado as Rascunho);
      }
    } catch {
      /* rascunho ilegível: começa do zero */
    }
  }, []);

  useEffect(() => {
    if (passos.length && indice >= passos.length) setIndice(passos.length - 1);
  }, [passos.length, indice]);

  const salvar = (novoModo: Modo | null, novasRespostas: Respostas, novoIndice = indice) => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ modo: novoModo, dados: novasRespostas, indice: novoIndice }));
    } catch {
      /* armazenamento cheio ou bloqueado: segue sem rascunho */
    }
  };

  const piscarSalvo = () => {
    setSalvo(true);
    window.setTimeout(() => setSalvo(false), 1400);
  };

  const definir = (id: string, valor: string | string[]) => {
    const novo = { ...dados, [id]: valor };
    setDados(novo);
    setErro("");
    salvar(modo, novo);
    piscarSalvo();
  };

  const respondido = (passo: PassoWizard) => {
    if (!passo.campo) return false;
    const valor = dados[passo.campo.id];
    return Array.isArray(valor) ? valor.length > 0 : Boolean(valor && String(valor).trim());
  };

  const iniciar = (novoModo: Modo, deIndice = 0) => {
    setModo(novoModo);
    setIndice(deIndice);
    setRascunho(null);
    salvar(novoModo, dados, deIndice);
  };

  const retomar = () => {
    if (!rascunho) return;
    setDados(rascunho.dados);
    setModo(rascunho.modo);
    setIndice(rascunho.indice || 0);
    setRascunho(null);
  };

  const descartar = () => {
    try {
      localStorage.removeItem(CHAVE);
    } catch {
      /* nada a limpar */
    }
    setRascunho(null);
  };

  const irPara = (id: string) => {
    const k = passos.findIndex((passo) => passo.id === id);
    if (k < 0) return;
    setIndice(k);
    setErro("");
    setGaveta(false);
    salvar(modo, dados, k);
  };

  const enviar = async () => {
    if (!modo) return;
    const faltando = passos.find((passo) => passo.campo?.req && !respondido(passo));
    if (faltando) {
      setIndice(passos.indexOf(faltando));
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
    try {
      localStorage.removeItem(CHAVE);
    } catch {
      /* nada a limpar */
    }
    router.push(`/solicitar/enviado?codigo=${encodeURIComponent(resultado.dado || "")}`);
  };

  const continuar = () => {
    if (!atual) return;
    if (atual.id === REVISAO) {
      void enviar();
      return;
    }
    if (atual.campo?.req && !respondido(atual)) {
      setErro("Responda esta pergunta para continuar.");
      return;
    }
    const proximo = Math.min(indice + 1, passos.length - 1);
    setIndice(proximo);
    setErro("");
    salvar(modo, dados, proximo);
  };

  const voltar = () => {
    if (indice === 0) {
      setModo(null);
      return;
    }
    setIndice(indice - 1);
    setErro("");
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
        continuar();
      }
      if (!emTexto && ev.key === "ArrowLeft") {
        ev.preventDefault();
        voltar();
      }
      if (!emTexto && ev.key === "ArrowRight") {
        ev.preventDefault();
        continuar();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  });

  const respondidos = passos.filter((passo) => respondido(passo));

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
                <span className="block font-mono text-[10.5px] tracking-[.2em] uppercase text-[#5c6377]">Você não precisa</span>
                <ul className="mt-3.5 m-0 p-0 list-none grid gap-2.5">
                  {NAO_PRECISA.map((item) => (
                    <li key={item} className="grid grid-cols-[16px_1fr] gap-2.5 items-baseline">
                      <span aria-hidden className="text-[#5c6377] text-[12px]">—</span>
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
            <figure className="m-0 border border-linha bg-[#0d0f16] p-[clamp(20px,3vw,32px)] aspect-[16/10]">
              <BriefingAberturaCena />
            </figure>

            <div className="mt-[clamp(1.5rem,3.4vh,2.25rem)]">
              <span className="block font-mono text-[10.5px] tracking-[.2em] uppercase text-[#5c6377]">Como funciona</span>
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
            className="text-left bg-painel border border-linha p-[clamp(26px,3.4vw,40px)] cursor-pointer transition-[border-color,background-color,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:border-linha2 hover:bg-[#12141c] hover:-translate-y-0.5"
          >
            <span className="olho-suave">5 a 7 minutos</span>
            <span className="block mt-[18px] text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-[1.08] tracking-[-.028em] text-tinta">Versão rápida</span>
            <span className="block mt-3.5 text-[15.5px] text-tinta2 leading-[1.7]">O essencial para a gente entender a ideia e dar uma estimativa inicial.</span>
            <span className="mt-6 inline-flex items-center gap-2.5 font-mono text-[11.5px] tracking-[.16em] uppercase text-tinta">Contar minha ideia →</span>
          </button>
          <button
            type="button"
            onClick={() => iniciar("completo")}
            className="text-left bg-painel border border-ember-borda p-[clamp(26px,3.4vw,40px)] cursor-pointer transition-[border-color,background-color,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:border-ember hover:bg-[#12141c] hover:-translate-y-0.5"
          >
            <span className="olho">15 a 20 min · recomendado</span>
            <span className="block mt-[18px] text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-[1.08] tracking-[-.028em] text-tinta">Versão completa</span>
            <span className="block mt-3.5 text-[15.5px] text-tinta2 leading-[1.7]">Todos os detalhes: funções, infraestrutura, prazo e manutenção. Gera uma proposta bem mais precisa.</span>
            <span className="mt-6 inline-flex items-center gap-2.5 font-mono text-[11.5px] tracking-[.16em] uppercase text-tinta">Contar minha ideia →</span>
          </button>
        </div>

        {rascunho && (
          <div className="mt-7 border-l-2 border-ember pl-5 py-1">
            <p className="text-[15.5px] text-leitura leading-[1.6]">
              Encontramos um briefing em andamento neste navegador.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={retomar} className="btn-p px-[22px] py-3.5 text-[13px]">
                Continuar de onde parei
              </button>
              <button type="button" onClick={descartar} className="btn-s px-[22px] py-3.5 text-[11.5px]">
                Começar de novo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!atual) return null;

  const campo = atual.campo;
  const valor = campo ? dados[campo.id] : undefined;
  const multipla = campo?.t === "multipla";
  const escolhas = campo?.t === "escolha" || multipla;
  const capAtual = atual.cap;

  const listaRespostas = (
    <div className="grid gap-4">
      {respondidos.length === 0 ? (
        <p className="text-[13.5px] text-suave leading-[1.6]">
          Suas respostas aparecem aqui conforme você avança.
        </p>
      ) : (
        respondidos.map((passo) => {
          const v = dados[passo.campo!.id];
          const texto = Array.isArray(v)
            ? v.length > 2
              ? `${v.slice(0, 2).join(", ")} +${v.length - 2}`
              : v.join(", ")
            : String(v || "");
          return (
            <button
              key={passo.id}
              type="button"
              onClick={() => irPara(passo.id)}
              className="grid gap-1.5 text-left group"
            >
              <span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#5c6377]">
                {passo.campo!.r}
              </span>
              <span className="text-[14px] text-leitura leading-[1.45] transition-colors group-hover:text-ember">
                {texto}
              </span>
            </button>
          );
        })
      )}
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* wizard                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="mt-12 -mx-6 sm:-mx-[clamp(24px,5vw,96px)] border-t border-linha">
      <header className="sticky top-[76px] z-30 border-b border-linha bg-papel/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1360px] items-center gap-4 px-6 py-3 sm:px-[clamp(24px,5vw,96px)]">
          <div className="hidden xl:flex flex-1 min-w-0 items-center gap-1 overflow-hidden">
            {capitulos.map((cap) => {
              const feito = cap.ids.every((id) => {
                const p = passos.find((x) => x.id === id);
                return p ? p.id === REVISAO || respondido(p) : false;
              });
              const ativo = cap.nome === capAtual;
              return (
                <button
                  key={cap.nome + cap.ids[0]}
                  type="button"
                  onClick={() => irPara(cap.ids[0])}
                  aria-current={ativo ? "step" : undefined}
                  title={`Ir para ${cap.nome}`}
                  className={`shrink-0 px-2.5 py-1.5 font-mono text-[10.5px] tracking-[.14em] uppercase whitespace-nowrap border-b transition-[color,border-color] duration-300 ${
                    ativo
                      ? "text-tinta border-ember"
                      : feito
                        ? "text-tinta2 border-transparent hover:text-tinta"
                        : "text-[#5c6377] border-transparent hover:text-tinta2"
                  }`}
                >
                  {cap.nome}
                </button>
              );
            })}
          </div>

          <span className="font-mono text-[11px] tracking-[.18em] uppercase text-suave whitespace-nowrap xl:hidden">
            {modo === "rapido" ? "Versão rápida" : "Versão completa"}
          </span>

          <div className="h-px flex-1 bg-linha xl:hidden">
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
        <div className="h-0.5 bg-[#151824]">
          <div className="h-0.5 bg-ember transition-[width] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" style={{ width: `${percentual}%` }} />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1360px] gap-12 px-6 py-10 sm:px-[clamp(24px,4vw,56px)] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <main className="min-h-[min(56vh,520px)]">
          {atual.id === REVISAO ? (
            <>
              <span className="olho">Revisão</span>
              <h2 className="mt-[18px] max-w-[20ch] text-[clamp(1.6rem,3.4vw,2.9rem)] font-bold leading-[1.05] tracking-[-.03em] text-balance">
                Tudo pronto?
              </h2>
              <p className="mt-4 max-w-[54ch] text-[16px] text-tinta2 leading-[1.65]">
                Reunimos suas respostas abaixo. Clique em qualquer item para voltar e alterar.
                Depois de enviar, a gente analisa a ideia e volta com os próximos passos.
              </p>

              <div className="mt-[clamp(26px,3.6vh,40px)] grid gap-[clamp(24px,4vw,56px)] items-start lg:grid-cols-[1.15fr_1fr]">
                <figure className="m-0 border border-linha bg-[#0d0f16] p-[clamp(14px,2vw,22px)] aspect-[320/236]">
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
                  <p className="text-[15px] text-suave leading-[1.6]">
                    Você ainda não respondeu nada — volte e conte um pouco da sua ideia.
                  </p>
                ) : (
                  respondidos.map((passo) => {
                    const v = dados[passo.campo!.id];
                    const texto = Array.isArray(v) ? v.join(", ") : String(v || "");
                    return (
                      <button
                        key={passo.id}
                        type="button"
                        onClick={() => irPara(passo.id)}
                        className="grid gap-1.5 text-left border-t border-linha py-4 transition-colors hover:border-ember group"
                      >
                        <span className="font-mono text-[10px] tracking-[.2em] uppercase text-[#5c6377]">
                          {passo.campo!.r}
                        </span>
                        <span className="text-[15px] text-leitura leading-[1.55] transition-colors group-hover:text-tinta">
                          {texto}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            campo && (
              <>
                <div className="mb-10 flex items-center gap-4">
                  <span className="font-mono text-[11px] tracking-[.2em] uppercase text-ember">{capAtual}</span>
                  <span className="h-px w-8 bg-linha2" />
                  <span className="font-mono text-[11px] tracking-[.18em] uppercase text-suave">
                    {campo.req ? "Obrigatório" : "Opcional"}
                  </span>
                </div>

                <h2 className="max-w-[20ch] text-[clamp(1.6rem,3.4vw,2.9rem)] font-bold leading-[1.05] tracking-[-.03em] text-balance">
                  {campo.r}
                </h2>
                {campo.a && <p className="mt-4 max-w-[54ch] text-[16px] text-tinta2 leading-[1.65]">{campo.a}</p>}
                {campo.i && (
                  <p className="mt-5 max-w-[54ch] border-l-2 border-ember bg-acento-fundo p-4 text-[14.5px] text-tinta2 leading-[1.7]">
                    {campo.i}
                  </p>
                )}

                <div className="mt-9 max-w-[760px]">
                  {escolhas ? (
                    <div className="grid gap-px sm:grid-cols-2">
                      {campo.o?.map((opcao) => {
                        const texto = opTexto(opcao);
                        const marcado = multipla
                          ? Array.isArray(valor) && valor.includes(texto)
                          : valor === texto;
                        return (
                          <label
                            key={texto}
                            className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                              marcado ? "border-ember bg-[#15131a]" : "border-linha hover:border-linha2"
                            }`}
                          >
                            <input
                              type={multipla ? "checkbox" : "radio"}
                              name={`wizard-${campo.id}`}
                              checked={marcado}
                              value={texto}
                              className="mt-1 h-4 w-4 accent-[var(--color-ember)]"
                              onChange={(event) => {
                                if (!multipla) return definir(campo.id, texto);
                                const atualLista = Array.isArray(valor) ? valor : [];
                                definir(
                                  campo.id,
                                  event.target.checked
                                    ? [...atualLista, texto]
                                    : atualLista.filter((item) => item !== texto),
                                );
                              }}
                            />
                            <span className="text-[15px] leading-[1.45]">
                              {texto}
                              {opDica(opcao) && <small className="mt-1 block text-[13px] text-suave">{opDica(opcao)}</small>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : campo.t === "longo" ? (
                    <textarea
                      className="campo min-h-36 resize-y leading-[1.6]"
                      placeholder={campo.ph}
                      value={(valor as string) || ""}
                      onChange={(event) => definir(campo.id, event.target.value)}
                    />
                  ) : (
                    <input
                      className="campo"
                      type={campo.t === "tel" ? "tel" : campo.t === "email" ? "email" : campo.t === "data" ? "date" : "text"}
                      placeholder={campo.ph}
                      value={(valor as string) || ""}
                      onChange={(event) => definir(campo.id, event.target.value)}
                    />
                  )}
                </div>
              </>
            )
          )}

          {erro && <p className="mt-5 border-l-2 border-erro bg-erro-fundo p-3 text-[14px] font-semibold text-erro">{erro}</p>}
          {falha && <p className="mt-5 border-l-2 border-erro bg-erro-fundo p-3 text-[14px] font-semibold text-erro">{falha}</p>}

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-linha pt-5">
            <button type="button" onClick={voltar} className="btn-s">← Voltar</button>
            <button
              type="button"
              onClick={() => setGaveta(true)}
              className="btn-s lg:hidden"
            >
              Ver meu projeto
            </button>
            {atual.id !== REVISAO && !campo?.req && (
              <button
                type="button"
                onClick={() => {
                  setIndice(Math.min(indice + 1, passos.length - 1));
                  setErro("");
                }}
                className="font-mono text-[12px] tracking-[.14em] uppercase text-suave transition-colors hover:text-tinta"
              >
                Pular
              </button>
            )}
            <button type="button" onClick={continuar} disabled={enviando} className="btn-p ml-auto disabled:opacity-60">
              {enviando ? "Enviando…" : atual.id === REVISAO ? "Enviar briefing" : "Continuar"}{" "}
              <span className="font-mono font-medium">→</span>
            </button>
          </div>
        </main>

        <aside className="hidden border-l border-linha pl-7 lg:block">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10.5px] tracking-[.22em] uppercase text-suave">Seu projeto</span>
            <span
              className="font-mono text-[10px] tracking-[.14em] uppercase text-ok transition-opacity duration-300"
              style={{ opacity: salvo ? 1 : 0 }}
            >
              Salvo
            </span>
          </div>

          <figure className="mt-[18px] m-0 border border-linha bg-[#0d0f16] p-2 aspect-[320/236]">
            <BriefingMaquete raiox={raiox} />
          </figure>
          <p className="mt-2.5 font-mono text-[9.5px] tracking-[.14em] uppercase text-[#5c6377]">{raiox.nota}</p>

          <div className="mt-5 max-h-[46vh] overflow-y-auto">{listaRespostas}</div>
        </aside>
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
          <div className="w-full max-w-[560px] bg-[#0d0f16] border border-linha p-[clamp(18px,4vw,28px)]">
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
