import { db } from '../db';
import { studentsTable, teachersTable } from '../db/schema';
import { type DashboardStats } from '../schema';
import { count, eq } from 'drizzle-orm';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total students count
    const totalStudentsResult = await db.select({ count: count() })
      .from(studentsTable)
      .where(eq(studentsTable.is_active, true))
      .execute();

    // Get total teachers count
    const totalTeachersResult = await db.select({ count: count() })
      .from(teachersTable)
      .where(eq(teachersTable.is_active, true))
      .execute();

    // Get students from SMP Darul Muttaqien
    const studentsFromSmpResult = await db.select({ count: count() })
      .from(studentsTable)
      .where(eq(studentsTable.origin_school, 'smp_darul_muttaqien'))
      .execute();

    // Get students from MTS
    const studentsFromMtsResult = await db.select({ count: count() })
      .from(studentsTable)
      .where(eq(studentsTable.origin_school, 'mts'))
      .execute();

    // Get students from other schools
    const studentsFromOtherResult = await db.select({ count: count() })
      .from(studentsTable)
      .where(eq(studentsTable.origin_school, 'luar_smp_darul_muttaqien'))
      .execute();

    return {
      total_students: totalStudentsResult[0].count,
      total_teachers: totalTeachersResult[0].count,
      students_from_smp: studentsFromSmpResult[0].count,
      students_from_mts: studentsFromMtsResult[0].count,
      students_from_other: studentsFromOtherResult[0].count
    };
  } catch (error) {
    console.error('Dashboard stats fetch failed:', error);
    throw error;
  }
}