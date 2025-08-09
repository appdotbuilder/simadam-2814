import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, classesTable } from '../db/schema';
import { type CreateCertificatePickupInput, type UpdateCertificatePickupInput } from '../schema';
import { 
  createCertificatePickup, 
  getCertificatePickups,
  getCertificatePickupById,
  updateCertificatePickup,
  deleteCertificatePickup,
  getCertificatePickupsByStudent,
  getCertificatePickupsByStatus
} from '../handlers/certificate_pickups';

// Test data
const testClass = {
  name: 'VII-A',
  grade: 1,
  academic_year: '2024/2025',
  homeroom_teacher_id: null,
  is_active: true
};

const testStudent = {
  nis: '2024001',
  nisn: '1234567890',
  full_name: 'Ahmad Fauzan',
  gender: 'L' as const,
  birth_place: 'Jakarta',
  birth_date: '2010-01-15', // Use string format for database insertion
  address: 'Jl. Merdeka No. 123',
  phone: '081234567890',
  parent_name: 'Budi Santoso',
  parent_phone: '081987654321',
  origin_school: 'smp_darul_muttaqien' as const,
  entry_year: 2024,
  class_id: null as number | null,
  is_active: true
};

const testCertificatePickupInput: CreateCertificatePickupInput = {
  student_id: 0, // Will be set after creating student
  certificate_type: 'Ijazah',
  pickup_date: new Date('2024-12-01'),
  picked_by: 'Budi Santoso',
  relationship: 'Orang Tua',
  id_card_number: '3201234567890123',
  notes: 'Dokumen lengkap',
  is_picked_up: false
};

