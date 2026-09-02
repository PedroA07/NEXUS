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
      <main className="max-w-3xl mx-auto px-5 pt-16 pb-10">
        <div className="w-12 h-12 rounded-xl bg-ok-fundo border border-ok/25 text-ok grid place-items-center text-2xl">✓</div>
        <h1 className="mt-5 text-[clamp(1.9rem,5vw,2.6rem)] font-bold">Recebido!</h1>
        {codigo && (
          <p className="mt-3 text-[15px] text-suave">
            Protocolo{" "}
            <span className="font-mono font-semibold text-tinta bg-cartao2 border border-linha rounded-md px-2 py-0.5">
              {codigo}
            </span>. Guarde este número.
          </p>
        )}
        <p className="mt-4 text-[17px] text-tinta2 leading-relaxed">A partir daqui o caminho é este:</p>

        <ol className="mt-7 space-y-4">
          {PASSOS.map(([t, d], i) => (
            <li key={t} className="relative pl-11">
              <span className="absolute left-0 top-0.5 w-[26px] h-[26px] rounded-full bg-acento-fundo border border-acento-borda text-acento font-mono text-xs grid place-items-center">
                {i + 1}
              </span>
              <b className="font-semibold text-tinta">{t}.</b>{" "}
              <span className="text-[15px] text-tinta2 leading-relaxed">{d}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 cartao p-6">
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
