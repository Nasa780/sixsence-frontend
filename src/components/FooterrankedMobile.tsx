import type { NextPage } from "next";

const FooterrankedMobile: NextPage = () => {
  return (
    <footer className="w-full bg-[rgba(8,12,20,0.95)] border-t border-[rgba(26,107,220,0.12)] px-4 py-6 text-center text-[13px] text-[#2e3d52] font-[Inter]">
      <div className="flex flex-col items-center">
        <span className="leading-[19px]">
          © 2026 SixSence — Tous droits réservés
        </span>
      </div>
    </footer>
  );
};

export default FooterrankedMobile;
