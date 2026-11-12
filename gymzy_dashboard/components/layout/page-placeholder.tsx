import { navItems } from "@/lib/navigation";

// Page provisoire : titre pris dans navItems, en attendant le vrai écran.
export function PagePlaceholder({ href }: { href: string }) {
  const label = navItems.find((item) => item.href === href)?.label ?? href;
  return (
    <div>
      <h1 className="text-2xl">{label}</h1>
      <p className="mt-2 text-foreground-muted">Écran à construire.</p>
    </div>
  );
}