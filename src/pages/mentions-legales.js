import Link from "next/link";
import { LegalPage } from "../components/ui/LegalPage";
import { LEGAL } from "../lib/legal";

const todo = (value) => value || <span className="todo">à compléter</span>;

/** Une ligne de la fiche éditeur. */
function EditorInfo({ label, children }) {
  return (
    <div className="bg-ink-800 px-4 py-3.5">
      <dt className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">{label}</dt>
      <dd className="mt-1.5 text-sm text-white/85">{children}</dd>
    </div>
  );
}

const SECTIONS = [
  {
    id: "editeur",
    title: "Éditeur du site",
    content: (
      <>
        <p>
          Le site <strong>sixsence.fr</strong> est une plateforme communautaire de jeu, éditée par un particulier sous le pseudonyme{" "}
          <strong>SixSence</strong>, à titre non professionnel et sans but lucratif.
        </p>
        <dl className="grid grid-cols-1 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
          <EditorInfo label="Éditeur">{todo(LEGAL.editor)}</EditorInfo>
          <EditorInfo label="Statut">{todo(LEGAL.status)}</EditorInfo>
          <EditorInfo label="Adresse">{todo(LEGAL.address)}</EditorInfo>
          <EditorInfo label="Contact">
            {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : todo(null)}
          </EditorInfo>
          {LEGAL.director ? <EditorInfo label="Directeur de la publication">{LEGAL.director}</EditorInfo> : null}
        </dl>
        <p>
          Conformément à l&apos;article 6, III-2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique,
          l&apos;éditeur, qui agit à titre non professionnel, a choisi de rester anonyme : ses coordonnées complètes ont été communiquées
          à l&apos;hébergeur, qui peut les transmettre à l&apos;autorité judiciaire sur demande.
        </p>
        <p>
          Pour toute question, demande liée à tes données ou signalement d&apos;un contenu, écris à{" "}
          {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : todo(null)}. Réponse sous quelques jours.
        </p>
      </>
    ),
  },
  {
    id: "hebergement",
    title: "Hébergement",
    content: (
      <ul>
        <li>
          <strong>Site web</strong> : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com
        </li>
        <li>
          <strong>Serveur de jeu (API et temps réel)</strong> : Render Services, Inc., San Francisco, Californie, États-Unis — render.com
        </li>
        <li>
          <strong>Base de données et authentification</strong> : Supabase Inc. — supabase.com (données hébergées en Irlande, Union
          européenne)
        </li>
        <li>
          <strong>Nom de domaine</strong> : OVH SAS, 2 rue Kellermann, 59100 Roubaix, France
        </li>
      </ul>
    ),
  },
  {
    id: "propriete",
    title: "Propriété intellectuelle",
    content: (
      <>
        <p>
          Le nom SixSence, le logo, la charte graphique et les textes du site appartiennent à leur éditeur. Toute reproduction sans
          autorisation est interdite.
        </p>
        <p>
          SixSence est une plateforme communautaire indépendante, sans lien avec Activision, Rockstar Games, Take-Two Interactive ou
          Discord. <strong>Call of Duty</strong>, <strong>Modern Warfare</strong> et <strong>Grand Theft Auto</strong> sont des marques
          déposées de leurs propriétaires respectifs ; les visuels de jeux sont utilisés à titre d&apos;illustration.
        </p>
      </>
    ),
  },
  {
    id: "responsabilite",
    title: "Responsabilité",
    content: (
      <p>
        L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des informations publiées et la disponibilité du service, sans
        pouvoir le garantir. Les pseudos, messages et captures publiés par les joueurs relèvent de leur responsabilité ; tout contenu
        illicite peut être signalé à l&apos;adresse de contact ci-dessus et sera retiré dans les meilleurs délais.
      </p>
    ),
  },
  {
    id: "donnees",
    title: "Données personnelles et cookies",
    content: (
      <p>
        Le traitement de tes données (compte Discord, statistiques de jeu) est détaillé dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>. Le site n&apos;utilise ni publicité ni cookie de mesure
        d&apos;audience : seul le stockage nécessaire à ta connexion est employé.
      </p>
    ),
  },
];

/** Mentions légales (LCEN, art. 6). Les informations de l'éditeur se règlent dans lib/legal.js. */
export default function LegalNoticePage() {
  return (
    <LegalPage
      eyebrow="Informations"
      title="Mentions légales"
      description="Qui édite SixSence, qui l'héberge, et à qui t'adresser."
      updated={LEGAL.updated}
      sections={SECTIONS}
    />
  );
}
