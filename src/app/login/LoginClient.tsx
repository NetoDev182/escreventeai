"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "reset";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "reset") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/auth/callback?next=/conta`,
          }
        );
        if (resetError) throw resetError;
        setMessage("Enviamos um link de recuperação para o seu e-mail.");
        return;
      }

      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage("Conta criada. Verifique o seu e-mail para confirmar.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const next = searchParams.get("next") || "/chat";
      router.push(next);
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-24 pt-16">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
              Acesso seguro
            </p>
            <h1 className="text-3xl font-semibold">Entrar no Cartório AI</h1>
            <p className="text-sm text-slate-400">
              Use seu e-mail corporativo para acessar o chat do escrevente.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-slate-300 transition hover:text-slate-100"
          >
            Voltar para o site
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <div className="flex flex-wrap gap-2 text-xs">
              {([
                { id: "login", label: "Entrar" },
                { id: "signup", label: "Criar conta" },
                { id: "reset", label: "Recuperar senha" },
              ] as const).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    mode === item.id
                      ? "bg-amber-300 text-slate-900"
                      : "border border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/60 focus:outline-none"
                  placeholder="nome@cartorio.com.br"
                />
              </div>

              {mode !== "reset" && (
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/60 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Aguarde..."
                  : mode === "reset"
                  ? "Enviar link"
                  : mode === "signup"
                  ? "Criar conta"
                  : "Entrar"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
            <h2 className="text-xl font-semibold">Segurança e controle</h2>
            <p className="mt-3 text-sm text-slate-300">
              A autenticação é feita via Supabase com sessão segura e trilhas de
              auditoria. Após o login, você pode atualizar dados e senha na área
              de conta.
            </p>
            <div className="mt-6 space-y-3 text-xs text-slate-400">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                Proteção de rotas para páginas sensíveis (chat e conta).
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                Tokens armazenados em cookies para validação no servidor.
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                Atualização segura de senha com confirmação por e-mail.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
