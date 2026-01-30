import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_N8N_URL = "http://localhost:5678/webhook-test/chat";
const N8N_URL = process.env.N8N_WEBHOOK_URL?.trim() || DEFAULT_N8N_URL;
const IS_PROD = process.env.NODE_ENV === "production";

function cleanText(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("={") && trimmed.endsWith("}")) {
    return trimmed.slice(1);
  }
  return trimmed;
}

function extractAnswer(raw: string, data: any) {
  if (data && typeof data === "object") {
    const fromObj =
      data.output ??
      data.answer ??
      data.text ??
      data?.data?.output ??
      data?.data?.answer ??
      "";
    if (fromObj) return cleanText(String(fromObj));
  }
  const cleaned = cleanText(raw || "");
  try {
    const parsed = cleaned ? JSON.parse(cleaned) : null;
    if (parsed && typeof parsed === "object") {
      const fromParsed =
        parsed.output ??
        parsed.answer ??
        parsed.text ??
        parsed?.data?.output ??
        parsed?.data?.answer ??
        "";
      if (fromParsed) return cleanText(String(fromParsed));
    }
  } catch {}
  return cleaned || "Sem resposta.";
}

function alternateWebhook(url: string) {
  if (url.includes("/webhook-test/")) {
    return url.replace("/webhook-test/", "/webhook/");
  }
  if (url.includes("/webhook/")) {
    return url.replace("/webhook/", "/webhook-test/");
  }
  return "";
}

function alternateHost(url: string, host: string) {
  try {
    const parsed = new URL(url);
    parsed.hostname = host;
    return parsed.toString();
  } catch {
    return "";
  }
}

function buildCandidateUrls(baseUrl: string) {
  const urls: string[] = [];
  const trimmed = baseUrl.trim();
  if (trimmed) urls.push(trimmed);

  if (trimmed.includes("localhost")) {
    urls.push(alternateHost(trimmed, "127.0.0.1"));
  } else if (trimmed.includes("127.0.0.1")) {
    urls.push(alternateHost(trimmed, "localhost"));
  }

  return Array.from(new Set(urls.filter(Boolean)));
}

async function callN8N(url: string, payload: any) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await r.text();
  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  const answer = extractAnswer(raw, data);

  return { ok: r.ok, status: r.status, raw, answer };
}

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const cookieStore = await cookies();
      const supabase = createServerClient(url, key, {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      });
      let user = (await supabase.auth.getUser()).data.user ?? null;

      if (!user) {
        const authHeader = req.headers.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.slice("Bearer ".length);
          const supabaseToken = createClient(url, key, {
            auth: { persistSession: false },
          });
          const { data } = await supabaseToken.auth.getUser(token);
          user = data.user ?? null;
        }
      }

      if (!user) {
        return NextResponse.json(
          { answer: "Sessão inválida. Faça login novamente." },
          { status: 401 }
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const payload = {
      sessionId: body?.sessionId ?? "",
      message: body?.message ?? "",
      meta: {
        canal: "web",
        produto: "cartorioAI",
        ...(body?.meta ?? {}),
      },
    };

    const candidates = buildCandidateUrls(N8N_URL);
    let lastError: any = null;
    let lastResult:
      | { ok: boolean; status: number; raw: string; answer: string }
      | null = null;

    for (const candidate of candidates) {
      try {
        let result = await callN8N(candidate, payload);

        if (!result.ok && result.status === 404) {
          const fallback = alternateWebhook(candidate);
          if (fallback) {
            result = await callN8N(fallback, payload);
          }
        }

        if (result.ok) {
          return NextResponse.json({ answer: result.answer });
        }

        lastResult = result;
      } catch (err) {
        lastError = err;
      }
    }

    const detail = IS_PROD
      ? ""
      : ` | URL: ${N8N_URL} | Status: ${
          lastResult?.status ?? "sem status"
        } | Resposta: ${lastResult?.raw?.slice(0, 300) || "(vazia)"} | Erro: ${
          lastError?.message ?? "desconhecido"
        }`;

    return NextResponse.json(
      {
        answer:
          lastResult?.answer ||
          `Erro ao consultar o n8n. (${lastResult?.status ?? "sem status"})${
            IS_PROD ? "" : detail
          }`,
      },
      { status: 502 }
    );
  } catch (err: any) {
    const detail = IS_PROD
      ? ""
      : ` | URL: ${N8N_URL} | Erro: ${err?.message ?? "desconhecido"}`;
    const message =
      "Erro interno no backend ao chamar o n8n. Verifique o N8N_WEBHOOK_URL e se o workflow está ativo." +
      detail;
    return NextResponse.json({ answer: message }, { status: 500 });
  }
}
