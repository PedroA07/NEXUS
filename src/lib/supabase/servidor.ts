import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function criarClienteServidor() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (lista: { name: string; value: string; options?: CookieOptions }[]) => {
          try {
            lista.forEach(({ name, value, options }) => jar.set(name, value, options));
          } catch {
            // chamado de um Server Component: o middleware já renova a sessão
          }
        },
      },
    },
  );
}

/** Perfil do usuário logado, ou null. */
export async function perfilAtual() {
  const sb = await criarClienteServidor();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("perfis").select("*").eq("id", user.id).single();
  return data as {
    id: string; nome: string | null; email: string | null;
    telefone: string | null; empresa: string | null;
    papel: "admin" | "funcionario" | "cliente"; ve_valores: boolean;
  } | null;
}

export function ehEquipe(perfil: { papel: string } | null | undefined) {
  return perfil?.papel === "admin" || perfil?.papel === "funcionario";
}
