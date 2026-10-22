/** Ancienne page Hall of Fame : son contenu est sur la page MW4, sous les tops (ancre #hall-of-fame). */
export function getServerSideProps() {
  return { redirect: { destination: "/cod#hall-of-fame", permanent: false } };
}

export default function HallOfFameRedirect() {
  return null;
}
