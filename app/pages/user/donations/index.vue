<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";

useHead({
  title: "My Donations - Devotee Portal",
});

interface DonationItem {
  id: number;
  ref: string;
  userId: string;
  categoryId: number;
  donorName: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string | null;
  message?: string | null;
  status: "pending_verification" | "confirmed" | "rejected";
  createdAt: number;
  category: {
    id: number;
    name: { en: string; bn: string };
    slug: string;
  };
  receipt?: {
    receiptNumber: string;
    issuedAt: number;
  } | null;
}

const donations = ref<DonationItem[]>([]);
const totalConfirmedCount = ref(0);
const totalConfirmedAmount = ref(0);
const totalPendingCount = ref(0);

const isLoading = ref(true);
const errorMessage = ref("");
const activeTab = ref<"all" | "confirmed" | "pending_verification" | "rejected">("all");
const searchQuery = ref("");

const fetchDonations = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await $fetch<{
      items: DonationItem[];
      totalConfirmedCount: number;
      totalConfirmedAmount: number;
      totalPendingCount: number;
    }>("/api/me/donations");

    if (res) {
      donations.value = res.items || [];
      totalConfirmedCount.value = res.totalConfirmedCount || 0;
      totalConfirmedAmount.value = res.totalConfirmedAmount || 0;
      totalPendingCount.value = res.totalPendingCount || 0;
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || "Could not load donation history.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDonations();
});

const filteredDonations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  return donations.value.filter((d) => {
    // Tab filter
    if (activeTab.value !== "all" && d.status !== activeTab.value) {
      return false;
    }

    // Search query
    if (q) {
      const refMatch = d.ref.toLowerCase().includes(q);
      const catMatch = (d.category?.name?.en || "").toLowerCase().includes(q);
      const receiptMatch = d.receipt?.receiptNumber ? d.receipt.receiptNumber.toLowerCase().includes(q) : false;
      return refMatch || catMatch || receiptMatch;
    }

    return true;
  });
});

const formatMethod = (method: string): string => {
  switch (method) {
    case "offline_cash":
      return "Cash at Counter";
    case "offline_bank":
      return "Bank Transfer";
    case "offline_mfs":
      return "bKash / Nagad";
    default:
      return method;
  }
};
</script>

