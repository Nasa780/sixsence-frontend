import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuCrosshair, LuTrophy, LuUser } from "react-icons/lu";
import { LeaderboardView } from "../../components/cod/LeaderboardView";
import { OnboardingPanel } from "../../components/cod/OnboardingPanel";
import { RankRoad } from "../../components/cod/RankRoad";
import { Reveal } from "../../components/effects/Reveal";
import { ButtonLink } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { Notice } from "../../components/ui/Feedback";
import { TacticalCard } from "../../components/ui/TacticalCard";
import { PageHeader, SectionHeading } from "../../components/ui/Typography";
import useSeasons from "../../hooks/useSeasons";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { supabase } from "../../lib/supabase";

const SECTIONS = [
  { href: "/cod/ranked", icon: LuCrosshair, title: "File classée", text: "Lance une recherche en 2v2, 3v3, 4v4 ou 5v5, seul ou avec ton groupe. Le match démarre dès que les équipes sont complètes." },
  { href: "/cod/leaderboard", icon: LuTrophy, title: "Classement", text: "Les meilleurs joueurs de la saison, mis à jour en direct après chaque match." },
  { href: "/cod/profile", icon: LuUser, title: "Mon profil", text: "Tes statistiques, ton rang, tes distinctions et ton historique de matchs." },
];


/** Hub COD : résumé du joueur connecté, accès aux trois sections, top 10. Public. */
export default function CodHubPage() {
  const { session } = useSession();
  const user = useUser();
  const profile = user?.profile;
  const { label: seasonLabel } = useSeasons();
  const [extra, setExtra] = useState({ position: null, activeMatchId: null });

  useEffect(() => {
    if (!user?.id || !profile) return;
    (async () => {
      const [{ data: active }, positionResult] = await Promise.all([
        supabase.rpc("cod_active_match_id", { p_user: user.id }),
        profile.wins + profile.losses > 0
          ? supabase.from("cod_leaderboard").select("user_id", { count: "exact", head: true }).gt("points", profile.points)
          : Promise.resolve({ count: null }),
      ]);
      setExtra({ activeMatchId: active || null, position: positionResult.count === null ? null : positionResult.count + 1 });
    })();
  }, [user?.id, profile]);


  return (
    <>
      <Head>
        <title>Call of Duty — SixSence</title>
      </Head>
      <PageHeader

        image="/images/mw4.webp"
        eyebrow="Call of Duty"
        title={
          <>
            Zone de <span className="text-gold-gradient">combat</span>
          </>
        }
        description={
          user ? `Content de te revoir, ${user.username}. La file classée est ouverte.` : "Classé du 2v2 au 5v5 en Recherche & Destruction Hardcore : les files sont ouvertes."
        }
        actions={
          <ButtonLink href="/cod/ranked" size="lg">
            <LuCrosshair aria-hidden className="h-5 w-5" />
            Jouer en classé
          </ButtonLink>
        }
      />

      <Container className="space-y-16 py-12">
        {session && extra.activeMatchId ? (
          <Notice>
            Tu as un match en cours.{" "}
            <Link href={`/cod/match/${extra.activeMatchId}`} className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              Ouvrir le salon de match
            </Link>
          </Notice>
        ) : null}

        {/* Mise en route d'un nouveau joueur (identifiant Activision, notifications, Discord, premier match). */}
        <OnboardingPanel user={user} />

        {/* Progression du joueur connecté jusqu'à Légende. */}
        {profile ? (
          <TacticalCard cut={22} innerClassName="p-5 sm:p-7">
            <p className="mb-4 font-display text-2xl font-black uppercase leading-none">Road to Légende</p>
            <RankRoad points={profile.points} />
          </TacticalCard>
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {SECTIONS.map((section, index) => (
            <Reveal key={section.href} delay={index * 0.08} className="h-full">
              <Link href={section.href} className="block h-full">
                <TacticalCard interactive className="h-full" innerClassName="flex h-full flex-col p-7">
                  <section.icon aria-hidden className="h-9 w-9 text-gold" />
                  <h2 className="mt-6 font-display text-4xl font-black uppercase leading-none">{section.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{section.text}</p>
                  <p className="mt-auto inline-flex items-center gap-2 pt-8 font-display text-base font-bold uppercase tracking-[0.14em] text-gold">
                    Ouvrir
                    <LuArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover/card:translate-x-1.5" />
                  </p>
                </TacticalCard>
              </Link>
            </Reveal>
          ))}
        </div>

        <section aria-labelledby="titre-top10">
          <SectionHeading eyebrow={seasonLabel} title={<span id="titre-top10">Top 10</span>} />
          <div className="mt-8">
            <LeaderboardView limit={10} currentUserId={user?.id ?? null} compact />
          </div>
        </section>
      </Container>
    </>
  );
}
