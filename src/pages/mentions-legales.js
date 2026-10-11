import Link from "next/link";
import { LegalPage } from "../components/ui/LegalPage";
import { LEGAL } from "../lib/legal";

const todo = (value) => value || <span className="todo">à compléter</span>;

const SECTIONS = [
  {
    id: "editeur",
    title: "Éditeur du site",
    content: (
      <>
        <p>
          Le site <strong>sixsence.fr</strong> est édité par : {todo(LEGAL.editor)}.
          {LEGAL.status ? ` ${LEGAL.status}` : ""}
        </p>
        <ul>
          <li>Adresse : {todo(LEGAL.address)}</li>
          <li>Contact : {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : todo(null)}</li>
          {LEGAL.director ? <li>Directeur ou directrice de la publication : {LEGAL.director}</li> : null}
        </ul>
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
