import { db } from '../db';
import { certificatePickupsTable, studentsTable } from '../db/schema';
import { type CreateCertificatePickupInput, type UpdateCertificatePickupInput, type CertificatePickup } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function createCertificatePickup(input: CreateCertificatePickupInput): Promise<CertificatePickup> {
  try {
    // Verify student exists
    const student = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, input.student_id))
      .execute();

    if (student.length === 0) {
      throw new Error(`Student with ID ${input.student_id} not found`);
    }

    const result = await db.insert(certificatePickupsTable)
      .values({
        student_id: input.student_id,
        certificate_type: input.certificate_type,
        pickup_date: input.pickup_date,
        picked_by: input.picked_by,
        relationship: input.relationship,
        id_card_number: input.id_card_number,
        notes: input.notes,
        is_picked_up: input.is_picked_up
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Certificate pickup creation failed:', error);
    throw error;
  }
}

export async function getCertificatePickups(): Promise<CertificatePickup[]> {
  try {
    const result = await db.select()
      .from(certificatePickupsTable)
      .execute();

    return result;
  } catch (error) {
    console.error('Fetching certificate pickups failed:', error);
    throw error;
  }
}

export async function getCertificatePickupById(id: number): Promise<CertificatePickup | null> {
  try {
    const result = await db.select()
      .from(certificatePickupsTable)
      .where(eq(certificatePickupsTable.id, id))
      .execute();

    return result[0] || null;
  } catch (error) {
    console.error('Fetching certificate pickup by ID failed:', error);
    throw error;
  }
}

export async function updateCertificatePickup(input: UpdateCertificatePickupInput): Promise<CertificatePickup> {
  try {
    // Build update object with only provided fields
    const updateData: any = { updated_at: new Date() };
    
    if (input.student_id !== undefined) {
      // Verify student exists if student_id is being updated
      const student = await db.select()
        .from(studentsTable)
        .where(eq(studentsTable.id, input.student_id))
        .execute();

      if (student.length === 0) {
        throw new Error(`Student with ID ${input.student_id} not found`);
      }
      updateData.student_id = input.student_id;
    }
    
    if (input.certificate_type !== undefined) updateData.certificate_type = input.certificate_type;
    if (input.pickup_date !== undefined) updateData.pickup_date = input.pickup_date;
    if (input.picked_by !== undefined) updateData.picked_by = input.picked_by;
    if (input.relationship !== undefined) updateData.relationship = input.relationship;
    if (input.id_card_number !== undefined) updateData.id_card_number = input.id_card_number;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.is_picked_up !== undefined) updateData.is_picked_up = input.is_picked_up;

    const result = await db.update(certificatePickupsTable)
      .set(updateData)
      .where(eq(certificatePickupsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Certificate pickup with ID ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Certificate pickup update failed:', error);
    throw error;
  }
}

export async function deleteCertificatePickup(id: number): Promise<{ success: boolean }> {
  try {
    const result = await db.delete(certificatePickupsTable)
      .where(eq(certificatePickupsTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Certificate pickup with ID ${id} not found`);
    }

    return { success: true };
  } catch (error) {
    console.error('Certificate pickup deletion failed:', error);
    throw error;
  }
}

export async function getCertificatePickupsByStudent(studentId: number): Promise<CertificatePickup[]> {
  try {
    const result = await db.select()
      .from(certificatePickupsTable)
      .where(eq(certificatePickupsTable.student_id, studentId))
      .execute();

    return result;
  } catch (error) {
    console.error('Fetching certificate pickups by student failed:', error);
    throw error;
  }
}

export async function getCertificatePickupsByStatus(isPickedUp: boolean): Promise<CertificatePickup[]> {
  try {
    const result = await db.select()
      .from(certificatePickupsTable)
      .where(eq(certificatePickupsTable.is_picked_up, isPickedUp))
      .execute();

    return result;
  } catch (error) {
    console.error('Fetching certificate pickups by status failed:', error);
    throw error;
  }
}