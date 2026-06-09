import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { Transcript } from '../src/types/transcript.js';

const STORAGE_KEY = 'fedpolynas_transcripts';

export default async function handler(request: Request) {
  const url = new URL(request.url);

  // GET: Fetch all transcripts
  if (request.method === 'GET') {
    try {
      const transcripts = (await kv.get<Transcript[]>(STORAGE_KEY)) || [];
      return new Response(JSON.stringify(transcripts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500 });
    }
  }

  // POST: Upload new transcript
  if (request.method === 'POST') {
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
        return new Response(JSON.stringify({ error: 'No file' }), { status: 400 });
      }

      // 1. Upload file to Vercel Blob
      const blob = await put(`transcripts/${matricNumber}-${file.name}`, file, {
        access: 'public',
      });

      // 2. Save metadata to KV
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

      const transcripts = (await kv.get<Transcript[]>(STORAGE_KEY)) || [];
      transcripts.push(newTranscript);
      await kv.set(STORAGE_KEY, transcripts);

      return new Response(JSON.stringify(newTranscript), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }

  // DELETE: Remove transcript
  if (request.method === 'DELETE') {
    try {
      const id = url.searchParams.get('id');
      if (!id) return new Response('Missing ID', { status: 400 });

      const transcripts = (await kv.get<Transcript[]>(STORAGE_KEY)) || [];
      const updated = transcripts.filter((t) => t.id !== id);
      await kv.set(STORAGE_KEY, updated);

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      return new Response('Delete failed', { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
