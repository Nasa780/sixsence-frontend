import type { NextPage } from "next";

const ContainermarginaccueilMobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center px-4 py-12 text-left text-[10px] text-[#ffb347] font-['JetBrains_Mono']">

      {/* WRAPPER GLOBAL */}
      <div className="w-full max-w-[360px]">

        {/* HEADER */}
        <div className="flex flex-col items-center pb-8">
          <h2 className="text-xl tracking-[3px] leading-7 uppercase font-black text-white font-[Barlow]">
            SIXSENCE
          </h2>
          <div className="text-[9px] tracking-[3px] leading-[13px] uppercase text-[#ffb347]">
            Competitive Platform
          </div>
        </div>

        {/* SECTIONS */}
        <div className="flex flex-col gap-10">

          {/* TEMPLATE */}
          {[
            {
              title: "Mentions légales",
              text:
                "SIXSENCE est une plateforme compétitive développée et maintenue par l'équipe SIXSENCE. Tous droits réservés. La plateforme est fournie à titre d'outil de jeu compétitif sans garantie d'aucune sorte."
            },
            {
              title: "Conditions d'utilisation",
              text:
                "En utilisant SIXSENCE, vous acceptez de respecter les règles de fair-play, de ne pas utiliser de logiciels tiers modifiant le comportement du jeu, et de traiter les autres joueurs avec respect."
            },
            {
              title: "Politique de confidentialité",
              text:
                "Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme : identifiant de joueur, statistiques de partie et préférences de compte."
            },
            {
              title: "Contact",
              text:
                "Pour tout support, litige ou question relative à votre compte, contactez-nous via notre serveur Discord officiel ou à l'adresse contact@sixsence.gg."
            },
            {
              title: "Accessibilité",
              text:
                "SIXSENCE s'engage à rendre sa plateforme accessible à tous les joueurs."
            },
            {
              title: "Mises à jour de la plateforme",
              text:
                "La plateforme est régulièrement mise à jour pour corriger les bugs, améliorer l'équilibrage, et ajouter de nouvelles fonctionnalités compétitives."
            }
          ].map((section, i) => (
            <div key={i} className="flex flex-col gap-3">
              <b className="tracking-[3px] leading-[15px] uppercase">
                {section.title}
              </b>
              <p className="text-sm text-[#d8d4cc] font-[Inter] leading-[20px]">
                {section.text}
              </p>
              <div className="h-px w-full bg-[rgba(232,160,32,0.06)]" />
            </div>
          ))}

        </div>

        {/* FOOTER */}
        <div className="mt-10 border-t border-[rgba(232,160,32,0.07)] pt-8 flex flex-col items-center text-[#a8a49c]">
          <div className="tracking-[3px] leading-[15px] uppercase font-medium">
            © 2026 SIXSENCE · All rights reserved
          </div>
          <div className="tracking-[1px] leading-[15px] font-medium text-[#7a7670]">
            Version 1.0.0 · Season 1
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContainermarginaccueilMobile;
