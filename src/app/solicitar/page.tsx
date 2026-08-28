import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { FormularioBriefing } from "@/components/formulario-briefing";

export const metadata = { title: "Solicitar orçamento" };

export default function Solicitar() {
  return (
    <>
      <Cabecalho />
      <main className="max-w-3xl mx-auto px-5 pt-14 pb-10">
        <p className="olho">Solicitar orçamento</p>
        <h1 className="mt-3 text-[clamp(2rem,6vw,2.9rem)] font-bold leading-[1.06] text-balance">
          Conte pra gente o que você quer construir
        </h1>
        <p className="mt-4 text-[17px] text-tinta2 leading-relaxed">
          Antes de passar um orçamento, precisamos entender bem o seu projeto. Este formulário
          faz as perguntas certas para você — <b className="text-tinta font-semibold">sem termo técnico</b>,
          e com explicação em cada item.
        </p>
        <div className="mt-6 rounded-2xl bg-ambar-fundo border border-ambar-linha p-4 text-[15px] text-tinta2 leading-relaxed">
          <b className="text-ambar font-bold">Não precisa entender de tecnologia.</b> Onde a pergunta for
          técnica existe sempre a opção “não sei”. Marcar essa opção não atrapalha em nada — só
          nos avisa que precisamos te explicar aquele ponto com calma.
        </div>
        <FormularioBriefing />
      </main>
      <Rodape />
    </>
  );
}
