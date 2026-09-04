import Link from "next/link";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";

export const metadata = { title: "Briefing recebido" };

const PASSOS: [string, string][] = [
  ["Análise do briefing", "Lemos tudo com calma e verificamos se dá para fazer do jeito que você imaginou, no prazo e no orçamento indicados."],
  ["Retorno", "Se fizer sentido para os dois lados, entramos em contato pelo WhatsApp ou e-mail que você deixou."],
  ["Conversa de levantamento", "Detalhamos requisitos, especificações e escopo. É onde as ideias viram uma lista concreta do que será feito."],
  ["Proposta com os valores reais", "Só depois desse levantamento é que prazo e valor definitivos são fechados, por escrito. Qualquer número citado antes disso é estimativa."],
];

export default async function Enviado({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;

  return (
    <>
      <Cabecalho />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-[clamp(24px,5vw,96px)] pt-[clamp(140px,20vh,220px)] pb-[clamp(96px,16vh,180px)]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
        <div className="flex items-center gap-4"><span className="w-10 h-10 border border-ok text-ok grid place-items-center text-xl">✓</span><span className="olho text-ok">Briefing recebido</span></div>
        <h1 className="mt-8 text-[clamp(3rem,8vw,7.5rem)] font-bold leading-[.92] tracking-[-.045em]">Recebido.</h1>
        </div>
        {codigo && (
          <div><span className="olho">Protocolo</span><p className="mt-3 inline-block font-mono text-[clamp(1.4rem,2.6vw,2.2rem)] text-tinta border border-linha px-5 py-4">
              {codigo}
            </p><p className="mt-4 text-[14.5px] text-suave leading-[1.7] max-w-[34ch]">Guarde este número. É por ele que a gente localiza o seu briefing.</p></div>
        )}
        </div>
        <p className="mt-16 text-[17px] text-tinta2 leading-relaxed">A partir daqui o caminho é este:</p>

        <ol className="mt-8 grid gap-0 sm:grid-cols-2">
          {PASSOS.map(([t, d], i) => (
            <li key={t} className="relative grid grid-cols-[72px_1fr] gap-4 border-t border-linha py-8">
              <span className="font-mono text-[clamp(2rem,3.4vw,3.2rem)] leading-[.9] text-linha2">
                {i + 1}
              </span>
              <span><b className="font-semibold text-tinta">{t}</b><span className="block mt-3 text-[15px] text-tinta2 leading-[1.7]">{d}</span></span>
            </li>
          ))}
        </ol>

        <div className="mt-12 border border-linha p-8 max-w-2xl">
          <h2 className="text-lg font-bold">E depois que o projeto começar?</h2>
          <p className="mt-2 text-[15px] text-tinta2 leading-relaxed">
            Você recebe um convite por e-mail para a área do cliente, onde acompanha as
            atualizações do projeto e fala com a gente pelo chat, sem precisar caçar mensagem no WhatsApp.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn-s">Voltar ao início</Link>
          <Link href="/projetos" className="btn-s">Ver outros projetos</Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