<template>
  <UserPortalShell
    title="My Temple Contributions"
    subtitle="Track your sacred donations, verified seva offerings, and official receipts"
  >
    <div class="donations-index-page">
      <!-- 3 Metrics Summary Cards -->
      <div class="metrics-grid">
        <div class="portal-card metric-card">
          <div class="metric-icon-wrap gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div class="metric-data">
            <span class="m-label">Total Verified Contributions</span>
            <strong class="m-val highlight">৳ {{ totalConfirmedAmount.toLocaleString() }} BDT</strong>
          </div>
        </div>

        <div class="portal-card metric-card">
          <div class="metric-icon-wrap green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div class="metric-data">
            <span class="m-label">Confirmed Donations</span>
            <strong class="m-val">{{ totalConfirmedCount }} Record{{ totalConfirmedCount === 1 ? '' : 's' }}</strong>
          </div>
        </div>

        <div class="portal-card metric-card">
          <div class="metric-icon-wrap amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div class="metric-data">
            <span class="m-label">Awaiting Verification</span>
            <strong class="m-val">{{ totalPendingCount }} Record{{ totalPendingCount === 1 ? '' : 's' }}</strong>
          </div>
        </div>
      </div>

      <!-- Action & Filter Bar -->
      <div class="portal-card filter-card">
        <div class="tabs-row">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            All ({{ donations.length }})
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'confirmed' }"
            @click="activeTab = 'confirmed'"
          >
            Confirmed ({{ totalConfirmedCount }})
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'pending_verification' }"
            @click="activeTab = 'pending_verification'"
          >
            Pending Verification ({{ totalPendingCount }})
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'rejected' }"
            @click="activeTab = 'rejected'"
          >
            Rejected
          </button>
        </div>

        <div class="controls-row">
          <div class="search-wrap">
            <svg viewBox="0 0 20 20" fill="currentColor" class="search-icon">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by ref (DON-...) or receipt number"
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

          <NuxtLink to="/user/donations/create" class="btn-make-donation">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            <span>Make a Contribution</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="portal-card state-card">
        <div class="spinner"></div>
        <p>Loading donation records...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="portal-card state-card error">
        <p>{{ errorMessage }}</p>
        <button type="button" class="btn-retry" @click="fetchDonations">Retry</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredDonations.length === 0" class="portal-card empty-card">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <h3 class="empty-title">No donation records found</h3>
        <p class="empty-desc">
          {{
            searchQuery
              ? `No contributions match "${searchQuery}".`
              : activeTab === 'all'
              ? 'You have not submitted any contributions yet. Support the mandir through divine seva today!'
              : `You have no ${activeTab.replace('_', ' ')} donation records.`
          }}
        </p>
        <NuxtLink to="/user/donations/create" class="btn-primary-explore">
          Make a Contribution
        </NuxtLink>
      </div>

      <!-- Donations Content -->
      <div v-else class="donations-results">
        <!-- Desktop Table -->
        <div class="portal-card table-card desktop-only">
          <table class="donations-table">
            <thead>
              <tr>
                <th>Donation Ref</th>
                <th>Date</th>
                <th>Purpose / Seva</th>
                <th>Remittance Mode</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Official Receipt</th>
                <th class="actions-header">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredDonations" :key="item.id">
                <td class="ref-cell">
                  <span class="ref-code">{{ item.ref }}</span>
                </td>
                <td class="date-cell">
                  <span>{{ new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
                </td>
                <td class="cat-cell">
                  <span class="cat-name">{{ item.category?.name?.en || 'General Donation' }}</span>
                </td>
                <td class="method-cell">
                  <span>{{ formatMethod(item.paymentMethod) }}</span>
                </td>
                <td class="amount-cell">
                  <span>৳ {{ item.amount.toLocaleString() }}</span>
                </td>
                <td class="status-cell">
                  <span
                    class="status-pill"
                    :class="{
                      confirmed: item.status === 'confirmed',
                      pending: item.status === 'pending_verification',
                      rejected: item.status === 'rejected',
                    }"
                  >
                    {{
                      item.status === 'confirmed'
                        ? 'Confirmed'
                        : item.status === 'pending_verification'
                        ? 'Pending Verification'
                        : 'Rejected'
                    }}
                  </span>
                </td>
                <td class="receipt-cell">
                  <span v-if="item.receipt?.receiptNumber" class="receipt-number font-mono">
                    {{ item.receipt.receiptNumber }}
                  </span>
                  <span v-else class="receipt-pending">
                    {{ item.status === 'confirmed' ? 'Generated' : 'Awaiting confirmation' }}
                  </span>
                </td>
                <td class="action-cell">
                  <NuxtLink :to="`/user/donations/${item.ref}`" class="btn-view-receipt">
                    {{ item.status === 'confirmed' ? 'Receipt' : 'Details' }}
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="mobile-only cards-list">
          <div
            v-for="item in filteredDonations"
            :key="item.id"
            class="portal-card donation-mobile-card"
          >
            <div class="card-header-row">
              <span class="ref-code">{{ item.ref }}</span>
              <span
                class="status-pill"
                :class="{
                  confirmed: item.status === 'confirmed',
                  pending: item.status === 'pending_verification',
                  rejected: item.status === 'rejected',
                }"
              >
                {{
                  item.status === 'confirmed'
                    ? 'Confirmed'
                    : item.status === 'pending_verification'
                    ? 'Pending'
                    : 'Rejected'
                }}
              </span>
            </div>

            <h3 class="card-cat-name">{{ item.category?.name?.en || 'General Seva' }}</h3>

            <div class="card-info-grid">
              <div class="info-item">
                <span class="label">Date</span>
                <span class="val">{{ new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Amount</span>
                <span class="val price">৳ {{ item.amount.toLocaleString() }} BDT</span>
              </div>
              <div class="info-item">
                <span class="label">Payment Mode</span>
                <span class="val">{{ formatMethod(item.paymentMethod) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Receipt</span>
                <span class="val font-mono">{{ item.receipt?.receiptNumber || 'Pending' }}</span>
              </div>
            </div>

            <div class="card-footer-row">
              <NuxtLink :to="`/user/donations/${item.ref}`" class="btn-card-action">
                {{ item.status === 'confirmed' ? 'View & Print Receipt →' : 'View Donation Details →' }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.donations-index-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.metric-icon-wrap {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon-wrap svg {
  width: 1.625rem;
  height: 1.625rem;
}

.metric-icon-wrap.gold {
  background-color: #fef3c7;
  color: #b45309;
}

.metric-icon-wrap.green {
  background-color: #f0fdf4;
  color: #15803d;
}

.metric-icon-wrap.amber {
  background-color: #fff7ed;
  color: #c2410c;
}

.metric-data {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.m-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #78716c;
}

.m-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: #292524;
}

.m-val.highlight {
  color: #7f1d2d;
  font-size: 1.375rem;
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

.controls-row {
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

.btn-make-donation {
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

.btn-make-donation svg {
  width: 1.125rem;
  height: 1.125rem;
}

.btn-make-donation:hover {
  background-color: #991b1b;
}

/* Table Card */
.table-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  overflow: hidden;
}

.donations-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.donations-table th {
  background-color: #faf7f0;
  padding: 0.875rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #57534e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e7e5e4;
}

.donations-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #292524;
  border-bottom: 1px solid #f5f5f4;
  vertical-align: middle;
}

.donations-table tr:last-child td {
  border-bottom: none;
}

.donations-table tr:hover td {
  background-color: #fffdfa;
}

.ref-code {
  font-family: monospace;
  font-weight: 700;
  color: #7f1d2d;
  font-size: 0.875rem;
}

.cat-name {
  font-weight: 600;
  color: #292524;
}

.amount-cell {
  font-weight: 700;
  color: #7f1d2d;
}

.status-pill {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-pill.confirmed {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-pill.pending {
  background-color: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-pill.rejected {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.receipt-number {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #b45309;
}

.receipt-pending {
  font-size: 0.75rem;
  color: #a8a29e;
  font-style: italic;
}

.font-mono {
  font-family: monospace;
}

.actions-header,
.action-cell {
  text-align: right;
}

.btn-view-receipt {
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

.btn-view-receipt:hover {
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

.donation-mobile-card {
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

.card-cat-name {
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
