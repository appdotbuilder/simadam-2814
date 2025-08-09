import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, classesTable } from '../db/schema';
import { type CreateStudentInput } from '../schema';
import { createStudent } from '../handlers/students';
import { eq } from 'drizzle-orm';

// Test input for creating a student
const testInput: CreateStudentInput = {
  nis: 'STU001',
  nisn: '1234567890',
  full_name: 'Ahmad Rahman',
  gender: 'L',
  birth_place: 'Jakarta',
  birth_date: new Date('2007-05-15'),
  address: 'Jl. Merdeka No. 123, Jakarta',
  phone: '081234567890',
  parent_name: 'Budi Rahman',
  parent_phone: '081987654321',
  origin_school: 'smp_darul_muttaqien',
  entry_year: 2024,
  class_id: null,
  is_active: true
};

describe('createStudent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a student successfully', async () => {
    const result = await createStudent(testInput);

    // Verify returned student data
    expect(result.nis).toEqual('STU001');
    expect(result.nisn).toEqual('1234567890');
    expect(result.full_name).toEqual('Ahmad Rahman');
    expect(result.gender).toEqual('L');
    expect(result.birth_place).toEqual('Jakarta');
    expect(result.birth_date.toISOString()).toEqual(new Date('2007-05-15').toISOString());
    expect(result.address).toEqual('Jl. Merdeka No. 123, Jakarta');
    expect(result.phone).toEqual('081234567890');
    expect(result.parent_name).toEqual('Budi Rahman');
    expect(result.parent_phone).toEqual('081987654321');
    expect(result.origin_school).toEqual('smp_darul_muttaqien');
    expect(result.entry_year).toEqual(2024);
    expect(result.class_id).toBeNull();
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save student to database', async () => {
    const result = await createStudent(testInput);

    // Query database to verify student was saved
    const students = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, result.id))
      .execute();

    expect(students).toHaveLength(1);
    const savedStudent = students[0];
    expect(savedStudent.nis).toEqual('STU001');
    expect(savedStudent.full_name).toEqual('Ahmad Rahman');
    expect(savedStudent.gender).toEqual('L');
    expect(savedStudent.origin_school).toEqual('smp_darul_muttaqien');
    expect(savedStudent.entry_year).toEqual(2024);
    expect(savedStudent.is_active).toEqual(true);
  });

  it('should create student with valid class_id', async () => {
    // First create a class
    const classResult = await db.insert(classesTable)
      .values({
        name: 'VII-A',
        grade: 1,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    const classId = classResult[0].id;

    // Create student with class assignment
    const studentWithClass = {
      ...testInput,
      class_id: classId
    };

    const result = await createStudent(studentWithClass);

    expect(result.class_id).toEqual(classId);

    // Verify in database
    const students = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, result.id))
      .execute();

    expect(students[0].class_id).toEqual(classId);
  });

  it('should handle nullable fields correctly', async () => {
    const inputWithNulls: CreateStudentInput = {
      nis: 'STU002',
      nisn: null,
      full_name: 'Siti Aminah',
      gender: 'P',
      birth_place: 'Bandung',
      birth_date: new Date('2008-03-20'),
      address: 'Jl. Asia Afrika No. 45, Bandung',
      phone: null,
      parent_name: 'Ali Ahmad',
      parent_phone: null,
      origin_school: 'mts',
      entry_year: 2025,
      class_id: null,
      is_active: true
    };

    const result = await createStudent(inputWithNulls);

    expect(result.nisn).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.parent_phone).toBeNull();
    expect(result.class_id).toBeNull();
    expect(result.full_name).toEqual('Siti Aminah');
    expect(result.origin_school).toEqual('mts');
    expect(result.birth_date.toISOString()).toEqual(new Date('2008-03-20').toISOString());
  });

  it('should handle different origin schools', async () => {
    const origins = ['smp_darul_muttaqien', 'mts', 'luar_smp_darul_muttaqien'] as const;

    for (const origin of origins) {
      const input = {
        ...testInput,
        nis: `STU_${origin}`,
        origin_school: origin
      };

      const result = await createStudent(input);
      expect(result.origin_school).toEqual(origin);
    }
  });

  it('should handle different genders', async () => {
    // Test male student
    const maleInput = {
      ...testInput,
      nis: 'STU_MALE',
      gender: 'L' as const
    };
    const maleResult = await createStudent(maleInput);
    expect(maleResult.gender).toEqual('L');

    // Test female student
    const femaleInput = {
      ...testInput,
      nis: 'STU_FEMALE',
      gender: 'P' as const
    };
    const femaleResult = await createStudent(femaleInput);
    expect(femaleResult.gender).toEqual('P');
  });

  it('should throw error for non-existent class_id', async () => {
    const inputWithInvalidClass = {
      ...testInput,
      nis: 'STU_INVALID',
      class_id: 999 // Non-existent class ID
    };

    await expect(createStudent(inputWithInvalidClass)).rejects.toThrow(/Class with ID 999 does not exist/i);
  });

  it('should handle duplicate NIS error', async () => {
    // Create first student
    await createStudent(testInput);

    // Try to create another student with same NIS
    const duplicateInput = {
      ...testInput,
      full_name: 'Different Name'
    };

    // Should throw error due to unique constraint on NIS
    await expect(createStudent(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });

  it('should create students with different entry years', async () => {
    const years = [2022, 2023, 2024, 2025];

    for (const year of years) {
      const input = {
        ...testInput,
        nis: `STU_${year}`,
        entry_year: year
      };

      const result = await createStudent(input);
      expect(result.entry_year).toEqual(year);
    }
  });

  it('should set default is_active to true when not specified', async () => {
    // Input without is_active (should use Zod default)
    const inputWithoutActive = {
      nis: 'STU003',
      nisn: '9876543210',
      full_name: 'Test Student',
      gender: 'L' as const,
      birth_place: 'Surabaya',
      birth_date: new Date('2006-12-10'),
      address: 'Test Address',
      phone: '081111111111',
      parent_name: 'Test Parent',
      parent_phone: '081222222222',
      origin_school: 'luar_smp_darul_muttaqien' as const,
      entry_year: 2023,
      class_id: null
      // is_active not specified - should default to true
    } as CreateStudentInput;

    const result = await createStudent(inputWithoutActive);
    expect(result.is_active).toEqual(true);
  });
});