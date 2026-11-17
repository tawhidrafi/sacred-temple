import { defineEventHandler, setHeader, getRequestURL } from "h3";

export default defineEventHandler((event) => {
  const origin = getRequestURL(event).origin || "https://golpaharkalimandir.org";
  const now = new Date().toISOString().split("T")[0];

  const publicRoutes = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/about", priority: "0.9", changefreq: "monthly" },
    { loc: "/deities", priority: "0.9", changefreq: "weekly" },
    { loc: "/puja-and-rituals", priority: "0.9", changefreq: "weekly" },
    { loc: "/festivals-and-events", priority: "0.8", changefreq: "weekly" },
    { loc: "/notice-news", priority: "0.8", changefreq: "daily" },
    { loc: "/gallery", priority: "0.8", changefreq: "weekly" },
    { loc: "/puja-booking", priority: "0.8", changefreq: "monthly" },
    { loc: "/booking-status", priority: "0.7", changefreq: "monthly" },
    { loc: "/donation", priority: "0.8", changefreq: "monthly" },
    { loc: "/contact", priority: "0.8", changefreq: "monthly" },
    { loc: "/sitemap", priority: "0.5", changefreq: "monthly" },
  ];

  const xmlUrls = publicRoutes
    .map(
      (r) => `  <url>
    <loc>${origin}${r.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=86400");
  return sitemapXml;
});
