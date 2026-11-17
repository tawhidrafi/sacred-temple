<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";
import BookingStatusBadge from "~/components/portal/BookingStatusBadge.vue";
import PaymentStatusBadge from "~/components/portal/PaymentStatusBadge.vue";

useHead({
  title: "My Puja Bookings - Devotee Portal",
});

interface BookingMeta {
  bookingRef: string;
  timeSlot: string;
  address?: string | null;
  baseAmount: number;
  addonAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  transactionReference?: string | null;
  addons?: Array<{ id: string; name: string; priceBdt: number }>;
}

interface DevoteeBookingItem {
  id: number;
  ref: string;
  userId: string;
  pujaId?: number | null;
  pujaType: string;
  customPujaName?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  gotra?: string | null;
  preferredDate: string;
  specialInstructions?: string | null;
  note?: string | null;
  status: string;
  createdAt: number;
  updatedAt: number;
  meta?: BookingMeta | null;
}

const bookings = ref<DevoteeBookingItem[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

// Filters
const activeTab = ref<"all" | "upcoming" | "pending" | "completed" | "cancelled">("all");
const searchQuery = ref("");

const fetchBookings = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await $fetch<{ bookings: DevoteeBookingItem[] }>("/api/me/bookings");
    if (res?.bookings) {
      bookings.value = res.bookings;
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || "Could not load your puja bookings. Please refresh.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBookings();
});

const getPujaTitle = (item: DevoteeBookingItem): string => {
  if (item.customPujaName) {
    try {
      const parsed = JSON.parse(item.customPujaName);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed.en || parsed.bn || item.customPujaName;
      }
    } catch {
      return item.customPujaName;
    }
  }
  return "Temple Puja Ritual";
};

// Filtered Bookings
const filteredBookings = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const todayStr = new Date().toISOString().slice(0, 10);

  return bookings.value.filter((b) => {
    // 1. Tab filter
    if (activeTab.value === "upcoming") {
      const isFuture = b.preferredDate >= todayStr;
      const isNotCancelled = b.status !== "cancelled" && b.status !== "rejected";
      if (!isFuture || !isNotCancelled) return false;
    } else if (activeTab.value === "pending") {
      if (b.status !== "new" && b.status !== "pending") return false;
    } else if (activeTab.value === "completed") {
      if (b.status !== "completed") return false;
    } else if (activeTab.value === "cancelled") {
      if (b.status !== "cancelled" && b.status !== "rejected") return false;
    }

    // 2. Search query filter (reference code, puja title, or devotee name)
    if (query) {
      const title = getPujaTitle(b).toLowerCase();
      const refMatch = b.ref.toLowerCase().includes(query);
      const titleMatch = title.includes(query);
      const nameMatch = b.name.toLowerCase().includes(query);
      return refMatch || titleMatch || nameMatch;
    }

    return true;
  });
});

const getBookingPrice = (item: DevoteeBookingItem): number => {
  if (item.meta?.totalAmount) return item.meta.totalAmount;
  if (item.meta?.baseAmount) return item.meta.baseAmount;
  return 0;
};
</script>

