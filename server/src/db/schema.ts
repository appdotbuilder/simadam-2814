import { serial, text, pgTable, timestamp, integer, boolean, date, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'guru']);
export const studentOriginEnum = pgEnum('student_origin', ['smp_darul_muttaqien', 'mts', 'luar_smp_darul_muttaqien']);
export const genderEnum = pgEnum('gender', ['L', 'P']);
export const paymentStatusEnum = pgEnum('payment_status', ['belum_bayar', 'lunas', 'terlambat']);
export const letterTypeEnum = pgEnum('letter_type', ['masuk', 'keluar']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name: text('full_name').notNull(),
  role: userRoleEnum('role').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Teachers table
export const teachersTable = pgTable('teachers', {
  id: serial('id').primaryKey(),
  nip: text('nip'), // Nullable
  full_name: text('full_name').notNull(),
  gender: genderEnum('gender').notNull(),
  birth_place: text('birth_place').notNull(),
  birth_date: date('birth_date').notNull(),
  address: text('address').notNull(),
  phone: text('phone'), // Nullable
  email: text('email'), // Nullable
  subject: text('subject'), // Nullable
  user_id: integer('user_id'), // Nullable - references users.id
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Classes table
export const classesTable = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  grade: integer('grade').notNull(), // 1, 2, or 3
  academic_year: text('academic_year').notNull(), // e.g., "2024/2025"
  homeroom_teacher_id: integer('homeroom_teacher_id'), // Nullable - references teachers.id
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Students table
export const studentsTable = pgTable('students', {
  id: serial('id').primaryKey(),
  nis: text('nis').notNull().unique(),
  nisn: text('nisn'), // Nullable
  full_name: text('full_name').notNull(),
  gender: genderEnum('gender').notNull(),
  birth_place: text('birth_place').notNull(),
  birth_date: date('birth_date').notNull(),
  address: text('address').notNull(),
  phone: text('phone'), // Nullable
  parent_name: text('parent_name').notNull(),
  parent_phone: text('parent_phone'), // Nullable
  origin_school: studentOriginEnum('origin_school').notNull(),
  entry_year: integer('entry_year').notNull(),
  class_id: integer('class_id'), // Nullable - references classes.id
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// SPP Payments table
export const sppPaymentsTable = pgTable('spp_payments', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(), // References students.id
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  payment_date: timestamp('payment_date'), // Nullable
  status: paymentStatusEnum('status').notNull(),
  notes: text('notes'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Letters table (Surat Masuk/Keluar)
export const lettersTable = pgTable('letters', {
  id: serial('id').primaryKey(),
  letter_number: text('letter_number').notNull(),
  letter_type: letterTypeEnum('letter_type').notNull(),
  subject: text('subject').notNull(),
  sender: text('sender'), // Nullable
  recipient: text('recipient'), // Nullable
  letter_date: date('letter_date').notNull(),
  received_date: date('received_date'), // Nullable
  description: text('description'), // Nullable
  file_path: text('file_path'), // Nullable - for storing document files
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Certificate pickup table (Pengambilan Ijazah)
export const certificatePickupsTable = pgTable('certificate_pickups', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(), // References students.id
  certificate_type: text('certificate_type').notNull(),
  pickup_date: timestamp('pickup_date'), // Nullable
  picked_by: text('picked_by'), // Nullable - name of person who picked up
  relationship: text('relationship'), // Nullable - relationship to student
  id_card_number: text('id_card_number'), // Nullable - ID card of person who picked up
  notes: text('notes'), // Nullable
  is_picked_up: boolean('is_picked_up').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Student transfers table (Surat Mutasi)
export const studentTransfersTable = pgTable('student_transfers', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(), // References students.id
  transfer_date: date('transfer_date').notNull(),
  destination_school: text('destination_school').notNull(),
  transfer_reason: text('transfer_reason').notNull(),
  letter_number: text('letter_number').notNull(),
  notes: text('notes'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Student cards table (Kartu Pelajar)
export const studentCardsTable = pgTable('student_cards', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').notNull(), // References students.id
  card_number: text('card_number').notNull().unique(),
  issue_date: date('issue_date').notNull(),
  expiry_date: date('expiry_date').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  notes: text('notes'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// School profile table
export const schoolProfileTable = pgTable('school_profile', {
  id: serial('id').primaryKey(),
  school_name: text('school_name').notNull(),
  address: text('address').notNull(),
  phone: text('phone'), // Nullable
  email: text('email'), // Nullable
  website: text('website'), // Nullable
  headmaster_name: text('headmaster_name').notNull(),
  logo_path: text('logo_path'), // Nullable
  description: text('description'), // Nullable
  vision: text('vision'), // Nullable
  mission: text('mission'), // Nullable
  established_year: integer('established_year'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Background settings table
export const backgroundSettingsTable = pgTable('background_settings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  file_path: text('file_path').notNull(),
  is_active: boolean('is_active').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ one }) => ({
  teacher: one(teachersTable, {
    fields: [usersTable.id],
    references: [teachersTable.user_id]
  })
}));

export const teachersRelations = relations(teachersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [teachersTable.user_id],
    references: [usersTable.id]
  }),
  homeroomClasses: many(classesTable)
}));

export const classesRelations = relations(classesTable, ({ one, many }) => ({
  homeroomTeacher: one(teachersTable, {
    fields: [classesTable.homeroom_teacher_id],
    references: [teachersTable.id]
  }),
  students: many(studentsTable)
}));

export const studentsRelations = relations(studentsTable, ({ one, many }) => ({
  class: one(classesTable, {
    fields: [studentsTable.class_id],
    references: [classesTable.id]
  }),
  sppPayments: many(sppPaymentsTable),
  certificatePickups: many(certificatePickupsTable),
  studentTransfers: many(studentTransfersTable),
  studentCards: many(studentCardsTable)
}));

export const sppPaymentsRelations = relations(sppPaymentsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [sppPaymentsTable.student_id],
    references: [studentsTable.id]
  })
}));

export const certificatePickupsRelations = relations(certificatePickupsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [certificatePickupsTable.student_id],
    references: [studentsTable.id]
  })
}));

export const studentTransfersRelations = relations(studentTransfersTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [studentTransfersTable.student_id],
    references: [studentsTable.id]
  })
}));

