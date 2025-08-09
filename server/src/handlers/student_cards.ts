import { db } from '../db';
import { studentCardsTable, studentsTable } from '../db/schema';
import { type CreateStudentCardInput, type UpdateStudentCardInput, type StudentCard } from '../schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function createStudentCard(input: CreateStudentCardInput): Promise<StudentCard> {
  try {
    // Verify student exists
    const student = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, input.student_id))
      .execute();

    if (student.length === 0) {
      throw new Error(`Student with ID ${input.student_id} not found`);
    }

    // Check if card number already exists
    const existingCard = await db.select()
      .from(studentCardsTable)
      .where(eq(studentCardsTable.card_number, input.card_number))
      .execute();

    if (existingCard.length > 0) {
      throw new Error(`Card number ${input.card_number} already exists`);
    }

    // Create student card
    const result = await db.insert(studentCardsTable)
      .values({
        student_id: input.student_id,
        card_number: input.card_number,
        issue_date: input.issue_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        expiry_date: input.expiry_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        is_active: input.is_active,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert date strings back to Date objects
    const card = result[0];
    return {
      ...card,
      issue_date: new Date(card.issue_date),
      expiry_date: new Date(card.expiry_date)
    };
  } catch (error) {
    console.error('Student card creation failed:', error);
    throw error;
  }
}

export async function getStudentCards(): Promise<StudentCard[]> {
  try {
    const result = await db.select()
      .from(studentCardsTable)
      .execute();

    // Convert date strings back to Date objects
    return result.map(card => ({
      ...card,
      issue_date: new Date(card.issue_date),
      expiry_date: new Date(card.expiry_date)
    }));
  } catch (error) {
    console.error('Failed to fetch student cards:', error);
    throw error;
  }
}

export async function getStudentCardById(id: number): Promise<StudentCard | null> {
  try {
    const result = await db.select()
      .from(studentCardsTable)
      .where(eq(studentCardsTable.id, id))
      .execute();

    if (result.length === 0) return null;

    // Convert date strings back to Date objects
    const card = result[0];
    return {
      ...card,
      issue_date: new Date(card.issue_date),
      expiry_date: new Date(card.expiry_date)
    };
  } catch (error) {
    console.error('Failed to fetch student card by ID:', error);
    throw error;
  }
}

export async function updateStudentCard(input: UpdateStudentCardInput): Promise<StudentCard> {
  try {
    // Check if student card exists
    const existing = await db.select()
      .from(studentCardsTable)
      .where(eq(studentCardsTable.id, input.id))
      .execute();

    if (existing.length === 0) {
      throw new Error(`Student card with ID ${input.id} not found`);
    }

    // If updating student_id, verify student exists
    if (input.student_id !== undefined) {
      const student = await db.select()
        .from(studentsTable)
        .where(eq(studentsTable.id, input.student_id))
        .execute();

      if (student.length === 0) {
        throw new Error(`Student with ID ${input.student_id} not found`);
      }
    }

    // If updating card_number, check uniqueness
    if (input.card_number !== undefined && input.card_number !== existing[0].card_number) {
      const duplicateCard = await db.select()
        .from(studentCardsTable)
        .where(eq(studentCardsTable.card_number, input.card_number))
        .execute();

      if (duplicateCard.length > 0) {
        throw new Error(`Card number ${input.card_number} already exists`);
      }
    }

    // Build update values
    const updateValues: any = {};
    if (input.student_id !== undefined) updateValues.student_id = input.student_id;
    if (input.card_number !== undefined) updateValues.card_number = input.card_number;
    if (input.issue_date !== undefined) updateValues.issue_date = input.issue_date.toISOString().split('T')[0];
    if (input.expiry_date !== undefined) updateValues.expiry_date = input.expiry_date.toISOString().split('T')[0];
    if (input.is_active !== undefined) updateValues.is_active = input.is_active;
    if (input.notes !== undefined) updateValues.notes = input.notes;

    const result = await db.update(studentCardsTable)
      .set(updateValues)
      .where(eq(studentCardsTable.id, input.id))
      .returning()
      .execute();

    // Convert date strings back to Date objects
    const card = result[0];
    return {
      ...card,
      issue_date: new Date(card.issue_date),
      expiry_date: new Date(card.expiry_date)
    };
  } catch (error) {
    console.error('Student card update failed:', error);
    throw error;
  }
}

export async function deleteStudentCard(id: number): Promise<{ success: boolean }> {
  try {
    // Check if student card exists
    const existing = await db.select()
      .from(studentCardsTable)
      .where(eq(studentCardsTable.id, id))
      .execute();

    if (existing.length === 0) {
      throw new Error(`Student card with ID ${id} not found`);
    }

    await db.delete(studentCardsTable)
      .where(eq(studentCardsTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Student card deletion failed:', error);
    throw error;
  }
}

export async function getStudentCardsByStudent(studentId: number): Promise<StudentCard[]> {
  try {
    const result = await db.select()
      .from(studentCardsTable)
      .where(eq(studentCardsTable.student_id, studentId))
      .execute();

    // Convert date strings back to Date objects
    return result.map(card => ({
      ...card,
      issue_date: new Date(card.issue_date),
      expiry_date: new Date(card.expiry_date)
    }));
  } catch (error) {
    console.error('Failed to fetch student cards by student:', error);
    throw error;
  }
}

export async function getStudentCardsByStatus(isActive: boolean): Promise<StudentCard[]> {
  try {
    const result = await db.select()
      .from(studentCardsTable)
      .where(eq(studentCardsTable.is_active, isActive))
      .execute();

    // Convert date strings back to Date objects
    return result.map(card => ({
      ...card,
      issue_date: new Date(card.issue_date),
      expiry_date: new Date(card.expiry_date)
    }));
  } catch (error) {
    console.error('Failed to fetch student cards by status:', error);
    throw error;
  }
}

export async function getExpiringStudentCards(daysUntilExpiry: number): Promise<StudentCard[]> {
  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysUntilExpiry);

    // Convert dates to YYYY-MM-DD strings for database comparison
    const todayStr = today.toISOString().split('T')[0];
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const result = await db.select()
      .from(studentCardsTable)
      .where(
        and(
          gte(studentCardsTable.expiry_date, todayStr),
          lte(studentCardsTable.expiry_date, targetDateStr),
          eq(studentCardsTable.is_active, true)
        )
      )
      .execute();

    // Convert date strings back to Date objects
    return result.map(card => ({
      ...card,
      issue_date: new Date(card.issue_date),
      expiry_date: new Date(card.expiry_date)
    }));
  } catch (error) {
    console.error('Failed to fetch expiring student cards:', error);
    throw error;
  }
}