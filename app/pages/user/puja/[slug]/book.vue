<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";
import BookingStatusBadge from "~/components/portal/BookingStatusBadge.vue";
import PaymentStatusBadge from "~/components/portal/PaymentStatusBadge.vue";

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;

useHead({
  title: "Book Puja - Devotee Portal",
});

interface PujaInfo {
  id?: number;
  slug: string;
  name: { en: string; bn: string };
  priceBdt: number;
  duration?: string;
  image?: string;
}

interface Addon {
  id: string;
  name: { en: string; bn: string };
  description?: { en: string; bn: string };
  priceBdt: number;
}

interface TimeSlot {
  id: string;
  name: { en: string; bn: string };
  startTime: string;
  endTime: string;
  capacity?: number;
}

// Wizard state: Steps 1 through 7
const currentStep = ref(1);
const isLoading = ref(true);
const isSubmitting = ref(false);
const fetchError = ref("");
const submitError = ref("");

// Data fetched from backend
const puja = ref<PujaInfo | null>(null);
const availableAddons = ref<Addon[]>([]);
const availableSlots = ref<TimeSlot[]>([]);

// Minimum date: tomorrow in YYYY-MM-DD
const tomorrowStr = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
});

// Form state
const preferredDate = ref("");
const selectedSlotId = ref("");
const devoteeName = ref("");
const devoteePhone = ref("");
const devoteeEmail = ref("");
const devoteeGotra = ref("");
const devoteeAddress = ref("");
const specialInstructions = ref("");
const selectedAddonIds = ref<string[]>([]);
const paymentMethod = ref<"offline_cash" | "offline_bank" | "offline_mfs">("offline_cash");
const transactionReference = ref("");

// Result after booking creation
const bookingResult = ref<{
  ref: string;
  baseAmount: number;
  addonAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
} | null>(null);

// Price calculations
const basePrice = computed(() => puja.value?.priceBdt || 0);

const selectedAddonObjects = computed(() => {
  return availableAddons.value.filter((a) => selectedAddonIds.value.includes(a.id));
});

const addonTotal = computed(() => {
  return selectedAddonObjects.value.reduce((sum, a) => sum + (Number(a.priceBdt) || 0), 0);
});

const grandTotal = computed(() => basePrice.value + addonTotal.value);

const selectedSlotObject = computed(() => {
  return availableSlots.value.find((s) => s.id === selectedSlotId.value);
});

// Fetch Puja details and devotee profile
onMounted(async () => {
  isLoading.value = true;
  fetchError.value = "";
  try {
    // 1. Fetch Puja details
    const res = await $fetch<{
      puja: PujaInfo;
      addons: Addon[];
      timeSlots: TimeSlot[];
    }>(`/api/public/pujas/${slug}`);

    if (res?.puja) {
      puja.value = res.puja;
      availableAddons.value = res.addons || [];
      availableSlots.value = res.timeSlots || [];
      if (availableSlots.value.length > 0 && !selectedSlotId.value) {
        selectedSlotId.value = availableSlots.value[0]?.id || "";
      }
    } else {
      fetchError.value = "Selected puja service could not be found.";
    }

    // Default to tomorrow
    if (!preferredDate.value) {
      preferredDate.value = tomorrowStr.value;
    }

    // 2. Prefill devotee details from user profile
    try {
      const profileRes = await $fetch<{ profile: any }>("/api/me/profile");
      if (profileRes?.profile) {
        const p = profileRes.profile;
        if (!devoteeName.value && p.name) devoteeName.value = p.name;
        if (!devoteePhone.value && p.phone) devoteePhone.value = p.phone;
        if (!devoteeEmail.value && p.email) devoteeEmail.value = p.email;
        if (!devoteeAddress.value && p.address) {
          const parts = [p.address, p.city].filter(Boolean);
          devoteeAddress.value = parts.join(", ");
        }
      }
    } catch {
      // Continue even if profile prefill fails
    }
  } catch (err: any) {
    fetchError.value = err?.data?.message || "Could not load puja details. Please try again.";
  } finally {
    isLoading.value = false;
  }
});

