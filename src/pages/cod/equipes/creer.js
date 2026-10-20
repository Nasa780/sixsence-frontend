import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuCheck, LuLoaderCircle, LuX } from "react-icons/lu";
import { TeamCrest, fieldClass, labelClass } from "../../../components/teams/TeamParts";
import { Button, ButtonLink } from "../../../components/ui/Button";
import { Container } from "../../../components/ui/Container";
import { Loading, Notice } from "../../../components/ui/Feedback";
import { LoginPrompt } from "../../../components/ui/LoginPrompt";
import { TacticalCard } from "../../../components/ui/TacticalCard";
import { Eyebrow, PageHeader } from "../../../components/ui/Typography";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";
import { cn } from "../../../lib/cn";
import { TEAM_COLORS } from "../../../lib/teams";

/** Création d'une équipe : nom, tag, description, couleur (logo et bannière ensuite dans « Mon équipe »). */
export default function CreateTeamPage() {
  const router = useRouter();
  const { userId, loading } = useSession();
  const [state, setState] = useState(null);
  const [form, setForm] = useState({ name: "", tag: "", description: "", color: TEAM_COLORS[0] });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    api("/teams/me")
      .then((data) => (data.team ? router.replace("/cod/equipe") : setState(data)))
      .catch((caught) => setError(caught.message));
  }, [userId, router]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: key === "tag" ? event.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 4) : event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api("/teams", { method: "POST", body: form });
      router.push("/cod/equipe?nouvelle=1");
    } catch (caught) {
      setError(caught.message);
      setPending(false);
    }
  }

  const missing = state?.requirements?.missing ?? [];
  const checks = state
    ? [
        { ok: !missing.some((text) => text.includes("Activision")), label: "Identifiant Activision renseigné" },
        { ok: !missing.some((text) => text.includes("Discord")), label: "Compte Discord connecté" },
        { ok: !missing.some((text) => text.includes("exclusion")), label: "Aucune exclusion en cours" },
        { ok: !missing.some((text) => text.includes("quitté")), label: "Pas de départ d'équipe ces dernières 24 h" },
      ]
    : [];

  return (
    <>
      <Head>
        <title>Créer une équipe — SixSence</title>
      </Head>
      <PageHeader
        image="/images/mw4.webp"
        eyebrow="Division"
        title={
          <>
            Créer une <span className="text-gold-gradient">équipe</span>
          </>
        }
        description="Tu deviens Leader de l'équipe et tu portes sa couronne : tu invites tes coéquipiers, nommes d'autres Leaders et gères l'effectif."
      />
      <Container className="py-12">
        {!loading && !userId ? (
          <LoginPrompt title="Connecte-toi pour créer une équipe" text="Les équipes sont réservées aux joueurs connectés avec Discord." next="/cod/equipes/creer" />
        ) : !state && !error ? (
          <Loading />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <TacticalCard highlight innerClassName="p-6 sm:p-8">
              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                  <div>
                    <label htmlFor="team-name" className={labelClass}>
                      Nom de l&apos;équipe
                    </label>
                    <input id="team-name" className={fieldClass} value={form.name} onChange={set("name")} maxLength={24} placeholder="Nexus Squad" required />
                  </div>
                  <div>
                    <label htmlFor="team-tag" className={labelClass}>
                      Tag (2 à 4)
                    </label>
                    <input id="team-tag" className={cn(fieldClass, "font-tech tracking-[0.2em]")} value={form.tag} onChange={set("tag")} placeholder="NXS" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="team-description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="team-description"
                    className={fieldClass}
                    rows={3}
                    maxLength={300}
                    value={form.description}
                    onChange={set("description")}
                    placeholder="Équipe compétitive FR, entraînements le soir…"
                  />
                </div>
                <div>
                  <span className={labelClass}>Couleur</span>
                  <div className="flex flex-wrap gap-2.5">
                    {TEAM_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Couleur ${color}`}
                        aria-pressed={form.color === color}
                        onClick={() => setForm((current) => ({ ...current, color }))}
                        className={cn("clip-corner h-9 w-9 transition", form.color === color ? "outline-2 outline-offset-2 outline-white" : "opacity-70 hover:opacity-100")}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/45">Logo, bannière et réseaux se règlent ensuite dans « Mon équipe ».</p>
                {error ? <Notice tone="error">{error}</Notice> : null}
                <div className="flex flex-wrap justify-end gap-3">
                  <ButtonLink href="/cod/equipes" variant="ghost">
                    Annuler
                  </ButtonLink>
                  <Button type="submit" disabled={pending || missing.length > 0}>
                    {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
                    Créer l&apos;équipe
                  </Button>
                </div>
              </form>
            </TacticalCard>

            <aside className="space-y-6">
              <TacticalCard innerClassName="p-6">
                <Eyebrow>Conditions</Eyebrow>
                <ul className="mt-4 space-y-2 text-sm">
                  {checks.map((check) => (
                    <li key={check.label} className={cn("flex items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-2.5", check.ok ? "border-win/60" : "border-loss/60 text-white/70")}>
                      {check.ok ? <LuCheck aria-hidden className="h-4 w-4 shrink-0 text-win" /> : <LuX aria-hidden className="h-4 w-4 shrink-0 text-loss" />}
                      {check.label}
                    </li>
                  ))}
                </ul>
              </TacticalCard>
              <TacticalCard innerClassName="p-6">
                <Eyebrow>Aperçu</Eyebrow>
                <div className="mt-4 flex items-center gap-4">
                  <TeamCrest team={{ tag: form.tag || "TAG", color: form.color }} size={64} />
                  <div className="min-w-0">
                    <p className="font-tech text-[11px] uppercase tracking-[0.3em]" style={{ color: form.color }}>
                      [{form.tag || "TAG"}]
                    </p>
                    <p className="truncate font-display text-3xl font-black uppercase leading-none">{form.name || "Nom de l'équipe"}</p>
                  </div>
                </div>
              </TacticalCard>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}
