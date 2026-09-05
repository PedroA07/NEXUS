import type { RaioX } from "@/lib/briefing-raiox";

/** Onde cada módulo se encaixa na maquete, na ordem em que são preenchidos. */
const SLOTS = [
  { x: 76, y: 62 },
  { x: 154, y: 62 },
  { x: 222, y: 62 },
  { x: 76, y: 104 },
  { x: 154, y: 104 },
  { x: 222, y: 104 },
];

const LARGURA_SLOT = 70;
const TETO_TEXTO = LARGURA_SLOT - 12;
/** Largura aproximada de um caractere do mono a 12px com 0.8 de espaçamento. */
const LARGURA_CARACTERE = 12 * 0.6 + 0.8;

/**
 * Retrato do projeto montado a partir das respostas: uma casca (janela, painel,
 * celular ou fluxo), os módulos encaixados nela e as peças de apoio — quem usa,
 * onde os dados ficam, com o que conversa.
 *
 * Não é o projeto final e não deve parecer: é o eco visual do que a pessoa
 * acabou de responder, para ela ver a ideia ganhando corpo enquanto avança.
 */
export function BriefingMaquete({ raiox, className = "" }: { raiox: RaioX; className?: string }) {
  const { casca, modulos, pessoas, guardaDados, conecta } = raiox;
  const mostraSlots = casca !== "" && casca !== "fluxo" && casca !== "celular";

  return (
    <svg
      viewBox="0 0 320 236"
      className={`block w-full h-full ${className}`}
      role="img"
      aria-label="Maquete do seu projeto, montada a partir das suas respostas"
      style={{ overflow: "visible" }}
    >
      {!casca && (
        <g>
          <rect x="20" y="30" width="280" height="180" fill="none" stroke="var(--color-linha0)" strokeWidth="1" strokeDasharray="4 5" />
          <text x="160" y="124" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="1.6" fill="var(--color-suave)">
            AGUARDANDO RESPOSTA
          </text>
        </g>
      )}

      {casca === "janela" && (
        <g>
          <rect x="20" y="30" width="280" height="180" fill="var(--color-painel)" stroke="var(--color-linha3)" strokeWidth="1" />
          <line x1="20" y1="52" x2="300" y2="52" stroke="var(--color-linha2)" strokeWidth="1" />
          <circle cx="31" cy="41" r="2.5" fill="var(--color-linha3)" />
          <circle cx="40" cy="41" r="2.5" fill="var(--color-linha3)" />
          <circle cx="49" cy="41" r="2.5" fill="var(--color-linha3)" />
          <rect x="62" y="36" width="120" height="10" fill="var(--color-painel3)" />
        </g>
      )}

      {casca === "painel" && (
        <g>
          <rect x="20" y="30" width="280" height="180" fill="var(--color-painel)" stroke="var(--color-linha3)" strokeWidth="1" />
          <line x1="20" y1="52" x2="300" y2="52" stroke="var(--color-linha2)" strokeWidth="1" />
          <line x1="66" y1="52" x2="66" y2="210" stroke="var(--color-linha2)" strokeWidth="1" />
          <rect x="30" y="62" width="26" height="4" fill="var(--color-linha3)" />
          <rect x="30" y="74" width="26" height="4" fill="var(--color-linha)" />
          <rect x="30" y="86" width="26" height="4" fill="var(--color-linha)" />
          <rect x="30" y="38" width="30" height="7" fill="var(--color-acento-forte)" opacity=".7" />
        </g>
      )}

      {casca === "celular" && (
        <g>
          <rect x="112" y="24" width="96" height="192" rx="10" fill="var(--color-painel)" stroke="var(--color-linha3)" strokeWidth="1" />
          <rect x="146" y="31" width="28" height="4" rx="2" fill="var(--color-linha2)" />
          <line x1="112" y1="46" x2="208" y2="46" stroke="var(--color-linha2)" strokeWidth="1" />
          <rect x="140" y="204" width="40" height="3" rx="1.5" fill="var(--color-linha2)" />
        </g>
      )}

      {casca === "fluxo" && (
        <g>
          <rect x="20" y="76" width="72" height="42" fill="var(--color-painel)" stroke="var(--color-linha3)" strokeWidth="1" />
          <rect x="124" y="76" width="72" height="42" fill="var(--color-painel)" stroke="var(--color-ember)" strokeWidth="1.5" />
          <rect x="228" y="76" width="72" height="42" fill="var(--color-painel)" stroke="var(--color-linha3)" strokeWidth="1" />
          <path d="M92 97 h32" fill="none" stroke="var(--color-linha2)" strokeWidth="1" />
          <path d="M196 97 h32" fill="none" stroke="var(--color-linha2)" strokeWidth="1" />
          <path d="M114 93 l10 4 l-10 4" fill="none" stroke="var(--color-linha3)" strokeWidth="1" />
          <path d="M218 93 l10 4 l-10 4" fill="none" stroke="var(--color-linha3)" strokeWidth="1" />
          <text x="30" y="101" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="1" fill="var(--color-tinta2)">GATILHO</text>
          <text x="134" y="101" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="1" fill="var(--color-ember)">NEXUS</text>
          <text x="296" y="101" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="1" fill="var(--color-tinta2)">RESULTADO</text>
        </g>
      )}

      {mostraSlots &&
        SLOTS.map((slot, i) => {
          const rotulo = modulos[i];
          if (!rotulo) return null;
          const ultimo = i === SLOTS.length - 1;
          const aperta = rotulo.length * LARGURA_CARACTERE > TETO_TEXTO;
          return (
            <g key={slot.x + "-" + slot.y}>
              <rect
                x={slot.x}
                y={slot.y}
                width={LARGURA_SLOT}
                height="34"
                fill={ultimo ? "var(--color-acento-selo)" : "none"}
                stroke={ultimo ? "var(--color-ember)" : "var(--color-linha3)"}
                strokeWidth={ultimo ? 1.5 : 1}
              />
              <text
                x={slot.x + (ultimo ? 6 : 8)}
                y={slot.y + 20}
                fontFamily="IBM Plex Mono, monospace"
                fontSize="12"
                letterSpacing=".8"
                fill={ultimo ? "var(--color-ember)" : "var(--color-leitura)"}
                {...(aperta ? { textLength: TETO_TEXTO, lengthAdjust: "spacingAndGlyphs" as const } : {})}
              >
                {rotulo}
              </text>
            </g>
          );
        })}

      {pessoas > 0 && (
        <g>
          <text x="30" y="160" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="1.2" fill="var(--color-tinta2)">
            QUEM USA
          </text>
          {Array.from({ length: pessoas }, (_, k) => (
            <circle
              key={k}
              cx={34 + k * 15}
              cy="174"
              r="4.5"
              fill={k === 0 ? "var(--color-ember)" : "none"}
              stroke="var(--color-linha3)"
              strokeWidth="1"
            />
          ))}
        </g>
      )}

      {guardaDados && casca !== "celular" && (
        <g>
          <ellipse cx="60" cy="184" rx="26" ry="6" fill="none" stroke="var(--color-acento-forte)" strokeWidth="1.2" />
          <path d="M34 184 v14" fill="none" stroke="var(--color-acento-forte)" strokeWidth="1.2" />
          <path d="M86 184 v14" fill="none" stroke="var(--color-acento-forte)" strokeWidth="1.2" />
          <ellipse cx="60" cy="198" rx="26" ry="6" fill="none" stroke="var(--color-acento-forte)" strokeWidth="1.2" />
          <text x="96" y="196" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="1.2" fill="var(--color-tinta2)">
            GUARDA OS DADOS
          </text>
        </g>
      )}

      {conecta && (
        <g>
          <rect x="228" y="168" width="30" height="18" fill="none" stroke="var(--color-linha3)" strokeWidth="1" />
          <rect x="270" y="168" width="30" height="18" fill="none" stroke="var(--color-linha3)" strokeWidth="1" />
          <path d="M258 177 h12" fill="none" stroke="var(--color-linha2)" strokeWidth="1" />
          <path d="M243 168 v-16" fill="none" stroke="var(--color-linha2)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="300" y="200" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="1.2" fill="var(--color-tinta2)">
            CONECTA COM
          </text>
        </g>
      )}
    </svg>
  );
}
