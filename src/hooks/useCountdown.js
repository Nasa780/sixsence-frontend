import { useEffect, useState } from "react";

/** Secondes restantes jusqu'à une date (0 une fois passée), rafraîchies quatre fois par seconde. */
export default function useCountdown(until) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [until]);
  return until ? Math.max(0, (new Date(until).getTime() - now) / 1000) : 0;
}
