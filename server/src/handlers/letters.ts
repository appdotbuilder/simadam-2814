import { db } from '../db';
import { lettersTable } from '../db/schema';
import { type CreateLetterInput, type UpdateLetterInput, type Letter } from '../schema';
import { eq } from 'drizzle-orm';

export async function createLetter(input: CreateLetterInput): Promise<Letter> {
  try {
    // Check if letter number already exists
    const existingLetter = await db.select()
      .from(lettersTable)
      .where(eq(lettersTable.letter_number, input.letter_number))
      .execute();

    if (existingLetter.length > 0) {
      throw new Error(`Letter number ${input.letter_number} already exists`);
    }

    // Convert Date objects to strings for date columns
    const letterDateString = input.letter_date.toISOString().split('T')[0];
    const receivedDateString = input.received_date 
      ? input.received_date.toISOString().split('T')[0] 
      : null;

    // Insert new letter record
    const result = await db.insert(lettersTable)
      .values({
        letter_number: input.letter_number,
        letter_type: input.letter_type,
        subject: input.subject,
        sender: input.sender,
        recipient: input.recipient,
        letter_date: letterDateString,
        received_date: receivedDateString,
        description: input.description,
        file_path: input.file_path
      })
      .returning()
      .execute();

    // Convert date strings back to Date objects before returning
    const letter = result[0];
    return {
      ...letter,
      letter_date: new Date(letter.letter_date),
      received_date: letter.received_date ? new Date(letter.received_date) : null
    };
  } catch (error) {
    console.error('Letter creation failed:', error);
    throw error;
  }
}

export async function getLetters(): Promise<Letter[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch all letters from the database.
    // Should support filtering by letter type (masuk/keluar) and date ranges.
    return Promise.resolve([]);
}

export async function getLetterById(id: number): Promise<Letter | null> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch a specific letter by ID.
    return Promise.resolve(null);
}

export async function updateLetter(input: UpdateLetterInput): Promise<Letter> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to update existing letter data.
    // Should handle file replacement and letter number validation.
    return Promise.resolve({
        id: input.id,
        letter_number: '001/SK/2024',
        letter_type: 'masuk',
        subject: 'Updated Subject',
        sender: 'Updated Sender',
        recipient: 'Updated Recipient',
        letter_date: new Date(),
        received_date: new Date(),
        description: 'Updated description',
        file_path: '/uploads/letter.pdf',
        created_at: new Date(),
        updated_at: new Date()
    });
}

export async function deleteLetter(id: number): Promise<{ success: boolean }> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to delete a letter from the database.
    // Should handle associated file deletion from storage.
    return Promise.resolve({ success: true });
}

export async function getLettersByType(letterType: string): Promise<Letter[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch letters by type (masuk or keluar).
    return Promise.resolve([]);
}

export async function getLettersByDateRange(startDate: Date, endDate: Date): Promise<Letter[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch letters within a specific date range.
    return Promise.resolve([]);
}