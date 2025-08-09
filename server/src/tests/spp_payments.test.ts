import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, sppPaymentsTable } from '../db/schema';
import { type CreateSppPaymentInput, type CreateStudentInput } from '../schema';
import {
  createSppPayment,
  getSppPayments,
  getSppPaymentById,
  updateSppPayment,
  deleteSppPayment,
  getSppPaymentsByStudent,
  getSppPaymentsByStatus,
  getSppPaymentsByMonthYear
} from '../handlers/spp_payments';
import { eq, and } from 'drizzle-orm';

// Test data
const testStudentInput: CreateStudentInput = {
  nis: '12345',
  nisn: '0123456789',
  full_name: 'Test Student',
  gender: 'L',
  birth_place: 'Jakarta',
  birth_date: new Date('2005-01-01'),
  address: 'Jl. Test No. 1',
  phone: '081234567890',
  parent_name: 'Parent Name',
  parent_phone: '081987654321',
  origin_school: 'smp_darul_muttaqien',
  entry_year: 2024,
  class_id: null,
  is_active: true
};

const testSppPaymentInput: CreateSppPaymentInput = {
  student_id: 1,
  month: 1,
  year: 2024,
  amount: 500000,
  payment_date: new Date('2024-01-15'),
  status: 'lunas',
  notes: 'Test payment'
};

