import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { FormularioBriefingWizard } from "@/components/formulario-briefing-wizard";

export const metadata = { title: "Solicitar orçamento" };

export default function Solicitar() {
  return (
    <>
      <Cabecalho />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-[clamp(24px,5vw,96px)] pt-[clamp(140px,20vh,200px)] pb-[clamp(96px,16vh,180px)]">
        <p className="olho">Solicitar orçamento</p>
        <h1 className="mt-6 text-[clamp(2.4rem,6.4vw,6rem)] font-bold leading-[.94] tracking-[-.04em] max-w-[20ch] text-balance">
          Vamos começar pela sua ideia.
        </h1>
        <div className="mt-8 flex flex-wrap gap-8 lg:gap-16">
        <p className="m-0 text-[clamp(1rem,1.25vw,1.15rem)] text-tinta2 leading-[1.7] max-w-[46ch]">
          Antes de falar de tecnologia, queremos entender o que você quer construir. <b className="text-tinta font-semibold">Você não precisa saber explicar tudo</b> — responda do seu jeito e, quando algo exigir uma decisão técnica, a gente ajuda.
        </p>
        <div className="border-l-2 border-ember pl-5 max-w-[40ch] text-[15px] text-tinta2 leading-[1.7]">
          <b className="block text-ember font-mono text-[11px] tracking-[.2em] uppercase">Responda do seu jeito</b> <span className="block mt-3">Quando aparecer uma decisão técnica, a gente explica com calma. Você pode salvar e retomar depois.</span>
        </div>
        </div>
        <FormularioBriefingWizard />
      </main>
      <Rodape />
    </>
  );
}
