<script setup lang="ts">
import { ref, reactive, computed } from "vue";

useHead({
  title: "Contact Us & Devotee Desk",
  meta: [
    {
      name: "description",
      content:
        "Official contact information, darshan hours, devotee helpline, and inquiry desk for Golpahar Mohashoshan Kali Mandir, Chittagong, Bangladesh.",
    },
    { property: "og:title", content: "Contact Mandir Office - Golpahar Mohashoshan Kali Mandir" },
    {
      property: "og:description",
      content:
        "Connect with temple administration for daily darshan timings, puja bookings, annadanam sponsorship, and pilgrim assistance.",
    },
  ],
});

// Category options for the inquiry subject
const subjectCategories = [
  { label: "Daily Darshan & Temple Visit", value: "Daily Darshan & Temple Visit" },
  { label: "Puja & Sankalpa Service", value: "Puja & Sankalpa Service" },
  { label: "Annadanam & Mahaprasad Seva", value: "Annadanam & Mahaprasad Seva" },
  { label: "Antim Sanskar / Shoshan Guidelines", value: "Antim Sanskar / Shoshan Guidelines" },
  { label: "Donation & Trust Inquiries", value: "Donation & Trust Inquiries" },
  { label: "General Devotee Message", value: "General Devotee Message" },
  { label: "Other / Custom Topic", value: "custom" },
];

// Dynamic Site Settings from backend (with canonical fallbacks)
const { data: siteSettings } = await useFetch<any>("/api/cms/site-settings", {
  key: "contact_page_site_settings",
  server: true,
});

const templeFormalName = computed(() => siteSettings.value?.brand?.siteTitle || "Sri Sri Golpahar Mohashoshan Kali Mandir");
const contactAddress = computed(() => siteSettings.value?.contact?.address || "Golpahar Moor, O.R. Nizam Road / Mehedibag Road,\nChittagong-4000, Bangladesh.");
const googleMapsUrl = computed(() => siteSettings.value?.contact?.googleMapsUrl || "https://www.google.com/maps/search/?api=1&query=Golpahar+Mohashoshan+Kali+Mandir+Chittagong");
const contactPhone = computed(() => siteSettings.value?.contact?.phone || "+880 2-41356335");
const contactPhoneClean = computed(() => contactPhone.value.replace(/[^0-9+]/g, ""));
const contactWhatsapp = computed(() => siteSettings.value?.social?.whatsappNumber || "+880 1819-123456");
const contactWhatsappClean = computed(() => contactWhatsapp.value.replace(/[^0-9]/g, ""));
const contactEmail = computed(() => siteSettings.value?.contact?.email || "office@golpaharkalimandir.org");

const defaultCategory = subjectCategories[0]?.value ?? "Daily Darshan & Temple Visit";
const selectedCategory = ref(defaultCategory);
const isCustomSubject = computed(() => selectedCategory.value === "custom");

const form = reactive({
  name: "",
  phone: "",
  email: "",
  customSubject: "",
  message: "",
  honeypot: "",
  turnstileToken: "mock-token",
});

const isSubmitting = ref(false);
const isSuccess = ref(false);
const successMessage = ref("");
const submissionRefId = ref<number | null>(null);
const errorMessage = ref("");
const fieldErrors = ref<Record<string, string[]>>({});

// Dynamic character count for message
const charCount = computed(() => form.message.length);
const minChars = 5;
const maxChars = 2000;
const isMessageValid = computed(() => charCount.value >= minChars && charCount.value <= maxChars);

// Client-side validation
const validateForm = (): boolean => {
  fieldErrors.value = {};
  let valid = true;

  if (!form.name || form.name.trim().length < 2) {
    fieldErrors.value.name = ["Name must be at least 2 characters"];
    valid = false;
  }

  const effectiveSubject = isCustomSubject.value
    ? form.customSubject.trim()
    : selectedCategory.value;

  if (!effectiveSubject || effectiveSubject.length < 2) {
    fieldErrors.value.subject = ["Subject must be at least 2 characters"];
    valid = false;
  }

  if (form.email && form.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      fieldErrors.value.email = ["Please enter a valid email address"];
      valid = false;
    }
  }

  if (!form.message || form.message.trim().length < minChars) {
    fieldErrors.value.message = [`Message must be at least ${minChars} characters`];
    valid = false;
  } else if (form.message.length > maxChars) {
    fieldErrors.value.message = [`Message cannot exceed ${maxChars} characters`];
    valid = false;
  }

  return valid;
};

