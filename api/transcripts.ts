import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import type { Transcript } from '../../src/types/transcript';

const STORAGE_KEY = 'fedpolynas_transcripts';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const matricNumber = formData.get('matricNumber') as string;
    const studentName = formData.get('studentName') as string;
    const department = formData.get('department') as string;
    const faculty = formData.get('faculty') as string;
    const level = formData.get('level') as string;
    const cgpa = formData.get('cgpa') as string;
    const session = formData.get('session') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // 1. Check if student already exists in KV
    const transcripts = (await kv.get<Transcript[]>(STORAGE_KEY)) || [];
    if (transcripts.some(t => t.matricNumber.toLowerCase() === matricNumber.toLowerCase())) {
      return NextResponse.json({ error: 'A transcript for this matric number already exists' }, { status: 400 });
    }

    // 2. Upload to Vercel Blob
    const blob = await put(`transcripts/${matricNumber}-${file.name}`, file, {
      access: 'public',
    });

    // 3. Create record
    const newTranscript: Transcript = {
      id: `trs_${Date.now()}`,
      matricNumber,
      studentName,
      department,
      faculty,
      level,
      cgpa,
      session,
      fileName: file.name,
      fileType: file.type,
      fileUrl: blob.url,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
    };

    // 4. Save to Vercel KV
    transcripts.push(newTranscript);
    await kv.set(STORAGE_KEY, transcripts);

    return NextResponse.json(newTranscript);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload transcript' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const transcripts = (await kv.get<Transcript[]>(STORAGE_KEY)) || [];
    return NextResponse.json(transcripts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 });
  }
}
