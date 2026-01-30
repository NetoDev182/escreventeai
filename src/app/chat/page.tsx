"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o Cartório AI. Diga qual escritura você está analisando e eu aponto o que falta para ficar OK dentro das normas brasileiras.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserEmail(data.user.email ?? null);
      const stableId = data.user.id ?? "";
      if (stableId) {
        setSessionId(stableId);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      setUserEmail(session.user.email ?? null);
      if (session.user.id) {
        setSessionId(session.user.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  useEffect(() => {
    if (!sessionId) {
      const key = "cartorio_ai_session";
      const existing = localStorage.getItem(key);
      if (existing) {
        setSessionId(existing);
        return;
      }
      const next = crypto.randomUUID();
      localStorage.setItem(key, next);
      setSessionId(next);
    }
  }, [sessionId]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setError("");
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const r = await fetch("/api/chat", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          sessionId,
          message: text,
          meta: { canal: "web", produto: "cartorioAI" },
        }),
      });

      const raw = await r.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!r.ok) {
        throw new Error(
          data?.answer || raw || "Não foi possível consultar o n8n."
        );
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.answer ?? "Sem resposta." },
      ]);
    } catch (err: any) {
      const message = err?.message ??
        "Ops! Não consegui falar com o n8n agora. Tente novamente.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-24 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
              Chat do escrevente
            </p>
            <h1 className="text-2xl font-semibold">Cartório AI</h1>
            <p className="text-sm text-slate-400">
              {userEmail ? `Conectado como ${userEmail}` : "Sessão ativa"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/conta"
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Minha conta
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
            >
              Sair
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">
                Chat com análise normativa
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Pergunte sobre uma escritura e receba o checklist do que falta,
                com base legal brasileira.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Sessão: {sessionId || "..."} · CartórioAI — Beta
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Conectado ao workflow do n8n
            </div>
          </div>

          <div
            ref={listRef}
            className="mt-6 flex h-[60vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm"
          >
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`max-w-[80%] rounded-2xl px-4 py-2 leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-amber-300/20 text-slate-100"
                    : "bg-white/10 text-slate-100"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <span className="text-xs text-slate-400">Pensando…</span>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={4}
              placeholder="Digite sua pergunta (Shift+Enter para quebrar linha)"
              className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/60 focus:outline-none"
              disabled={loading}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span>
                Para /webhook-test funcionar, o n8n precisa estar em modo
                “Listen for test event”.
              </span>
              <button
                onClick={send}
                disabled={loading}
                className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enviar
              </button>
            </div>
            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
