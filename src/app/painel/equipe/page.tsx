import { redirect } from "next/navigation";
import { criarClienteServidor, perfilAtual } from "@/lib/supabase/servidor";
import { Equipe } from "@/components/equipe";

export const metadata = { title: "Equipe" };

export default async function PainelEquipe() {
  const perfil = await perfilAtual();
  if (perfil?.papel !== "admin") redirect("/painel");

  const sb = await criarClienteServidor();
  const { data: membros } = await sb
    .from("perfis")
    .select("id,nome,email,papel,ve_valores")
    .in("papel", ["admin", "funcionario"])
    .order("papel")
    .order("nome");

  return (
    <>
      <p className="olho">Painel interno</p>
      <h1 className="mt-2 text-3xl font-bold">Equipe</h1>
      <p className="mt-2 text-[15px] text-suave max-w-2xl">
        Quem tem acesso ao painel. Funcionários enxergam solicitações e projetos como
        admin, exceto gerenciar quem tem acesso.
      </p>
      <Equipe membros={membros ?? []} idAtual={perfil.id} />
    </>
  );
}
