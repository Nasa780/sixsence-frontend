import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

/**
 * Carte qui s'incline légèrement vers la souris (effet de profondeur), avec une lueur de la couleur d'accent
 * (--color-gold, donc celle du mode sous data-univers) qui suit le curseur. Souris seulement ; immobile si
 * l'utilisateur réduit les animations.
 */
export function TiltCard({ children, className, max = 6, ...props }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const spring = { stiffness: 220, damping: 22 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const lift = useSpring(useTransform(hover, [0, 1], [0, -6]), spring);
  const glowOpacity = useSpring(hover, spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, color-mix(in srgb, var(--color-gold) 22%, transparent), transparent 65%)`;

  if (reduce) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const move = (event) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - box.left) / box.width);
    py.set((event.clientY - box.top) / box.height);
    hover.set(1);
  };
  const leave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  return (
    <div className={className} style={{ perspective: 1100 }} {...props}>
      <motion.div onPointerMove={move} onPointerLeave={leave} style={{ rotateX, rotateY, y: lift, transformStyle: "preserve-3d" }} className="relative h-full">
        {children}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10 mix-blend-screen" style={{ background: glow, opacity: glowOpacity }} />
      </motion.div>
    </div>
  );
}
