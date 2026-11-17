<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";

const router = useRouter();

useHead({
  title: "Make a Donation - Devotee Portal",
});

interface CategoryItem {
  id: number;
  slug: string;
  name: { en: string; bn: string };
  description?: { en: string; bn: string } | null;
}

const categories = ref<CategoryItem[]>([]);
const selectedCategoryId = ref<number | null>(null);
const selectedAmountPreset = ref<number | null>(1000);
const customAmount = ref<string>("");

// Donor fields
const donorName = ref("");
const phone = ref("");
const email = ref("");
const isAnonymous = ref(false);
const message = ref("");

// Payment method
const paymentMethod = ref<"offline_cash" | "offline_bank" | "offline_mfs">("offline_cash");
const transactionReference = ref("");

// States
const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref("");
const successResult = ref<{ ref: string; amount: number } | null>(null);

const presetAmounts = [500, 1000, 2500, 5000];

const selectPreset = (amt: number) => {
  selectedAmountPreset.value = amt;
  customAmount.value = "";
};

const handleCustomAmountInput = () => {
  selectedAmountPreset.value = null;
};

const effectiveAmount = computed(() => {
  if (selectedAmountPreset.value) return selectedAmountPreset.value;
  const num = parseInt(customAmount.value, 10);
  return isNaN(num) ? 0 : num;
});

onMounted(async () => {
  isLoading.value = true;
  try {
    // 1. Fetch Categories
    const catRes = await $fetch<{ categories: CategoryItem[] }>("/api/public/donation-categories");
    if (catRes?.categories && catRes.categories.length > 0) {
      categories.value = catRes.categories;
      selectedCategoryId.value = catRes.categories[0].id;
    }

    // 2. Prefill user profile info
    try {
      const profRes = await $fetch<{ profile: any }>("/api/me/profile");
      if (profRes?.profile) {
        if (!donorName.value && profRes.profile.name) donorName.value = profRes.profile.name;
        if (!phone.value && profRes.profile.phone) phone.value = profRes.profile.phone;
        if (!email.value && profRes.profile.email) email.value = profRes.profile.email;
      }
    } catch {
      // Continue even if profile prefill fails
    }
  } catch (err) {
    console.warn("Could not load categories:", err);
  } finally {
    isLoading.value = false;
  }
});

