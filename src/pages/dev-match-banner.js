import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { LuArrowRight, LuChevronRight, LuMap, LuSwords, LuUsers } from "react-icons/lu";
import { ButtonLink } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { PageHeader } from "../components/ui/Typography";
import { mapImage } from "../lib/maps";

// Page de travail (jamais commitée) : 3 propositions pour le bloc « Match en cours » du hub MW4. ?v=1 | 2 | 3
const MATCH = { map: "Nautical", format: "3v3", step: "Partie en cours", todo: "Déclare le vainqueur une fois la partie jouée" };

function Live({ className = "" }) {
  return (
    <span className={`relative flex h-2.5 w-2.5 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-win" />
    </span>
  );
}

/** Proposition 1 : carte du match aux couleurs du mode, map en fond, étape et prochaine action. */
function MatchCard() {
  return (
    <div data-univers="classe">
      <Link href="#" className="group relative block overflow-hidden border border-gold/50 clip-tactical [--cut:18px] transition-colors hover:border-gold">
        <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-35 transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${mapImage(MATCH.map)}')` }} />
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/40" />
        <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gold" />
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.28em] text-gold">
              <Live />
              En direct · Classé {MATCH.format}
            </p>
            <p className="mt-2 flex items-center gap-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
              <LuMap aria-hidden className="h-7 w-7 text-gold" />
              {MATCH.map}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 font-tech text-[10px] uppercase tracking-[0.2em] text-gold">{MATCH.step}</span>
              <span className="text-white/75">{MATCH.todo}</span>
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center gap-2.5 bg-gold px-6 py-3.5 font-display text-lg font-black uppercase tracking-[0.12em] text-ink clip-slant">
            Retour au match
            <LuArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </div>
  );
}

/** Proposition 2 : bandeau fin collé sous le menu, sur toutes les pages. */
function StickyBar() {
  return (
    <div data-univers="classe" className="fixed inset-x-0 top-16 z-40 border-y border-gold/40 bg-ink/95 backdrop-blur">
      <Container className="flex items-center justify-between gap-3 py-2.5">
        <p className="flex min-w-0 items-center gap-2.5 text-sm">
          <Live />
          <span className="font-display font-black uppercase tracking-wide text-gold">Match en cours</span>
          <span className="hidden truncate text-white/70 sm:inline">
            · {MATCH.map} · Classé {MATCH.format} · {MATCH.step}
          </span>
        </p>
        <Link href="#" className="inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-black uppercase tracking-[0.12em] text-gold hover:text-white">
          Retour au match
          <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-flex">
            <LuChevronRight className="h-4 w-4" />
          </motion.span>
        </Link>
      </Container>
    </div>
  );
}

function HeaderButtons({ live = false }) {
  return (
    <>
      <span data-univers="classe" className="contents">
        <ButtonLink href="#" size="lg">
          {live ? <Live /> : <LuSwords aria-hidden className="h-5 w-5" />}
          Retour au match
          <LuArrowRight aria-hidden className="h-5 w-5" />
        </ButtonLink>
      </span>
      <ButtonLink href="#" size="lg" variant="outline">
        <LuUsers aria-hidden className="h-5 w-5" />
        Mon équipe
      </ButtonLink>
    </>
  );
}

export default function DevMatchBanner() {
  const v = useRouter().query.v ?? "1";
  return (
    <>
      {v === "2" ? <StickyBar /> : null}
      <PageHeader
        image="/images/mw4.webp"
        eyebrow="Call of Duty"
        title={
          <>
            Zone de <span className="text-gold-gradient">combat</span>
          </>
        }
        description="Content de te revoir, nqsq. Classé, Division et Tournoi t'attendent."
        actions={
          v === "1" ? (
            <ButtonLink href="#" size="lg" variant="outline">
              <LuUsers aria-hidden className="h-5 w-5" />
              Mon équipe
            </ButtonLink>
          ) : (
            <HeaderButtons live={v === "3"} />
          )
        }
      />
      <Container className="space-y-10 py-12">
        {v === "1" ? <MatchCard /> : null}
        <div className="grid gap-6 md:grid-cols-3">
          {["Classé", "Division", "Tournoi"].map((name) => (
            <div key={name} className="flex h-48 items-end border border-white/10 bg-white/[0.03] p-6 font-display text-4xl font-black uppercase text-white/25">
              {name}
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
