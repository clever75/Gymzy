import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">Gymzy · catalogue des composants</h1>
        <p className="text-foreground-muted">
          Page de référence du socle UI : couleurs, boutons, badges, cartes et
          champs.
        </p>
      </header>

      <Section title="Couleurs (rôles)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["background", "bg-background"],
            ["surface", "bg-surface"],
            ["surface-raised", "bg-surface-raised"],
            ["primary", "bg-primary"],
            ["success", "bg-success"],
            ["warning", "bg-warning"],
            ["danger", "bg-danger"],
            ["info-surface", "bg-info-surface"],
          ].map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className={`h-12 rounded-xl border border-border ${cls}`} />
              <span className="text-xs text-foreground-muted">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Boutons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Principal</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Discret</Button>
          <Button variant="danger">Supprimer</Button>
          <Button size="sm">Petit</Button>
          <Button size="lg">Grand</Button>
          <Button disabled>Désactivé</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Actif</Badge>
          <Badge variant="warning">En attente</Badge>
          <Badge variant="danger">Expiré</Badge>
          <Badge variant="info">Nouveau</Badge>
          <Badge>Brouillon</Badge>
        </div>
      </Section>

      <Section title="Carte">
        <Card>
          <CardHeader>
            <CardTitle>Ama Kofi</CardTitle>
            <Badge variant="success">Actif</Badge>
          </CardHeader>
          <p className="text-foreground-muted">
            Musculation · Mensuel · 12 000 F
          </p>
          <div className="mt-4">
            <Button size="sm">Renouveler</Button>
          </div>
        </Card>
      </Section>

      <Section title="Champs">
        <Card>
          <div className="flex flex-col gap-4">
            <Field label="Prénom" placeholder="Ama" />
            <Field label="Téléphone" placeholder="+228 90 12 34 56" />
            <Field
              label="Email"
              error="Adresse email invalide"
              defaultValue="ama@"
            />
            <Field label="Champ désactivé" disabled defaultValue="Non modifiable" />
          </div>
        </Card>
      </Section>
    </main>
  );
}