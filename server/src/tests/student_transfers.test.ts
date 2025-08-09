import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, classesTable, studentTransfersTable } from '../db/schema';
import { type CreateStudentTransferInput } from '../schema';
import { createStudentTransfer } from '../handlers/student_transfers';
import { eq } from 'drizzle-orm';

// Test input for student transfer
const testTransferInput: CreateStudentTransferInput = {
  student_id: 1,
  transfer_date: new Date('2024-03-15'),
  destination_school: 'SMAN 1 Jakarta',
  transfer_reason: 'Pindah domisili orang tua',
  letter_number: '001/MT/2024',
  notes: 'Transfer approved by headmaster'
};

describe('createStudentTransfer', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a student transfer record', async () => {
    // Create prerequisite class
    const classResult = await db.insert(classesTable)
      .values({
        name: '7A',
        grade: 1,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    // Create prerequisite student
    await db.insert(studentsTable)
      .values({
        nis: 'TEST001',
        nisn: '1234567890',
        full_name: 'Ahmad Test',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: '2010-01-15', // Date as string for date column
        address: 'Jl. Test No. 1',
        phone: '08123456789',
        parent_name: 'Budi Test',
        parent_phone: '08198765432',
        origin_school: 'smp_darul_muttaqien',
        entry_year: 2024,
        class_id: classResult[0].id,
        is_active: true
      })
      .execute();

    const result = await createStudentTransfer(testTransferInput);

    // Verify student transfer record
    expect(result.student_id).toEqual(1);
    expect(result.destination_school).toEqual('SMAN 1 Jakarta');
    expect(result.transfer_reason).toEqual('Pindah domisili orang tua');
    expect(result.letter_number).toEqual('001/MT/2024');
    expect(result.notes).toEqual('Transfer approved by headmaster');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.transfer_date).toBeInstanceOf(Date);
  });

  it('should save transfer record to database', async () => {
    // Create prerequisite class
    const classResult = await db.insert(classesTable)
      .values({
        name: '7A',
        grade: 1,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    // Create prerequisite student
    await db.insert(studentsTable)
      .values({
        nis: 'TEST001',
        nisn: '1234567890',
        full_name: 'Ahmad Test',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: '2010-01-15',
        address: 'Jl. Test No. 1',
        phone: '08123456789',
        parent_name: 'Budi Test',
        parent_phone: '08198765432',
        origin_school: 'smp_darul_muttaqien',
        entry_year: 2024,
        class_id: classResult[0].id,
        is_active: true
      })
      .execute();

    const result = await createStudentTransfer(testTransferInput);

    // Query database to verify record was saved
    const transfers = await db.select()
      .from(studentTransfersTable)
      .where(eq(studentTransfersTable.id, result.id))
      .execute();

    expect(transfers).toHaveLength(1);
    expect(transfers[0].student_id).toEqual(1);
    expect(transfers[0].destination_school).toEqual('SMAN 1 Jakarta');
    expect(transfers[0].letter_number).toEqual('001/MT/2024');
    expect(transfers[0].created_at).toBeInstanceOf(Date);
  });

  it('should update student status to inactive after transfer', async () => {
    // Create prerequisite class
    const classResult = await db.insert(classesTable)
      .values({
        name: '7A',
        grade: 1,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    // Create prerequisite student
    await db.insert(studentsTable)
      .values({
        nis: 'TEST001',
        nisn: '1234567890',
        full_name: 'Ahmad Test',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: '2010-01-15',
        address: 'Jl. Test No. 1',
        phone: '08123456789',
        parent_name: 'Budi Test',
        parent_phone: '08198765432',
        origin_school: 'smp_darul_muttaqien',
        entry_year: 2024,
        class_id: classResult[0].id,
        is_active: true
      })
      .execute();

    await createStudentTransfer(testTransferInput);

    // Verify student is now inactive
    const students = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, 1))
      .execute();

    expect(students).toHaveLength(1);
    expect(students[0].is_active).toBe(false);
    expect(students[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when student does not exist', async () => {
    const invalidInput: CreateStudentTransferInput = {
      ...testTransferInput,
      student_id: 999
    };

    await expect(createStudentTransfer(invalidInput))
      .rejects.toThrow(/student with id 999 not found/i);
  });

  it('should throw error when student is already inactive', async () => {
    // Create prerequisite class
    const classResult = await db.insert(classesTable)
      .values({
        name: '7A',
        grade: 1,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    // Create inactive student
    await db.insert(studentsTable)
      .values({
        nis: 'TEST001',
        nisn: '1234567890',
        full_name: 'Ahmad Test',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: '2010-01-15',
        address: 'Jl. Test No. 1',
        phone: '08123456789',
        parent_name: 'Budi Test',
        parent_phone: '08198765432',
        origin_school: 'smp_darul_muttaqien',
        entry_year: 2024,
        class_id: classResult[0].id,
        is_active: false // Already inactive
      })
      .execute();

    await expect(createStudentTransfer(testTransferInput))
      .rejects.toThrow(/student with id 1 is already inactive/i);
  });

  it('should allow duplicate letter numbers for different students', async () => {
    // Create prerequisite class
    const classResult = await db.insert(classesTable)
      .values({
        name: '7A',
        grade: 1,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    // Create two students
    await db.insert(studentsTable)
      .values({
        nis: 'TEST001',
        nisn: '1234567890',
        full_name: 'Ahmad Test',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: '2010-01-15',
        address: 'Jl. Test No. 1',
        phone: '08123456789',
        parent_name: 'Budi Test',
        parent_phone: '08198765432',
        origin_school: 'smp_darul_muttaqien',
        entry_year: 2024,
        class_id: classResult[0].id,
        is_active: true
      })
      .execute();

    await db.insert(studentsTable)
      .values({
        nis: 'TEST002',
        nisn: '1234567891',
        full_name: 'Siti Test',
        gender: 'P',
        birth_place: 'Jakarta',
        birth_date: '2010-02-15',
        address: 'Jl. Test No. 2',
        phone: '08123456788',
        parent_name: 'Andi Test',
        parent_phone: '08198765431',
        origin_school: 'mts',
        entry_year: 2024,
        class_id: classResult[0].id,
        is_active: true
      })
      .execute();

    // Create first transfer
    const firstResult = await createStudentTransfer(testTransferInput);

    // Create second transfer with same letter number (should succeed since no unique constraint)
    const duplicateInput: CreateStudentTransferInput = {
      ...testTransferInput,
      student_id: 2,
      destination_school: 'SMAN 2 Jakarta'
    };

    const secondResult = await createStudentTransfer(duplicateInput);

    // Both transfers should be created successfully
    expect(firstResult.id).toBeDefined();
    expect(secondResult.id).toBeDefined();
    expect(firstResult.letter_number).toEqual(secondResult.letter_number);
    expect(firstResult.student_id).toEqual(1);
    expect(secondResult.student_id).toEqual(2);

    // Verify both students are now inactive
    const students = await db.select()
      .from(studentsTable)
      .execute();

    const student1 = students.find(s => s.id === 1);
    const student2 = students.find(s => s.id === 2);

    expect(student1?.is_active).toBe(false);
    expect(student2?.is_active).toBe(false);
  });

  it('should handle different transfer reasons and destinations', async () => {
    // Create prerequisite class
    const classResult = await db.insert(classesTable)
      .values({
        name: '7A',
        grade: 1,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    // Create prerequisite student
    await db.insert(studentsTable)
      .values({
        nis: 'TEST001',
        nisn: '1234567890',
        full_name: 'Ahmad Test',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: '2010-01-15',
        address: 'Jl. Test No. 1',
        phone: '08123456789',
        parent_name: 'Budi Test',
        parent_phone: '08198765432',
        origin_school: 'smp_darul_muttaqien',
        entry_year: 2024,
        class_id: classResult[0].id,
        is_active: true
      })
      .execute();

    const customInput: CreateStudentTransferInput = {
      student_id: 1,
      transfer_date: new Date('2024-06-30'),
      destination_school: 'Pondok Pesantren Al-Hikmah',
      transfer_reason: 'Melanjutkan pendidikan agama',
      letter_number: '002/MT/2024',
      notes: null // Test nullable notes
    };

    const result = await createStudentTransfer(customInput);

    expect(result.destination_school).toEqual('Pondok Pesantren Al-Hikmah');
    expect(result.transfer_reason).toEqual('Melanjutkan pendidikan agama');
    expect(result.notes).toBeNull();
  });
});