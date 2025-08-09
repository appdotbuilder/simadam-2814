import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput, type ResetPasswordInput, type CreateUserInput } from '../schema';
import { login, logout, resetPassword } from '../handlers/auth';
import { eq } from 'drizzle-orm';

// Test user data
const testUser: CreateUserInput = {
  username: 'testuser',
  email: 'test@madarul.sch.id',
  password: 'password123',
  full_name: 'Test User',
  role: 'admin',
  is_active: true
};

const inactiveUser: CreateUserInput = {
  username: 'inactiveuser',
  email: 'inactive@madarul.sch.id',
  password: 'password123',
  full_name: 'Inactive User',
  role: 'guru',
  is_active: false
};

describe('auth handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('login', () => {
    beforeEach(async () => {
      // Create test users
      await db.insert(usersTable)
        .values([
          {
            username: testUser.username,
            email: testUser.email,
            password_hash: `hashed_${testUser.password}`,
            full_name: testUser.full_name,
            role: testUser.role,
            is_active: testUser.is_active
          },
          {
            username: inactiveUser.username,
            email: inactiveUser.email,
            password_hash: `hashed_${inactiveUser.password}`,
            full_name: inactiveUser.full_name,
            role: inactiveUser.role,
            is_active: inactiveUser.is_active
          }
        ])
        .execute();
    });

    it('should login successfully with valid credentials', async () => {
      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const result = await login(loginInput);

      expect(result.user.username).toEqual(testUser.username);
      expect(result.user.email).toEqual(testUser.email);
      expect(result.user.full_name).toEqual(testUser.full_name);
      expect(result.user.role).toEqual(testUser.role);
      expect(result.user.is_active).toBe(true);
      expect(result.user.password_hash).toEqual(''); // Password hash should not be returned
      expect(result.user.id).toBeDefined();
      expect(result.user.created_at).toBeInstanceOf(Date);
      expect(result.user.updated_at).toBeInstanceOf(Date);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });

    it('should fail with invalid username', async () => {
      const loginInput: LoginInput = {
        username: 'nonexistent',
        password: 'password123'
      };

      await expect(login(loginInput)).rejects.toThrow(/invalid username or password/i);
    });

    it('should fail with inactive user', async () => {
      const loginInput: LoginInput = {
        username: inactiveUser.username,
        password: inactiveUser.password
      };

      await expect(login(loginInput)).rejects.toThrow(/user account is inactive/i);
    });

    it('should generate unique tokens for different logins', async () => {
      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const result1 = await login(loginInput);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const result2 = await login(loginInput);

      expect(result1.token).not.toEqual(result2.token);
    });

    it('should return user with correct role', async () => {
      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const result = await login(loginInput);

      expect(result.user.role).toEqual('admin');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const result = await logout();

      expect(result.success).toBe(true);
    });

    it('should always return success', async () => {
      // Test multiple logout calls
      const result1 = await logout();
      const result2 = await logout();
      const result3 = await logout();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });
  });

  describe('resetPassword', () => {
    beforeEach(async () => {
      // Create test users
      await db.insert(usersTable)
        .values([
          {
            username: testUser.username,
            email: testUser.email,
            password_hash: `hashed_${testUser.password}`,
            full_name: testUser.full_name,
            role: testUser.role,
            is_active: testUser.is_active
          },
          {
            username: inactiveUser.username,
            email: inactiveUser.email,
            password_hash: `hashed_${inactiveUser.password}`,
            full_name: inactiveUser.full_name,
            role: inactiveUser.role,
            is_active: inactiveUser.is_active
          }
        ])
        .execute();
    });

    it('should reset password successfully for valid email', async () => {
      const resetInput: ResetPasswordInput = {
        email: testUser.email,
        new_password: 'newpassword123'
      };

      const result = await resetPassword(resetInput);

      expect(result.success).toBe(true);

      // Verify password was updated in database
      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, testUser.email))
        .execute();

      expect(users).toHaveLength(1);
      expect(users[0].password_hash).toEqual('hashed_newpassword123');
      expect(users[0].updated_at).toBeInstanceOf(Date);
    });

    it('should fail with invalid email', async () => {
      const resetInput: ResetPasswordInput = {
        email: 'nonexistent@madarul.sch.id',
        new_password: 'newpassword123'
      };

      await expect(resetPassword(resetInput)).rejects.toThrow(/user with this email does not exist/i);
    });

    it('should fail with inactive user', async () => {
      const resetInput: ResetPasswordInput = {
        email: inactiveUser.email,
        new_password: 'newpassword123'
      };

      await expect(resetPassword(resetInput)).rejects.toThrow(/user account is inactive/i);
    });

    it('should update the updated_at timestamp', async () => {
      // Get original user
      const originalUsers = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, testUser.email))
        .execute();
      
      const originalUpdatedAt = originalUsers[0].updated_at;

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));

      const resetInput: ResetPasswordInput = {
        email: testUser.email,
        new_password: 'newpassword123'
      };

      await resetPassword(resetInput);

      // Check updated timestamp
      const updatedUsers = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, testUser.email))
        .execute();

      expect(updatedUsers[0].updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should accept valid email formats', async () => {
      const resetInput: ResetPasswordInput = {
        email: testUser.email,
        new_password: 'validpassword123'
      };

      const result = await resetPassword(resetInput);

      expect(result.success).toBe(true);
    });

    it('should handle password with minimum length', async () => {
      const resetInput: ResetPasswordInput = {
        email: testUser.email,
        new_password: '123456' // minimum 6 characters as per schema
      };

      const result = await resetPassword(resetInput);

      expect(result.success).toBe(true);

      // Verify password was updated
      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, testUser.email))
        .execute();

      expect(users[0].password_hash).toEqual('hashed_123456');
    });
  });
});