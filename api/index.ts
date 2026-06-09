import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

export const config = {
  // Use standard Node.js runtime but Web API signature
  runtime: 'nodejs',
};

const STORAGE_KEY = 'fedpolynas_transcripts';

export default async function handler(request: Request) {
  // CORS Headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // 1. Diagnostic Check: Ensure Environment Variables are Present
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.KV_URL) {
    console.error('MISSING TOKENS: BLOB or KV not connected.');
    return new Response(
      JSON.stringify({ 
        error: 'Storage not connected', 
        details: 'Please go to Vercel Dashboard -> Storage and connect KV and Blob to this project.',
        diag: { blob: !!process.env.BLOB_READ_WRITE_TOKEN, kv: !!process.env.KV_URL }
      }),
      { status: 500, headers }
    );
  }

  try {
    // 2. GET: Fetch all transcripts
    if (request.method === 'GET') {
      const transcripts = (await kv.get(STORAGE_KEY)) || [];
      return new Response(JSON.stringify(transcripts), { status: 200, headers });
    }

    // 3. POST: Upload new transcript (Base64)
    if (request.method === 'POST') {
      const body = await request.json();
      const { 
        matricNumber, studentName, department, faculty, level, 
        cgpa, session, file, fileName, fileType 
      } = body;

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file data received' }), { status: 400, headers });
      }

      // Convert Base64 back to Buffer for @vercel/blob
      const base64Data = file.includes(',') ? file.split(',')[1] : file;
      const buffer = Buffer.from(base64Data, 'base64');

      // 3.1 Upload to Vercel Blob
      const blob = await put(`transcripts/${matricNumber || 'temp'}-${Date.now()}-${fileName}`, buffer, {
        access: 'public',
        contentType: fileType || 'application/pdf',
      });

      // 3.2 Create Record
      const newTranscript = {
        id: `trs_${Date.now()}`,
        matricNumber: matricNumber || 'Unknown',
        studentName: studentName || 'Unknown',
        department: department || '',
        faculty: faculty || '',
        level: level || '',
        cgpa: cgpa || '',
        session: session || '',
        fileName: fileName || 'transcript.pdf',
        fileType: fileType || 'application/pdf',
        fileUrl: blob.url,
        uploadedAt: new Date().toISOString(),
        fileSize: buffer.length,
      };

      // 3.3 Update KV
      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      transcripts.push(newTranscript);
      await kv.set(STORAGE_KEY, transcripts);

      return new Response(JSON.stringify(newTranscript), { status: 200, headers });
    }

    // 4. DELETE: Remove transcript
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      
      if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400, headers });

      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      const updated = transcripts.filter((t: any) => t.id !== id);
      await kv.set(STORAGE_KEY, updated);

      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }), 
      { status: 500, headers }
    );
  }
}
