import type { NavItem } from "@/lib/navigation";
import { SidebarLink } from "./sidebar-link";

// Fixe à toute largeur : rail d'icônes (768-1279 px), complet dès 1280 px (xl).
export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[4.5rem] shrink-0 flex-col gap-8 self-start border-r border-border bg-surface px-3 py-6 xl:w-64 xl:px-4">
      <div className="flex items-center gap-3 px-1">
        <div className="flex size-10 shrink-0 -rotate-3 items-center justify-center rounded-2xl bg-primary font-display text-xl font-extrabold text-on-primary">
          G
        </div>
        <span className="hidden font-display text-xl font-extrabold xl:inline">
          Gymzy
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