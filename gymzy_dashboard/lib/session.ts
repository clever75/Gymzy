import type { ModuleKey, Role } from "./navigation";

// Identité de la salle (Schema2, table organizations) : ce que le dashboard affiche.
export type Organization = {
  name: string;
  logoUrl: string | null; // pas encore affiché : voir la remarque sur le logo
  primaryColor: string | null; // "#RRGGBB"
  secondaryColor: string | null; // pas encore utilisée
};

export type Session = {
  role: Role;
  activeModules: ModuleKey[];
  organization: Organization;
};

// TEMPORAIRE : session factice, avant la connexion (AUTH-05).
// Elle est async dès maintenant : quand on la branchera à l'API,
// les pages qui l'appellent n'auront pas à changer.
export async function getSession(): Promise<Session> {
  return {
    role: "ORG_ADMIN",
    activeModules: ["membershipCard", "media", "ticketing"],
    organization: {
      name: "Gymio Lomé",
      logoUrl: null,
      primaryColor: "#c8f542",
      secondaryColor: null,
    },
  };
}