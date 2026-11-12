import Link from "next/link";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

// Accueil provisoire. Le lien vers /design reste utile pendant le développement :
// ce catalogue est hors du groupe (dashboard), donc sans menu.
export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PagePlaceholder href="/" />
      <Link href="/design" className="w-fit font-bold text-primary underline">
        Voir le catalogue des composants
      </Link>
    </div>
  );
}