const submitDonation = async () => {
  errorMessage.value = "";

  if (!selectedCategoryId.value) {
    errorMessage.value = "Please choose a donation purpose or category.";
    return;
  }

  const amt = effectiveAmount.value;
  if (!amt || amt < 10) {
    errorMessage.value = "Please specify a donation amount of at least ৳ 10.";
    return;
  }

  if (!donorName.value.trim() || donorName.value.trim().length < 2) {
    errorMessage.value = "Please enter the donor's full name.";
    return;
  }

  const bdPhoneRegex = /^(?:\+?880|0)1[3-9]\d{8}$/;
  if (!bdPhoneRegex.test(phone.value.trim())) {
    errorMessage.value = "Please provide a valid Bangladesh mobile number (e.g. 01711223344).";
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      categoryId: selectedCategoryId.value,
      amount: amt,
      donorName: donorName.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim() || null,
      paymentMethod: paymentMethod.value,
      transactionReference: transactionReference.value.trim() || null,
      message: message.value.trim() || null,
      isAnonymous: isAnonymous.value,
    };

    const res = await $fetch<{
      success: boolean;
      ref: string;
      amount: number;
      message: string;
    }>("/api/me/donations", {
      method: "POST",
      body: payload,
    });

    if (res?.success) {
      successResult.value = {
        ref: res.ref,
        amount: res.amount,
      };
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || "Failed to submit donation. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UserPortalShell
    title="Make a Sacred Contribution"
    subtitle="Offer seva and financial support to Sri Sri Golpahar Kali Mandir"
  >
    <div class="make-donation-page">
      <!-- Breadcrumb Link -->
      <div v-if="!successResult" class="back-nav-bar">
        <NuxtLink to="/user/donations" class="back-link">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          <span>Back to My Donations</span>
        </NuxtLink>
      </div>

      <!-- Success Screen -->
      <div v-if="successResult" class="portal-card success-card">
        <div class="success-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h2 class="success-title">Donation Record Submitted!</h2>
        <p class="success-desc">
          Jai Maa Kali. Your contribution record of <strong>৳ {{ successResult.amount.toLocaleString() }} BDT</strong> has been registered.
        </p>

        <div class="ref-box">
          <span class="ref-label">Donation Reference:</span>
          <strong class="ref-code">{{ successResult.ref }}</strong>
        </div>

        <p class="verification-notice">
          The temple accounts office will verify your remittance. Once reconciled, an official downloadable receipt will be generated in your portal.
        </p>

        <div class="success-actions">
          <NuxtLink to="/user/donations" class="btn-primary-action">
            View My Donations
          </NuxtLink>
          <NuxtLink to="/user/dashboard" class="btn-secondary-action">
            Return to Dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Donation Form -->
      <form v-else class="donation-form" @submit.prevent="submitDonation">
        <!-- Error Banner -->
        <div v-if="errorMessage" class="portal-alert error-banner">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- 1. Purpose / Category Selection -->
        <section class="portal-card section-card">
          <h3 class="sec-title">1. Select Seva / Donation Purpose</h3>
          <p class="sec-subtitle">Choose where your contribution will be utilized in service of the temple and devotees.</p>

          <div class="categories-grid">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="cat-btn"
              :class="{ active: selectedCategoryId === cat.id }"
              @click="selectedCategoryId = cat.id"
            >
              <div class="cat-radio-indicator">
                <div class="inner-dot"></div>
              </div>
              <div class="cat-text">
                <span class="cat-en-name">{{ cat.name.en }}</span>
                <span v-if="cat.name.bn" class="cat-bn-name">({{ cat.name.bn }})</span>
                <p v-if="cat.description?.en" class="cat-desc">{{ cat.description.en }}</p>
              </div>
            </button>
          </div>
        </section>

        <!-- 2. Donation Amount Selection -->
        <section class="portal-card section-card">
          <h3 class="sec-title">2. Choose Contribution Amount (BDT)</h3>
          <p class="sec-subtitle">Select a preset dakshina or enter a custom amount.</p>

          <div class="presets-row">
            <button
              v-for="amt in presetAmounts"
              :key="amt"
              type="button"
              class="preset-btn"
              :class="{ active: selectedAmountPreset === amt }"
              @click="selectPreset(amt)"
            >
              ৳ {{ amt.toLocaleString() }}
            </button>
          </div>

          <div class="custom-amt-wrap">
            <label for="customAmount" class="input-label">Or Custom Amount (BDT)</label>
            <div class="currency-input-wrap">
              <span class="currency-symbol">৳</span>
              <input
                id="customAmount"
                v-model="customAmount"
                type="number"
                min="10"
                step="1"
                placeholder="Enter amount (min ৳ 10)"
                class="portal-input custom-input"
                @input="handleCustomAmountInput"
              />
            </div>
          </div>
        </section>

        <!-- 3. Donor Information -->
        <section class="portal-card section-card">
          <h3 class="sec-title">3. Donor & Dedication Information</h3>
          <p class="sec-subtitle">This information appears on your official tax and temple receipt.</p>

          <div class="form-grid">
            <div class="form-group full-width">
              <label for="donorName" class="input-label">Full Name of Donor *</label>
              <input
                id="donorName"
                v-model="donorName"
                type="text"
                placeholder="e.g. Smt. Sumita Sen"
                class="portal-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone" class="input-label">Mobile Number *</label>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                placeholder="01711223344"
                class="portal-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="email" class="input-label">Email Address (Optional)</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="donor@example.com"
                class="portal-input"
              />
            </div>

            <div class="form-group full-width">
              <label for="message" class="input-label">Prayer / In Memory Of / Dedication (Optional)</label>
              <textarea
                id="message"
                v-model="message"
                rows="2"
                placeholder="e.g. In memory of late grandparents, for family well-being..."
                class="portal-input textarea"
              ></textarea>
            </div>

            <div class="form-group full-width checkbox-row">
              <label class="checkbox-label">
                <input v-model="isAnonymous" type="checkbox" class="portal-checkbox" />
                <span>Keep my name anonymous on public donor boards and acknowledgments</span>
              </label>
            </div>
          </div>
        </section>

        <!-- 4. Payment Method & Instructions -->
        <section class="portal-card section-card">
          <h3 class="sec-title">4. Remittance Method</h3>
          <p class="sec-subtitle">Please select your preferred offline contribution channel.</p>

          <div class="payment-methods-list">
            <label
              class="pay-option-card"
              :class="{ active: paymentMethod === 'offline_cash' }"
            >
              <input
                v-model="paymentMethod"
                type="radio"
                value="offline_cash"
                class="portal-radio"
              />
              <div class="pay-option-content">
                <h4 class="pay-option-title">Cash at Temple Office Counter</h4>
                <p class="pay-option-desc">Deposit your contribution at the mandir counter. You will receive an instant stamp verification.</p>
              </div>
            </label>

            <label
              class="pay-option-card"
              :class="{ active: paymentMethod === 'offline_bank' }"
            >
              <input
                v-model="paymentMethod"
                type="radio"
                value="offline_bank"
                class="portal-radio"
              />
              <div class="pay-option-content">
                <h4 class="pay-option-title">Direct Bank Transfer (EFT / BEFTN / NPSB)</h4>
                <p class="pay-option-desc">Remit directly into the official bank account of Golpahar Kali Mandir.</p>
              </div>
            </label>

            <label
              class="pay-option-card"
              :class="{ active: paymentMethod === 'offline_mfs' }"
            >
              <input
                v-model="paymentMethod"
                type="radio"
                value="offline_mfs"
                class="portal-radio"
              />
              <div class="pay-option-content">
                <h4 class="pay-option-title">bKash / Nagad Mobile Financial Service</h4>
                <p class="pay-option-desc">Transfer via bKash or Nagad merchant account from your mobile phone.</p>
              </div>
            </label>
          </div>

          <!-- Instruction Details Box -->
          <div v-if="paymentMethod === 'offline_bank'" class="instructions-panel">
            <h4 class="inst-panel-title">Official Temple Bank Details</h4>
            <div class="inst-data-grid">
              <div><strong>Account Name:</strong> Golpahar Mohashoshan Kali Mandir</div>
              <div><strong>Bank Name:</strong> The City Bank Limited</div>
              <div><strong>Account Number:</strong> 1102938475001</div>
              <div><strong>Branch:</strong> GEC Circle Branch, Chattogram</div>
              <div><strong>Routing Number:</strong> 225151234</div>
            </div>
          </div>

          <div v-else-if="paymentMethod === 'offline_mfs'" class="instructions-panel">
            <h4 class="inst-panel-title">Official MFS Merchant Accounts</h4>
            <div class="inst-data-grid">
              <div><strong>bKash Merchant:</strong> 01711-223344 (Choose 'Make Payment')</div>
              <div><strong>Nagad Merchant:</strong> 01711-223344 (Choose 'Merchant Pay')</div>
              <div><strong>Reference:</strong> Enter your mobile number as reference</div>
            </div>
          </div>

          <!-- Transaction Reference -->
          <div v-if="paymentMethod !== 'offline_cash'" class="form-group trans-group">
            <label for="transRef" class="input-label">Transaction ID / Bank Slip Number (Optional)</label>
            <input
              id="transRef"
              v-model="transactionReference"
              type="text"
              placeholder="e.g. 9B3K9A123 or deposit receipt number"
              class="portal-input"
            />
            <span class="field-hint">Helps the temple accounts desk verify your remittance faster.</span>
          </div>
        </section>

        <!-- Submit Button -->
        <div class="form-submit-row">
          <button
            type="submit"
            class="btn-submit-donation"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Submitting Contribution...</span>
            <span v-else>Submit Donation of ৳ {{ effectiveAmount.toLocaleString() }} BDT</span>
          </button>
        </div>
      </form>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.make-donation-page {
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

.donation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.75rem 2rem;
}

.sec-title {
  margin: 0 0 0.375rem 0;
  font-size: 1.1875rem;
  font-weight: 700;
  color: #292524;
}

.sec-subtitle {
  margin: 0 0 1.25rem 0;
  font-size: 0.875rem;
  color: #78716c;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.875rem;
}

.cat-btn {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.125rem;
  background-color: #fffdfa;
  border: 1.5px solid #e7e5e4;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.cat-btn:hover {
  border-color: #d97706;
}

.cat-btn.active {
  border-color: #7f1d2d;
  background-color: #fffbf8;
  box-shadow: 0 0 0 3px rgba(127, 29, 45, 0.08);
}

.cat-radio-indicator {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  border: 2px solid #a8a29e;
  margin-top: 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cat-btn.active .cat-radio-indicator {
  border-color: #7f1d2d;
}

.cat-btn.active .inner-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #7f1d2d;
}

.cat-text {
  display: flex;
  flex-direction: column;
}

.cat-en-name {
  font-weight: 700;
  font-size: 0.9375rem;
  color: #292524;
}

.cat-bn-name {
  font-size: 0.8125rem;
  color: #78716c;
}

.cat-desc {
  margin: 0.375rem 0 0 0;
  font-size: 0.8125rem;
  color: #57534e;
  line-height: 1.35;
}

/* Preset Buttons */
.presets-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.preset-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #57534e;
  background-color: #faf7f0;
  border: 1.5px solid #e7e5e4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  border-color: #d97706;
}

.preset-btn.active {
  background-color: #7f1d2d;
  border-color: #7f1d2d;
  color: #ffffff;
}

.custom-amt-wrap {
  max-width: 320px;
}

.currency-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: #7f1d2d;
}

