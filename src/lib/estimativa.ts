// Motor de estimativa da Nexus, mesmo cálculo do estimador interno.
// Roda no servidor (quando uma solicitação chega) e no painel administrativo.

export type Par = [string, number];

export const TIPOS: Par[] = [
  [
    "Site institucional",
    24
  ],
  [
    "Página única de vendas",
    12
  ],
  [
    "Loja virtual",
    70
  ],
  [
    "Sistema interno / painel de gestão",
    60
  ],
  [
    "Aplicativo de celular",
    80
  ],
  [
    "Programa de computador",
    70
  ],
  [
    "Jogo",
    120
  ],
  [
    "Automação / robô",
    30
  ],
  [
    "Painel de dados e relatórios",
    40
  ],
  [
    "Inteligência artificial",
    60
  ],
  [
    "Ainda não definido",
    40
  ]
];
export const FUNCS: Par[] = [
  [
    "Cadastro e login de usuários",
    14
  ],
  [
    "Níveis de acesso diferentes",
    10
  ],
  [
    "Cadastro de produtos ou serviços",
    12
  ],
  [
    "Carrinho e pagamento online",
    26
  ],
  [
    "Agendamento / reserva de horário",
    22
  ],
  [
    "Relatórios e exportação em Excel ou PDF",
    16
  ],
  [
    "Envio automático de e-mail",
    8
  ],
  [
    "Envio automático de WhatsApp",
    14
  ],
  [
    "Envio de fotos e arquivos pelo sistema",
    10
  ],
  [
    "Chat ou mensagens dentro do sistema",
    24
  ],
  [
    "Notificações",
    12
  ],
  [
    "Painel administrativo",
    24
  ],
  [
    "Busca e filtros",
    10
  ],
  [
    "Mapa e localização",
    10
  ],
  [
    "Cobrança mensal automática (assinatura)",
    20
  ],
  [
    "Blog ou área de notícias",
    12
  ],
  [
    "Mais de um idioma",
    14
  ],
  [
    "Importar dados de uma planilha",
    10
  ],
  [
    "Emissão de nota fiscal",
    20
  ],
  [
    "Impressão de etiquetas, comandas ou cupons",
    12
  ],
  [
    "Assinatura digital de documentos",
    16
  ],
  [
    "Controle de estoque",
    20
  ]
];
export const PLATS: Par[] = [
  [
    "Navegador no computador",
    0
  ],
  [
    "Navegador no celular",
    10
  ],
  [
    "Aplicativo Android (Play Store)",
    45
  ],
  [
    "Aplicativo iPhone (App Store)",
    40
  ],
  [
    "Programa instalado no Windows",
    35
  ],
  [
    "Programa instalado no Mac ou Linux",
    25
  ],
  [
    "Console ou plataforma de jogo",
    60
  ]
];
export const INTEGRA: Par[] = [
  [
    "WhatsApp",
    16
  ],
  [
    "E-mail marketing",
    8
  ],
  [
    "Redes sociais",
    8
  ],
  [
    "Sistema que já uso (ERP, CRM, sistema do contador)",
    30
  ],
  [
    "Medição de acessos (Google Analytics)",
    4
  ],
  [
    "Emissão de nota fiscal",
    20
  ],
  [
    "Correios ou transportadora (cálculo de frete)",
    12
  ],
  [
    "Google Agenda",
    10
  ],
  [
    "Inteligência artificial (chatbot, resumo automático)",
    28
  ]
];
export const EXTRAS: Par[] = [
  [
    "Layout personalizado (sem template pronto)",
    20
  ],
  [
    "Criação de identidade visual e logo",
    18
  ],
  [
    "Política de Privacidade e Termos (LGPD)",
    8
  ],
  [
    "Treinamento e manual de uso",
    8
  ],
  [
    "Migração de dados de sistema antigo",
    16
  ],
  [
    "Multi-idioma de conteúdo",
    0
  ]
];
export const FASES: [string, number][] = [
  [
    "Descoberta e escopo",
    0.08
  ],
  [
    "Design das telas",
    0.15
  ],
  [
    "Desenvolvimento",
    0.52
  ],
  [
    "Testes e ajustes",
    0.15
  ],
  [
    "Publicação e treinamento",
    0.1
  ]
];

export type Parametros = {
  hora: number;        // R$ por hora
  semana: number;      // horas dedicadas a este projeto por semana
  semanasMes: number;  // semanas realmente produtivas por mês (de 4)
  gestaoPct: number;   // % sobre o esforço técnico
  buffer: number;      // % de imprevistos
  margem: number;      // % de margem
  imposto: number;     // % de impostos e taxas
  hosp: number; bd: number; ia: number; email: number; gestao: number; // R$/mês
  dominio: number; lojas: number; // R$/ano e valor único
};

export const PADRAO: Parametros = {
  hora: 120, semana: 12, semanasMes: 3, gestaoPct: 15, buffer: 15,
  margem: 25, imposto: 6,
  hosp: 80, bd: 60, ia: 150, email: 25, gestao: 250,
  dominio: 60, lojas: 0,
};

export type Escopo = {
  tipo: number; funcs: number[]; plats: number[]; integra: number[]; extras: number[];
};

