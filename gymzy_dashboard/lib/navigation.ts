// Rôles du dashboard, calqués sur l'énum User.role du Schema2.
// "Admin" du cahier = ORG_ADMIN.
export type Role = "ORG_ADMIN" | "STAFF" | "COACH";

// Modules activables par la plateforme (cahier, ORG-05).
export type ModuleKey =
  | "gymTracking"
  | "family"
  | "membershipCard"
  | "media"
  | "ticketing"
  | "perSessionPayment";

// Nom d'icône (texte pur), pas le composant lui-même :
// ce fichier reste de la donnée simple, facile à tester.
// La correspondance nom -> composant Lucide se fera dans la barre latérale.
export type IconName =
  | "layout-grid"
  | "users"
  | "tag"
  | "wallet"
  | "credit-card"
  | "image"
  | "calendar-days"
  | "user-cog"
  | "settings";

export type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  roles: Role[];
  module?: ModuleKey; // si présent, l'entrée n'apparaît que si le module est actif
};

// Source unique du menu. Ajouter une page = ajouter une ligne ici.
// Rôles et modules d'après le cahier (§8.2, §9.2, ORG-05).
export const navItems: NavItem[] = [
  { label: "Tableau de bord", href: "/", icon: "layout-grid", roles: ["ORG_ADMIN", "STAFF"] },
  { label: "Membres", href: "/membres", icon: "users", roles: ["ORG_ADMIN", "STAFF"] },
  { label: "Activités et formules", href: "/activites", icon: "tag", roles: ["ORG_ADMIN"] },
  { label: "Paiements", href: "/paiements", icon: "wallet", roles: ["ORG_ADMIN", "STAFF"] },
  { label: "Cartes et accès", href: "/cartes", icon: "credit-card", roles: ["ORG_ADMIN", "STAFF"], module: "membershipCard" },
  { label: "Média", href: "/media", icon: "image", roles: ["ORG_ADMIN", "STAFF", "COACH"], module: "media" },
  { label: "Événements", href: "/evenements", icon: "calendar-days", roles: ["ORG_ADMIN"], module: "ticketing" },
  { label: "Équipe", href: "/equipe", icon: "user-cog", roles: ["ORG_ADMIN"] },
  { label: "Paramètres", href: "/parametres", icon: "settings", roles: ["ORG_ADMIN"] },
];

// Fonction pure : mêmes entrées, même résultat, aucun effet de bord.
// ATTENTION : masquer un lien n'est PAS une protection.
// Quelqu'un peut taper /equipe dans l'URL. La vraie protection est côté API
// (cahier : « le serveur filtre ce qu'un rôle ne doit pas voir »).
export function getVisibleNav(role: Role, activeModules: ModuleKey[]): NavItem[] {
  return navItems.filter(
    (item) =>
      item.roles.includes(role) &&
      (item.module === undefined || activeModules.includes(item.module)),
  );
}