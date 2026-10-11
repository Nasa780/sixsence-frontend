import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LuLoaderCircle } from "react-icons/lu";
import { ButtonLink } from "../../components/ui/Button";
import { LogoMark } from "../../components/ui/Logo";
import { supabase } from "../../lib/supabase";

/**
 * Retour de la connexion Discord.
 *
 * Supabase renvoie ici avec un code (?code=...) que le client échange contre
 * une session, puis on redirige vers la page d'origine (?next=...).
 */
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    const next = typeof router.query.next === "string" ? router.query.next : "/cod";
    // Seuls les chemins internes sont acceptés.
    const target = next.startsWith("/") && !next.startsWith("//") ? next : "/cod";

    if (router.query.error) {
      setError("La connexion avec Discord a été annulée ou refusée.");
      return;
    }

    const finish = async () => {
      const code = typeof router.query.code === "string" ? router.query.code : null;
      const { data } = await supabase.auth.getSession();
      if (!data.session && code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("La connexion avec Discord n'a pas abouti. Réessaie.");
          return;
        }
      }
      router.replace(target);
    };
    finish();
  }, [router]);

  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center bg-ink px-6 text-center">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div>
        <LogoMark className="mx-auto h-14 w-14 text-gold glow-gold" />
        {error ? (
          <>
            <p className="mt-6 font-display text-3xl font-black uppercase">{error}</p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href="/login">Réessayer</ButtonLink>
            </div>
          </>
        ) : (
          <p className="mt-6 inline-flex items-center gap-2.5 font-display text-2xl font-bold uppercase tracking-[0.14em] text-white/80">
            <LuLoaderCircle aria-hidden className="h-6 w-6 animate-spin text-gold" />
            Connexion en cours…
          </p>
        )}
      </div>
    </div>
  );
}
