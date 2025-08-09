import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { backgroundSettingsTable } from '../db/schema';
import { type CreateBackgroundInput, type UpdateBackgroundInput } from '../schema';
import { 
  createBackground, 
  getBackgrounds, 
  getBackgroundById, 
  getActiveBackground,
  updateBackground,
  deleteBackground,
  setActiveBackground,
  uploadBackground
} from '../handlers/background_settings';
import { eq } from 'drizzle-orm';

// Test data
const testBackgroundInput: CreateBackgroundInput = {
  name: 'Test Background',
  file_path: '/uploads/test_bg.jpg',
  is_active: false
};

const activeBackgroundInput: CreateBackgroundInput = {
  name: 'Active Background',
  file_path: '/uploads/active_bg.jpg',
  is_active: true
};

describe('Background Settings Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createBackground', () => {
    it('should create a background', async () => {
      const result = await createBackground(testBackgroundInput);

      expect(result.name).toEqual('Test Background');
      expect(result.file_path).toEqual('/uploads/test_bg.jpg');
      expect(result.is_active).toEqual(false);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should save background to database', async () => {
      const result = await createBackground(testBackgroundInput);

      const backgrounds = await db.select()
        .from(backgroundSettingsTable)
        .where(eq(backgroundSettingsTable.id, result.id))
        .execute();

      expect(backgrounds).toHaveLength(1);
      expect(backgrounds[0].name).toEqual('Test Background');
      expect(backgrounds[0].file_path).toEqual('/uploads/test_bg.jpg');
      expect(backgrounds[0].is_active).toEqual(false);
    });

    it('should deactivate other backgrounds when creating active background', async () => {
      // Create first active background
      await createBackground(activeBackgroundInput);

      // Create second active background - should deactivate the first
      const secondActive = await createBackground({
        name: 'Second Active Background',
        file_path: '/uploads/second_active.jpg',
        is_active: true
      });

      // Check that only the second background is active
      const allBackgrounds = await db.select()
        .from(backgroundSettingsTable)
        .execute();

      const activeBackgrounds = allBackgrounds.filter(bg => bg.is_active);
      expect(activeBackgrounds).toHaveLength(1);
      expect(activeBackgrounds[0].id).toEqual(secondActive.id);
    });
  });

  describe('getBackgrounds', () => {
    it('should return empty array when no backgrounds exist', async () => {
      const result = await getBackgrounds();
      expect(result).toHaveLength(0);
    });

    it('should return all backgrounds', async () => {
      await createBackground(testBackgroundInput);
      await createBackground({
        name: 'Second Background',
        file_path: '/uploads/second_bg.jpg',
        is_active: false
      });

      const result = await getBackgrounds();
      expect(result).toHaveLength(2);
      
      const names = result.map(bg => bg.name).sort();
      expect(names).toEqual(['Second Background', 'Test Background']);
    });
  });

  describe('getBackgroundById', () => {
    it('should return null for non-existent background', async () => {
      const result = await getBackgroundById(999);
      expect(result).toBeNull();
    });

    it('should return background by ID', async () => {
      const created = await createBackground(testBackgroundInput);
      const result = await getBackgroundById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(created.id);
      expect(result!.name).toEqual('Test Background');
      expect(result!.file_path).toEqual('/uploads/test_bg.jpg');
    });
  });

  describe('getActiveBackground', () => {
    it('should return null when no active background exists', async () => {
      // Create inactive background
      await createBackground(testBackgroundInput);
      
      const result = await getActiveBackground();
      expect(result).toBeNull();
    });

    it('should return active background', async () => {
      // Create inactive background
      await createBackground(testBackgroundInput);
      
      // Create active background
      const active = await createBackground(activeBackgroundInput);

      const result = await getActiveBackground();
      expect(result).not.toBeNull();
      expect(result!.id).toEqual(active.id);
      expect(result!.is_active).toEqual(true);
      expect(result!.name).toEqual('Active Background');
    });
  });

  describe('updateBackground', () => {
    it('should throw error for non-existent background', async () => {
      const updateInput: UpdateBackgroundInput = {
        id: 999,
        name: 'Updated Background'
      };

      expect(updateBackground(updateInput)).rejects.toThrow(/not found/i);
    });

    it('should update background name', async () => {
      const created = await createBackground(testBackgroundInput);
      
      const updateInput: UpdateBackgroundInput = {
        id: created.id,
        name: 'Updated Background Name'
      };

      const result = await updateBackground(updateInput);
      expect(result.name).toEqual('Updated Background Name');
      expect(result.file_path).toEqual('/uploads/test_bg.jpg'); // Should remain unchanged
      expect(result.is_active).toEqual(false); // Should remain unchanged
    });

    it('should update background file path', async () => {
      const created = await createBackground(testBackgroundInput);
      
      const updateInput: UpdateBackgroundInput = {
        id: created.id,
        file_path: '/uploads/new_path.jpg'
      };

      const result = await updateBackground(updateInput);
      expect(result.file_path).toEqual('/uploads/new_path.jpg');
      expect(result.name).toEqual('Test Background'); // Should remain unchanged
    });

    it('should deactivate other backgrounds when setting background as active', async () => {
      // Create first active background
      const firstActive = await createBackground(activeBackgroundInput);
      
      // Create second inactive background
      const secondBg = await createBackground(testBackgroundInput);

      // Update second background to be active
      const updateInput: UpdateBackgroundInput = {
        id: secondBg.id,
        is_active: true
      };

      await updateBackground(updateInput);

      // Check that only the updated background is active
      const allBackgrounds = await db.select()
        .from(backgroundSettingsTable)
        .execute();

      const activeBackgrounds = allBackgrounds.filter(bg => bg.is_active);
      expect(activeBackgrounds).toHaveLength(1);
      expect(activeBackgrounds[0].id).toEqual(secondBg.id);
    });

    it('should update multiple fields at once', async () => {
      const created = await createBackground(testBackgroundInput);
      
      const updateInput: UpdateBackgroundInput = {
        id: created.id,
        name: 'Multi-Update Background',
        file_path: '/uploads/multi_update.jpg',
        is_active: true
      };

      const result = await updateBackground(updateInput);
      expect(result.name).toEqual('Multi-Update Background');
      expect(result.file_path).toEqual('/uploads/multi_update.jpg');
      expect(result.is_active).toEqual(true);
    });
  });

  describe('deleteBackground', () => {
    it('should throw error for non-existent background', async () => {
      expect(deleteBackground(999)).rejects.toThrow(/not found/i);
    });

    it('should throw error when trying to delete active background', async () => {
      const active = await createBackground(activeBackgroundInput);
      
      expect(deleteBackground(active.id)).rejects.toThrow(/cannot delete active background/i);
    });

    it('should successfully delete inactive background', async () => {
      const inactive = await createBackground(testBackgroundInput);
      
      const result = await deleteBackground(inactive.id);
      expect(result.success).toEqual(true);

      // Verify background is deleted from database
      const backgrounds = await db.select()
        .from(backgroundSettingsTable)
        .where(eq(backgroundSettingsTable.id, inactive.id))
        .execute();

      expect(backgrounds).toHaveLength(0);
    });

    it('should delete correct background among multiple', async () => {
      const first = await createBackground(testBackgroundInput);
      const second = await createBackground({
        name: 'Second Background',
        file_path: '/uploads/second.jpg',
        is_active: false
      });

      await deleteBackground(first.id);

      // Verify only second background remains
      const remainingBackgrounds = await getBackgrounds();
      expect(remainingBackgrounds).toHaveLength(1);
      expect(remainingBackgrounds[0].id).toEqual(second.id);
    });
  });

  describe('setActiveBackground', () => {
    it('should throw error for non-existent background', async () => {
      expect(setActiveBackground(999)).rejects.toThrow(/not found/i);
    });

    it('should set background as active', async () => {
      const inactive = await createBackground(testBackgroundInput);
      
      const result = await setActiveBackground(inactive.id);
      expect(result.is_active).toEqual(true);
      expect(result.id).toEqual(inactive.id);
    });

    it('should deactivate previous active background', async () => {
      // Create first active background
      const firstActive = await createBackground(activeBackgroundInput);
      
      // Create second inactive background
      const secondBg = await createBackground(testBackgroundInput);

      // Set second background as active
      await setActiveBackground(secondBg.id);

      // Check that only the second background is active
      const allBackgrounds = await db.select()
        .from(backgroundSettingsTable)
        .execute();

      const activeBackgrounds = allBackgrounds.filter(bg => bg.is_active);
      expect(activeBackgrounds).toHaveLength(1);
      expect(activeBackgrounds[0].id).toEqual(secondBg.id);

      // Verify first background is no longer active
      const firstBgUpdated = await getBackgroundById(firstActive.id);
      expect(firstBgUpdated!.is_active).toEqual(false);
    });

    it('should handle multiple background switches', async () => {
      // Create three backgrounds
      const bg1 = await createBackground({ ...testBackgroundInput, name: 'Background 1' });
      const bg2 = await createBackground({ ...testBackgroundInput, name: 'Background 2' });
      const bg3 = await createBackground({ ...testBackgroundInput, name: 'Background 3' });

      // Set each as active in sequence
      await setActiveBackground(bg1.id);
      await setActiveBackground(bg2.id);
      await setActiveBackground(bg3.id);

      // Verify only bg3 is active
      const activeBackground = await getActiveBackground();
      expect(activeBackground!.id).toEqual(bg3.id);
      expect(activeBackground!.name).toEqual('Background 3');
    });
  });

  describe('uploadBackground', () => {
    it('should upload and create a background', async () => {
      // Mock File object for testing
      const mockFile = new File(['test content'], 'test_bg.jpg', { type: 'image/jpeg' }) as any;
      
      const result = await uploadBackground(mockFile, 'Uploaded Background');
      
      expect(result.name).toEqual('Uploaded Background');
      expect(result.file_path).toMatch(/^\/uploads\/bg_\d+\.jpg$/);
      expect(result.is_active).toEqual(false); // New uploads should be inactive by default
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
    });

    it('should save uploaded background to database', async () => {
      const mockFile = new File(['test content'], 'test_bg.jpg', { type: 'image/jpeg' }) as any;
      
      const result = await uploadBackground(mockFile, 'Database Test Background');
      
      const backgrounds = await db.select()
        .from(backgroundSettingsTable)
        .where(eq(backgroundSettingsTable.id, result.id))
        .execute();

      expect(backgrounds).toHaveLength(1);
      expect(backgrounds[0].name).toEqual('Database Test Background');
      expect(backgrounds[0].is_active).toEqual(false);
    });

    it('should create inactive background by default', async () => {
      // Create an active background first
      await createBackground(activeBackgroundInput);
      
      const mockFile = new File(['test content'], 'test_bg.jpg', { type: 'image/jpeg' }) as any;
      const uploaded = await uploadBackground(mockFile, 'New Upload');
      
      // Verify the uploaded background is inactive
      expect(uploaded.is_active).toEqual(false);
      
      // Verify the original active background remains active
      const activeBackground = await getActiveBackground();
      expect(activeBackground).not.toBeNull();
      expect(activeBackground!.name).toEqual('Active Background');
    });
  });
});