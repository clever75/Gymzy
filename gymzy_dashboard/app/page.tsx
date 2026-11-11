import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-8">
      <h1 className="text-3xl">Gymzy · dashboard</h1>
      <p className="text-foreground-muted">
        Page provisoire. Le tableau de bord arrive.
      </p>
      <Link href="/design" className="w-fit font-bold text-primary underline">
        Voir le catalogue des composants
      </Link>
    </main>
  );
}