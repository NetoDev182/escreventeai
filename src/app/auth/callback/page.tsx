"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState("Validando sessão...");

  useEffect(() => {
    async function run() {
      const next = searchParams.get("next") || "/conta";
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("Não foi possível validar a sessão.");
          router.replace("/login");
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(next);
      } else {
        setStatus("Sessão inválida. Faça login novamente.");
        router.replace("/login");
      }
    }

    run();
  }, [router, searchParams, supabase]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 pb-24 pt-20 text-center">
        <h1 className="text-2xl font-semibold">Cartório AI</h1>
        <p className="text-sm text-slate-400">{status}</p>
      </div>
    </main>
  );
}
