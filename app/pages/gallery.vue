<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

useHead({
  title: "Temple Photo Gallery & Sacred Darshan",
  meta: [
    {
      name: "description",
      content:
        "Sacred visual archive of Golpahar Mohashoshan Kali Mandir in Chittagong, Bangladesh. Consecrated deities, sanctum shrines, Maha Aarti, and holy festivals.",
    },
    { property: "og:title", content: "Sacred Darshan & Temple Gallery - Golpahar Kali Mandir" },
    {
      property: "og:description",
      content:
        "Explore sacred photographs of Maa Bhavatarini Kali, Lord Shiva, sanctum altars, and festive darshans at Golpahar Mohashoshan Kali Mandir.",
    },
  ],
});

interface GalleryItem {
  id: number;
  title: string;
  category: "deities" | "sanctums" | "festivals" | "heritage";
  categoryLabel: string;
  image: string;
  caption: string;
  dateOrTithi: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Maa Bhavatarini Kali Sanctum",
    category: "deities",
    categoryLabel: "Presiding Deities",
    image: "/images/optimized/kali.jpg",
    caption:
      "The sanctified eternal Mother Kali, dispelling fear, granting unconditional protection, and blessing all devout pilgrims on the sacred Golpahar hill.",
    dateOrTithi: "Daily Darshan",
  },
  {
    id: 2,
    title: "Lord Mahadeva Shiva Altar",
    category: "deities",
    categoryLabel: "Presiding Deities",
    image: "/images/optimized/shiva.jpg",
    caption:
      "Auspicious Shiva Lingam shrine where holy milk, bel leaves, and sacred chants are offered during daily pradakshina and Maha Shivaratri.",
    dateOrTithi: "Somvar Vrata",
  },
  {
    id: 3,
    title: "Sri Sri Radha Krishna Shrine",
    category: "deities",
    categoryLabel: "Presiding Deities",
    image: "/images/optimized/krishna.jpg",
    caption:
      "The divine sanctum of love, devotion, and sacred kirtan, adorned with seasonal fresh flowers, fragrant sandalwood, and ornate silk vastra.",
    dateOrTithi: "Ekadashi Seva",
  },
  {
    id: 4,
    title: "Lord Vighnaharta Ganesha",
    category: "deities",
    categoryLabel: "Presiding Deities",
    image: "/images/optimized/ganesha.jpg",
    caption:
      "Bestower of intellect, auspicious beginnings, and remover of spiritual obstacles, worshipped reverently before all temple pujas.",
    dateOrTithi: "Sankashti Chaturthi",
  },
  {
    id: 5,
    title: "Maa Mahalakshmi Sanctum",
    category: "deities",
    categoryLabel: "Presiding Deities",
    image: "/images/optimized/lakshmi.jpg",
    caption:
      "The divine bestower of prosperity, inner peace, and sacred fortune, invoked during annual Kojagari Lakshmi Puja and Deepavali rites.",
    dateOrTithi: "Kojagari Purnima",
  },
  {
    id: 6,
    title: "Evening Maha Deepam Aarti",
    category: "festivals",
    categoryLabel: "Festivals & Aarti",
    image: "/images/deities/kali.jpg",
    caption:
      "The daily 7:00 PM sunset aarti offering accompanied by traditional dhak drums, temple bells, conch shells, and five-wick camphor lamps.",
    dateOrTithi: "Daily 7:00 PM",
  },
  {
    id: 7,
    title: "Holy Mahashoshan Peeth Altar",
    category: "heritage",
    categoryLabel: "Heritage & Shoshan",
    image: "/images/deities/shiva.jpg",
    caption:
      "Centuries of transcendental stillness and spiritual transformation on the hill, where mortal reality meets eternal divine Mother grace.",
    dateOrTithi: "Sacred Peeth",
  },
  {
    id: 8,
    title: "Kartika Purnima & Annakut Utsav",
    category: "festivals",
    categoryLabel: "Festivals & Aarti",
    image: "/images/deities/krishna.jpg",
    caption:
      "Annual congregation where hundreds of sacred bhog preparations and thousands of earthen dipams illuminate the hill complex.",
    dateOrTithi: "Kartika Shukla Purnima",
  },
  {
    id: 9,
    title: "Inner Sanctum Garbhagriha Entrance",
    category: "sanctums",
    categoryLabel: "Sanctums & Shrines",
    image: "/images/deities/ganesha.jpg",
    caption:
      "Traditional brass-adorned threshold leading into the primary shrine, maintained with utmost canonical sanctity by the sevayats.",
    dateOrTithi: "Morning Darshan",
  },
  {
    id: 10,
    title: "Morning Mangala Aarti Rites",
    category: "festivals",
    categoryLabel: "Festivals & Aarti",
    image: "/images/deities/lakshmi.jpg",
    caption:
      "Devotees gathered for the 6:30 AM awakening rites, fresh red hibiscus offerings, and devotional hymns to the Divine Mother.",
    dateOrTithi: "Morning 6:30 AM",
  },
  {
    id: 11,
    title: "Historic Banyan Tree Shivalaya",
    category: "heritage",
    categoryLabel: "Heritage & Shoshan",
    image: "/images/optimized/shiva.jpg",
    caption:
      "Ancient sacred banyan grove on the mandir premises where sadhus and generations of pilgrims have offered quiet prayers and meditation.",
    dateOrTithi: "Meditation Area",
  },
  {
    id: 12,
    title: "Sanctum Brass Deepam Illumination",
    category: "sanctums",
    categoryLabel: "Sanctums & Shrines",
    image: "/images/optimized/kali.jpg",
    caption:
      "Continuous sacred oil lamps burning at the feet of Maa Kali, symbolizing the eternal light of divine wisdom dispelling all darkness.",
    dateOrTithi: "Akhanda Deepam",
  },
];

