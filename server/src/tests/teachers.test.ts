import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, teachersTable } from '../db/schema';
import { type CreateTeacherInput, type UpdateTeacherInput } from '../schema';
import { 
  createTeacher, 
  getTeachers, 
  getTeacherById, 
  updateTeacher, 
  deleteTeacher, 
  getTeacherByUserId 
} from '../handlers/teachers';
import { eq } from 'drizzle-orm';

// Test data
const testUser = {
  username: 'testguru',
  email: 'guru@test.com',
  password_hash: 'hashedpassword123',
  full_name: 'Test Guru',
  role: 'guru' as const,
  is_active: true
};

const testTeacherInput: CreateTeacherInput = {
  nip: '123456789',
  full_name: 'John Doe',
  gender: 'L',
  birth_place: 'Jakarta',
  birth_date: new Date('1980-01-01'),
  address: 'Jl. Test No. 123',
  phone: '081234567890',
  email: 'john@test.com',
  subject: 'Mathematics',
  user_id: null,
  is_active: true
};

describe('Teachers Handler', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createTeacher', () => {
    it('should create a teacher successfully', async () => {
      const result = await createTeacher(testTeacherInput);

      expect(result.nip).toEqual('123456789');
      expect(result.full_name).toEqual('John Doe');
      expect(result.gender).toEqual('L');
      expect(result.birth_place).toEqual('Jakarta');
      expect(result.birth_date).toEqual(new Date('1980-01-01'));
      expect(result.address).toEqual('Jl. Test No. 123');
      expect(result.phone).toEqual('081234567890');
      expect(result.email).toEqual('john@test.com');
      expect(result.subject).toEqual('Mathematics');
      expect(result.user_id).toBeNull();
      expect(result.is_active).toEqual(true);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should create teacher with linked user account', async () => {
      // Create a user first
      const userResult = await db.insert(usersTable)
        .values(testUser)
        .returning()
        .execute();

      const teacherInput = {
        ...testTeacherInput,
        user_id: userResult[0].id
      };

      const result = await createTeacher(teacherInput);

      expect(result.user_id).toEqual(userResult[0].id);
    });

    it('should create teacher without NIP', async () => {
      const teacherInput = {
        ...testTeacherInput,
        nip: null
      };

      const result = await createTeacher(teacherInput);

      expect(result.nip).toBeNull();
      expect(result.full_name).toEqual('John Doe');
    });

    it('should save teacher to database', async () => {
      const result = await createTeacher(testTeacherInput);

      const teachers = await db.select()
        .from(teachersTable)
        .where(eq(teachersTable.id, result.id))
        .execute();

      expect(teachers).toHaveLength(1);
      expect(teachers[0].full_name).toEqual('John Doe');
      expect(teachers[0].nip).toEqual('123456789');
    });

    it('should throw error for duplicate NIP', async () => {
      await createTeacher(testTeacherInput);

      const duplicateInput = {
        ...testTeacherInput,
        full_name: 'Jane Doe'
      };

      await expect(createTeacher(duplicateInput)).rejects.toThrow(/already exists/i);
    });

    it('should throw error for non-existent user_id', async () => {
      const teacherInput = {
        ...testTeacherInput,
        user_id: 999
      };

      await expect(createTeacher(teacherInput)).rejects.toThrow(/user.*not found/i);
    });
  });

  describe('getTeachers', () => {
    it('should return empty array when no teachers exist', async () => {
      const result = await getTeachers();
      expect(result).toEqual([]);
    });

    it('should return all teachers', async () => {
      await createTeacher(testTeacherInput);
      await createTeacher({
        ...testTeacherInput,
        nip: '987654321',
        full_name: 'Jane Smith'
      });

      const result = await getTeachers();

      expect(result).toHaveLength(2);
      expect(result[0].full_name).toEqual('John Doe');
      expect(result[1].full_name).toEqual('Jane Smith');
    });
  });

  describe('getTeacherById', () => {
    it('should return null for non-existent teacher', async () => {
      const result = await getTeacherById(999);
      expect(result).toBeNull();
    });

    it('should return teacher by ID', async () => {
      const created = await createTeacher(testTeacherInput);
      const result = await getTeacherById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(created.id);
      expect(result!.full_name).toEqual('John Doe');
    });
  });

  describe('updateTeacher', () => {
    it('should update teacher successfully', async () => {
      const created = await createTeacher(testTeacherInput);

      const updateInput: UpdateTeacherInput = {
        id: created.id,
        full_name: 'Updated Name',
        subject: 'Physics',
        is_active: false
      };

      const result = await updateTeacher(updateInput);

      expect(result.id).toEqual(created.id);
      expect(result.full_name).toEqual('Updated Name');
      expect(result.subject).toEqual('Physics');
      expect(result.is_active).toEqual(false);
      expect(result.nip).toEqual('123456789'); // Unchanged fields remain
    });

    it('should update teacher with user link', async () => {
      const created = await createTeacher(testTeacherInput);
      
      const userResult = await db.insert(usersTable)
        .values(testUser)
        .returning()
        .execute();

      const updateInput: UpdateTeacherInput = {
        id: created.id,
        user_id: userResult[0].id
      };

      const result = await updateTeacher(updateInput);

      expect(result.user_id).toEqual(userResult[0].id);
    });

    it('should allow updating NIP to unique value', async () => {
      const created = await createTeacher(testTeacherInput);

      const updateInput: UpdateTeacherInput = {
        id: created.id,
        nip: '999888777'
      };

      const result = await updateTeacher(updateInput);

      expect(result.nip).toEqual('999888777');
    });

    it('should throw error for non-existent teacher', async () => {
      const updateInput: UpdateTeacherInput = {
        id: 999,
        full_name: 'Test'
      };

      await expect(updateTeacher(updateInput)).rejects.toThrow(/teacher.*not found/i);
    });

    it('should throw error for non-existent user_id', async () => {
      const created = await createTeacher(testTeacherInput);

      const updateInput: UpdateTeacherInput = {
        id: created.id,
        user_id: 999
      };

      await expect(updateTeacher(updateInput)).rejects.toThrow(/user.*not found/i);
    });
  });

  describe('deleteTeacher', () => {
    it('should delete teacher successfully', async () => {
      const created = await createTeacher(testTeacherInput);

      const result = await deleteTeacher(created.id);

      expect(result.success).toBe(true);

      // Verify teacher is deleted
      const deleted = await getTeacherById(created.id);
      expect(deleted).toBeNull();
    });

    it('should throw error for non-existent teacher', async () => {
      await expect(deleteTeacher(999)).rejects.toThrow(/teacher.*not found/i);
    });
  });

  describe('getTeacherByUserId', () => {
    it('should return null for non-existent user_id', async () => {
      const result = await getTeacherByUserId(999);
      expect(result).toBeNull();
    });

    it('should return teacher by user_id', async () => {
      const userResult = await db.insert(usersTable)
        .values(testUser)
        .returning()
        .execute();

      const teacherInput = {
        ...testTeacherInput,
        user_id: userResult[0].id
      };

      const created = await createTeacher(teacherInput);
      const result = await getTeacherByUserId(userResult[0].id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(created.id);
      expect(result!.user_id).toEqual(userResult[0].id);
    });

    it('should return null for teacher without user link', async () => {
      const userResult = await db.insert(usersTable)
        .values(testUser)
        .returning()
        .execute();

      await createTeacher(testTeacherInput); // No user_id

      const result = await getTeacherByUserId(userResult[0].id);
      expect(result).toBeNull();
    });
  });

  describe('data integrity', () => {
    it('should handle date fields correctly', async () => {
      const birthDate = new Date('1985-06-15');
      const teacherInput = {
        ...testTeacherInput,
        birth_date: birthDate
      };

      const result = await createTeacher(teacherInput);

      expect(result.birth_date).toEqual(birthDate);
      expect(result.birth_date).toBeInstanceOf(Date);
    });

    it('should handle nullable fields correctly', async () => {
      const teacherInput = {
        ...testTeacherInput,
        nip: null,
        phone: null,
        email: null,
        subject: null,
        user_id: null
      };

      const result = await createTeacher(teacherInput);

      expect(result.nip).toBeNull();
      expect(result.phone).toBeNull();
      expect(result.email).toBeNull();
      expect(result.subject).toBeNull();
      expect(result.user_id).toBeNull();
    });

    it('should preserve timestamps on update', async () => {
      const created = await createTeacher(testTeacherInput);
      const originalCreatedAt = created.created_at;

      // Small delay to ensure updated_at changes
      await new Promise(resolve => setTimeout(resolve, 100));

      const updateInput: UpdateTeacherInput = {
        id: created.id,
        full_name: 'Updated Name'
      };

      const updated = await updateTeacher(updateInput);

      expect(updated.created_at).toEqual(originalCreatedAt);
      expect(updated.updated_at.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
    });
  });
});