<script setup lang="ts">
import { computed } from "vue";
import { useTranslation } from "~/composables/useTranslation";

const { t, currentLocale } = useTranslation();

useHead({
  title: "Annadanam & Temple Seva - Golpahar Mohashoshan Kali Mandir",
  meta: [
    {
      name: "description",
      content:
        "Contribute to daily Annadanam food distribution, holy bhog seva, and sacred hilltop temple preservation at Golpahar Mohashoshan Kali Mandir in Chittagong.",
    },
    { property: "og:title", content: "Annadanam & Seva Contributions - Golpahar Kali Mandir" },
    {
      property: "og:description",
      content:
        "Support sacred Sanatan seva, pilgrim welfare, and temple heritage preservation at Golpahar Mohashoshan Kali Mandir.",
    },
  ],
});

// Dynamic site settings from backend API
const { data: siteSettings } = await useFetch<any>("/api/cms/site-settings", {
  key: "donation_page_site_settings",
  server: true,
});

const templeTitle = computed(
  () => siteSettings.value?.brand?.siteTitle || "Golpahar Mohashoshan Kali Mandir"
);
const templePhone = computed(
  () => siteSettings.value?.contact?.phone || "+880 2-41356335"
);
const templeWhatsapp = computed(
  () => siteSettings.value?.social?.whatsappNumber || "+880 1819-123456"
);
const templeEmail = computed(
  () => siteSettings.value?.contact?.email || "office@golpaharkalimandir.org"
);
const templeAddress = computed(
  () => siteSettings.value?.contact?.address || "Golpahar, Mehedibag Road, Chittagong, Bangladesh"
);
</script>

<template>
  <div class="donation-page" :lang="currentLocale">
    <!-- 1. HERO HEADER (Matches Deities, Puja, and Contact pages) -->
    <header class="page-hero">
      <div class="hero-inner">
        <span class="hero-badge">
          {{ t('donation.hero_badge', 'Pious Seva & Devotional Giving') }}
        </span>
        <h1 class="hero-title">
          {{ t('donation.hero_title', 'Annadanam, Bhog & Temple Seva') }}
        </h1>
        <p class="hero-subtitle">
          {{
            t(
              'donation.hero_subtitle',
              'Participate in sacred Sanatan seva, feed visiting pilgrims through daily Annadanam, and preserve the eternal sanctity of Golpahar Mohashoshan Kali Mandir.'
            )
          }}
        </p>
        <div class="hero-divider" aria-hidden="true"></div>
      </div>
    </header>

    <main class="page-container">
      <!-- 2. CONTRIBUTION CHANNELS & BANK INFORMATION -->
      <section class="channels-section" aria-label="Official Contribution Methods">
        <div class="channels-card">
          <div class="channels-header">
            <h2 class="channels-title">Official Mandir Contribution Details</h2>
            <p class="channels-subtitle">
              Devotees may remit offerings directly via Bank Transfer or Mobile Banking. Please notify the temple office with your transaction reference to receive an official sanctified receipt.
            </p>
          </div>

          <div class="channels-grid">
            <!-- Bank Transfer Details -->
            <div class="channel-col">
              <div class="channel-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="channel-svg">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
                </svg>
              </div>
              <h3 class="channel-name">Bank Wire / Account Transfer</h3>
              <div class="channel-details-list">
                <div class="detail-line">
                  <span class="lbl">Account Name:</span>
                  <span class="val font-semibold">{{ templeTitle }} Committee</span>
                </div>
                <div class="detail-line">
                  <span class="lbl">Bank Name:</span>
                  <span class="val">Sonali Bank PLC / Pubali Bank PLC</span>
                </div>
                <div class="detail-line">
                  <span class="lbl">Branch:</span>
                  <span class="val">O.R. Nizam Road Branch, Chittagong</span>
                </div>
                <div class="detail-line">
                  <span class="lbl">Account No:</span>
                  <span class="val font-mono font-bold">1204-XXXXXXXXX</span>
                </div>
                <div class="detail-line">
                  <span class="lbl">Routing No:</span>
                  <span class="val font-mono">20026XXXX</span>
                </div>
              </div>
            </div>

            <!-- Mobile Banking Details -->
            <div class="channel-col">
              <div class="channel-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="channel-svg">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h3 class="channel-name">Mobile Banking (bKash &amp; Nagad)</h3>
              <div class="channel-details-list">
                <div class="detail-line">
                  <span class="lbl">bKash Merchant / Helpline:</span>
                  <span class="val font-mono font-bold">{{ templeWhatsapp }}</span>
                </div>
                <div class="detail-line">
                  <span class="lbl">Nagad Seva Account:</span>
                  <span class="val font-mono font-bold">{{ templePhone }}</span>
                </div>
                <div class="detail-line">
                  <span class="lbl">Reference:</span>
                  <span class="val font-semibold">ANNADANAM / SEVA</span>
                </div>
                <div class="detail-line">
                  <span class="lbl">Office Address:</span>
                  <span class="val">{{ templeAddress }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ----------------------------------------------------
   DONATION & SEVA PAGE STYLING
   Follows core palette & minimal typography.
   ---------------------------------------------------- */
.donation-page {
  width: 100%;
  min-height: 85vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding-top: calc(var(--nav-height, 72px) + 2rem);
  padding-bottom: 5rem;
}

/* ====================================================
   1. HERO HEADER
   ==================================================== */
.page-hero {
  padding: 2.5rem 1.5rem 2rem;
  text-align: center;
}

.hero-inner {
  max-width: 780px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  padding: 0.35rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent-text);
  background-color: rgba(110, 5, 22, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  margin-bottom: 1.25rem;
}

html[data-theme="dark"] .hero-badge,
html.dark .hero-badge {
  background-color: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.25);
  color: var(--accent);
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(2.2rem, 4.2vw, 3.4rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.015em;
  color: var(--heading-color);
  margin: 0 0 1rem;
}

.hero-subtitle {
  font-size: clamp(1rem, 1.8vw, 1.125rem);
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0 auto;
  max-width: 650px;
}

.hero-divider {
  width: 56px;
  height: 2px;
  background: var(--accent);
  margin: 2rem auto 0;
  opacity: 0.75;
}

/* ====================================================
   2. MAIN CONTAINER & CHANNELS CARD
   ==================================================== */
.page-container {
  max-width: 1040px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 0;
}

.channels-section {
  margin-bottom: 2rem;
}

.channels-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
}

