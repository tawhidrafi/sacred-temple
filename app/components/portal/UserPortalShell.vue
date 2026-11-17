<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
  }>(),
  {
    title: "Devotee Portal",
    subtitle: "",
  }
);

const route = useRoute();
const router = useRouter();
const { currentUser, isAuthenticated, isPending, logout } = useAuth();

// Mobile sidebar drawer state
const isMobileOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileOpen.value = !isMobileOpen.value;
};

const closeMobileMenu = () => {
  isMobileOpen.value = false;
};

// Route protection: /user/** requires login
watchEffect(() => {
  if (isPending.value) return;
  if (!isAuthenticated.value) {
    router.replace(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
  }
});

// Current date formatted
const todayFormatted = computed(() => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
});

// Sidebar navigation sections strictly matching specification
const navSections = [
  {
    heading: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/user/dashboard",
        icon: "dashboard",
      },
    ],
  },
  {
    heading: "My Account",
    items: [
      {
        label: "My Profile",
        path: "/user/profile",
        icon: "user",
      },
    ],
  },
  {
    heading: "Puja & Ritual Services",
    items: [
      {
        label: "Browse Puja Services",
        path: "/user/puja",
        icon: "puja",
      },
      {
        label: "My Puja Bookings",
        path: "/user/puja-bookings",
        icon: "calendar",
      },
    ],
  },
  {
    heading: "Donations",
    items: [
      {
        label: "My Donations",
        path: "/user/donations",
        icon: "history",
      },
      {
        label: "Make a Donation",
        path: "/user/donations/create",
        icon: "heart",
      },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        label: "Change Password",
        path: "/user/change-password",
        icon: "key",
      },
    ],
  },
];

const handleLogout = async () => {
  await logout("/login");
};
</script>

