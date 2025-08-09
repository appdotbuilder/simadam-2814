import { db } from '../db';
import { teachersTable, usersTable } from '../db/schema';
import { type CreateTeacherInput, type UpdateTeacherInput, type Teacher } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function createTeacher(input: CreateTeacherInput): Promise<Teacher> {
  try {
    // Validate user_id exists if provided
    if (input.user_id) {
      const user = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, input.user_id))
        .execute();
      
      if (user.length === 0) {
        throw new Error(`User with ID ${input.user_id} not found`);
      }
    }

    // Validate NIP uniqueness if provided
    if (input.nip) {
      const existingTeacher = await db.select()
        .from(teachersTable)
        .where(eq(teachersTable.nip, input.nip))
        .execute();
      
      if (existingTeacher.length > 0) {
        throw new Error(`Teacher with NIP ${input.nip} already exists`);
      }
    }

    // Insert teacher record
    const result = await db.insert(teachersTable)
      .values({
        nip: input.nip,
        full_name: input.full_name,
        gender: input.gender,
        birth_place: input.birth_place,
        birth_date: input.birth_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        address: input.address,
        phone: input.phone,
        email: input.email,
        subject: input.subject,
        user_id: input.user_id,
        is_active: input.is_active
      })
      .returning()
      .execute();

    // Convert date string back to Date object for return
    const teacher = result[0];
    return {
      ...teacher,
      birth_date: new Date(teacher.birth_date)
    };
  } catch (error) {
    console.error('Teacher creation failed:', error);
    throw error;
  }
}

export async function getTeachers(): Promise<Teacher[]> {
  try {
    const result = await db.select()
      .from(teachersTable)
      .execute();

    // Convert date strings back to Date objects
    return result.map(teacher => ({
      ...teacher,
      birth_date: new Date(teacher.birth_date)
    }));
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    throw error;
  }
}

export async function getTeacherById(id: number): Promise<Teacher | null> {
  try {
    const result = await db.select()
      .from(teachersTable)
      .where(eq(teachersTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert date string back to Date object
    const teacher = result[0];
    return {
      ...teacher,
      birth_date: new Date(teacher.birth_date)
    };
  } catch (error) {
    console.error('Failed to fetch teacher by ID:', error);
    throw error;
  }
}

export async function updateTeacher(input: UpdateTeacherInput): Promise<Teacher> {
  try {
    // Check if teacher exists
    const existingTeacher = await db.select()
      .from(teachersTable)
      .where(eq(teachersTable.id, input.id))
      .execute();
    
    if (existingTeacher.length === 0) {
      throw new Error(`Teacher with ID ${input.id} not found`);
    }

    // Validate user_id exists if provided
    if (input.user_id !== undefined && input.user_id !== null) {
      const user = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, input.user_id))
        .execute();
      
      if (user.length === 0) {
        throw new Error(`User with ID ${input.user_id} not found`);
      }
    }

    // Validate NIP uniqueness if provided and different from current
    if (input.nip !== undefined && input.nip !== null && input.nip !== existingTeacher[0].nip) {
      const duplicateNip = await db.select()
        .from(teachersTable)
        .where(eq(teachersTable.nip, input.nip))
        .execute();
      
      // Filter out current teacher from results
      const otherTeachersWithNip = duplicateNip.filter(teacher => teacher.id !== input.id);
      
      if (otherTeachersWithNip.length > 0) {
        throw new Error(`Teacher with NIP ${input.nip} already exists`);
      }
    }

    // Prepare update values, only including defined fields
    const updateValues: Partial<typeof teachersTable.$inferInsert> = {};
    
    if (input.nip !== undefined) updateValues.nip = input.nip;
    if (input.full_name !== undefined) updateValues.full_name = input.full_name;
    if (input.gender !== undefined) updateValues.gender = input.gender;
    if (input.birth_place !== undefined) updateValues.birth_place = input.birth_place;
    if (input.birth_date !== undefined) updateValues.birth_date = input.birth_date.toISOString().split('T')[0];
    if (input.address !== undefined) updateValues.address = input.address;
    if (input.phone !== undefined) updateValues.phone = input.phone;
    if (input.email !== undefined) updateValues.email = input.email;
    if (input.subject !== undefined) updateValues.subject = input.subject;
    if (input.user_id !== undefined) updateValues.user_id = input.user_id;
    if (input.is_active !== undefined) updateValues.is_active = input.is_active;

    // Update teacher record
    const result = await db.update(teachersTable)
      .set({
        ...updateValues,
        updated_at: new Date()
      })
      .where(eq(teachersTable.id, input.id))
      .returning()
      .execute();

    // Convert date string back to Date object
    const teacher = result[0];
    return {
      ...teacher,
      birth_date: new Date(teacher.birth_date)
    };
  } catch (error) {
    console.error('Teacher update failed:', error);
    throw error;
  }
}

export async function deleteTeacher(id: number): Promise<{ success: boolean }> {
  try {
    // Check if teacher exists
    const existingTeacher = await db.select()
      .from(teachersTable)
      .where(eq(teachersTable.id, id))
      .execute();
    
    if (existingTeacher.length === 0) {
      throw new Error(`Teacher with ID ${id} not found`);
    }

    // Delete teacher record
    await db.delete(teachersTable)
      .where(eq(teachersTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Teacher deletion failed:', error);
    throw error;
  }
}

export async function getTeacherByUserId(userId: number): Promise<Teacher | null> {
  try {
    const result = await db.select()
      .from(teachersTable)
      .where(eq(teachersTable.user_id, userId))
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert date string back to Date object
    const teacher = result[0];
    return {
      ...teacher,
      birth_date: new Date(teacher.birth_date)
    };
  } catch (error) {
    console.error('Failed to fetch teacher by user ID:', error);
    throw error;
  }
}