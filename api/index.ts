import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

// Inline the type to ensure no import path issues during Vercel deployment
interface Transcript {
  id: string;
  matricNumber: string;
  studentName: string;
  department: string;
  faculty: string;
  level: string;
  cgpa: string;
  session: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
  fileSize: number;
}

const STORAGE_KEY = 'fedpolynas_transcripts';

export default async function handler(request: Request) {
  const url = new URL(request.url);

  // Health check and Env verification
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.KV_URL) {
    return new Response(
      JSON.stringify({ 
        error: 'Environment variables missing. Please connect Vercel Blob and KV in your project dashboard.',
        hasBlob: !!process.env.BLOB_READ_WRITE_TOKEN,
        hasKV: !!process.env.KV_URL
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // GET: Fetch all transcripts
  if (request.method === 'GET') {
    try {
      const transcripts = (await kv.get<Transcript[]>(STORAGE_KEY)) || [];
      return new Response(JSON.stringify(transcripts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: 'KV Fetch failed', details: error.message }), { status: 500 });
    }
  }

  // POST: Upload new transcript
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      // Extract other fields
      const matricNumber = formData.get('matricNumber') as string;
      const studentName = formData.get('studentName') as string;
      const department = formData.get('department') as string;
      const faculty = formData.get('faculty') as string;
      const level = formData.get('level') as string;
      const cgpa = formData.get('cgpa') as string;
      const session = formData.get('session') as string;

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided in request' }), { status: 400 });
      }

      // 1. Upload file to Vercel Blob
      const blob = await put(`transcripts/${matricNumber}-${file.name}`, file, {
        access: 'public',
      });

      // 2. Save metadata to KV
      const newTranscript: Transcript = {
        id: `trs_${Date.now()}`,
        matricNumber: matricNumber || 'Unknown',
        studentName: studentName || 'Unknown',
        department: department || '',
        faculty: faculty || '',
        level: level || '',
        cgpa: cgpa || '',
        session: session || '',
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
      return new Response(
        JSON.stringify({ error: 'Upload process failed', details: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
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
    } catch (error: any) {
      return new Response(JSON.stringify({ error: 'Delete failed', details: error.message }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
