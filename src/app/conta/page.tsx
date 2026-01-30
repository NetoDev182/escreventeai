"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ContaPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data, error: userError }) => {
      if (!isMounted) return;
      if (userError) {
        setError("Não foi possível carregar seus dados.");
      }
      if (data.user) {
        setEmail(data.user.email ?? "");
        setFullName((data.user.user_metadata?.full_name as string) ?? "");
      }
      setLoadingProfile(false);
    });

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function handleProfileUpdate(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Dados atualizados com sucesso.");
  }

  async function handlePasswordUpdate(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoadingPassword(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoadingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMessage("Senha atualizada com sucesso.");
    setLoadingPassword(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-24 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
              Minha conta
            </p>
            <h1 className="text-2xl font-semibold">Dados e segurança</h1>
            <p className="text-sm text-slate-400">
              Atualize suas informações pessoais e senha.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/chat"
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Voltar ao chat
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
            >
              Sair
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Informações pessoais</h2>
            <form onSubmit={handleProfileUpdate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/60 focus:outline-none"
                  placeholder="Digite seu nome"
                />
              </div>
              <button
                type="submit"
                disabled={loadingProfile}
                className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingProfile ? "Carregando..." : "Salvar dados"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Atualizar senha</h2>
            <form onSubmit={handlePasswordUpdate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/60 focus:outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/60 focus:outline-none"
                  placeholder="Repita a nova senha"
                />
              </div>
              <button
                type="submit"
                disabled={loadingPassword}
                className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPassword ? "Atualizando..." : "Atualizar senha"}
              </button>
            </form>
          </div>
        </section>

        {(error || message) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {error || message}
          </div>
        )}
      </div>
    </main>
  );
}