describe('Certificate Pickup Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let studentId: number;

  beforeEach(async () => {
    // Create prerequisite data
    const classResult = await db.insert(classesTable)
      .values(testClass)
      .returning()
      .execute();

    const studentData = { ...testStudent, class_id: classResult[0].id };
    const studentResult = await db.insert(studentsTable)
      .values(studentData)
      .returning()
      .execute();

    studentId = studentResult[0].id;
  });

  describe('createCertificatePickup', () => {
    it('should create a certificate pickup', async () => {
      const input = { ...testCertificatePickupInput, student_id: studentId };
      const result = await createCertificatePickup(input);

      expect(result.student_id).toEqual(studentId);
      expect(result.certificate_type).toEqual('Ijazah');
      expect(result.pickup_date).toBeInstanceOf(Date);
      expect(result.picked_by).toEqual('Budi Santoso');
      expect(result.relationship).toEqual('Orang Tua');
      expect(result.id_card_number).toEqual('3201234567890123');
      expect(result.notes).toEqual('Dokumen lengkap');
      expect(result.is_picked_up).toEqual(false);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should reject creation with non-existent student_id', async () => {
      const input = { ...testCertificatePickupInput, student_id: 99999 };
      
      await expect(createCertificatePickup(input)).rejects.toThrow(/student with id 99999 not found/i);
    });

    it('should create certificate pickup with nullable fields as null', async () => {
      const input: CreateCertificatePickupInput = {
        student_id: studentId,
        certificate_type: 'SKHUN',
        pickup_date: null,
        picked_by: null,
        relationship: null,
        id_card_number: null,
        notes: null,
        is_picked_up: false
      };

      const result = await createCertificatePickup(input);

      expect(result.student_id).toEqual(studentId);
      expect(result.certificate_type).toEqual('SKHUN');
      expect(result.pickup_date).toBeNull();
      expect(result.picked_by).toBeNull();
      expect(result.relationship).toBeNull();
      expect(result.id_card_number).toBeNull();
      expect(result.notes).toBeNull();
      expect(result.is_picked_up).toEqual(false);
    });
  });

  describe('getCertificatePickups', () => {
    it('should return empty array when no certificate pickups exist', async () => {
      const result = await getCertificatePickups();
      expect(result).toEqual([]);
    });

    it('should return all certificate pickups', async () => {
      const input1 = { ...testCertificatePickupInput, student_id: studentId, certificate_type: 'Ijazah' };
      const input2 = { ...testCertificatePickupInput, student_id: studentId, certificate_type: 'SKHUN' };

      await createCertificatePickup(input1);
      await createCertificatePickup(input2);

      const result = await getCertificatePickups();
      expect(result).toHaveLength(2);
      expect(result[0].certificate_type).toEqual('Ijazah');
      expect(result[1].certificate_type).toEqual('SKHUN');
    });
  });

  describe('getCertificatePickupById', () => {
    it('should return certificate pickup by ID', async () => {
      const input = { ...testCertificatePickupInput, student_id: studentId };
      const created = await createCertificatePickup(input);

      const result = await getCertificatePickupById(created.id);
      expect(result).not.toBeNull();
      expect(result!.id).toEqual(created.id);
      expect(result!.student_id).toEqual(studentId);
      expect(result!.certificate_type).toEqual('Ijazah');
    });

    it('should return null for non-existent ID', async () => {
      const result = await getCertificatePickupById(99999);
      expect(result).toBeNull();
    });
  });

  describe('updateCertificatePickup', () => {
    it('should update certificate pickup fields', async () => {
      const input = { ...testCertificatePickupInput, student_id: studentId };
      const created = await createCertificatePickup(input);

      const updateInput: UpdateCertificatePickupInput = {
        id: created.id,
        certificate_type: 'SKHUN',
        picked_by: 'Siti Aminah',
        relationship: 'Ibu Kandung',
        is_picked_up: true,
        notes: 'Sudah diambil'
      };

      const result = await updateCertificatePickup(updateInput);

      expect(result.id).toEqual(created.id);
      expect(result.certificate_type).toEqual('SKHUN');
      expect(result.picked_by).toEqual('Siti Aminah');
      expect(result.relationship).toEqual('Ibu Kandung');
      expect(result.is_picked_up).toEqual(true);
      expect(result.notes).toEqual('Sudah diambil');
      expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
    });

    it('should reject update with non-existent student_id', async () => {
      const input = { ...testCertificatePickupInput, student_id: studentId };
      const created = await createCertificatePickup(input);

      const updateInput: UpdateCertificatePickupInput = {
        id: created.id,
        student_id: 99999
      };

      await expect(updateCertificatePickup(updateInput)).rejects.toThrow(/student with id 99999 not found/i);
    });

    it('should reject update with non-existent certificate pickup ID', async () => {
      const updateInput: UpdateCertificatePickupInput = {
        id: 99999,
        certificate_type: 'Ijazah'
      };

      await expect(updateCertificatePickup(updateInput)).rejects.toThrow(/certificate pickup with id 99999 not found/i);
    });
  });

  describe('deleteCertificatePickup', () => {
    it('should delete certificate pickup', async () => {
      const input = { ...testCertificatePickupInput, student_id: studentId };
      const created = await createCertificatePickup(input);

      const result = await deleteCertificatePickup(created.id);
      expect(result.success).toEqual(true);

      // Verify deletion
      const found = await getCertificatePickupById(created.id);
      expect(found).toBeNull();
    });

    it('should reject deletion with non-existent ID', async () => {
      await expect(deleteCertificatePickup(99999)).rejects.toThrow(/certificate pickup with id 99999 not found/i);
    });
  });

  describe('getCertificatePickupsByStudent', () => {
    it('should return certificate pickups for specific student', async () => {
      const input1 = { ...testCertificatePickupInput, student_id: studentId, certificate_type: 'Ijazah' };
      const input2 = { ...testCertificatePickupInput, student_id: studentId, certificate_type: 'SKHUN' };

      await createCertificatePickup(input1);
      await createCertificatePickup(input2);

      const result = await getCertificatePickupsByStudent(studentId);
      expect(result).toHaveLength(2);
      expect(result.every(pickup => pickup.student_id === studentId)).toBe(true);
    });

    it('should return empty array for student with no certificate pickups', async () => {
      const result = await getCertificatePickupsByStudent(studentId);
      expect(result).toEqual([]);
    });
  });

  describe('getCertificatePickupsByStatus', () => {
    it('should return certificate pickups by pickup status', async () => {
      const input1 = { ...testCertificatePickupInput, student_id: studentId, is_picked_up: true };
      const input2 = { ...testCertificatePickupInput, student_id: studentId, is_picked_up: false };

      await createCertificatePickup(input1);
      await createCertificatePickup(input2);

      const pickedUpResult = await getCertificatePickupsByStatus(true);
      expect(pickedUpResult).toHaveLength(1);
      expect(pickedUpResult[0].is_picked_up).toBe(true);

      const notPickedUpResult = await getCertificatePickupsByStatus(false);
      expect(notPickedUpResult).toHaveLength(1);
      expect(notPickedUpResult[0].is_picked_up).toBe(false);
    });

    it('should return empty array when no certificate pickups match status', async () => {
      const result = await getCertificatePickupsByStatus(true);
      expect(result).toEqual([]);
    });
  });
});