// Handle form submission
const handleSubmit = async () => {
  errorMessage.value = "";
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const effectiveSubject = isCustomSubject.value
      ? form.customSubject.trim()
      : selectedCategory.value;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      subject: effectiveSubject,
      message: form.message.trim(),
      honeypot: form.honeypot,
      turnstileToken: form.turnstileToken || "mock-token",
    };

    const response = await $fetch<{ success: boolean; message: string; id?: number }>(
      "/api/forms/contact",
      {
        method: "POST",
        body: payload,
      }
    );

    if (response.success) {
      isSuccess.value = true;
      successMessage.value =
        response.message || "Thank you. Your message has been received by the temple office.";
      submissionRefId.value = response.id || null;
      // Reset form fields
      form.name = "";
      form.phone = "";
      form.email = "";
      form.customSubject = "";
      form.message = "";
      selectedCategory.value = defaultCategory;
    }
  } catch (err: any) {
    if (err?.data?.data) {
      fieldErrors.value = err.data.data;
    }
    errorMessage.value =
      err?.data?.message ||
      err?.statusMessage ||
      "Unable to send message. Please review the highlighted fields and try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const handleReset = () => {
  isSuccess.value = false;
  successMessage.value = "";
  submissionRefId.value = null;
  errorMessage.value = "";
  fieldErrors.value = {};
};
</script>

