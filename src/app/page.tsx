import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:pt-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center rounded-full border border-amber-400/40 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-200">
              Beta privado
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-slate-50 sm:text-5xl">
              Cartório AI: o assistente do escrevente para conferir o que falta
              em cada escritura.
            </h1>
            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              Um copiloto inteligente que cruza as informações da escritura com
              as normas brasileiras e aponta pendências, documentos e próximos
              passos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
              >
                Acessar login
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-slate-800 px-3 py-1">
                Conformidade normativa
              </span>
              <span className="rounded-full border border-slate-800 px-3 py-1">
                Checklist por tipo de ato
              </span>
              <span className="rounded-full border border-slate-800 px-3 py-1">
                Apoio ao escrevente
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-6 shadow-2xl">
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-amber-200">
                O que é
              </div>
              <h2 className="text-xl font-semibold">
                Um beta focado em validação e padronização do processo.
              </h2>
              <p className="text-sm text-slate-300">
                Esta versão está em fase beta para testar fluxos, ajustar
                respostas e garantir aderência às exigências legais.
              </p>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
                <div className="mb-2 text-amber-200">O que esperar no beta</div>
                <ul className="space-y-2">
                  <li>• Sugestões automáticas de pendências.</li>
                  <li>• Referências normativas para cada item.</li>
                  <li>• Evolução contínua com feedback da equipe.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          <header className="space-y-2">
            <h2 className="text-2xl font-semibold">Como funciona</h2>
            <p className="text-sm text-slate-400">
              Em poucos minutos o escrevente já tem clareza do que falta.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "1. Informe a escritura",
                desc: "Envie o resumo ou documentos principais no chat.",
              },
              {
                title: "2. Análise normativa",
                desc: "O Cartório AI cruza dados com normas e leis vigentes.",
              },
              {
                title: "3. Checklist final",
                desc: "Receba o que falta e os próximos passos sugeridos.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-2xl font-semibold">Por que beta?</h2>
            <p className="mt-2 text-sm text-slate-400">
              Estamos refinando o produto com escreventes reais para garantir
              precisão jurídica, linguagem adequada e usabilidade.
            </p>
            <div className="mt-6 space-y-3 text-xs text-slate-400">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                Resultados podem variar enquanto o motor é calibrado.
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                Feedbacks ajudam a priorizar melhorias.
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                Atualizações frequentes de regras e checklists.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-semibold">Acesso controlado</h2>
            <p className="mt-2 text-sm text-slate-300">
              O acesso é feito por login, com sessão segura e trilhas de
              auditoria. Ao entrar, você já tem acesso ao chat do escrevente.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
              >
                Entrar no beta
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
          <h2 className="text-2xl font-semibold">Segurança e LGPD</h2>
          <p className="mt-3 text-sm text-slate-300">
            O Cartório AI opera com trilhas de auditoria, controle de sessões e
            retenção mínima de dados. As informações permanecem no seu ambiente
            e seguem princípios de minimização e finalidade da LGPD.
          </p>
        </section>

        <footer className="flex items-center justify-between border-t border-slate-800 pt-6 text-xs text-slate-500">
          <span>Cartório AI — Beta</span>
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </div>
    </main>
  );
}
