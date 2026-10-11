import Head from "next/head";
import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuExternalLink, LuHandshake } from "react-icons/lu";
import { Reveal } from "../components/effects/Reveal";
import { ButtonLink } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Chip, EmptyState, Loading } from "../components/ui/Feedback";
import { TacticalCard } from "../components/ui/TacticalCard";
import { Eyebrow, PageHeader } from "../components/ui/Typography";
import { DISCORD_INVITE_URL } from "../lib/config";
import { supabase } from "../lib/supabase";

/** Niveaux de partenariat, du plus élevé au plus modeste. */
const TIERS = [
  { key: "platinum", label: "Platine" },
  { key: "gold", label: "Or" },
  { key: "silver", label: "Argent" },
  { key: "community", label: "Communauté" },
];

const safeHttpsUrl = (url) => (url && /^https:\/\//i.test(url) ? url : null);

/** Partenaires et sponsors. Le contenu se gère dans Supabase : Table Editor > partners. */
export default function PartnersPage() {
  const [partners, setPartners] = useState(null);

  useEffect(() => {
    supabase
      .from("partners")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setPartners(data || []));
  }, []);

  return (
    <>
      <Head>
        <title>Partenaires — SixSence</title>
      </Head>
      <PageHeader
        eyebrow="Sponsors"
        title={
          <>
            Nos <span className="text-gold-gradient">partenaires</span>
          </>
        }
        description="Ils soutiennent la plateforme et rendent possibles les tournois, les lots et les événements."
      />

      <Container className="space-y-16 py-12">
        {partners === null ? (
          <Loading />
        ) : partners.length === 0 ? (
          <EmptyState title="Bientôt nos premiers partenaires">Cet espace attend ses premiers soutiens.</EmptyState>
        ) : (
          TIERS.map((tier) => {
            const members = partners.filter((partner) => partner.tier === tier.key);
            if (members.length === 0) return null;
            return (
              <section key={tier.key} aria-labelledby={`palier-${tier.key}`}>
                <Eyebrow>Partenaires</Eyebrow>
                <h2 id={`palier-${tier.key}`} className="mt-3 font-display text-4xl font-black uppercase leading-none">
                  Niveau {tier.label}
                </h2>
                <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {members.map((partner, index) => (
                    <li key={partner.id}>
                      <Reveal delay={(index % 3) * 0.08} className="h-full">
                        <PartnerCard partner={partner} tierLabel={tier.label} featured={tier.key === "platinum" || tier.key === "gold"} />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}

        {/* --- Appel aux futurs partenaires --------------------------------- */}
        <TacticalCard highlight cut={28} innerClassName="holo overflow-hidden p-7 sm:p-12">
          <div aria-hidden className="absolute -right-10 top-0 h-full w-40 -skew-x-[24deg] bg-linear-to-b from-gold/14 to-transparent" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <LuHandshake aria-hidden className="h-10 w-10 text-gold" />
              <h2 className="mt-5 font-display text-5xl font-black uppercase leading-[0.9]">
                Devenir <span className="text-gold-gradient">partenaire</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                Marque, structure e-sport, créateur de contenu : associe ton nom à une communauté active et à ses événements.
                {DISCORD_INVITE_URL ? " Contacte les fondateurs sur Discord pour en parler." : " Contacte les fondateurs pour en parler."}
              </p>
            </div>
            {DISCORD_INVITE_URL ? (
              <ButtonLink href={DISCORD_INVITE_URL} external size="lg">
                <FaDiscord aria-hidden className="h-5 w-5" />
                Nous contacter
              </ButtonLink>
            ) : (
              <ButtonLink href="/founders" variant="outline" size="lg">
                Voir les fondateurs
              </ButtonLink>
            )}
          </div>
        </TacticalCard>
      </Container>
    </>
  );
}

function PartnerCard({ partner, tierLabel, featured }) {
  const website = safeHttpsUrl(partner.website_url);
  const logo = safeHttpsUrl(partner.logo_url);

  return (
    <TacticalCard interactive={Boolean(website)} highlight={featured} className="h-full" innerClassName="flex h-full flex-col p-7">
      <div className="flex h-20 items-center">
        {logo ? (
          <img src={logo} alt="" loading="lazy" referrerPolicy="no-referrer" className="max-h-16 max-w-[70%] object-contain" />
        ) : (
          <span aria-hidden className="font-display text-5xl font-black uppercase leading-none text-outline">
            {partner.name.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <h3 className="font-display text-3xl font-black uppercase leading-none">{partner.name}</h3>
        <Chip tone={featured ? "gold" : "neutral"}>{tierLabel}</Chip>
      </div>
      {partner.description ? <p className="mt-3 text-sm leading-relaxed text-white/60">{partner.description}</p> : null}
      {website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-2 pt-7 font-display text-base font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light"
        >
          Visiter le site
          <LuExternalLink aria-hidden className="h-4 w-4" />
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      ) : null}
    </TacticalCard>
  );
}
