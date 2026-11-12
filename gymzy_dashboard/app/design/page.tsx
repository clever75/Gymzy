import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatFcfa } from "@/lib/format";
import {
  paymentMethodLabels,
  paymentStatusLabels,
  paymentTypeLabels,
} from "@/lib/labels";
import { mockPayments } from "@/lib/mock/payments";
import { PAGE_SIZE, paginate, parsePageParam } from "@/lib/paginate";

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-4">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}

// Dans Next.js 16, searchParams est une Promesse : on l'attend avec await,
// donc la fonction de la page est « async ».
export default async function DesignPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page: pageParam } = await searchParams;
  const payments = paginate(mockPayments, parsePageParam(pageParam), PAGE_SIZE);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">Gymzy · catalogue des composants</h1>
        <p className="text-foreground-muted">
          Page de référence du socle UI : couleurs, boutons, badges, cartes,
          champs, formats d&apos;affichage, tableau et pagination.
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
            Musculation · Mensuel · {formatFcfa(12000)}
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

      <Section title="Formats (montants et dates)">
        <Card>
          <ul className="flex flex-col gap-2 text-sm">
            <li>formatFcfa(12000) → {formatFcfa(12000)}</li>
            <li>formatFcfa(1245000) → {formatFcfa(1245000)}</li>
            <li>formatFcfa(0) → {formatFcfa(0)}</li>
            <li>formatFcfa(15000.6) → {formatFcfa(15000.6)}</li>
            <li>formatFcfa(NaN) → {formatFcfa(NaN)}</li>
            <li>formatDate(&quot;2026-10-28&quot;) → {formatDate("2026-10-28")}</li>
            <li>formatDate(&quot;2026-09-28&quot;) → {formatDate("2026-09-28")}</li>
            <li>formatDate(&quot;n&apos;importe quoi&quot;) → {formatDate("n'importe quoi")}</li>
          </ul>
        </Card>
      </Section>

      <Section id="paiements" title="Tableau paginé (paiements factices)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Membre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Méthode</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.items.length === 0 ? (
              <TableEmpty colSpan={6}>Aucun paiement</TableEmpty>
            ) : (
              payments.items.map((payment) => {
                const status = paymentStatusLabels[payment.status];
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.memberName}
                    </TableCell>
                    <TableCell>{paymentTypeLabels[payment.type]}</TableCell>
                    <TableCell>{paymentMethodLabels[payment.method]}</TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {formatFcfa(payment.amountFinal)}
                      {payment.discount > 0 && (
                        <span className="block text-xs text-foreground-muted">
                          réduction {formatFcfa(payment.discount)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <Pagination
          page={payments.page}
          totalPages={payments.totalPages}
          totalItems={payments.totalItems}
          pageSize={payments.pageSize}
          buildHref={(n) => `/design?page=${n}#paiements`}
        />
      </Section>

      <Section title="Pagination : cas à 12 pages (aperçu des « … »)">
        <Card>
          <Pagination
            page={6}
            totalPages={12}
            totalItems={300}
            pageSize={25}
            buildHref={() => "#"}
          />
        </Card>
      </Section>
    </main>
  );
}