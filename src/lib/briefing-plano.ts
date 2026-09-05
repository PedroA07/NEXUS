import { SECOES, camposDoModo, type Campo } from "@/lib/briefing";

export type Modo = "rapido" | "completo";

export type PassoBriefing =
  | { tipo: "campo"; id: string; cap: string; olho: string; campo: Campo }
  | { tipo: "grupo"; id: string; cap: string; olho: string; pergunta: string; nota: string; campos: Campo[] }
  | { tipo: "revisao"; id: "revisao"; cap: string; olho: string };

/**
 * Ordem das perguntas conforme o handoff de design, que é diferente da ordem
 * de `SECOES`: o briefing abre pela ideia e deixa o contato para o fim, quando
 * a pessoa já investiu na conversa e pedir telefone não soa como pedágio.
 *
 * `cap` alimenta a trilha de capítulos do cabeçalho; `olho` é o rótulo da
 * etapa. Os dois só divergem em Prazo/Investimento, que o desenho trata como
 * um capítulo só com dois rótulos.
 */
const ORDEM: { cap: string; olho?: string; ids: string[] }[] = [
  { cap: "Ideia", ids: ["tipo", "resumo", "problema", "sucesso", "existente", "existenteLink", "referencias"] },
  { cap: "Público", ids: ["publico", "volume"] },
  { cap: "Funções", ids: ["funcionalidades", "prioridade", "naoQuero"] },
  { cap: "Onde roda", ids: ["plataformas", "offline"] },
  { cap: "Visual", ids: ["logo", "identidade", "estilo", "textos", "imagens", "materiais"] },
  { cap: "Técnica", ids: ["dominio", "hospedagem", "banco", "backup", "emailProf", "lojas", "custos", "acessos", "codigo", "ciencia"] },
  { cap: "Integrações", ids: ["pagamentos", "gateway", "integracoes", "integracoesQuais"] },
  { cap: "Dados", ids: ["dadosPessoais", "politicas", "sigilo"] },
  { cap: "Prazo", ids: ["prazo", "prazoData"] },
  { cap: "Prazo", olho: "Investimento", ids: ["orcamento", "pagamento", "nota", "decisor"] },
  { cap: "Depois", ids: ["manutencao", "atualizacoes", "treinamento", "crescimento", "observacoes"] },
  { cap: "Contato", ids: ["comoConheceu"] },
];

/** Os seis campos de contato vivem numa tela só, como no desenho. */
const GRUPO_CONTATO = ["nome", "whatsapp", "email", "empresa", "ramo", "cidade"];

/**
 * Monta o plano de etapas do modo escolhido. Qualquer campo de `SECOES` que
 * não esteja em `ORDEM` entra no fim, antes do contato: é rede de segurança
 * para a regra do handoff de que todo campo continue sendo coletado, mesmo
 * que alguém acrescente um novo em `briefing.ts` e esqueça deste arquivo.
 */
export function montarPlano(modo: Modo): PassoBriefing[] {
  const porId = new Map<string, Campo>();
  for (const secao of SECOES) {
    for (const campo of camposDoModo(secao, modo)) {
      if (campo.t !== "aviso") porId.set(campo.id, campo);
    }
  }

  const usados = new Set<string>();
  const passos: PassoBriefing[] = [];

  for (const bloco of ORDEM) {
    for (const id of bloco.ids) {
      const campo = porId.get(id);
      if (!campo) continue;
      usados.add(id);
      passos.push({ tipo: "campo", id, cap: bloco.cap, olho: bloco.olho ?? bloco.cap, campo });
    }
  }

  const sobras = [...porId.keys()].filter((id) => !usados.has(id) && !GRUPO_CONTATO.includes(id));
  for (const id of sobras) {
    usados.add(id);
    passos.push({ tipo: "campo", id, cap: "Depois", olho: "Depois", campo: porId.get(id)! });
  }

  const camposContato = GRUPO_CONTATO.map((id) => porId.get(id)).filter((c): c is Campo => Boolean(c));
  if (camposContato.length) {
    passos.push({
      tipo: "grupo",
      id: "contato",
      cap: "Contato",
      olho: "Contato",
      pergunta: "Por último: como falamos com você?",
      nota: "O que você escreveu aqui é usado só para montar a sua proposta. Depois de enviar, analisamos o briefing e marcamos a conversa de levantamento — é nela que prazo e valor são fechados por escrito.",
      campos: camposContato,
    });
  }

  passos.push({ tipo: "revisao", id: "revisao", cap: "Revisão", olho: "Revisão" });
  return passos;
}
