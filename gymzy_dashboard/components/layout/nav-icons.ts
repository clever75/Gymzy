import {
  CalendarDays,
  CreditCard,
  Image as ImageIcon,
  LayoutGrid,
  Settings,
  Tag,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/navigation";

// Correspondance nom d'icône (texte) -> composant Lucide.
// Record<IconName, ...> oblige à couvrir tous les noms : oubli = erreur tsc.
export const navIcons: Record<IconName, LucideIcon> = {
  "layout-grid": LayoutGrid,
  users: Users,
  tag: Tag,
  wallet: Wallet,
  "credit-card": CreditCard,
  image: ImageIcon,
  "calendar-days": CalendarDays,
  "user-cog": UserCog,
  settings: Settings,
};