html[data-theme="dark"] .channels-card,
html.dark .channels-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
}

.channels-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 2.5rem;
}

.channels-title {
  font-family: var(--font-serif);
  font-size: clamp(1.4rem, 2.4vw, 1.85rem);
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 0.6rem;
  line-height: 1.25;
}

.channels-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.75rem;
  margin-bottom: 2rem;
}

.channel-col {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.channel-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-text);
  margin-bottom: 1rem;
}

html[data-theme="dark"] .channel-icon-wrap,
html.dark .channel-icon-wrap {
  color: var(--accent);
}

.channel-svg {
  width: 22px;
  height: 22px;
}

.channel-name {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.1rem;
}

.channel-details-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-line {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.875rem;
}

.detail-line .lbl {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-line .val {
  color: var(--text-primary);
  word-break: break-word;
}

.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

/* ====================================================
   3. DEVOTEE TRUST & DESK NOTICE BOX
   ==================================================== */
.trust-notice-box {
  background-color: rgba(110, 5, 22, 0.04);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

html[data-theme="dark"] .trust-notice-box,
html.dark .trust-notice-box {
  background-color: rgba(212, 175, 55, 0.06);
  border-color: var(--border-subtle);
}

.notice-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-primary);
  flex: 1;
  min-width: 280px;
  margin: 0;
}

.notice-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-primary-action {
  padding: 0.7rem 1.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--btn-primary-text);
  background-color: var(--btn-primary-bg);
  border: 1px solid var(--btn-primary-bg);
  border-radius: 8px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  min-height: 40px;
}

.btn-primary-action:hover {
  background-color: var(--btn-primary-hover);
  border-color: var(--btn-primary-hover);
}

.btn-secondary-action {
  padding: 0.7rem 1.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  min-height: 40px;
}

.btn-secondary-action:hover {
  background-color: var(--bg-hover, rgba(110, 5, 22, 0.04));
  border-color: var(--accent);
}

/* ====================================================
   4. RESPONSIVENESS
   ==================================================== */
@media (max-width: 768px) {
  .page-hero { padding: 2rem 1rem 1.5rem; }
  .channels-card { padding: 1.5rem 1.25rem; }
  .trust-notice-box { flex-direction: column; align-items: stretch; }
  .notice-actions { flex-direction: column; width: 100%; }
  .btn-primary-action, .btn-secondary-action { width: 100%; text-align: center; }
}
</style>