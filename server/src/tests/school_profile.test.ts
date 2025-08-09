import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { schoolProfileTable } from '../db/schema';
import { type UpdateSchoolProfileInput } from '../schema';
import { getSchoolProfile, updateSchoolProfile, uploadLogo } from '../handlers/school_profile';
import { eq } from 'drizzle-orm';

// Test input for complete school profile
const testUpdateInput: UpdateSchoolProfileInput = {
  school_name: 'MA Darul Muttaqien Test',
  address: 'Jl. Test No. 123, Jakarta',
  phone: '021-98765432',
  email: 'test@madarul.sch.id',
  website: 'https://test.madarul.sch.id',
  headmaster_name: 'Dr. Test Headmaster, M.Pd',
  logo_path: '/uploads/test_logo.png',
  description: 'Test school description',
  vision: 'Test vision statement',
  mission: 'Test mission statement',
  established_year: 2000
};

describe('school profile handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('getSchoolProfile', () => {
    it('should return null when no profile exists', async () => {
      const result = await getSchoolProfile();
      expect(result).toBeNull();
    });

    it('should return school profile when it exists', async () => {
      // Create a test profile first
      await db.insert(schoolProfileTable)
        .values({
          school_name: 'Test School',
          address: 'Test Address',
          headmaster_name: 'Test Headmaster',
          phone: '123-456-7890',
          established_year: 1995
        })
        .execute();

      const result = await getSchoolProfile();

      expect(result).toBeDefined();
      expect(result!.school_name).toEqual('Test School');
      expect(result!.address).toEqual('Test Address');
      expect(result!.headmaster_name).toEqual('Test Headmaster');
      expect(result!.phone).toEqual('123-456-7890');
      expect(result!.established_year).toEqual(1995);
      expect(result!.id).toBeDefined();
      expect(result!.created_at).toBeInstanceOf(Date);
      expect(result!.updated_at).toBeInstanceOf(Date);
    });

    it('should handle nullable fields correctly', async () => {
      // Create profile with minimal required fields
      await db.insert(schoolProfileTable)
        .values({
          school_name: 'Minimal School',
          address: 'Minimal Address',
          headmaster_name: 'Minimal Headmaster',
          phone: null,
          email: null,
          website: null,
          logo_path: null,
          description: null,
          vision: null,
          mission: null,
          established_year: null
        })
        .execute();

      const result = await getSchoolProfile();

      expect(result).toBeDefined();
      expect(result!.school_name).toEqual('Minimal School');
      expect(result!.phone).toBeNull();
      expect(result!.email).toBeNull();
      expect(result!.website).toBeNull();
      expect(result!.established_year).toBeNull();
    });
  });

  describe('updateSchoolProfile', () => {
    it('should create new profile when none exists', async () => {
      const result = await updateSchoolProfile(testUpdateInput);

      // Verify returned data
      expect(result.school_name).toEqual('MA Darul Muttaqien Test');
      expect(result.address).toEqual('Jl. Test No. 123, Jakarta');
      expect(result.phone).toEqual('021-98765432');
      expect(result.email).toEqual('test@madarul.sch.id');
      expect(result.website).toEqual('https://test.madarul.sch.id');
      expect(result.headmaster_name).toEqual('Dr. Test Headmaster, M.Pd');
      expect(result.logo_path).toEqual('/uploads/test_logo.png');
      expect(result.description).toEqual('Test school description');
      expect(result.vision).toEqual('Test vision statement');
      expect(result.mission).toEqual('Test mission statement');
      expect(result.established_year).toEqual(2000);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);

      // Verify data is saved in database
      const profiles = await db.select()
        .from(schoolProfileTable)
        .where(eq(schoolProfileTable.id, result.id))
        .execute();

      expect(profiles).toHaveLength(1);
      expect(profiles[0].school_name).toEqual('MA Darul Muttaqien Test');
      expect(profiles[0].established_year).toEqual(2000);
    });

    it('should update existing profile when one exists', async () => {
      // Create initial profile
      const initialProfile = await db.insert(schoolProfileTable)
        .values({
          school_name: 'Initial School',
          address: 'Initial Address',
          headmaster_name: 'Initial Headmaster',
          established_year: 1990
        })
        .returning()
        .execute();

      const profileId = initialProfile[0].id;

      // Update with partial data
      const partialUpdate: UpdateSchoolProfileInput = {
        school_name: 'Updated School Name',
        phone: '021-11111111',
        established_year: 2005
      };

      const result = await updateSchoolProfile(partialUpdate);

      // Verify updated fields
      expect(result.id).toEqual(profileId);
      expect(result.school_name).toEqual('Updated School Name');
      expect(result.phone).toEqual('021-11111111');
      expect(result.established_year).toEqual(2005);
      
      // Verify unchanged fields
      expect(result.address).toEqual('Initial Address');
      expect(result.headmaster_name).toEqual('Initial Headmaster');

      // Verify in database
      const profiles = await db.select()
        .from(schoolProfileTable)
        .where(eq(schoolProfileTable.id, profileId))
        .execute();

      expect(profiles).toHaveLength(1);
      expect(profiles[0].school_name).toEqual('Updated School Name');
      expect(profiles[0].address).toEqual('Initial Address');
      expect(profiles[0].established_year).toEqual(2005);
    });

    it('should create profile with default values when input has minimal data', async () => {
      const minimalInput: UpdateSchoolProfileInput = {
        phone: '021-12345678'
      };

      const result = await updateSchoolProfile(minimalInput);

      expect(result.school_name).toEqual('School Name'); // default
      expect(result.address).toEqual('School Address'); // default
      expect(result.headmaster_name).toEqual('Headmaster Name'); // default
      expect(result.phone).toEqual('021-12345678'); // provided
      expect(result.email).toBeNull();
      expect(result.id).toBeDefined();
    });

    it('should handle nullable fields correctly in updates', async () => {
      // Create initial profile with data
      await db.insert(schoolProfileTable)
        .values({
          school_name: 'Test School',
          address: 'Test Address',
          headmaster_name: 'Test Headmaster',
          phone: '123-456-7890',
          email: 'test@example.com'
        })
        .execute();

      // Update to set nullable field to null
      const updateInput: UpdateSchoolProfileInput = {
        phone: null,
        email: null,
        established_year: null
      };

      const result = await updateSchoolProfile(updateInput);

      expect(result.phone).toBeNull();
      expect(result.email).toBeNull();
      expect(result.established_year).toBeNull();
      expect(result.school_name).toEqual('Test School'); // unchanged
    });

    it('should only update one profile when multiple exist', async () => {
      // Create two profiles (edge case - should not normally happen)
      const profile1 = await db.insert(schoolProfileTable)
        .values({
          school_name: 'School 1',
          address: 'Address 1',
          headmaster_name: 'Headmaster 1'
        })
        .returning()
        .execute();

      await db.insert(schoolProfileTable)
        .values({
          school_name: 'School 2',
          address: 'Address 2',
          headmaster_name: 'Headmaster 2'
        })
        .execute();

      const updateInput: UpdateSchoolProfileInput = {
        school_name: 'Updated School'
      };

      const result = await updateSchoolProfile(updateInput);

      // Should update the first profile found
      expect(result.id).toEqual(profile1[0].id);
      expect(result.school_name).toEqual('Updated School');

      // Verify only one profile was updated
      const allProfiles = await db.select()
        .from(schoolProfileTable)
        .execute();

      expect(allProfiles).toHaveLength(2);
      const updatedProfile = allProfiles.find(p => p.id === profile1[0].id);
      const unchangedProfile = allProfiles.find(p => p.id !== profile1[0].id);

      expect(updatedProfile!.school_name).toEqual('Updated School');
      expect(unchangedProfile!.school_name).toEqual('School 2');
    });
  });

  describe('uploadLogo', () => {
    it('should generate unique logo path', async () => {
      // Mock File object
      const mockFile = {
        name: 'test-logo.png',
        size: 1024,
        type: 'image/png'
      } as File;

      const result = await uploadLogo(mockFile);

      expect(result.logo_path).toBeDefined();
      expect(result.logo_path).toMatch(/^\/uploads\/logo_\d+\.png$/);
    });

    it('should handle different file extensions', async () => {
      const mockFile = {
        name: 'test-logo.jpg',
        size: 1024,
        type: 'image/jpeg'
      } as File;

      const result = await uploadLogo(mockFile);

      expect(result.logo_path).toMatch(/^\/uploads\/logo_\d+\.jpg$/);
    });

    it('should handle files without extensions', async () => {
      const mockFile = {
        name: 'test-logo',
        size: 1024,
        type: 'image/png'
      } as File;

      const result = await uploadLogo(mockFile);

      expect(result.logo_path).toMatch(/^\/uploads\/logo_\d+\.png$/);
    });

    it('should generate different paths for multiple uploads', async () => {
      const mockFile1 = {
        name: 'logo1.png',
        size: 1024,
        type: 'image/png'
      } as File;

      const mockFile2 = {
        name: 'logo2.png',
        size: 1024,
        type: 'image/png'
      } as File;

      // Add a small delay to ensure different timestamps
      const result1 = await uploadLogo(mockFile1);
      await new Promise(resolve => setTimeout(resolve, 1));
      const result2 = await uploadLogo(mockFile2);

      expect(result1.logo_path).not.toEqual(result2.logo_path);
      expect(result1.logo_path).toMatch(/^\/uploads\/logo_\d+\.png$/);
      expect(result2.logo_path).toMatch(/^\/uploads\/logo_\d+\.png$/);
    });
  });
});