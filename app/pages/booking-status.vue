<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTranslation } from "~/composables/useTranslation";

const { t, currentLocale } = useTranslation();

interface BookingStatusData {
  ref: string;
  name: string;
  preferredDate: string;
  gotra?: string | null;
  status: "new" | "confirmed" | "completed" | "cancelled";
  note?: string | null;
  adminNote?: string | null;
  createdAt: number;
  pujaName?: { en: string; bn: string } | string;
  pujaPrice?: number | null;
  pujaDuration?: string | null;
  items?: BookingStatusData[];
}

const route = useRoute();
const router = useRouter();

// Reference code or phone number from query or manual input
const searchRef = ref("");
const activeRef = ref("");

// State
const loading = ref(false);
const booking = ref<BookingStatusData | null>(null);
const multipleBookings = ref<BookingStatusData[]>([]);
const lookupError = ref("");
const copied = ref(false);

// Whether this is freshly forwarded from submission
const isNewSubmission = computed(() => route.query.new === "1");

// Fetch booking details by reference code or phone number
const fetchBookingStatus = async (queryStr: string) => {
  const clean = queryStr.trim();
  if (!clean) return;

  activeRef.value = clean;
  loading.value = true;
  lookupError.value = "";
  booking.value = null;
  multipleBookings.value = [];

  try {
    const res = await $fetch<BookingStatusData & { items?: BookingStatusData[] }>(
      `/api/public/bookings/${encodeURIComponent(clean)}`
    );
    if (res && res.ref) {
      booking.value = res;
      if (Array.isArray(res.items) && res.items.length > 1) {
        multipleBookings.value = res.items;
      }
    } else {
      lookupError.value = `No booking request found for "${clean}".`;
    }
  } catch (err: any) {
    lookupError.value = err?.data?.message || err?.message || `No booking found for "${clean}".`;
  } finally {
    loading.value = false;
  }
};

const selectBooking = (item: BookingStatusData) => {
  booking.value = item;
};

const handleManualLookup = () => {
  if (!searchRef.value.trim()) return;
  router.push({ query: { ref: searchRef.value.trim() } });
  fetchBookingStatus(searchRef.value.trim());
};

const copyReference = () => {
  if (booking.value?.ref && typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(booking.value.ref);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};

// Lifecycle
onMounted(() => {
  const initialRef = (route.query.ref as string) || "";
  if (initialRef) {
    searchRef.value = initialRef;
    fetchBookingStatus(initialRef);
  }
});

watch(
  () => route.query.ref,
  (newRef) => {
    if (newRef && typeof newRef === "string" && newRef.trim() !== activeRef.value) {
      searchRef.value = newRef.trim();
      fetchBookingStatus(newRef.trim());
    }
  }
);

// Helpers
const formatStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Confirmed & Scheduled";
    case "completed":
      return "Ritual Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Under Temple Review";
  }
};

