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

// Rolagem que cada capítulo consome. O clipe inteiro é rasgado nesse trecho.
const CAPITULO_VH = 100;

// Os clipes do hero são todos reencodados em 24 fps all-intra. Arredondar o
// currentTime pra grade de quadros evita mandar o decodificador buscar de novo
// por diferenças menores que um quadro, que ele nem chegaria a pintar.
const FPS = 24;

// Enquadramento de cada capítulo: o vídeo é ampliado e empurrado pro lado
// oposto ao do texto, pra imagem e leitura ocuparem metades diferentes da
// tela. O zoom existe justamente pra sobrar imagem nas bordas e o empurrão
// não revelar o fundo.
type Camera = { x: number; zoom: number };

const ENQUADRAMENTO: Record<Posicao, Camera> = {
  centro: { x: 0, zoom: 1.16 },
  esquerda: { x: 11, zoom: 1.28 }, // texto à esquerda, imagem empurrada pra direita
  direita: { x: -11, zoom: 1.28 }, // texto à direita, imagem empurrada pra esquerda
};

// De onde a câmera parte no primeiro quadro da página: mesmo eixo do capítulo
// de abertura, só que mais fechada, pra abertura já nascer com um recuo lento.
const CAMERA_INICIAL: Camera = { x: 0, zoom: 1.3 };

function limite01(v: number) {
  return Math.min(1, Math.max(0, v));
}

// Chega perto do enquadramento final cedo (a leitura precisa do lado dela
// livre já no começo do capítulo) mas nunca para de andar, porque o termo
// linear mantém velocidade residual até o fim. Sem isso a câmera congelaria
// na segunda metade de cada capítulo.
function avanco(t: number) {
  const desacelerado = 1 - Math.pow(1 - t, 3);
  return 0.82 * desacelerado + 0.18 * t;
}

// Posição da câmera no progresso global. Cada capítulo interpola do
// enquadramento do capítulo ANTERIOR para o seu, então no ponto de corte a
// câmera está exatamente onde o capítulo que terminou a deixou: o clipe troca
// sem que o enquadramento dê um salto.
function camera(p: number, total: number): Camera {
  const indice = Math.min(total - 1, Math.max(0, Math.floor(p * total)));
  const t = limite01(p * total - indice);
  const de = indice === 0 ? CAMERA_INICIAL : ENQUADRAMENTO[BLOCOS[indice - 1].posicao];
  const para = ENQUADRAMENTO[BLOCOS[indice].posicao];
  const e = avanco(t);
  return {
    x: de.x + (para.x - de.x) * e,
    zoom: de.zoom + (para.zoom - de.zoom) * e,
  };
}

// O texto some antes do corte e volta depois dele, então o clipe troca com a
// tela limpa. O primeiro capítulo não tem entrada (a página abre com ele já
// legível) e o último não tem saída (não há corte depois).
function opacidadeTexto(t: number, primeiro: boolean, ultimo: boolean) {
  const MARGEM = 0.14;
  if (!primeiro && t < MARGEM) return t / MARGEM;
  if (!ultimo && t > 1 - MARGEM) return (1 - t) / MARGEM;
  return 1;
}

