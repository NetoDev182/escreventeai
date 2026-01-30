import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-24 pt-16">
            <h1 className="text-2xl font-semibold">Carregando...</h1>
          </div>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
