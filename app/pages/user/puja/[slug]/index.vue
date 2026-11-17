<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";

const route = useRoute();
const slug = route.params.slug as string;

useHead({
  title: "Puja Details - Devotee Portal",
});

interface PujaDetailData {
  puja: {
    slug: string;
    name: { en: string; bn: string };
    shortDescription?: { en: string; bn: string };
    description: { en: string; bn: string };
    significance?: { en: string; bn: string };
    requirements?: { en: string; bn: string };
    offered?: { en: string; bn: string };
    priceBdt: number;
    duration?: string;
    image?: string;
  };
  addons: Array<{
    id: string;
    name: { en: string; bn: string };
    description?: { en: string; bn: string };
    priceBdt: number;
  }>;
  timeSlots: Array<{
    id: string;
    name: { en: string; bn: string };
    startTime: string;
    endTime: string;
    capacity: number;
  }>;
}

const data = ref<PujaDetailData | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

const fetchDetail = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<PujaDetailData>(`/api/public/pujas/${slug}`);
    if (res) {
      data.value = res;
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || "Puja details could not be loaded.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <UserPortalShell
    :title="data?.puja?.name?.en || 'Puja Details'"
    :subtitle="data?.puja?.name?.bn || 'Sacred temple ritual details and offerings'"
  >
    <div v-if="data" class="puja-detail-page">
      <!-- Breadcrumb / Back Navigation -->
      <div class="breadcrumb-row">
        <NuxtLink to="/user/puja" class="back-link">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          <span>All Puja Services</span>
        </NuxtLink>
      </div>

      <!-- Main Layout -->
      <div class="detail-layout">
        <!-- Left: Image & Fast Booking Sticky Card -->
        <div class="detail-sidebar-col">
          <div class="portal-card booking-sticky-card">
            <div class="featured-img-wrap">
              <img
                :src="data.puja.image || '/images/deities/kali.webp'"
                :alt="data.puja.name.en"
                class="puja-hero-img"
              />
            </div>

            <div class="sticky-body">
              <div class="price-breakdown">
                <span class="price-label">Dakshina / Base Price</span>
                <span class="price-val">৳ {{ data.puja.priceBdt.toLocaleString() }}</span>
              </div>

              <div class="meta-pills-list">
                <div v-if="data.puja.duration" class="meta-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Duration: {{ data.puja.duration }}</span>
                </div>
                <div class="meta-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Performed by Mandir Priests</span>
                </div>
              </div>

              <NuxtLink :to="`/user/puja/${slug}/book`" class="btn-book-now">
                <span>Book This Puja</span>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Right: Comprehensive Descriptions & Addons -->
        <div class="detail-main-col">
          <!-- Description Card -->
          <section class="portal-card content-card">
            <h2 class="content-title">About the Ritual</h2>
            <p class="content-paragraph">
              {{ data.puja.description.en }}
            </p>
            <p v-if="data.puja.description.bn" class="content-paragraph bengali-text">
              {{ data.puja.description.bn }}
            </p>

            <!-- Religious Significance -->
            <div v-if="data.puja.significance?.en" class="significance-box">
              <h3 class="box-heading">Religious Significance</h3>
              <p class="box-text">{{ data.puja.significance.en }}</p>
              <p v-if="data.puja.significance.bn" class="box-text bengali-text">
                {{ data.puja.significance.bn }}
              </p>
            </div>

            <!-- Offerings & Samagri Included -->
            <div v-if="data.puja.offered?.en" class="samagri-box">
              <h3 class="box-heading">Samagri & Offerings Included</h3>
              <p class="box-text">{{ data.puja.offered.en }}</p>
            </div>

            <!-- Requirements / Instructions -->
            <div v-if="data.puja.requirements?.en" class="requirements-box">
              <h3 class="box-heading">Instructions for Devotees</h3>
              <p class="box-text">{{ data.puja.requirements.en }}</p>
            </div>
          </section>

          <!-- Available Additional Offerings Card -->
          <section v-if="data.addons.length > 0" class="portal-card content-card">
            <h3 class="content-title">Available Additional Offerings</h3>
            <p class="content-sub">
              You can choose optional offerings during the booking process to enrich your sankalpa.
            </p>

            <div class="addons-preview-grid">
              <div v-for="addon in data.addons" :key="addon.id" class="addon-preview-item">
                <div class="addon-preview-left">
                  <span class="addon-preview-name">{{ addon.name.en }}</span>
                  <span v-if="addon.description?.en" class="addon-preview-desc">
                    {{ addon.description.en }}
                  </span>
                </div>
                <span class="addon-preview-price">+ ৳ {{ addon.priceBdt }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.puja-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.breadcrumb-row {
  display: flex;
  align-items: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  color: #7F1D2D;
  text-decoration: none;
}

.back-link svg {
  width: 16px;
  height: 16px;
}

.back-link:hover {
  text-decoration: underline;
}

.detail-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 28px;
  align-items: start;
}

.portal-card {
  background-color: #FFFFFF;
  border-radius: 14px;
  border: 1px solid rgba(120, 113, 108, 0.18);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
}

/* Sticky Card */
.booking-sticky-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 96px;
}

.featured-img-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
  background-color: #FAF7F0;
  overflow: hidden;
}

.puja-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sticky-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.price-breakdown {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid rgba(120, 113, 108, 0.12);
  padding-bottom: 12px;
}

.price-label {
  font-size: 0.8rem;
  color: #78716C;
  font-weight: 600;
}

.price-val {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 1.4rem;
  font-weight: 800;
  color: #7F1D2D;
}

.meta-pills-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #292524;
}

.meta-pill svg {
  width: 16px;
  height: 16px;
  color: #D97706;
  flex-shrink: 0;
}

.btn-book-now {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 46px;
  border-radius: 8px;
  background-color: #7F1D2D;
  color: #FFFFFF;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.btn-book-now svg {
  width: 16px;
  height: 16px;
}

.btn-book-now:hover {
  background-color: #6E0516;
}

/* Right Content Column */
.detail-main-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-title {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0;
}

.content-sub {
  font-size: 0.82rem;
  color: #78716C;
  margin: -8px 0 6px 0;
}

.content-paragraph {
  font-size: 0.92rem;
  color: #292524;
  line-height: 1.6;
  margin: 0;
}

.bengali-text {
  font-family: "Noto Sans Bengali", system-ui, sans-serif;
  color: #44403C;
}

.significance-box,
.samagri-box,
.requirements-box {
  padding: 16px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.significance-box {
  background-color: #FEF3C7;
  border-left: 4px solid #D97706;
}

.samagri-box {
  background-color: #FAF7F0;
  border-left: 4px solid #7F1D2D;
}

.requirements-box {
  background-color: #F5F3FF;
  border-left: 4px solid #7C3AED;
}

.box-heading {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
  color: #292524;
}

.box-text {
  font-size: 0.86rem;
  color: #44403C;
  line-height: 1.5;
  margin: 0;
}

/* Addons Preview */
.addons-preview-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.addon-preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.15);
  border-radius: 8px;
}

.addon-preview-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.addon-preview-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #292524;
}

.addon-preview-desc {
  font-size: 0.78rem;
  color: #78716C;
}

.addon-preview-price {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.88rem;
  font-weight: 700;
  color: #7F1D2D;
}

@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .booking-sticky-card {
    position: static;
  }
}
</style>
