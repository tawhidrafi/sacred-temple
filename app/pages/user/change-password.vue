<script setup lang="ts">
import { ref } from "vue";
import UserPortalShell from "~/components/portal/UserPortalShell.vue";
import { devoteeChangePasswordSchema } from "~~/shared/schemas/user-portal";

useHead({
  title: "Change Password - Devotee Portal",
});

const currentPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const showPasswords = ref(false);

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleChangePassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  const input = {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    confirmNewPassword: confirmNewPassword.value,
  };

  const validation = devoteeChangePasswordSchema.safeParse(input);
  if (!validation.success) {
    errorMessage.value = validation.error.errors[0]?.message || "Please check your passwords.";
    return;
  }

  isLoading.value = true;
  try {
    const res = await $fetch<{ success: boolean; message: string }>("/api/me/change-password", {
      method: "POST",
      body: input,
    });

    if (res.success) {
      successMessage.value = "Your password has been changed successfully.";
      currentPassword.value = "";
      newPassword.value = "";
      confirmNewPassword.value = "";
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || "Failed to change password. Please check your current password.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <UserPortalShell
    title="Change Password"
    subtitle="Update your devotee account password securely"
  >
    <div class="change-password-container">
      <form class="portal-card password-card" @submit.prevent="handleChangePassword">
        <div v-if="errorMessage" class="alert-box error-alert" role="alert">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="alert-box success-alert" role="alert">
          {{ successMessage }}
        </div>

        <div class="form-group">
          <label for="currentPassword" class="form-label">Current Password</label>
          <input
            id="currentPassword"
            v-model="currentPassword"
            :type="showPasswords ? 'text' : 'password'"
            class="form-input"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="form-group">
          <label for="newPassword" class="form-label">New Password (Min. 8 characters)</label>
          <input
            id="newPassword"
            v-model="newPassword"
            :type="showPasswords ? 'text' : 'password'"
            class="form-input"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            v-model="confirmNewPassword"
            :type="showPasswords ? 'text' : 'password'"
            class="form-input"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="show-passwords-row">
          <label class="checkbox-label">
            <input v-model="showPasswords" type="checkbox" class="checkbox-input" />
            <span>Show passwords</span>
          </label>
        </div>

        <div class="form-actions-bar">
          <NuxtLink to="/user/profile" class="btn-cancel">Back to Profile</NuxtLink>
          <button type="submit" class="btn-submit" :disabled="isLoading">
            <span>{{ isLoading ? 'Updating Password...' : 'Update Password' }}</span>
          </button>
        </div>
      </form>
    </div>
  </UserPortalShell>
</template>

<style scoped>
.change-password-container {
  max-width: 520px;
  margin: 0 auto;
}

.password-card {
  background-color: #FFFFFF;
  border-radius: 14px;
  border: 1px solid rgba(120, 113, 108, 0.18);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
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

.show-passwords-row {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #78716C;
  cursor: pointer;
}

.checkbox-input {
  accent-color: #D97706;
}

.form-actions-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding-top: 10px;
}

.btn-cancel {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #78716C;
  text-decoration: none;
  background-color: #FAF7F0;
  border: 1px solid rgba(120, 113, 108, 0.2);
}

.btn-cancel:hover {
  background-color: #F5EFE0;
}

.btn-submit {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #FFFFFF;
  background-color: #7F1D2D;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-submit:hover:not(:disabled) {
  background-color: #6E0516;
}

.btn-submit:disabled {
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
</style>