export const studentCardsRelations = relations(studentCardsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [studentCardsTable.student_id],
    references: [studentsTable.id]
  })
}));

// Export all tables for drizzle queries
export const tables = {
  users: usersTable,
  teachers: teachersTable,
  classes: classesTable,
  students: studentsTable,
  sppPayments: sppPaymentsTable,
  letters: lettersTable,
  certificatePickups: certificatePickupsTable,
  studentTransfers: studentTransfersTable,
  studentCards: studentCardsTable,
  schoolProfile: schoolProfileTable,
  backgroundSettings: backgroundSettingsTable
};

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Teacher = typeof teachersTable.$inferSelect;
export type NewTeacher = typeof teachersTable.$inferInsert;

export type Class = typeof classesTable.$inferSelect;
export type NewClass = typeof classesTable.$inferInsert;

export type Student = typeof studentsTable.$inferSelect;
export type NewStudent = typeof studentsTable.$inferInsert;

export type SppPayment = typeof sppPaymentsTable.$inferSelect;
export type NewSppPayment = typeof sppPaymentsTable.$inferInsert;

export type Letter = typeof lettersTable.$inferSelect;
export type NewLetter = typeof lettersTable.$inferInsert;

export type CertificatePickup = typeof certificatePickupsTable.$inferSelect;
export type NewCertificatePickup = typeof certificatePickupsTable.$inferInsert;

export type StudentTransfer = typeof studentTransfersTable.$inferSelect;
export type NewStudentTransfer = typeof studentTransfersTable.$inferInsert;

export type StudentCard = typeof studentCardsTable.$inferSelect;
export type NewStudentCard = typeof studentCardsTable.$inferInsert;

export type SchoolProfile = typeof schoolProfileTable.$inferSelect;
export type NewSchoolProfile = typeof schoolProfileTable.$inferInsert;

export type BackgroundSettings = typeof backgroundSettingsTable.$inferSelect;
export type NewBackgroundSettings = typeof backgroundSettingsTable.$inferInsert;