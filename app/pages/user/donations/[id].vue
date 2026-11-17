<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";
import ReceiptTemplate from "~/components/portal/ReceiptTemplate.vue";

const route = useRoute();
const idOrRef = route.params.id as string;

useHead({
  title: "Donation Details - Devotee Portal",
});

interface DonationRecord {
  id: number;
  ref: string;
  userId: string;
  categoryId: number;
  donorName: string;
  amount: number;
  phone: string;
  email?: string | null;
  paymentMethod: string;
  transactionReference?: string | null;
  message?: string | null;
  isAnonymous?: boolean;
  status: "pending_verification" | "confirmed" | "rejected";
  createdAt: number;
  updatedAt: number;
  verifiedAt?: number | null;
  adminNote?: string | null;
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

const donation = ref<DonationRecord | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

const fetchDonation = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await $fetch<{ donation: DonationRecord }>(`/api/me/donations/${idOrRef}`);
    if (res?.donation) {
      donation.value = res.donation;
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || "Donation record not found or access is restricted.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDonation();
});

const printReceipt = () => {
  window.print();
};
</script>

<template>
  <UserPortalShell
    :title="donation ? `Donation: ${donation.ref}` : 'Donation Details'"
    subtitle="View transaction verification status, seva purpose, and official receipt"
  >
    <div class="donation-detail-page">
      <!-- Back Link -->
      <div class="back-nav-bar no-print">
        <NuxtLink to="/user/donations" class="back-link">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          <span>Back to All Contributions</span>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="portal-card state-card no-print">
        <div class="spinner"></div>
        <p>Loading donation record...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="portal-card state-card error no-print">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>{{ errorMessage }}</p>
        <NuxtLink to="/user/donations" class="btn-return">Return to Donations</NuxtLink>
      </div>

      <!-- When Confirmed: Render Official Printable Receipt -->
      <div v-else-if="donation && donation.status === 'confirmed'" class="confirmed-receipt-wrap">
        <!-- Top Action Bar -->
        <div class="receipt-action-bar portal-card no-print">
          <div class="action-info">
            <div class="status-verified-badge">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Verified & Confirmed</span>
            </div>
            <span class="action-hint">This is your official temple receipt for accounts and records.</span>
          </div>

          <button type="button" class="btn-print-receipt" @click="printReceipt">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print / Save Receipt</span>
          </button>
        </div>

        <!-- Official Receipt Component -->
        <ReceiptTemplate
          :receipt-number="donation.receipt?.receiptNumber"
          :donation-ref="donation.ref"
          :donor-name="donation.donorName"
          :phone="donation.phone"
          :email="donation.email"
          :category-name="donation.category?.name?.en || 'General Seva'"
          :amount="donation.amount"
          :payment-method="donation.paymentMethod"
          :transaction-reference="donation.transactionReference"
          :issued-at="donation.receipt?.issuedAt || donation.verifiedAt"
          :is-anonymous="donation.isAnonymous"
          :message="donation.message"
        />
      </div>

      <!-- When Pending Verification -->
      <div v-else-if="donation && donation.status === 'pending_verification'" class="pending-wrap">
        <div class="portal-card pending-card">
          <div class="pending-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h2 class="pending-title">Remittance Under Verification</h2>
          <p class="pending-desc">
            Your offline donation record has been logged and is awaiting bank / counter verification by the mandir accounts office.
          </p>

          <div class="donation-snapshot-box">
            <div class="snapshot-row">
              <span class="s-label">Donation Ref:</span>
              <strong class="s-val font-mono highlight">{{ donation.ref }}</strong>
            </div>
            <div class="snapshot-row">
              <span class="s-label">Contribution Amount:</span>
              <strong class="s-val price">৳ {{ donation.amount.toLocaleString() }} BDT</strong>
            </div>
            <div class="snapshot-row">
              <span class="s-label">Purpose / Seva:</span>
              <span class="s-val">{{ donation.category?.name?.en || 'General Donation' }}</span>
            </div>
            <div class="snapshot-row">
              <span class="s-label">Remittance Mode:</span>
              <span class="s-val">{{ donation.paymentMethod }}</span>
            </div>
            <div v-if="donation.transactionReference" class="snapshot-row">
              <span class="s-label">Transaction Reference:</span>
              <span class="s-val font-mono">{{ donation.transactionReference }}</span>
            </div>
            <div class="snapshot-row">
              <span class="s-label">Submission Date:</span>
              <span class="s-val">{{ new Date(donation.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
            </div>
          </div>

          <div class="info-note">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <p>
              Once temple staff confirms payment reconciliation, your official tax and acknowledgment receipt with a unique serial number will appear on this page.
            </p>
          </div>
        </div>
      </div>

      <!-- When Rejected -->
      <div v-else-if="donation && donation.status === 'rejected'" class="rejected-wrap">
        <div class="portal-card rejected-card">
          <div class="rejected-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h2 class="rejected-title">Contribution Record Rejected</h2>
          <p class="rejected-desc">
            The temple accounts office was unable to verify this remittance with the provided details.
          </p>

          <div v-if="donation.adminNote" class="admin-note-box">
            <span class="note-label">Staff Note:</span>
            <p class="note-text">{{ donation.adminNote }}</p>
          </div>

          <NuxtLink to="/user/donations/create" class="btn-resubmit">
            Submit Corrected Contribution
          </NuxtLink>
        </div>
      </div>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.donation-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.back-nav-bar {
  display: flex;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #7f1d2d;
  text-decoration: none;
}

.back-link svg {
  width: 1.25rem;
  height: 1.25rem;
}

.back-link:hover {
  text-decoration: underline;
}

/* Confirmed Receipt Wrapper */
.confirmed-receipt-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.receipt-action-bar {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.action-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #15803d;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 20px;
}

.status-verified-badge svg {
  width: 1rem;
  height: 1rem;
}

.action-hint {
  font-size: 0.875rem;
  color: #78716c;
}

.btn-print-receipt {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #7f1d2d;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-print-receipt svg {
  width: 1.125rem;
  height: 1.125rem;
}

.btn-print-receipt:hover {
  background-color: #991b1b;
}

/* Pending State */
.pending-card,
.rejected-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 620px;
  margin: 0 auto;
}

.pending-icon-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: #fffbeb;
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
}

.pending-icon-wrap svg {
  width: 2.25rem;
  height: 2.25rem;
}

.pending-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #292524;
}

