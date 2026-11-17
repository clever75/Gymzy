import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Inscrire un membre · Gymzy" };

// Page provisoire : l'écran d'inscription viendra plus tard.
export default function NewMemberPage() {
  return (
    <div className="flex flex-col gap-3">
      <Link href="/membres" className="w-fit text-sm font-bold text-primary underline">
        ← Retour aux membres
      </Link>
      <h1 className="text-2xl">Inscrire un membre</h1>
      <p className="text-foreground-muted">Écran à construire.</p>
    </div>
  );
}
