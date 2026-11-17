<script setup lang="ts">
import { ref } from "vue";

useHead({
  title: "Forgot Password - Golpahar Mohashoshan Kali Mandir",
});

const identifier = ref("");
const isSubmitted = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const handleForgotPassword = async () => {
  if (!identifier.value.trim()) {
    errorMessage.value = "Please enter your registered email address or mobile number.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    // Simulating password reset request flow
    await new Promise((r) => setTimeout(r, 600));
    isSubmitted.value = true;
  } catch (err: any) {
    errorMessage.value = err?.message || "Failed to process password reset request.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-page-root">
    <div class="auth-card">
      <div class="auth-header">
        <NuxtLink to="/" class="auth-crest-link" title="Return to Home">
          <div class="auth-crest">
            <svg viewBox="0 0 24 24" fill="none" class="crest-svg">
              <path d="M12 2L15 7H9L12 2Z" fill="#D97706" />
              <path d="M7 8H17L18 13H6L7 8Z" fill="#7F1D2D" />
              <path d="M4 14H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V14Z" fill="#D97706" />
              <circle cx="12" cy="17" r="2" fill="#FAF7F0" />
            </svg>
          </div>
        </NuxtLink>

        <h1 class="auth-title">Reset Password</h1>
        <p class="auth-subtitle">
          Enter your registered email address or mobile number and we'll help you regain access.
        </p>
      </div>

      <div v-if="isSubmitted" class="success-notice">
        <svg viewBox="0 0 20 20" fill="currentColor" class="success-icon">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <p class="success-text">
          If an account exists for <strong>{{ identifier }}</strong>, instructions have been dispatched. Please check your inbox or SMS.
        </p>
        <NuxtLink to="/login" class="back-login-btn">Back to Login</NuxtLink>
      </div>

      <form v-else class="auth-form" @submit.prevent="handleForgotPassword">
        <div v-if="errorMessage" class="auth-error-banner" role="alert">
          <span>{{ errorMessage }}</span>
        </div>

        <div class="form-group">
          <label for="identifier" class="form-label">Email or Mobile Number</label>
          <input
            id="identifier"
            v-model="identifier"
            type="text"
            class="form-input"
            placeholder="devotee@example.com"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span>{{ isLoading ? 'Sending Link...' : 'Send Reset Link' }}</span>
        </button>
      </form>

      <div class="auth-footer">
        <p class="signup-prompt">
          Remember your password?
          <NuxtLink to="/login" class="signup-link">Sign in</NuxtLink>
        </p>
        <NuxtLink to="/" class="home-back-link">← Return to Temple Website</NuxtLink>
      </div>
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
  color: #292524;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background-color: #FFFFFF;
  border-radius: 16px;
  border: 1px solid rgba(217, 119, 6, 0.22);
  box-shadow: 0 10px 25px -5px rgba(127, 29, 45, 0.08);
  padding: 36px 32px;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-crest-link {
  display: inline-block;
  margin-bottom: 12px;
}

.auth-crest {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #FEF3C7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.crest-svg {
  width: 30px;
  height: 30px;
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
  line-height: 1.45;
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

.submit-btn:hover {
  background-color: #6E0516;
}

.success-notice {
  text-align: center;
  padding: 16px;
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.success-icon {
  width: 36px;
  height: 36px;
  color: #059669;
}

.success-text {
  font-size: 0.88rem;
  color: #065F46;
  line-height: 1.5;
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

.auth-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(120, 113, 108, 0.15);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.signup-prompt {
  font-size: 0.85rem;
  color: #78716C;
  margin: 0;
}

.signup-link {
  color: #7F1D2D;
  font-weight: 600;
  text-decoration: none;
}

.home-back-link {
  font-size: 0.8rem;
  color: #78716C;
  text-decoration: none;
}
</style>
