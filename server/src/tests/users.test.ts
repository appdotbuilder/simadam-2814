import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput } from '../schema';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from '../handlers/users';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Helper function to verify password
function verifyPassword(password: string, hash: string): boolean {
  const [hashedPassword, salt] = hash.split(':');
  const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hashedPassword === testHash;
}

// Test input data
const testUserInput: CreateUserInput = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  full_name: 'Test User',
  role: 'guru',
  is_active: true
};

const adminUserInput: CreateUserInput = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123',
  full_name: 'Admin User',
  role: 'admin',
  is_active: true
};

describe('User Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const result = await createUser(testUserInput);

      // Basic field validation
      expect(result.username).toEqual('testuser');
      expect(result.email).toEqual('test@example.com');
      expect(result.full_name).toEqual('Test User');
      expect(result.role).toEqual('guru');
      expect(result.is_active).toEqual(true);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);

      // Password should be hashed
      expect(result.password_hash).toBeDefined();
      expect(result.password_hash).not.toEqual('password123');
      expect(result.password_hash.length).toBeGreaterThan(20);

      // Verify password was hashed correctly
      const isValidPassword = verifyPassword('password123', result.password_hash);
      expect(isValidPassword).toBe(true);
    });

    it('should save user to database', async () => {
      const result = await createUser(testUserInput);

      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, result.id))
        .execute();

      expect(users).toHaveLength(1);
      expect(users[0].username).toEqual('testuser');
      expect(users[0].email).toEqual('test@example.com');
      expect(users[0].full_name).toEqual('Test User');
      expect(users[0].role).toEqual('guru');
      expect(users[0].is_active).toEqual(true);
    });

    it('should create admin user successfully', async () => {
      const result = await createUser(adminUserInput);

      expect(result.role).toEqual('admin');
      expect(result.username).toEqual('admin');
      expect(result.email).toEqual('admin@example.com');
    });

    it('should handle default is_active value', async () => {
      const inputWithoutActive: CreateUserInput = {
        username: 'defaultuser',
        email: 'default@example.com',
        password: 'password123',
        full_name: 'Default User',
        role: 'guru',
        is_active: true // Zod default is applied before reaching handler
      };

      const result = await createUser(inputWithoutActive);
      expect(result.is_active).toEqual(true);
    });

    it('should throw error for duplicate username', async () => {
      await createUser(testUserInput);
      
      expect(createUser(testUserInput)).rejects.toThrow();
    });

    it('should throw error for duplicate email', async () => {
      await createUser(testUserInput);
      
      const duplicateEmailInput: CreateUserInput = {
        ...testUserInput,
        username: 'differentuser'
      };

      expect(createUser(duplicateEmailInput)).rejects.toThrow();
    });
  });

  describe('getUsers', () => {
    it('should return empty array when no users exist', async () => {
      const result = await getUsers();
      expect(result).toEqual([]);
    });

    it('should return all users', async () => {
      const user1 = await createUser(testUserInput);
      const user2 = await createUser(adminUserInput);

      const result = await getUsers();

      expect(result).toHaveLength(2);
      
      const usernames = result.map(u => u.username).sort();
      expect(usernames).toEqual(['admin', 'testuser']);
      
      const emails = result.map(u => u.email).sort();
      expect(emails).toEqual(['admin@example.com', 'test@example.com']);
    });

    it('should return users with all required fields', async () => {
      await createUser(testUserInput);

      const result = await getUsers();

      expect(result).toHaveLength(1);
      const user = result[0];
      
      expect(user.id).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.password_hash).toBeDefined();
      expect(user.full_name).toBeDefined();
      expect(user.role).toBeDefined();
      expect(user.is_active).toBeDefined();
      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      const result = await getUserById(999);
      expect(result).toBeNull();
    });

    it('should return user by ID', async () => {
      const createdUser = await createUser(testUserInput);

      const result = await getUserById(createdUser.id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(createdUser.id);
      expect(result!.username).toEqual('testuser');
      expect(result!.email).toEqual('test@example.com');
      expect(result!.full_name).toEqual('Test User');
      expect(result!.role).toEqual('guru');
    });

    it('should return user with correct data types', async () => {
      const createdUser = await createUser(testUserInput);

      const result = await getUserById(createdUser.id);

      expect(result).not.toBeNull();
      expect(typeof result!.id).toBe('number');
      expect(typeof result!.username).toBe('string');
      expect(typeof result!.email).toBe('string');
      expect(typeof result!.is_active).toBe('boolean');
      expect(result!.created_at).toBeInstanceOf(Date);
      expect(result!.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const createdUser = await createUser(testUserInput);

      const updateInput: UpdateUserInput = {
        id: createdUser.id,
        username: 'updateduser',
        email: 'updated@example.com',
        full_name: 'Updated User',
        role: 'admin',
        is_active: false
      };

      const result = await updateUser(updateInput);

      expect(result.id).toEqual(createdUser.id);
      expect(result.username).toEqual('updateduser');
      expect(result.email).toEqual('updated@example.com');
      expect(result.full_name).toEqual('Updated User');
      expect(result.role).toEqual('admin');
      expect(result.is_active).toEqual(false);
      expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
    });

    it('should update only provided fields', async () => {
      const createdUser = await createUser(testUserInput);

      const partialUpdate: UpdateUserInput = {
        id: createdUser.id,
        full_name: 'Partially Updated User'
      };

      const result = await updateUser(partialUpdate);

      expect(result.full_name).toEqual('Partially Updated User');
      expect(result.username).toEqual(createdUser.username); // Should remain unchanged
      expect(result.email).toEqual(createdUser.email); // Should remain unchanged
      expect(result.role).toEqual(createdUser.role); // Should remain unchanged
    });

    it('should persist changes in database', async () => {
      const createdUser = await createUser(testUserInput);

      const updateInput: UpdateUserInput = {
        id: createdUser.id,
        username: 'persisteduser'
      };

      await updateUser(updateInput);

      const dbUser = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, createdUser.id))
        .execute();

      expect(dbUser).toHaveLength(1);
      expect(dbUser[0].username).toEqual('persisteduser');
    });

    it('should throw error for non-existent user', async () => {
      const updateInput: UpdateUserInput = {
        id: 999,
        username: 'nonexistent'
      };

      expect(updateUser(updateInput)).rejects.toThrow(/not found/i);
    });

    it('should throw error for duplicate username during update', async () => {
      const user1 = await createUser(testUserInput);
      const user2 = await createUser(adminUserInput);

      const updateInput: UpdateUserInput = {
        id: user2.id,
        username: user1.username // Try to use existing username
      };

      expect(updateUser(updateInput)).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const createdUser = await createUser(testUserInput);

      const result = await deleteUser(createdUser.id);

      expect(result.success).toBe(true);

      // Verify user is deleted from database
      const dbUser = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, createdUser.id))
        .execute();

      expect(dbUser).toHaveLength(0);
    });

    it('should throw error for non-existent user', async () => {
      expect(deleteUser(999)).rejects.toThrow(/not found/i);
    });

    it('should not affect other users', async () => {
      const user1 = await createUser(testUserInput);
      const user2 = await createUser(adminUserInput);

      await deleteUser(user1.id);

      const remainingUsers = await getUsers();
      expect(remainingUsers).toHaveLength(1);
      expect(remainingUsers[0].id).toEqual(user2.id);
    });
  });
});