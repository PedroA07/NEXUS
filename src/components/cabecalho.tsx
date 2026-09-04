import { CabecalhoBarra } from "./cabecalho-barra";
import { perfilAtual, ehEquipe } from "@/lib/supabase/servidor";

export async function Cabecalho({ sobreposto = false }: { sobreposto?: boolean }) {
  const perfil = await perfilAtual();
  const equipe = ehEquipe(perfil);

  return (
    <CabecalhoBarra
      sobreposto={sobreposto}
      autenticado={Boolean(perfil)}
      destino={equipe ? "/painel" : "/portal"}
      rotulo={perfil ? (equipe ? "Painel" : "Meus projetos") : "Entrar"}
    />
  );
}
