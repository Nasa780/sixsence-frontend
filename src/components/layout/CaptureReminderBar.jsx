import Link from "next/link";
import { useRouter } from "next/router";
import { LuChevronRight, LuImagePlus, LuX } from "react-icons/lu";
import { matchHref, useMatchSummary } from "../cod/ActiveMatchBanner";
import useActiveMatch from "../../hooks/useActiveMatch";
import useCaptureReminder, { dismissCaptureReminder } from "../../hooks/useCaptureReminder";
import { Container } from "../ui/Container";

/** Bandeau du rappel, aux couleurs du mode du match. */
export function CaptureBar({ reminder, univers, onClose }) {
  return (
    <>
      <div data-univers={univers} className="fixed inset-x-0 top-16 z-40 border-y border-gold/40 bg-ink/95 backdrop-blur">
        <Container>
          <div className="flex h-10 items-center justify-between gap-3">
            <Link href={`${matchHref(reminder.kind, reminder.id)}#capture`} className="group flex min-w-0 flex-1 items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5 text-sm">
                <LuImagePlus aria-hidden className="h-4 w-4 shrink-0 text-gold" />
                <span className="truncate font-display font-black uppercase tracking-wide text-gold">{reminder.text}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 font-display text-sm font-black uppercase tracking-[0.12em] text-gold transition-colors group-hover:text-white">
                Ajouter
                <LuChevronRight aria-hidden className="h-4 w-4" />
              </span>
            </Link>
            <button type="button" onClick={onClose} aria-label="Fermer le rappel" className="shrink-0 p-1 text-white/50 hover:text-white">
              <LuX aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </Container>
      </div>
      <div aria-hidden className="h-[42px]" />
    </>
  );
}

/**
 * Rappel de capture sur toutes les pages, feuille de match comprise : dernier match terminé depuis moins de 24 h
 * s'il manque une capture. Il reste tant qu'une map manque ; fermé à la croix, il ne revient plus pour ce match.
 */
export function CaptureReminderBar() {
  const { pathname } = useRouter();
  const reminder = useCaptureReminder();
  const active = useActiveMatch();
  const summary = useMatchSummary(reminder?.kind, reminder?.id);
  if (!reminder || active || pathname === "/auth/callback") return null;
  return <CaptureBar reminder={reminder} univers={summary?.univers ?? (reminder.kind === "division" ? "division" : "classe")} onClose={() => dismissCaptureReminder(reminder.id)} />;
}
