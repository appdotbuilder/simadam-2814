import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { classesTable, teachersTable, studentsTable } from '../db/schema';
import { type CreateClassInput, type UpdateClassInput } from '../schema';
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  getClassesByGrade,
  getClassesByAcademicYear
} from '../handlers/classes';
import { eq } from 'drizzle-orm';

// Test input data
const testClassInput: CreateClassInput = {
  name: '7A',
  grade: 1,
  academic_year: '2024/2025',
  homeroom_teacher_id: null,
  is_active: true
};

const testTeacher = {
  nip: 'T001',
  full_name: 'Ahmad Guru',
  gender: 'L' as const,
  birth_place: 'Jakarta',
  birth_date: '1980-01-01',
  address: 'Jl. Guru No. 1',
  phone: '08123456789',
  email: 'ahmad@school.edu',
  subject: 'Matematika',
  user_id: null,
  is_active: true
};

const testStudent = {
  nis: 'S001',
  nisn: '1234567890',
  full_name: 'Budi Siswa',
  gender: 'L' as const,
  birth_place: 'Jakarta',
  birth_date: '2010-01-01',
  address: 'Jl. Siswa No. 1',
  phone: '08123456780',
  parent_name: 'Orang Tua Budi',
  parent_phone: '08123456781',
  origin_school: 'smp_darul_muttaqien' as const,
  entry_year: 2024,
  class_id: null,
  is_active: true
};

