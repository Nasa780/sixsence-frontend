/**
 * Illustrations officielles de GTA 6 (2026-11-12), chacune en plusieurs formats dans public/images/gta :
 * `lock` (la voiture rouge au coucher du soleil), `rooftop` (le toit, la ville la nuit), `duo` (le ponton, Jason qui
 * vise, l’ancienne image en meilleure qualité), `braquage` (la station-service, bandanas). Portrait pour les téléphones, paysage pour les ordinateurs.
 */
const art = (name, format, width, height) => ({ src: `/images/gta/${name}-${format}.webp`, width, height });

export const GTA_IMAGES = {
  lock: { portrait: art("lock", "portrait", 1080, 1920), paysage: art("lock", "paysage", 1920, 1080) },
  rooftop: { carre: art("rooftop", "carre", 1080, 1080), paysage: art("rooftop", "paysage", 1920, 1080) },
  duo: { portrait: art("duo", "portrait", 1080, 1920), paysage: art("duo", "paysage", 1920, 1080) },
  braquage: { portrait: art("braquage", "portrait", 1080, 1920), paysage: art("braquage", "paysage", 1920, 1080) },
};
