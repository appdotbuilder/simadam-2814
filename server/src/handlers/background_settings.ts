import { db } from '../db';
import { backgroundSettingsTable } from '../db/schema';
import { type CreateBackgroundInput, type UpdateBackgroundInput, type BackgroundSettings } from '../schema';
import { eq } from 'drizzle-orm';

export const createBackground = async (input: CreateBackgroundInput): Promise<BackgroundSettings> => {
  try {
    // If this background is being set as active, deactivate all others first
    if (input.is_active) {
      await db.update(backgroundSettingsTable)
        .set({ 
          is_active: false,
          updated_at: new Date()
        })
        .where(eq(backgroundSettingsTable.is_active, true))
        .execute();
    }

    // Create the new background
    const result = await db.insert(backgroundSettingsTable)
      .values({
        name: input.name,
        file_path: input.file_path,
        is_active: input.is_active
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Background creation failed:', error);
    throw error;
  }
};

export const getBackgrounds = async (): Promise<BackgroundSettings[]> => {
  try {
    const result = await db.select()
      .from(backgroundSettingsTable)
      .execute();

    return result;
  } catch (error) {
    console.error('Get backgrounds failed:', error);
    throw error;
  }
};

export const getBackgroundById = async (id: number): Promise<BackgroundSettings | null> => {
  try {
    const result = await db.select()
      .from(backgroundSettingsTable)
      .where(eq(backgroundSettingsTable.id, id))
      .execute();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Get background by ID failed:', error);
    throw error;
  }
};

export const getActiveBackground = async (): Promise<BackgroundSettings | null> => {
  try {
    const result = await db.select()
      .from(backgroundSettingsTable)
      .where(eq(backgroundSettingsTable.is_active, true))
      .execute();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Get active background failed:', error);
    throw error;
  }
};

export const updateBackground = async (input: UpdateBackgroundInput): Promise<BackgroundSettings> => {
  try {
    // Check if background exists
    const existing = await getBackgroundById(input.id);
    if (!existing) {
      throw new Error(`Background with ID ${input.id} not found`);
    }

    // If this background is being set as active, deactivate all others first
    if (input.is_active === true) {
      await db.update(backgroundSettingsTable)
        .set({ 
          is_active: false,
          updated_at: new Date()
        })
        .where(eq(backgroundSettingsTable.is_active, true))
        .execute();
    }

    // Update the background
    const result = await db.update(backgroundSettingsTable)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.file_path !== undefined && { file_path: input.file_path }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
        updated_at: new Date()
      })
      .where(eq(backgroundSettingsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Background update failed:', error);
    throw error;
  }
};

export const deleteBackground = async (id: number): Promise<{ success: boolean }> => {
  try {
    // Check if background exists and is not active
    const existing = await getBackgroundById(id);
    if (!existing) {
      throw new Error(`Background with ID ${id} not found`);
    }

    if (existing.is_active) {
      throw new Error('Cannot delete active background');
    }

    await db.delete(backgroundSettingsTable)
      .where(eq(backgroundSettingsTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Background deletion failed:', error);
    throw error;
  }
};

export const setActiveBackground = async (id: number): Promise<BackgroundSettings> => {
  try {
    // Check if background exists
    const existing = await getBackgroundById(id);
    if (!existing) {
      throw new Error(`Background with ID ${id} not found`);
    }

    // Deactivate all backgrounds
    await db.update(backgroundSettingsTable)
      .set({ 
        is_active: false,
        updated_at: new Date()
      })
      .where(eq(backgroundSettingsTable.is_active, true))
      .execute();

    // Activate the selected background
    const result = await db.update(backgroundSettingsTable)
      .set({
        is_active: true,
        updated_at: new Date()
      })
      .where(eq(backgroundSettingsTable.id, id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Set active background failed:', error);
    throw error;
  }
};

export const uploadBackground = async (backgroundFile: File, name: string): Promise<BackgroundSettings> => {
  try {
    // This is a placeholder implementation for file upload functionality
    // In a real application, this would handle file validation, storage, and path generation
    
    // Generate a file path (this would typically involve actual file operations)
    const filePath = `/uploads/bg_${Date.now()}.jpg`;
    
    // Create the background record
    const input: CreateBackgroundInput = {
      name: name,
      file_path: filePath,
      is_active: false // New uploads are inactive by default
    };

    return await createBackground(input);
  } catch (error) {
    console.error('Background upload failed:', error);
    throw error;
  }
};