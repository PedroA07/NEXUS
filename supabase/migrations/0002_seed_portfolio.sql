-- Portfólio inicial. Revise os textos e REMOVA o que não quiser público
-- (em especial nomes de clientes, que precisam de autorização).

insert into portfolio (slug, titulo, resumo, descricao, categoria, stack, ano, destaque, ordem) values
('sonara', 'Sonara',
 'Player de música para desktop, de código aberto.',
 'Aplicativo de desktop para ouvir e organizar a própria biblioteca musical, com site próprio de apresentação e download. Projeto autoral, aberto e mantido continuamente.',
 'Desktop', array['Electron','TypeScript','Node.js'], 2025, true, 10),

('nexus-control', 'Nexus Control',
 'Aplicativo de finanças pessoais multiplataforma com machine learning.',
 'Controle financeiro pessoal que categoriza lançamentos sozinho, projeta gastos e conversa com Open Finance. Roda em web e celular a partir da mesma base de código.',
 'Aplicativo', array['React Native','Python','PostgreSQL','ML'], 2026, true, 20),

('mystery-box-match', 'Mystery Box Match',
 'App de match entre colecionadores de blind box.',
 'Rede para quem coleciona mystery box: cadastro do acervo, lista de desejos e pareamento automático entre quem tem e quem procura, com chat para fechar a troca ou a venda.',
 'Aplicativo', array['React Native','Supabase','PostgreSQL'], 2026, true, 30),

('noitada', 'NOITADA',
 'Sistema de coleção de cartas integrado a bot do Discord.',
 'Coleção de cartas digitais com raridade, troca entre usuários e integração com um bot de Discord que distribui e movimenta as cartas dentro da comunidade.',
 'Web', array['Next.js','Discord.js','PostgreSQL'], 2025, false, 40),

('vtt-rpg', 'Mesa virtual de RPG em 3D',
 'VTT multijogador com autoria de mundo pelo mestre.',
 'Mesa de RPG tridimensional e multijogador, em que o mestre monta o cenário, posiciona os personagens e conduz a sessão em tempo real com os jogadores.',
 'Jogo', array['Unity','C#','Netcode'], 2026, false, 50),

('sistema-previdenciario', 'Sistema previdenciário municipal',
 'Sistema interno de gestão para uma autarquia de previdência.',
 'Sistema interno para gestão de servidores, benefícios e rotinas administrativas de uma autarquia previdenciária municipal, substituindo controles em planilha.',
 'Sistema interno', array['Next.js','PostgreSQL','Supabase'], 2026, false, 60)
on conflict (slug) do nothing;
