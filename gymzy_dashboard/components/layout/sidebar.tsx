import type { NavItem } from "@/lib/navigation";
import { SidebarLink } from "./sidebar-link";

type SidebarProps = {
  items: NavItem[];
  organizationName: string;
};

// Fixe à toute largeur : rail d'icônes (768-1279 px), complet dès 1280 px (xl).
export function Sidebar({ items, organizationName }: SidebarProps) {
  // Pastille : initiale de la salle. Le logo viendra quand l'API et
  // l'hébergement des images existeront.
  const initial = organizationName.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="sticky top-0 flex h-screen w-[4.5rem] shrink-0 flex-col gap-8 self-start border-r border-border bg-surface px-3 py-6 xl:w-64 xl:px-4">
      <div className="flex items-center gap-3 px-1">
        <div
          aria-hidden
          className="flex size-10 shrink-0 -rotate-3 items-center justify-center rounded-2xl bg-primary font-display text-xl font-extrabold text-on-primary"
        >
          {initial}
        </div>
        {/* Nom lu par les lecteurs d'écran à toute largeur,
            affiché (et tronqué si trop long) dès 1280 px. */}
        <span className="sr-only">{organizationName}</span>
        <span
          aria-hidden
          className="hidden min-w-0 truncate font-display text-xl font-extrabold xl:block"
        >
          {organizationName}
        </span>
      </div>

      <nav aria-label="Navigation principale" className="flex flex-col gap-1">
        {items.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>
    </aside>
  );
}