// Active filter state
const activeCategory = ref<string>("all");

const filterCategories = [
  { value: "all", label: "All Photos", count: galleryItems.length },
  {
    value: "deities",
    label: "Presiding Deities",
    count: galleryItems.filter((i) => i.category === "deities").length,
  },
  {
    value: "sanctums",
    label: "Sanctums & Shrines",
    count: galleryItems.filter((i) => i.category === "sanctums").length,
  },
  {
    value: "festivals",
    label: "Festivals & Aarti",
    count: galleryItems.filter((i) => i.category === "festivals").length,
  },
  {
    value: "heritage",
    label: "Heritage & Shoshan",
    count: galleryItems.filter((i) => i.category === "heritage").length,
  },
];

const filteredItems = computed(() => {
  if (activeCategory.value === "all") {
    return galleryItems;
  }
  return galleryItems.filter((item) => item.category === activeCategory.value);
});

// Fullscreen Lightbox state
const activeLightboxIndex = ref<number | null>(null);

const activeLightboxItem = computed<GalleryItem | null>(() => {
  if (activeLightboxIndex.value === null) return null;
  return filteredItems.value[activeLightboxIndex.value] ?? null;
});

const openLightbox = (index: number) => {
  activeLightboxIndex.value = index;
};

const closeLightbox = () => {
  activeLightboxIndex.value = null;
};

const nextPhoto = () => {
  if (activeLightboxIndex.value === null) return;
  activeLightboxIndex.value = (activeLightboxIndex.value + 1) % filteredItems.value.length;
};

const prevPhoto = () => {
  if (activeLightboxIndex.value === null) return;
  activeLightboxIndex.value =
    (activeLightboxIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length;
};

// Keyboard listener for lightbox
const handleKeyDown = (e: KeyboardEvent) => {
  if (activeLightboxIndex.value === null) return;
  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowRight") {
    nextPhoto();
  } else if (e.key === "ArrowLeft") {
    prevPhoto();
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeyDown);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleKeyDown);
  }
});
</script>

