import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  loginInputSchema,
  resetPasswordInputSchema,
  createUserInputSchema,
  updateUserInputSchema,
  createStudentInputSchema,
  updateStudentInputSchema,
  createTeacherInputSchema,
  updateTeacherInputSchema,
  createClassInputSchema,
  updateClassInputSchema,
  createSppPaymentInputSchema,
  updateSppPaymentInputSchema,
  createLetterInputSchema,
  updateLetterInputSchema,
  createCertificatePickupInputSchema,
  updateCertificatePickupInputSchema,
  createStudentTransferInputSchema,
  updateStudentTransferInputSchema,
  createStudentCardInputSchema,
  updateStudentCardInputSchema,
  updateSchoolProfileInputSchema,
  createBackgroundInputSchema,
  updateBackgroundInputSchema
} from './schema';

// Import handlers
import { login, logout, resetPassword } from './handlers/auth';
import { getDashboardStats } from './handlers/dashboard';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './handlers/users';
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, getStudentsByClass, getStudentsByOrigin } from './handlers/students';
import { createTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher, getTeacherByUserId } from './handlers/teachers';
import { createClass, getClasses, getClassById, updateClass, deleteClass, getClassesByGrade, getClassesByAcademicYear } from './handlers/classes';
import { createSppPayment, getSppPayments, getSppPaymentById, updateSppPayment, deleteSppPayment, getSppPaymentsByStudent, getSppPaymentsByStatus, getSppPaymentsByMonthYear } from './handlers/spp_payments';
import { createLetter, getLetters, getLetterById, updateLetter, deleteLetter, getLettersByType, getLettersByDateRange } from './handlers/letters';
import { createCertificatePickup, getCertificatePickups, getCertificatePickupById, updateCertificatePickup, deleteCertificatePickup, getCertificatePickupsByStudent, getCertificatePickupsByStatus } from './handlers/certificate_pickups';
import { createStudentTransfer, getStudentTransfers, getStudentTransferById, updateStudentTransfer, deleteStudentTransfer, getStudentTransfersByStudent, getStudentTransfersByDateRange } from './handlers/student_transfers';
import { createStudentCard, getStudentCards, getStudentCardById, updateStudentCard, deleteStudentCard, getStudentCardsByStudent, getStudentCardsByStatus, getExpiringStudentCards } from './handlers/student_cards';
import { getSchoolProfile, updateSchoolProfile, uploadLogo } from './handlers/school_profile';
import { createBackground, getBackgrounds, getBackgroundById, getActiveBackground, updateBackground, deleteBackground, setActiveBackground, uploadBackground } from './handlers/background_settings';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication
  auth: router({
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => login(input)),
    logout: publicProcedure
      .mutation(() => logout()),
    resetPassword: publicProcedure
      .input(resetPasswordInputSchema)
      .mutation(({ input }) => resetPassword(input)),
  }),

  // Dashboard
  dashboard: router({
    getStats: publicProcedure
      .query(() => getDashboardStats()),
  }),

  // User management
  users: router({
    create: publicProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => createUser(input)),
    getAll: publicProcedure
      .query(() => getUsers()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUserById(input.id)),
    update: publicProcedure
      .input(updateUserInputSchema)
      .mutation(({ input }) => updateUser(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteUser(input.id)),
  }),

  // Student management
  students: router({
    create: publicProcedure
      .input(createStudentInputSchema)
      .mutation(({ input }) => createStudent(input)),
    getAll: publicProcedure
      .query(() => getStudents()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getStudentById(input.id)),
    update: publicProcedure
      .input(updateStudentInputSchema)
      .mutation(({ input }) => updateStudent(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteStudent(input.id)),
    getByClass: publicProcedure
      .input(z.object({ classId: z.number() }))
      .query(({ input }) => getStudentsByClass(input.classId)),
    getByOrigin: publicProcedure
      .input(z.object({ origin: z.string() }))
      .query(({ input }) => getStudentsByOrigin(input.origin)),
  }),

  // Teacher management
  teachers: router({
    create: publicProcedure
      .input(createTeacherInputSchema)
      .mutation(({ input }) => createTeacher(input)),
    getAll: publicProcedure
      .query(() => getTeachers()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getTeacherById(input.id)),
    update: publicProcedure
      .input(updateTeacherInputSchema)
      .mutation(({ input }) => updateTeacher(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTeacher(input.id)),
    getByUserId: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getTeacherByUserId(input.userId)),
  }),

  // Class management (Penempatan Kelas)
  classes: router({
    create: publicProcedure
      .input(createClassInputSchema)
      .mutation(({ input }) => createClass(input)),
    getAll: publicProcedure
      .query(() => getClasses()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getClassById(input.id)),
    update: publicProcedure
      .input(updateClassInputSchema)
      .mutation(({ input }) => updateClass(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteClass(input.id)),
    getByGrade: publicProcedure
      .input(z.object({ grade: z.number() }))
      .query(({ input }) => getClassesByGrade(input.grade)),
    getByAcademicYear: publicProcedure
      .input(z.object({ academicYear: z.string() }))
      .query(({ input }) => getClassesByAcademicYear(input.academicYear)),
  }),

  // SPP Payment management
  sppPayments: router({
    create: publicProcedure
      .input(createSppPaymentInputSchema)
      .mutation(({ input }) => createSppPayment(input)),
    getAll: publicProcedure
      .query(() => getSppPayments()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getSppPaymentById(input.id)),
    update: publicProcedure
      .input(updateSppPaymentInputSchema)
      .mutation(({ input }) => updateSppPayment(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteSppPayment(input.id)),
    getByStudent: publicProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => getSppPaymentsByStudent(input.studentId)),
    getByStatus: publicProcedure
      .input(z.object({ status: z.string() }))
      .query(({ input }) => getSppPaymentsByStatus(input.status)),
    getByMonthYear: publicProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ input }) => getSppPaymentsByMonthYear(input.month, input.year)),
  }),

  // Letter management (Surat Keluar Masuk)
  letters: router({
    create: publicProcedure
      .input(createLetterInputSchema)
      .mutation(({ input }) => createLetter(input)),
    getAll: publicProcedure
      .query(() => getLetters()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getLetterById(input.id)),
    update: publicProcedure
      .input(updateLetterInputSchema)
      .mutation(({ input }) => updateLetter(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteLetter(input.id)),
    getByType: publicProcedure
      .input(z.object({ letterType: z.string() }))
      .query(({ input }) => getLettersByType(input.letterType)),
    getByDateRange: publicProcedure
      .input(z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }))
      .query(({ input }) => getLettersByDateRange(input.startDate, input.endDate)),
  }),

  // Certificate pickup management (Pengambilan Ijazah)
  certificatePickups: router({
    create: publicProcedure
      .input(createCertificatePickupInputSchema)
      .mutation(({ input }) => createCertificatePickup(input)),
    getAll: publicProcedure
      .query(() => getCertificatePickups()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getCertificatePickupById(input.id)),
    update: publicProcedure
      .input(updateCertificatePickupInputSchema)
      .mutation(({ input }) => updateCertificatePickup(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCertificatePickup(input.id)),
    getByStudent: publicProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => getCertificatePickupsByStudent(input.studentId)),
    getByStatus: publicProcedure
      .input(z.object({ isPickedUp: z.boolean() }))
      .query(({ input }) => getCertificatePickupsByStatus(input.isPickedUp)),
  }),

  // Student transfer management (Surat Mutasi)
  studentTransfers: router({
    create: publicProcedure
      .input(createStudentTransferInputSchema)
      .mutation(({ input }) => createStudentTransfer(input)),
    getAll: publicProcedure
      .query(() => getStudentTransfers()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getStudentTransferById(input.id)),
    update: publicProcedure
      .input(updateStudentTransferInputSchema)
      .mutation(({ input }) => updateStudentTransfer(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteStudentTransfer(input.id)),
    getByStudent: publicProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => getStudentTransfersByStudent(input.studentId)),
    getByDateRange: publicProcedure
      .input(z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }))
      .query(({ input }) => getStudentTransfersByDateRange(input.startDate, input.endDate)),
  }),

  // Student card management (Kartu Pelajar)
  studentCards: router({
    create: publicProcedure
      .input(createStudentCardInputSchema)
      .mutation(({ input }) => createStudentCard(input)),
    getAll: publicProcedure
      .query(() => getStudentCards()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getStudentCardById(input.id)),
    update: publicProcedure
      .input(updateStudentCardInputSchema)
      .mutation(({ input }) => updateStudentCard(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteStudentCard(input.id)),
    getByStudent: publicProcedure
      .input(z.object({ studentId: z.number() }))
      .query(({ input }) => getStudentCardsByStudent(input.studentId)),
    getByStatus: publicProcedure
      .input(z.object({ isActive: z.boolean() }))
      .query(({ input }) => getStudentCardsByStatus(input.isActive)),
    getExpiring: publicProcedure
      .input(z.object({ daysUntilExpiry: z.number() }))
      .query(({ input }) => getExpiringStudentCards(input.daysUntilExpiry)),
  }),

  // School profile management
  schoolProfile: router({
    get: publicProcedure
      .query(() => getSchoolProfile()),
    update: publicProcedure
      .input(updateSchoolProfileInputSchema)
      .mutation(({ input }) => updateSchoolProfile(input)),
    uploadLogo: publicProcedure
      .input(z.object({ logoFile: z.any() }))
      .mutation(({ input }) => uploadLogo(input.logoFile)),
  }),

  // Background settings management
  backgroundSettings: router({
    create: publicProcedure
      .input(createBackgroundInputSchema)
      .mutation(({ input }) => createBackground(input)),
    getAll: publicProcedure
      .query(() => getBackgrounds()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getBackgroundById(input.id)),
    getActive: publicProcedure
      .query(() => getActiveBackground()),
    update: publicProcedure
      .input(updateBackgroundInputSchema)
      .mutation(({ input }) => updateBackground(input)),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteBackground(input.id)),
    setActive: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => setActiveBackground(input.id)),
    upload: publicProcedure
      .input(z.object({ backgroundFile: z.any(), name: z.string() }))
      .mutation(({ input }) => uploadBackground(input.backgroundFile, input.name)),
  }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`🚀 SIMADAM TRPC Server listening at port: ${port}`);
  console.log(`📚 School Information System - MA Darul Muttaqien`);
}

start();