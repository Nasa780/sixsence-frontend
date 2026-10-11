import Head from "next/head";
import { useEffect, useState } from "react";
import { FaDiscord, FaSteam } from "react-icons/fa6";
import { Reveal } from "../components/effects/Reveal";
import { Avatar } from "../components/ui/Avatar";
import { Container } from "../components/ui/Container";
import { EmptyState, Loading } from "../components/ui/Feedback";
import { TacticalCard } from "../components/ui/TacticalCard";
import { PageHeader } from "../components/ui/Typography";
import { supabase } from "../lib/supabase";

/** Accepte uniquement un lien https vers un profil Steam. */
const safeSteamUrl = (url) => (url && /^https:\/\/steamcommunity\.com\//i.test(url) ? url : null);

/** Les fondateurs. Le contenu se gère dans Supabase : Table Editor > founders. */
export default function FoundersPage() {
  const [founders, setFounders] = useState(null);

  useEffect(() => {
    supabase
      .from("founders")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setFounders(data || []));
  }, []);

  return (
    <>
      <Head>
        <title>Fondateurs — SixSence</title>
      </Head>
      <PageHeader
        eyebrow="L'équipe"
        title={
          <>
            Les <span className="text-gold-gradient">fondateurs</span>
          </>
        }
        description="Celles et ceux qui ont imaginé SixSence, qui la font tourner et qui répondent quand ça chauffe."
      />

      <Container className="py-12">
        {founders === null ? (
          <Loading />
        ) : founders.length === 0 ? (
          <EmptyState title="Présentation à venir">L&apos;équipe sera présentée ici très bientôt.</EmptyState>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {founders.map((founder, index) => {
              const steamUrl = safeSteamUrl(founder.steam_url);
              return (
                <li key={founder.id}>
                  <Reveal delay={(index % 3) * 0.08} className="h-full">
                    <TacticalCard interactive cut={24} className="h-full" innerClassName="holo flex h-full flex-col overflow-hidden p-7">
                      <span aria-hidden className="absolute -right-2 -top-4 select-none font-display text-[7rem] font-black leading-none text-outline opacity-50">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="relative flex items-center gap-4">
                        <Avatar src={founder.avatar_url} name={founder.name} size={72} className="[--cut:14px]" />
                        <div className="min-w-0">
                          <h2 className="truncate font-display text-4xl font-black uppercase leading-none">{founder.name}</h2>
                          <p className="mt-2 font-tech text-[11px] uppercase tracking-[0.26em] text-gold">{founder.role}</p>
                        </div>
                      </div>

                      {founder.bio ? <p className="relative mt-6 text-sm leading-relaxed text-white/65">{founder.bio}</p> : null}

                      {/* Liens, poussés en bas de carte. */}
                      <div className="relative mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-7 text-sm">
                        {founder.discord_tag ? (
                          <p className="inline-flex items-center gap-2 text-white/70">
                            <FaDiscord aria-hidden className="h-4 w-4 text-gold" />
                            <span className="sr-only">Discord : </span>
                            {founder.discord_tag}
                          </p>
                        ) : null}
                        {steamUrl ? (
                          <a href={steamUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-gold">
                            <FaSteam aria-hidden className="h-4 w-4 text-gold" />
                            Profil Steam
                            <span className="sr-only"> (nouvel onglet)</span>
                          </a>
                        ) : null}
                      </div>
                    </TacticalCard>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </>
  );
}
