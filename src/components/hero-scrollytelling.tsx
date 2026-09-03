"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

type Posicao = "centro" | "esquerda" | "direita";

type Bloco = {
  olho: string;
  titulo: string;
  corpo: string;
  imagem: string;
  poster: string;
  video?: string;
  cta?: boolean;
  posicao: Posicao;
};

const BLOCOS: Bloco[] = [
  {
    olho: "Desenvolvimento de software",
    titulo: "Software feito para o seu problema, não para o catálogo de alguém.",
    corpo: "Sites, sistemas, aplicativos e automações sob medida. Começa com um briefing em linguagem que qualquer pessoa entende e termina com você acompanhando cada etapa por uma área própria.",
    imagem: "/hero/00-cristal.png",
    poster: "/hero/00-cristal-poster.jpg",
    video: "/hero/00-cristal.mp4",
    cta: true,
    posicao: "centro",
  },
  {
    olho: "Sites e páginas de venda",
    titulo: "Da vitrine institucional à página feita para converter.",
    corpo: "Com texto, layout e medição de resultado, pensados para o seu público.",
    imagem: "/hero/01-site.png",
    poster: "/hero/01-site-poster.jpg",
    video: "/hero/01-site.mp4",
    posicao: "esquerda",
  },
  {
    olho: "Sistemas sob medida",
    titulo: "Cadastros, pedidos, agendamento, relatórios.",
    corpo: "O que hoje vive numa planilha vira um sistema com login e histórico.",
    imagem: "/hero/02-sistema.png",
    poster: "/hero/02-sistema-poster.jpg",
    video: "/hero/02-sistema.mp4",
    posicao: "direita",
  },
  {
    olho: "Aplicativos",
    titulo: "Android e iPhone a partir de uma base só.",
    corpo: "Publicados nas lojas e prontos para atualizar sempre que precisar.",
    imagem: "/hero/03-app.png",
    poster: "/hero/03-app-poster.jpg",
    video: "/hero/03-app.mp4",
    posicao: "centro",
  },
  {
    olho: "Automações e bots",
    titulo: "Aquela tarefa repetitiva que consome sua semana.",
    corpo: "Passa a acontecer sozinha, sem depender de ninguém lembrar.",
    imagem: "/hero/04-automacao.png",
    poster: "/hero/04-automacao-poster.jpg",
    video: "/hero/04-automacao.mp4",
    posicao: "esquerda",
  },
  {
    olho: "Dados e relatórios",
    titulo: "Os números do negócio em um painel só.",
    corpo: "Atualizados sem ninguém precisar montar planilha.",
    imagem: "/hero/05-dados.png",
    poster: "/hero/05-dados-poster.jpg",
    video: "/hero/05-dados.mp4",
    posicao: "direita",
  },
  {
    olho: "Inteligência artificial",
    titulo: "Atendimento automático, classificação e análise.",
    corpo: "Integrados ao que você já usa, sem trocar de sistema.",
    imagem: "/hero/06-ia.png",
    poster: "/hero/06-ia-poster.jpg",
    video: "/hero/06-ia.mp4",
    posicao: "centro",
  },
];

// Quanto de rolagem cada etapa consome, em vh. Durante PARADA_VH o painel fica
// imóvel no centro e o scroll rasga o clipe dele quadro a quadro; durante
// TRANSICAO_VH ninguém toca no vídeo e o que se move são os dois painéis
// deslizando de lado. As duas coisas nunca acontecem ao mesmo tempo, então não
// existe instante em que dois vídeos aparecem sobrepostos disputando atenção.
const PARADA_VH = 100;
const TRANSICAO_VH = 45;
const PASSO_VH = PARADA_VH + TRANSICAO_VH;

// Os clipes do hero são todos reencodados em 24 fps all-intra. Arredondar o
// currentTime pra grade de quadros evita mandar o decodificador buscar de novo
// por diferenças menores que um quadro, que ele nem chegaria a pintar.
const FPS = 24;

function alturaTotalVh(total: number) {
  return total * PARADA_VH + (total - 1) * TRANSICAO_VH;
}

function limite01(v: number) {
  return Math.min(1, Math.max(0, v));
}

// Acelera e desacelera a troca de painel. É função pura do progresso do scroll,
// então continua reversível: subir desfaz o movimento pelo mesmo caminho.
function suavizar(t: number) {
  return t * t * (3 - 2 * t);
}

// Painel par sai pela esquerda, ímpar sai pela direita, e cada painel entra
// pelo lado oposto ao que o anterior saiu. Na troca os dois viajam juntos no
// mesmo sentido, e o sentido alterna a cada capítulo em vez de virar uma
// esteira sempre pro mesmo lado.
function direcaoSaida(indice: number) {
  return indice % 2 === 0 ? -1 : 1;
}

