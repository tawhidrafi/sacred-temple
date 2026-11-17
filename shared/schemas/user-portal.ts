import { z } from "zod";

// Phone validation for Bangladesh (+8801... or 01...)
export const bangladeshPhoneRegex = /^(?:\+?880|0)1[3-9]\d{8}$/;

export const devoteeRegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
    phone: z
      .string()
      .trim()
      .regex(bangladeshPhoneRegex, "Please provide a valid 11-digit Bangladesh mobile number (e.g. 01711223344)"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type DevoteeRegisterInput = z.infer<typeof devoteeRegisterSchema>;

export const devoteeLoginSchema = z.object({
  identifier: z.string().trim().min(3, "Please enter your email or mobile number"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(true),
});

export type DevoteeLoginInput = z.infer<typeof devoteeLoginSchema>;

export const devoteeProfileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(bangladeshPhoneRegex, "Please provide a valid Bangladesh mobile number")
    .optional()
    .nullable(),
  profileImage: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  address: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  postalCode: z.string().trim().max(20).optional().nullable(),
  country: z.string().trim().max(100).optional().default("Bangladesh"),
});

export type DevoteeProfileUpdateInput = z.infer<typeof devoteeProfileUpdateSchema>;

export const devoteeChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long").max(100),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export type DevoteeChangePasswordInput = z.infer<typeof devoteeChangePasswordSchema>;

export const devoteePujaBookingCreateSchema = z.object({
  pujaId: z.number().int().positive().optional(),
  pujaSlug: z.string().trim().min(1, "Puja selection is required"),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  timeSlot: z.string().trim().min(1, "Time slot selection is required"),
  devoteeName: z.string().trim().min(2, "Devotee name is required").max(100),
  phone: z
    .string()
    .trim()
    .regex(bangladeshPhoneRegex, "Valid Bangladesh mobile number is required"),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  gotra: z.string().trim().max(100).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  specialInstructions: z.string().trim().max(500).optional().nullable(),
  selectedAddons: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        priceBdt: z.number().int().nonnegative(),
      })
    )
    .optional()
    .default([]),
  paymentMethod: z
    .enum(["offline_cash", "offline_bank", "offline_mfs", "online"])
    .default("offline_cash"),
  transactionReference: z.string().trim().max(100).optional().nullable(),
});

export type DevoteePujaBookingCreateInput = z.infer<typeof devoteePujaBookingCreateSchema>;

export const devoteeDonationCreateSchema = z.object({
  categoryId: z.number().int().positive("Category is required"),
  amount: z.number().int().min(10, "Minimum donation amount is BDT 10"),
  donorName: z.string().trim().min(2, "Donor name is required").max(100),
  phone: z
    .string()
    .trim()
    .regex(bangladeshPhoneRegex, "Valid Bangladesh mobile number is required"),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  paymentMethod: z.enum(["offline_cash", "offline_bank", "offline_mfs"]),
  transactionReference: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().max(500).optional().nullable(),
  isAnonymous: z.boolean().optional().default(false),
});

export type DevoteeDonationCreateInput = z.infer<typeof devoteeDonationCreateSchema>;
