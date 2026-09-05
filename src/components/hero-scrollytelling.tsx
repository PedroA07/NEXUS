"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

// "baixo" põe a leitura rente à borda inferior, no eixo da imagem; os outros
// dois jogam o texto para um lado enquanto a câmera empurra a imagem para o
// oposto. É o que substitui o texto centralizado da versão anterior.
type Posicao = "baixo" | "esquerda" | "direita";

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
    posicao: "baixo",
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
    posicao: "baixo",
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
    posicao: "baixo",
  },
];

// Rolagem que cada capítulo consome. O clipe inteiro é rasgado nesse trecho.
const CAPITULO_VH = 100;

// Os clipes do hero são todos reencodados em 48 fps all-intra. Arredondar o
// currentTime pra grade de quadros evita mandar o decodificador buscar de novo
// por diferenças menores que um quadro, que ele nem chegaria a pintar.
//
// Precisa bater com o fps real dos arquivos: a fonte tinha 124 quadros para
// 100vh de rolagem, ou seja, um quadro novo a cada 8,7px numa tela de 1080px,
// e um clique de roda pulava onze quadros de uma vez. Foi isso que lia como
// travamento. Com 48 fps a densidade dobra; deixar esta constante em 24
// desperdiçaria exatamente os quadros que passaram a existir.
const FPS = 48;

// Enquadramento de cada capítulo: o vídeo é ampliado e empurrado pro lado
// oposto ao do texto, pra imagem e leitura ocuparem metades diferentes da
// tela. O zoom existe justamente pra sobrar imagem nas bordas e o empurrão
// não revelar o fundo.
type Camera = { x: number; zoom: number };

const ENQUADRAMENTO: Record<Posicao, Camera> = {
  baixo: { x: 0, zoom: 1.16 },
  esquerda: { x: 11, zoom: 1.28 }, // texto à esquerda, imagem empurrada pra direita
  direita: { x: -11, zoom: 1.28 }, // texto à direita, imagem empurrada pra esquerda
};