<template>
  <div class="gallery-page">
    <div class="gallery-container">

      <!-- Hero Header -->
      <header class="gallery-hero">
        <div class="hero-inner">
          <div class="hero-badge">
            <span class="badge-dot" aria-hidden="true"></span>
            <span>SACRED VISUAL ARCHIVE</span>
          </div>

          <h1 class="hero-title">
            <span class="english-title">Sacred Darshan &amp; Temple Gallery</span>
          </h1>

          <p class="hero-subtitle">
            Experience the divine aura, consecrated sanctums, festive celebrations, and historical spiritual heritage of Golpahar Mohashoshan Kali Mandir.
          </p>

          <div class="hero-quick-status">
            <span class="status-indicator" aria-hidden="true"></span>
            <span>12 Consecrated Photographs</span>
            <span class="status-divider">•</span>
            <span>Golpahar, Chittagong, Bangladesh</span>
          </div>

          <div class="hero-divider" aria-hidden="true"></div>
        </div>
      </header>

      <!-- Category Filter Tabs -->
      <div class="filter-bar" role="tablist" aria-label="Filter Gallery Categories">
        <button
          v-for="cat in filterCategories"
          :key="cat.value"
          type="button"
          role="tab"
          class="filter-tab-btn"
          :class="{ 'tab-active': activeCategory === cat.value }"
          :aria-selected="activeCategory === cat.value"
          @click="activeCategory = cat.value"
        >
          <span>{{ cat.label }}</span>
          <span class="tab-count">({{ cat.count }})</span>
        </button>
      </div>

      <!-- Gallery Grid -->
      <section class="gallery-grid-section" aria-label="Temple Photographs Grid">
        <div class="gallery-grid">
          <article
            v-for="(item, idx) in filteredItems"
            :key="item.id"
            class="gallery-card"
            @click="openLightbox(idx)"
          >
            <!-- Card Media -->
            <div class="card-media">
              <img
                :src="item.image"
                :alt="item.title"
                class="gallery-img"
                loading="lazy"
              />
              <div class="media-overlay" aria-hidden="true">
                <span class="view-darshan-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="zoom-icon">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  <span>Expand Darshan</span>
                </span>
              </div>

              <!-- Top Category Tag -->
              <span class="card-cat-tag">{{ item.categoryLabel }}</span>
            </div>

            <!-- Card Content Body -->
            <div class="card-body">
              <div class="card-meta-row">
                <span class="item-tithi">{{ item.dateOrTithi }}</span>
              </div>

              <h2 class="item-title">{{ item.title }}</h2>
              <p class="item-caption">{{ item.caption }}</p>

              <div class="card-action-row">
                <button
                  type="button"
                  class="btn-view-photo"
                  :aria-label="`Open ${item.title} full view`"
                >
                  <span>View Full Photo</span>
                  <span class="arrow-glyph">&rarr;</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Fullscreen Lightbox Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="activeLightboxItem"
          class="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          :aria-label="activeLightboxItem.title"
          @click.self="closeLightbox"
        >
          <div class="lightbox-dialog">
            <!-- Close Button -->
            <button
              type="button"
              class="lightbox-close-btn"
              aria-label="Close Lightbox"
              @click="closeLightbox"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <!-- Navigation: Previous -->
            <button
              type="button"
              class="lightbox-nav-btn prev"
              aria-label="Previous image"
              @click="prevPhoto"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <!-- Main Media Viewport -->
            <div class="lightbox-content">
              <div class="lightbox-image-box">
                <img
                  :src="activeLightboxItem.image"
                  :alt="activeLightboxItem.title"
                  class="lightbox-full-img"
                />
              </div>

              <!-- Caption Drawer -->
              <div class="lightbox-caption-bar">
                <div class="caption-text-block">
                  <div class="caption-header-row">
                    <span class="caption-tag">{{ activeLightboxItem.categoryLabel }}</span>
                    <span class="caption-counter">
                      {{ (activeLightboxIndex ?? 0) + 1 }} / {{ filteredItems.length }}
                    </span>
                  </div>
                  <h3 class="caption-title">{{ activeLightboxItem.title }}</h3>
                  <p class="caption-desc">{{ activeLightboxItem.caption }}</p>
                </div>
              </div>
            </div>

            <!-- Navigation: Next -->
            <button
              type="button"
              class="lightbox-nav-btn next"
              aria-label="Next image"
              @click="nextPhoto"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* --------------------------------------------------------------------------
   GALLERY PAGE STYLES
   Harmonious with Light Palette A and Dark Slate Mode
-------------------------------------------------------------------------- */
.gallery-page {
  width: 100%;
  min-height: 85vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding-top: calc(var(--nav-height, 72px) + 2rem);
  padding-bottom: 5rem;
}

.gallery-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
}

/* Breadcrumbs */
.breadcrumb-nav {
  padding: 0.5rem 0 1rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.breadcrumb-link {
  color: var(--accent-text);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.15s ease;
}

.breadcrumb-link:hover {
  text-decoration: underline;
  opacity: 0.85;
}

.breadcrumb-separator {
  color: var(--border-color);
  opacity: 0.6;
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 500;
}

/* Hero Header */
.gallery-hero {
  padding: 2rem 1rem 2.5rem;
  text-align: center;
}

.hero-inner {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.95rem;
  background-color: rgba(110, 5, 22, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--accent-text);
  margin-bottom: 1.25rem;
}

html[data-theme="dark"] .hero-badge,
html.dark .hero-badge {
  background-color: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.25);
  color: var(--accent-gold);
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--accent);
}

.hero-title {
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.bengali-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-text);
  letter-spacing: 0.02em;
}