// Helper function to create a student in database
const createTestStudent = async (nis: string = '12345', name: string = 'Test Student') => {
  const result = await db.insert(studentsTable)
    .values({
      nis: nis,
      nisn: '0123456789',
      full_name: name,
      gender: 'L',
      birth_place: 'Jakarta',
      birth_date: '2005-01-01', // Use string for date field
      address: 'Jl. Test No. 1',
      phone: '081234567890',
      parent_name: 'Parent Name',
      parent_phone: '081987654321',
      origin_school: 'smp_darul_muttaqien',
      entry_year: 2024,
      class_id: null,
      is_active: true
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('SPP Payment Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createSppPayment', () => {
    it('should create an SPP payment', async () => {
      // Create a student first
      const student = await createTestStudent();
      const paymentInput = { ...testSppPaymentInput, student_id: student.id };

      const result = await createSppPayment(paymentInput);

      // Basic field validation
      expect(result.student_id).toEqual(student.id);
      expect(result.month).toEqual(1);
      expect(result.year).toEqual(2024);
      expect(result.amount).toEqual(500000);
      expect(typeof result.amount).toBe('number'); // Verify numeric conversion
      expect(result.payment_date).toBeInstanceOf(Date);
      expect(result.status).toEqual('lunas');
      expect(result.notes).toEqual('Test payment');
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should save SPP payment to database', async () => {
      // Create a student first
      const student = await createTestStudent();
      const paymentInput = { ...testSppPaymentInput, student_id: student.id };

      const result = await createSppPayment(paymentInput);

      // Query using proper drizzle syntax
      const payments = await db.select()
        .from(sppPaymentsTable)
        .where(eq(sppPaymentsTable.id, result.id))
        .execute();

      expect(payments).toHaveLength(1);
      expect(payments[0].student_id).toEqual(student.id);
      expect(payments[0].month).toEqual(1);
      expect(payments[0].year).toEqual(2024);
      expect(parseFloat(payments[0].amount)).toEqual(500000);
      expect(payments[0].status).toEqual('lunas');
      expect(payments[0].notes).toEqual('Test payment');
      expect(payments[0].created_at).toBeInstanceOf(Date);
    });

    it('should throw error for non-existent student', async () => {
      const paymentInput = { ...testSppPaymentInput, student_id: 999 };

      await expect(createSppPayment(paymentInput)).rejects.toThrow(/student.*not found/i);
    });

    it('should prevent duplicate payments for same student, month, and year', async () => {
      // Create a student first
      const student = await createTestStudent();
      const paymentInput = { ...testSppPaymentInput, student_id: student.id };

      // Create first payment
      await createSppPayment(paymentInput);

      // Try to create duplicate payment
      await expect(createSppPayment(paymentInput)).rejects.toThrow(/already exists/i);
    });
  });

  describe('getSppPayments', () => {
    it('should return all SPP payments', async () => {
      // Create a student first
      const student = await createTestStudent();

      // Create multiple payments
      const payment1 = { ...testSppPaymentInput, student_id: student.id, month: 1 };
      const payment2 = { ...testSppPaymentInput, student_id: student.id, month: 2 };

      await createSppPayment(payment1);
      await createSppPayment(payment2);

      const results = await getSppPayments();

      expect(results).toHaveLength(2);
      expect(results[0].amount).toEqual(500000);
      expect(typeof results[0].amount).toBe('number');
      expect(results[1].amount).toEqual(500000);
      expect(typeof results[1].amount).toBe('number');
    });

    it('should return empty array when no payments exist', async () => {
      const results = await getSppPayments();
      expect(results).toEqual([]);
    });
  });

  describe('getSppPaymentById', () => {
    it('should return SPP payment by ID', async () => {
      // Create a student first
      const student = await createTestStudent();
      const paymentInput = { ...testSppPaymentInput, student_id: student.id };

      const payment = await createSppPayment(paymentInput);
      const result = await getSppPaymentById(payment.id);

      expect(result).toBeDefined();
      expect(result!.id).toEqual(payment.id);
      expect(result!.student_id).toEqual(student.id);
      expect(result!.amount).toEqual(500000);
      expect(typeof result!.amount).toBe('number');
    });

    it('should return null for non-existent payment', async () => {
      const result = await getSppPaymentById(999);
      expect(result).toBeNull();
    });
  });

  describe('updateSppPayment', () => {
    it('should update SPP payment', async () => {
      // Create a student first
      const student = await createTestStudent();
      const paymentInput = { ...testSppPaymentInput, student_id: student.id };

      const payment = await createSppPayment(paymentInput);

      const updateInput = {
        id: payment.id,
        amount: 750000,
        status: 'terlambat' as const,
        notes: 'Updated payment'
      };

      const result = await updateSppPayment(updateInput);

      expect(result.id).toEqual(payment.id);
      expect(result.amount).toEqual(750000);
      expect(typeof result.amount).toBe('number');
      expect(result.status).toEqual('terlambat');
      expect(result.notes).toEqual('Updated payment');
    });

    it('should throw error for non-existent payment', async () => {
      const updateInput = {
        id: 999,
        amount: 750000,
        status: 'lunas' as const
      };

      await expect(updateSppPayment(updateInput)).rejects.toThrow(/not found/i);
    });
  });

  describe('deleteSppPayment', () => {
    it('should delete SPP payment', async () => {
      // Create a student first
      const student = await createTestStudent();
      const paymentInput = { ...testSppPaymentInput, student_id: student.id };

      const payment = await createSppPayment(paymentInput);

      const result = await deleteSppPayment(payment.id);

      expect(result.success).toBe(true);

      // Verify payment is deleted
      const deletedPayment = await getSppPaymentById(payment.id);
      expect(deletedPayment).toBeNull();
    });

    it('should throw error for non-existent payment', async () => {
      await expect(deleteSppPayment(999)).rejects.toThrow(/not found/i);
    });
  });

  describe('getSppPaymentsByStudent', () => {
    it('should return payments for specific student', async () => {
      // Create two students
      const student1 = await createTestStudent('12345', 'Student 1');
      const student2 = await createTestStudent('67890', 'Student 2');

      // Create payments for both students
      const payment1 = { ...testSppPaymentInput, student_id: student1.id, month: 1 };
      const payment2 = { ...testSppPaymentInput, student_id: student1.id, month: 2 };
      const payment3 = { ...testSppPaymentInput, student_id: student2.id, month: 1 };

      await createSppPayment(payment1);
      await createSppPayment(payment2);
      await createSppPayment(payment3);

      const results = await getSppPaymentsByStudent(student1.id);

      expect(results).toHaveLength(2);
      results.forEach(payment => {
        expect(payment.student_id).toEqual(student1.id);
        expect(typeof payment.amount).toBe('number');
      });
    });

    it('should throw error for non-existent student', async () => {
      await expect(getSppPaymentsByStudent(999)).rejects.toThrow(/student.*not found/i);
    });
  });

  describe('getSppPaymentsByStatus', () => {
    it('should return payments by status', async () => {
      // Create a student first
      const student = await createTestStudent();

      // Create payments with different statuses
      const payment1 = { ...testSppPaymentInput, student_id: student.id, month: 1, status: 'lunas' as const };
      const payment2 = { ...testSppPaymentInput, student_id: student.id, month: 2, status: 'belum_bayar' as const };
      const payment3 = { ...testSppPaymentInput, student_id: student.id, month: 3, status: 'lunas' as const };

      await createSppPayment(payment1);
      await createSppPayment(payment2);
      await createSppPayment(payment3);

      const results = await getSppPaymentsByStatus('lunas');

      expect(results).toHaveLength(2);
      results.forEach(payment => {
        expect(payment.status).toEqual('lunas');
        expect(typeof payment.amount).toBe('number');
      });
    });

    it('should throw error for invalid status', async () => {
      await expect(getSppPaymentsByStatus('invalid_status')).rejects.toThrow(/invalid status/i);
    });
  });

  describe('getSppPaymentsByMonthYear', () => {
    it('should return payments by month and year', async () => {
      // Create two students to avoid duplicate constraint
      const student1 = await createTestStudent('12345', 'Student 1');
      const student2 = await createTestStudent('67890', 'Student 2');

      // Create payments for different months/years
      const payment1 = { ...testSppPaymentInput, student_id: student1.id, month: 1, year: 2024 };
      const payment2 = { ...testSppPaymentInput, student_id: student2.id, month: 2, year: 2024 };
      const payment3 = { ...testSppPaymentInput, student_id: student2.id, month: 1, year: 2023 };

      await createSppPayment(payment1);
      await createSppPayment(payment2);
      await createSppPayment(payment3);

      const results = await getSppPaymentsByMonthYear(1, 2024);

      expect(results).toHaveLength(1);
      expect(results[0].month).toEqual(1);
      expect(results[0].year).toEqual(2024);
      expect(typeof results[0].amount).toBe('number');
    });
  });
});