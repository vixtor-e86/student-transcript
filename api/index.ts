import { handleUpload } from '@vercel/blob';
import { kv } from '@vercel/kv';

const STORAGE_KEY = 'fedpolynas_transcripts';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Check Environment Variables
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.KV_URL) {
    console.error('Environment variables missing: BLOB_READ_WRITE_TOKEN or KV_URL');
    return res.status(500).json({ error: 'Storage configuration missing' });
  }

  try {
    const { action } = req.query;

    // 1. GET: Fetch all transcripts
    if (req.method === 'GET') {
      const transcripts = (await kv.get(STORAGE_KEY)) || [];
      return res.status(200).json(transcripts);
    }

    // 2. POST: Upload Token or Save Metadata
    if (req.method === 'POST') {
      // CASE A: Client-side upload token request
      if (action === 'upload') {
        try {
          const jsonResponse = await handleUpload({
            body: req.body,
            request: req,
            onBeforeGenerateToken: async () => {
              return {
                allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
                tokenPayload: JSON.stringify({}),
              };
            },
            onUploadCompleted: async ({ blob }) => {
              console.log('Blob upload completed successfully:', blob.url);
            },
          });
          return res.status(200).json(jsonResponse);
        } catch (error: any) {
          console.error('handleUpload error:', error);
          return res.status(400).json({ error: error.message });
        }
      }

      // CASE B: Save metadata to KV after successful blob upload
      const { 
        matricNumber, studentName, department, faculty, level, 
        cgpa, session, fileUrl, fileName, fileType, fileSize 
      } = req.body;

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
        fileUrl: fileUrl,
        uploadedAt: new Date().toISOString(),
        fileSize: fileSize || 0,
      };

      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      transcripts.push(newTranscript);
      await kv.set(STORAGE_KEY, transcripts);

      return res.status(200).json(newTranscript);
    }

    // 3. DELETE: Remove transcript
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });

      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      const updated = transcripts.filter((t: any) => t.id !== id);
      await kv.set(STORAGE_KEY, updated);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Runtime Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
