import Link from "next/link";
import { redirect } from "next/navigation";
import { Marca } from "@/components/marca";
import { perfilAtual } from "@/lib/supabase/servidor";
import { sair } from "@/app/acoes";

export const metadata = { title: "Painel" };

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/entrar");
  if (perfil.papel === "cliente") redirect("/portal");

  return (
    <>
      <header className="sticky top-0 z-40 bg-papel/90 backdrop-blur border-b border-linha">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-5">
          <Link href="/painel"><Marca /></Link>
          <span className="selo bg-acento-fundo border border-acento-borda text-acento font-mono !text-[10px] tracking-widest uppercase">
            Painel
          </span>
          <nav className="hidden sm:flex gap-4 text-[14.5px] text-tinta2">
            <Link href="/painel" className="hover:text-acento">Solicitações</Link>
            <Link href="/" className="hover:text-acento">Ver o site</Link>
          </nav>
          <div className="flex-1" />
          <span className="hidden sm:block text-[13.5px] text-suave">{perfil.nome || perfil.email}</span>
          <form action={sair}>
            <button className="text-[14px] text-suave hover:text-erro">Sair</button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 py-9">{children}</main>
    </>
  );
}
