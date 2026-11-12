"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconName } from "@/lib/navigation";
import { navIcons } from "./nav-icons";

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: IconName;
};

export function SidebarLink({ href, label, icon }: SidebarLinkProps) {
  const pathname = usePathname();
  // "/" n'est actif que sur "/" exactement.
  // Les autres le sont aussi sur leurs sous-pages (ex. /membres/12).
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  const Icon = navIcons[icon];

  return (
    <Link
      href={href}
      title={label}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center justify-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold xl:justify-start",
        "transition-colors duration-150 motion-reduce:transition-none",
        isActive
          ? "bg-primary text-on-primary"
          : "text-foreground-muted hover:bg-surface-raised hover:text-foreground",
      ].join(" ")}
    >
      <Icon aria-hidden className="size-5 shrink-0" />
      <span className="sr-only xl:not-sr-only">{label}</span>
    </Link>
  );
}