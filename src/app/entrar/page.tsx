import Link from "next/link";
import { redirect } from "next/navigation";
import { Marca } from "@/components/marca";
import { perfilAtual, ehEquipe } from "@/lib/supabase/servidor";
import { FormularioEntrar } from "@/components/formulario-entrar";

export const metadata = { title: "Entrar" };

export default async function Entrar() {
  const perfil = await perfilAtual();
  if (perfil) redirect(ehEquipe(perfil) ? "/painel" : "/portal");

  return (
    <main className="min-h-dvh grid place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/"><Marca /></Link>
        <h1 className="mt-6 text-3xl font-bold">Entrar</h1>
        <p className="mt-2 text-[15px] text-suave leading-relaxed">
          Área do cliente e painel da equipe. O acesso é criado quando o projeto é aberto:
          se você ainda não tem, comece pelo{" "}
          <Link href="/solicitar" className="text-acento font-semibold hover:underline">briefing</Link>.
        </p>
        <FormularioEntrar />
      </div>
    </main>
  );
}
