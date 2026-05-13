import { createFileRoute } from "@tanstack/react-router";
import { CircleDot } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_app/cryptobubbles")({
  head: () => ({ meta: [{ title: "CryptoBubbles — OrionHub" }] }),
  component: CryptoBubblesPage,
});

function CryptoBubblesPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-5 pt-6">
        <PageHeader
          title="CryptoBubbles"
          description="Mapa de bolhas das principais criptomoedas em tempo real."
          icon={<CircleDot className="h-5 w-5" strokeWidth={1.75} />}
        />
      </div>
      <div className="mx-5 mb-5 flex-1 overflow-hidden rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <iframe
          src="https://cryptobubbles.net/"
          title="CryptoBubbles"
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
