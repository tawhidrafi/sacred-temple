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

const sevaOfferings = [
  {
    id: "annadanam",
    title: "Daily Annadanam Seva",
    subtitle: "Sacred Food Distribution",
    description:
      "Annadanam is revered as the highest form of charity in Vedic tradition. Sponsor sanctified khichuri and mahaprasad meals for visiting devotees, pilgrims, and the needy.",
    suggestedAmounts: ["BDT 1,001", "BDT 2,501", "BDT 5,001", "BDT 11,001"],
    tag: "High Merit Seva",
  },
  {
    id: "nitya-bhog",
    title: "Nitya Bhog & Aarti Seva",
    subtitle: "Daily Divine Offerings",
    description:
      "Support the daily sanctum rituals, pure cow ghee for lamps, sacred hibiscus garlands, bel leaves, incense, and fresh fruits offered at the lotus feet of Maa Bhavatarini.",
    suggestedAmounts: ["BDT 501", "BDT 1,001", "BDT 2,001", "BDT 5,001"],
    tag: "Daily Worship",
  },
  {
    id: "preservation",
    title: "Temple Heritage & Renovation",
    subtitle: "Infrastructure & Sanctum Preservation",
    description:
      "Contribute towards ongoing architectural upkeep, pilgrim shelter pavilions, lighting, cleanliness, and long-term preservation of our historic 130+ year hilltop holy sanctuary.",
    suggestedAmounts: ["BDT 2,501", "BDT 5,001", "BDT 10,001", "BDT 25,001"],
    tag: "Sanctuary Trust",
  },
];
</script>

