import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['admin', 'guru']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  password_hash: z.string(),
  full_name: z.string(),
  role: userRoleSchema,
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Input schemas for user management
export const createUserInputSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
  role: userRoleSchema,
  is_active: z.boolean().default(true)
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Student origin enum
export const studentOriginSchema = z.enum(['smp_darul_muttaqien', 'mts', 'luar_smp_darul_muttaqien']);
export type StudentOrigin = z.infer<typeof studentOriginSchema>;

// Gender enum
export const genderSchema = z.enum(['L', 'P']);
export type Gender = z.infer<typeof genderSchema>;

// Student schema
export const studentSchema = z.object({
  id: z.number(),
  nis: z.string(),
  nisn: z.string().nullable(),
  full_name: z.string(),
  gender: genderSchema,
  birth_place: z.string(),
  birth_date: z.coerce.date(),
  address: z.string(),
  phone: z.string().nullable(),
  parent_name: z.string(),
  parent_phone: z.string().nullable(),
  origin_school: studentOriginSchema,
  entry_year: z.number().int(),
  class_id: z.number().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Student = z.infer<typeof studentSchema>;

// Input schemas for student management
export const createStudentInputSchema = z.object({
  nis: z.string(),
  nisn: z.string().nullable(),
  full_name: z.string(),
  gender: genderSchema,
  birth_place: z.string(),
  birth_date: z.coerce.date(),
  address: z.string(),
  phone: z.string().nullable(),
  parent_name: z.string(),
  parent_phone: z.string().nullable(),
  origin_school: studentOriginSchema,
  entry_year: z.number().int(),
  class_id: z.number().nullable(),
  is_active: z.boolean().default(true)
});

export type CreateStudentInput = z.infer<typeof createStudentInputSchema>;

// Class schema
export const classSchema = z.object({
  id: z.number(),
  name: z.string(),
  grade: z.number().int(),
  academic_year: z.string(),
  homeroom_teacher_id: z.number().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Class = z.infer<typeof classSchema>;

// Input schemas for class management
export const createClassInputSchema = z.object({
  name: z.string(),
  grade: z.number().int().min(1).max(3),
  academic_year: z.string(),
  homeroom_teacher_id: z.number().nullable(),
  is_active: z.boolean().default(true)
});

export type CreateClassInput = z.infer<typeof createClassInputSchema>;

// Teacher schema
export const teacherSchema = z.object({
  id: z.number(),
  nip: z.string().nullable(),
  full_name: z.string(),
  gender: genderSchema,
  birth_place: z.string(),
  birth_date: z.coerce.date(),
  address: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  subject: z.string().nullable(),
  user_id: z.number().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Teacher = z.infer<typeof teacherSchema>;

// Input schemas for teacher management
export const createTeacherInputSchema = z.object({
  nip: z.string().nullable(),
  full_name: z.string(),
  gender: genderSchema,
  birth_place: z.string(),
  birth_date: z.coerce.date(),
  address: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  subject: z.string().nullable(),
  user_id: z.number().nullable(),
  is_active: z.boolean().default(true)
});

export type CreateTeacherInput = z.infer<typeof createTeacherInputSchema>;

// SPP Payment status enum
export const paymentStatusSchema = z.enum(['belum_bayar', 'lunas', 'terlambat']);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// SPP Payment schema
export const sppPaymentSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  amount: z.number(),
  payment_date: z.coerce.date().nullable(),
  status: paymentStatusSchema,
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type SppPayment = z.infer<typeof sppPaymentSchema>;

// Input schemas for SPP payment management
export const createSppPaymentInputSchema = z.object({
  student_id: z.number(),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  amount: z.number().positive(),
  payment_date: z.coerce.date().nullable(),
  status: paymentStatusSchema,
  notes: z.string().nullable()
});

export type CreateSppPaymentInput = z.infer<typeof createSppPaymentInputSchema>;

// Letter type enum
export const letterTypeSchema = z.enum(['masuk', 'keluar']);
export type LetterType = z.infer<typeof letterTypeSchema>;

// Letter schema
export const letterSchema = z.object({
  id: z.number(),
  letter_number: z.string(),
  letter_type: letterTypeSchema,
  subject: z.string(),
  sender: z.string().nullable(),
  recipient: z.string().nullable(),
  letter_date: z.coerce.date(),
  received_date: z.coerce.date().nullable(),
  description: z.string().nullable(),
  file_path: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Letter = z.infer<typeof letterSchema>;

// Input schemas for letter management
export const createLetterInputSchema = z.object({
  letter_number: z.string(),
  letter_type: letterTypeSchema,
  subject: z.string(),
  sender: z.string().nullable(),
  recipient: z.string().nullable(),
  letter_date: z.coerce.date(),
  received_date: z.coerce.date().nullable(),
  description: z.string().nullable(),
  file_path: z.string().nullable()
});

export type CreateLetterInput = z.infer<typeof createLetterInputSchema>;

// Certificate pickup schema
export const certificatePickupSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  certificate_type: z.string(),
  pickup_date: z.coerce.date().nullable(),
  picked_by: z.string().nullable(),
  relationship: z.string().nullable(),
  id_card_number: z.string().nullable(),
  notes: z.string().nullable(),
  is_picked_up: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type CertificatePickup = z.infer<typeof certificatePickupSchema>;

// Input schemas for certificate pickup management
export const createCertificatePickupInputSchema = z.object({
  student_id: z.number(),
  certificate_type: z.string(),
  pickup_date: z.coerce.date().nullable(),
  picked_by: z.string().nullable(),
  relationship: z.string().nullable(),
  id_card_number: z.string().nullable(),
  notes: z.string().nullable(),
  is_picked_up: z.boolean().default(false)
});

export type CreateCertificatePickupInput = z.infer<typeof createCertificatePickupInputSchema>;

// Student transfer schema
export const studentTransferSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  transfer_date: z.coerce.date(),
  destination_school: z.string(),
  transfer_reason: z.string(),
  letter_number: z.string(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type StudentTransfer = z.infer<typeof studentTransferSchema>;

// Input schemas for student transfer management
export const createStudentTransferInputSchema = z.object({
  student_id: z.number(),
  transfer_date: z.coerce.date(),
  destination_school: z.string(),
  transfer_reason: z.string(),
  letter_number: z.string(),
  notes: z.string().nullable()
});

export type CreateStudentTransferInput = z.infer<typeof createStudentTransferInputSchema>;

// Student card schema
export const studentCardSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  card_number: z.string(),
  issue_date: z.coerce.date(),
  expiry_date: z.coerce.date(),
  is_active: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type StudentCard = z.infer<typeof studentCardSchema>;

// Input schemas for student card management
export const createStudentCardInputSchema = z.object({
  student_id: z.number(),
  card_number: z.string(),
  issue_date: z.coerce.date(),
  expiry_date: z.coerce.date(),
  is_active: z.boolean().default(true),
  notes: z.string().nullable()
});

export type CreateStudentCardInput = z.infer<typeof createStudentCardInputSchema>;

// School profile schema
export const schoolProfileSchema = z.object({
  id: z.number(),
  school_name: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  headmaster_name: z.string(),
  logo_path: z.string().nullable(),
  description: z.string().nullable(),
  vision: z.string().nullable(),
  mission: z.string().nullable(),
  established_year: z.number().int().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type SchoolProfile = z.infer<typeof schoolProfileSchema>;

// Input schemas for school profile management
export const updateSchoolProfileInputSchema = z.object({
  school_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  headmaster_name: z.string().optional(),
  logo_path: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  vision: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  established_year: z.number().int().nullable().optional()
});

export type UpdateSchoolProfileInput = z.infer<typeof updateSchoolProfileInputSchema>;

// Background settings schema
export const backgroundSettingsSchema = z.object({
  id: z.number(),
  name: z.string(),
  file_path: z.string(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BackgroundSettings = z.infer<typeof backgroundSettingsSchema>;

// Input schemas for background settings
export const createBackgroundInputSchema = z.object({
  name: z.string(),
  file_path: z.string(),
  is_active: z.boolean().default(false)
});

export type CreateBackgroundInput = z.infer<typeof createBackgroundInputSchema>;

// Dashboard stats schema
export const dashboardStatsSchema = z.object({
  total_students: z.number(),
  total_teachers: z.number(),
  students_from_smp: z.number(),
  students_from_mts: z.number(),
  students_from_other: z.number()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Login input schema
export const loginInputSchema = z.object({
  username: z.string(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Reset password input schema
export const resetPasswordInputSchema = z.object({
  email: z.string().email(),
  new_password: z.string().min(6)
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

// Update input schemas
export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  full_name: z.string().optional(),
  role: userRoleSchema.optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const updateStudentInputSchema = z.object({
  id: z.number(),
  nis: z.string().optional(),
  nisn: z.string().nullable().optional(),
  full_name: z.string().optional(),
  gender: genderSchema.optional(),
  birth_place: z.string().optional(),
  birth_date: z.coerce.date().optional(),
  address: z.string().optional(),
  phone: z.string().nullable().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().nullable().optional(),
  origin_school: studentOriginSchema.optional(),
  entry_year: z.number().int().optional(),
  class_id: z.number().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateStudentInput = z.infer<typeof updateStudentInputSchema>;

export const updateClassInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  grade: z.number().int().min(1).max(3).optional(),
  academic_year: z.string().optional(),
  homeroom_teacher_id: z.number().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateClassInput = z.infer<typeof updateClassInputSchema>;

export const updateTeacherInputSchema = z.object({
  id: z.number(),
  nip: z.string().nullable().optional(),
  full_name: z.string().optional(),
  gender: genderSchema.optional(),
  birth_place: z.string().optional(),
  birth_date: z.coerce.date().optional(),
  address: z.string().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  user_id: z.number().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateTeacherInput = z.infer<typeof updateTeacherInputSchema>;

export const updateSppPaymentInputSchema = z.object({
  id: z.number(),
  student_id: z.number().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  amount: z.number().positive().optional(),
  payment_date: z.coerce.date().nullable().optional(),
  status: paymentStatusSchema.optional(),
  notes: z.string().nullable().optional()
});

export type UpdateSppPaymentInput = z.infer<typeof updateSppPaymentInputSchema>;

export const updateLetterInputSchema = z.object({
  id: z.number(),
  letter_number: z.string().optional(),
  letter_type: letterTypeSchema.optional(),
  subject: z.string().optional(),
  sender: z.string().nullable().optional(),
  recipient: z.string().nullable().optional(),
  letter_date: z.coerce.date().optional(),
  received_date: z.coerce.date().nullable().optional(),
  description: z.string().nullable().optional(),
  file_path: z.string().nullable().optional()
});

export type UpdateLetterInput = z.infer<typeof updateLetterInputSchema>;

export const updateCertificatePickupInputSchema = z.object({
  id: z.number(),
  student_id: z.number().optional(),
  certificate_type: z.string().optional(),
  pickup_date: z.coerce.date().nullable().optional(),
  picked_by: z.string().nullable().optional(),
  relationship: z.string().nullable().optional(),
  id_card_number: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_picked_up: z.boolean().optional()
});

export type UpdateCertificatePickupInput = z.infer<typeof updateCertificatePickupInputSchema>;

export const updateStudentTransferInputSchema = z.object({
  id: z.number(),
  student_id: z.number().optional(),
  transfer_date: z.coerce.date().optional(),
  destination_school: z.string().optional(),
  transfer_reason: z.string().optional(),
  letter_number: z.string().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateStudentTransferInput = z.infer<typeof updateStudentTransferInputSchema>;

export const updateStudentCardInputSchema = z.object({
  id: z.number(),
  student_id: z.number().optional(),
  card_number: z.string().optional(),
  issue_date: z.coerce.date().optional(),
  expiry_date: z.coerce.date().optional(),
  is_active: z.boolean().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateStudentCardInput = z.infer<typeof updateStudentCardInputSchema>;

export const updateBackgroundInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  file_path: z.string().optional(),
  is_active: z.boolean().optional()
});

export type UpdateBackgroundInput = z.infer<typeof updateBackgroundInputSchema>;