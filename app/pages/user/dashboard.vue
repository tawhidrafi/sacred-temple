<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";
import BookingStatusBadge from "~/components/portal/BookingStatusBadge.vue";
import { useAuth } from "~/composables/useAuth";

useHead({
  title: "Dashboard - Devotee Portal",
});

const { currentUser } = useAuth();

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  totalDonations: number;
  totalDonationAmount: number;
  upcomingBookingsList: Array<{
    id: number;
    ref: string;
    pujaName: string;
    bookingDate: string;
    timeSlot: string;
    status: string;
  }>;
}

interface DevoteeProfile {
  name: string;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  profileImage: string | null;
  completionPercentage: number;
}

const stats = ref<DashboardStats>({
  totalBookings: 0,
  upcomingBookings: 0,
  totalDonations: 0,
  totalDonationAmount: 0,
  upcomingBookingsList: [],
});

const profile = ref<DevoteeProfile | null>(null);
const isLoading = ref(true);

const fetchDashboard = async () => {
  isLoading.value = true;
  try {
    const data = await $fetch<{ stats: DashboardStats; profile: DevoteeProfile }>("/api/me/dashboard");
    if (data) {
      stats.value = data.stats;
      profile.value = data.profile;
    }
  } catch (err) {
    console.warn("Could not load devotee dashboard:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboard();
});

const displayName = computed(() => {
  return profile.value?.name || currentUser.value?.name || "Devotee";
});

const completion = computed(() => {
  return profile.value?.completionPercentage || 50;
});
</script>

<template>
  <UserPortalShell
    title="Devotee Dashboard"
    subtitle="Overview of your sacred bookings, seva requests, and temple contributions"
  >
    <div class="dashboard-grid">
      <!-- 1. Welcome Card -->
      <section class="portal-card welcome-card">
        <div class="welcome-content">
          <div class="welcome-badge">
            <span class="om-symbol">ॐ</span>
            <span>Golpahar Mohashoshan Kali Mandir</span>
          </div>
          <h2 class="welcome-heading">Namaste, {{ displayName }} 🙏</h2>
          <p class="welcome-message">
            Welcome to your devotee portal. Manage your puja bookings and temple contributions from here.
          </p>

          <div class="quick-actions-row">
            <NuxtLink to="/user/puja" class="action-btn primary-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3 5H9l3-5z" />
                <path d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" />
              </svg>
              <span>Book a Puja</span>
            </NuxtLink>

            <NuxtLink to="/user/puja-bookings" class="action-btn secondary-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>View My Bookings</span>
            </NuxtLink>

            <NuxtLink to="/user/donations/create" class="action-btn accent-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>Make a Donation</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Profile Completion Gauge -->
        <div class="completion-box">
          <div class="completion-header">
            <span class="completion-title">Profile Completion</span>
            <span class="completion-pct">{{ completion }}%</span>
          </div>
          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              :style="{ width: `${completion}%` }"
              :class="{ 'is-complete': completion === 100 }"
            />
          </div>
          <p class="completion-note">
            {{
              completion === 100
                ? 'Your devotee profile is fully completed.'
                : 'Add your contact phone and profile picture to complete.'
            }}
          </p>
          <NuxtLink to="/user/profile/edit" class="complete-profile-link">
            <span>{{ completion === 100 ? 'View Profile' : 'Complete Profile' }}</span>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
        </div>
      </section>

      <!-- 2. Four Summary Metrics Cards -->
      <section class="summary-cards-grid">
        <!-- 1. Total Puja Bookings -->
        <div class="metric-card">
          <div class="metric-icon-box maroon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3 5H9l3-5z" />
              <path d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z" />
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Total Puja Bookings</span>
            <span class="metric-value">{{ stats.totalBookings }}</span>
            <span class="metric-hint">Lifetime registrations</span>
          </div>
        </div>

        <!-- 2. Upcoming Puja Bookings -->
        <div class="metric-card">
          <div class="metric-icon-box gold-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Upcoming Pujas</span>
            <span class="metric-value">{{ stats.upcomingBookings }}</span>
            <span class="metric-hint">Active upcoming rituals</span>
          </div>
        </div>

        <!-- 3. Total Donations -->
        <div class="metric-card">
          <div class="metric-icon-box green-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Total Donations</span>
            <span class="metric-value">{{ stats.totalDonations }}</span>
            <span class="metric-hint">Verified contributions</span>
          </div>
        </div>

        <!-- 4. Total Donation Amount -->
        <div class="metric-card">
          <div class="metric-icon-box saffron-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div class="metric-data">
            <span class="metric-label">Total Amount Donated</span>
            <span class="metric-value font-mono">৳ {{ stats.totalDonationAmount.toLocaleString() }}</span>
            <span class="metric-hint">Cumulative verified BDT</span>
          </div>
        </div>
      </section>

      <!-- 3. Upcoming Bookings Section -->
      <section class="portal-card upcoming-section">
        <div class="section-card-header">
          <div class="section-header-titles">
            <h3 class="section-card-title">Upcoming Puja Bookings</h3>
            <p class="section-card-sub">Your scheduled rituals and ceremonies at Golpahar Mandir</p>
          </div>
          <NuxtLink to="/user/puja-bookings" class="view-all-link">
            <span>View All</span>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Bookings List -->
        <div v-if="stats.upcomingBookingsList.length > 0" class="upcoming-table-wrapper">
          <table class="portal-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Puja Service</th>
                <th>Booking Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in stats.upcomingBookingsList" :key="b.ref">
                <td class="font-mono font-bold text-maroon">{{ b.ref }}</td>
                <td class="font-medium">{{ b.pujaName }}</td>
                <td>{{ b.bookingDate }}</td>
                <td>{{ b.timeSlot }}</td>
                <td>
                  <BookingStatusBadge :status="b.status" />
                </td>
                <td class="text-right">
                  <NuxtLink :to="`/user/puja-bookings/${b.ref}`" class="table-action-link">
                    Details
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="portal-empty-state">
          <div class="empty-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h4 class="empty-title">No Upcoming Puja Bookings</h4>
          <p class="empty-desc">
            You do not currently have any scheduled puja or ritual bookings. Explore the temple's daily rituals and offerings.
          </p>
          <NuxtLink to="/user/puja" class="empty-cta-btn">
            Explore Puja Services
          </NuxtLink>
        </div>
      </section>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.portal-card {
  background-color: #FFFFFF;
  border-radius: 14px;
  border: 1px solid rgba(120, 113, 108, 0.18);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
}

/* 1. Welcome Card */
.welcome-card {
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  background: linear-gradient(135deg, #FFFDF8 0%, #FFFFFF 100%);
  border: 1px solid rgba(217, 119, 6, 0.25);
}

.welcome-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: #FEF3C7;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #92400E;
  width: fit-content;
}

.om-symbol {
  font-size: 0.95rem;
  color: #7F1D2D;
}

.welcome-heading {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0;
  line-height: 1.25;
}

.welcome-message {
  font-size: 0.9rem;
  color: #78716C;
  line-height: 1.5;
  margin: 0;
  max-width: 580px;
}

.quick-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.primary-action {
  background-color: #7F1D2D;
  color: #FFFFFF;
}

.primary-action:hover {
  background-color: #6E0516;
}

.secondary-action {
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.25);
  color: #292524;
}

