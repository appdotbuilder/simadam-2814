import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { studentsTable, teachersTable, classesTable } from '../db/schema';
import { getDashboardStats } from '../handlers/dashboard';

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty stats when no data exists', async () => {
    const result = await getDashboardStats();

    expect(result.total_students).toEqual(0);
    expect(result.total_teachers).toEqual(0);
    expect(result.students_from_smp).toEqual(0);
    expect(result.students_from_mts).toEqual(0);
    expect(result.students_from_other).toEqual(0);
  });

  it('should return correct stats with sample data', async () => {
    // Create test class first
    const classResult = await db.insert(classesTable)
      .values({
        name: 'X-A',
        grade: 1,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    const classId = classResult[0].id;

    // Create test teachers
    await db.insert(teachersTable)
      .values([
        {
          nip: 'T001',
          full_name: 'Teacher 1',
          gender: 'L',
          birth_place: 'Jakarta',
          birth_date: '1980-01-01',
          address: 'Address 1',
          phone: '081234567890',
          email: 'teacher1@test.com',
          subject: 'Math',
          user_id: null,
          is_active: true
        },
        {
          nip: 'T002',
          full_name: 'Teacher 2',
          gender: 'P',
          birth_place: 'Bandung',
          birth_date: '1985-02-01',
          address: 'Address 2',
          phone: '081234567891',
          email: 'teacher2@test.com',
          subject: 'Science',
          user_id: null,
          is_active: true
        },
        {
          nip: 'T003',
          full_name: 'Inactive Teacher',
          gender: 'L',
          birth_place: 'Surabaya',
          birth_date: '1975-03-01',
          address: 'Address 3',
          phone: '081234567892',
          email: 'teacher3@test.com',
          subject: 'English',
          user_id: null,
          is_active: false // Inactive teacher - should not be counted
        }
      ])
      .execute();

    // Create test students with different origins
    await db.insert(studentsTable)
      .values([
        {
          nis: 'S001',
          nisn: '1001',
          full_name: 'Student 1',
          gender: 'L',
          birth_place: 'Jakarta',
          birth_date: '2006-01-01',
          address: 'Student Address 1',
          phone: '081111111111',
          parent_name: 'Parent 1',
          parent_phone: '082111111111',
          origin_school: 'smp_darul_muttaqien',
          entry_year: 2024,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S002',
          nisn: '1002',
          full_name: 'Student 2',
          gender: 'P',
          birth_place: 'Bandung',
          birth_date: '2006-02-01',
          address: 'Student Address 2',
          phone: '081111111112',
          parent_name: 'Parent 2',
          parent_phone: '082111111112',
          origin_school: 'mts',
          entry_year: 2024,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S003',
          nisn: '1003',
          full_name: 'Student 3',
          gender: 'L',
          birth_place: 'Surabaya',
          birth_date: '2006-03-01',
          address: 'Student Address 3',
          phone: '081111111113',
          parent_name: 'Parent 3',
          parent_phone: '082111111113',
          origin_school: 'luar_smp_darul_muttaqien',
          entry_year: 2024,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S004',
          nisn: '1004',
          full_name: 'Student 4',
          gender: 'P',
          birth_place: 'Medan',
          birth_date: '2006-04-01',
          address: 'Student Address 4',
          phone: '081111111114',
          parent_name: 'Parent 4',
          parent_phone: '082111111114',
          origin_school: 'smp_darul_muttaqien',
          entry_year: 2024,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S005',
          nisn: '1005',
          full_name: 'Inactive Student',
          gender: 'L',
          birth_place: 'Yogya',
          birth_date: '2006-05-01',
          address: 'Student Address 5',
          phone: '081111111115',
          parent_name: 'Parent 5',
          parent_phone: '082111111115',
          origin_school: 'mts',
          entry_year: 2024,
          class_id: classId,
          is_active: false // Inactive student - should not be counted in total
        }
      ])
      .execute();

    const result = await getDashboardStats();

    expect(result.total_students).toEqual(4); // Only active students
    expect(result.total_teachers).toEqual(2); // Only active teachers
    expect(result.students_from_smp).toEqual(2); // 2 from SMP Darul Muttaqien (includes inactive)
    expect(result.students_from_mts).toEqual(2); // 2 from MTS (includes inactive)
    expect(result.students_from_other).toEqual(1); // 1 from other schools
  });

  it('should handle database correctly with mixed active/inactive data', async () => {
    // Create test class first
    const classResult = await db.insert(classesTable)
      .values({
        name: 'XI-B',
        grade: 2,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    const classId = classResult[0].id;

    // Create only inactive students and teachers
    await db.insert(teachersTable)
      .values({
        nip: 'T100',
        full_name: 'Inactive Teacher Only',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: '1980-01-01',
        address: 'Address 100',
        phone: '081234567890',
        email: 'teacher100@test.com',
        subject: 'Math',
        user_id: null,
        is_active: false
      })
      .execute();

    await db.insert(studentsTable)
      .values({
        nis: 'S100',
        nisn: '1100',
        full_name: 'Inactive Student Only',
        gender: 'L',
        birth_place: 'Jakarta',
        birth_date: '2006-01-01',
        address: 'Student Address 100',
        phone: '081111111100',
        parent_name: 'Parent 100',
        parent_phone: '082111111100',
        origin_school: 'smp_darul_muttaqien',
        entry_year: 2024,
        class_id: classId,
        is_active: false
      })
      .execute();

    const result = await getDashboardStats();

    // Total counts should be 0 for inactive records
    expect(result.total_students).toEqual(0);
    expect(result.total_teachers).toEqual(0);
    
    // But origin school counts include all students (active and inactive)
    expect(result.students_from_smp).toEqual(1);
    expect(result.students_from_mts).toEqual(0);
    expect(result.students_from_other).toEqual(0);
  });

  it('should return correct distribution of students by origin school', async () => {
    // Create test class first
    const classResult = await db.insert(classesTable)
      .values({
        name: 'XII-C',
        grade: 3,
        academic_year: '2024/2025',
        homeroom_teacher_id: null,
        is_active: true
      })
      .returning()
      .execute();

    const classId = classResult[0].id;

    // Create students with various origin schools
    await db.insert(studentsTable)
      .values([
        // 5 from SMP Darul Muttaqien
        {
          nis: 'S201',
          nisn: '1201',
          full_name: 'SMP Student 1',
          gender: 'L',
          birth_place: 'Jakarta',
          birth_date: '2005-01-01',
          address: 'Address 201',
          phone: '081201111111',
          parent_name: 'Parent 201',
          parent_phone: '082201111111',
          origin_school: 'smp_darul_muttaqien',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S202',
          nisn: '1202',
          full_name: 'SMP Student 2',
          gender: 'P',
          birth_place: 'Bandung',
          birth_date: '2005-02-01',
          address: 'Address 202',
          phone: '081202111111',
          parent_name: 'Parent 202',
          parent_phone: '082202111111',
          origin_school: 'smp_darul_muttaqien',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S203',
          nisn: '1203',
          full_name: 'SMP Student 3',
          gender: 'L',
          birth_place: 'Surabaya',
          birth_date: '2005-03-01',
          address: 'Address 203',
          phone: '081203111111',
          parent_name: 'Parent 203',
          parent_phone: '082203111111',
          origin_school: 'smp_darul_muttaqien',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S204',
          nisn: '1204',
          full_name: 'SMP Student 4',
          gender: 'P',
          birth_place: 'Medan',
          birth_date: '2005-04-01',
          address: 'Address 204',
          phone: '081204111111',
          parent_name: 'Parent 204',
          parent_phone: '082204111111',
          origin_school: 'smp_darul_muttaqien',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S205',
          nisn: '1205',
          full_name: 'SMP Student 5',
          gender: 'L',
          birth_place: 'Yogya',
          birth_date: '2005-05-01',
          address: 'Address 205',
          phone: '081205111111',
          parent_name: 'Parent 205',
          parent_phone: '082205111111',
          origin_school: 'smp_darul_muttaqien',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        // 3 from MTS
        {
          nis: 'S301',
          nisn: '1301',
          full_name: 'MTS Student 1',
          gender: 'P',
          birth_place: 'Jakarta',
          birth_date: '2005-06-01',
          address: 'Address 301',
          phone: '081301111111',
          parent_name: 'Parent 301',
          parent_phone: '082301111111',
          origin_school: 'mts',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S302',
          nisn: '1302',
          full_name: 'MTS Student 2',
          gender: 'L',
          birth_place: 'Bandung',
          birth_date: '2005-07-01',
          address: 'Address 302',
          phone: '081302111111',
          parent_name: 'Parent 302',
          parent_phone: '082302111111',
          origin_school: 'mts',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S303',
          nisn: '1303',
          full_name: 'MTS Student 3',
          gender: 'P',
          birth_place: 'Surabaya',
          birth_date: '2005-08-01',
          address: 'Address 303',
          phone: '081303111111',
          parent_name: 'Parent 303',
          parent_phone: '082303111111',
          origin_school: 'mts',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        // 2 from other schools
        {
          nis: 'S401',
          nisn: '1401',
          full_name: 'Other Student 1',
          gender: 'L',
          birth_place: 'Medan',
          birth_date: '2005-09-01',
          address: 'Address 401',
          phone: '081401111111',
          parent_name: 'Parent 401',
          parent_phone: '082401111111',
          origin_school: 'luar_smp_darul_muttaqien',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        },
        {
          nis: 'S402',
          nisn: '1402',
          full_name: 'Other Student 2',
          gender: 'P',
          birth_place: 'Yogya',
          birth_date: '2005-10-01',
          address: 'Address 402',
          phone: '081402111111',
          parent_name: 'Parent 402',
          parent_phone: '082402111111',
          origin_school: 'luar_smp_darul_muttaqien',
          entry_year: 2023,
          class_id: classId,
          is_active: true
        }
      ])
      .execute();

    const result = await getDashboardStats();

    expect(result.total_students).toEqual(10);
    expect(result.students_from_smp).toEqual(5);
    expect(result.students_from_mts).toEqual(3);
    expect(result.students_from_other).toEqual(2);
    
    // Verify the sum equals total students
    const sumByOrigin = result.students_from_smp + result.students_from_mts + result.students_from_other;
    expect(sumByOrigin).toEqual(result.total_students);
  });
});