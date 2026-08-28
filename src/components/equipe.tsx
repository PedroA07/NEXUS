"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convidarMembroEquipe, removerAcessoEquipe, type Papel } from "@/app/acoes";

type Membro = { id: string; nome: string | null; email: string | null; papel: string; ve_valores: boolean };

const ROTULO_PAPEL: Record<string, string> = { admin: "Admin", funcionario: "Funcionário" };

export function Equipe({ membros, idAtual }: { membros: Membro[]; idAtual: string }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [form, setForm] = useState({ email: "", nome: "", papel: "funcionario" as Papel, veValores: false });
  const [aviso, setAviso] = useState("");

  const convidar = () =>
    iniciar(async () => {
      setAviso("");
      const r = await convidarMembroEquipe(form);
      if (!r.ok) return setAviso(r.msg || "Não consegui convidar.");
      setForm({ email: "", nome: "", papel: "funcionario", veValores: false });
      router.refresh();
    });

  const remover = (id: string) =>
    iniciar(async () => {
      setAviso("");
      const r = await removerAcessoEquipe(id);
      if (!r.ok) setAviso(r.msg || "Não consegui remover.");
      router.refresh();
    });

  return (
    <>
      <div className="mt-8 cartao overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-linha">
              {["Nome", "E-mail", "Papel", "Vê valores", ""].map((h) => (
                <th key={h} className="text-left font-mono text-[10.5px] tracking-widest uppercase text-suave font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {membros.map((m) => (
              <tr key={m.id} className="border-b border-linha last:border-0">
                <td className="px-4 py-3 font-semibold">{m.nome || "—"}</td>
                <td className="px-4 py-3 text-tinta2">{m.email}</td>
                <td className="px-4 py-3">{ROTULO_PAPEL[m.papel] ?? m.papel}</td>
                <td className="px-4 py-3">{m.papel === "admin" || m.ve_valores ? "Sim" : "Não"}</td>
                <td className="px-4 py-3 text-right">
                  {m.id !== idAtual && (
                    <button onClick={() => remover(m.id)} disabled={pendente}
                            className="text-[13.5px] text-suave hover:text-erro disabled:opacity-60">
                      Remover acesso
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cartao p-6 mt-6">
        <h2 className="text-xl font-bold">Convidar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className="rotulo text-[14px]">E-mail</label>
            <input className="campo" type="email" value={form.email}
                   onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <label className="rotulo text-[14px]">Nome</label>
            <input className="campo" value={form.nome}
                   onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <label className="rotulo text-[14px]">Papel</label>
            <select className="campo" value={form.papel}
                    onChange={(e) => setForm({ ...form, papel: e.target.value as Papel })}>
              <option value="funcionario">Funcionário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-[14px] text-tinta2 mt-6">
            <input type="checkbox" checked={form.veValores}
                   onChange={(e) => setForm({ ...form, veValores: e.target.checked })} />
            Pode ver valores
          </label>
        </div>
        {aviso && (
          <p className="mt-4 rounded-xl bg-erro-fundo border border-erro/25 p-3 text-[14px] font-semibold text-erro">{aviso}</p>
        )}
        <button onClick={convidar} disabled={pendente} className="btn-p mt-5 disabled:opacity-60">
          {pendente ? "Convidando…" : "Convidar"}
        </button>
      </div>
    </>
  );
}
