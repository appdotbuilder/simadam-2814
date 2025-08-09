import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput, type User } from '../schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    // Hash the password before storing
    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = crypto.pbkdf2Sync(input.password, salt, 100000, 64, 'sha512').toString('hex') + ':' + salt;

    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        username: input.username,
        email: input.email,
        password_hash,
        full_name: input.full_name,
        role: input.role,
        is_active: input.is_active
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const result = await db.select()
      .from(usersTable)
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .execute();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to fetch user by ID:', error);
    throw error;
  }
}

export async function updateUser(input: UpdateUserInput): Promise<User> {
  try {
    // Build update data object, excluding undefined values
    const updateData: Partial<typeof usersTable.$inferInsert> = {};
    
    if (input.username !== undefined) updateData.username = input.username;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.full_name !== undefined) updateData.full_name = input.full_name;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    const result = await db.update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`User with ID ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('User update failed:', error);
    throw error;
  }
}

export async function deleteUser(id: number): Promise<{ success: boolean }> {
  try {
    const result = await db.delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`User with ID ${id} not found`);
    }

    return { success: true };
  } catch (error) {
    console.error('User deletion failed:', error);
    throw error;
  }
}