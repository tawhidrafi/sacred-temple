import { computed } from "vue";
import { authClient } from "../utils/auth-client";
import type { Role } from "../../shared/types";

export interface AuthUserInfo {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  image?: string | null;
}

export const useAuth = () => {
  const session = authClient.useSession();

  const user = computed<AuthUserInfo | null>(() => {
    const u = session.value?.data?.user;
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u as any).role || "user",
      phone: (u as any).phone || null,
      image: u.image || null,
    };
  });

  const isAuthenticated = computed(() => !!user.value);
  const isPending = computed(() => session.value?.isPending ?? false);
  const role = computed<Role | "guest">(() => user.value?.role || "guest");
  const isAdmin = computed(() => role.value === "admin");
  const isEditor = computed(() => role.value === "editor");
  const isStaff = computed(() => role.value === "admin" || role.value === "editor");
  const isUser = computed(() => role.value === "user");

  const login = async (
    identifier: string,
    pass: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string; role?: Role }> => {
    try {
      let emailToUse = identifier.trim().toLowerCase();
      if (!emailToUse.includes("@")) {
        try {
          const res = await $fetch<{ email: string }>("/api/auth/resolve-identifier", {
            method: "POST",
            body: { identifier: identifier.trim() },
          });
          if (res?.email) {
            emailToUse = res.email.toLowerCase();
          }
        } catch {
          // fallback to identifier
        }
      }

      const { data, error } = await authClient.signIn.email({
        email: emailToUse,
        password: pass.trim(),
        rememberMe,
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Invalid email or password",
        };
      }

      const assignedRole = (data?.user as any)?.role as Role || "user";
      return { success: true, role: assignedRole };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "An unexpected error occurred during login",
      };
    }
  };

  const logout = async (redirectTo = "/login") => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    if (redirectTo) {
      await navigateTo(redirectTo);
    }
  };

  return {
    session,
    user,
    currentUser: user, // Alias for legacy code
    isAuthenticated,
    isPending,
    role,
    isAdmin,
    isEditor,
    isStaff,
    isUser,
    login,
    logout,
  };
};
