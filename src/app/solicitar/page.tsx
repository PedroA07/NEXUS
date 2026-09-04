import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { FormularioBriefing } from "@/components/formulario-briefing";

export const metadata = { title: "Solicitar orçamento" };

export default function Solicitar() {
  return (
    <>
      <Cabecalho />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-[clamp(24px,5vw,96px)] pt-[clamp(140px,20vh,200px)] pb-[clamp(96px,16vh,180px)]">
        <p className="olho">Solicitar orçamento</p>
        <h1 className="mt-6 text-[clamp(2.4rem,6.4vw,6rem)] font-bold leading-[.94] tracking-[-.04em] max-w-[20ch] text-balance">
          Conte pra gente o que você quer construir
        </h1>
        <div className="mt-8 flex flex-wrap gap-8 lg:gap-16">
        <p className="m-0 text-[clamp(1rem,1.25vw,1.15rem)] text-tinta2 leading-[1.7] max-w-[46ch]">
          Antes de passar um orçamento, precisamos entender bem o seu projeto. Este formulário
          faz as perguntas certas para você, <b className="text-tinta font-semibold">sem termo técnico</b>,
          e com explicação em cada item.
        </p>
        <div className="border-l-2 border-ember pl-5 max-w-[40ch] text-[15px] text-tinta2 leading-[1.7]">
          <b className="block text-ember font-mono text-[11px] tracking-[.2em] uppercase">Não precisa entender de tecnologia</b> <span className="block mt-3">Onde a pergunta for
          técnica existe sempre a opção “não sei”. Marcar essa opção não atrapalha em nada, só
          nos avisa que precisamos te explicar aquele ponto com calma.</span>
        </div>
        </div>
        <FormularioBriefing />
      </main>
      <Rodape />
    </>
  );
}