function ladoEntrada(indice: number) {
  return indice === 0 ? 0 : -direcaoSaida(indice - 1);
}

// Deslocamento horizontal do painel em % da largura da tela, para um progresso
// global do scroll. 0 é centralizado, mais ou menos 100 é encostado fora da tela.
function deslocamento(p: number, indice: number, total: number) {
  const altura = alturaTotalVh(total);
  const paradaInicio = (indice * PASSO_VH) / altura;
  const paradaFim = (indice * PASSO_VH + PARADA_VH) / altura;

  if (p < paradaInicio) {
    if (indice === 0) return 0;
    const comecouAEntrar = ((indice - 1) * PASSO_VH + PARADA_VH) / altura;
    const t = suavizar(limite01((p - comecouAEntrar) / (paradaInicio - comecouAEntrar)));
    return ladoEntrada(indice) * 100 * (1 - t);
  }

  if (p <= paradaFim) return 0;
  if (indice === total - 1) return 0;

  const terminouDeSair = ((indice + 1) * PASSO_VH) / altura;
  const t = suavizar(limite01((p - paradaFim) / (terminouDeSair - paradaFim)));
  return direcaoSaida(indice) * 100 * t;
}

// Quanto do clipe já passou. Só a parada conta: durante a transição o vídeo
// fica no quadro em que estava, porque ali quem se mexe é o painel inteiro.
function progressoClipe(p: number, indice: number, total: number) {
  const altura = alturaTotalVh(total);
  const inicio = (indice * PASSO_VH) / altura;
  const fim = (indice * PASSO_VH + PARADA_VH) / altura;
  return limite01((p - inicio) / (fim - inicio));
}

