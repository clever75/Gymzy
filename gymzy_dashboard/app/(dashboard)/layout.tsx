import type { CSSProperties, ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { getVisibleNav } from "@/lib/navigation";
import { getSession } from "@/lib/session";
import { resolveBrandTheme } from "@/lib/theme";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { role, activeModules, organization } = await getSession();
  const items = getVisibleNav(role, activeModules);
  const theme = resolveBrandTheme(organization.primaryColor);

  // Thème valide : on redéfinit les deux rôles de couleur pour ce conteneur.
  // Sinon, aucun style : la palette par défaut de globals.css s'applique.
  const brandStyle = theme
    ? ({
        "--primary": theme.primary,
        "--on-primary": theme.onPrimary,
      } as CSSProperties)
    : undefined;

  // flex-1 : le <body> du layout racine est déjà un flex en colonne.
  // min-w-0 : laisse le tableau défiler horizontalement sans élargir la page.
  return (
    <div data-brand className="flex flex-1" style={brandStyle}>
      <Sidebar items={items} organizationName={organization.name} />
      <main className="min-w-0 flex-1 p-6 xl:p-8">{children}</main>
    </div>
  );
}