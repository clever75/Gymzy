import { ChipLink } from "@/components/ui/chip-link";
import {
  MEMBER_TABS,
  buildMemberTabHref,
  memberTabLabels,
  type MemberTab,
} from "@/lib/member-detail";

// Les six onglets de la fiche (maquette WEB-03). Chaque onglet est un lien : l'onglet
// actif vit dans l'adresse (« ?onglet=famille »), on peut partager le lien et revenir en arrière.
export function MemberTabs({ memberId, active }: { memberId: string; active: MemberTab }) {
  return (
    <nav aria-label="Sections de la fiche" className="flex flex-wrap gap-2">
      {MEMBER_TABS.map((tab) => (
        <ChipLink key={tab} href={buildMemberTabHref(memberId, tab)} active={tab === active}>
          {memberTabLabels[tab]}
        </ChipLink>
      ))}
    </nav>
  );
}
