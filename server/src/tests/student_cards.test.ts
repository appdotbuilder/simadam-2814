import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, studentCardsTable } from '../db/schema';
import { type CreateStudentCardInput, type UpdateStudentCardInput } from '../schema';
import {
  createStudentCard,
  getStudentCards,
  getStudentCardById,
  updateStudentCard,
  deleteStudentCard,
  getStudentCardsByStudent,
  getStudentCardsByStatus,
  getExpiringStudentCards
} from '../handlers/student_cards';
import { eq } from 'drizzle-orm';

describe('Student Cards', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test student
  const createTestStudent = async () => {
    const studentData = {
      nis: 'NIS001',
      nisn: 'NISN001',
      full_name: 'John Doe',
      gender: 'L' as const,
      birth_place: 'Jakarta',
      birth_date: '2005-01-01', // Use string format for database
      address: 'Jl. Test No. 1',
      phone: '081234567890',
      parent_name: 'Jane Doe',
      parent_phone: '081234567891',
      origin_school: 'smp_darul_muttaqien' as const,
      entry_year: 2023,
      class_id: null,
      is_active: true
    };

    const result = await db.insert(studentsTable)
      .values(studentData)
      .returning()
      .execute();

    return result[0];
  };

  const testCardInput: CreateStudentCardInput = {
    student_id: 1,
    card_number: 'CARD001',
    issue_date: new Date('2024-01-01'),
    expiry_date: new Date('2025-12-31'),
    is_active: true,
    notes: 'Test card'
  };

  describe('createStudentCard', () => {
    it('should create a student card successfully', async () => {
      const student = await createTestStudent();
      const input = { ...testCardInput, student_id: student.id };

      const result = await createStudentCard(input);

      expect(result.id).toBeDefined();
      expect(result.student_id).toEqual(student.id);
      expect(result.card_number).toEqual('CARD001');
      expect(result.issue_date).toEqual(input.issue_date);
      expect(result.expiry_date).toEqual(input.expiry_date);
      expect(result.is_active).toEqual(true);
      expect(result.notes).toEqual('Test card');
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should save student card to database', async () => {
      const student = await createTestStudent();
      const input = { ...testCardInput, student_id: student.id };

      const result = await createStudentCard(input);

      const savedCard = await db.select()
        .from(studentCardsTable)
        .where(eq(studentCardsTable.id, result.id))
        .execute();

      expect(savedCard).toHaveLength(1);
      expect(savedCard[0].student_id).toEqual(student.id);
      expect(savedCard[0].card_number).toEqual('CARD001');
    });

    it('should reject creation with non-existent student', async () => {
      const input = { ...testCardInput, student_id: 999 };

      await expect(createStudentCard(input)).rejects.toThrow(/Student with ID 999 not found/i);
    });

    it('should reject duplicate card numbers', async () => {
      const student = await createTestStudent();
      const input = { ...testCardInput, student_id: student.id };

      // Create first card
      await createStudentCard(input);

      // Try to create second card with same number
      await expect(createStudentCard(input)).rejects.toThrow(/Card number CARD001 already exists/i);
    });
  });

  describe('getStudentCards', () => {
    it('should return empty array when no cards exist', async () => {
      const result = await getStudentCards();

      expect(result).toEqual([]);
    });

    it('should return all student cards', async () => {
      const student = await createTestStudent();
      const input1 = { ...testCardInput, student_id: student.id, card_number: 'CARD001' };
      const input2 = { ...testCardInput, student_id: student.id, card_number: 'CARD002' };

      await createStudentCard(input1);
      await createStudentCard(input2);

      const result = await getStudentCards();

      expect(result).toHaveLength(2);
      expect(result.some(card => card.card_number === 'CARD001')).toBe(true);
      expect(result.some(card => card.card_number === 'CARD002')).toBe(true);
    });
  });

  describe('getStudentCardById', () => {
    it('should return null for non-existent card', async () => {
      const result = await getStudentCardById(999);

      expect(result).toBeNull();
    });

    it('should return student card by ID', async () => {
      const student = await createTestStudent();
      const input = { ...testCardInput, student_id: student.id };

      const created = await createStudentCard(input);
      const result = await getStudentCardById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(created.id);
      expect(result!.card_number).toEqual('CARD001');
    });
  });

  describe('updateStudentCard', () => {
    it('should update student card successfully', async () => {
      const student = await createTestStudent();
      const input = { ...testCardInput, student_id: student.id };

      const created = await createStudentCard(input);
      const updateInput: UpdateStudentCardInput = {
        id: created.id,
        card_number: 'CARD001_UPDATED',
        is_active: false,
        notes: 'Updated notes'
      };

      const result = await updateStudentCard(updateInput);

      expect(result.id).toEqual(created.id);
      expect(result.card_number).toEqual('CARD001_UPDATED');
      expect(result.is_active).toEqual(false);
      expect(result.notes).toEqual('Updated notes');
      expect(result.student_id).toEqual(student.id);
    });

    it('should update specific fields only', async () => {
      const student = await createTestStudent();
      const input = { ...testCardInput, student_id: student.id };

      const created = await createStudentCard(input);
      const updateInput: UpdateStudentCardInput = {
        id: created.id,
        notes: 'Only notes updated'
      };

      const result = await updateStudentCard(updateInput);

      expect(result.notes).toEqual('Only notes updated');
      expect(result.card_number).toEqual(created.card_number);
      expect(result.is_active).toEqual(created.is_active);
    });

    it('should reject update of non-existent card', async () => {
      const updateInput: UpdateStudentCardInput = {
        id: 999,
        notes: 'Test'
      };

      await expect(updateStudentCard(updateInput)).rejects.toThrow(/Student card with ID 999 not found/i);
    });

    it('should reject update with duplicate card number', async () => {
      const student = await createTestStudent();
      
      // Create two cards
      const card1 = await createStudentCard({ ...testCardInput, student_id: student.id, card_number: 'CARD001' });
      await createStudentCard({ ...testCardInput, student_id: student.id, card_number: 'CARD002' });

      // Try to update card1 with card2's number
      const updateInput: UpdateStudentCardInput = {
        id: card1.id,
        card_number: 'CARD002'
      };

      await expect(updateStudentCard(updateInput)).rejects.toThrow(/Card number CARD002 already exists/i);
    });

    it('should reject update with non-existent student', async () => {
      const student = await createTestStudent();
      const created = await createStudentCard({ ...testCardInput, student_id: student.id });

      const updateInput: UpdateStudentCardInput = {
        id: created.id,
        student_id: 999
      };

      await expect(updateStudentCard(updateInput)).rejects.toThrow(/Student with ID 999 not found/i);
    });
  });

  describe('deleteStudentCard', () => {
    it('should delete student card successfully', async () => {
      const student = await createTestStudent();
      const input = { ...testCardInput, student_id: student.id };

      const created = await createStudentCard(input);
      const result = await deleteStudentCard(created.id);

      expect(result.success).toBe(true);

      // Verify deletion
      const deleted = await getStudentCardById(created.id);
      expect(deleted).toBeNull();
    });

    it('should reject deletion of non-existent card', async () => {
      await expect(deleteStudentCard(999)).rejects.toThrow(/Student card with ID 999 not found/i);
    });
  });

  describe('getStudentCardsByStudent', () => {
    it('should return empty array for student with no cards', async () => {
      const student = await createTestStudent();

      const result = await getStudentCardsByStudent(student.id);

      expect(result).toEqual([]);
    });

    it('should return all cards for a specific student', async () => {
      const student = await createTestStudent();

      // Create multiple cards for the student
      await createStudentCard({ ...testCardInput, student_id: student.id, card_number: 'CARD001' });
      await createStudentCard({ ...testCardInput, student_id: student.id, card_number: 'CARD002' });

      const result = await getStudentCardsByStudent(student.id);

      expect(result).toHaveLength(2);
      expect(result.every(card => card.student_id === student.id)).toBe(true);
    });
  });

  describe('getStudentCardsByStatus', () => {
    it('should return cards filtered by active status', async () => {
      const student = await createTestStudent();

      // Create active and inactive cards
      await createStudentCard({ ...testCardInput, student_id: student.id, card_number: 'CARD001', is_active: true });
      await createStudentCard({ ...testCardInput, student_id: student.id, card_number: 'CARD002', is_active: false });

      const activeCards = await getStudentCardsByStatus(true);
      const inactiveCards = await getStudentCardsByStatus(false);

      expect(activeCards).toHaveLength(1);
      expect(activeCards[0].is_active).toBe(true);
      expect(inactiveCards).toHaveLength(1);
      expect(inactiveCards[0].is_active).toBe(false);
    });
  });

  describe('getExpiringStudentCards', () => {
    it('should return cards expiring within specified days', async () => {
      const student = await createTestStudent();

      const today = new Date();
      const in5Days = new Date(today);
      in5Days.setDate(in5Days.getDate() + 5);
      const in15Days = new Date(today);
      in15Days.setDate(in15Days.getDate() + 15);

      // Create cards with different expiry dates
      await createStudentCard({
        ...testCardInput,
        student_id: student.id,
        card_number: 'CARD001',
        expiry_date: in5Days,
        is_active: true
      });
      await createStudentCard({
        ...testCardInput,
        student_id: student.id,
        card_number: 'CARD002',
        expiry_date: in15Days,
        is_active: true
      });

      const expiring = await getExpiringStudentCards(10);

      expect(expiring).toHaveLength(1);
      expect(expiring[0].card_number).toEqual('CARD001');
    });

    it('should not return inactive cards even if expiring', async () => {
      const student = await createTestStudent();

      const today = new Date();
      const in5Days = new Date(today);
      in5Days.setDate(in5Days.getDate() + 5);

      // Create inactive expiring card
      await createStudentCard({
        ...testCardInput,
        student_id: student.id,
        card_number: 'CARD001',
        expiry_date: in5Days,
        is_active: false
      });

      const expiring = await getExpiringStudentCards(10);

      expect(expiring).toHaveLength(0);
    });

    it('should not return already expired cards', async () => {
      const student = await createTestStudent();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Create expired card
      await createStudentCard({
        ...testCardInput,
        student_id: student.id,
        card_number: 'CARD001',
        expiry_date: yesterday,
        is_active: true
      });

      const expiring = await getExpiringStudentCards(10);

      expect(expiring).toHaveLength(0);
    });
  });
});