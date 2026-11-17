export default defineNuxtConfig({
  compatibilityDate: "2026-11-01",
  devtools: { enabled: false },
  spaLoadingTemplate: false,
  ssr: true,
  routeRules: {
    "/admin/**": { ssr: false },
    "/account/**": { ssr: false },
    "/user/**": { ssr: false },
    // Edge SWR caching for public content APIs (60s stale-while-revalidate)
    "/api/public/bookings/**": { cache: false },
    "/api/public/**": { swr: 60 },
    "/api/cms/**": { swr: 60 },
    // Ensure form submissions, booking queries, and admin APIs are never cached
    "/api/forms/**": { cache: false },
    "/api/admin/**": { cache: false },
    "/api/trpc/**": { cache: false },
  },
  modules: ["nitro-cloudflare-dev"],
  build: { transpile: ["trpc-nuxt"] },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: { nodeCompat: true },
  },
});