<template>
  <div class="donation-page-wrapper" :lang="currentLocale">
    <!-- 1. HERO SECTION -->
    <header class="donation-hero">
      <div class="hero-content">
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

    <main class="donation-container">
      <!-- 2. SEVA PILLARS GRID -->
      <section class="seva-pillars-section" aria-label="Sacred Seva Opportunities">
        <div class="section-heading-wrap">
          <span class="section-tag">{{ t('donation.seva_tag', 'SACRED OPPORTUNITIES') }}</span>
          <h2 class="section-title">{{ t('donation.seva_title', 'Choose Your Devotional Seva') }}</h2>
          <p class="section-desc">
            All offerings made to the Mandir are utilized strictly under the supervision of the Executive Committee for pilgrim welfare and religious ceremonies.
          </p>
        </div>

        <div class="seva-grid">
          <article
            v-for="seva in sevaOfferings"
            :key="seva.id"
            class="seva-card"
          >
            <div class="seva-card-header">
              <span class="seva-tag-chip">{{ seva.tag }}</span>
              <h3 class="seva-title">{{ seva.title }}</h3>
              <p class="seva-subtitle">{{ seva.subtitle }}</p>
            </div>

            <p class="seva-desc">{{ seva.description }}</p>

            <div class="suggested-amounts-wrap">
              <span class="amounts-label">Suggested Contributions:</span>
              <div class="amounts-pills">
                <span
                  v-for="amt in seva.suggestedAmounts"
                  :key="amt"
                  class="amount-pill"
                >
                  {{ amt }}
                </span>
              </div>
            </div>

            <div class="seva-card-actions">
              <NuxtLink
                :to="{ path: '/contact', query: { subject: seva.title } }"
                class="btn-contribute"
              >
                Inquire &amp; Sponsor Seva &rarr;
              </NuxtLink>
            </div>
          </article>
        </div>
      </section>

      <!-- 3. CONTRIBUTION CHANNELS & BANK INFORMATION -->
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
              <div class="channel-icon-wrap">
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
              <div class="channel-icon-wrap">
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

          <!-- Notice & Helpline Banner -->
          <div class="trust-notice-box">
            <div class="notice-text">
              <strong>Devotee Advisory:</strong> For sankalpa reading, gotra dedication during Annadanam, or booking individual Vedic rituals, please connect with the devotee desk or register a puja online.
            </div>
            <div class="notice-actions">
              <NuxtLink to="/contact?subject=Donation+%26+Trust+Inquiries" class="btn-notice-contact">
                Devotee Desk Inquiry &rarr;
              </NuxtLink>
              <NuxtLink to="/puja-booking" class="btn-notice-puja">
                Book a Sacred Puja
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.donation-page-wrapper {
  min-height: 100vh;
  background-color: var(--bg-primary, #F7EFE0);
  color: var(--text-primary, #2B1A17);
  padding-bottom: 5rem;
}

/* Hero Section */
.donation-hero {
  padding: 4.5rem 1.5rem 3.5rem;
  text-align: center;
  background: radial-gradient(circle at 50% 20%, rgba(224, 165, 38, 0.12) 0%, transparent 70%);
}

.hero-content {
  max-width: 820px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent, #6E0516);
  background: rgba(110, 5, 22, 0.08);
  border: 1px solid rgba(110, 5, 22, 0.2);
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

.hero-title {
  font-family: var(--font-heading, "Cinzel", serif);
  font-size: clamp(2rem, 4vw, 2.85rem);
  font-weight: 700;
  color: var(--accent, #6E0516);
  margin: 0 0 1rem;
  letter-spacing: -0.015em;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  color: var(--text-secondary, #475569);
  line-height: 1.65;
  margin: 0 auto 1.5rem;
  max-width: 680px;
}

.hero-divider {
  width: 64px;
  height: 3px;
  background-color: var(--accent, #6E0516);
  margin: 0 auto;
  border-radius: 2px;
}

/* Page Container */
.donation-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Section Heading */
.section-heading-wrap {
  text-align: center;
  max-width: 650px;
  margin: 0 auto 2.5rem;
}

.section-tag {
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent, #6E0516);
  display: block;
  margin-bottom: 0.35rem;
}

.section-title {
  font-family: var(--font-heading, "Cinzel", serif);
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--text-primary, #2B1A17);
  margin: 0 0 0.5rem;
}

.section-desc {
  font-size: 0.925rem;
  color: var(--text-secondary, #475569);
  line-height: 1.55;
  margin: 0;
}

/* Seva Grid */
.seva-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.seva-card {
  background: var(--bg-surface, #ffffff);
  border: 1px solid rgba(224, 165, 38, 0.35);
  border-radius: 12px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.seva-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent, #6E0516);
  box-shadow: 0 8px 20px rgba(110, 5, 22, 0.1);
}

.seva-card-header {
  margin-bottom: 1rem;
}

.seva-tag-chip {
  font-size: 0.675rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.seva-title {
  font-family: var(--font-heading, "Cinzel", serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent, #6E0516);
  margin: 0 0 0.25rem;
}

.seva-subtitle {
  font-size: 0.825rem;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  font-weight: 600;
}

.seva-desc {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-primary, #2B1A17);
  margin: 0 0 1.25rem;
  flex: 1;
}

.suggested-amounts-wrap {
  background: var(--bg-primary, #F7EFE0);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  margin-bottom: 1.35rem;
}

.amounts-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary, #475569);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.45rem;
}

.amounts-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.amount-pill {
  font-size: 0.8rem;
  font-weight: 700;
  font-family: monospace;
  background: #ffffff;
  border: 1px solid rgba(224, 165, 38, 0.5);
  color: var(--accent, #6E0516);
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
}

.btn-contribute {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  background: var(--accent, #6E0516);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s ease;
  min-height: 44px;
}

.btn-contribute:hover {
  background: var(--accent-hover, #4A020E);
}

/* Contribution Channels Card */
.channels-card {
  background: #ffffff;
  border: 1.5px solid rgba(224, 165, 38, 0.4);
  border-radius: 14px;
  padding: 2.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.channels-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 2.25rem;
}

.channels-title {
  font-family: var(--font-heading, "Cinzel", serif);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent, #6E0516);
  margin: 0 0 0.5rem;
}

.channels-subtitle {
  font-size: 0.925rem;
  color: var(--text-secondary, #475569);
  line-height: 1.55;
  margin: 0;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.75rem;
  margin-bottom: 2rem;
}

.channel-col {
  background: var(--bg-primary, #F7EFE0);
  border: 1px solid rgba(224, 165, 38, 0.35);
  border-radius: 10px;
  padding: 1.5rem;
}

.channel-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid rgba(224, 165, 38, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent, #6E0516);
  margin-bottom: 0.85rem;
}

.channel-svg {
  width: 22px;
  height: 22px;
}

.channel-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary, #2B1A17);
  margin: 0 0 1rem;
}

.channel-details-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.detail-line {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.875rem;
}

.detail-line .lbl {
  color: var(--text-secondary, #6B7280);
  font-size: 0.775rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-line .val {
  color: var(--text-primary, #2B1A17);
}

.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

/* Notice Box */
.trust-notice-box {
  background: rgba(110, 5, 22, 0.04);
  border: 1px solid rgba(110, 5, 22, 0.15);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.notice-text {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-primary, #2B1A17);
  flex: 1;
  min-width: 280px;
}

.notice-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.btn-notice-contact {
  padding: 0.55rem 1.15rem;
  border-radius: 6px;
  background: var(--accent, #6E0516);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
}

.btn-notice-contact:hover {
  background: var(--accent-hover, #4A020E);
}

.btn-notice-puja {
  padding: 0.55rem 1.15rem;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid var(--accent, #6E0516);
  color: var(--accent, #6E0516);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
}

.btn-notice-puja:hover {
  background: rgba(110, 5, 22, 0.04);
}

/* Responsiveness */
@media (max-width: 768px) {
  .donation-hero { padding: 3rem 1rem 2.5rem; }
  .channels-card { padding: 1.25rem; }
  .trust-notice-box { flex-direction: column; align-items: stretch; }
  .notice-actions { flex-direction: column; width: 100%; }
  .btn-notice-contact, .btn-notice-puja { justify-content: center; width: 100%; }
}
</style>
