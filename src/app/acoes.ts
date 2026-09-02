"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criarClienteServidor, perfilAtual, ehEquipe } from "@/lib/supabase/servidor";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { estimar, escopoDoBriefing, PADRAO } from "@/lib/estimativa";
import { SECOES, camposDoModo } from "@/lib/briefing";

export type Resultado = { ok: boolean; msg?: string; dado?: string };

/* ------------------------------------------------------------------ */
/* briefing                                                            */
/* ------------------------------------------------------------------ */

type Respostas = Record<string, string | string[]>;

function montarResumo(modo: "rapido" | "completo", d: Respostas) {
  const linhas: string[] = [
    "BRIEFING DE PROJETO - NEXUS",
    modo === "rapido" ? "Formulário rápido" : "Formulário completo",
    "",
  ];
  for (const secao of SECOES) {
    const bloco: string[] = [];
    for (const campo of camposDoModo(secao, modo)) {
      const v = d[campo.id];
      if (!v || (Array.isArray(v) && v.length === 0)) continue;
      if (Array.isArray(v)) {
        bloco.push(`- ${campo.r}:`);
        v.forEach((x) => bloco.push(`    * ${x}`));
      } else if (String(v).trim()) {
        bloco.push(`- ${campo.r}: ${String(v).trim()}`);
      }
    }
    if (bloco.length) {
      linhas.push(`== ${secao.titulo.toUpperCase()} ==`, ...bloco, "");
    }
  }
  return linhas.join("\n");
}

export async function enviarBriefing(
  modo: "rapido" | "completo",
  respostas: Respostas,
): Promise<Resultado> {
  const nome = String(respostas.nome || "").trim();
  const whatsapp = String(respostas.whatsapp || "").trim();
  if (!nome || !whatsapp) {
    return { ok: false, msg: "Nome e WhatsApp são obrigatórios." };
  }

  const estimativa = estimar(escopoDoBriefing(respostas), PADRAO);
  const sb = await criarClienteServidor();

  const { data, error } = await sb
    .from("solicitacoes")
    .insert({
      modo,
      nome,
      empresa: String(respostas.empresa || "") || null,
      whatsapp,
      email: String(respostas.email || "") || null,
      respostas,
      resumo: montarResumo(modo, respostas),
      estimativa,
    })
    .select("codigo")
    .single();

  if (error) return { ok: false, msg: "Não consegui registrar agora: " + error.message };

  revalidatePath("/painel");
  return { ok: true, dado: data.codigo };
}

/* ------------------------------------------------------------------ */
/* autenticação                                                        */
/* ------------------------------------------------------------------ */

export async function entrar(_estado: Resultado | null, form: FormData): Promise<Resultado> {
  const sb = await criarClienteServidor();
  const { error } = await sb.auth.signInWithPassword({
    email: String(form.get("email") || ""),
    password: String(form.get("senha") || ""),
  });
  if (error) return { ok: false, msg: "E-mail ou senha incorretos." };

  const perfil = await perfilAtual();
  redirect(ehEquipe(perfil) ? "/painel" : "/portal");
}

export async function sair() {
  const sb = await criarClienteServidor();
  await sb.auth.signOut();
  redirect("/");
}

/* ------------------------------------------------------------------ */
/* painel administrativo                                               */
/* ------------------------------------------------------------------ */

async function exigirAdmin() {
  const perfil = await perfilAtual();
  if (perfil?.papel !== "admin") throw new Error("Acesso restrito.");
  return perfil;
}

async function exigirEquipe() {
  const perfil = await perfilAtual();
  if (perfil?.papel !== "admin" && perfil?.papel !== "funcionario") throw new Error("Acesso restrito.");
  return perfil;
}

export async function mudarStatusSolicitacao(id: string, status: string): Promise<Resultado> {
  await exigirEquipe();
  const sb = await criarClienteServidor();
  const { error } = await sb
    .from("solicitacoes")
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, msg: error.message };
  revalidatePath("/painel");
  revalidatePath(`/painel/${id}`);
  return { ok: true };
}