<template>
  <UserPortalShell
    title="My Puja Bookings"
    subtitle="View, track, and manage all your scheduled ritual services"
  >
    <div class="bookings-page">
      <!-- Top Action Bar with Tabs & Search -->
      <div class="portal-card filter-card">
        <div class="tabs-row">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            All Bookings ({{ bookings.length }})
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'upcoming' }"
            @click="activeTab = 'upcoming'"
          >
            Upcoming
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'pending' }"
            @click="activeTab = 'pending'"
          >
            Pending
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'completed' }"
            @click="activeTab = 'completed'"
          >
            Completed
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'cancelled' }"
            @click="activeTab = 'cancelled'"
          >
            Cancelled
          </button>
        </div>

        <div class="filter-controls-row">
          <div class="search-wrap">
            <svg viewBox="0 0 20 20" fill="currentColor" class="search-icon">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by reference code (KM-...) or puja name"
              class="search-input"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="clear-search-btn"
              @click="searchQuery = ''"
            >
              ✕
            </button>
          </div>

          <NuxtLink to="/user/puja" class="btn-book-new">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            <span>Book New Puja</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="portal-card state-card">
        <div class="spinner"></div>
        <p>Loading your bookings...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="portal-card state-card error">
        <p>{{ errorMessage }}</p>
        <button type="button" class="btn-retry" @click="fetchBookings">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredBookings.length === 0" class="portal-card empty-card">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h3 class="empty-title">No bookings found</h3>
        <p class="empty-desc">
          {{
            searchQuery
              ? `No bookings match "${searchQuery}". Try a different keyword.`
              : activeTab === 'all'
              ? 'You have not booked any puja services yet. Schedule your first sacred ritual today!'
              : `You have no ${activeTab} puja bookings at the moment.`
          }}
        </p>
        <NuxtLink to="/user/puja" class="btn-primary-explore">
          Browse Puja Catalog
        </NuxtLink>
      </div>

      <!-- Bookings Content (Desktop Table & Mobile Cards) -->
      <div v-else class="bookings-results">
        <!-- Desktop Table View -->
        <div class="portal-card table-card desktop-only">
          <table class="bookings-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Puja Ritual</th>
                <th>Scheduled Date & Slot</th>
                <th>Devotee</th>
                <th>Dakshina</th>
                <th>Booking Status</th>
                <th>Payment</th>
                <th class="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredBookings" :key="item.id">
                <td class="ref-cell">
                  <span class="ref-code">{{ item.ref }}</span>
                </td>
                <td class="title-cell">
                  <span class="puja-name">{{ getPujaTitle(item) }}</span>
                </td>
                <td class="date-cell">
                  <div class="date-val">{{ item.preferredDate }}</div>
                  <div class="slot-val">{{ item.meta?.timeSlot || 'Standard Slot' }}</div>
                </td>
                <td class="devotee-cell">
                  <span>{{ item.name }}</span>
                </td>
                <td class="amount-cell">
                  <span>৳ {{ getBookingPrice(item).toLocaleString() }}</span>
                </td>
                <td class="status-cell">
                  <BookingStatusBadge :status="item.status" />
                </td>
                <td class="payment-cell">
                  <PaymentStatusBadge :status="item.meta?.paymentStatus || 'unpaid'" />
                </td>
                <td class="action-cell">
                  <NuxtLink :to="`/user/puja-bookings/${item.ref}`" class="btn-view-details">
                    View
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="mobile-only cards-list">
          <div
            v-for="item in filteredBookings"
            :key="item.id"
            class="portal-card booking-mobile-card"
          >
            <div class="card-header-row">
              <span class="ref-code">{{ item.ref }}</span>
              <BookingStatusBadge :status="item.status" />
            </div>

            <h3 class="card-puja-name">{{ getPujaTitle(item) }}</h3>

            <div class="card-info-grid">
              <div class="info-item">
                <span class="label">Date & Time</span>
                <span class="val">{{ item.preferredDate }} • {{ item.meta?.timeSlot || 'Slot' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Devotee</span>
                <span class="val">{{ item.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Total Dakshina</span>
                <span class="val price">৳ {{ getBookingPrice(item).toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <span class="label">Payment Status</span>
                <PaymentStatusBadge :status="item.meta?.paymentStatus || 'unpaid'" />
              </div>
            </div>

            <div class="card-footer-row">
              <NuxtLink :to="`/user/puja-bookings/${item.ref}`" class="btn-card-action">
                View Details & Tracking →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.bookings-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Filter Card */
.filter-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tabs-row {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #f5f5f4;
}

.tab-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #78716c;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: #292524;
}

.tab-btn.active {
  color: #7f1d2d;
  border-bottom-color: #7f1d2d;
}

.filter-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.125rem;
  height: 1.125rem;
  color: #a8a29e;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  font-size: 0.875rem;
  color: #292524;
  background-color: #faf7f0;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s ease;
}

.search-input:focus {
  border-color: #7f1d2d;
  background-color: #ffffff;
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a8a29e;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-book-new {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #7f1d2d;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.15s ease;
  white-space: nowrap;
}

.btn-book-new svg {
  width: 1.125rem;
  height: 1.125rem;
}

.btn-book-new:hover {
  background-color: #991b1b;
}

/* Table Card */
.table-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  overflow: hidden;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.bookings-table th {
  background-color: #faf7f0;
  padding: 0.875rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #57534e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e7e5e4;
}

.bookings-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #292524;
  border-bottom: 1px solid #f5f5f4;
  vertical-align: middle;
}

.bookings-table tr:last-child td {
  border-bottom: none;
}

.bookings-table tr:hover td {
  background-color: #fffdfa;
}

.ref-code {
  font-family: monospace;
  font-weight: 700;
  color: #7f1d2d;
  font-size: 0.875rem;
}

.puja-name {
  font-weight: 600;
  color: #292524;
}

.date-val {
  font-weight: 600;
  color: #292524;
}

.slot-val {
  font-size: 0.75rem;
  color: #78716c;
}

.amount-cell {
  font-weight: 700;
  color: #7f1d2d;
}

.actions-header,
.action-cell {
  text-align: right;
}

.btn-view-details {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #7f1d2d;
  background-color: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-view-details:hover {
  background-color: #ffedd5;
  color: #9a3412;
}

/* Mobile Cards */
.mobile-only {
  display: none;
}

@media (max-width: 840px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

.booking-mobile-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-puja-name {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  color: #292524;
}

.card-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid #f5f5f4;
  border-bottom: 1px solid #f5f5f4;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.75rem;
  color: #78716c;
}

.info-item .val {
  font-size: 0.875rem;
  font-weight: 600;
  color: #292524;
}

.info-item .val.price {
  color: #7f1d2d;
  font-weight: 700;
}

.card-footer-row {
  display: flex;
  justify-content: flex-end;
}

.btn-card-action {
  font-size: 0.875rem;
  font-weight: 700;
  color: #7f1d2d;
  text-decoration: none;
}

.btn-card-action:hover {
  text-decoration: underline;
}

/* States */
.state-card,
.empty-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon-wrap {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: #faf7f0;
  color: #a8a29e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-wrap svg {
  width: 1.75rem;
  height: 1.75rem;
}

.empty-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #292524;
}

.empty-desc {
  margin: 0;
  font-size: 0.9375rem;
  color: #78716c;
  max-width: 440px;
}

.btn-primary-explore {
  margin-top: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #7f1d2d;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.btn-primary-explore:hover {
  background-color: #991b1b;
}

.spinner {
  width: 2.25rem;
  height: 2.25rem;
  border: 3px solid #e7e5e4;
  border-top-color: #7f1d2d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
