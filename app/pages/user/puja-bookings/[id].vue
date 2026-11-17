<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";
import BookingStatusBadge from "~/components/portal/BookingStatusBadge.vue";
import PaymentStatusBadge from "~/components/portal/PaymentStatusBadge.vue";

const route = useRoute();
const router = useRouter();
const idOrRef = route.params.id as string;

useHead({
  title: "Booking Details - Devotee Portal",
});

interface BookingDetail {
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
  meta?: {
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
  } | null;
  puja?: {
    id: number;
    slug: string;
    name: { en: string; bn: string };
    duration?: string;
    priceBdt: number;
  } | null;
}

const booking = ref<BookingDetail | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

// Cancellation state
const showCancelConfirm = ref(false);
const isCancelling = ref(false);
const cancelError = ref("");
const cancelSuccess = ref("");

const fetchBooking = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await $fetch<{ booking: BookingDetail }>(`/api/me/bookings/${idOrRef}`);
    if (res?.booking) {
      booking.value = res.booking;
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || "Booking record could not be found or you do not have permission to view it.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBooking();
});

const getPujaTitle = (b: BookingDetail): string => {
  if (b.puja?.name?.en) return b.puja.name.en;
  if (b.customPujaName) {
    try {
      const parsed = JSON.parse(b.customPujaName);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed.en || parsed.bn || b.customPujaName;
      }
    } catch {
      return b.customPujaName;
    }
  }
  return "Temple Puja Ritual";
};

const formatPaymentMethod = (method?: string): string => {
  if (!method) return "Cash at Temple";
  switch (method) {
    case "offline_cash":
      return "Cash at Mandir Office";
    case "offline_bank":
      return "Bank Transfer";
    case "offline_mfs":
      return "bKash / Nagad (MFS)";
    case "online":
      return "Online Payment";
    default:
      return method;
  }
};

const handleCancelBooking = async () => {
  if (!booking.value) return;
  cancelError.value = "";
  isCancelling.value = true;

  try {
    const res = await $fetch<{ success: boolean; message?: string }>(
      `/api/me/bookings/${booking.value.ref}/cancel`,
      { method: "POST" }
    );

    if (res.success) {
      booking.value.status = "cancelled";
      cancelSuccess.value = "Your booking request has been successfully cancelled.";
      showCancelConfirm.value = false;
    }
  } catch (err: any) {
    cancelError.value = err?.data?.message || err?.message || "Failed to cancel booking.";
  } finally {
    isCancelling.value = false;
  }
};

const printConfirmation = () => {
  window.print();
};
</script>