// Step validation
const stepError = ref("");

const validateCurrentStep = (): boolean => {
  stepError.value = "";

  if (currentStep.value === 1) {
    if (!preferredDate.value) {
      stepError.value = "Please select a date for the puja ritual.";
      return false;
    }
    if (preferredDate.value < tomorrowStr.value) {
      stepError.value = "Pujas must be scheduled at least 1 day in advance.";
      return false;
    }
  } else if (currentStep.value === 2) {
    if (!selectedSlotId.value) {
      stepError.value = "Please choose a preferred time slot.";
      return false;
    }
  } else if (currentStep.value === 3) {
    if (!devoteeName.value.trim() || devoteeName.value.trim().length < 2) {
      stepError.value = "Please enter the devotee or family head's name.";
      return false;
    }
    const bdPhoneRegex = /^(?:\+?880|0)1[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(devoteePhone.value.trim())) {
      stepError.value = "Please enter a valid 11-digit Bangladesh mobile number (e.g. 01711223344).";
      return false;
    }
  }

  return true;
};

const goToNextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep.value < 6) {
      currentStep.value++;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};

const goToPrevStep = () => {
  stepError.value = "";
  if (currentStep.value > 1 && currentStep.value < 7) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const toggleAddon = (id: string) => {
  if (selectedAddonIds.value.includes(id)) {
    selectedAddonIds.value = selectedAddonIds.value.filter((item) => item !== id);
  } else {
    selectedAddonIds.value.push(id);
  }
};

// Final submit
const submitBooking = async () => {
  submitError.value = "";
  isSubmitting.value = true;

  try {
    const payload = {
      pujaSlug: slug,
      preferredDate: preferredDate.value,
      timeSlot: selectedSlotObject.value?.name?.en || selectedSlotId.value,
      devoteeName: devoteeName.value.trim(),
      phone: devoteePhone.value.trim(),
      email: devoteeEmail.value.trim() || null,
      gotra: devoteeGotra.value.trim() || null,
      address: devoteeAddress.value.trim() || null,
      specialInstructions: specialInstructions.value.trim() || null,
      selectedAddons: selectedAddonObjects.value.map((a) => ({
        id: a.id,
        name: a.name.en,
        priceBdt: a.priceBdt,
      })),
      paymentMethod: paymentMethod.value,
      transactionReference: transactionReference.value.trim() || null,
    };

    const res = await $fetch<{
      success: boolean;
      ref: string;
      baseAmount: number;
      addonAmount: number;
      totalAmount: number;
      paymentStatus: string;
      paymentMethod: string;
    }>("/api/me/bookings/create", {
      method: "POST",
      body: payload,
    });

    if (res?.success) {
      bookingResult.value = res;
      currentStep.value = 7;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } catch (err: any) {
    submitError.value = err?.data?.message || err?.message || "Failed to submit puja booking.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UserPortalShell
    :title="puja ? `Book: ${puja.name.en}` : 'Puja Booking'"
    :subtitle="puja?.name?.bn || 'Schedule your sacred ritual and offerings'"
  >
    <div class="booking-wizard-page">
      <!-- Back to details link -->
      <div v-if="currentStep < 7" class="back-nav-bar">
        <NuxtLink :to="`/user/puja/${slug}`" class="back-link">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          <span>Back to {{ puja?.name?.en || 'Puja Details' }}</span>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="portal-card loading-state">
        <div class="spinner"></div>
        <p>Loading booking details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="fetchError" class="portal-card error-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>{{ fetchError }}</p>
        <NuxtLink to="/user/puja" class="btn-return">Explore Other Pujas</NuxtLink>
      </div>

      <!-- Main Booking Wizard -->
      <div v-else class="wizard-container">
        <!-- Progress Stepper (Hidden on Step 7) -->
        <div v-if="currentStep < 7" class="stepper-wrap">
          <div class="stepper-track">
            <div
              v-for="s in 6"
              :key="s"
              class="step-node"
              :class="{
                active: currentStep === s,
                completed: currentStep > s,
              }"
            >
              <div class="step-circle">
                <span v-if="currentStep > s" class="check-icon">✓</span>
                <span v-else>{{ s }}</span>
              </div>
              <span class="step-label">
                {{
                  s === 1
                    ? 'Date'
                    : s === 2
                    ? 'Slot'
                    : s === 3
                    ? 'Devotee'
                    : s === 4
                    ? 'Offerings'
                    : s === 5
                    ? 'Summary'
                    : 'Payment'
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Step Validation Error Alert -->
        <div v-if="stepError" class="wizard-alert error-banner">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ stepError }}</span>
        </div>

        <!-- STEP 1: Date Selection -->
        <div v-if="currentStep === 1" class="step-card portal-card">
          <div class="step-header">
            <div class="step-number-tag">Step 1 of 6</div>
            <h2 class="step-title">Select Preferred Date</h2>
            <p class="step-desc">Choose the auspicious day for conducting the puja ritual. Minimum 1 day advance notice is required.</p>
          </div>

          <div class="step-content">
            <div class="form-group date-picker-group">
              <label for="preferredDate" class="input-label">Date (YYYY-MM-DD)</label>
              <input
                id="preferredDate"
                v-model="preferredDate"
                type="date"
                :min="tomorrowStr"
                class="portal-input date-input"
              />
              <span class="field-hint">Bookings are accepted starting from tomorrow ({{ tomorrowStr }}).</span>
            </div>
          </div>
        </div>

        <!-- STEP 2: Time Slot Selection -->
        <div v-if="currentStep === 2" class="step-card portal-card">
          <div class="step-header">
            <div class="step-number-tag">Step 2 of 6</div>
            <h2 class="step-title">Choose Puja Timing Slot</h2>
            <p class="step-desc">Select the ritual time window that best suits your family.</p>
          </div>

          <div class="step-content">
            <div class="slots-grid">
              <button
                v-for="slot in availableSlots"
                :key="slot.id"
                type="button"
                class="slot-btn"
                :class="{ selected: selectedSlotId === slot.id }"
                @click="selectedSlotId = slot.id"
              >
                <div class="slot-check-indicator">
                  <div class="inner-dot"></div>
                </div>
                <div class="slot-details">
                  <div class="slot-name-row">
                    <span class="slot-en-name">{{ slot.name.en }}</span>
                    <span v-if="slot.name.bn" class="slot-bn-name">({{ slot.name.bn }})</span>
                  </div>
                  <div class="slot-time-range">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{{ slot.startTime }} – {{ slot.endTime }}</span>
                  </div>
                  <div class="slot-capacity-pill">
                    <span>Available Capacity: {{ slot.capacity || 10 }} slots</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 3: Devotee & Sankalpa Information -->
        <div v-if="currentStep === 3" class="step-card portal-card">
          <div class="step-header">
            <div class="step-number-tag">Step 3 of 6</div>
            <h2 class="step-title">Devotee & Sankalpa Details</h2>
            <p class="step-desc">Provide names and gotra for priest invocation during the sacred mantras.</p>
          </div>

          <div class="step-content form-grid">
            <div class="form-group full-width">
              <label for="devoteeName" class="input-label">Devotee Full Name *</label>
              <input
                id="devoteeName"
                v-model="devoteeName"
                type="text"
                placeholder="e.g. Anirban Sharma"
                class="portal-input"
              />
            </div>

            <div class="form-group">
              <label for="devoteePhone" class="input-label">Mobile Number *</label>
              <input
                id="devoteePhone"
                v-model="devoteePhone"
                type="tel"
                placeholder="01711223344"
                class="portal-input"
              />
              <span class="field-hint">Used for priest coordination & SMS confirmations</span>
            </div>

            <div class="form-group">
              <label for="devoteeEmail" class="input-label">Email Address (Optional)</label>
              <input
                id="devoteeEmail"
                v-model="devoteeEmail"
                type="email"
                placeholder="devotee@example.com"
                class="portal-input"
              />
            </div>

            <div class="form-group">
              <label for="devoteeGotra" class="input-label">Gotra (Auspicious Clan / বংশ)</label>
              <input
                id="devoteeGotra"
                v-model="devoteeGotra"
                type="text"
                placeholder="e.g. Kashyapa, Shandilya, Bharadwaja"
                class="portal-input"
              />
            </div>

            <div class="form-group">
              <label for="devoteeAddress" class="input-label">Correspondence Address (Optional)</label>
              <input
                id="devoteeAddress"
                v-model="devoteeAddress"
                type="text"
                placeholder="Apartment, Street, City"
                class="portal-input"
              />
            </div>

            <div class="form-group full-width">
              <label for="specialInstructions" class="input-label">Special Prayers / Instructions (Optional)</label>
              <textarea
                id="specialInstructions"
                v-model="specialInstructions"
                rows="3"
                placeholder="Mention any specific prayer focus, health blessings, or ritual preferences..."
                class="portal-input textarea"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- STEP 4: Additional Offerings -->
        <div v-if="currentStep === 4" class="step-card portal-card">
          <div class="step-header">
            <div class="step-number-tag">Step 4 of 6</div>
            <h2 class="step-title">Additional Offerings & Samagri</h2>
            <p class="step-desc">Enhance your puja with special garlands, pure ghee lamps, and consecrated mahaprasad.</p>
          </div>

          <div class="step-content">
            <div v-if="availableAddons.length === 0" class="empty-addons-notice">
              <p>No optional add-ons configured for this ritual. All standard samagri is already included.</p>
            </div>

            <div v-else class="addons-list">
              <div
                v-for="addon in availableAddons"
                :key="addon.id"
                class="addon-item-card"
                :class="{ active: selectedAddonIds.includes(addon.id) }"
                @click="toggleAddon(addon.id)"
              >
                <div class="checkbox-col">
                  <input
                    type="checkbox"
                    :checked="selectedAddonIds.includes(addon.id)"
                    class="portal-checkbox"
                    @click.stop="toggleAddon(addon.id)"
                  />
                </div>
                <div class="addon-info-col">
                  <div class="addon-title-row">
                    <span class="addon-name">{{ addon.name.en }}</span>
                    <span v-if="addon.name.bn" class="addon-bn">({{ addon.name.bn }})</span>
                  </div>
                  <p v-if="addon.description?.en" class="addon-desc">{{ addon.description.en }}</p>
                </div>
                <div class="addon-price-col">
                  <span class="addon-price">+ ৳ {{ addon.priceBdt.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="live-addon-summary">
              <span>Selected Offerings Total:</span>
              <strong class="addon-subtotal">৳ {{ addonTotal.toLocaleString() }}</strong>
            </div>
          </div>
        </div>

        <!-- STEP 5: Booking Summary & Price Breakdown -->
        <div v-if="currentStep === 5" class="step-card portal-card">
          <div class="step-header">
            <div class="step-number-tag">Step 5 of 6</div>
            <h2 class="step-title">Review Booking Summary</h2>
            <p class="step-desc">Please verify your ritual dates, devotee details, and offerings before proceeding to payment.</p>
          </div>

          <div class="step-content">
            <div class="summary-box">
              <div class="summary-section">
                <h3 class="summary-sec-title">Puja & Schedule</h3>
                <div class="summary-row">
                  <span class="label">Puja Name:</span>
                  <span class="value">{{ puja?.name?.en }} ({{ puja?.name?.bn }})</span>
                </div>
                <div class="summary-row">
                  <span class="label">Preferred Date:</span>
                  <span class="value highlight-val">{{ preferredDate }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Time Slot:</span>
                  <span class="value">{{ selectedSlotObject?.name?.en }} ({{ selectedSlotObject?.startTime }} - {{ selectedSlotObject?.endTime }})</span>
                </div>
              </div>

              <div class="summary-section">
                <h3 class="summary-sec-title">Devotee Information</h3>
                <div class="summary-row">
                  <span class="label">Devotee Name:</span>
                  <span class="value">{{ devoteeName }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Mobile Number:</span>
                  <span class="value">{{ devoteePhone }}</span>
                </div>
                <div v-if="devoteeGotra" class="summary-row">
                  <span class="label">Gotra:</span>
                  <span class="value">{{ devoteeGotra }}</span>
                </div>
                <div v-if="devoteeAddress" class="summary-row">
                  <span class="label">Address:</span>
                  <span class="value">{{ devoteeAddress }}</span>
                </div>
              </div>

              <div class="summary-section">
                <h3 class="summary-sec-title">Price Breakdown</h3>
                <div class="summary-row">
                  <span class="label">Base Puja Dakshina:</span>
                  <span class="value">৳ {{ basePrice.toLocaleString() }}</span>
                </div>
                <div v-if="selectedAddonObjects.length > 0" class="summary-row">
                  <span class="label">Offerings ({{ selectedAddonObjects.length }} items):</span>
                  <span class="value">+ ৳ {{ addonTotal.toLocaleString() }}</span>
                </div>
                <div class="summary-row grand-total-row">
                  <span class="label">Total Amount Payable:</span>
                  <span class="total-amount">৳ {{ grandTotal.toLocaleString() }} BDT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 6: Payment Method & Offline Instructions -->
        <div v-if="currentStep === 6" class="step-card portal-card">
          <div class="step-header">
            <div class="step-number-tag">Step 6 of 6</div>
            <h2 class="step-title">Choose Payment Method</h2>
            <p class="step-desc">Select how you wish to remit the sacred dakshina. Offline payment methods are accepted.</p>
          </div>

          <div class="step-content">
            <div class="payment-options-grid">
              <label
                class="payment-option-card"
                :class="{ active: paymentMethod === 'offline_cash' }"
              >
                <div class="radio-col">
                  <input
                    v-model="paymentMethod"
                    type="radio"
                    value="offline_cash"
                    class="portal-radio"
                  />
                </div>
                <div class="option-info">
                  <h4 class="option-title">Cash at Temple Office</h4>
                  <p class="option-desc">Pay directly in cash at the Golpahar Mandir office on the day of the puja or prior.</p>
                </div>
              </label>

              <label
                class="payment-option-card"
                :class="{ active: paymentMethod === 'offline_bank' }"
              >
                <div class="radio-col">
                  <input
                    v-model="paymentMethod"
                    type="radio"
                    value="offline_bank"
                    class="portal-radio"
                  />
                </div>
                <div class="option-info">
                  <h4 class="option-title">Bank Transfer</h4>
                  <p class="option-desc">Direct electronic bank transfer to the temple's official account.</p>
                </div>
              </label>

              <label
                class="payment-option-card"
                :class="{ active: paymentMethod === 'offline_mfs' }"
              >
                <div class="radio-col">
                  <input
                    v-model="paymentMethod"
                    type="radio"
                    value="offline_mfs"
                    class="portal-radio"
                  />
                </div>
                <div class="option-info">
                  <h4 class="option-title">bKash / Nagad (MFS)</h4>
                  <p class="option-desc">Send payment via bKash or Nagad mobile financial service.</p>
                </div>
              </label>
            </div>

            <!-- Offline payment details instruction panel -->
            <div v-if="paymentMethod === 'offline_bank'" class="instructions-panel">
              <h4 class="inst-heading">Temple Bank Account Details</h4>
              <div class="inst-grid">
                <div><strong>Bank Name:</strong> The City Bank Limited</div>
                <div><strong>Account Name:</strong> Golpahar Mohashoshan Kali Mandir</div>
                <div><strong>Account Number:</strong> 1102938475001</div>
                <div><strong>Branch:</strong> GEC Circle Branch, Chattogram</div>
                <div><strong>Routing Number:</strong> 225151234</div>
              </div>
            </div>

            <div v-else-if="paymentMethod === 'offline_mfs'" class="instructions-panel">
              <h4 class="inst-heading">Mobile Financial Service (MFS) Details</h4>
              <div class="inst-grid">
                <div><strong>bKash Merchant:</strong> 01711-223344 (Make Payment)</div>
                <div><strong>Nagad Merchant:</strong> 01711-223344 (Merchant Pay)</div>
                <div><strong>Reference:</strong> Enter your mobile number as reference</div>
              </div>
            </div>

            <!-- Transaction Reference input for Bank / MFS -->
            <div
              v-if="paymentMethod !== 'offline_cash'"
              class="form-group trans-ref-group"
            >
              <label for="transactionReference" class="input-label">
                Transaction ID / Reference Number (Optional)
              </label>
              <input
                id="transactionReference"
                v-model="transactionReference"
                type="text"
                placeholder="e.g. 9B3K9A123 or Bank Slip Number"
                class="portal-input"
              />
              <span class="field-hint">You can also provide this receipt slip later at the mandir counter.</span>
            </div>

            <!-- Error banner during submit -->
            <div v-if="submitError" class="wizard-alert error-banner">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>{{ submitError }}</span>
            </div>
          </div>
        </div>

        <!-- Wizard Navigation Controls (Steps 1 to 6) -->
        <div v-if="currentStep < 7" class="wizard-nav-footer">
          <button
            v-if="currentStep > 1"
            type="button"
            class="btn-prev"
            :disabled="isSubmitting"
            @click="goToPrevStep"
          >
            ← Previous
          </button>
          <div v-else></div>

          <button
            v-if="currentStep < 6"
            type="button"
            class="btn-next"
            @click="goToNextStep"
          >
            Continue →
          </button>

          <button
            v-else
            type="button"
            class="btn-submit"
            :disabled="isSubmitting"
            @click="submitBooking"
          >
            <span v-if="isSubmitting">Submitting Booking...</span>
            <span v-else>Confirm & Book Puja (৳ {{ grandTotal.toLocaleString() }})</span>
          </button>
        </div>

        <!-- STEP 7: Confirmation & Reference Screen -->
        <div v-if="currentStep === 7 && bookingResult" class="confirmation-card portal-card">
          <div class="success-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h2 class="confirm-title">Puja Booking Received!</h2>
          <p class="confirm-subtitle">
            Jai Maa Kali. Your puja ritual request has been successfully submitted to the temple office.
          </p>

          <div class="booking-receipt-box">
            <div class="receipt-row-highlight">
              <span class="ref-label">Booking Reference:</span>
              <strong class="ref-code">{{ bookingResult.ref }}</strong>
            </div>

            <div class="receipt-grid">
              <div class="r-item">
                <span class="r-label">Ritual:</span>
                <span class="r-val">{{ puja?.name?.en }}</span>
              </div>
              <div class="r-item">
                <span class="r-label">Scheduled Date:</span>
                <span class="r-val">{{ preferredDate }}</span>
              </div>
              <div class="r-item">
                <span class="r-label">Time Slot:</span>
                <span class="r-val">{{ selectedSlotObject?.name?.en || 'Scheduled' }}</span>
              </div>
              <div class="r-item">
                <span class="r-label">Devotee:</span>
                <span class="r-val">{{ devoteeName }}</span>
              </div>
              <div class="r-item">
                <span class="r-label">Dakshina Total:</span>
                <span class="r-val price">৳ {{ bookingResult.totalAmount.toLocaleString() }} BDT</span>
              </div>
              <div class="r-item">
                <span class="r-label">Status:</span>
                <BookingStatusBadge status="new" />
              </div>
            </div>
          </div>

          <div class="confirm-actions">
            <NuxtLink to="/user/puja-bookings" class="btn-primary-action">
              View My Bookings
            </NuxtLink>
            <NuxtLink to="/user/puja" class="btn-secondary-action">
              Book Another Puja
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.booking-wizard-page {
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

/* Stepper Bar */
.stepper-wrap {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  overflow-x: auto;
}

.stepper-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 520px;
  position: relative;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background-color: #f5f5f4;
  border: 2px solid #d6d3d1;
  color: #78716c;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #78716c;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.step-node.active .step-circle {
  background-color: #7f1d2d;
  border-color: #7f1d2d;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(127, 29, 45, 0.15);
}

.step-node.active .step-label {
  color: #7f1d2d;
  font-weight: 700;
}

.step-node.completed .step-circle {
  background-color: #d97706;
  border-color: #d97706;
  color: #ffffff;
}

.step-node.completed .step-label {
  color: #d97706;
}

/* Step Card Styles */
.step-card {
  padding: 2rem;
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
}

.step-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f5f5f4;
}

.step-number-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #d97706;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.step-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #292524;
  margin: 0 0 0.375rem 0;
}

.step-desc {
  font-size: 0.9375rem;
  color: #78716c;
  margin: 0;
}

/* Form inputs */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #44403c;
}

.portal-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  color: #292524;
  background-color: #ffffff;
  border: 1px solid #d6d3d1;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s ease;
}

.portal-input:focus {
  border-color: #7f1d2d;
  box-shadow: 0 0 0 3px rgba(127, 29, 45, 0.1);
}

.portal-input.date-input {
  max-width: 320px;
}

.portal-input.textarea {
  resize: vertical;
}

.field-hint {
  font-size: 0.8125rem;
  color: #78716c;
}

/* Slots Grid */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.slot-btn {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem;
  background-color: #fffdfa;
  border: 1.5px solid #e7e5e4;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.slot-btn:hover {
  border-color: #d97706;
}

.slot-btn.selected {
  border-color: #7f1d2d;
  background-color: #fffbf8;
  box-shadow: 0 0 0 3px rgba(127, 29, 45, 0.1);
}

.slot-check-indicator {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid #a8a29e;
  margin-top: 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slot-btn.selected .slot-check-indicator {
  border-color: #7f1d2d;
}

.slot-btn.selected .inner-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background-color: #7f1d2d;
}

.slot-details {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.slot-en-name {
  font-weight: 700;
  font-size: 1rem;
  color: #292524;
}

.slot-bn-name {
  font-size: 0.875rem;
  color: #78716c;
  margin-left: 0.25rem;
}

.slot-time-range {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #57534e;
}

.slot-time-range svg {
  width: 1rem;
  height: 1rem;
  color: #d97706;
}

.slot-capacity-pill {
  font-size: 0.75rem;
  color: #15803d;
  background-color: #f0fdf4;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
  font-weight: 600;
}

/* Addons List */
.addons-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.addon-item-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background-color: #faf7f0;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.addon-item-card:hover {
  border-color: #d97706;
}

.addon-item-card.active {
  background-color: #fffbf8;
  border-color: #7f1d2d;
}

.portal-checkbox {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #7f1d2d;
  cursor: pointer;
}

.addon-info-col {
  flex: 1;
}

.addon-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #292524;
}

.addon-bn {
  font-size: 0.875rem;
  color: #78716c;
  margin-left: 0.25rem;
}

.addon-desc {
  font-size: 0.8125rem;
  color: #57534e;
  margin: 0.25rem 0 0 0;
}

.addon-price {
  font-weight: 700;
  color: #7f1d2d;
  font-size: 0.9375rem;
}

.live-addon-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #e7e5e4;
  font-size: 0.9375rem;
  color: #57534e;
}

.addon-subtotal {
  font-size: 1.125rem;
  font-weight: 700;
  color: #7f1d2d;
}

/* Summary Box */
.summary-box {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #fffdfa;
  border: 1px solid #e7e5e4;
  border-radius: 10px;
  padding: 1.5rem;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f5f5f4;
}

.summary-section:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.summary-sec-title {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #d97706;
  letter-spacing: 0.05em;
  margin: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
}

.summary-row .label {
  color: #78716c;
}

.summary-row .value {
  font-weight: 600;
  color: #292524;
}

.summary-row .highlight-val {
  color: #7f1d2d;
}

.grand-total-row {
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  border-top: 1.5px dashed #e7e5e4;
}

.grand-total-row .label {
  font-weight: 700;
  font-size: 1.0625rem;
  color: #292524;
}

.grand-total-row .total-amount {
  font-size: 1.375rem;
  font-weight: 800;
  color: #7f1d2d;
}

/* Payment Options */
.payment-options-grid {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 1.5rem;
}

.payment-option-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
  background-color: #fffdfa;
  border: 1.5px solid #e7e5e4;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.payment-option-card:hover {
  border-color: #d97706;
}

