// Gerado a partir do formulário de briefing da Nexus. Fonte única das perguntas.
export type Opcao = string | [string, string];
export type Campo = {
  id: string;
  r: string;
  t: "texto" | "tel" | "email" | "data" | "longo" | "escolha" | "multipla" | "aviso";
  a?: string;
  i?: string;
  ph?: string;
  o?: Opcao[];
  p?: string[];
  req?: 1;
  rapido?: 1;
};
export type Secao = { id: string; titulo: string; resumo: string; nota?: string; campos: Campo[] };

export const SECOES: Secao[] = [
  {
    "id": "contato",
    "titulo": "Sobre você",
    "resumo": "Pra a gente saber com quem está falando e como te responder.",
    "campos": [
      {
        "id": "nome",
        "r": "Seu nome",
        "t": "texto",
        "req": 1,
        "rapido": 1,
        "ph": "Ex.: Maria Souza"
      },
      {
        "id": "empresa",
        "r": "Empresa ou marca (se tiver)",
        "t": "texto",
        "rapido": 1,
        "ph": "Ex.: Padaria Pão Quente"
      },
      {
        "id": "whatsapp",
        "r": "WhatsApp com DDD",
        "t": "tel",
        "req": 1,
        "rapido": 1,
        "ph": "(11) 90000-0000"
      },
      {
        "id": "email",
        "r": "E-mail",
        "t": "email",
        "rapido": 1,
        "ph": "voce@email.com"
      },
      {
        "id": "cidade",
        "r": "Cidade e estado",
        "t": "texto",
        "ph": "Ex.: Santos, SP"
      },
      {
        "id": "ramo",
        "r": "O que sua empresa faz?",
        "t": "texto",
        "rapido": 1,
        "a": "Em uma linha. Ex.: vendo bolos por encomenda; sou advogado trabalhista.",
        "ph": "Ex.: clínica de fisioterapia"
      },
      {
        "id": "comoConheceu",
        "r": "Como você chegou até a gente?",
        "t": "escolha",
        "o": [
          "Indicação de alguém",
          "99Freelas",
          "Instagram / redes sociais",
          "Google",
          "Outro"
        ]
      }
    ]
  },
  {
    "id": "projeto",
    "titulo": "O que você quer criar",
    "resumo": "Aqui é onde você nos conta a ideia. Escreva do seu jeito, sem se preocupar com termo técnico.",
    "campos": [
      {
        "id": "tipo",
        "r": "O que você precisa?",
        "t": "escolha",
        "req": 1,
        "rapido": 1,
        "a": "Se ficar em dúvida entre dois, marque o que parece mais próximo — a gente ajusta conversando.",
        "o": [
          [
            "Site institucional",
            "A vitrine da empresa na internet: quem somos, serviços, contato."
          ],
          [
            "Página única de vendas",
            "Uma página só, feita pra vender um produto ou captar contatos."
          ],
          [
            "Loja virtual",
            "Vender produtos pela internet, com carrinho e pagamento."
          ],
          [
            "Sistema interno / painel de gestão",
            "Pra sua equipe usar: cadastros, pedidos, controle, relatórios."
          ],
          [
            "Aplicativo de celular",
            "Aquele que a pessoa instala no Android ou iPhone."
          ],
          [
            "Programa de computador",
            "Instalado no Windows, Mac ou Linux."
          ],
          [
            "Jogo",
            ""
          ],
          [
            "Automação / robô",
            "Uma tarefa repetitiva que passa a ser feita sozinha."
          ],
          [
            "Painel de dados e relatórios",
            "Os números do seu negócio em um lugar só."
          ],
          [
            "Inteligência artificial",
            "Chatbot, análise automática, recomendação."
          ],
          [
            "Ainda não sei — preciso de ajuda pra decidir",
            ""
          ],
          [
            "Outro (explico abaixo)",
            ""
          ]
        ]
      },
      {
        "id": "resumo",
        "r": "Explique com suas palavras o que isso precisa fazer",
        "t": "longo",
        "req": 1,
        "rapido": 1,
        "a": "Escreva como se estivesse explicando pra um amigo. Quanto mais detalhe, mais preciso fica o orçamento.",
        "ph": "Ex.: quero um site onde meus clientes vejam os horários livres e marquem consulta sozinhos, e que me avise no WhatsApp quando alguém marcar."
      },
      {
        "id": "problema",
        "r": "Qual problema isso resolve hoje?",
        "t": "longo",
        "rapido": 1,
        "a": "O que te incomoda no jeito atual de fazer as coisas.",
        "ph": "Ex.: perco tempo respondendo os mesmos horários no WhatsApp e às vezes marco duas pessoas no mesmo horário."
      },
      {
        "id": "sucesso",
        "r": "Como você vai saber que deu certo?",
        "t": "longo",
        "a": "O resultado que você espera. Isso nos ajuda a priorizar o que realmente importa.",
        "ph": "Ex.: se eu parar de gastar 2 horas por dia com agendamento."
      },
      {
        "id": "existente",
        "r": "Já existe alguma coisa hoje?",
        "t": "escolha",
        "o": [
          "Não, é do zero",
          "Sim, tenho um site ou sistema e quero reformular",
          "Sim, mas está no papel ou no caderno",
          "Sim, uso planilha (Excel, Google Sheets)",
          "Uso um sistema pronto e quero trocar",
          "Não sei"
        ]
      },
      {
        "id": "existenteLink",
        "r": "Se já existe, qual o link ou o nome do sistema?",
        "t": "texto",
        "ph": "Ex.: www.meusite.com.br"
      },
      {
        "id": "referencias",
        "r": "Sites ou apps parecidos que você gosta",
        "t": "longo",
        "a": "Cole os links. Ver exemplos nos ajuda muito a entender o estilo que você quer.",
        "ph": "Ex.: gosto do jeito do site da clínica X e do app do iFood pra pedir."
      },
      {
        "id": "publico",
        "r": "Quem vai usar isso?",
        "t": "longo",
        "rapido": 1,
        "a": "Descreva as pessoas: seus clientes, sua equipe, o público em geral.",
        "ph": "Ex.: mulheres de 30 a 60 anos, moradoras da cidade, que usam mais o celular."
      },
      {
        "id": "volume",
        "r": "Quantas pessoas devem usar por mês?",
        "t": "escolha",
        "rapido": 1,
        "a": "Só uma estimativa. Isso muda o tamanho da estrutura necessária e o custo mensal.",
        "o": [
          "Até 10 pessoas",
          "De 10 a 100",
          "De 100 a 1.000",
          "Mais de 1.000",
          "Não sei estimar"
        ]
      }
    ]
  },
  {
    "id": "funcoes",
    "titulo": "O que o sistema precisa fazer",
    "resumo": "Marque tudo que você imagina que vai precisar. Marcar demais não é problema — a gente corta depois.",
    "campos": [
      {
        "id": "funcionalidades",
        "r": "Funcionalidades desejadas",
        "t": "multipla",
        "rapido": 1,
        "o": [
          [
            "Cadastro e login de usuários",
            "Cada pessoa entra com e-mail e senha."
          ],
          [
            "Níveis de acesso diferentes",
            "Ex.: o dono vê tudo, o funcionário vê só uma parte."
          ],
          [
            "Cadastro de produtos ou serviços",
            ""
          ],
          [
            "Carrinho e pagamento online",
            ""
          ],
          [
            "Agendamento / reserva de horário",
            ""
          ],
          [
            "Relatórios e exportação em Excel ou PDF",
            ""
          ],
          [
            "Envio automático de e-mail",
            "Ex.: confirmação de pedido."
          ],
          [
            "Envio automático de WhatsApp",
            ""
          ],
          [
            "Envio de fotos e arquivos pelo sistema",
            ""
          ],
          [
            "Chat ou mensagens dentro do sistema",
            ""
          ],
          [
            "Notificações",
            "Avisos na tela ou no celular."
          ],
          [
            "Painel administrativo",
            "A área onde você gerencia tudo."
          ],
          [
            "Busca e filtros",
            ""
          ],
          [
            "Mapa e localização",
            ""
          ],
          [
            "Cobrança mensal automática (assinatura)",
            ""
          ],
          [
            "Blog ou área de notícias",
            ""
          ],
          [
            "Mais de um idioma",
            ""
          ],
          [
            "Importar dados de uma planilha",
            ""
          ],
          [
            "Emissão de nota fiscal",
            ""
          ],
          [
            "Impressão de etiquetas, comandas ou cupons",
            ""
          ],
          [
            "Assinatura digital de documentos",
            ""
          ],
          [
            "Controle de estoque",
            ""
          ],
          [
            "Ainda não sei — me ajude a definir",
            ""
          ]
        ]
      },
      {
        "id": "funcoesOutras",
        "r": "Alguma outra coisa que precisa fazer?",
        "t": "longo",
        "ph": "Descreva com suas palavras."
      },
      {
        "id": "prioridade",
        "r": "Se só desse pra fazer 3 coisas, quais seriam?",
        "t": "longo",
        "rapido": 1,
        "a": "Isso nos permite montar uma primeira versão mais rápida e barata, e crescer depois.",
        "ph": "Ex.: 1) agendamento online 2) aviso no WhatsApp 3) lista de clientes."
      },
      {
        "id": "naoQuero",
        "r": "Tem algo que você já sabe que NÃO quer?",
        "t": "longo",
        "ph": "Ex.: não quero nada com anúncio; não quero que o cliente precise criar senha."
      }
    ]
  },
  {
    "id": "onde",
    "titulo": "Onde vai funcionar",
    "resumo": "Cada lugar onde o sistema roda tem um custo e um prazo diferente.",
    "campos": [
      {
        "id": "plataformas",
        "r": "Onde as pessoas vão usar?",
        "t": "multipla",
        "rapido": 1,
        "o": [
          [
            "Navegador no computador",
            "Chrome, Edge, Safari."
          ],
          [
            "Navegador no celular",
            "Abrindo pelo link, sem instalar nada."
          ],
          [
            "Aplicativo Android (Play Store)",
            ""
          ],
          [
            "Aplicativo iPhone (App Store)",
            ""
          ],
          [
            "Programa instalado no Windows",
            ""
          ],
          [
            "Programa instalado no Mac ou Linux",
            ""
          ],
          [
            "Console ou plataforma de jogo",
            ""
          ],
          [
            "Não sei — o que você recomenda?",
            ""
          ]
        ]
      },
      {
        "id": "offline",
        "r": "Precisa funcionar sem internet?",
        "t": "escolha",
        "a": "Ex.: um garçom anotando pedido num salão onde o sinal cai.",
        "o": [
          "Não, sempre vai ter internet",
          "Sim, precisa funcionar offline",
          "Seria bom, mas não é essencial",
          "Não sei"
        ]
      }
    ]
  },
  {
    "id": "visual",
    "titulo": "Visual e conteúdo",
    "resumo": "Quem entrega logo, textos e fotos — você, eu, ou os dois.",
    "campos": [
      {
        "id": "logo",
        "r": "Você já tem logo?",
        "t": "escolha",
        "o": [
          "Sim, tenho os arquivos e mando pra você",
          "Tenho, mas quero melhorar",
          "Não tenho — quero que você crie",
          "Não sei se o que eu tenho serve"
        ]
      },
      {
        "id": "identidade",
        "r": "Tem identidade visual definida?",
        "t": "escolha",
        "a": "Identidade visual é o conjunto de cores, fontes e estilo que a marca usa sempre igual.",
        "o": [
          "Sim, tenho manual de marca com cores e fontes",
          "Tenho só o logo",
          "Não tenho nada definido",
          "Não sei o que é isso"
        ]
      },
      {
        "id": "estilo",
        "r": "Que estilo visual você gosta?",
        "t": "multipla",
        "o": [
          "Limpo e minimalista",
          "Moderno e colorido",
          "Sério e corporativo",
          "Divertido e informal",
          "Sofisticado e elegante",
          "Parecido com um site que já vi",
          "Não sei — confio na sua sugestão"
        ]
      },
      {
        "id": "textos",
        "r": "Quem escreve os textos?",
        "t": "escolha",
        "o": [
          "Eu envio tudo pronto",
          "Envio um rascunho e você ajusta",
          "Prefiro que você escreva",
          "Não sei"
        ]
      },
      {
        "id": "imagens",
        "r": "E as fotos e imagens?",
        "t": "escolha",
        "o": [
          "Tenho fotos próprias e envio",
          "Quero usar banco de imagens",
          "Vou precisar contratar um fotógrafo",
          "Não sei"
        ]
      },
      {
        "id": "materiais",
        "r": "Já tem algum material pronto pra nos mandar?",
        "t": "longo",
        "a": "Catálogo, tabela de preços, planilha de clientes, textos, contratos, prints do sistema atual.",
        "ph": "Descreva aqui o que você tem. Depois nos envie os arquivos."
      }
    ]
  },
  {
    "id": "tecnica",
    "titulo": "Quem cuida da parte técnica",
    "resumo": "Esta é a parte mais importante do formulário. Leia com calma — está tudo explicado.",
    "nota": "Pra um site ou sistema ficar no ar, precisam existir três coisas: um <b>endereço</b> na internet (domínio), um <b>lugar onde ele mora</b> (hospedagem) e, quase sempre, um <b>lugar pra guardar as informações</b> (banco de dados). Cada uma tem um custo próprio, separado do valor do desenvolvimento. Aqui você nos diz de quem é essa responsabilidade. <b>Se não souber, marque “não sei” — a gente explica depois, com calma e sem pressa.</b>",
    "campos": [
      {
        "id": "dominio",
        "r": "Domínio — o endereço do seu site",
        "i": "Pense no domínio como o endereço da sua loja. Ele é alugado, não comprado: você paga uma taxa todo ano pra continuar com ele. Se a renovação não for paga, o endereço fica livre pra qualquer pessoa registrar — e o site sai do ar junto. Endereços .com.br são registrados no Registro.br; .com em empresas como GoDaddy ou Cloudflare.",
        "t": "escolha",
        "rapido": 1,
        "a": "É o que a pessoa digita pra te achar, tipo suaempresa.com.br. Custa em média R$ 40 a R$ 120 por ano, pago uma vez ao ano.",
        "o": [
          [
            "Já tenho e cuido eu mesmo",
            ""
          ],
          [
            "Já tenho, mas quero que você assuma",
            "Você renova e configura por mim."
          ],
          [
            "Não tenho — quero que você registre e cuide de tudo",
            ""
          ],
          [
            "Não tenho — quero registrar no meu nome, com você me orientando",
            ""
          ],
          [
            "Não sei o que é domínio",
            "Sem problema, a gente explica."
          ]
        ]
      },
      {
        "id": "dominioQual",
        "r": "Se já tem, qual é o endereço e onde foi registrado?",
        "t": "texto",
        "ph": "Ex.: minhaempresa.com.br, registrado no Registro.br"
      },
      {
        "id": "hospedagem",
        "r": "Hospedagem — onde o sistema fica ligado",
        "i": "A hospedagem é o computador que fica ligado 24 horas por dia guardando o seu sistema e entregando ele pra quem acessa. Sem ela, o sistema simplesmente não existe na internet. O preço varia com o tamanho: um site simples roda em algo barato; um sistema com muitos usuários, fotos e movimento precisa de mais força e custa mais.",
        "t": "escolha",
        "rapido": 1,
        "a": "É o terreno na internet que mantém tudo funcionando 24 horas por dia. Costuma custar de R$ 25 a R$ 300 por mês, dependendo do tamanho do projeto.",
        "o": [
          [
            "Já tenho e cuido eu mesmo",
            ""
          ],
          [
            "Já tenho, mas quero que você assuma",
            ""
          ],
          [
            "Quero que você contrate e cuide de tudo",
            ""
          ],
          [
            "Quero que a conta fique no meu nome, com você configurando",
            ""
          ],
          [
            "Não sei o que é hospedagem",
            ""
          ]
        ]
      },
      {
        "id": "banco",
        "r": "Banco de dados — onde ficam guardadas as informações",
        "i": "O banco de dados é o arquivo organizado do sistema: clientes, pedidos, mensagens, histórico — tudo que precisa continuar existindo depois que a página fecha. Ele fica separado do site, tem custo próprio e precisa de backup. Um site que só mostra informação pode não precisar; qualquer coisa com cadastro, login ou histórico precisa.",
        "t": "escolha",
        "rapido": 1,
        "a": "É onde ficam salvos cadastros, pedidos, mensagens e histórico — tudo que o sistema precisa lembrar. Se tem login, cadastro ou histórico, vai precisar de um.",
        "o": [
          [
            "Sim, quero que você cuide do banco de dados",
            ""
          ],
          [
            "Já temos um banco de dados e quero que você use",
            "Diga qual nas observações do final."
          ],
          [
            "Acho que não vou precisar guardar informações",
            ""
          ],
          [
            "Não sei o que é banco de dados",
            ""
          ]
        ]
      },
      {
        "id": "backup",
        "r": "Quem fica responsável pelo backup?",
        "i": "Backup é uma cópia dos seus dados guardada em outro lugar, feita automaticamente todo dia. Serve pra quando algo dá errado: alguém apagou sem querer, o servidor falhou, houve invasão. Sem backup, dado perdido é dado perdido — não existe como recuperar depois.",
        "t": "escolha",
        "a": "Backup é a cópia de segurança. Se algo der errado, é ela que salva os dados.",
        "o": [
          "Você — quero backup automático",
          "Minha equipe cuida disso",
          "Não sei — o que você recomenda?"
        ]
      },
      {
        "id": "emailProf",
        "r": "Quer e-mail profissional?",
        "i": "É o e-mail com o nome da sua empresa depois do @, tipo contato@suaempresa.com.br, em vez de um Gmail comum. Passa mais confiança e usa o mesmo domínio do site. Cada caixa de e-mail tem mensalidade própria, cobrada por pessoa que for usar.",
        "t": "escolha",
        "a": "É o e-mail com o nome da sua empresa, tipo contato@suaempresa.com.br. Tem custo mensal por caixa de e-mail.",
        "o": [
          "Sim, quero que você configure",
          "Já tenho",
          "Não preciso",
          "Não sei"
        ]
      },
      {
        "id": "lojas",
        "r": "Publicação nas lojas de aplicativo",
        "i": "Publicar um aplicativo não é só terminar de programar. A Google e a Apple analisam o app antes de liberar, o que leva de dias a semanas, e cobram pra manter uma conta de desenvolvedor. Se a conta ficar no seu nome, o app é seu para sempre; se ficar na nossa, você depende da gente para qualquer atualização.",
        "t": "escolha",
        "a": "Só se você quiser um app instalável. A Google cobra uma taxa única (cerca de US$ 25) e a Apple cobra por ano (cerca de US$ 99) pra manter o app na loja.",
        "o": [
          [
            "Quero que você publique usando contas no meu nome",
            ""
          ],
          [
            "Quero que você cuide de tudo, inclusive das contas",
            ""
          ],
          [
            "Já tenho contas de desenvolvedor",
            ""
          ],
          [
            "Não se aplica — não vai ter app",
            ""
          ],
          [
            "Não sei",
            ""
          ]
        ]
      },
      {
        "id": "custos",
        "r": "Sobre os custos que continuam depois de pronto",
        "i": "Um sistema não é como um móvel, que você compra e acabou. Enquanto ele estiver no ar existem contas correndo todo mês: hospedagem, banco de dados, domínio, envio de mensagens, uso de inteligência artificial. Esses valores são dos fornecedores, não nossos — mas é importante você saber que eles existem antes de começarmos.",
        "t": "escolha",
        "rapido": 1,
        "a": "Além do valor do desenvolvimento, serviços como hospedagem, domínio, e-mail e envio de mensagens são cobrados todo mês ou todo ano. Como você prefere lidar com isso?",
        "o": [
          [
            "Entendo — prefiro pagar direto aos fornecedores",
            ""
          ],
          [
            "Entendo — prefiro que você pague e me cobre tudo junto",
            ""
          ],
          [
            "Não sabia disso — me explique os custos antes",
            ""
          ]
        ]
      },
      {
        "id": "acessos",
        "r": "As contas e serviços devem ficar no nome de quem?",
        "i": "Contas no seu nome significa que você é o dono de tudo: se um dia quiser trocar de desenvolvedor, é só passar o acesso. Contas no nosso nome ficam mais práticas no dia a dia, mas você passa a depender da gente para qualquer mudança. Costumamos recomendar o seu nome, com acesso liberado pra gente trabalhar.",
        "t": "escolha",
        "a": "Costumamos recomendar que fiquem no seu nome: assim você nunca depende de ninguém pra ter acesso.",
        "o": [
          "No meu nome",
          "No seu nome, e você administra",
          "Tanto faz",
          "Não sei"
        ]
      },
      {
        "id": "codigo",
        "r": "Você quer receber o código-fonte no final?",
        "i": "O código-fonte é o texto que a gente escreve e que vira o sistema funcionando. Receber ele significa que qualquer outro programador consegue continuar o trabalho no futuro sem refazer do zero. Nem todo contrato de software inclui isso — por isso a pergunta aparece aqui, e não depois.",
        "t": "escolha",
        "a": "Código-fonte é a receita do sistema. Com ele, qualquer programador consegue dar manutenção no futuro.",
        "o": [
          "Sim, quero receber",
          "Não preciso",
          "Não sei o que isso significa"
        ]
      },
      {
        "id": "avisoResp",
        "t": "aviso",
        "rapido": 1,
        "r": "Importante: de quem é a responsabilidade",
        "p": [
          "Tudo que você escolher manter por sua conta — domínio, hospedagem, banco de dados, contas de serviço, senhas — continua sendo responsabilidade sua. Se o site sair do ar porque o domínio venceu, porque a hospedagem foi suspensa por falta de pagamento, porque a senha se perdeu ou porque o fornecedor mudou as regras, isso não entra na garantia do desenvolvimento. A gente ajuda a resolver, mas como atendimento avulso, cobrado à parte.",
          "Se a gente ficar responsável por alguma dessas partes, ela vira um serviço contratado e tem custo: você paga o valor do fornecedor (hospedagem, domínio, banco de dados, APIs, inteligência artificial) mais uma taxa de gestão pela nossa responsabilidade de manter aquilo no ar, renovar, acompanhar e resolver quando der problema. Mesmo cuidando de só uma parte, essa parte é cobrada.",
          "Tudo isso vai discriminado no orçamento, linha por linha, com o que é nosso e o que é de fornecedor. Nada aparece depois como surpresa."
        ]
      },
      {
        "id": "ciencia",
        "r": "Confirmação de responsabilidades e custos",
        "t": "multipla",
        "req": 1,
        "rapido": 1,
        "a": "Marque para confirmar que você leu e entendeu os dois pontos acima. Isso não é contrato — é só para começarmos alinhados.",
        "o": [
          [
            "Li e entendi",
            "Sei o que fica por minha conta e sei que as partes que você assumir têm custo."
          ]
        ]
      }
    ]
  },
  {
    "id": "integra",
    "titulo": "Pagamentos e integrações",
    "resumo": "Se o sistema precisa conversar com outros serviços que você já usa.",
    "campos": [
      {
        "id": "pagamentos",
        "r": "Vai receber pagamento pelo sistema?",
        "i": "Receber pagamento pela internet envolve uma empresa intermediária, como Mercado Pago, PagBank ou Stripe. Elas cobram uma porcentagem de cada venda — normalmente entre 1% e 5%, dependendo da forma de pagamento — e esse valor sai do que você recebe, não do orçamento do sistema.",
        "t": "multipla",
        "o": [
          "Pix",
          "Cartão de crédito",
          "Boleto",
          "Cobrança mensal automática",
          "Não vou receber pagamento pelo sistema",
          "Não sei"
        ]
      },
      {
        "id": "gateway",
        "r": "Já usa alguma plataforma de pagamento?",
        "t": "texto",
        "a": "Ex.: Mercado Pago, PagBank, Asaas, Stripe, InfinitePay, maquininha.",
        "ph": "Se não usa nenhuma, deixe em branco."
      },
      {
        "id": "integracoes",
        "r": "Precisa conversar com algum outro serviço?",
        "t": "multipla",
        "o": [
          [
            "WhatsApp",
            "Envio automático de mensagem."
          ],
          [
            "E-mail marketing",
            "Mailchimp, RD Station e similares."
          ],
          [
            "Redes sociais",
            ""
          ],
          [
            "Sistema que já uso (ERP, CRM, sistema do contador)",
            ""
          ],
          [
            "Medição de acessos (Google Analytics)",
            ""
          ],
          [
            "Emissão de nota fiscal",
            ""
          ],
          [
            "Correios ou transportadora (cálculo de frete)",
            ""
          ],
          [
            "Google Agenda",
            ""
          ],
          [
            "Inteligência artificial (chatbot, resumo automático)",
            ""
          ],
          [
            "Nenhum",
            ""
          ],
          [
            "Não sei",
            ""
          ]
        ]
      },
      {
        "id": "integracoesQuais",
        "r": "Se marcou “sistema que já uso”, qual é?",
        "t": "texto",
        "ph": "Ex.: Bling, Omie, Tiny, Totvs, planilha do Google"
      }
    ]
  },
  {
    "id": "dados",
    "titulo": "Dados de pessoas e LGPD",
    "resumo": "A LGPD é a lei brasileira que diz como dados de pessoas devem ser tratados. Pensar nisso agora sai muito mais barato do que corrigir depois.",
    "campos": [
      {
        "id": "dadosPessoais",
        "r": "Que informações de pessoas o sistema vai guardar?",
        "t": "multipla",
        "o": [
          "Nome e telefone",
          "E-mail",
          "CPF ou CNPJ",
          "Endereço",
          "Dados de pagamento",
          "Documentos (foto de RG, contratos)",
          "Informações de saúde",
          "Informações financeiras",
          "Nenhuma informação pessoal",
          "Não sei"
        ]
      },
      {
        "id": "politicas",
        "r": "Precisa de Política de Privacidade e Termos de Uso?",
        "i": "A LGPD exige que você avise às pessoas quais dados coleta e para quê. A Política de Privacidade é esse aviso e os Termos de Uso são as regras do serviço. Sem eles, além do risco de multa, o Google e as lojas de aplicativo podem recusar o seu site ou app.",
        "t": "escolha",
        "a": "São os textos que explicam ao usuário o que você faz com os dados dele. Praticamente todo site que coleta contato precisa.",
        "o": [
          "Sim, quero que você prepare",
          "Já tenho",
          "Não sei se preciso",
          "Não precisa"
        ]
      },
      {
        "id": "sigilo",
        "r": "Precisa de contrato de confidencialidade (NDA)?",
        "t": "escolha",
        "a": "É o documento em que a gente se compromete a não divulgar nada sobre o seu projeto.",
        "o": [
          "Sim",
          "Não",
          "Não sei"
        ]
      }
    ]
  },
  {
    "id": "prazo",
    "titulo": "Prazo e investimento",
    "resumo": "Ninguém gosta de falar de dinheiro logo de cara, mas é o que evita perder tempo dos dois lados.",
    "campos": [
      {
        "id": "prazo",
        "r": "Quando você gostaria que estivesse pronto?",
        "t": "escolha",
        "rapido": 1,
        "o": [
          "O quanto antes — é urgente",
          "Em até 1 mês",
          "De 1 a 3 meses",
          "De 3 a 6 meses",
          "De 6 meses a 1 ano",
          "De 1 a 2 anos",
          "Sem data definida"
        ]
      },
      {
        "id": "prazoData",
        "r": "Tem uma data limite?",
        "t": "data",
        "a": "Ex.: um evento, um lançamento, o fim de um contrato."
      },
      {
        "id": "orcamento",
        "r": "Que faixa de investimento você tem em mente?",
        "i": "Não existe preço de tabela em software porque cada projeto é diferente. O que muda o valor é a quantidade de telas, as funcionalidades, as integrações com outros serviços e o prazo. Saber a sua faixa nos permite propor uma versão que caiba nela, em vez de simplesmente dizer que não dá.",
        "t": "escolha",
        "rapido": 1,
        "a": "Não é compromisso e não encarece nada. Saber a faixa nos ajuda a propor algo que caiba no seu bolso, em vez de mandar um orçamento fora da realidade.",
        "o": [
          "Até R$ 2.000",
          "De R$ 2.000 a R$ 5.000",
          "De R$ 5.000 a R$ 15.000",
          "De R$ 15.000 a R$ 40.000",
          "Acima de R$ 40.000",
          "Ainda não sei — quero uma estimativa sua"
        ]
      },
      {
        "id": "pagamento",
        "r": "Como você prefere pagar?",
        "t": "escolha",
        "o": [
          "À vista",
          "Entrada + parcelas",
          "Por etapas entregues",
          "Mensalidade",
          "Quero conversar sobre isso"
        ]
      },
      {
        "id": "nota",
        "r": "Vai precisar de nota fiscal?",
        "t": "escolha",
        "o": [
          "Sim, para CNPJ",
          "Sim, pessoa física",
          "Não",
          "Não sei"
        ]
      },
      {
        "id": "decisor",
        "r": "Quem decide a contratação?",
        "t": "escolha",
        "o": [
          "Eu mesmo",
          "Eu e mais uma pessoa",
          "Preciso aprovar com a diretoria ou sócios"
        ]
      },
      {
        "id": "avisoPrazo",
        "t": "aviso",
        "rapido": 1,
        "r": "Como o prazo é contado",
        "p": [
          "O prazo não começa a correr quando você envia este formulário. Primeiro a gente analisa o briefing; se o projeto for aprovado, entramos em contato e marcamos uma conversa para levantar os requisitos, as especificações e o escopo em detalhe.",
          "É nessa conversa que o prazo e o valor reais são definidos e colocados por escrito. Tudo que for falado antes disso — inclusive qualquer estimativa que a gente passe por mensagem — é aproximação, e serve só para você saber se vale a pena seguir."
        ]
      }
    ]
  },
  {
    "id": "depois",
    "titulo": "Depois de entregue",
    "resumo": "Software não é como uma parede pintada: precisa de manutenção pra continuar funcionando bem.",
    "campos": [
      {
        "id": "manutencao",
        "r": "Quer que a gente continue responsável depois da entrega?",
        "i": "Software não fica parado no tempo: navegadores mudam, celulares atualizam, regras de segurança mudam e serviços que o sistema usa saem do ar. Manutenção é o trabalho de acompanhar isso e corrigir antes de virar problema. Sem ninguém cuidando, um sistema que funciona hoje costuma apresentar defeito em alguns meses.",
        "t": "escolha",
        "rapido": 1,
        "a": "Manutenção cobre correções, atualizações de segurança, pequenos ajustes e monitoramento pra garantir que está tudo no ar.",
        "o": [
          [
            "Sim, quero um plano mensal",
            "Você cuida de tudo e eu não me preocupo."
          ],
          [
            "Só quero suporte quando precisar, pagando por demanda",
            ""
          ],
          [
            "Não, minha equipe assume",
            ""
          ],
          [
            "Não sei — me explique as opções",
            ""
          ]
        ]
      },
      {
        "id": "atualizacoes",
        "r": "Quem vai mexer no conteúdo no dia a dia?",
        "t": "escolha",
        "o": [
          "Eu ou minha equipe — quero um painel simples pra isso",
          "Prefiro te pedir sempre que precisar",
          "Quase nada vai mudar",
          "Não sei"
        ]
      },
      {
        "id": "treinamento",
        "r": "Vai precisar de treinamento?",
        "t": "escolha",
        "o": [
          "Sim, treinamento por chamada de vídeo",
          "Sim, manual escrito ou vídeos gravados",
          "As duas coisas",
          "Não precisa"
        ]
      },
      {
        "id": "crescimento",
        "r": "Pensa em crescer isso depois?",
        "t": "longo",
        "a": "O que você imagina numa segunda fase. Saber agora evita ter que refazer tudo lá na frente.",
        "ph": "Ex.: depois quero vender também para outras cidades e ter app próprio."
      },
      {
        "id": "observacoes",
        "r": "Quer acrescentar mais alguma coisa?",
        "t": "longo",
        "rapido": 1,
        "ph": "Qualquer detalhe, dúvida ou preocupação. Pode escrever à vontade."
      }
    ]
  }
];

export const opTexto = (o: Opcao) => (Array.isArray(o) ? o[0] : o);
export const opDica = (o: Opcao) => (Array.isArray(o) ? o[1] || "" : "");
export const camposDoModo = (s: Secao, m: "rapido" | "completo") =>
  s.campos.filter((c) => m === "completo" || c.rapido);
export const secoesDoModo = (m: "rapido" | "completo") =>
  SECOES.filter((s) => camposDoModo(s, m).length > 0);
