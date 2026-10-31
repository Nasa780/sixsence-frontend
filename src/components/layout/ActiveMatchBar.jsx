import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { LuChevronRight } from "react-icons/lu";
import { LiveDot, MATCH_STEPS, matchHref, useMatchSummary } from "../cod/ActiveMatchBanner";
import useActiveMatch from "../../hooks/useActiveMatch";
import { Container } from "../ui/Container";

/** Pages qui montrent déjà le match : hub MW4 (carte) et feuilles de match. */
const HIDDEN = ["/cod", "/cod/match/[id]", "/cod/equipes/match/[id]", "/auth/callback"];

/**
 * Bandeau fin « Match en cours » collé sous le menu, sur toutes les autres pages tant que le joueur a un match en
 * cours (Classé ou Division) : map, format, étape et lien « Retour au match ».
 */
export function ActiveMatchBar() {
  const { pathname } = useRouter();
  const active = useActiveMatch();
  const summary = useMatchSummary(active?.kind, active?.id);
  if (!active || HIDDEN.includes(pathname)) return null;

  return (
    <>
      <div data-univers={summary?.univers ?? (active.kind === "division" ? "division" : "classe")} className="fixed inset-x-0 top-16 z-40 border-y border-gold/40 bg-ink/95 backdrop-blur">
        <Container>
          <Link href={matchHref(active.kind, active.id)} className="group flex h-10 items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5 text-sm">
              <LiveDot />
              <span className="shrink-0 font-display font-black uppercase tracking-wide text-gold">Match en cours</span>
              {summary ? (
                <span className="hidden truncate text-white/70 sm:inline">· {[summary.map, summary.format, MATCH_STEPS[summary.status]].filter(Boolean).join(" · ")}</span>
              ) : null}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-black uppercase tracking-[0.12em] text-gold transition-colors group-hover:text-white">
              Retour au match
              <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-flex">
                <LuChevronRight aria-hidden className="h-4 w-4" />
              </motion.span>
            </span>
          </Link>
        </Container>
      </div>
      {/* Place du bandeau dans la page : le contenu descend d'autant (menu et bandeau sont fixes). */}
      <div aria-hidden className="h-[42px]" />
    </>
  );
}