export function HeroScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
  const textosRef = useRef<(HTMLDivElement | null)[]>([]);
  const duracoesRef = useRef<number[]>([]);
  const progressoRef = useRef(0);
  const ativoRef = useRef(0);
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
      const indice = Math.min(total - 1, Math.max(0, Math.floor(p * total)));
      const t = limite01(p * total - indice);

      const { x, zoom } = camera(p, total);
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(${x.toFixed(3)}%, 0, 0) scale(${zoom.toFixed(4)})`;
      }

      // Corte seco no capítulo: nada de dois clipes visíveis ao mesmo tempo.
      // Só mexe quando o capítulo realmente vira.
      if (ativoRef.current !== indice) {
        videosRef.current.forEach((v, j) => {
          if (v) v.style.opacity = j === indice ? "1" : "0";
        });
        ativoRef.current = indice;
      }

      for (let j = 0; j < total; j++) {
        const texto = textosRef.current[j];
        if (texto) {
          texto.style.opacity =
            j === indice ? String(opacidadeTexto(t, j === 0, j === total - 1)) : "0";
        }

        const video = videosRef.current[j];
        if (!video) continue;

        // Só o capítulo atual e o seguinte valem download completo; os outros
        // ficam em metadata até chegar a vez deles.
        if ((j === indice || j === indice + 1) && video.preload !== "auto") {
          video.preload = "auto";
        }

        // Fora do capítulo atual não se manda seek: são sete clipes e só um
        // aparece por vez.
        if (j !== indice) continue;

        const duracao = duracoesRef.current[j];
        if (!duracao) continue;

        const alvo = Math.round(t * duracao * FPS) / FPS;
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

  const inicial = camera(0, BLOCOS.length);

  return (
    <section
      id="servicos"
      ref={containerRef}
      className="relative border-b border-linha bg-papel"
      style={{ height: `${BLOCOS.length * CAPITULO_VH}vh` }}
    >
      {/* Prende o hero na tela até o último capítulo terminar; depois a página
          volta a rolar normalmente. */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Uma câmera só para todos os clipes: é ela que dá o movimento
            lateral e o zoom, e é por ela ser única que o enquadramento
            atravessa o corte sem salto. */}
        <div
          ref={cameraRef}
          className="absolute inset-0"
          style={{
            transform: `translate3d(${inicial.x}%, 0, 0) scale(${inicial.zoom})`,
            willChange: "transform",
          }}
        >
          {BLOCOS.map((bloco, indice) =>
            bloco.video ? (
              <video
                key={bloco.titulo}
                ref={(el) => {
                  videosRef.current[indice] = el;
                }}
                src={bloco.video}
                poster={bloco.poster}
                muted
                playsInline
                preload={indice <= 1 ? "auto" : "metadata"}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback"
                onLoadedMetadata={(e) => {
                  duracoesRef.current[indice] = e.currentTarget.duration;
                  // Decodifica um quadro real de imediato, pro corte para este
                  // capítulo não cair num elemento ainda vazio.
                  e.currentTarget.currentTime = 0;
                }}
                style={{ opacity: indice === 0 ? 1 : 0 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                key={bloco.titulo}
                src={bloco.imagem}
                alt=""
                fill
                priority={indice === 0}
                sizes="100vw"
                style={{ opacity: indice === 0 ? 1 : 0 }}
                className="object-cover"
              />
            ),
          )}
        </div>

        {/* Fora da câmera, então não sofre o zoom nem o empurrão lateral. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: VEU_BASE }}
        />

        {/* Texto e véu de legibilidade ficam fora da câmera: quem se move é a
            imagem, a leitura fica firme no lugar dela. */}
        {BLOCOS.map((bloco, indice) => (
          <div
            key={bloco.titulo}
            ref={(el) => {
              textosRef.current[indice] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: indice === 0 ? 1 : 0 }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: GRADIENTE_TEXTO[bloco.posicao] }}
            />
            <div className="absolute inset-0 flex items-center">
              {/* Largura total com recuo nas bordas, em vez de uma caixa
                  centralizada: numa tela larga a caixa central jogava o texto
                  "da esquerda" por cima do meio da tela, e o alinhamento
                  lateral não se lia. */}
              <div className={`w-full px-[clamp(1.25rem,7vw,7rem)] flex ${ALINHO_TEXTO[bloco.posicao]}`}>
                <div className={bloco.cta ? "max-w-2xl" : "max-w-xl"}>
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
                    <div
                      className={`mt-8 flex flex-wrap gap-3 ${
                        bloco.posicao === "centro" ? "justify-center" : "justify-start"
                      }`}
                    >
                      <Link href="/solicitar" className="btn-p">Solicitar orçamento</Link>
                      <Link href="/projetos" className="btn-s">Ver projetos</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Véu constante sobre todos os capítulos. Como não muda de um capítulo pro
// outro, atravessa o corte sem piscar, e é ele que garante um piso de contraste
// mesmo quando cai um quadro claro do vídeo por baixo do texto.
const VEU_BASE =
  "linear-gradient(to bottom, rgba(11,13,19,0.46) 0%, rgba(11,13,19,0.14) 34%, rgba(11,13,19,0.2) 60%, rgba(11,13,19,0.55) 100%)";

// Por cima do véu, escurece o lado onde o texto do capítulo está. Acompanha o
// texto (aparece e some junto com ele), então some antes do corte.
const GRADIENTE_TEXTO: Record<Posicao, string> = {
  centro:
    "radial-gradient(ellipse 76% 60% at 50% 56%, rgba(11,13,19,0.84) 0%, rgba(11,13,19,0.5) 52%, transparent 78%)",
  esquerda:
    "linear-gradient(100deg, rgba(11,13,19,0.88) 0%, rgba(11,13,19,0.74) 24%, rgba(11,13,19,0.38) 50%, transparent 72%)",
  direita:
    "linear-gradient(260deg, rgba(11,13,19,0.88) 0%, rgba(11,13,19,0.74) 24%, rgba(11,13,19,0.38) 50%, transparent 72%)",
};

const ALINHO_TEXTO: Record<Posicao, string> = {
  centro: "justify-center text-center",
  esquerda: "justify-start text-left",
  direita: "justify-end text-left",
};

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
