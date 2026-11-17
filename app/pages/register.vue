<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";
import { authClient } from "~/utils/auth-client";
import { devoteeRegisterSchema } from "~~/shared/schemas/user-portal";

useHead({
  title: "Devotee Registration - Golpahar Mohashoshan Kali Mandir",
});

const router = useRouter();
const { isAuthenticated, isPending } = useAuth();

watchEffect(() => {
  if (isPending.value) return;
  if (isAuthenticated.value) {
    router.replace("/user/dashboard");
  }
});

const name = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const fieldErrors = ref<Record<string, string>>({});

const handleRegister = async () => {
  errorMessage.value = "";
  fieldErrors.value = {};

  const input = {
    name: name.value.trim(),
    email: email.value.trim().toLowerCase(),
    phone: phone.value.trim(),
    password: password.value,
    confirmPassword: confirmPassword.value,
  };

  const validation = devoteeRegisterSchema.safeParse(input);
  if (!validation.success) {
    const flattened = validation.error.flatten().fieldErrors;
    fieldErrors.value = {
      name: flattened.name?.[0] || "",
      email: flattened.email?.[0] || "",
      phone: flattened.phone?.[0] || "",
      password: flattened.password?.[0] || "",
      confirmPassword: flattened.confirmPassword?.[0] || "",
    };
    errorMessage.value = "Please correct the highlighted fields.";
    return;
  }

  isLoading.value = true;
  try {
    const { error } = await authClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone,
    } as any);

    if (error) {
      errorMessage.value = error.message || "Registration failed. An account with this email may already exist.";
    } else {
      await router.replace("/user/dashboard");
    }
  } catch (err: any) {
    errorMessage.value = err?.message || "An unexpected error occurred during account creation.";
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

        <h1 class="auth-title">Devotee Registration</h1>
        <p class="auth-subtitle">
          Create your account to book sacred pujas, track sankalpa requests, and support the temple.
        </p>
      </div>

      <div v-if="errorMessage" class="auth-error-banner" role="alert">
        <svg viewBox="0 0 20 20" fill="currentColor" class="error-icon">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <!-- Full Name -->
        <div class="form-group">
          <label for="name" class="form-label">Full Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="form-input"
            :class="{ 'has-error': fieldErrors.name }"
            placeholder="e.g. Subir Chakraborty"
            required
          />
          <span v-if="fieldErrors.name" class="field-error-text">{{ fieldErrors.name }}</span>
        </div>

        <!-- Email Address -->
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            :class="{ 'has-error': fieldErrors.email }"
            placeholder="devotee@example.com"
            required
            autocomplete="email"
          />
          <span v-if="fieldErrors.email" class="field-error-text">{{ fieldErrors.email }}</span>
        </div>

        <!-- Mobile Number -->
        <div class="form-group">
          <label for="phone" class="form-label">Mobile Number (Bangladesh)</label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            class="form-input"
            :class="{ 'has-error': fieldErrors.phone }"
            placeholder="01711223344"
            required
            autocomplete="tel"
          />
          <span v-if="fieldErrors.phone" class="field-error-text">{{ fieldErrors.phone }}</span>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password" class="form-label">Password (Min. 8 characters)</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'has-error': fieldErrors.password }"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="showPassword = !showPassword"
              aria-label="Toggle password visibility"
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
          <span v-if="fieldErrors.password" class="field-error-text">{{ fieldErrors.password }}</span>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'has-error': fieldErrors.confirmPassword }"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
          <span v-if="fieldErrors.confirmPassword" class="field-error-text">{{ fieldErrors.confirmPassword }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="btn-spinner" />
          <span>{{ isLoading ? 'Creating Account...' : 'Complete Registration' }}</span>
        </button>
      </form>

      <div class="auth-footer">
        <p class="signup-prompt">
          Already registered?
          <NuxtLink to="/login" class="signup-link">Sign in here</NuxtLink>
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
  padding: 40px 16px;
  background-color: #FAF7F0;
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  color: #292524;
}

.auth-card {
  width: 100%;
  max-width: 480px;
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
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #292524;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
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

.form-input.has-error {
  border-color: #DC2626;
  background-color: #FEF2F2;
}

.field-error-text {
  font-size: 0.72rem;
  color: #DC2626;
  font-weight: 500;
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
  margin-top: 6px;
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
