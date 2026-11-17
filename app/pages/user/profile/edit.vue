<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";
import type { DevoteeFullProfile } from "~~/server/services/user-profile";
import { devoteeProfileUpdateSchema } from "~~/shared/schemas/user-portal";

useHead({
  title: "Edit Profile - Devotee Portal",
});

const router = useRouter();

const name = ref("");
const phone = ref("");
const profileImage = ref("");
const address = ref("");
const city = ref("");
const state = ref("");
const postalCode = ref("");
const country = ref("Bangladesh");

const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const fetchCurrentProfile = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<{ profile: DevoteeFullProfile }>("/api/me/profile");
    if (res?.profile) {
      const p = res.profile;
      name.value = p.name || "";
      phone.value = p.phone || "";
      profileImage.value = p.profileImage || "";
      address.value = p.address || "";
      city.value = p.city || "";
      state.value = p.state || "";
      postalCode.value = p.postalCode || "";
      country.value = p.country || "Bangladesh";
    }
  } catch (err) {
    console.warn("Could not load profile to edit:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCurrentProfile();
});

const handleSaveProfile = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  const input = {
    name: name.value.trim(),
    phone: phone.value.trim() || null,
    profileImage: profileImage.value.trim() || null,
    address: address.value.trim() || null,
    city: city.value.trim() || null,
    state: state.value.trim() || null,
    postalCode: postalCode.value.trim() || null,
    country: country.value.trim() || "Bangladesh",
  };

  const validation = devoteeProfileUpdateSchema.safeParse(input);
  if (!validation.success) {
    errorMessage.value = "Please ensure your phone number and details are formatted correctly.";
    return;
  }

  isSaving.value = true;
  try {
    const res = await $fetch<{ success: boolean }>("/api/me/profile", {
      method: "PUT",
      body: input,
    });

    if (res.success) {
      successMessage.value = "Your profile has been saved successfully.";
      setTimeout(() => {
        router.push("/user/profile");
      }, 800);
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || "Failed to save profile changes.";
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <UserPortalShell
    title="Edit Devotee Profile"
    subtitle="Update your personal information, contact number, and temple correspondence address"
  >
    <div class="edit-page-container">
      <form class="portal-card edit-card" @submit.prevent="handleSaveProfile">
        <!-- Messages -->
        <div v-if="errorMessage" class="alert-box error-alert" role="alert">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="alert-box success-alert" role="alert">
          {{ successMessage }}
        </div>

        <!-- Section 1: Basic Personal Info -->
        <div class="form-section">
          <h3 class="section-title">Personal Information</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="name" class="form-label">Full Name</label>
              <input
                id="name"
                v-model="name"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone" class="form-label">Contact Phone (Bangladesh)</label>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                class="form-input"
                placeholder="01711223344"
              />
              <span class="hint-text">Used to reach you for puja coordination & seva updates</span>
            </div>

            <div class="form-group">
              <label for="profileImage" class="form-label">Profile Picture URL</label>
              <input
                id="profileImage"
                v-model="profileImage"
                type="url"
                class="form-input"
                placeholder="https://..."
              />
              <span class="hint-text">Optional web address of your avatar image</span>
            </div>
          </div>
        </div>

        <!-- Section 2: Address Information (Optional) -->
        <div class="form-section">
          <div class="section-header-wrap">
            <h3 class="section-title">Address Information</h3>
            <span class="optional-tag">Optional</span>
          </div>
          <p class="section-sub">
            Your address is used when sending blessed sacred charanamrita or prasad by post.
          </p>

          <div class="form-grid">
            <div class="form-group full-width">
              <label for="address" class="form-label">Street / Village / Area</label>
              <input
                id="address"
                v-model="address"
                type="text"
                class="form-input"
                placeholder="e.g. 14 Prabortok Circle, Golpahar"
              />
            </div>

            <div class="form-group">
              <label for="city" class="form-label">City / District</label>
              <input
                id="city"
                v-model="city"
                type="text"
                class="form-input"
                placeholder="Chittagong"
              />
            </div>

            <div class="form-group">
              <label for="state" class="form-label">State / Division</label>
              <input
                id="state"
                v-model="state"
                type="text"
                class="form-input"
                placeholder="Chittagong Division"
              />
            </div>

            <div class="form-group">
              <label for="postalCode" class="form-label">Postal Code</label>
              <input
                id="postalCode"
                v-model="postalCode"
                type="text"
                class="form-input"
                placeholder="4000"
              />
            </div>

            <div class="form-group">
              <label for="country" class="form-label">Country</label>
              <input
                id="country"
                v-model="country"
                type="text"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions-bar">
          <NuxtLink to="/user/profile" class="btn-cancel">Cancel</NuxtLink>
          <button type="submit" class="btn-save" :disabled="isSaving">
            <span>{{ isSaving ? 'Saving Changes...' : 'Save Profile Changes' }}</span>
          </button>
        </div>
      </form>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.edit-page-container {
  max-width: 760px;
  margin: 0 auto;
}

.edit-card {
  background-color: #FFFFFF;
  border-radius: 14px;
  border: 1px solid rgba(120, 113, 108, 0.18);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-bottom: 1px solid rgba(120, 113, 108, 0.12);
  padding-bottom: 24px;
}

.form-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.section-header-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0;
}

.optional-tag {
  font-size: 0.72rem;
  color: #78716C;
  background-color: #FAF7F0;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(120, 113, 108, 0.18);
}

.section-sub {
  font-size: 0.8rem;
  color: #78716C;
  margin: -6px 0 6px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #292524;
}

.form-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.25);
  border-radius: 8px;
  font-size: 0.88rem;
  color: #292524;
  outline: none;
  transition: all 0.15s ease;
}

.form-input:focus {
  border-color: #D97706;
  background-color: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}

.hint-text {
  font-size: 0.72rem;
  color: #78716C;
}

.form-actions-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding-top: 10px;
}

.btn-cancel {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 600;
  color: #78716C;
  text-decoration: none;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.2);
}

.btn-cancel:hover {
  background-color: #F5EFE0;
}

.btn-save {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #FFFFFF;
  background-color: #7F1D2D;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-save:hover:not(:disabled) {
  background-color: #6E0516;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert-box {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.84rem;
}

.error-alert {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.success-alert {
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
  color: #065F46;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
