import Head from "next/head";
import { cn } from "../../lib/cn";
import { Container } from "./Container";
import { PageHeader } from "./Typography";

/**
 * Mise en page des pages de texte (mentions légales, confidentialité, règlement) :
 * en-tête du site, sommaire, puis sections numérotées.
 *
 * sections : [{ id, title, content, group? }] ; group : catégorie affichée au-dessus de sa première section.
 */
export function LegalPage({ title, eyebrow, description, updated, sections, metaDescription }) {
  return (
    <>
      <Head>
        <title>{`${title} — SixSence`}</title>
        <meta name="description" content={metaDescription || description} />
      </Head>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Container className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-[15rem_1fr]">
        <nav aria-label="Sommaire" className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Sommaire</p>
          <ol className="mt-4 space-y-2 text-sm">
            {sections.map((section, index) => (
              <li key={section.id}>
                {section.group && section.group !== sections[index - 1]?.group ? (
                  <p className={cn("mb-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/35", index > 0 && "mt-5")}>{section.group}</p>
                ) : null}
                <a href={`#${section.id}`} className="text-white/55 transition-colors hover:text-gold">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
          {updated ? <p className="mt-6 text-xs text-white/35">Mis à jour le {updated}</p> : null}
        </nav>

        <div className="max-w-3xl space-y-12">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`titre-${section.id}`} className="scroll-mt-28">
              {section.group && section.group !== sections[index - 1]?.group ? (
                <p className={cn("mb-6 border-b border-gold/30 pb-3 font-tech text-xs uppercase tracking-[0.3em] text-gold", index > 0 && "pt-6")}>{section.group}</p>
              ) : null}
              <h2 id={`titre-${section.id}`} className="font-display text-3xl font-black uppercase leading-none">
                <span className="mr-3 text-outline">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <div className="legal-prose mt-5">{section.content}</div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
