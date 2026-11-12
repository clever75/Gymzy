import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { getVisibleNav } from "@/lib/navigation";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { role, activeModules } = await getSession();
  const items = getVisibleNav(role, activeModules);

  // flex-1 : le <body> du layout racine est déjà un flex en colonne.
  // min-w-0 : laisse le tableau défiler horizontalement sans élargir la page.
  return (
    <div className="flex flex-1">
      <Sidebar items={items} />
      <main className="min-w-0 flex-1 p-6 xl:p-8">{children}</main>
    </div>
  );
}