.payment-option-card.active {
  background-color: #fffbf8;
  border-color: #7f1d2d;
  box-shadow: 0 0 0 3px rgba(127, 29, 45, 0.08);
}

.portal-radio {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #7f1d2d;
  margin-top: 0.1875rem;
  cursor: pointer;
}

.option-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #292524;
}

.option-desc {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #57534e;
}

.instructions-panel {
  background-color: #fffbf5;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.inst-heading {
  margin: 0 0 0.75rem 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #9a3412;
}

.inst-grid {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #431407;
}

.trans-ref-group {
  margin-top: 1rem;
}

/* Alert Banner */
.wizard-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
}

.wizard-alert svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.error-banner {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Wizard Navigation Footer */
.wizard-nav-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
}

.btn-prev {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #57534e;
  background-color: #ffffff;
  border: 1px solid #d6d3d1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-prev:hover {
  background-color: #f5f5f4;
  color: #292524;
}

.btn-next,
.btn-submit {
  padding: 0.75rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #7f1d2d;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-next:hover,
.btn-submit:hover {
  background-color: #991b1b;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Step 7 Confirmation */
.confirmation-card {
  padding: 3rem 2rem;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  max-width: 680px;
  margin: 0 auto;
}

.success-icon-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: #f0fdf4;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
}

.success-icon-wrap svg {
  width: 2.25rem;
  height: 2.25rem;
}

.confirm-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #292524;
  margin: 0 0 0.5rem 0;
}

