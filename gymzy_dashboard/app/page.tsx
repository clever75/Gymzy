export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-border bg-surface p-8">
        <h1 className="text-3xl">Gymzy · Dashboard</h1>
        <p className="text-foreground/70">
          Page provisoire : elle sert à vérifier que les tokens fonctionnent.
        </p>
        <div className="rounded-2xl bg-info-surface p-4 text-sm">
          Bandeau d&apos;information
        </div>
        <p className="font-semibold text-success">Accès autorisé</p>
        <button
          type="button"
          className="rounded-full bg-primary px-6 py-3 font-semibold text-on-primary"
        >
          Renouveler
        </button>
      </div>
    </main>
  );
}