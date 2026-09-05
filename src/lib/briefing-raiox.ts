/**
 * Raio-X do briefing: lê as respostas e devolve o retrato do projeto que a
 * maquete desenha. É função pura de propósito — a maquete só pinta o que sai
 * daqui, e o mesmo cálculo alimenta a barra lateral, a gaveta e a revisão.
 */

export type Respostas = Record<string, string | string[]>;

export type Casca = "" | "janela" | "painel" | "celular" | "fluxo";

export type RaioX = {
  casca: Casca;
  modulos: string[];
  pessoas: number;
  guardaDados: boolean;
  conecta: boolean;
  nota: string;
};

const lista = (v: Respostas[string] | undefined) => (Array.isArray(v) ? v : []);
const algum = (arr: string[], re: RegExp) => arr.some((valor) => re.test(valor));

/** Módulos na ordem em que a maquete os encaixa; no máximo seis cabem. */
const MODULOS: [RegExp, string][] = [
  [/login|acesso/i, "LOGIN"],
  [/painel administrativo/i, "PAINEL"],
  [/cadastro de produtos|estoque/i, "CADASTROS"],
  [/carrinho|assinatura|nota fiscal/i, "PAGAMENTO"],
  [/agendamento/i, "AGENDA"],
  [/relatórios/i, "RELATÓRIOS"],
  [/notifica|whatsapp|e-mail/i, "AVISOS"],
  [/busca/i, "BUSCA"],
  [/chat/i, "MENSAGENS"],
  [/mapa/i, "MAPA"],
  [/arquivos|assinatura digital/i, "ARQUIVOS"],
  [/blog/i, "CONTEÚDO"],
];

export function lerRaioX(respostas: Respostas): RaioX {
  const tipo = String(respostas.tipo || "");
  const funcoes = lista(respostas.funcionalidades);
  const plataformas = lista(respostas.plataformas);
  const integracoes = lista(respostas.integracoes);
  const pagamentos = lista(respostas.pagamentos);

  let casca: Casca = "";
  if (/aplicativo|jogo/i.test(tipo) || (!tipo && algum(plataformas, /celular/i))) casca = "celular";
  else if (/automação|robô|inteligência/i.test(tipo)) casca = "fluxo";
  else if (/sistema|painel|programa/i.test(tipo)) casca = "painel";
  else if (/site|página|loja/i.test(tipo)) casca = "janela";
  else if (funcoes.length || plataformas.length) casca = "janela";

  const modulos: string[] = [];
  for (const [re, rotulo] of MODULOS) {
    if (modulos.length >= 6) break;
    // Pagamento também entra quando a pessoa escolheu uma forma de receber,
    // mesmo sem ter marcado carrinho na lista de funcionalidades.
    const bate = algum(funcoes, re) || (rotulo === "PAGAMENTO" && pagamentos.length > 0);
    if (bate && !modulos.includes(rotulo)) modulos.push(rotulo);
  }

  const volume = String(respostas.volume || "");
  const pessoas = /mais de 1/i.test(volume)
    ? 7
    : /100 a 1/i.test(volume)
      ? 5
      : /10 a 100/i.test(volume)
        ? 4
        : volume
          ? 3
          : 0;

  const guardaDados =
    /sim/i.test(String(respostas.banco || "")) || algum(funcoes, /cadastro|estoque|relatórios/i);

  const conecta = integracoes.length > 0 && !algum(integracoes, /^não/i);

  const nota = casca
    ? modulos.length
      ? `${modulos.length} ${modulos.length === 1 ? "módulo" : "módulos"} até aqui`
      : "Estrutura definida"
    : "Monta conforme você responde";

  return { casca, modulos, pessoas, guardaDados, conecta, nota };
}
