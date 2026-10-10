import { useEffect, useState } from "react";
import PageShell from "../components/site/PageShell";
import { Avatar, Loading, PageTitle } from "../components/site/ui";
import { supabase } from "../lib/supabase";

/**
 * Fondateurs de SixSence. Contenu géré dans Supabase (Table Editor > founders) :
 * nom, rôle, bio, avatar, lien Steam, pseudo Discord, ordre d'affichage.
 */
export default function Founders() {
  const [founders, setFounders] = useState(null);

  useEffect(() => {
    supabase
      .from("founders")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setFounders(data || []));
  }, []);

  return (
    <PageShell active="founders" title="Fondateurs">
      <div className="flex flex-col gap-8">
        <PageTitle title="Les fondateurs" subtitle="L'équipe qui a lancé SixSence et fait vivre la compétition." />

        {founders === null && <Loading />}
        {founders?.length === 0 && (
          <div className="py-10 text-center text-sm text-[#5b7fa8] font-[Inter]">Les profils des fondateurs arrivent bientôt.</div>
        )}

        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
          {founders?.map((founder) => (
            <div
              key={founder.id}
              className="rounded-xl [background:linear-gradient(158deg,_#0c0d12,_#08090d)] border border-solid border-[rgba(215,170,40,0.15)] shadow-[0px_6px_32px_rgba(0,_0,_0,_0.65)] p-6 flex flex-col items-center text-center gap-3"
            >
              <Avatar src={founder.avatar_url} name={founder.name} size={96} className="rounded-full" />
              <div>
                <b className="text-xl text-white font-[Rajdhani] tracking-[0.5px]">{founder.name}</b>
                <div className="pt-0.5 text-xs text-[#ffa040] font-[Rajdhani] tracking-[1.5px] uppercase font-bold">{founder.role}</div>
              </div>
              {founder.bio && <p className="m-0 text-sm text-[#94a3b8] font-[Inter] leading-[21px]">{founder.bio}</p>}
              <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs font-[Inter]">
                {founder.steam_url && /^https:\/\/steamcommunity\.com\//.test(founder.steam_url) && (
                  <a
                    href={founder.steam_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline py-1.5 px-3 rounded-md bg-[#171a21] border border-solid border-[#2a475e] text-[#c7d5e0] hover:text-white"
                  >
                    Steam
                  </a>
                )}
                {founder.discord_tag && (
                  <span className="py-1.5 px-3 rounded-md bg-[rgba(88,101,242,0.15)] border border-solid border-[rgba(88,101,242,0.33)] text-[#8b9cf4]">
                    {founder.discord_tag}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
