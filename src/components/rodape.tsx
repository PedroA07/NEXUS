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
          <Link href="/projetos" className="hover:text-acento-forte">Projetos</Link>
          <Link href="/solicitar" className="hover:text-acento-forte">Solicitar orçamento</Link>
          <Link href="/entrar" className="hover:text-acento-forte">Área do cliente</Link>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-5 pb-10">
        <a
          href="https://github.com/PedroA07"
          target="_blank"
          rel="noreferrer"
          className="cartao p-5 flex items-center gap-4 hover:border-acento-borda transition-colors group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://github.com/PedroA07.png"
            alt="Foto de perfil de Pedro Andrade no GitHub"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full border border-linha2 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[15px] text-tinta">Pedro Andrade</p>
            <p className="mt-0.5 text-[13.5px] text-suave leading-snug">
              Quem escreve o código da Nexus, projeto a projeto.
            </p>
          </div>
          <span
            aria-hidden
            className="shrink-0 w-10 h-10 rounded-full border border-linha2 grid place-items-center text-suave group-hover:text-tinta group-hover:border-acento transition-colors"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
            </svg>
          </span>
        </a>
      </div>

      <div className="border-t border-linha">
        <div className="max-w-6xl mx-auto px-5 py-4 text-xs text-suave">
          © {new Date().getFullYear()} Nexus. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