// De onde a câmera parte no primeiro quadro da página: mesmo eixo do capítulo
// de abertura, só que mais fechada, pra abertura já nascer com um recuo lento.
const CAMERA_INICIAL: Camera = { x: 0, zoom: 1.32 };

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
  const ticksRef = useRef<(HTMLSpanElement | null)[]>([]);
  const barraRef = useRef<HTMLDivElement>(null);
  const rolarRef = useRef<HTMLDivElement>(null);
  const progressoRef = useRef(0);
  const capituloRef = useRef(-1);
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

      for (let j = 0; j < total; j++) {
        const texto = textosRef.current[j];
        if (texto) {
          texto.style.opacity =
            j === indice ? String(opacidadeTexto(t, j === 0, j === total - 1)) : "0";
        }

        const video = videosRef.current[j];
        if (!video) continue;

        // Corte seco: um clipe visível por vez. Reescrito a TODO quadro, e não
        // só na virada de capítulo. As refs são callbacks inline, que o React
        // desanexa e reanexa a cada re-render; um quadro que caia nessa janela
        // encontra a ref nula e perde a escrita. Preso à virada, o clipe errado
        // ficava na tela até o capítulo seguinte (o "vídeo de atraso"). Escrito
        // a cada quadro, o quadro seguinte conserta sozinho.
        video.style.opacity = j === indice ? "1" : "0";

        // Fora do capítulo atual não se manda seek: são sete clipes e só um
        // aparece por vez.
        if (j !== indice) continue;

        // Lido do próprio elemento em vez de um cache paralelo: um cache que
        // não tenha sido preenchido faria o clipe congelar sem sinal nenhum.
        const duracao = video.duration;
        if (!Number.isFinite(duracao) || duracao <= 0) continue;

        const alvo = Math.round(t * duracao * FPS) / FPS;
        if (Math.abs(alvo - video.currentTime) >= 0.5 / FPS) video.currentTime = alvo;
      }

      // Cromo da Direção A: barra de avanço no rodapé do hero, indicador de
      // rolagem que sai de cena assim que o leitor entende o gesto, e o índice
      // lateral, que só é reescrito na virada de capítulo porque tem transição
      // de CSS própria e reescrever todo quadro a reiniciaria.
      if (barraRef.current) barraRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      if (rolarRef.current) rolarRef.current.style.opacity = p > 0.04 ? "0" : "1";

      if (capituloRef.current !== indice) {
        ticksRef.current.forEach((tick, j) => {
          if (!tick) return;
          tick.style.width = j === indice ? "34px" : "14px";
          tick.style.background = j === indice ? "#f0f1f6" : "#363d50";
        });
        capituloRef.current = indice;
      }
    });

    return () => cancelAnimationFrame(quadro);
  }, [reduzMovimento]);

  if (reduzMovimento) {
    return (
      <section id="hero" className="relative overflow-hidden border-b border-linha bg-papel">
        <Image
          src={BLOCOS[0].imagem}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-papel/80 via-papel/70 to-papel" />
        <div className="relative secao pt-32 pb-20 grid gap-14">
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
      id="hero"
      ref={containerRef}
      className="relative bg-papel"
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
                // Todos em "auto". Com "metadata" cada busca do scroll vira ida
                // à rede e o clipe fica preso no primeiro quadro, que é o que
                // fazia os capítulos do meio parecerem imagem estática.
                preload="auto"
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback"
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

        {/* Véu constante, fora da câmera: não sofre o zoom nem o empurrão, e
            por não mudar de um capítulo pro outro atravessa o corte sem
            piscar. A vinheta radial fecha os cantos. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,13,19,0.62) 0%, rgba(11,13,19,0.18) 30%, rgba(11,13,19,0.28) 62%, rgba(11,13,19,0.86) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(11,13,19,0.5) 100%)",
          }}
        />

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
            <TextoCapitulo bloco={bloco} indice={indice} />
          </div>
        ))}

        {/* Índice de capítulos. Traço largo marca onde você está. */}
        <div className="absolute right-[clamp(1.5rem,5vw,6rem)] top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-3.5 items-end pointer-events-none">
          {BLOCOS.map((bloco, indice) => (
            <span
              key={bloco.titulo}
              ref={(el) => {
                ticksRef.current[indice] = el;
              }}
              className="block h-px transition-[width,background-color] duration-[450ms] ease-[cubic-bezier(.16,1,.3,1)]"
              style={{
                width: indice === 0 ? "34px" : "14px",
                background: indice === 0 ? "#f0f1f6" : "#363d50",
              }}
            />
          ))}
        </div>

        <div
          ref={rolarRef}
          className="absolute left-1/2 bottom-8 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none transition-opacity duration-[600ms]"
        >
          <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-suave">Role</span>
          <span className="w-px h-11 bg-gradient-to-b from-ember to-transparent" />
        </div>

        <div className="absolute left-0 right-0 bottom-0 h-px bg-linha">
          <div ref={barraRef} className="h-px bg-ember" style={{ width: "0%" }} />
        </div>
      </div>
    </section>
  );
}

// Cada posição escurece o lado onde a leitura está: rodapé inteiro para o
// texto de baixo, um flanco para os laterais. Acompanha o texto, então some
// antes do corte junto com ele.
const GRADIENTE_TEXTO: Record<Posicao, string> = {
  baixo:
    "linear-gradient(to top, rgba(11,13,19,0.9) 0%, rgba(11,13,19,0.55) 42%, rgba(11,13,19,0.15) 78%, transparent 100%)",
  esquerda:
    "linear-gradient(100deg, rgba(11,13,19,0.92) 0%, rgba(11,13,19,0.72) 30%, rgba(11,13,19,0.28) 56%, transparent 76%)",
  direita:
    "linear-gradient(260deg, rgba(11,13,19,0.92) 0%, rgba(11,13,19,0.72) 30%, rgba(11,13,19,0.28) 56%, transparent 76%)",
};

