export default function Header() {
  return (
    <header className="w-full flex items-center justify-center py-8">
      <div className="flex items-center gap-4">
        {/* LOGO */}
        <div
          className="w-[34px] h-[34px] rounded-[6px] border border-[rgba(255,168,0,0.35)]"
          style={{
            background:
              "linear-gradient(139.09deg,#FFA800 -10.71%,#CC8600 110.71%)",
          }}
        ></div>

        {/* TEXT */}
        <span className="font-raj font-bold text-[14.08px] tracking-[3.9424px] uppercase">
          Six Sence
        </span>
      </div>
    </header>
  );
}
