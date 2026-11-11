import { Button } from "@/components/ui/button"
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-8">
      <h1 className="text-3xl">Gymzy · test des tokens</h1>

      <p className="text-foreground-muted">
        Page provisoire pour vérifier les couleurs, les polices et les statuts
        du tableau de bord.
      </p>

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-success-surface px-3 py-1 text-success">
          Actif
        </span>
        <span className="rounded-full bg-warning-surface px-3 py-1 text-warning">
          En attente
        </span>
        <span className="rounded-full bg-danger-surface px-3 py-1 text-danger">
          Expiré
        </span>
      </div>

      <div className="rounded-[18px] bg-info-surface px-3.5 py-3 text-[13.5px]">
        Bandeau d'information : 14 % de la couleur primaire mélangés à la
        surface.
      </div>

      <div className="flex flex-wrap items-center gap-3">
  <Button>Principal</Button>
  <Button variant="outline">Contour</Button>
  <Button variant="ghost">Discret</Button>
  <Button variant="danger">Supprimer</Button>
  <Button size="sm">Petit</Button>
  <Button size="lg">Grand</Button>
  <Button disabled>Désactivé</Button>
</div>
    </main>
  );
}