<template>
  <UserPortalShell
    :title="booking ? `Booking: ${booking.ref}` : 'Booking Details'"
    subtitle="View full ritual schedule, offerings snapshot, and track fulfillment"
  >
    <div class="booking-detail-page">
      <!-- Breadcrumb navigation -->
      <div class="back-nav-bar no-print">
        <NuxtLink to="/user/puja-bookings" class="back-link">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          <span>Back to All Bookings</span>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="portal-card state-card no-print">
        <div class="spinner"></div>
        <p>Loading booking details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="portal-card state-card error no-print">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>{{ errorMessage }}</p>
        <NuxtLink to="/user/puja-bookings" class="btn-return">Return to Bookings</NuxtLink>
      </div>

      <!-- Booking Details Content -->
      <div v-else-if="booking" class="detail-container">
        <!-- Success Alert on Cancellation -->
        <div v-if="cancelSuccess" class="alert-banner success no-print">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>{{ cancelSuccess }}</span>
        </div>

        <!-- Header Card with Ref, Badges, and Print Button -->
        <div class="portal-card header-summary-card">
          <div class="header-left">
            <div class="ref-tag-row">
              <span class="ref-title">Booking Reference:</span>
              <strong class="ref-code">{{ booking.ref }}</strong>
            </div>
            <div class="booked-on-date">
              Booked on {{ new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}
            </div>
          </div>

          <div class="header-right no-print">
            <div class="badges-row">
              <BookingStatusBadge :status="booking.status" />
              <PaymentStatusBadge :status="booking.meta?.paymentStatus || 'unpaid'" />
            </div>

            <button type="button" class="btn-print" @click="printConfirmation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print Confirmation</span>
            </button>
          </div>
        </div>

        <!-- Grid of Details -->
        <div class="details-grid">
          <!-- Left Column: Ritual & Schedule Details -->
          <div class="col-main">
            <!-- Ritual Schedule -->
            <div class="portal-card info-card">
              <h3 class="card-section-title">Ritual & Schedule Information</h3>
              <div class="detail-rows-list">
                <div class="d-row">
                  <span class="d-label">Puja Name:</span>
                  <span class="d-val strong">{{ getPujaTitle(booking) }}</span>
                </div>
                <div class="d-row">
                  <span class="d-label">Scheduled Date:</span>
                  <span class="d-val highlight">{{ booking.preferredDate }}</span>
                </div>
                <div class="d-row">
                  <span class="d-label">Timing Slot:</span>
                  <span class="d-val">{{ booking.meta?.timeSlot || 'Scheduled Time' }}</span>
                </div>
                <div v-if="booking.puja?.duration" class="d-row">
                  <span class="d-label">Estimated Duration:</span>
                  <span class="d-val">{{ booking.puja.duration }}</span>
                </div>
              </div>
            </div>

            <!-- Devotee & Sankalpa Details -->
            <div class="portal-card info-card">
              <h3 class="card-section-title">Devotee & Sankalpa Information</h3>
              <div class="detail-rows-list">
                <div class="d-row">
                  <span class="d-label">Devotee Name:</span>
                  <span class="d-val strong">{{ booking.name }}</span>
                </div>
                <div class="d-row">
                  <span class="d-label">Mobile Number:</span>
                  <span class="d-val">{{ booking.phone }}</span>
                </div>
                <div v-if="booking.email" class="d-row">
                  <span class="d-label">Email:</span>
                  <span class="d-val">{{ booking.email }}</span>
                </div>
                <div v-if="booking.gotra" class="d-row">
                  <span class="d-label">Gotra (বংশ):</span>
                  <span class="d-val">{{ booking.gotra }}</span>
                </div>
                <div v-if="booking.meta?.address" class="d-row">
                  <span class="d-label">Correspondence Address:</span>
                  <span class="d-val">{{ booking.meta.address }}</span>
                </div>
                <div v-if="booking.specialInstructions" class="d-row full">
                  <span class="d-label">Special Instructions:</span>
                  <p class="special-note">{{ booking.specialInstructions }}</p>
                </div>
              </div>
            </div>

            <!-- Additional Offerings Included -->
            <div class="portal-card info-card">
              <h3 class="card-section-title">Consecrated Offerings & Add-ons</h3>
              <div v-if="!booking.meta?.addons || booking.meta.addons.length === 0" class="empty-addons-text">
                No optional offerings added. Standard puja samagri is included.
              </div>
              <div v-else class="addons-table-wrap">
                <table class="addons-table">
                  <thead>
                    <tr>
                      <th>Offering Item</th>
                      <th class="price-col">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="addon in booking.meta.addons" :key="addon.id">
                      <td>{{ addon.name }}</td>
                      <td class="price-col">৳ {{ Number(addon.priceBdt).toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right Column: Financial Summary & Actions -->
          <div class="col-side">
            <!-- Payment & Dakshina Summary -->
            <div class="portal-card info-card financial-card">
              <h3 class="card-section-title">Payment & Dakshina</h3>
              <div class="fin-breakdown">
                <div class="fin-row">
                  <span>Base Puja Dakshina</span>
                  <span>৳ {{ (booking.meta?.baseAmount || booking.puja?.priceBdt || 0).toLocaleString() }}</span>
                </div>
                <div class="fin-row">
                  <span>Offerings & Add-ons</span>
                  <span>৳ {{ (booking.meta?.addonAmount || 0).toLocaleString() }}</span>
                </div>
                <div class="fin-row grand-total">
                  <span>Total Payable</span>
                  <span class="total-price">৳ {{ (booking.meta?.totalAmount || booking.puja?.priceBdt || 0).toLocaleString() }} BDT</span>
                </div>
              </div>

              <div class="payment-method-box">
                <div class="pay-method-item">
                  <span class="pm-label">Payment Mode:</span>
                  <span class="pm-val">{{ formatPaymentMethod(booking.meta?.paymentMethod) }}</span>
                </div>
                <div class="pay-method-item">
                  <span class="pm-label">Payment Status:</span>
                  <PaymentStatusBadge :status="booking.meta?.paymentStatus || 'unpaid'" />
                </div>
                <div v-if="booking.meta?.transactionReference" class="pay-method-item">
                  <span class="pm-label">Transaction Reference:</span>
                  <span class="pm-val font-mono">{{ booking.meta.transactionReference }}</span>
                </div>
              </div>
            </div>

            <!-- Cancellation Action Card (Devotee allowed if status is new or pending) -->
            <div
              v-if="(booking.status === 'new' || booking.status === 'pending') && !cancelSuccess"
              class="portal-card cancel-action-card no-print"
            >
              <h4 class="cancel-title">Need to Cancel?</h4>
              <p class="cancel-desc">
                If your plans have changed, you can cancel this request before the mandir office completes confirmation.
              </p>

              <button
                v-if="!showCancelConfirm"
                type="button"
                class="btn-trigger-cancel"
                @click="showCancelConfirm = true"
              >
                Cancel Booking
              </button>

              <div v-else class="confirm-cancel-box">
                <p class="confirm-prompt">Are you sure you want to cancel this puja request?</p>
                <div v-if="cancelError" class="cancel-error-text">{{ cancelError }}</div>
                <div class="cancel-btn-group">
                  <button
                    type="button"
                    class="btn-cancel-proceed"
                    :disabled="isCancelling"
                    @click="handleCancelBooking"
                  >
                    {{ isCancelling ? 'Cancelling...' : 'Yes, Cancel' }}
                  </button>
                  <button
                    type="button"
                    class="btn-cancel-abort"
                    :disabled="isCancelling"
                    @click="showCancelConfirm = false"
                  >
                    Keep Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.booking-detail-page {
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

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header Summary Card */
.header-summary-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.ref-tag-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ref-title {
  font-size: 1rem;
  color: #78716c;
}

.ref-code {
  font-size: 1.375rem;
  font-weight: 800;
  color: #7f1d2d;
  font-family: monospace;
}

.booked-on-date {
  font-size: 0.8125rem;
  color: #a8a29e;
  margin-top: 0.25rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.badges-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.btn-print {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #57534e;
  background-color: #faf7f0;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-print svg {
  width: 1.125rem;
  height: 1.125rem;
}

.btn-print:hover {
  background-color: #f5f5f4;
  color: #292524;
}

/* Layout Grid */
.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

.col-main,
.col-side {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Info Cards */
.info-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.5rem;
}

.card-section-title {
  margin: 0 0 1.25rem 0;
  font-size: 1.0625rem;
  font-weight: 700;
  color: #292524;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f5f5f4;
}

.detail-rows-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.d-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.9375rem;
}

.d-row.full {
  flex-direction: column;
  gap: 0.375rem;
}

.d-label {
  color: #78716c;
}

.d-val {
  color: #292524;
}

.d-val.strong {
  font-weight: 700;
}

.d-val.highlight {
  font-weight: 700;
  color: #7f1d2d;
}

.special-note {
  margin: 0;
  padding: 0.75rem;
  background-color: #faf7f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #44403c;
  line-height: 1.5;
}

/* Addons Table */
.empty-addons-text {
  font-size: 0.875rem;
  color: #78716c;
  font-style: italic;
}

.addons-table-wrap {
  overflow-x: auto;
}

.addons-table {
  width: 100%;
  border-collapse: collapse;
}

.addons-table th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #78716c;
  text-transform: uppercase;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e7e5e4;
}

.addons-table td {
  padding: 0.625rem 0;
  font-size: 0.875rem;
  color: #292524;
  border-bottom: 1px solid #f5f5f4;
}

.addons-table .price-col {
  text-align: right;
  font-weight: 600;
  color: #7f1d2d;
}

/* Financial Breakdown Card */
.fin-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f5f5f4;
}

.fin-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  color: #57534e;
}

.fin-row.grand-total {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1.5px dashed #e7e5e4;
  font-weight: 700;
  color: #292524;
}

.total-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #7f1d2d;
}

