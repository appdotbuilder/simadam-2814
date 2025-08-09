import { db } from '../db';
import { studentsTable, classesTable } from '../db/schema';
import { type CreateStudentInput, type UpdateStudentInput, type Student } from '../schema';
import { eq } from 'drizzle-orm';

export async function createStudent(input: CreateStudentInput): Promise<Student> {
  try {
    // Validate class_id exists if provided
    if (input.class_id) {
      const classExists = await db.select()
        .from(classesTable)
        .where(eq(classesTable.id, input.class_id))
        .execute();
      
      if (classExists.length === 0) {
        throw new Error(`Class with ID ${input.class_id} does not exist`);
      }
    }

    // Insert student record
    const result = await db.insert(studentsTable)
      .values({
        nis: input.nis,
        nisn: input.nisn,
        full_name: input.full_name,
        gender: input.gender,
        birth_place: input.birth_place,
        birth_date: input.birth_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        address: input.address,
        phone: input.phone,
        parent_name: input.parent_name,
        parent_phone: input.parent_phone,
        origin_school: input.origin_school,
        entry_year: input.entry_year,
        class_id: input.class_id,
        is_active: input.is_active
      })
      .returning()
      .execute();

    // Convert birth_date back to Date object for return
    const student = result[0];
    return {
      ...student,
      birth_date: new Date(student.birth_date)
    };
  } catch (error) {
    console.error('Student creation failed:', error);
    throw error;
  }
}

export async function getStudents(): Promise<Student[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch all students from the database.
    // Should include related class and teacher information for comprehensive view.
    return Promise.resolve([]);
}

export async function getStudentById(id: number): Promise<Student | null> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch a specific student by ID.
    // Should include related class and payment information.
    return Promise.resolve(null);
}

export async function updateStudent(input: UpdateStudentInput): Promise<Student> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to update existing student data.
    // Should validate class assignment and handle origin school changes.
    return Promise.resolve({
        id: input.id,
        nis: '12345',
        nisn: '1234567890',
        full_name: 'Updated Student',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: new Date('2005-01-01'),
        address: 'Updated Address',
        phone: '081234567890',
        parent_name: 'Parent Name',
        parent_phone: '081234567891',
        origin_school: 'smp_darul_muttaqien',
        entry_year: 2024,
        class_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    });
}

export async function deleteStudent(id: number): Promise<{ success: boolean }> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to delete a student from the database.
    // Should handle related records (payments, certificates, etc.) appropriately.
    return Promise.resolve({ success: true });
}

export async function getStudentsByClass(classId: number): Promise<Student[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch all students in a specific class.
    return Promise.resolve([]);
}

export async function getStudentsByOrigin(origin: string): Promise<Student[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch students by their origin school.
    return Promise.resolve([]);
}