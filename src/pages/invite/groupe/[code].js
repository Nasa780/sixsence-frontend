import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuCrosshair, LuLoaderCircle, LuUsers } from "react-icons/lu";
import { Avatar } from "../../../components/ui/Avatar";
import { Button, ButtonLink } from "../../../components/ui/Button";
import { InviteLanding } from "../../../components/ui/InviteLanding";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";
import { fetchInvitePreview } from "../../../lib/invites";

/** Arrivée par un lien d'invitation de groupe classé (/invite/groupe/CODE) : aperçu du groupe, puis « Rejoindre le groupe ». */
export default function PartyInvitePage({ code, initialPreview }) {
  const router = useRouter();
  const { userId, loading } = useSession();
  const [preview, setPreview] = useState(initialPreview);
  const [invalid, setInvalid] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/cod/party/invite/${encodeURIComponent(code)}`)
      .then(setPreview)
      .catch(() => setInvalid("Ce groupe n'existe plus ou le lien est incorrect. Demande un nouveau lien à ton mate."));
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

  const full = preview ? preview.size >= preview.maxSize : false;

  return (
    <InviteLanding
      meta={{
        title: preview ? `Rejoins le groupe de ${preview.leader}` : "Invitation de groupe",
        description: preview
          ? `Invitation à jouer en classé ${preview.format} sur SixSence : ${preview.size} / ${preview.maxSize} joueurs.`
          : "Invitation à rejoindre un groupe classé sur SixSence.",
      }}
      hero={{
        eyebrow: "Classé MW4",
        title: (
          <>
            Rejoins le <span className="text-gold-gradient">groupe</span>
          </>
        ),
        description: "Jouez ensemble : un groupe est toujours placé dans la même équipe.",
      }}
      invalid={invalid}
      ready={Boolean(preview)}
      card={
        preview
          ? {
              label: `Invitation · Classé ${preview.format}`,
              icon: LuCrosshair,
              visual: <Avatar name={preview.leader} size={88} />,
              overline: "Groupe de",
              name: preview.leader,
              line: `${preview.size} / ${preview.maxSize} joueurs · file ${preview.format}`,
            }
          : null
      }
      error={error}
      signedIn={Boolean(userId)}
      sessionLoading={loading}
      loginTitle="Connecte-toi pour rejoindre le groupe"
      loginText="La connexion se fait avec Discord."
      next={`/invite/groupe/${code}`}
      actions={
        <>
          <Button size="lg" onClick={join} disabled={joining || full}>
            {joining ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuUsers aria-hidden className="h-5 w-5" />}
            {full ? "Groupe complet" : "Rejoindre le groupe"}
          </Button>
          <ButtonLink href="/cod/ranked" variant="ghost" size="lg">
            Non merci
          </ButtonLink>
        </>
      }
    />
  );
}

export async function getServerSideProps({ params }) {
  const code = String(params.code ?? "");
  const initialPreview = await fetchInvitePreview(`/cod/party/invite/${encodeURIComponent(code)}`);
  return { props: { code, initialPreview } };
}
