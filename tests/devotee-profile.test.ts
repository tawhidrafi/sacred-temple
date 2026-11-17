import { describe, it, expect, beforeEach } from "vitest";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../server/db/schema";
import {
  devoteeRegisterSchema,
  devoteeProfileUpdateSchema,
  devoteeChangePasswordSchema,
} from "../shared/schemas/user-portal";
import { UserProfileService } from "../server/services/user-profile";

describe("Task 2 — Devotee Profile & Auth Validation", () => {
  let sqlite: Database;
  let db: any;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.run("PRAGMA foreign_keys = ON;");
    sqlite.run(`
      CREATE TABLE user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        phone TEXT
      );

      CREATE TABLE user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
        profile_image TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'Bangladesh',
        phone_verified INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    db = drizzle(sqlite, { schema });
  });

  describe("Validation Schemas", () => {
    it("validates devotee registration input with password confirmation", () => {
      const valid = devoteeRegisterSchema.safeParse({
        name: "Shyamal Chakraborty",
        email: "shyamal@example.com",
        phone: "01711223344",
        password: "SacredPassword123!",
        confirmPassword: "SacredPassword123!",
      });
      expect(valid.success).toBe(true);

      const mismatchedPassword = devoteeRegisterSchema.safeParse({
        name: "Shyamal Chakraborty",
        email: "shyamal@example.com",
        phone: "01711223344",
        password: "SacredPassword123!",
        confirmPassword: "DifferentPassword456!",
      });
      expect(mismatchedPassword.success).toBe(false);

      const invalidPhone = devoteeRegisterSchema.safeParse({
        name: "Shyamal",
        email: "shyamal@example.com",
        phone: "12345",
        password: "SacredPassword123!",
        confirmPassword: "SacredPassword123!",
      });
      expect(invalidPhone.success).toBe(false);
    });

    it("validates profile update input", () => {
      const valid = devoteeProfileUpdateSchema.safeParse({
        name: "Shyamal C.",
        phone: "01819123456",
        address: "Hill View, Golpahar",
        city: "Chittagong",
        state: "Chittagong Division",
        postalCode: "4000",
        country: "Bangladesh",
      });
      expect(valid.success).toBe(true);

      // Address fields are optional
      const minimalValid = devoteeProfileUpdateSchema.safeParse({
        name: "Shyamal C.",
      });
      expect(minimalValid.success).toBe(true);
    });

    it("validates change password schema", () => {
      const valid = devoteeChangePasswordSchema.safeParse({
        currentPassword: "OldPassword123!",
        newPassword: "NewSecretPassword123!",
        confirmNewPassword: "NewSecretPassword123!",
      });
      expect(valid.success).toBe(true);

      const shortPassword = devoteeChangePasswordSchema.safeParse({
        currentPassword: "OldPassword123!",
        newPassword: "short",
        confirmNewPassword: "short",
      });
      expect(shortPassword.success).toBe(false);
    });
  });

  describe("UserProfileService", () => {
    it("retrieves and updates devotee profile and computes completion percentage", async () => {
      const now = Date.now();
      sqlite.run(
        "INSERT INTO user (id, name, email, email_verified, image, role, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ["dev_1", "Rupa Devi", "rupa@example.com", 1, null, "user", "01711998877", now, now]
      );

      // Initial profile (no user_profiles row yet)
      const initial = await UserProfileService.getProfile(db, "dev_1");
      expect(initial).not.toBeNull();
      expect(initial?.name).toBe("Rupa Devi");
      expect(initial?.email).toBe("rupa@example.com");
      expect(initial?.phone).toBe("01711998877");
      expect(initial?.completionPercentage).toBeGreaterThanOrEqual(50); // Has name, email, phone

      // Update profile
      const updated = await UserProfileService.updateProfile(db, "dev_1", {
        name: "Rupa Devi Sharma",
        phone: "01811998877",
        address: "Prabortok Circle, O.R. Nizam Rd",
        city: "Chittagong",
        state: "Chittagong Division",
        postalCode: "4000",
        country: "Bangladesh",
        profileImage: "/images/profiles/rupa.webp",
      });

      expect(updated.name).toBe("Rupa Devi Sharma");
      expect(updated.address).toBe("Prabortok Circle, O.R. Nizam Rd");
      expect(updated.profileImage).toBe("/images/profiles/rupa.webp");
      expect(updated.completionPercentage).toBe(100);

      // Devotee isolation: dev_2 gets null when looking up non-existent user
      const other = await UserProfileService.getProfile(db, "dev_2");
      expect(other).toBeNull();
    });
  });
});
