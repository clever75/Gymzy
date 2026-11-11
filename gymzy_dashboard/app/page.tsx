import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-8">
      <h1 className="text-3xl">Gymzy · test des tokens</h1>

      <p className="text-foreground-muted">
        Page provisoire pour vérifier les couleurs, les polices et les statuts
        du tableau de bord.
      </p>

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <div className="flex flex-wrap gap-2">
  <Badge variant="success">Actif</Badge>
  <Badge variant="warning">En attente</Badge>
  <Badge variant="danger">Expiré</Badge>
  <Badge variant="info">Nouveau</Badge>
  <Badge>Brouillon</Badge>
</div>
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