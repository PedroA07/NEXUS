import Link from "next/link";
import { redirect } from "next/navigation";
import { Marca } from "@/components/marca";
import { perfilAtual } from "@/lib/supabase/servidor";
import { sair } from "@/app/acoes";
import { FormularioConta } from "@/components/formulario-conta";

export const metadata = { title: "Minha conta" };

export default async function Conta() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/entrar");

  const voltar = perfil.papel === "cliente" ? "/portal" : "/painel";

  return (
    <>
      <header className="sticky top-0 z-40 bg-papel/90 backdrop-blur border-b border-linha">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href="/"><Marca /></Link>
          <div className="flex-1" />
          <Link href={voltar} className="text-[14px] text-suave hover:text-acento">Voltar</Link>
          <form action={sair}><button className="text-[14px] text-suave hover:text-erro">Sair</button></form>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold">Minha conta</h1>
        <p className="mt-2 text-[15px] text-suave">{perfil.email}</p>
        <FormularioConta perfil={perfil} />
      </main>
    </>
  );
}
