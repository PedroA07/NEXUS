"use client";

import { useActionState } from "react";
import { atualizarPerfil, type Resultado } from "@/app/acoes";

type Perfil = { nome: string | null; telefone: string | null; empresa: string | null };

export function FormularioConta({ perfil }: { perfil: Perfil }) {
  const [estado, acao, pendente] = useActionState<Resultado | null, FormData>(
    async (_estadoAnterior, form) =>
      atualizarPerfil({
        nome: String(form.get("nome") || ""),
        telefone: String(form.get("telefone") || ""),
        empresa: String(form.get("empresa") || ""),
      }),
    null,
  );

  return (
    <form action={acao} className="mt-8 grid gap-4 max-w-md">
      <div className="grid gap-1.5">
        <label htmlFor="nome" className="rotulo text-[14.5px]">Nome</label>
        <input id="nome" name="nome" defaultValue={perfil.nome ?? ""} required className="campo" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="telefone" className="rotulo text-[14.5px]">Telefone</label>
        <input id="telefone" name="telefone" defaultValue={perfil.telefone ?? ""} className="campo" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="empresa" className="rotulo text-[14.5px]">Empresa</label>
        <input id="empresa" name="empresa" defaultValue={perfil.empresa ?? ""} className="campo" />
      </div>
      {estado && (
        <p className={
          estado.ok
            ? "rounded-xl bg-ok-fundo border border-ok/25 p-3 text-[14px] font-semibold text-ok"
            : "rounded-xl bg-erro-fundo border border-erro/25 p-3 text-[14px] font-semibold text-erro"
        }>
          {estado.msg}
        </p>
      )}
      <button className="btn-p mt-1 disabled:opacity-60" disabled={pendente}>
        {pendente ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
