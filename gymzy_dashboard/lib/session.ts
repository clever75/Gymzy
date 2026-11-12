import type { ModuleKey, Role } from "./navigation";

export type Session = {
  role: Role;
  activeModules: ModuleKey[];
};

// TEMPORAIRE : session factice, avant la connexion (AUTH-05).
// Elle est async dès maintenant : quand on la branchera à l'API,
// les pages qui l'appellent n'auront pas à changer.
export async function getSession(): Promise<Session> {
  return {
    role: "ORG_ADMIN",
    activeModules: ["membershipCard", "media", "ticketing"],
  };
}