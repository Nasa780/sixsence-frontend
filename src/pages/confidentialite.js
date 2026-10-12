import Link from "next/link";
import { LegalPage } from "../components/ui/LegalPage";
import { LEGAL } from "../lib/legal";

const contact = LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : <span className="todo">adresse de contact à compléter</span>;

const SECTIONS = [
  {
    id: "responsable",
    title: "Responsable du traitement",
    content: (
      <p>
        Les données sont traitées par l&apos;éditeur de SixSence (voir les <Link href="/mentions-legales">mentions légales</Link>).
        Pour toute question ou demande concernant tes données : {contact}.
      </p>
    ),
  },
  {
    id: "donnees",
    title: "Données collectées",
    content: (
      <>
        <p>Visiter le site ne demande aucun compte et ne collecte aucune donnée personnelle. Si tu te connectes avec Discord :</p>
        <ul>
          <li>
            <strong>Compte Discord</strong> : identifiant, pseudo, avatar et adresse e-mail associée au compte (transmise par Discord
            lors de la connexion et conservée par notre service d&apos;authentification ; elle n&apos;est jamais affichée ni utilisée pour
            t&apos;écrire). SixSence ne reçoit ni tes serveurs, ni tes amis, ni tes messages Discord.
          </li>
          <li>
            <strong>Profil de jeu</strong> : identifiant Activision et plateforme, si tu les renseignes.
          </li>
          <li>
            <strong>Activité sur la plateforme</strong> : passages en file, matchs, résultats, points, rangs, badges, avertissements
            pour match non accepté, inscriptions aux événements.
          </li>
          <li>
            <strong>Contenus que tu publies</strong> : messages du chat de match et captures d&apos;écran envoyées comme preuves.
          </li>
          <li>
            <strong>Données techniques</strong> : journaux des serveurs (adresse IP, date, requête), conservés brièvement par les
            hébergeurs pour la sécurité.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "finalites",
    title: "Pourquoi et sur quelle base",
    content: (
      <>
        <p>
          Ces données servent uniquement à faire fonctionner la plateforme : t&apos;identifier, former les matchs, calculer le
          classement, arbitrer les contestations, sanctionner les abandons et gérer les inscriptions aux événements. La base légale
          est l&apos;<strong>exécution du service</strong> que tu demandes en te connectant (RGPD, art. 6.1.b), et l&apos;
          <strong>intérêt légitime</strong> de garantir des matchs équitables pour la modération et la sécurité (art. 6.1.f).
        </p>
        <p>Aucune donnée n&apos;est vendue, louée ni utilisée à des fins publicitaires.</p>
      </>
    ),
  },
  {
    id: "public",
    title: "Ce qui est public",
    content: (
      <p>
        SixSence est une plateforme compétitive : ton <strong>pseudo, ton avatar, ton identifiant Activision, ta plateforme, tes
        statistiques, ton historique de matchs</strong>, les messages des chats de match et les captures de preuve sont visibles par
        tous les visiteurs, comme sur un classement e-sport. N&apos;indique rien que tu ne souhaites pas rendre public.
      </p>
    ),
  },
  {
    id: "destinataires",
    title: "Hébergement et sous-traitants",
    content: (
      <>
        <ul>
          <li>
            <strong>Supabase</strong> (base de données, connexion, fichiers) : serveurs en Irlande, Union européenne.
          </li>
          <li>
            <strong>Render</strong> (serveur de jeu) et <strong>Vercel</strong> (site web) : sociétés américaines. Les transferts
            hors de l&apos;Union européenne sont encadrés par les clauses contractuelles types de la Commission européenne et le Data
            Privacy Framework.
          </li>
          <li>
            <strong>Discord</strong> : fournit la connexion ; si le bot SixSence est actif, il t&apos;envoie des messages privés
            (match trouvé) et crée les salons vocaux des matchs.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "duree",
    title: "Durée de conservation",
    content: (
      <ul>
        <li>Compte, profil, statistiques et historique : tant que ton compte existe.</li>
        <li>Archives de fin de saison (classement final) : conservées pour l&apos;historique de la plateforme.</li>
        <li>Avertissements pour match non accepté : seuls ceux des dernières 24 heures comptent pour les sanctions.</li>
        <li>Journaux techniques des hébergeurs : quelques jours à quelques semaines selon l&apos;hébergeur.</li>
      </ul>
    ),
  },
  {
    id: "stockage",
    title: "Cookies et stockage local",
    content: (
      <p>
        Le site n&apos;utilise <strong>aucun cookie publicitaire ni outil de mesure d&apos;audience</strong>. Seul ton jeton de
        connexion est enregistré dans le stockage de ton navigateur, ce qui est strictement nécessaire au service et ne demande pas de
        consentement. Les notifications (match trouvé, rappels d&apos;événements) ne fonctionnent que si tu les actives : l&apos;adresse
        technique d&apos;abonnement fournie par ton navigateur est alors enregistrée et liée à ton compte, uniquement pour t&apos;envoyer ces
        notifications. Tu peux les désactiver à tout moment depuis la page File classée ou les réglages de ton navigateur.
      </p>
    ),
  },
  {
    id: "droits",
    title: "Tes droits",
    content: (
      <>
        <p>
          Tu peux à tout moment demander l&apos;accès à tes données, leur rectification, leur suppression (suppression du compte),
          leur portabilité, ou t&apos;opposer à un traitement, en écrivant à {contact}. Réponse sous un mois au plus.
        </p>
        <p>
          Tu peux modifier toi-même ton identifiant Activision depuis <Link href="/cod/profile">ton profil</Link>. En cas de
          désaccord, tu peux saisir la CNIL (cnil.fr).
        </p>
      </>
    ),
  },
];

/** Politique de confidentialité (RGPD). */
export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="RGPD"
      title="Confidentialité"
      description="Quelles données SixSence utilise, pourquoi, et comment exercer tes droits."
      updated={LEGAL.updated}
      sections={SECTIONS}
    />
  );
}