const formatPujaTitle = (raw: any) => {
  if (typeof raw === "object" && raw) {
    return currentLocale.value === "bn" ? raw.bn || raw.en || "Sacred Puja" : raw.en || raw.bn || "Sacred Puja";
  }
  return raw || "Sacred Puja";
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "To be confirmed";
  try {
    const [y, m, d] = dateStr.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
};

useHead({
  title: "Puja Booking Status - Golpahar Mohashoshan Kali Mandir",
  meta: [
    {
      name: "description",
      content: "Check your puja booking status, confirmation details, and scheduled date at Golpahar Mohashoshan Kali Mandir.",
    },
    { property: "og:title", content: "Check Puja Booking Status - Golpahar Kali Mandir" },
  ],
});
</script>

<template>
  <div class="status-page" :lang="currentLocale">
    <!-- HERO HEADER -->
    <header class="page-hero">
      <div class="hero-inner">
        <span class="hero-badge">{{ t('status.hero_badge', 'Devotee Sankalpa Desk') }}</span>
        <h1 class="hero-title">{{ t('status.hero_title', 'Puja Booking Status') }}</h1>
        <p class="hero-subtitle">
          {{ t('status.hero_subtitle', 'Track the review, confirmation, and scheduling of your sacred puja offering at Golpahar Kali Mandir.') }}
        </p>
        <div class="hero-divider" aria-hidden="true"></div>
      </div>
    </header>

    <main class="page-container">
      <!-- SUCCESS BANNER ON FORWARDING -->
      <div v-if="isNewSubmission && booking" class="success-banner" role="alert">
        <h2 class="success-heading">Puja Request Submitted Successfully</h2>
        <p class="success-sub">
          Please note your reference code below. Our temple office will review and confirm your puja schedule.
        </p>
      </div>

      <!-- LOOKUP SEARCH CARD (IF NO REF OR CHECKING ANOTHER) -->
      <section class="lookup-card" aria-label="Reference or Phone Lookup">
        <form @submit.prevent="handleManualLookup" class="lookup-form">
          <label class="lookup-label" for="ref-input">
            {{ t('status.lookup_label', 'Enter Booking Reference Code or Mobile Phone Number') }}
          </label>
          <div class="lookup-input-wrap">
            <input
              id="ref-input"
              v-model="searchRef"
              type="text"
              class="lookup-input"
              placeholder="e.g. KM-2026-ABCDE or 01819123456"
              autocomplete="off"
              required
            />
            <button type="submit" class="btn-lookup" :disabled="loading">
              <span>{{ loading ? t('common.loading', 'Checking...') : t('status.lookup_btn', 'Check Status') }}</span>
            </button>
          </div>
          <p class="lookup-hint">
            You can track your puja using the unique reference code or the mobile number entered during booking.
          </p>
        </form>
      </section>

      <!-- MULTIPLE BOOKINGS SELECTOR (IF SEARCHED BY PHONE) -->
      <section v-if="multipleBookings.length > 1" class="multiple-bookings-card" aria-label="Multiple Bookings Found">
        <div class="multiple-header">
          <span class="multiple-badge">{{ multipleBookings.length }} Offerings Found</span>
          <p class="multiple-sub">Multiple puja bookings found for this search. Select an offering below to view full details:</p>
        </div>
        <div class="multiple-pills-list">
          <button
            v-for="item in multipleBookings"
            :key="item.ref"
            type="button"
            class="multiple-pill-btn"
            :class="{ 'pill-selected': booking?.ref === item.ref }"
            @click="selectBooking(item)"
          >
            <span class="pill-ref">{{ item.ref }}</span>
            <span class="pill-name">{{ formatPujaTitle(item.pujaName) }}</span>
            <span class="pill-date">{{ formatDate(item.preferredDate) }}</span>
            <span class="pill-tag" :class="`status-${item.status}`">{{ formatStatusLabel(item.status) }}</span>
          </button>
        </div>
      </section>

      <!-- LOADING STATE -->
      <div v-if="loading" class="status-loading">
        <div class="spinner" aria-hidden="true"></div>
        <p>Retrieving booking details from Mandir records...</p>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="lookupError" class="lookup-error-card" role="alert">
        <h3 class="error-heading">Booking Not Found</h3>
        <p class="error-text">{{ lookupError }}</p>
        <div class="error-actions">
          <NuxtLink to="/puja-booking" class="btn-primary-action">
            Submit New Booking
          </NuxtLink>
          <NuxtLink to="/contact" class="btn-secondary-action">
            Contact Office
          </NuxtLink>
        </div>
      </div>

      <!-- BOOKING DETAILS CARD -->
      <section v-else-if="booking" class="booking-result-card" aria-label="Booking Confirmation Details">
        <div class="card-top-bar">
          <div class="ref-block">
            <span class="ref-label">Booking Reference</span>
            <div class="ref-code-row">
              <span class="ref-code">{{ booking.ref }}</span>
              <button
                type="button"
                class="btn-copy"
                @click="copyReference"
                :title="copied ? 'Copied to clipboard!' : 'Copy reference code'"
              >
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

          <div class="status-block">
            <span class="status-badge" :class="`status-${booking.status}`">
              {{ formatStatusLabel(booking.status) }}
            </span>
          </div>
        </div>

        <div class="card-details-grid">
          <div class="detail-item">
            <span class="detail-label">Puja Offering</span>
            <span class="detail-val font-serif font-bold">{{ formatPujaTitle(booking.pujaName) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Devotee Name</span>
            <span class="detail-val">{{ booking.name }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Preferred Date</span>
            <span class="detail-val font-bold">{{ formatDate(booking.preferredDate) }}</span>
          </div>

          <div v-if="booking.gotra" class="detail-item">
            <span class="detail-label">Gotra for Sankalpa</span>
            <span class="detail-val">{{ booking.gotra }}</span>
          </div>

          <div v-if="booking.pujaPrice" class="detail-item">
            <span class="detail-label">Dakshina / Charges</span>
            <span class="detail-val">BDT {{ booking.pujaPrice.toLocaleString() }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Request Date</span>
            <span class="detail-val">{{ new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
          </div>
        </div>

        <!-- Devotee note -->
        <div v-if="booking.note" class="note-box">
          <span class="note-label">Devotee Prayer Intention:</span>
          <p class="note-text">"{{ booking.note }}"</p>
        </div>

        <!-- Admin / Temple Note -->
        <div v-if="booking.adminNote" class="admin-note-box">
          <span class="admin-note-label">Temple Office Message:</span>
          <p class="admin-note-text">{{ booking.adminNote }}</p>
        </div>

        <!-- Action Links -->
        <div class="card-footer-actions">
          <NuxtLink to="/puja-booking" class="btn-primary-action">
            Book Another Puja
          </NuxtLink>
          <NuxtLink to="/puja-and-rituals" class="btn-secondary-action">
            View All Rituals
          </NuxtLink>
          <NuxtLink to="/contact" class="btn-secondary-action">
            Need Help?
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ----------------------------------------------------
   BOOKING STATUS PAGE STYLING
   Minimal, calm, readable, and consistent.
   ---------------------------------------------------- */
.status-page {
  width: 100%;
  min-height: 85vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding-top: calc(var(--nav-height, 72px) + 2rem);
  padding-bottom: 5rem;
}

.page-hero {
  padding: 2.5rem 1.5rem 2rem;
  text-align: center;
}

.hero-inner {
  max-width: 720px;
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
  background-color: rgba(230, 179, 74, 0.08);
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
  max-width: 620px;
}

.hero-divider {
  width: 56px;
  height: 2px;
  background: var(--accent);
  margin: 2rem auto 0;
  opacity: 0.75;
}

.page-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 0;
}

/* ====================================================
   SUCCESS BANNER
   ==================================================== */
.success-banner {
  background-color: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.success-heading {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: #047857;
  margin: 0 0 0.35rem;
}

.success-sub {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

/* ====================================================
   LOOKUP INPUT CARD
   ==================================================== */
.lookup-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 2rem;
}

.lookup-label {
  display: block;
  font-size: 0.825rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.65rem;
}

.lookup-input-wrap {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 560px) {
  .lookup-input-wrap {
    flex-direction: column;
  }
}

.lookup-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.08em;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  text-transform: uppercase;
}

.lookup-input:focus {
  outline: none;
  border-color: var(--accent);
}

.btn-lookup {
  padding: 0.75rem 1.4rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--btn-primary-text);
  background-color: var(--btn-primary-bg);
  border: 1px solid var(--btn-primary-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.btn-lookup:hover:not(:disabled) {
  background-color: var(--btn-primary-hover);
  border-color: var(--btn-primary-hover);
}

.lookup-hint {
  font-size: 0.825rem;
  color: var(--text-muted);
  margin: 0.75rem 0 0;
  line-height: 1.4;
}

/* ====================================================
   MULTIPLE BOOKINGS CARD (FOR PHONE LOOKUPS)
   ==================================================== */
.multiple-bookings-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 2rem;
}

.multiple-header {
  margin-bottom: 1rem;
}

.multiple-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-text);
  background-color: rgba(224, 165, 38, 0.12);
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  margin-bottom: 0.35rem;
}

.multiple-sub {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.multiple-pills-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.multiple-pill-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.15rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  text-align: left;
}

.multiple-pill-btn:hover {
  border-color: var(--accent);
  background-color: var(--bg-card);
}

.multiple-pill-btn.pill-selected {
  border-color: var(--accent);
  background-color: rgba(224, 165, 38, 0.08);
  font-weight: 600;
}

.pill-ref {
  font-family: monospace;
  font-weight: 700;
  color: var(--accent-text);
  font-size: 0.9rem;
}

.pill-name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
}

.pill-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pill-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .multiple-pill-btn {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
}

/* ====================================================
   BOOKING DETAILS RESULT CARD
   ==================================================== */
.booking-result-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 2.5rem 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
}

@media (max-width: 640px) {
  .booking-result-card {
    padding: 1.75rem 1.25rem;
  }
}

.card-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.ref-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ref-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.ref-code-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.ref-code {
  font-family: monospace;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--heading-color);
}

.btn-copy {
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-copy:hover {
  background-color: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}

.status-badge {
  display: inline-block;
  padding: 0.45rem 1rem;
  font-size: 0.825rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  border-radius: 9999px;
  text-transform: uppercase;
}

.status-new {
  background-color: rgba(245, 158, 11, 0.12);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.status-confirmed {
  background-color: rgba(16, 185, 129, 0.12);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.status-completed {
  background-color: rgba(110, 5, 22, 0.08);
  color: var(--accent-text);
  border: 1px solid var(--border-color);
}

.status-cancelled {
  background-color: rgba(107, 114, 128, 0.12);
  color: #4b5563;
  border: 1px solid rgba(107, 114, 128, 0.35);
}

.card-details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

@media (min-width: 560px) {
  .card-details-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.775rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-val {
  font-size: 1.05rem;
  color: var(--text-primary);
}

.note-box {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.note-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.25rem;
}

.note-text {
  font-size: 0.925rem;
  font-style: italic;
  color: var(--text-secondary);
  margin: 0;
}

.admin-note-box {
  background-color: rgba(224, 165, 38, 0.08);
  border: 1px solid rgba(224, 165, 38, 0.35);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
}

.admin-note-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-text);
  display: block;
  margin-bottom: 0.25rem;
}

.admin-note-text {
  font-size: 0.925rem;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.5;
}

.card-footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-subtle);
}

.btn-primary-action {
  padding: 0.75rem 1.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--btn-primary-text);
  background-color: var(--btn-primary-bg);
  border: 1px solid var(--btn-primary-bg);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.15s ease;
  display: inline-block;
  text-align: center;
}

.btn-primary-action:hover {
  background-color: var(--btn-primary-hover);
  border-color: var(--btn-primary-hover);
}

.btn-secondary-action {
  padding: 0.75rem 1.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.15s ease;
  display: inline-block;
  text-align: center;
}

.btn-secondary-action:hover {
  background-color: var(--accent);
  border-color: var(--accent);
  color: var(--btn-primary-text);
}

.initial-guidance-card,
.lookup-error-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 2.5rem 2rem;
  text-align: center;
}

.guidance-title,
.error-heading {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.error-heading {
  color: #b91c1c;
}

.guidance-text,
.error-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 520px;
  margin: 0 auto 1.5rem;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.status-loading {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(224, 165, 38, 0.2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
