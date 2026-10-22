/** Ancienne adresse du Hall of Fame : la page s'appelle désormais Renommée (/renommee). */
export function getServerSideProps() {
  return { redirect: { destination: "/renommee", permanent: true } };
}

export default function HallOfFameRedirect() {
  return null;
}