.confirm-subtitle {
  font-size: 1rem;
  color: #57534e;
  margin: 0 0 2rem 0;
}

.booking-receipt-box {
  background-color: #fffdfa;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: left;
  margin-bottom: 2rem;
}

.receipt-row-highlight {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #fed7aa;
  margin-bottom: 1rem;
}

.ref-label {
  font-size: 0.9375rem;
  color: #78716c;
}

.ref-code {
  font-size: 1.25rem;
  font-weight: 800;
  color: #7f1d2d;
  font-family: monospace;
}

.receipt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}

@media (max-width: 540px) {
  .receipt-grid {
    grid-template-columns: 1fr;
  }
}

.r-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.r-label {
  font-size: 0.8125rem;
  color: #78716c;
}

.r-val {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #292524;
}

.r-val.price {
  color: #7f1d2d;
  font-weight: 700;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 500px) {
  .confirm-actions {
    flex-direction: column;
  }
}

.btn-primary-action {
  padding: 0.875rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #7f1d2d;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.btn-primary-action:hover {
  background-color: #991b1b;
}

.btn-secondary-action {
  padding: 0.875rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #57534e;
  background-color: #f5f5f4;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.btn-secondary-action:hover {
  background-color: #e7e5e4;
  color: #292524;
}

.loading-state,
.error-card {
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
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