.payment-method-box {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.pay-method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.pm-label {
  color: #78716c;
}

.pm-val {
  font-weight: 600;
  color: #292524;
}

.font-mono {
  font-family: monospace;
}

/* Cancel Card */
.cancel-action-card {
  background-color: #fffaf9;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 1.5rem;
}

.cancel-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #9a3412;
}

.cancel-desc {
  margin: 0 0 1rem 0;
  font-size: 0.8125rem;
  color: #78716c;
  line-height: 1.4;
}

.btn-trigger-cancel {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #dc2626;
  background-color: #ffffff;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-trigger-cancel:hover {
  background-color: #fef2f2;
}

.confirm-cancel-box {
  background-color: #ffffff;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
}

.confirm-prompt {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #991b1b;
}

.cancel-error-text {
  font-size: 0.8125rem;
  color: #dc2626;
  margin-bottom: 0.75rem;
}

.cancel-btn-group {
  display: flex;
  gap: 0.5rem;
}

.btn-cancel-proceed {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancel-proceed:hover {
  background-color: #b91c1c;
}

.btn-cancel-abort {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #57534e;
  background-color: #f5f5f4;
  border: 1px solid #d6d3d1;
  border-radius: 6px;
  cursor: pointer;
}

.alert-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
}

.alert-banner.success {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-banner svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
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
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
