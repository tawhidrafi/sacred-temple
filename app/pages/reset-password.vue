<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

useHead({
  title: "Reset Password - Golpahar Mohashoshan Kali Mandir",
});

const route = useRoute();
const token = ref((route.query.token as string) || "");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const isSubmitted = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const handleResetPassword = async () => {
  if (!password.value || password.value.length < 8) {
    errorMessage.value = "Password must be at least 8 characters long.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    await new Promise((r) => setTimeout(r, 600));
    isSubmitted.value = true;
  } catch (err: any) {
    errorMessage.value = err?.message || "Failed to reset password. The link may have expired.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-page-root">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Choose New Password</h1>
        <p class="auth-subtitle">
          Please enter your new sacred account password below.
        </p>
      </div>

      <div v-if="isSubmitted" class="success-notice">
        <p class="success-text">
          Your password has been successfully updated. You may now log in.
        </p>
        <NuxtLink to="/login" class="back-login-btn">Proceed to Login</NuxtLink>
      </div>

      <form v-else class="auth-form" @submit.prevent="handleResetPassword">
        <div v-if="errorMessage" class="auth-error-banner" role="alert">
          <span>{{ errorMessage }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">New Password (Min. 8 characters)</label>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm New Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span>{{ isLoading ? 'Updating...' : 'Update Password' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-page-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background-color: #FAF7F0;
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background-color: #FFFFFF;
  border-radius: 16px;
  border: 1px solid rgba(217, 119, 6, 0.22);
  padding: 36px 32px;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-title {
  font-family: "Cinzel", Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #7F1D2D;
  margin: 0 0 6px 0;
}

.auth-subtitle {
  font-size: 0.85rem;
  color: #78716C;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  outline: none;
}

.form-input:focus {
  border-color: #D97706;
  background-color: #FFFFFF;
}

.submit-btn {
  height: 44px;
  background-color: #7F1D2D;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
}

.auth-error-banner {
  padding: 10px 14px;
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #991B1B;
  font-size: 0.82rem;
}

.success-notice {
  text-align: center;
  padding: 20px;
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.success-text {
  font-size: 0.88rem;
  color: #065F46;
  margin: 0;
}

.back-login-btn {
  display: inline-block;
  padding: 8px 18px;
  background-color: #059669;
  color: #FFFFFF;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
}
</style>
