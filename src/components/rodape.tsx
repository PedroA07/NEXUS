import Link from "next/link";
import { Marca } from "./marca";

const ELO = "font-mono text-[12px] tracking-[0.14em] uppercase text-tinta2 transition-colors duration-[250ms] hover:text-tinta";

export function Rodape() {
  return (
    <footer className="border-t border-linha bg-papel">
      <div className="secao pt-[clamp(3rem,7vh,5rem)] pb-[clamp(2rem,4vh,3rem)] flex flex-wrap gap-12 justify-between items-start">
        <div className="max-w-[34ch]">
          <Marca className="text-tinta" />
          <p className="mt-[18px] text-[14.5px] text-suave leading-[1.7]">
            Desenvolvimento de sites, sistemas, aplicativos e automações sob medida.
            Do briefing à entrega, com acompanhamento em tempo real.
          </p>
        </div>
        <nav className="grid gap-3.5">
          <Link href="/projetos" className={ELO}>Projetos</Link>
          <Link href="/solicitar" className={ELO}>Solicitar orçamento</Link>
          <Link href="/entrar" className={ELO}>Área do cliente</Link>
          <a href="https://github.com/PedroA07" target="_blank" rel="noreferrer" className={ELO}>
            Pedro Andrade ↗
          </a>
        </nav>
      </div>

      <div className="border-t border-linha">
        <div className="secao py-5 font-mono text-[11px] tracking-[0.1em] text-suave">
          © {new Date().getFullYear()} Nexus. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
