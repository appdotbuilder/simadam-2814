import { db } from '../db';
import { sppPaymentsTable, studentsTable } from '../db/schema';
import { type CreateSppPaymentInput, type UpdateSppPaymentInput, type SppPayment } from '../schema';
import { eq, and, SQL } from 'drizzle-orm';

export const createSppPayment = async (input: CreateSppPaymentInput): Promise<SppPayment> => {
  try {
    // Validate student exists
    const existingStudent = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, input.student_id))
      .execute();

    if (existingStudent.length === 0) {
      throw new Error(`Student with ID ${input.student_id} not found`);
    }

    // Check for duplicate payment for same student, month, and year
    const existingPayment = await db.select()
      .from(sppPaymentsTable)
      .where(and(
        eq(sppPaymentsTable.student_id, input.student_id),
        eq(sppPaymentsTable.month, input.month),
        eq(sppPaymentsTable.year, input.year)
      ))
      .execute();

    if (existingPayment.length > 0) {
      throw new Error(`SPP payment for student ${input.student_id} already exists for ${input.month}/${input.year}`);
    }

    // Insert SPP payment record
    const result = await db.insert(sppPaymentsTable)
      .values({
        student_id: input.student_id,
        month: input.month,
        year: input.year,
        amount: input.amount.toString(), // Convert number to string for numeric column
        payment_date: input.payment_date,
        status: input.status,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const payment = result[0];
    return {
      ...payment,
      amount: parseFloat(payment.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('SPP payment creation failed:', error);
    throw error;
  }
};

export const getSppPayments = async (): Promise<SppPayment[]> => {
  try {
    const results = await db.select()
      .from(sppPaymentsTable)
      .execute();

    return results.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount) // Convert string to number
    }));
  } catch (error) {
    console.error('Failed to fetch SPP payments:', error);
    throw error;
  }
};

export const getSppPaymentById = async (id: number): Promise<SppPayment | null> => {
  try {
    const results = await db.select()
      .from(sppPaymentsTable)
      .where(eq(sppPaymentsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const payment = results[0];
    return {
      ...payment,
      amount: parseFloat(payment.amount) // Convert string to number
    };
  } catch (error) {
    console.error('Failed to fetch SPP payment by ID:', error);
    throw error;
  }
};

export const updateSppPayment = async (input: UpdateSppPaymentInput): Promise<SppPayment> => {
  try {
    // Check if payment exists
    const existingPayment = await getSppPaymentById(input.id);
    if (!existingPayment) {
      throw new Error(`SPP payment with ID ${input.id} not found`);
    }

    // If student_id is being updated, validate new student exists
    if (input.student_id && input.student_id !== existingPayment.student_id) {
      const existingStudent = await db.select()
        .from(studentsTable)
        .where(eq(studentsTable.id, input.student_id))
        .execute();

      if (existingStudent.length === 0) {
        throw new Error(`Student with ID ${input.student_id} not found`);
      }

      // Check for duplicate payment with new student/month/year combination
      const duplicatePayment = await db.select()
        .from(sppPaymentsTable)
        .where(and(
          eq(sppPaymentsTable.student_id, input.student_id),
          eq(sppPaymentsTable.month, input.month || existingPayment.month),
          eq(sppPaymentsTable.year, input.year || existingPayment.year)
        ))
        .execute();

      if (duplicatePayment.length > 0) {
        throw new Error(`SPP payment for student ${input.student_id} already exists for ${input.month || existingPayment.month}/${input.year || existingPayment.year}`);
      }
    }

    // Build update data
    const updateData: any = {};
    if (input.student_id !== undefined) updateData.student_id = input.student_id;
    if (input.month !== undefined) updateData.month = input.month;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.amount !== undefined) updateData.amount = input.amount.toString(); // Convert to string
    if (input.payment_date !== undefined) updateData.payment_date = input.payment_date;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;

    // Update SPP payment record
    const result = await db.update(sppPaymentsTable)
      .set(updateData)
      .where(eq(sppPaymentsTable.id, input.id))
      .returning()
      .execute();

    const payment = result[0];
    return {
      ...payment,
      amount: parseFloat(payment.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('SPP payment update failed:', error);
    throw error;
  }
};

export const deleteSppPayment = async (id: number): Promise<{ success: boolean }> => {
  try {
    // Check if payment exists
    const existingPayment = await getSppPaymentById(id);
    if (!existingPayment) {
      throw new Error(`SPP payment with ID ${id} not found`);
    }

    await db.delete(sppPaymentsTable)
      .where(eq(sppPaymentsTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('SPP payment deletion failed:', error);
    throw error;
  }
};

export const getSppPaymentsByStudent = async (studentId: number): Promise<SppPayment[]> => {
  try {
    // Validate student exists
    const existingStudent = await db.select()
      .from(studentsTable)
      .where(eq(studentsTable.id, studentId))
      .execute();

    if (existingStudent.length === 0) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    const results = await db.select()
      .from(sppPaymentsTable)
      .where(eq(sppPaymentsTable.student_id, studentId))
      .execute();

    return results.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount) // Convert string to number
    }));
  } catch (error) {
    console.error('Failed to fetch SPP payments by student:', error);
    throw error;
  }
};

export const getSppPaymentsByStatus = async (status: string): Promise<SppPayment[]> => {
  try {
    // Validate status is one of the allowed enum values
    const validStatuses = ['belum_bayar', 'lunas', 'terlambat'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const results = await db.select()
      .from(sppPaymentsTable)
      .where(eq(sppPaymentsTable.status, status as 'belum_bayar' | 'lunas' | 'terlambat'))
      .execute();

    return results.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount) // Convert string to number
    }));
  } catch (error) {
    console.error('Failed to fetch SPP payments by status:', error);
    throw error;
  }
};

export const getSppPaymentsByMonthYear = async (month: number, year: number): Promise<SppPayment[]> => {
  try {
    const results = await db.select()
      .from(sppPaymentsTable)
      .where(and(
        eq(sppPaymentsTable.month, month),
        eq(sppPaymentsTable.year, year)
      ))
      .execute();

    return results.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount) // Convert string to number
    }));
  } catch (error) {
    console.error('Failed to fetch SPP payments by month/year:', error);
    throw error;
  }
};