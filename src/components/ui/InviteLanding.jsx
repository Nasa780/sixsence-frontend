import Head from "next/head";
import { SITE_URL } from "../../lib/config";
import { Avatar } from "./Avatar";
import { Container } from "./Container";
import { EmptyState, Loading, Notice } from "./Feedback";
import { LoginPrompt } from "./LoginPrompt";
import { TacticalCard } from "./TacticalCard";
import { PageHeader } from "./Typography";

/**
 * Page d'arrivée d'un lien d'invitation, la même pour une équipe et un groupe :
 * en-tête du mode, carte (visuel, nom, infos, joueurs), puis connexion ou boutons.
 *
 *   meta      { title, description, image? } : titre de l'onglet et aperçu du lien partagé (image : carte de l'équipe)
 *   hero      { eyebrow, title, description } : en-tête de page
 *   invalid   texte si le lien ne marche plus ; ready : aperçu chargé
 *   card      { label, icon, visual, overline, name, line, members }
 *   signedIn, sessionLoading, loginTitle, loginText, next : connexion Discord
 */
export function InviteLanding({ meta, hero, invalid, ready, card, error, actions, signedIn, sessionLoading, loginTitle, loginText, next }) {
  const Icon = card?.icon;
  return (
    <>
      <Head>
        <title>{`${meta.title} — SixSence`}</title>
        <meta name="robots" content="noindex" />
        <meta key="og:title" property="og:title" content={meta.title} />
        <meta key="og:description" property="og:description" content={meta.description} />
        <meta key="description" name="description" content={meta.description} />
        <meta key="og:image" property="og:image" content={meta.image ?? `${SITE_URL}/api/og?v=7`} />
      </Head>
      <PageHeader image="/images/mw4.webp" eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />
      <Container className="max-w-3xl py-12">
        {invalid ? (
          <EmptyState title="Invitation introuvable">{invalid}</EmptyState>
        ) : !ready ? (
          <Loading label="Chargement de l'invitation…" />
        ) : (
          <TacticalCard highlight cut={24} innerClassName="holo space-y-6 p-6 sm:p-10">
            <p className="flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-gold">
              {Icon ? <Icon aria-hidden className="h-4 w-4" /> : null}
              {card.label}
            </p>
            <div className="flex items-center gap-5">
              {card.visual}
              <div className="min-w-0">
                {card.overline ? <p className="font-tech text-xs tracking-[0.2em] text-white/55">{card.overline}</p> : null}
                <h2 className="mt-1 break-words font-display text-4xl font-black uppercase leading-none sm:text-5xl">{card.name}</h2>
                <p className="mt-2 text-sm text-white/55">{card.line}</p>
              </div>
            </div>
            {card.members?.length ? (
              <ul className="flex flex-wrap gap-2">
                {card.members.map((member) => (
                  <li key={member.id} className="flex items-center gap-2 border-l-2 border-gold/40 bg-white/[0.04] px-2.5 py-1.5">
                    <Avatar full src={member.avatarUrl} name={member.username} size={24} />
                    <span className="font-display text-sm font-bold uppercase">{member.username}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {error ? <Notice tone="error">{error}</Notice> : null}
            {sessionLoading ? null : signedIn ? (
              <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>
            ) : (
              <LoginPrompt title={loginTitle} text={loginText} next={next} />
            )}
          </TacticalCard>
        )}
      </Container>
    </>
  );
}