<template>
  <div class="contact-page">
    <!-- Breadcrumb Bar -->

    <!-- Hero Header -->
    <header class="contact-hero">
      <div class="contact-container hero-inner">
        <div class="hero-badge">
          <span class="badge-dot" aria-hidden="true"></span>
          <span>Pilgrim Helpline &amp; Office Desk</span>
        </div>

        <h1 class="hero-title">
          <span class="english-title">Contact Mandir Office</span>
        </h1>

        <p class="hero-subtitle">
          Welcome to Golpahar Mohashoshan Kali Mandir. Whether you are planning a pilgrim visit,
          arranging a special puja offering, or seeking temple trust guidance, our office desk is here to assist.
        </p>

        <div class="hero-quick-status">
          <div class="status-item">
            <span class="status-indicator"></span>
            <span>Mandir Open Daily</span>
          </div>
          <div class="status-divider" aria-hidden="true">·</div>
          <div class="status-item">
            <span>Morning 05:00 AM – 12:30 PM</span>
          </div>
          <div class="status-divider" aria-hidden="true">·</div>
          <div class="status-item">
            <span>Evening 04:30 PM – 09:30 PM</span>
          </div>
        </div>

        <div class="hero-divider" aria-hidden="true"></div>
      </div>
    </header>

    <!-- Main Content Layout -->
    <section class="contact-content-section" aria-label="Temple Information and Contact Form">
      <div class="contact-container">
        <div class="contact-grid">
          <!-- LEFT COLUMN: Mandir Info, Timings, Direct Contacts -->
          <div class="info-column">
            <!-- 1. Location & How to Reach Card -->
            <div class="info-card location-card">
              <div class="card-header">
                <div class="card-icon-wrap" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h2 class="card-title">Temple Location</h2>
                </div>
              </div>

              <div class="card-body">
                <div class="address-box">
                  <strong class="temple-formal-name">{{ templeFormalName }}</strong>
                  <p class="address-text" style="white-space: pre-line;">
                    {{ contactAddress }}
                  </p>
                  <p class="landmark-text">
                    <em>Landmark:</em> Situated opposite Chittagong Medical College East Gate area, near Prabartak Circle.
                  </p>
                </div>

                <div class="directions-actions">
                  <a
                    :href="googleMapsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-directions"
                  >
                    <span>Open in Google Maps</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" class="action-icon" aria-hidden="true">
                      <path
                        d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"
                      />
                      <path
                        d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <!-- 3. Direct Contact Channels Card -->
            <div class="info-card contacts-card">
              <div class="card-header">
                <div class="card-icon-wrap" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 class="card-title">Helpline &amp; Direct Channels</h2>
                </div>
              </div>

              <div class="card-body">
                <div class="channels-list">
                  <!-- Landline Devotee Desk -->
                  <div class="channel-item">
                    <div class="channel-info">
                      <span class="channel-label">Temple Devotee Desk</span>
                      <a :href="`tel:${contactPhoneClean}`" class="channel-link">{{ contactPhone }}</a>
                    </div>
                    <a :href="`tel:${contactPhoneClean}`" class="channel-action-btn" title="Call devotee desk">
                      Call
                    </a>
                  </div>

                  <!-- WhatsApp Helpline -->
                  <div class="channel-item">
                    <div class="channel-info">
                      <span class="channel-label">Devotee WhatsApp Assistance</span>
                      <a
                        :href="`https://wa.me/${contactWhatsappClean}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="channel-link"
                      >
                        {{ contactWhatsapp }}
                      </a>
                    </div>
                    <a
                      :href="`https://wa.me/${contactWhatsappClean}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="channel-action-btn whatsapp-btn"
                      title="Open WhatsApp chat"
                    >
                      WhatsApp
                    </a>
                  </div>

                  <!-- Email -->
                  <div class="channel-item">
                    <div class="channel-info">
                      <span class="channel-label">Official Inquiries &amp; Trust Email</span>
                      <a :href="`mailto:${contactEmail}`" class="channel-link">
                        {{ contactEmail }}
                      </a>
                    </div>
                    <a
                      :href="`mailto:${contactEmail}`"
                      class="channel-action-btn"
                      title="Send email"
                    >
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Sacred Devotee Inquiry Form -->
          <div class="form-column">
            <div id="contact-inquiry-form" class="inquiry-form-card">
              <!-- Success State Confirmation View -->
              <div v-if="isSuccess" class="form-success-state" role="status" aria-live="polite">
                <div class="success-icon-wrap" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>

                <h2 class="success-title">Message Received</h2>

                <p class="success-message">
                  {{ successMessage }}
                </p>

                <div v-if="submissionRefId" class="reference-box">
                  <span class="ref-label">Inquiry Reference Number</span>
                  <span class="ref-value">#GKM-{{ submissionRefId.toString().padStart(5, '0') }}</span>
                </div>

                <p class="success-note">
                  The Golpahar Kali Mandir Seva Desk will review your message and reach out promptly.
                  Blessings of Mother Kali be upon you and your family.
                </p>

                <button type="button" class="btn btn-reset" @click="handleReset">
                  <span>Send Another Message</span>
                </button>
              </div>

              <!-- Main Submission Form View -->
              <div v-else>
                <div class="form-header">
                  <h2 class="form-title">Send an Inquiry</h2>
                  <p class="form-description">
                    Fill out the form below. Whether inquiring about Sankalpa puja, daily bhog,
                    or general information, our devotee desk will respond within 24–48 hours.
                  </p>
                </div>

                <!-- Error Alert Box -->
                <div
                  v-if="errorMessage"
                  class="alert-error"
                  role="alert"
                  aria-live="assertive"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div class="alert-content">
                    <span class="alert-heading">Notice</span>
                    <p class="alert-text">{{ errorMessage }}</p>
                  </div>
                </div>

                <form class="contact-form" novalidate @submit.prevent="handleSubmit">
                  <!-- Honeypot Anti-Spam Field (Hidden from humans) -->
                  <div class="hp-field" aria-hidden="true">
                    <label for="contact-hp">Leave this empty if human</label>
                    <input
                      id="contact-hp"
                      v-model="form.honeypot"
                      type="text"
                      name="website_verify"
                      autocomplete="off"
                      tabindex="-1"
                    />
                  </div>

                  <!-- 1. Full Name -->
                  <div class="form-group" :class="{ 'has-error': fieldErrors.name }">
                    <label for="contact-name" class="form-label">
                      <span>Full Name</span>
                      <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      v-model="form.name"
                      type="text"
                      class="form-input"
                      placeholder="e.g., Anirban Roy"
                      required
                      maxlength="100"
                      :disabled="isSubmitting"
                    />
                    <p v-if="fieldErrors.name" class="field-error-text">
                      {{ fieldErrors.name[0] }}
                    </p>
                  </div>

                  <!-- 2. Two-Column Row: Phone & Email -->
                  <div class="form-row-2">
                    <!-- Contact Phone -->
                    <div class="form-group" :class="{ 'has-error': fieldErrors.phone }">
                      <label for="contact-phone" class="form-label">
                        <span>Mobile Phone</span>
                        <span class="optional-mark">(Optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        v-model="form.phone"
                        type="tel"
                        class="form-input"
                        placeholder="e.g., 01819123456"
                        maxlength="20"
                        :disabled="isSubmitting"
                      />
                      <p v-if="fieldErrors.phone" class="field-error-text">
                        {{ fieldErrors.phone[0] }}
                      </p>
                    </div>

                    <!-- Email Address -->
                    <div class="form-group" :class="{ 'has-error': fieldErrors.email }">
                      <label for="contact-email" class="form-label">
                        <span>Email Address</span>
                        <span class="optional-mark">(Optional)</span>
                      </label>
                      <input
                        id="contact-email"
                        v-model="form.email"
                        type="email"
                        class="form-input"
                        placeholder="e.g., devotee@example.com"
                        :disabled="isSubmitting"
                      />
                      <p v-if="fieldErrors.email" class="field-error-text">
                        {{ fieldErrors.email[0] }}
                      </p>
                    </div>
                  </div>

                  <!-- 3. Subject / Category Selection -->
                  <div class="form-group" :class="{ 'has-error': fieldErrors.subject }">
                    <label for="contact-category" class="form-label">
                      <span>Inquiry Topic / Category</span>
                      <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <div class="select-wrapper">
                      <select
                        id="contact-category"
                        v-model="selectedCategory"
                        class="form-select"
                        :disabled="isSubmitting"
                      >
                        <option
                          v-for="cat in subjectCategories"
                          :key="cat.value"
                          :value="cat.value"
                        >
                          {{ cat.label }}
                        </option>
                      </select>
                      <svg viewBox="0 0 20 20" fill="currentColor" class="select-arrow" aria-hidden="true">
                        <path
                          fill-rule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>

                    <!-- Custom Subject input when "Other" is chosen -->
                    <div v-if="isCustomSubject" class="custom-subject-wrap">
                      <input
                        v-model="form.customSubject"
                        type="text"
                        class="form-input custom-input"
                        placeholder="Please specify your subject"
                        maxlength="200"
                        :disabled="isSubmitting"
                      />
                    </div>
                    <p v-if="fieldErrors.subject" class="field-error-text">
                      {{ fieldErrors.subject[0] }}
                    </p>
                  </div>

                  <!-- 4. Message Content -->
                  <div class="form-group" :class="{ 'has-error': fieldErrors.message }">
                    <div class="label-with-counter">
                      <label for="contact-message" class="form-label">
                        <span>Your Message</span>
                        <span class="required-mark" aria-hidden="true">*</span>
                      </label>
                      <span class="char-counter" :class="{ 'counter-valid': isMessageValid }">
                        {{ charCount }} / {{ maxChars }} chars
                      </span>
                    </div>

                    <textarea
                      id="contact-message"
                      v-model="form.message"
                      rows="5"
                      class="form-textarea"
                      placeholder="Please share your inquiry details, preferred puja dates, or questions here..."
                      maxlength="2000"
                      required
                      :disabled="isSubmitting"
                    ></textarea>

                    <p v-if="fieldErrors.message" class="field-error-text">
                      {{ fieldErrors.message[0] }}
                    </p>
                    <p v-else class="field-hint">
                      Minimum 5 characters. Please do not submit financial or password information.
                    </p>
                  </div>

                  <!-- Devotee Assurance Pill -->
                  <div class="assurance-pill">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="assurance-icon" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Your personal information is kept strictly confidential per Mandir Trust policy.</span>
                  </div>

                  <!-- Submit Action Button -->
                  <div class="form-actions">
                    <button
                      type="submit"
                      class="btn btn-submit"
                      :disabled="isSubmitting"
                    >
                      <span v-if="isSubmitting" class="submitting-inline">
                        <svg class="spinner" viewBox="0 0 24 24" fill="none">
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Sending Message...</span>
                      </span>

                      <span v-else class="btn-label-group">
                        <span>Send Message</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" class="btn-arrow" aria-hidden="true">
                          <path
                            fill-rule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* --------------------------------------------------------------------------
   CONTACT PAGE DESIGN SYSTEM
   Aligned with global temple tokens, golden highlights, and dark mode harmony.
-------------------------------------------------------------------------- */

.contact-page {
  width: 100%;
  min-height: 85vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding-top: calc(var(--nav-height, 72px) + 2rem);
  padding-bottom: 5rem;
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Breadcrumb Navigation */
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
.contact-hero {
  padding: 2.5rem 1.5rem 2.5rem;
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
  font-family: inherit;
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

/* Two-Column Grid Layout */
.contact-content-section {
  padding-top: 1.5rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 960px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

/* Info Cards (Left Column) */
.info-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

html[data-theme="dark"] .info-card,
html.dark .info-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
}

.card-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: rgba(110, 5, 22, 0.06);
  color: var(--accent-text);
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

html[data-theme="dark"] .card-icon-wrap,
html.dark .card-icon-wrap {
  background-color: rgba(212, 175, 55, 0.1);
  color: var(--accent-gold);
  border: 1px solid rgba(212, 175, 55, 0.25);
}

.card-icon-wrap svg {
  width: 22px;
  height: 22px;
}

.card-title {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0;
  line-height: 1.2;
}

.card-subtitle-bn {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

/* Location Card Body */
.temple-formal-name {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--accent-text);
  margin-bottom: 0.5rem;
}

.address-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.landmark-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0 0 1.25rem;
}

.btn-directions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.15rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--accent-text);
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-directions:hover {
  background: var(--accent);
  color: var(--btn-primary-text);
  border-color: var(--accent);
}

.btn-directions:hover svg {
  color: var(--btn-primary-text);
  fill: currentColor;
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* Timings Card List */
.timings-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.timing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--border-subtle);
}

