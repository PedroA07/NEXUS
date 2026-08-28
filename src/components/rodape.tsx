import Link from "next/link";
import { Marca } from "./marca";

export function Rodape() {
  return (
    <footer className="border-t border-linha mt-24">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-wrap gap-6 justify-between text-[13.5px] text-suave">
        <div className="max-w-sm">
          <Marca className="text-tinta" />
          <p className="mt-2 leading-relaxed">
            Desenvolvimento de sites, sistemas, aplicativos e automações sob medida.
            Do briefing à entrega, com acompanhamento em tempo real.
          </p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/projetos" className="hover:text-acento">Projetos</Link>
          <Link href="/solicitar" className="hover:text-acento">Solicitar orçamento</Link>
          <Link href="/entrar" className="hover:text-acento">Área do cliente</Link>
        </nav>
      </div>
      <div className="border-t border-linha">
        <div className="max-w-6xl mx-auto px-5 py-4 text-xs text-suave">
          © {new Date().getFullYear()} Nexus. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
