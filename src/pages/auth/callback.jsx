import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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

    const next = typeof router.query.next === "string" ? router.query.next : "/accueil";
    // Seuls les chemins internes sont acceptés.
    const target = next.startsWith("/") && !next.startsWith("//") ? next : "/accueil";

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
    <div className="min-h-screen flex items-center justify-center bg-[#06070F] text-[#e8eaf0] font-[Inter] px-6 text-center">
      {error ? (
        <div>
          <p className="text-[#fecaca]">{error}</p>
          <a href="/accueil" className="text-[#4a90d9]">
            Retour à l'accueil
          </a>
        </div>
      ) : (
        <p className="text-[#a0b0c8]">Connexion en cours…</p>
      )}
    </div>
  );
}