.pending-desc {
  margin: 0 0 1.75rem 0;
  font-size: 0.9375rem;
  color: #57534e;
  line-height: 1.5;
}

.donation-snapshot-box {
  background-color: #fffdfa;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 1.5rem;
}

.snapshot-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
}

.s-label {
  color: #78716c;
}

.s-val {
  color: #292524;
  font-weight: 600;
}

.s-val.highlight {
  color: #7f1d2d;
  font-weight: 800;
}

.s-val.price {
  color: #7f1d2d;
  font-weight: 800;
  font-size: 1.0625rem;
}

.font-mono {
  font-family: monospace;
}

.info-note {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  background-color: #faf7f0;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  text-align: left;
}

.info-note svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #d97706;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-note p {
  margin: 0;
  font-size: 0.8125rem;
  color: #57534e;
  line-height: 1.45;
}

/* Rejected State */
.rejected-icon-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
}

.rejected-icon-wrap svg {
  width: 2.25rem;
  height: 2.25rem;
}

.rejected-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #292524;
}

.rejected-desc {
  margin: 0 0 1.5rem 0;
  font-size: 0.9375rem;
  color: #57534e;
  line-height: 1.5;
}

.admin-note-box {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
  margin-bottom: 1.5rem;
}

.note-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #991b1b;
  display: block;
  margin-bottom: 0.25rem;
}

.note-text {
  margin: 0;
  font-size: 0.875rem;
  color: #7f1d1d;
}

.btn-resubmit {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #7f1d2d;
  border-radius: 8px;
  text-decoration: none;
}

.btn-resubmit:hover {
  background-color: #991b1b;
}

/* States */
.state-card {
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

.btn-return {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #7f1d2d;
  border-radius: 6px;
  text-decoration: none;
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

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
