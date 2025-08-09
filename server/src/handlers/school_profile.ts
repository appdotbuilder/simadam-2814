import { db } from '../db';
import { schoolProfileTable } from '../db/schema';
import { type UpdateSchoolProfileInput, type SchoolProfile } from '../schema';
import { sql } from 'drizzle-orm';

export async function getSchoolProfile(): Promise<SchoolProfile | null> {
  try {
    // Get the first (and presumably only) school profile record
    const profiles = await db.select()
      .from(schoolProfileTable)
      .limit(1)
      .execute();

    if (profiles.length === 0) {
      return null;
    }

    const profile = profiles[0];
    return {
      ...profile,
      // Convert nullable numeric field back to number
      established_year: profile.established_year
    };
  } catch (error) {
    console.error('Failed to get school profile:', error);
    throw error;
  }
}

export async function updateSchoolProfile(input: UpdateSchoolProfileInput): Promise<SchoolProfile> {
  try {
    // Check if a profile already exists
    const existingProfiles = await db.select()
      .from(schoolProfileTable)
      .limit(1)
      .execute();

    if (existingProfiles.length === 0) {
      // Create new profile - use default values for required fields not provided in input
      const result = await db.insert(schoolProfileTable)
        .values({
          school_name: input.school_name || 'School Name',
          address: input.address || 'School Address',
          headmaster_name: input.headmaster_name || 'Headmaster Name',
          phone: input.phone,
          email: input.email,
          website: input.website,
          logo_path: input.logo_path,
          description: input.description,
          vision: input.vision,
          mission: input.mission,
          established_year: input.established_year,
          updated_at: sql`now()`
        })
        .returning()
        .execute();

      const profile = result[0];
      return {
        ...profile,
        established_year: profile.established_year
      };
    } else {
      // Update existing profile
      const profileId = existingProfiles[0].id;
      
      // Build update object with only provided fields
      const updateData: any = {
        updated_at: sql`now()`
      };

      if (input.school_name !== undefined) updateData.school_name = input.school_name;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.website !== undefined) updateData.website = input.website;
      if (input.headmaster_name !== undefined) updateData.headmaster_name = input.headmaster_name;
      if (input.logo_path !== undefined) updateData.logo_path = input.logo_path;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.vision !== undefined) updateData.vision = input.vision;
      if (input.mission !== undefined) updateData.mission = input.mission;
      if (input.established_year !== undefined) updateData.established_year = input.established_year;

      const result = await db.update(schoolProfileTable)
        .set(updateData)
        .where(sql`${schoolProfileTable.id} = ${profileId}`)
        .returning()
        .execute();

      const profile = result[0];
      return {
        ...profile,
        established_year: profile.established_year
      };
    }
  } catch (error) {
    console.error('Failed to update school profile:', error);
    throw error;
  }
}

export async function uploadLogo(logoFile: File): Promise<{ logo_path: string }> {
  try {
    // Generate a unique filename using timestamp
    const timestamp = Date.now();
    
    // Extract file extension, default to 'png' if no extension found
    const nameParts = logoFile.name.split('.');
    const fileExtension = nameParts.length > 1 ? nameParts.pop() : 'png';
    
    const filename = `logo_${timestamp}.${fileExtension}`;
    const logoPath = `/uploads/${filename}`;

    // In a real implementation, you would:
    // 1. Validate file type and size
    // 2. Save the file to a storage location (filesystem, cloud storage, etc.)
    // 3. Return the path where the file was saved

    // For this implementation, we'll just return a mock path
    // since actual file handling would require additional dependencies
    return {
      logo_path: logoPath
    };
  } catch (error) {
    console.error('Failed to upload logo:', error);
    throw error;
  }
}