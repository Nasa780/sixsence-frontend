import { useEffect, useState } from "react";
import PageShell from "../components/site/PageShell";
import { Loading, PageTitle, SectionTitle } from "../components/site/ui";
import { supabase } from "../lib/supabase";

/**
 * Partenaires et sponsors. Contenu géré dans Supabase (Table Editor > partners) :
 * nom, niveau (platinum / gold / silver / community), description, logo, site web.
 */
const TIERS = [
  { key: "platinum", label: "Partenaires Platine", color: "#e5e4e2" },
  { key: "gold", label: "Partenaires Or", color: "#c9a227" },
  { key: "silver", label: "Partenaires Argent", color: "#94a3b8" },
  { key: "community", label: "Communauté", color: "#4a90d9" },
];

export default function Partners() {
  const [partners, setPartners] = useState(null);

  useEffect(() => {
    supabase
      .from("partners")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setPartners(data || []));
  }, []);

  return (
    <PageShell active="partners" title="Partenaires">
      <div className="flex flex-col gap-8">
        <PageTitle title="Partenaires & sponsors" subtitle="Ils soutiennent SixSence et la scène compétitive." />

        {partners === null && <Loading />}
        {partners?.length === 0 && (
          <div className="py-10 text-center text-sm text-[#5b7fa8] font-[Inter]">
            Aucun partenaire pour l'instant. Tu veux soutenir SixSence ? Contacte-nous sur Discord.
          </div>
        )}

        {TIERS.map((tier) => {
          const list = partners?.filter((partner) => partner.tier === tier.key) || [];
          if (list.length === 0) return null;
          return (
            <section key={tier.key} className="flex flex-col gap-4">
              <SectionTitle>
                <span style={{ color: tier.color }}>{tier.label}</span>
              </SectionTitle>
              <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
                {list.map((partner) => {
                  const href = partner.website_url && /^https:\/\//.test(partner.website_url) ? partner.website_url : null;
                  const Tag = href ? "a" : "div";
                  return (
                    <Tag
                      key={partner.id}
                      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="no-underline rounded-[10px] bg-[rgba(10,22,40,0.6)] border border-solid p-5 flex flex-col gap-3 hover:brightness-110"
                      style={{ borderColor: `${tier.color}33` }}
                    >
                      <div className="h-16 flex items-center">
                        {partner.logo_url ? (
                          <img src={partner.logo_url} alt={partner.name} className="max-h-16 max-w-[180px] object-contain" />
                        ) : (
                          <b className="text-2xl font-[Rajdhani] text-white tracking-[1px]">{partner.name}</b>
                        )}
                      </div>
                      <b className="text-lg text-[#e8f0fa] font-[Rajdhani]">{partner.name}</b>
                      {partner.description && (
                        <p className="m-0 text-sm text-[#6b7d94] font-[Inter] leading-[21px]">{partner.description}</p>
                      )}
                      {href && <span className="text-xs text-[#4a90d9] font-[Inter]">Visiter le site →</span>}
                    </Tag>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
