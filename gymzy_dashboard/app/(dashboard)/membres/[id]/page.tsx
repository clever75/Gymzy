import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { memberStatusLabels } from "@/lib/labels";
import { formatMemberName } from "@/lib/member-display";
import { getDisplayStatus } from "@/lib/member-status";
import { getNow } from "@/lib/mock/clock";
import { mockMembers } from "@/lib/mock/members";

export const metadata: Metadata = { title: "Fiche membre · Gymzy" };

// Page provisoire : la fiche complète (WEB-03) viendra ensuite.
export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = mockMembers.find((m) => m.id === id);
  if (!member) notFound();

  const status = memberStatusLabels[getDisplayStatus(member, getNow())];

  return (
    <div className="flex flex-col gap-3">
      <Link href="/membres" className="w-fit text-sm font-bold text-primary underline">
        ← Retour aux membres
      </Link>
      <h1 className="text-2xl">{formatMemberName(member)}</h1>
      <Badge variant={status.tone} className="w-fit">
        {status.label}
      </Badge>
      <p className="text-foreground-muted">Fiche à construire.</p>
    </div>
  );
}
