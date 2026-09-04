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
    <main className="min-h-dvh grid lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden border-r border-linha p-[clamp(32px,5vw,72px)]">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0, transparent 3px, #12141c 3px, #12141c 6px)" }} />
        <Link href="/" className="relative"><Marca /></Link>
        <div className="relative max-w-[22ch]">
          <span className="olho text-ember">Área do cliente</span>
          <p className="mt-6 text-[clamp(1.8rem,4vw,3.4rem)] font-bold leading-none tracking-[-.035em]">Acompanhe o projeto sem caçar mensagem no WhatsApp.</p>
          <p className="mt-6 text-[15.5px] text-tinta2 leading-[1.7]">Progresso, linha do tempo de atualizações e conversa direta com quem está escrevendo o código.</p>
        </div>
        <div className="relative flex gap-4 font-mono text-[11px] tracking-[.18em] uppercase text-suave"><span>Cliente</span><span>Equipe</span><span>Admin</span></div>
      </div>
      <div className="flex items-center justify-center px-6 py-16 sm:px-16">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="font-mono text-[11px] tracking-[.18em] uppercase text-suave hover:text-tinta">← Voltar ao site</Link>
        <h1 className="mt-10 text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-none tracking-[-.035em]">Entrar</h1>
        <p className="mt-5 text-[15.5px] text-suave leading-[1.7]">
          Área do cliente e painel da equipe. O acesso é criado quando o projeto é aberto:
          se você ainda não tem, comece pelo{" "}
          <Link href="/solicitar" className="text-tinta border-b border-linha2 hover:border-ember">briefing</Link>.
        </p>
        <FormularioEntrar />
      </div>
      </div>
    </main>
  );
}
