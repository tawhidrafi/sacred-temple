<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";

useHead({
  title: "Devotee Login - Golpahar Mohashoshan Kali Mandir",
});

const route = useRoute();
const router = useRouter();
const { isAuthenticated, isPending, isStaff, login } = useAuth();

// Redirect if already authenticated
watchEffect(() => {
  if (isPending.value) return;
  if (isAuthenticated.value) {
    if (isStaff.value) {
      const redirect = (route.query.redirect as string) || "/admin/dashboard";
      router.replace(redirect);
    } else {
      const redirect = (route.query.redirect as string) || "/user/dashboard";
      router.replace(redirect);
    }
  }
});

const emailOrPhone = ref("");
const password = ref("");
const rememberMe = ref(true);
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  errorMessage.value = "";
  const identifier = emailOrPhone.value.trim();
  const pass = password.value;

  if (!identifier || !pass) {
    errorMessage.value = "Please enter both your email or mobile number and password.";
    return;
  }

  isLoading.value = true;
  try {
    // If user provided a phone number, standard better-auth uses email; allow identifier
    const res = await login(identifier, pass, rememberMe.value);
    if (res.success) {
      if (res.role === "admin" || res.role === "editor") {
        const redirect = (route.query.redirect as string) || "/admin/dashboard";
        await router.replace(redirect);
      } else {
        const redirect = (route.query.redirect as string) || "/user/dashboard";
        await router.replace(redirect);
      }
    } else {
      errorMessage.value = res.error || "Invalid credentials. Please verify your email and password.";
    }
  } catch (err: any) {
    errorMessage.value = err?.message || "An unexpected error occurred during login.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-page-root">
    <div class="auth-card">
      <!-- Crest & Heading -->
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

        <h1 class="auth-title">Devotee Login</h1>
        <p class="auth-subtitle">
          Sign in to manage your puja bookings, view seva history, and make temple offerings.
        </p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="auth-error-banner" role="alert">
        <svg viewBox="0 0 20 20" fill="currentColor" class="error-icon">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Login Form -->
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="emailOrPhone" class="form-label">Email or Mobile Number</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="emailOrPhone"
              v-model="emailOrPhone"
              type="text"
              class="form-input"
              placeholder="devotee@example.com"
              required
              autocomplete="username"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="label-row">
            <label for="password" class="form-label">Password</label>
            <NuxtLink to="/forgot-password" class="forgot-link">Forgot password?</NuxtLink>
          </div>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-label">
            <input v-model="rememberMe" type="checkbox" class="checkbox-input" />
            <span>Remember me</span>
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="btn-spinner" />
          <span>{{ isLoading ? 'Signing In...' : 'Sign In' }}</span>
        </button>
      </form>

      <!-- Footer Links -->
      <div class="auth-footer">
        <p class="signup-prompt">
          New devotee?
          <NuxtLink to="/register" class="signup-link">Create a devotee account</NuxtLink>
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
  box-shadow: 0 10px 25px -5px rgba(127, 29, 45, 0.08), 0 8px 10px -6px rgba(127, 29, 45, 0.04);
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
  font-size: 1.6rem;
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

.auth-error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #991B1B;
  font-size: 0.82rem;
  margin-bottom: 20px;
}

.error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #292524;
}

.forgot-link {
  font-size: 0.78rem;
  color: #D97706;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 17px;
  height: 17px;
  color: #A8A29E;
  pointer-events: none;
}

.form-input {
  width: 100%;
  height: 42px;
  padding: 0 14px 0 38px;
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

.password-toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #A8A29E;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle-btn svg {
  width: 17px;
  height: 17px;
}

.password-toggle-btn:hover {
  color: #292524;
}

.form-options {
  display: flex;
  align-items: center;
}

.remember-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #78716C;
  cursor: pointer;
}

.checkbox-input {
  accent-color: #D97706;
  width: 16px;
  height: 16px;
}

.submit-btn {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #7F1D2D;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #6E0516;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.signup-link:hover {
  text-decoration: underline;
}

.home-back-link {
  font-size: 0.8rem;
  color: #78716C;
  text-decoration: none;
  transition: color 0.15s ease;
}

.home-back-link:hover {
  color: #D97706;
}
</style>
