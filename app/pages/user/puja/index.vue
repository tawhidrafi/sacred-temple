<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";

useHead({
  title: "Puja Services Catalog - Devotee Portal",
});

interface PujaItem {
  id?: number;
  slug: string;
  name: { en: string; bn: string };
  shortDescription?: { en: string; bn: string };
  description: { en: string; bn: string };
  priceBdt: number;
  duration?: string;
  image?: string;
  bookable?: boolean;
}

const pujas = ref<PujaItem[]>([]);
const searchQuery = ref("");
const maxPriceFilter = ref<number | null>(null);
const isLoading = ref(true);

const fetchPujas = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<{ items: PujaItem[] }>("/api/public/pujas");
    if (res?.items) {
      pujas.value = res.items;
    }
  } catch (err) {
    console.warn("Could not load puja catalog:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPujas();
});

const filteredPujas = computed(() => {
  let list = pujas.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((p) => {
      const enName = (p.name?.en || "").toLowerCase();
      const bnName = (p.name?.bn || "").toLowerCase();
      const slug = (p.slug || "").toLowerCase();
      const desc = (p.shortDescription?.en || p.description?.en || "").toLowerCase();
      return enName.includes(q) || bnName.includes(q) || slug.includes(q) || desc.includes(q);
    });
  }

  if (maxPriceFilter.value !== null) {
    list = list.filter((p) => p.priceBdt <= maxPriceFilter.value!);
  }

  return list;
});
</script>

<template>
  <UserPortalShell
    title="Puja & Ritual Services"
    subtitle="Browse sacred pujas, archana offerings, and book ritual services online"
  >
    <div class="puja-catalog-page">
      <!-- Search & Filter Controls -->
      <div class="portal-card filter-card">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search by puja name, ritual, or significance..."
          />
        </div>

        <div class="filter-pills">
          <button
            type="button"
            class="filter-pill"
            :class="{ 'is-active': maxPriceFilter === null }"
            @click="maxPriceFilter = null"
          >
            All Pujas
          </button>
          <button
            type="button"
            class="filter-pill"
            :class="{ 'is-active': maxPriceFilter === 500 }"
            @click="maxPriceFilter = 500"
          >
            Under ৳ 500
          </button>
          <button
            type="button"
            class="filter-pill"
            :class="{ 'is-active': maxPriceFilter === 1000 }"
            @click="maxPriceFilter = 1000"
          >
            Under ৳ 1,000
          </button>
          <button
            type="button"
            class="filter-pill"
            :class="{ 'is-active': maxPriceFilter === 2000 }"
            @click="maxPriceFilter = 2000"
          >
            Special & Havan
          </button>
        </div>
      </div>

      <!-- Pujas Grid -->
      <div v-if="filteredPujas.length > 0" class="puja-cards-grid">
        <div v-for="puja in filteredPujas" :key="puja.slug" class="portal-card puja-card">
          <!-- Featured Image -->
          <div class="card-image-wrap">
            <img
              :src="puja.image || '/images/deities/kali.webp'"
              :alt="puja.name.en"
              class="card-img"
              loading="lazy"
            />
            <span class="price-tag">৳ {{ puja.priceBdt.toLocaleString() }}</span>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <div class="puja-titles">
              <h3 class="puja-name-en">{{ puja.name.en }}</h3>
              <span v-if="puja.name.bn" class="puja-name-bn">{{ puja.name.bn }}</span>
            </div>

            <p class="puja-short-desc">
              {{ puja.shortDescription?.en || puja.description.en }}
            </p>

            <div class="puja-meta-row">
              <span v-if="puja.duration" class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {{ puja.duration }}
              </span>
              <span class="meta-item availability-item">
                <span class="avail-dot" />
                Available Daily
              </span>
            </div>

            <!-- Card Actions -->
            <div class="card-actions">
              <NuxtLink :to="`/user/puja/${puja.slug}`" class="btn-view-details">
                Details
              </NuxtLink>
              <NuxtLink :to="`/user/puja/${puja.slug}/book`" class="btn-book-puja">
                Book This Puja
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="portal-card empty-catalog-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <h4 class="empty-title">No Pujas Match Your Search</h4>
        <p class="empty-desc">
          Try adjusting your search keywords or clearing the price filters to see all available temple rituals.
        </p>
        <button
          type="button"
          class="reset-filters-btn"
          @click="searchQuery = ''; maxPriceFilter = null;"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.puja-catalog-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.portal-card {
  background-color: #FFFFFF;
  border-radius: 14px;
  border: 1px solid rgba(120, 113, 108, 0.18);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
}

/* Filter Card */
.filter-card {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #A8A29E;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 14px 0 36px;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.25);
  border-radius: 8px;
  font-size: 0.86rem;
  color: #292524;
  outline: none;
}

.search-input:focus {
  border-color: #D97706;
  background-color: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}

.filter-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.2);
  color: #78716C;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill:hover {
  background-color: #FEF3C7;
  color: #92400E;
}

.filter-pill.is-active {
  background-color: #7F1D2D;
  color: #FFFFFF;
  border-color: #7F1D2D;
}

/* Grid */
.puja-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.puja-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.puja-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08);
}

.card-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #FAF7F0;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.puja-card:hover .card-img {
  transform: scale(1.03);
}

.price-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #7F1D2D;
  color: #FFFFFF;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.puja-titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.puja-name-en {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0;
  line-height: 1.3;
}

.puja-name-bn {
  font-size: 0.8rem;
  color: #D97706;
  font-weight: 600;
}

.puja-short-desc {
  font-size: 0.82rem;
  color: #78716C;
  line-height: 1.45;
  margin: 0 0 14px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.puja-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(120, 113, 108, 0.12);
  margin-bottom: 14px;
  font-size: 0.76rem;
  color: #78716C;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-item svg {
  width: 14px;
  height: 14px;
  color: #D97706;
}

.availability-item {
  color: #065F46;
  font-weight: 600;
}

.avail-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10B981;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 8px;
}

.btn-view-details {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.2);
  color: #292524;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-view-details:hover {
  background-color: #F5EFE0;
}

.btn-book-puja {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
  background-color: #7F1D2D;
  color: #FFFFFF;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.btn-book-puja:hover {
  background-color: #6E0516;
}

/* Empty State */
.empty-catalog-state {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  width: 44px;
  height: 44px;
  color: #D97706;
}

.empty-title {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #292524;
  margin: 0;
}

.empty-desc {
  font-size: 0.85rem;
  color: #78716C;
  max-width: 420px;
  margin: 0;
}

.reset-filters-btn {
  padding: 8px 18px;
  border-radius: 6px;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.25);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
}

@media (max-width: 1024px) {
  .puja-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .puja-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
