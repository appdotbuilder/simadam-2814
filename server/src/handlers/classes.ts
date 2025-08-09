import { db } from '../db';
import { classesTable, teachersTable, studentsTable } from '../db/schema';
import { type CreateClassInput, type UpdateClassInput, type Class } from '../schema';
import { eq, and, count } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export const createClass = async (input: CreateClassInput): Promise<Class> => {
  try {
    // Validate homeroom teacher exists if provided
    if (input.homeroom_teacher_id) {
      const teacher = await db.select()
        .from(teachersTable)
        .where(
          and(
            eq(teachersTable.id, input.homeroom_teacher_id),
            eq(teachersTable.is_active, true)
          )
        )
        .execute();

      if (teacher.length === 0) {
        throw new Error('Homeroom teacher not found or inactive');
      }
    }

    // Insert class record
    const result = await db.insert(classesTable)
      .values({
        name: input.name,
        grade: input.grade,
        academic_year: input.academic_year,
        homeroom_teacher_id: input.homeroom_teacher_id,
        is_active: input.is_active
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Class creation failed:', error);
    throw error;
  }
};

export const getClasses = async (): Promise<Class[]> => {
  try {
    const result = await db.select()
      .from(classesTable)
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    throw error;
  }
};

export const getClassById = async (id: number): Promise<Class | null> => {
  try {
    const result = await db.select()
      .from(classesTable)
      .where(eq(classesTable.id, id))
      .execute();

    return result[0] || null;
  } catch (error) {
    console.error('Failed to fetch class by ID:', error);
    throw error;
  }
};

export const updateClass = async (input: UpdateClassInput): Promise<Class> => {
  try {
    // Check if class exists
    const existingClass = await getClassById(input.id);
    if (!existingClass) {
      throw new Error('Class not found');
    }

    // Validate homeroom teacher exists if provided
    if (input.homeroom_teacher_id !== undefined && input.homeroom_teacher_id !== null) {
      const teacher = await db.select()
        .from(teachersTable)
        .where(
          and(
            eq(teachersTable.id, input.homeroom_teacher_id),
            eq(teachersTable.is_active, true)
          )
        )
        .execute();

      if (teacher.length === 0) {
        throw new Error('Homeroom teacher not found or inactive');
      }
    }

    // Prepare update data (only include defined fields)
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.grade !== undefined) updateData.grade = input.grade;
    if (input.academic_year !== undefined) updateData.academic_year = input.academic_year;
    if (input.homeroom_teacher_id !== undefined) updateData.homeroom_teacher_id = input.homeroom_teacher_id;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    // Update class record
    const result = await db.update(classesTable)
      .set(updateData)
      .where(eq(classesTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Class update failed:', error);
    throw error;
  }
};

export const deleteClass = async (id: number): Promise<{ success: boolean }> => {
  try {
    // Check if class exists
    const existingClass = await getClassById(id);
    if (!existingClass) {
      throw new Error('Class not found');
    }

    // Check if class has active students
    const studentCount = await db.select({ count: count() })
      .from(studentsTable)
      .where(
        and(
          eq(studentsTable.class_id, id),
          eq(studentsTable.is_active, true)
        )
      )
      .execute();

    if (studentCount[0].count > 0) {
      throw new Error('Cannot delete class with active students assigned');
    }

    // Delete class record
    await db.delete(classesTable)
      .where(eq(classesTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Class deletion failed:', error);
    throw error;
  }
};

export const getClassesByGrade = async (grade: number): Promise<Class[]> => {
  try {
    const result = await db.select()
      .from(classesTable)
      .where(eq(classesTable.grade, grade))
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch classes by grade:', error);
    throw error;
  }
};

export const getClassesByAcademicYear = async (academicYear: string): Promise<Class[]> => {
  try {
    const result = await db.select()
      .from(classesTable)
      .where(eq(classesTable.academic_year, academicYear))
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch classes by academic year:', error);
    throw error;
  }
};