.timing-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.timing-meta {
  display: flex;
  flex-direction: column;
}

.timing-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}

.timing-desc {
  font-size: 0.775rem;
  color: var(--text-muted);
}

.timing-value {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--accent-text);
  white-space: nowrap;
}

.highlight-row {
  background: rgba(224, 165, 38, 0.09);
  padding: 0.65rem 0.85rem;
  border-radius: 6px;
  border-bottom: none;
}

html[data-theme="dark"] .highlight-row,
html.dark .highlight-row {
  background: rgba(212, 175, 55, 0.1);
}

/* Contacts Channels List */
.channels-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.channel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.85rem;
  background: var(--bg-hover, rgba(224, 165, 38, 0.04));
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

html[data-theme="dark"] .channel-item,
html.dark .channel-item {
  background: var(--bg-secondary);
  border-color: var(--border-subtle);
}

.channel-info {
  display: flex;
  flex-direction: column;
}

.channel-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}

.channel-link {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent-text);
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.channel-link:hover {
  text-decoration: underline;
  opacity: 0.85;
}

.channel-action-btn {
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--accent-text);
  font-size: 0.8125rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s ease;
}

.channel-action-btn:hover {
  background: var(--accent);
  color: var(--btn-primary-text);
  border-color: var(--accent);
}

