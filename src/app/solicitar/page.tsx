import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { FormularioBriefingWizard } from "@/components/formulario-briefing-wizard";

export const metadata = { title: "Solicitar orçamento" };

export default function Solicitar() {
  return (
    <>
      <Cabecalho />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-[clamp(24px,5vw,96px)] pt-[clamp(140px,20vh,200px)] pb-[clamp(96px,16vh,180px)]">
        <p className="olho-suave">Solicitar orçamento</p>
        <h1 className="mt-[clamp(20px,3vh,36px)] text-[clamp(2.1rem,5.6vw,4.6rem)] font-bold leading-[.98] tracking-[-.04em] max-w-[18ch] text-balance">
          Vamos começar pela sua ideia.
        </h1>
        <p className="mt-[clamp(20px,3vh,32px)] text-[clamp(1rem,1.3vw,1.2rem)] text-leitura leading-[1.65] max-w-[54ch]">
          Antes de falar de tecnologia, queremos entender o que você quer construir.{" "}
          <strong className="text-tinta font-semibold">Você não precisa saber explicar tudo</strong> — responda
          do seu jeito e, quando algo exigir uma decisão técnica, a gente ajuda.
        </p>
        <FormularioBriefingWizard />
      </main>
      <Rodape />
    </>
  );
}
