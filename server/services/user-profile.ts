import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { user, userProfiles } from "../db/schema";
import type { DevoteeProfileUpdateInput } from "../../shared/schemas/user-portal";

export interface DevoteeFullProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  profileImage: string | null;
  role: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  completionPercentage: number;
  createdAt: number;
  updatedAt: number;
}

export class UserProfileService {
  /**
   * Calculate profile completion percentage based on core details
   */
  static calculateCompletion(profile: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    profileImage?: string | null;
    phoneVerified?: boolean;
  }): number {
    let score = 0;
    if (profile.name?.trim()) score += 25;
    if (profile.email?.trim()) score += 25;
    if (profile.phone?.trim()) score += 25;
    if (profile.profileImage?.trim()) score += 25;
    return score;
  }

  /**
   * Get devotee full profile
   */
  static async getProfile(
    db: DrizzleD1Database<typeof schema>,
    userId: string
  ): Promise<DevoteeFullProfile | null> {
    const userRow = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .get();

    if (!userRow) return null;

    const profileRow = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .get();

    const profileImage = profileRow?.profileImage || userRow.image || null;
    const phoneVerified = Boolean(profileRow?.phoneVerified);

    const completionPercentage = this.calculateCompletion({
      name: userRow.name,
      email: userRow.email,
      phone: userRow.phone,
      profileImage,
      phoneVerified,
    });

    return {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      emailVerified: Boolean(userRow.emailVerified),
      phone: userRow.phone || null,
      phoneVerified,
      profileImage,
      role: userRow.role,
      address: profileRow?.address || null,
      city: profileRow?.city || null,
      state: profileRow?.state || null,
      postalCode: profileRow?.postalCode || null,
      country: profileRow?.country || "Bangladesh",
      completionPercentage,
      createdAt: typeof userRow.createdAt === "number" ? userRow.createdAt : userRow.createdAt.getTime(),
      updatedAt: typeof userRow.updatedAt === "number" ? userRow.updatedAt : userRow.updatedAt.getTime(),
    };
  }

  /**
   * Update devotee profile
   */
  static async updateProfile(
    db: DrizzleD1Database<typeof schema>,
    userId: string,
    data: DevoteeProfileUpdateInput
  ): Promise<DevoteeFullProfile> {
    const now = Date.now();

    // 1. Update user table (name, phone, image)
    const userUpdates: Record<string, any> = { updatedAt: new Date(now) };
    if (data.name !== undefined) userUpdates.name = data.name;
    if (data.phone !== undefined) userUpdates.phone = data.phone;
    if (data.profileImage !== undefined) userUpdates.image = data.profileImage;

    await db.update(user).set(userUpdates).where(eq(user.id, userId)).run();

    // 2. Upsert user_profiles table
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .get();

    if (existingProfile) {
      const profileUpdates: Record<string, any> = { updatedAt: now };
      if (data.profileImage !== undefined) profileUpdates.profileImage = data.profileImage;
      if (data.address !== undefined) profileUpdates.address = data.address;
      if (data.city !== undefined) profileUpdates.city = data.city;
      if (data.state !== undefined) profileUpdates.state = data.state;
      if (data.postalCode !== undefined) profileUpdates.postalCode = data.postalCode;
      if (data.country !== undefined) profileUpdates.country = data.country;

      await db
        .update(userProfiles)
        .set(profileUpdates)
        .where(eq(userProfiles.userId, userId))
        .run();
    } else {
      await db
        .insert(userProfiles)
        .values({
          userId,
          profileImage: data.profileImage || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          postalCode: data.postalCode || null,
          country: data.country || "Bangladesh",
          phoneVerified: false,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    const fullProfile = await this.getProfile(db, userId);
    if (!fullProfile) {
      throw new Error("Failed to retrieve updated profile");
    }
    return fullProfile;
  }
}