.whatsapp-btn {
  background: rgba(37, 211, 102, 0.12) !important;
  border-color: rgba(37, 211, 102, 0.4) !important;
  color: #128C7E !important;
}

html[data-theme="dark"] .whatsapp-btn,
html.dark .whatsapp-btn {
  color: #4ADE80 !important;
  border-color: rgba(74, 222, 128, 0.3) !important;
}

.whatsapp-btn:hover {
  background: #128C7E !important;
  color: #FFFFFF !important;
}

/* Notice Card (Emergency / Antim Sanskar) */
.notice-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(110, 5, 22, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

html[data-theme="dark"] .notice-card,
html.dark .notice-card {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.25);
}

.notice-icon {
  color: var(--accent-text);
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.notice-title {
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--accent-text);
  margin: 0 0 0.25rem;
}

.notice-desc {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
}

/* RIGHT COLUMN: Inquiry Form Card */
.inquiry-form-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border-color);
  border-radius: 14px;
  padding: 2.25rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

html[data-theme="dark"] .inquiry-form-card,
html.dark .inquiry-form-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

@media (max-width: 640px) {
  .inquiry-form-card {
    padding: 1.5rem;
  }
}

.form-header {
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.form-title {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--heading-color);
  margin: 0 0 0.25rem;
}

.form-title-bn {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-text);
  margin-bottom: 0.5rem;
}

.form-description {
  font-size: 0.925rem;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
}

/* Alert Error Banner */
.alert-error {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.95rem 1.15rem;
  margin-bottom: 1.5rem;
  background-color: #FEF2F2;
  border: 1px solid #F87171;
  border-radius: 8px;
  color: #991B1B;
}

html[data-theme="dark"] .alert-error,
html.dark .alert-error {
  background-color: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
  color: #FCA5A5;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.alert-heading {
  font-weight: 800;
  font-size: 0.875rem;
  display: block;
  margin-bottom: 0.15rem;
}

.alert-text {
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
}

/* Form Styles */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Honeypot hidden input */
.hp-field {
  position: absolute;
  left: -9999px;
  opacity: 0;
  height: 0;
  width: 0;
  overflow: hidden;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}

.form-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-mark {
  color: #DC2626;
  font-weight: 800;
}

.optional-mark {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}