function TextoCapitulo({ bloco, indice }: { bloco: Bloco; indice: number }) {
  const numero = String(indice).padStart(2, "0");

  if (bloco.posicao === "baixo") {
    // O recuo no topo é folga para telas baixas: alinhado ao rodapé, um bloco
    // mais alto que a área útil transborda para cima, e sem essa margem ele
    // entraria por baixo do cabeçalho.
    return (
      <div className="absolute inset-0 flex items-end pt-24">
        <div className="secao w-full pb-[clamp(4.5rem,12vh,8rem)]">
          {/* Medida em rem, não em ch: `ch` resolve contra o font-size do
              próprio elemento, então num contêiner que herda o corpo ele vira
              uma tira estreita e quebra o título em uma palavra por linha. */}
          <div className={bloco.cta ? "max-w-[min(58rem,92vw)]" : "max-w-[min(42rem,90vw)]"}>
            {bloco.cta ? (
              <div className="flex items-center gap-4 mb-[clamp(1.25rem,3vh,2rem)]">
                <span className="font-extrabold text-[13px] tracking-[0.32em] uppercase text-tinta">
                  Nexus
                </span>
                <span className="h-px w-12 bg-ember shrink-0" />
                <span className="olho-suave">{bloco.olho}</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-3.5 mb-[22px]">
                <span className="font-mono text-[12px] tracking-[0.1em] text-ember">{numero}</span>
                <span className="olho-suave">{bloco.olho}</span>
              </div>
            )}

            {bloco.cta ? (
              // Teto de 5rem em vez dos 6.2rem do desenho: acima disso o
              // título de abertura passa de quatro linhas num notebook de
              // 768px de altura e encosta no cabeçalho.
              <h1 className="text-[clamp(2.4rem,5.4vw,5rem)] font-bold leading-[0.98] tracking-[-0.035em] text-balance">
                {bloco.titulo}
              </h1>
            ) : (
              <h2 className="text-[clamp(1.9rem,4.4vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em] text-balance">
                {bloco.titulo}
              </h2>
            )}

            <p className="mt-[clamp(1.375rem,3.4vh,2.25rem)] text-[clamp(1rem,1.35vw,1.25rem)] text-leitura leading-[1.55] max-w-[46ch]">
              {bloco.corpo}
            </p>

            {bloco.cta && (
              <div className="mt-[clamp(1.75rem,4vh,2.75rem)] flex flex-wrap gap-3.5 items-center">
                <Link href="/solicitar" className="btn-p whitespace-nowrap">
                  Contar minha ideia <span className="font-mono font-medium">→</span>
                </Link>
                <Link href="#projetos" className="btn-s whitespace-nowrap">Ver projetos</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const aoLado = bloco.posicao === "esquerda" ? "justify-start" : "justify-end";

  return (
    <div className="absolute inset-0 flex items-center">
      <div className={`secao w-full flex ${aoLado}`}>
        {/* Mesma correção do bloco de baixo: medida em rem, não em ch. */}
        <div className="max-w-[min(34rem,80vw)]">
          <div className="flex items-baseline gap-3.5 mb-[22px]">
            <span className="font-mono text-[12px] tracking-[0.1em] text-ember">{numero}</span>
            <span className="olho-suave">{bloco.olho}</span>
          </div>
          <h2 className="text-[clamp(1.9rem,4.4vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em] text-balance">
            {bloco.titulo}
          </h2>
          <p className="mt-[22px] text-[clamp(1rem,1.2vw,1.15rem)] text-leitura leading-[1.6]">
            {bloco.corpo}
          </p>
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
          <Link href="/solicitar" className="btn-p">Contar minha ideia</Link>
          <Link href="/projetos" className="btn-s">Ver projetos</Link>
        </div>
      )}
    </div>
  );
}