.secondary-action:hover {
  background-color: #F5EFE0;
}

.accent-action {
  background-color: #D97706;
  color: #FFFFFF;
}

.accent-action:hover {
  background-color: #B45309;
}

/* Completion Box */
.completion-box {
  width: 260px;
  padding: 20px;
  border-radius: 12px;
  background-color: #FAF7F0;
  border: 1px solid rgba(217, 119, 6, 0.2);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.completion-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #292524;
}

.completion-pct {
  font-size: 0.85rem;
  font-weight: 800;
  color: #D97706;
}

.progress-bar-track {
  width: 100%;
  height: 8px;
  border-radius: 9999px;
  background-color: rgba(120, 113, 108, 0.18);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #D97706;
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.progress-bar-fill.is-complete {
  background-color: #059669;
}

.completion-note {
  font-size: 0.74rem;
  color: #78716C;
  line-height: 1.4;
  margin: 0;
}

.complete-profile-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #7F1D2D;
  text-decoration: none;
  margin-top: 4px;
}

.complete-profile-link svg {
  width: 14px;
  height: 14px;
}

.complete-profile-link:hover {
  text-decoration: underline;
}

/* 2. Summary Metrics */
.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.metric-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  border: 1px solid rgba(120, 113, 108, 0.18);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.metric-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon-box svg {
  width: 22px;
  height: 22px;
}

.maroon-box {
  background-color: #FDF2F2;
  color: #7F1D2D;
}

.gold-box {
  background-color: #FEF3C7;
  color: #D97706;
}

.green-box {
  background-color: #ECFDF5;
  color: #059669;
}

.saffron-box {
  background-color: #FFF7ED;
  color: #EA580C;
}

.metric-data {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #78716C;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #292524;
  line-height: 1.2;
  margin: 4px 0 2px 0;
}

.metric-hint {
  font-size: 0.7rem;
  color: #A8A29E;
}

/* 3. Upcoming Section */
.upcoming-section {
  padding: 24px;
}

.section-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(120, 113, 108, 0.12);
  padding-bottom: 16px;
}

.section-card-title {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0;
}

.section-card-sub {
  font-size: 0.8rem;
  color: #78716C;
  margin: 2px 0 0 0;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #D97706;
  text-decoration: none;
}

.view-all-link svg {
  width: 14px;
  height: 14px;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* Table */
.upcoming-table-wrapper {
  overflow-x: auto;
}

.portal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
  text-align: left;
}

.portal-table th {
  padding: 10px 14px;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #78716C;
  border-bottom: 1px solid rgba(120, 113, 108, 0.15);
  background-color: #FAF7F0;
}

.portal-table td {
  padding: 14px;
  border-bottom: 1px solid rgba(120, 113, 108, 0.1);
  color: #292524;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
}

.text-maroon {
  color: #7F1D2D;
}

.text-right {
  text-align: right;
}

.table-action-link {
  display: inline-block;
  padding: 4px 10px;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.2);
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #7F1D2D;
  text-decoration: none;
  transition: all 0.15s ease;
}

.table-action-link:hover {
  background-color: #7F1D2D;
  color: #FFFFFF;
}

/* Empty State */
.portal-empty-state {
  text-align: center;
  padding: 44px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #FAF7F0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D97706;
}

.empty-icon-circle svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #292524;
  margin: 0;
}

.empty-desc {
  font-size: 0.85rem;
  color: #78716C;
  max-width: 440px;
  margin: 0;
  line-height: 1.5;
}

.empty-cta-btn {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 8px;
  background-color: #7F1D2D;
  color: #FFFFFF;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  margin-top: 6px;
  transition: background-color 0.15s ease;
}

.empty-cta-btn:hover {
  background-color: #6E0516;
}

/* Responsive */
@media (max-width: 1024px) {
  .welcome-card {
    flex-direction: column;
    align-items: stretch;
  }

  .completion-box {
    width: 100%;
  }

  .summary-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .summary-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
