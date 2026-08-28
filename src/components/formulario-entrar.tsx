"use client";

import { useActionState } from "react";
import { entrar, type Resultado } from "@/app/acoes";

export function FormularioEntrar() {
  const [estado, acao, pendente] = useActionState<Resultado | null, FormData>(entrar, null);

  return (
    <form action={acao} className="mt-8 grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="email" className="rotulo text-[14.5px]">E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="campo" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="senha" className="rotulo text-[14.5px]">Senha</label>
        <input id="senha" name="senha" type="password" required autoComplete="current-password" className="campo" />
      </div>
      {estado && !estado.ok && (
        <p className="rounded-xl bg-erro-fundo border border-erro/25 p-3 text-[14px] font-semibold text-erro">
          {estado.msg}
        </p>
      )}
      <button className="btn-p mt-1 disabled:opacity-60" disabled={pendente}>
        {pendente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
