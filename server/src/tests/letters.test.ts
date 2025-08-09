import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { lettersTable } from '../db/schema';
import { type CreateLetterInput } from '../schema';
import { createLetter } from '../handlers/letters';
import { eq } from 'drizzle-orm';

// Simple test input for incoming letter
const testInputMasuk: CreateLetterInput = {
  letter_number: '001/SK/2024',
  letter_type: 'masuk',
  subject: 'Undangan Rapat Koordinasi',
  sender: 'Dinas Pendidikan Provinsi',
  recipient: 'SMA Darul Muttaqien',
  letter_date: new Date('2024-01-15'),
  received_date: new Date('2024-01-16'),
  description: 'Surat undangan untuk menghadiri rapat koordinasi pendidikan',
  file_path: '/uploads/letters/001_sk_2024.pdf'
};

// Test input for outgoing letter
const testInputKeluar: CreateLetterInput = {
  letter_number: '002/OUT/2024',
  letter_type: 'keluar',
  subject: 'Permohonan Izin Kegiatan',
  sender: 'SMA Darul Muttaqien',
  recipient: 'Kepala Dinas Pendidikan',
  letter_date: new Date('2024-01-20'),
  received_date: null,
  description: 'Permohonan izin pelaksanaan kegiatan ekstrakurikuler',
  file_path: null
};

describe('createLetter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an incoming letter (masuk)', async () => {
    const uniqueInput = { ...testInputMasuk, letter_number: '001/MASUK/2024' };
    const result = await createLetter(uniqueInput);

    // Basic field validation
    expect(result.letter_number).toEqual('001/MASUK/2024');
    expect(result.letter_type).toEqual('masuk');
    expect(result.subject).toEqual('Undangan Rapat Koordinasi');
    expect(result.sender).toEqual('Dinas Pendidikan Provinsi');
    expect(result.recipient).toEqual('SMA Darul Muttaqien');
    expect(result.letter_date).toEqual(new Date('2024-01-15'));
    expect(result.received_date).toEqual(new Date('2024-01-16'));
    expect(result.description).toEqual(testInputMasuk.description);
    expect(result.file_path).toEqual('/uploads/letters/001_sk_2024.pdf');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an outgoing letter (keluar)', async () => {
    const uniqueInput = { ...testInputKeluar, letter_number: '002/KELUAR/2024' };
    const result = await createLetter(uniqueInput);

    // Basic field validation
    expect(result.letter_number).toEqual('002/KELUAR/2024');
    expect(result.letter_type).toEqual('keluar');
    expect(result.subject).toEqual('Permohonan Izin Kegiatan');
    expect(result.sender).toEqual('SMA Darul Muttaqien');
    expect(result.recipient).toEqual('Kepala Dinas Pendidikan');
    expect(result.letter_date).toEqual(new Date('2024-01-20'));
    expect(result.received_date).toBeNull();
    expect(result.description).toEqual(testInputKeluar.description);
    expect(result.file_path).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save letter to database', async () => {
    const uniqueInput = { ...testInputMasuk, letter_number: '003/DATABASE/2024' };
    const result = await createLetter(uniqueInput);

    // Query using proper drizzle syntax
    const letters = await db.select()
      .from(lettersTable)
      .where(eq(lettersTable.id, result.id))
      .execute();

    expect(letters).toHaveLength(1);
    expect(letters[0].letter_number).toEqual('003/DATABASE/2024');
    expect(letters[0].letter_type).toEqual('masuk');
    expect(letters[0].subject).toEqual('Undangan Rapat Koordinasi');
    expect(letters[0].sender).toEqual('Dinas Pendidikan Provinsi');
    expect(letters[0].recipient).toEqual('SMA Darul Muttaqien');
    expect(new Date(letters[0].letter_date)).toEqual(new Date('2024-01-15'));
    expect(new Date(letters[0].received_date!)).toEqual(new Date('2024-01-16'));
    expect(letters[0].description).toEqual(testInputMasuk.description);
    expect(letters[0].file_path).toEqual('/uploads/letters/001_sk_2024.pdf');
    expect(letters[0].created_at).toBeInstanceOf(Date);
    expect(letters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const inputWithNulls: CreateLetterInput = {
      letter_number: '004/NULL/2024',
      letter_type: 'masuk',
      subject: 'Test Letter',
      sender: null,
      recipient: null,
      letter_date: new Date('2024-01-25'),
      received_date: null,
      description: null,
      file_path: null
    };

    const result = await createLetter(inputWithNulls);

    expect(result.sender).toBeNull();
    expect(result.recipient).toBeNull();
    expect(result.received_date).toBeNull();
    expect(result.description).toBeNull();
    expect(result.file_path).toBeNull();
    expect(result.letter_number).toEqual('004/NULL/2024');
    expect(result.letter_type).toEqual('masuk');
    expect(result.subject).toEqual('Test Letter');
  });

  it('should throw error when letter number already exists', async () => {
    const uniqueInput = { ...testInputMasuk, letter_number: '005/UNIQUE/2024' };
    
    // Create first letter
    await createLetter(uniqueInput);

    // Attempt to create another letter with the same number
    const duplicateInput: CreateLetterInput = {
      ...uniqueInput,
      subject: 'Different Subject'
    };

    await expect(createLetter(duplicateInput)).rejects.toThrow(/already exists/i);
  });

  it('should create letters with same content but different letter numbers', async () => {
    const firstInput = { ...testInputMasuk, letter_number: '006/FIRST/2024' };
    const firstLetter = await createLetter(firstInput);

    const secondInput: CreateLetterInput = {
      ...testInputMasuk,
      letter_number: '007/SECOND/2024' // Different letter number
    };

    const secondLetter = await createLetter(secondInput);

    expect(firstLetter.id).not.toEqual(secondLetter.id);
    expect(firstLetter.letter_number).toEqual('006/FIRST/2024');
    expect(secondLetter.letter_number).toEqual('007/SECOND/2024');
    expect(firstLetter.subject).toEqual(secondLetter.subject);

    // Verify both exist in database
    const allLetters = await db.select().from(lettersTable).execute();
    expect(allLetters).toHaveLength(2);
  });
});