.label-with-counter {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-counter {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.char-counter.counter-valid {
  color: #16A34A;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 0.95rem;
  font-family: inherit;
  font-size: 0.9375rem;
  color: var(--text-primary);
  background-color: var(--bg-card);
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.select-wrapper {
  position: relative;
}

.form-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2.5rem;
  cursor: pointer;
}

.select-arrow {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--accent-text);
  pointer-events: none;
}

.custom-subject-wrap {
  margin-top: 0.5rem;
}

.field-error-text {
  font-size: 0.8rem;
  color: #DC2626;
  font-weight: 600;
  margin: 0.2rem 0 0;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.2rem 0 0;
}

.has-error .form-input,
.has-error .form-textarea,
.has-error .form-select {
  border-color: #DC2626;
  background-color: #FFF5F5;
}

/* Assurance Pill */
.assurance-pill {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 0.85rem;
  background: rgba(224, 165, 38, 0.06);
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  font-size: 0.775rem;
  color: var(--text-secondary);
}

html[data-theme="dark"] .assurance-pill,
html.dark .assurance-pill {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.25);
}

.assurance-icon {
  width: 16px;
  height: 16px;
  color: var(--accent-text);
  flex-shrink: 0;
}

/* Form Action Buttons */
.form-actions {
  margin-top: 0.75rem;
}

.btn-submit {
  width: 100%;
  padding: 0.95rem 1.5rem;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: 1px solid var(--btn-primary-bg);
  border-radius: 9px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: var(--btn-primary-hover);
  border-color: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-label-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.btn-submit:hover .btn-arrow {
  transform: translateX(3px);
}

.submitting-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Success Confirmation State */
.form-success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1rem;
}

.success-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(22, 163, 74, 0.12);
  color: #16A34A;
  border: 2px solid rgba(22, 163, 74, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.success-icon-wrap svg {
  width: 32px;
  height: 32px;
}

.success-title {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--heading-color);
  margin: 0 0 0.25rem;
}

.success-subtitle-bn {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent-text);
  margin: 0 0 1rem;
}

.success-message {
  font-size: 1rem;
  line-height: 1.55;
  color: var(--text-primary);
  margin: 0 0 1.25rem;
  max-width: 440px;
}

.reference-box {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.5rem;
  background: rgba(224, 165, 38, 0.12);
  border: 1px dashed var(--accent);
  border-radius: 8px;
  margin-bottom: 1.25rem;
}

html[data-theme="dark"] .reference-box,
html.dark .reference-box {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.4);
}

.ref-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.ref-value {
  font-family: var(--font-serif, "Cinzel", Georgia, serif);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--accent-text);
  letter-spacing: 0.05em;
}

.success-note {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 1.75rem;
  max-width: 460px;
}

.btn-reset {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1.5px solid var(--border-color);
  color: var(--accent-text);
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: var(--accent);
  color: var(--btn-primary-text);
  border-color: var(--accent);
}

/* --------------------------------------------------------------------------
   DARK THEME SPECIFIC POLISH (Exact match with site-wide dark architecture)
-------------------------------------------------------------------------- */
html[data-theme="dark"] .contact-page .form-input,
html[data-theme="dark"] .contact-page .form-textarea,
html[data-theme="dark"] .contact-page .form-select,
html.dark .contact-page .form-input,
html.dark .contact-page .form-textarea,
html.dark .contact-page .form-select {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

html[data-theme="dark"] .contact-page .form-input::placeholder,
html[data-theme="dark"] .contact-page .form-textarea::placeholder,
html.dark .contact-page .form-input::placeholder,
html.dark .contact-page .form-textarea::placeholder {
  color: var(--text-secondary);
}

html[data-theme="dark"] .contact-page .form-input:focus,
html[data-theme="dark"] .contact-page .form-textarea:focus,
html[data-theme="dark"] .contact-page .form-select:focus,
html.dark .contact-page .form-input:focus,
html.dark .contact-page .form-textarea:focus,
html.dark .contact-page .form-select:focus {
  background-color: #252B33;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

html[data-theme="dark"] .contact-page .has-error .form-input,
html[data-theme="dark"] .contact-page .has-error .form-textarea,
html[data-theme="dark"] .contact-page .has-error .form-select,
html.dark .contact-page .has-error .form-input,
html.dark .contact-page .has-error .form-textarea,
html.dark .contact-page .has-error .form-select {
  border-color: #EF4444;
  background-color: rgba(239, 68, 68, 0.12);
  color: #FFFFFF;
}
</style>