.portal-input.custom-input {
  padding-left: 2.25rem;
  font-size: 1.125rem;
  font-weight: 700;
}

/* Form Grid */
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

.portal-input.textarea {
  resize: vertical;
}

.field-hint {
  font-size: 0.8125rem;
  color: #78716c;
}

.checkbox-row {
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  color: #57534e;
  cursor: pointer;
}

.portal-checkbox {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #7f1d2d;
}

/* Payment Methods */
.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 1.5rem;
}

.pay-option-card {
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

.pay-option-card:hover {
  border-color: #d97706;
}

.pay-option-card.active {
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

.pay-option-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #292524;
}

.pay-option-desc {
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

.inst-panel-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #9a3412;
}

.inst-data-grid {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #431407;
}

.trans-group {
  margin-top: 1rem;
}

/* Submit */
.form-submit-row {
  display: flex;
  justify-content: flex-end;
}

.btn-submit-donation {
  padding: 0.875rem 2.25rem;
  font-size: 1.0625rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #7f1d2d;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-submit-donation:hover {
  background-color: #991b1b;
}

.btn-submit-donation:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Error Banner */
.portal-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
}

.portal-alert svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.error-banner {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Success Card */
.success-card {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 640px;
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

.success-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.625rem;
  font-weight: 800;
  color: #292524;
}

.success-desc {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: #57534e;
}

.ref-box {
  background-color: #faf7f0;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
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

.verification-notice {
  font-size: 0.875rem;
  color: #78716c;
  line-height: 1.5;
  margin: 0 0 2rem 0;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 500px) {
  .success-actions {
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
</style>