.english-title {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: clamp(2.2rem, 4.2vw, 3.4rem);
  font-weight: 800;
  color: var(--heading-color);
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.hero-subtitle {
  font-size: clamp(1rem, 1.8vw, 1.125rem);
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0 auto 1.75rem;
  max-width: 650px;
}

.hero-quick-status {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.55rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.status-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: var(--color-live, #16a34a);
  display: inline-block;
  margin-right: 0.35rem;
}

.status-divider {
  color: var(--border-color);
}

.hero-divider {
  width: 56px;
  height: 2px;
  background: var(--accent);
  margin: 2rem auto 0;
  opacity: 0.75;
}

/* Category Filter Tabs */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  margin: 1rem 0 3rem;
}

.filter-tab-btn {
  padding: 0.55rem 1.15rem;
  font-size: 0.825rem;
  font-weight: 600;
  border-radius: 9999px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.filter-tab-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.tab-active {
  background-color: var(--btn-primary-bg) !important;
  color: var(--btn-primary-text) !important;
  border-color: var(--btn-primary-bg) !important;
}

.tab-count {
  font-size: 0.75rem;
  opacity: 0.85;
}

/* Gallery Grid Section */
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 4rem;
}

@media (min-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.75rem;
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

/* Gallery Card */
.gallery-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  cursor: pointer;
}

.gallery-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.08);
}

html[data-theme="dark"] .gallery-card:hover,
html.dark .gallery-card:hover {
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.4);
}

.card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.05);
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  transition: transform 0.4s ease;
  display: block;
}

.gallery-card:hover .gallery-img {
  transform: scale(1.05);
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, transparent 60%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.gallery-card:hover .media-overlay {
  opacity: 1;
}

.view-darshan-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.65);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.zoom-icon {
  width: 14px;
  height: 14px;
}

.card-cat-tag {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.25rem 0.65rem;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

/* Card Body */
.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.item-subtitle-bn {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-text);
  letter-spacing: 0.02em;
}

.item-tithi {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
}

.item-title {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 0.6rem;
  line-height: 1.25;
}

.item-caption {
  font-size: 0.885rem;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
  flex: 1;
}

.card-action-row {
  padding-top: 0.85rem;
  border-top: 1px solid var(--border-subtle);
}

.btn-view-photo {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--accent-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: gap 0.2s ease;
  font-family: inherit;
}

.gallery-card:hover .btn-view-photo {
  gap: 0.6rem;
}

.arrow-glyph {
  font-size: 1rem;
}

/* Visitation Bottom Banner */
.visitation-banner {
  margin-top: 2rem;
}

.visitation-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

@media (min-width: 860px) {
  .visitation-card {
    flex-direction: row;
    justify-content: space-between;
    padding: 3rem 2.5rem;
  }
}

.visitation-text {
  max-width: 680px;
}

.visitation-kicker {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-text);
  display: block;
  margin-bottom: 0.5rem;
}

.visitation-title {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: clamp(1.4rem, 2.2vw, 1.85rem);
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 0.75rem;
  line-height: 1.25;
}

.visitation-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.visitation-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 600px) {
  .visitation-actions {
    flex-direction: row;
    width: auto;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.6rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-primary-action {
  color: var(--btn-primary-text);
  background-color: var(--btn-primary-bg);
  border: 1px solid var(--btn-primary-bg);
}

.btn-primary-action:hover {
  background-color: var(--btn-primary-hover);
  border-color: var(--btn-primary-hover);
  transform: translateY(-1px);
}

.action-btn-icon {
  width: 16px;
  height: 16px;
}

.btn-secondary-action {
  color: var(--text-primary);
  background-color: transparent;
  border: 1px solid var(--border-color);
}

.btn-secondary-action:hover {
  background-color: var(--accent);
  border-color: var(--accent);
  color: var(--btn-primary-text);
  transform: translateY(-1px);
}

/* Lightbox Modal */
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(10, 8, 12, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.lightbox-dialog {
  position: relative;
  max-width: 1080px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}

.lightbox-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lightbox-close-btn:hover {
  background: var(--accent);
  color: var(--btn-primary-text);
  transform: scale(1.08);
}

.lightbox-close-btn svg {
  width: 20px;
  height: 20px;
}

.lightbox-nav-btn {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  z-index: 20;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lightbox-nav-btn.prev {
  left: 1rem;
}

.lightbox-nav-btn.next {
  right: 1rem;
}

.lightbox-nav-btn:hover {
  background: var(--accent);
  color: var(--btn-primary-text);
  transform: translateY(-50%) scale(1.08);
}

.lightbox-nav-btn svg {
  width: 22px;
  height: 22px;
}

.lightbox-content {
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  overflow-y: auto;
}

.lightbox-image-box {
  position: relative;
  width: 100%;
  max-height: 60vh;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lightbox-full-img {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  display: block;
}

.lightbox-caption-bar {
  padding: 1.5rem 2rem;
  background-color: var(--bg-card);
}

.caption-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.caption-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-text);
}

.caption-counter {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.caption-title {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--heading-color);
  margin: 0 0 0.2rem;
}

.caption-subtitle-bn {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent-text);
  margin: 0 0 0.65rem;
}

.caption-desc {
  font-size: 0.925rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

/* Modal Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