export function HeroScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const paineisRef = useRef<(HTMLDivElement | null)[]>([]);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
  const duracoesRef = useRef<number[]>([]);
  const progressoRef = useRef(0);
  const reduzMovimento = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // O evento de scroll só anota onde estamos; quem escreve no DOM é o rAF
  // abaixo, uma vez por quadro. Scroll chega em rajadas irregulares e mandar
  // cada uma direto pro currentTime faz o decodificador engasgar.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressoRef.current = v;
  });

  useEffect(() => {
    if (reduzMovimento) return;
    const total = BLOCOS.length;

    // "Destrava" o decodificador no iOS Safari: sem um play/pause inicial, o
    // primeiro currentTime vindo do scroll não pinta nada.
    videosRef.current.forEach((v) => {
      v?.play().then(() => v.pause()).catch(() => {});
    });

    let quadro = requestAnimationFrame(function passo() {
      quadro = requestAnimationFrame(passo);

      const p = progressoRef.current;
      const ativo = Math.min(total - 1, Math.floor((p * alturaTotalVh(total)) / PASSO_VH));

      for (let i = 0; i < total; i++) {
        const painel = paineisRef.current[i];
        const video = videosRef.current[i];
        const x = deslocamento(p, i, total);

        if (painel) painel.style.transform = `translate3d(${x.toFixed(3)}%, 0, 0)`;

        // Só o painel atual e os vizinhos imediatos valem download completo:
        // os outros ficam em metadata até chegar a vez deles.
        if (video && Math.abs(i - ativo) <= 1 && video.preload !== "auto") {
          video.preload = "auto";
        }

        // Fora da tela não se manda seek. São sete clipes e no máximo dois
        // aparecem ao mesmo tempo.
        if (Math.abs(x) >= 100) continue;

        const duracao = duracoesRef.current[i];
        if (!video || !duracao) continue;

        const alvo = Math.round(progressoClipe(p, i, total) * duracao * FPS) / FPS;
        if (Math.abs(alvo - video.currentTime) >= 0.5 / FPS) video.currentTime = alvo;
      }
    });

    return () => cancelAnimationFrame(quadro);
  }, [reduzMovimento]);

  if (reduzMovimento) {
    return (
      <section id="servicos" className="relative overflow-hidden border-b border-linha bg-papel">
        <Image
          src={BLOCOS[0].imagem}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-papel/80 via-papel/70 to-papel" />
        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-16 grid gap-14">
          {BLOCOS.map((bloco) => (
            <BlocoEstatico key={bloco.titulo} bloco={bloco} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="servicos"
      ref={containerRef}
      className="relative border-b border-linha bg-papel"
      style={{ height: `${alturaTotalVh(BLOCOS.length)}vh` }}
    >
      {/* Prende o hero na tela até o último capítulo terminar; depois a página
          volta a rolar normalmente. */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {BLOCOS.map((bloco, indice) => (
          <Painel
            key={bloco.titulo}
            bloco={bloco}
            indice={indice}
            refPainel={(el) => {
              paineisRef.current[indice] = el;
            }}
            refVideo={(el) => {
              videosRef.current[indice] = el;
            }}
            aoMedirDuracao={(d) => {
              duracoesRef.current[indice] = d;
            }}
          />
        ))}
      </div>
    </section>
  );
}

// Com o texto do lado esquerdo, o assunto do vídeo desloca para a direita (e
// vice-versa), pra não ficar escondido atrás da leitura.
const FOCO_FUNDO: Record<Posicao, string> = {
  centro: "50% center",
  esquerda: "80% center",
  direita: "20% center",
};

// Escurece só a área por trás do texto, em vez da tela inteira.
const GRADIENTE_TEXTO: Record<Posicao, string> = {
  centro: "radial-gradient(ellipse 62% 48% at 50% 58%, rgba(11,13,19,0.72), transparent 72%)",
  esquerda: "linear-gradient(100deg, rgba(11,13,19,0.72) 0%, rgba(11,13,19,0.45) 32%, transparent 62%)",
  direita: "linear-gradient(260deg, rgba(11,13,19,0.72) 0%, rgba(11,13,19,0.45) 32%, transparent 62%)",
};

const ALINHO_TEXTO: Record<Posicao, string> = {
  centro: "justify-center text-center",
  esquerda: "justify-start text-left",
  direita: "justify-end text-left",
};

function Painel({
  bloco,
  indice,
  refPainel,
  refVideo,
  aoMedirDuracao,
}: {
  bloco: Bloco;
  indice: number;
  refPainel: (el: HTMLDivElement | null) => void;
  refVideo: (el: HTMLVideoElement | null) => void;
  aoMedirDuracao: (duracao: number) => void;
}) {
  const centralizado = bloco.posicao === "centro";
  // Posição de partida já correta no HTML do servidor: o primeiro painel
  // centralizado, os demais estacionados fora da tela do lado por onde entram.
  const xInicial = indice === 0 ? 0 : ladoEntrada(indice) * 100;

  return (
    <div
      ref={refPainel}
      className="absolute inset-0"
      style={{ transform: `translate3d(${xInicial}%, 0, 0)`, willChange: "transform" }}
    >
      {bloco.video ? (
        <video
          ref={refVideo}
          src={bloco.video}
          poster={bloco.poster}
          muted
          playsInline
          preload={indice <= 1 ? "auto" : "metadata"}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          onLoadedMetadata={(e) => {
            aoMedirDuracao(e.currentTarget.duration);
            // Decodifica um quadro real de imediato, em vez de deixar só o
            // pôster à mostra até o primeiro ajuste de scroll chegar.
            e.currentTarget.currentTime = 0;
          }}
          style={{ objectPosition: FOCO_FUNDO[bloco.posicao] }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <Image
          src={bloco.imagem}
          alt=""
          fill
          priority={indice === 0}
          sizes="100vw"
          style={{ objectPosition: FOCO_FUNDO[bloco.posicao] }}
          className="object-cover"
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: GRADIENTE_TEXTO[bloco.posicao] }}
      />

      <div className="absolute inset-0 flex items-center">
        <div className={`max-w-6xl mx-auto px-5 w-full flex ${ALINHO_TEXTO[bloco.posicao]}`}>
          <div className="max-w-2xl">
            <p className="olho">{bloco.olho}</p>
            <h2
              className={
                bloco.cta
                  ? "mt-4 text-[clamp(2.1rem,5.4vw,3.6rem)] font-bold leading-[1.1] text-balance"
                  : "mt-4 text-[clamp(1.7rem,4vw,2.6rem)] font-bold leading-[1.15] text-balance"
              }
            >
              {bloco.titulo}
            </h2>
            <p className="mt-5 text-lg text-tinta2 leading-relaxed max-w-xl">{bloco.corpo}</p>
            {bloco.cta && (
              <div className={`mt-8 flex flex-wrap gap-3 ${centralizado ? "justify-center" : "justify-start"}`}>
                <Link href="/solicitar" className="btn-p">Solicitar orçamento</Link>
                <Link href="/projetos" className="btn-s">Ver projetos</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BlocoEstatico({ bloco }: { bloco: Bloco }) {
  return (
    <div className="relative max-w-2xl">
      <p className="olho">{bloco.olho}</p>
      <h2 className="mt-4 text-[clamp(1.9rem,4.6vw,3rem)] font-bold leading-[1.12] text-balance">{bloco.titulo}</h2>
      <p className="mt-5 text-lg text-tinta2 leading-relaxed">{bloco.corpo}</p>
      {bloco.cta && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/solicitar" className="btn-p">Solicitar orçamento</Link>
          <Link href="/projetos" className="btn-s">Ver projetos</Link>
        </div>
      )}
    </div>
  );
}