export type Fase = {
  nome: string; horas: number; semanas: number;
  semIni: number; semFim: number; inicio: string; fim: string;
};

export type Estimativa = {
  itens: { grupo: string; nome: string; horas: number }[];
  horas: number; gerencia: number; buffer: number;
  semanasTrabalho: number; semanas: number;
  fases: Fase[]; inicio: string; entrega: string;
  desenvolvimento: number; anualIA: number; anualInfra: number;
  margemImposto: number; total: number; minimo: number; maximo: number;
  recorrenteMes: number; parametros: Parametros;
};

const somaSemanas = (d: Date, s: number) => {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + Math.round(s * 7));
  return x;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function estimar(escopo: Escopo, p: Parametros = PADRAO, inicioISO?: string): Estimativa {
  const itens: Estimativa["itens"] = [];
  let h = 0;

  const t = TIPOS[escopo.tipo] ?? TIPOS[0];
  itens.push({ grupo: "Estrutura", nome: t[0], horas: t[1] });
  h += t[1];

  const somar = (catalogo: Par[], marcados: number[], grupo: string) => {
    for (const i of marcados) {
      const item = catalogo[i];
      if (item && item[1] > 0) {
        itens.push({ grupo, nome: item[0], horas: item[1] });
        h += item[1];
      }
    }
  };
  somar(FUNCS, escopo.funcs, "Funcionalidade");
  somar(PLATS, escopo.plats, "Plataforma");
  somar(INTEGRA, escopo.integra, "Integração");
  somar(EXTRAS, escopo.extras, "Extra");

  const gerencia = Math.round(h * (p.gestaoPct / 100));
  itens.push({
    grupo: "Gestão",
    nome: "Proposta, reuniões, atendimento e administração (" + p.gestaoPct + "%)",
    horas: gerencia,
  });
  h += gerencia;

  const buffer = Math.round(h * (p.buffer / 100));
  const horas = h + buffer;

  // Semanas de trabalho puro e, em cima delas, o calendário real:
  // se só 3 das 4 semanas do mês rendem, o prazo estica na mesma proporção.
  const semanasTrabalho = Math.max(1, Math.ceil(horas / Math.max(1, p.semana)));
  const ritmo = 4 / Math.max(1, Math.min(4, p.semanasMes));
  const corridas = Math.max(1, Math.ceil(semanasTrabalho * ritmo));

  const inicio = inicioISO ? new Date(inicioISO + "T12:00:00") : new Date();
  const fases: Fase[] = [];
  let acum = 0;
  for (const [nome, frac] of FASES) {
    const hf = Math.round(horas * frac);
    const sem = Math.max(1, Math.round(corridas * frac));
    const ini = acum;
    const fim = acum + sem;
    acum = fim;
    fases.push({
      nome, horas: hf, semanas: sem, semIni: ini, semFim: fim,
      inicio: iso(somaSemanas(inicio, ini)), fim: iso(somaSemanas(inicio, fim)),
    });
  }
  const entrega = iso(somaSemanas(inicio, acum));

  const desenvolvimento = horas * p.hora;
  const mensalInfra = p.hosp + p.bd + p.email + p.gestao;
  const anualInfra = mensalInfra * 12 + p.dominio + p.lojas;
  const anualIA = p.ia * 12;
  const direto = desenvolvimento + anualInfra + anualIA;
  const margem = direto * (p.margem / 100);
  const base = direto + margem;
  const imposto = base * (p.imposto / 100);
  const total = base + imposto;

  return {
    itens, horas, gerencia, buffer,
    semanasTrabalho, semanas: acum, fases,
    inicio: iso(inicio), entrega,
    desenvolvimento, anualIA, anualInfra,
    margemImposto: margem + imposto,
    total, minimo: total * 0.9, maximo: total * 1.2,
    recorrenteMes: mensalInfra + p.ia,
    parametros: p,
  };
}

// Traduz as respostas do briefing em escopo, casando pelo texto das opções.
export function escopoDoBriefing(respostas: Record<string, unknown>): Escopo {
  const texto = (v: unknown) => (typeof v === "string" ? v : "");
  const lista = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);

  const alvo = texto(respostas.tipo).toLowerCase();
  const achado = TIPOS.findIndex(([n]) => alvo.startsWith(n.toLowerCase().slice(0, 14)));

  const casar = (catalogo: Par[], marcadas: string[]) =>
    marcadas.map((m) => catalogo.findIndex(([n]) => n === m)).filter((i) => i >= 0);

  const plats = casar(PLATS, lista(respostas.plataformas));

  const extras = new Set<number>([0]);
  if (texto(respostas.logo).includes("quero que você crie")) extras.add(1);
  if (texto(respostas.politicas).includes("quero que você prepare")) extras.add(2);
  if (texto(respostas.treinamento).startsWith("Sim")) extras.add(3);
  const existente = texto(respostas.existente);
  if (existente.includes("planilha") || existente.includes("trocar")) extras.add(4);

  return {
    tipo: achado >= 0 ? achado : 0,
    funcs: casar(FUNCS, lista(respostas.funcionalidades)),
    plats: plats.length ? plats : [0],
    integra: casar(INTEGRA, lista(respostas.integracoes)),
    extras: [...extras],
  };
}
