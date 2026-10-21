import { SITE_URL as SITE } from "../lib/config";
import { supabase } from "../lib/supabase";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/cod", priority: "0.9", changefreq: "daily" },
  { path: "/cod/ranked", priority: "0.9", changefreq: "daily" },
  { path: "/cod/leaderboard", priority: "0.8", changefreq: "hourly" },
  { path: "/gta6", priority: "0.9", changefreq: "weekly" },
  { path: "/gta6/events", priority: "0.8", changefreq: "daily" },
  { path: "/founders", priority: "0.5", changefreq: "monthly" },
  { path: "/partners", priority: "0.5", changefreq: "monthly" },
  { path: "/reglement", priority: "0.4", changefreq: "monthly" },
  { path: "/hall-of-fame", priority: "0.6", changefreq: "weekly" },
  { path: "/calendrier", priority: "0.6", changefreq: "daily" },
  { path: "/nouveautes", priority: "0.5", changefreq: "weekly" },
  { path: "/mentions-legales", priority: "0.2", changefreq: "yearly" },
  { path: "/confidentialite", priority: "0.2", changefreq: "yearly" },
];

const escape = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plan du site pour les moteurs de recherche : pages fixes et événements GTA 6 publiés. */
export async function getServerSideProps({ res }) {
  const { data: events } = await supabase.from("gta_events").select("id, created_at").eq("status", "published").order("starts_at", { ascending: false }).limit(200);

  const urls = [
    ...STATIC_PAGES.map((page) => `<url><loc>${SITE}${page.path}</loc><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`),
    ...(events || []).map(
      (event) => `<url><loc>${escape(`${SITE}/gta6/events/${event.id}`)}</loc><lastmod>${new Date(event.created_at).toISOString()}</lastmod><priority>0.6</priority></url>`,
    ),
  ];

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