export async function salvarObservacoes(id: string, texto: string): Promise<Resultado> {
  await exigirEquipe();
  const sb = await criarClienteServidor();
  const { error } = await sb
    .from("solicitacoes")
    .update({ observacoes_internas: texto, atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, msg: error.message };
  revalidatePath(`/painel/${id}`);
  return { ok: true };
}

/** Aprova a solicitação, dá acesso ao cliente e abre o projeto. */
export async function abrirProjeto(
  solicitacaoId: string,
  dados: { nome: string; valor: number; prazoSemanas: number; inicio: string; entrega: string },
): Promise<Resultado> {
  await exigirEquipe();
  const sb = await criarClienteServidor();

  const { data: sol, error: e1 } = await sb
    .from("solicitacoes").select("*").eq("id", solicitacaoId).single();
  if (e1 || !sol) return { ok: false, msg: "Solicitação não encontrada." };
  if (!sol.email) return { ok: false, msg: "A solicitação não tem e-mail. Peça um para dar acesso ao cliente." };

  let clienteId = sol.cliente_id as string | null;

  if (!clienteId) {
    const admin = criarClienteAdmin();
    if (!admin) {
      return { ok: false, msg: "Defina SUPABASE_SERVICE_ROLE_KEY para poder criar o acesso do cliente." };
    }
    const { data: existente } = await admin
      .from("perfis").select("id").eq("email", sol.email).maybeSingle();

    if (existente) {
      clienteId = existente.id;
    } else {
      const { data: convite, error: e2 } = await admin.auth.admin.inviteUserByEmail(sol.email, {
        data: { nome: sol.nome, empresa: sol.empresa, telefone: sol.whatsapp },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/entrar`,
      });
      if (e2 || !convite?.user) return { ok: false, msg: "Não consegui convidar o cliente: " + (e2?.message ?? "") };
      clienteId = convite.user.id;
    }
  }

  const { data: projeto, error: e3 } = await sb
    .from("projetos")
    .insert({
      solicitacao_id: solicitacaoId,
      cliente_id: clienteId,
      nome: dados.nome,
      descricao: sol.resumo,
      valor_fechado: dados.valor || null,
      prazo_semanas: dados.prazoSemanas,
      inicio: dados.inicio || null,
      entrega_prevista: dados.entrega || null,
    })
    .select("id")
    .single();
  if (e3) return { ok: false, msg: e3.message };

  await sb
    .from("solicitacoes")
    .update({ status: "convertida", cliente_id: clienteId, atualizado_em: new Date().toISOString() })
    .eq("id", solicitacaoId);

  await sb.from("atualizacoes").insert({
    projeto_id: projeto.id,
    titulo: "Projeto aberto",
    corpo: "Bem-vindo! A partir daqui você acompanha cada etapa por esta página e pode falar com a gente pelo chat.",
    fase: "Descoberta e escopo",
    progresso: 0,
  });

  revalidatePath("/painel");
  return { ok: true, dado: projeto.id };
}

export async function publicarAtualizacao(
  projetoId: string,
  dados: { titulo: string; corpo: string; fase: string; progresso: number },
): Promise<Resultado> {
  const perfil = await exigirEquipe();
  const sb = await criarClienteServidor();

  const { error } = await sb.from("atualizacoes").insert({
    projeto_id: projetoId,
    autor_id: perfil.id,
    titulo: dados.titulo,
    corpo: dados.corpo || null,
    fase: dados.fase || null,
    progresso: dados.progresso,
  });
  if (error) return { ok: false, msg: error.message };

  await sb
    .from("projetos")
    .update({ progresso: dados.progresso, atualizado_em: new Date().toISOString() })
    .eq("id", projetoId);

  revalidatePath(`/portal/${projetoId}`);
  revalidatePath(`/painel`);
  return { ok: true };
}

export async function mudarStatusProjeto(projetoId: string, status: string): Promise<Resultado> {
  await exigirEquipe();
  const sb = await criarClienteServidor();
  const { error } = await sb
    .from("projetos")
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq("id", projetoId);
  if (error) return { ok: false, msg: error.message };
  revalidatePath(`/portal/${projetoId}`);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* equipe                                                              */
/* ------------------------------------------------------------------ */

export type Papel = "admin" | "funcionario";

export async function convidarMembroEquipe(dados: {
  email: string; nome: string; papel: Papel; veValores: boolean;
}): Promise<Resultado> {
  await exigirAdmin();
  const email = dados.email.trim().toLowerCase();
  const nome = dados.nome.trim();
  if (!email) return { ok: false, msg: "Informe um e-mail." };

  const admin = criarClienteAdmin();
  if (!admin) return { ok: false, msg: "Defina SUPABASE_SERVICE_ROLE_KEY para convidar." };

  const { data: existente } = await admin
    .from("perfis").select("id").eq("email", email).maybeSingle();

  let perfilId = existente?.id as string | undefined;

  if (!perfilId) {
    const { data: convite, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/entrar`,
    });
    if (error || !convite?.user) return { ok: false, msg: "Não consegui convidar: " + (error?.message ?? "") };
    perfilId = convite.user.id;
  }

  const atualizacao: { nome?: string; papel: Papel; ve_valores: boolean } = {
    papel: dados.papel,
    ve_valores: dados.veValores,
  };
  if (nome) atualizacao.nome = nome;

  const { error: e2 } = await admin
    .from("perfis")
    .update(atualizacao)
    .eq("id", perfilId);
  if (e2) return { ok: false, msg: e2.message };

  revalidatePath("/painel/equipe");
  return { ok: true };
}

export async function removerAcessoEquipe(perfilId: string): Promise<Resultado> {
  const eu = await exigirAdmin();
  if (perfilId === eu.id) return { ok: false, msg: "Você não pode remover o próprio acesso." };

  const admin = criarClienteAdmin();
  if (!admin) return { ok: false, msg: "Defina SUPABASE_SERVICE_ROLE_KEY para remover acesso." };

  const { data: alvo } = await admin.from("perfis").select("papel").eq("id", perfilId).single();
  if (alvo?.papel === "admin") {
    const { count } = await admin
      .from("perfis")
      .select("id", { count: "exact", head: true })
      .eq("papel", "admin");
    if ((count ?? 0) <= 1) return { ok: false, msg: "Não é possível remover o último admin." };
  }

  const { error } = await admin
    .from("perfis")
    .update({ papel: "cliente", ve_valores: false })
    .eq("id", perfilId);
  if (error) return { ok: false, msg: error.message };

  revalidatePath("/painel/equipe");
  return { ok: true };
}

export async function atualizarPerfil(dados: {
  nome: string; telefone: string; empresa: string;
}): Promise<Resultado> {
  const perfil = await perfilAtual();
  if (!perfil) return { ok: false, msg: "Entre para editar seus dados." };

  const nome = dados.nome.trim();
  if (!nome) return { ok: false, msg: "Nome é obrigatório." };

  const sb = await criarClienteServidor();
  const { error } = await sb
    .from("perfis")
    .update({
      nome,
      telefone: dados.telefone.trim() || null,
      empresa: dados.empresa.trim() || null,
    })
    .eq("id", perfil.id);
  if (error) return { ok: false, msg: error.message };

  revalidatePath("/conta");
  revalidatePath("/painel");
  revalidatePath("/portal");
  return { ok: true, msg: "Dados atualizados." };
}

/* ------------------------------------------------------------------ */
/* chat                                                                */
/* ------------------------------------------------------------------ */

export async function enviarMensagem(projetoId: string, corpo: string): Promise<Resultado> {
  const perfil = await perfilAtual();
  if (!perfil) return { ok: false, msg: "Entre para enviar mensagens." };
  const texto = corpo.trim();
  if (!texto) return { ok: false, msg: "Escreva alguma coisa." };

  const sb = await criarClienteServidor();
  const { error } = await sb
    .from("mensagens")
    .insert({ projeto_id: projetoId, autor_id: perfil.id, corpo: texto });
  if (error) return { ok: false, msg: error.message };
  return { ok: true };
}
