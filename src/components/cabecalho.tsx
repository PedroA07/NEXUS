import Link from "next/link";
import { Marca } from "./marca";
import { perfilAtual, ehEquipe } from "@/lib/supabase/servidor";

export async function Cabecalho() {
  const perfil = await perfilAtual();
  const destino = ehEquipe(perfil) ? "/painel" : "/portal";

  return (
    <header className="sticky top-0 z-40 bg-papel/90 backdrop-blur border-b border-linha">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-6">
        <Link href="/" className="shrink-0"><Marca /></Link>
        <nav className="hidden sm:flex items-center gap-5 text-[14.5px] text-tinta2">
          <Link href="/projetos" className="hover:text-acento">Projetos</Link>
          <Link href="/#servicos" className="hover:text-acento">Serviços</Link>
          <Link href="/#processo" className="hover:text-acento">Como funciona</Link>
        </nav>
        <div className="flex-1" />
        {perfil ? (
          <Link href={destino} className="text-[14.5px] font-semibold text-acento hover:text-acento-forte">
            {ehEquipe(perfil) ? "Painel" : "Meus projetos"}
          </Link>
        ) : (
          <Link href="/entrar" className="text-[14.5px] text-tinta2 hover:text-acento">Entrar</Link>
        )}
        <Link href="/solicitar" className="btn-p !py-2 !px-4 !text-[14.5px]">Solicitar orçamento</Link>
      </div>
    </header>
  );
}
