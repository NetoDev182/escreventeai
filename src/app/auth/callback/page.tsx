import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100">
          <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 pb-24 pt-20 text-center">
            <h1 className="text-2xl font-semibold">Cartório AI</h1>
            <p className="text-sm text-slate-400">Carregando...</p>
          </div>
        </main>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}
