import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { Container } from "../components/ui/Container";
import { PageHeader } from "../components/ui/Typography";
import { RELEASES } from "../lib/releases";

/** Type d'une nouveauté : couleur de l'étiquette (Classé vert, Division cyan, Tournoi rouge, or ailleurs). */
const TAGS = {
  Classé: "#34d399",
  Division: "#22d3ee",
  Tournoi: "#e5484d",
  Site: "#e7c05a",
  Discord: "#8b9cf7",
};

const dateFr = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default function NewsPage() {
  return (
    <>
      <Head>
        <title>Nouveautés — SixSence</title>
        <meta name="description" content="Les dernières nouveautés de SixSence : coupes, Division, classé, Discord." />
      </Head>
      <PageHeader
        eyebrow="SixSence · Journal"
        title={
          <>
            Nouv<span className="text-gold-gradient">eautés</span>
          </>
        }
        description="Tout ce qui change sur SixSence, mise à jour après mise à jour."
      />
      <Container className="py-12">
        <ol className="relative space-y-14 before:absolute before:bottom-0 before:left-[7px] before:top-2 before:w-px before:bg-linear-to-b before:from-gold/60 before:via-white/10 before:to-transparent sm:before:left-[9px]">
          {RELEASES.map((release, index) => (
            <motion.li key={release.date} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4 }} className="relative pl-10 sm:pl-14">
              <span aria-hidden className={`absolute left-0 top-1.5 h-4 w-4 rotate-45 border-2 sm:h-5 sm:w-5 ${index === 0 ? "border-gold bg-gold shadow-[0_0_18px_rgba(231,192,90,0.6)]" : "border-gold/60 bg-ink"}`} />
              <p className="font-tech text-[10px] uppercase tracking-[0.26em] text-gold">
                {dateFr(release.date)}
                {index === 0 ? <span className="ml-3 bg-gold px-2 py-0.5 text-ink">Dernière mise à jour</span> : null}
              </p>
              <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">{release.title}</h2>
              <ul className="mt-6 space-y-3">
                {release.items.map((item) => {
                  const body = (
                    <>
                      <span className="w-20 shrink-0 font-tech text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: TAGS[item.tag] }}>
                        {item.tag}
                      </span>
                      <span className="min-w-0 flex-1 text-sm leading-relaxed text-white/75">{item.text}</span>
                      {item.href ? <span className="shrink-0 font-tech text-[10px] uppercase tracking-[0.2em] text-gold/70 group-hover:text-gold">Voir →</span> : null}
                    </>
                  );
                  const className = "group flex items-start gap-4 border-l-2 bg-white/[0.03] px-4 py-3.5 transition-colors";
                  return (
                    <li key={item.text}>
                      {item.href ? (
                        <Link href={item.href} className={`${className} hover:bg-white/[0.06]`} style={{ borderColor: `${TAGS[item.tag]}99` }}>
                          {body}
                        </Link>
                      ) : (
                        <div className={className} style={{ borderColor: `${TAGS[item.tag]}99` }}>
                          {body}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.li>
          ))}
        </ol>
      </Container>
    </>
  );
}
