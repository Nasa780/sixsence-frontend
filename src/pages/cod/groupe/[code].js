import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuLoaderCircle, LuUsers } from "react-icons/lu";
import { Button, ButtonLink } from "../../../components/ui/Button";
import { Container } from "../../../components/ui/Container";
import { EmptyState, Loading, Notice } from "../../../components/ui/Feedback";
import { LoginPrompt } from "../../../components/ui/LoginPrompt";
import { TacticalCard } from "../../../components/ui/TacticalCard";
import { PageHeader } from "../../../components/ui/Typography";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";

/**
 * Invitation à un groupe (lien partagé par le chef) : aperçu du groupe, puis
 * « Rejoindre » ; une fois dans le groupe, direction la file classée.
 */
export default function PartyInvitePage() {
  const router = useRouter();
  const code = typeof router.query.code === "string" ? router.query.code : null;
  const { session, loading } = useSession();
  const [preview, setPreview] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;
    api(`/cod/party/invite/${encodeURIComponent(code)}`)
      .then(setPreview)
      .catch(() => setNotFound(true));
  }, [code]);

  async function join() {
    setJoining(true);
    setError(null);
    try {
      await api("/cod/party/join", { method: "POST", body: { code } });
      router.push("/cod/ranked");
    } catch (caught) {
      setError(caught.message);
      setJoining(false);
    }
  }

  const full = preview && preview.size >= preview.maxSize;

  return (
    <>
      <Head>
        <title>Invitation de groupe — SixSence</title>
        <meta name="robots" content="noindex" />
      </Head>
      <PageHeader
        image="/images/mw4.webp"
        eyebrow="Classé MW4"
        title={
          <>
            Rejoins le <span className="text-gold-gradient">groupe</span>
          </>
        }
        description="Jouez ensemble : un groupe est toujours placé dans la même équipe."
      />
      <Container className="max-w-3xl py-12">
        {notFound ? (
          <EmptyState title="Invitation introuvable">
            Ce groupe n&apos;existe plus ou le lien est incorrect. Demande un nouveau lien à ton ami.
          </EmptyState>
        ) : !preview || loading ? (
          <Loading label="Chargement de l'invitation…" />
        ) : (
          <TacticalCard highlight cut={24} innerClassName="holo p-6 sm:p-10">
            <p className="flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-gold">
              <LuUsers aria-hidden className="h-4 w-4" />
              Invitation · {preview.format}
            </p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
              Groupe de <span className="text-gold-gradient">{preview.leader}</span>
            </h2>
            <p className="mt-3 text-white/60">
              {preview.size} joueur{preview.size > 1 ? "s" : ""} sur {preview.maxSize} · file {preview.format}
            </p>

            <div className="mt-8">
              {!session ? (
                <LoginPrompt title="Connecte-toi pour rejoindre" text="Le classé se joue avec ton compte Discord." next={router.asPath} />
              ) : full ? (
                <Notice tone="error">Ce groupe est complet.</Notice>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" onClick={join} disabled={joining}>
                    {joining ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuUsers aria-hidden className="h-5 w-5" />}
                    Rejoindre le groupe
                  </Button>
                  <ButtonLink href="/cod/ranked" variant="ghost" size="lg">
                    Non merci
                  </ButtonLink>
                </div>
              )}
              {error ? (
                <Notice tone="error" className="mt-4">
                  {error}
                </Notice>
              ) : null}
            </div>
          </TacticalCard>
        )}
      </Container>
    </>
  );
}