<template>
  <div class="user-portal-root">
    <!-- Mobile Backdrop -->
    <div
      v-if="isMobileOpen"
      class="portal-backdrop"
      @click="closeMobileMenu"
      aria-hidden="true"
    />

    <!-- Sidebar Navigation -->
    <aside class="portal-sidebar" :class="{ 'is-mobile-open': isMobileOpen }">
      <!-- Sidebar Brand Header -->
      <div class="sidebar-header">
        <NuxtLink to="/" class="sidebar-brand" @click="closeMobileMenu">
          <div class="brand-crest">
            <svg viewBox="0 0 24 24" fill="none" class="crest-svg">
              <path d="M12 2L15 7H9L12 2Z" fill="#D97706" />
              <path d="M7 8H17L18 13H6L7 8Z" fill="#7F1D2D" />
              <path d="M4 14H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V14Z" fill="#D97706" />
              <circle cx="12" cy="17" r="2" fill="#FAF7F0" />
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">Golpahar Mandir</span>
            <span class="brand-sub">Devotee Portal</span>
          </div>
        </NuxtLink>

        <!-- Close button on mobile -->
        <button
          type="button"
          class="mobile-close-btn"
          @click="closeMobileMenu"
          aria-label="Close navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div v-for="section in navSections" :key="section.heading" class="nav-section">
          <span class="section-heading">{{ section.heading }}</span>
          <ul class="nav-list">
            <li v-for="item in section.items" :key="item.path">
              <NuxtLink
                :to="item.path"
                class="nav-link"
                :class="{ 'is-active': route.path === item.path || (item.path !== '/user/dashboard' && route.path.startsWith(item.path)) }"
                @click="closeMobileMenu"
              >
                <!-- Dashboard Icon -->
                <svg v-if="item.icon === 'dashboard'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <!-- User Icon -->
                <svg v-else-if="item.icon === 'user'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <!-- Puja Icon -->
                <svg v-else-if="item.icon === 'puja'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3 5H9l3-5z" />
                  <path d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" />
                  <line x1="12" y1="14" x2="12" y2="18" />
                </svg>
                <!-- Calendar Icon -->
                <svg v-else-if="item.icon === 'calendar'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <!-- History Icon -->
                <svg v-else-if="item.icon === 'history'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <!-- Heart / Donation Icon -->
                <svg v-else-if="item.icon === 'heart'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <!-- Key Icon -->
                <svg v-else-if="item.icon === 'key'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l-2-2-4 4a6.5 6.5 0 1 0 9 9l5-5V2z" />
                </svg>

                <span class="nav-text">{{ item.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Sidebar Footer (Profile + Logout) -->
      <div class="sidebar-footer">
        <div class="user-preview">
          <div class="user-avatar">
            <img
              v-if="currentUser?.image"
              :src="currentUser.image"
              :alt="currentUser?.name || 'Devotee'"
            />
            <span v-else class="avatar-initials">
              {{ (currentUser?.name || 'D').charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="user-meta">
            <span class="user-name">{{ currentUser?.name || 'Devotee' }}</span>
            <span class="user-email">{{ currentUser?.email || 'devotee@mandir.org' }}</span>
          </div>
        </div>

        <button type="button" class="sidebar-logout-btn" @click="handleLogout" title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Wrapper -->
    <div class="portal-main-area">
      <!-- Portal Top Header -->
      <header class="portal-topbar">
        <div class="topbar-left">
          <!-- Mobile Hamburger -->
          <button
            type="button"
            class="mobile-hamburger-btn"
            @click="toggleMobileMenu"
            aria-label="Toggle navigation menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div class="topbar-titles">
            <h1 class="topbar-page-title">{{ title }}</h1>
            <p v-if="subtitle" class="topbar-page-subtitle">{{ subtitle }}</p>
          </div>
        </div>

        <div class="topbar-right">
          <span class="date-badge" :title="todayFormatted">
            <svg class="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{{ todayFormatted }}</span>
          </span>

          <NuxtLink to="/" class="exit-portal-link" title="Return to Temple Website">
            <span>Mandir Home</span>
            <svg viewBox="0 0 20 20" fill="currentColor" class="exit-icon">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
        </div>
      </header>

      <!-- Portal Page Content Slot -->
      <main class="portal-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* --------------------------------------------------------------------------
   DEVOTEE PORTAL STYLING (LOCKED LIGHT THEME - TEMPLE PALETTE)
   Palette A: Sindoor & Gold on Warm Cream
   -------------------------------------------------------------------------- */
.user-portal-root {
  --portal-bg: #FAF7F0;
  --portal-surface: #FFFFFF;
  --portal-surface-alt: #FFFDF8;
  --portal-maroon: #7F1D2D;
  --portal-maroon-dark: #6E0516;
  --portal-gold: #D97706;
  --portal-gold-light: #F59E0B;
  --portal-gold-soft: rgba(217, 119, 6, 0.12);
  --portal-charcoal: #292524;
  --portal-muted: #78716C;
  --portal-border: rgba(120, 113, 108, 0.18);
  --portal-sidebar-width: 270px;

  display: flex;
  min-height: 100vh;
  background-color: var(--portal-bg);
  color: var(--portal-charcoal);
  font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
  position: relative;
}

/* Sidebar */
.portal-sidebar {
  width: var(--portal-sidebar-width);
  background-color: #FFFFFF;
  border-right: 1px solid var(--portal-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  transition: transform 0.25s ease-in-out;
}

.sidebar-header {
  height: 72px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--portal-border);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.brand-crest {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background-color: #FEF3C7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.crest-svg {
  width: 24px;
  height: 24px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: "Cinzel", Georgia, serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--portal-maroon);
  line-height: 1.2;
}

.brand-sub {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--portal-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mobile-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--portal-muted);
  cursor: pointer;
  padding: 6px;
}

.mobile-close-btn svg {
  width: 20px;
  height: 20px;
}

/* Nav links */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-heading {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--portal-muted);
  padding: 0 10px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 8px;
  color: var(--portal-charcoal);
  font-size: 0.88rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
}

.nav-icon {
  width: 18px;
  height: 18px;
  color: var(--portal-muted);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.nav-link:hover {
  background-color: var(--portal-bg);
  color: var(--portal-maroon);
}

.nav-link:hover .nav-icon {
  color: var(--portal-gold);
}

.nav-link.is-active {
  background-color: #FEF3C7;
  color: var(--portal-maroon);
  font-weight: 600;
}

.nav-link.is-active .nav-icon {
  color: var(--portal-maroon);
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 14px 16px;
  border-top: 1px solid var(--portal-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #FAF7F0;
}

.user-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--portal-maroon);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--portal-charcoal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.7rem;
  color: var(--portal-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  border-radius: 6px;
  background-color: transparent;
  border: 1px solid var(--portal-border);
  color: #991B1B;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sidebar-logout-btn svg {
  width: 15px;
  height: 15px;
}

.sidebar-logout-btn:hover {
  background-color: #FEE2E2;
  border-color: #FECACA;
}

/* Main Area */
.portal-main-area {
  flex: 1;
  margin-left: var(--portal-sidebar-width);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Topbar */
.portal-topbar {
  height: 72px;
  background-color: #FFFFFF;
  border-bottom: 1px solid var(--portal-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-hamburger-btn {
  display: none;
  background: none;
  border: none;
  color: var(--portal-charcoal);
  cursor: pointer;
  padding: 6px;
}

.mobile-hamburger-btn svg {
  width: 22px;
  height: 22px;
}

.topbar-titles {
  display: flex;
  flex-direction: column;
}

.topbar-page-title {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--portal-maroon);
  margin: 0;
  line-height: 1.2;
}

.topbar-page-subtitle {
  font-size: 0.8rem;
  color: var(--portal-muted);
  margin: 2px 0 0 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #FAF7F0;
  border: 1px solid var(--portal-border);
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--portal-muted);
}

.date-icon {
  width: 14px;
  height: 14px;
  color: var(--portal-gold);
}

.exit-portal-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background-color: var(--portal-maroon);
  color: #FFFFFF;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.exit-portal-link:hover {
  background-color: #550210;
}

.exit-icon {
  width: 14px;
  height: 14px;
}

/* Content Area */
.portal-content {
  flex: 1;
  padding: 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* Mobile backdrop */
.portal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(41, 37, 36, 0.45);
  backdrop-filter: blur(2px);
  z-index: 45;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .portal-sidebar {
    transform: translateX(-100%);
  }

  .portal-sidebar.is-mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  }

  .mobile-close-btn {
    display: block;
  }

  .mobile-hamburger-btn {
    display: block;
  }

  .portal-main-area {
    margin-left: 0;
  }

  .portal-topbar {
    padding: 0 20px;
  }

  .portal-content {
    padding: 20px 16px;
  }

  .date-badge {
    display: none;
  }
}
</style>
