<script setup lang="ts">
import { ref, onMounted } from "vue";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";
import type { DevoteeFullProfile } from "~~/server/services/user-profile";

useHead({
  title: "My Profile - Devotee Portal",
});

const profile = ref<DevoteeFullProfile | null>(null);
const isLoading = ref(true);

const fetchProfile = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<{ profile: DevoteeFullProfile }>("/api/me/profile");
    if (res?.profile) {
      profile.value = res.profile;
    }
  } catch (err) {
    console.warn("Could not load profile:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <UserPortalShell
    title="My Profile"
    subtitle="View and manage your personal details and contact information"
  >
    <div v-if="profile" class="profile-page-grid">
      <!-- Main Profile Header Card -->
      <section class="portal-card profile-hero-card">
        <div class="hero-left">
          <div class="avatar-large">
            <img
              v-if="profile.profileImage"
              :src="profile.profileImage"
              :alt="profile.name"
            />
            <span v-else class="avatar-initials-large">
              {{ (profile.name || 'D').charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="hero-meta">
            <h2 class="hero-name">{{ profile.name }}</h2>
            <span class="role-badge">Devotee Account</span>
            <p class="hero-sub">Member since {{ new Date(profile.createdAt).toLocaleDateString() }}</p>
          </div>
        </div>

        <div class="hero-actions">
          <NuxtLink to="/user/profile/edit" class="btn-edit-profile">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Edit Profile</span>
          </NuxtLink>
        </div>
      </section>

      <!-- Details Sections Grid -->
      <div class="details-columns-grid">
        <!-- 1. Contact Information -->
        <section class="portal-card detail-card">
          <div class="card-heading-bar">
            <h3 class="card-title">Contact Information</h3>
            <NuxtLink to="/user/profile/edit" class="edit-link">Edit</NuxtLink>
          </div>

          <div class="info-list">
            <div class="info-row">
              <span class="info-label">Email Address</span>
              <div class="info-val-wrap">
                <span class="info-value">{{ profile.email }}</span>
                <span v-if="profile.emailVerified" class="verified-pill">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Verified
                </span>
                <span v-else class="unverified-pill">Unverified</span>
              </div>
            </div>

            <div class="info-row">
              <span class="info-label">Mobile Number</span>
              <div class="info-val-wrap">
                <span class="info-value">{{ profile.phone || 'Not provided' }}</span>
                <span v-if="profile.phoneVerified" class="verified-pill">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Verified
                </span>
                <span v-else-if="profile.phone" class="unverified-pill">Pending OTP</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Address Information (Optional) -->
        <section class="portal-card detail-card">
          <div class="card-heading-bar">
            <h3 class="card-title">Address Information</h3>
            <span class="optional-pill">Optional</span>
          </div>

          <div class="info-list">
            <div class="info-row">
              <span class="info-label">Street / Area</span>
              <span class="info-value">{{ profile.address || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">City / District</span>
              <span class="info-value">{{ profile.city || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">State / Division</span>
              <span class="info-value">{{ profile.state || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Postal Code</span>
              <span class="info-value">{{ profile.postalCode || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Country</span>
              <span class="info-value">{{ profile.country || 'Bangladesh' }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Account Security Card -->
      <section class="portal-card security-card">
        <div class="security-text">
          <h3 class="security-title">Account Security</h3>
          <p class="security-sub">
            Protect your devotee account with a strong, secret password.
          </p>
        </div>
        <NuxtLink to="/user/change-password" class="btn-change-password">
          Change Password
        </NuxtLink>
      </section>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.profile-page-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.portal-card {
  background-color: #FFFFFF;
  border-radius: 14px;
  border: 1px solid rgba(120, 113, 108, 0.18);
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.profile-hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  background: linear-gradient(135deg, #FFFDF8 0%, #FFFFFF 100%);
  border: 1px solid rgba(217, 119, 6, 0.22);
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-large {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #7F1D2D;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(127, 29, 45, 0.2);
  flex-shrink: 0;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials-large {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.8rem;
  font-weight: 700;
}

.hero-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-name {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 3px 8px;
  background-color: #FEF3C7;
  color: #92400E;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 9999px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hero-sub {
  font-size: 0.78rem;
  color: #78716C;
  margin: 0;
}

.btn-edit-profile {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 8px;
  background-color: #7F1D2D;
  color: #FFFFFF;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.btn-edit-profile svg {
  width: 16px;
  height: 16px;
}

.btn-edit-profile:hover {
  background-color: #6E0516;
}

/* Details Columns */
.details-columns-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-card {
  display: flex;
  flex-direction: column;
}

.card-heading-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(120, 113, 108, 0.12);
}

.card-title {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0;
}

.edit-link {
  font-size: 0.8rem;
  color: #D97706;
  font-weight: 600;
  text-decoration: none;
}

.edit-link:hover {
  text-decoration: underline;
}

.optional-pill {
  font-size: 0.72rem;
  color: #78716C;
  background-color: #FAF7F0;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(120, 113, 108, 0.18);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(120, 113, 108, 0.12);
  font-size: 0.86rem;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #78716C;
  font-weight: 500;
}

.info-val-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  color: #292524;
  font-weight: 600;
}

.verified-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: #ECFDF5;
  color: #065F46;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.verified-pill svg {
  width: 12px;
  height: 12px;
}

.unverified-pill {
  padding: 2px 8px;
  background-color: #FEF3C7;
  color: #92400E;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
}

/* Security Card */
.security-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.security-title {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0 0 4px 0;
}

.security-sub {
  font-size: 0.82rem;
  color: #78716C;
  margin: 0;
}

.btn-change-password {
  display: inline-block;
  padding: 9px 18px;
  border-radius: 8px;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.25);
  color: #292524;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-change-password:hover {
  background-color: #7F1D2D;
  color: #FFFFFF;
}

@media (max-width: 800px) {
  .details-columns-grid {
    grid-template-columns: 1fr;
  }

  .profile-hero-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .security-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