describe('Class Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createClass', () => {
    it('should create a class without homeroom teacher', async () => {
      const result = await createClass(testClassInput);

      expect(result.name).toEqual('7A');
      expect(result.grade).toEqual(1);
      expect(result.academic_year).toEqual('2024/2025');
      expect(result.homeroom_teacher_id).toBeNull();
      expect(result.is_active).toEqual(true);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should create a class with homeroom teacher', async () => {
      // Create teacher first
      const teacherResult = await db.insert(teachersTable)
        .values(testTeacher)
        .returning()
        .execute();

      const classInput: CreateClassInput = {
        ...testClassInput,
        homeroom_teacher_id: teacherResult[0].id
      };

      const result = await createClass(classInput);

      expect(result.homeroom_teacher_id).toEqual(teacherResult[0].id);
      expect(result.name).toEqual('7A');
      expect(result.grade).toEqual(1);
    });

    it('should save class to database', async () => {
      const result = await createClass(testClassInput);

      const classes = await db.select()
        .from(classesTable)
        .where(eq(classesTable.id, result.id))
        .execute();

      expect(classes).toHaveLength(1);
      expect(classes[0].name).toEqual('7A');
      expect(classes[0].grade).toEqual(1);
      expect(classes[0].academic_year).toEqual('2024/2025');
    });

    it('should throw error for invalid homeroom teacher', async () => {
      const classInput: CreateClassInput = {
        ...testClassInput,
        homeroom_teacher_id: 999
      };

      await expect(createClass(classInput)).rejects.toThrow(/teacher not found/i);
    });

    it('should throw error for inactive homeroom teacher', async () => {
      // Create inactive teacher
      const inactiveTeacher = { ...testTeacher, is_active: false };
      const teacherResult = await db.insert(teachersTable)
        .values(inactiveTeacher)
        .returning()
        .execute();

      const classInput: CreateClassInput = {
        ...testClassInput,
        homeroom_teacher_id: teacherResult[0].id
      };

      await expect(createClass(classInput)).rejects.toThrow(/teacher not found/i);
    });
  });

  describe('getClasses', () => {
    it('should return empty array when no classes exist', async () => {
      const result = await getClasses();
      expect(result).toEqual([]);
    });

    it('should return all classes', async () => {
      // Create multiple classes
      await createClass(testClassInput);
      await createClass({
        ...testClassInput,
        name: '7B',
        grade: 2
      });

      const result = await getClasses();

      expect(result).toHaveLength(2);
      expect(result[0].name).toEqual('7A');
      expect(result[1].name).toEqual('7B');
    });
  });

  describe('getClassById', () => {
    it('should return null for non-existent class', async () => {
      const result = await getClassById(999);
      expect(result).toBeNull();
    });

    it('should return class by ID', async () => {
      const created = await createClass(testClassInput);
      const result = await getClassById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(created.id);
      expect(result!.name).toEqual('7A');
      expect(result!.grade).toEqual(1);
    });
  });

  describe('updateClass', () => {
    it('should update class name', async () => {
      const created = await createClass(testClassInput);

      const updateInput: UpdateClassInput = {
        id: created.id,
        name: '7A Updated'
      };

      const result = await updateClass(updateInput);

      expect(result.id).toEqual(created.id);
      expect(result.name).toEqual('7A Updated');
      expect(result.grade).toEqual(1); // Should remain unchanged
      expect(result.updated_at > created.updated_at).toBe(true);
    });

    it('should update class grade and academic year', async () => {
      const created = await createClass(testClassInput);

      const updateInput: UpdateClassInput = {
        id: created.id,
        grade: 2,
        academic_year: '2025/2026'
      };

      const result = await updateClass(updateInput);

      expect(result.id).toEqual(created.id);
      expect(result.grade).toEqual(2);
      expect(result.academic_year).toEqual('2025/2026');
      expect(result.name).toEqual('7A'); // Should remain unchanged
    });

    it('should update homeroom teacher', async () => {
      const created = await createClass(testClassInput);

      // Create teacher
      const teacherResult = await db.insert(teachersTable)
        .values(testTeacher)
        .returning()
        .execute();

      const updateInput: UpdateClassInput = {
        id: created.id,
        homeroom_teacher_id: teacherResult[0].id
      };

      const result = await updateClass(updateInput);

      expect(result.homeroom_teacher_id).toEqual(teacherResult[0].id);
    });

    it('should throw error for non-existent class', async () => {
      const updateInput: UpdateClassInput = {
        id: 999,
        name: 'Non-existent'
      };

      await expect(updateClass(updateInput)).rejects.toThrow(/class not found/i);
    });

    it('should throw error for invalid homeroom teacher', async () => {
      const created = await createClass(testClassInput);

      const updateInput: UpdateClassInput = {
        id: created.id,
        homeroom_teacher_id: 999
      };

      await expect(updateClass(updateInput)).rejects.toThrow(/teacher not found/i);
    });

    it('should set homeroom teacher to null', async () => {
      // Create teacher first
      const teacherResult = await db.insert(teachersTable)
        .values(testTeacher)
        .returning()
        .execute();

      const created = await createClass({
        ...testClassInput,
        homeroom_teacher_id: teacherResult[0].id
      });

      const updateInput: UpdateClassInput = {
        id: created.id,
        homeroom_teacher_id: null
      };

      const result = await updateClass(updateInput);

      expect(result.homeroom_teacher_id).toBeNull();
    });
  });

  describe('deleteClass', () => {
    it('should delete class successfully', async () => {
      const created = await createClass(testClassInput);

      const result = await deleteClass(created.id);
      expect(result.success).toBe(true);

      // Verify class is deleted
      const deletedClass = await getClassById(created.id);
      expect(deletedClass).toBeNull();
    });

    it('should throw error for non-existent class', async () => {
      await expect(deleteClass(999)).rejects.toThrow(/class not found/i);
    });

    it('should throw error when class has active students', async () => {
      const created = await createClass(testClassInput);

      // Create student assigned to this class
      const activeStudent = { ...testStudent, class_id: created.id };
      await db.insert(studentsTable)
        .values(activeStudent)
        .execute();

      await expect(deleteClass(created.id)).rejects.toThrow(/cannot delete class with active students/i);
    });

    it('should allow deletion when class has only inactive students', async () => {
      const created = await createClass(testClassInput);

      // Create inactive student assigned to this class
      const inactiveStudent = { ...testStudent, class_id: created.id, is_active: false };
      await db.insert(studentsTable)
        .values(inactiveStudent)
        .execute();

      const result = await deleteClass(created.id);
      expect(result.success).toBe(true);
    });
  });

  describe('getClassesByGrade', () => {
    it('should return empty array for non-existent grade', async () => {
      const result = await getClassesByGrade(1);
      expect(result).toEqual([]);
    });

    it('should return classes by grade', async () => {
      await createClass(testClassInput); // Grade 1
      await createClass({
        ...testClassInput,
        name: '7B',
        grade: 1
      }); // Grade 1
      await createClass({
        ...testClassInput,
        name: '8A',
        grade: 2
      }); // Grade 2

      const grade1Classes = await getClassesByGrade(1);
      const grade2Classes = await getClassesByGrade(2);

      expect(grade1Classes).toHaveLength(2);
      expect(grade2Classes).toHaveLength(1);
      expect(grade1Classes.every(c => c.grade === 1)).toBe(true);
      expect(grade2Classes[0].grade).toEqual(2);
    });
  });

  describe('getClassesByAcademicYear', () => {
    it('should return empty array for non-existent academic year', async () => {
      const result = await getClassesByAcademicYear('2030/2031');
      expect(result).toEqual([]);
    });

    it('should return classes by academic year', async () => {
      await createClass(testClassInput); // 2024/2025
      await createClass({
        ...testClassInput,
        name: '7B',
        academic_year: '2024/2025'
      }); // 2024/2025
      await createClass({
        ...testClassInput,
        name: '7C',
        academic_year: '2025/2026'
      }); // 2025/2026

      const currentYear = await getClassesByAcademicYear('2024/2025');
      const nextYear = await getClassesByAcademicYear('2025/2026');

      expect(currentYear).toHaveLength(2);
      expect(nextYear).toHaveLength(1);
      expect(currentYear.every(c => c.academic_year === '2024/2025')).toBe(true);
      expect(nextYear[0].academic_year).toEqual('2025/2026');
    });
  });
});