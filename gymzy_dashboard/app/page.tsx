export default function Home() {
  return (
    <main className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-extrabold">Content de te revoir</h1>
      <div className="rounded-2xl bg-surface border border-border p-6 max-w-sm">
        <p className="text-foreground">Carte (surface)</p>
      </div>
      <button className="rounded-full bg-primary text-on-primary font-semibold px-8 py-3 transition-transform duration-200 hover:scale-[1.02] active:scale-95">
        Renouveler
      </button>
    </main>
  );
}