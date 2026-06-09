import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

const STORAGE_KEY = 'fedpolynas_transcripts';

export default async function handler(req: any, res: any) {
  // 1. GET: Fetch all transcripts
  if (req.method === 'GET') {
    try {
      const transcripts = (await kv.get(STORAGE_KEY)) || [];
      return res.status(200).json(transcripts);
    } catch (error: any) {
      return res.status(500).json({ error: 'Database fetch failed', details: error.message });
    }
  }

  // 2. POST: Upload new transcript (via Base64 JSON)
  if (req.method === 'POST') {
    try {
      const { 
        matricNumber, studentName, department, faculty, level, 
        cgpa, session, file, fileName, fileType 
      } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'No file data received' });
      }

      // Convert Base64 back to Buffer
      // Data URL format: "data:application/pdf;base64,JVBERi0xLjQK..."
      const base64Data = file.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to Vercel Blob
      const blob = await put(`transcripts/${matricNumber}-${fileName}`, buffer, {
        access: 'public',
        contentType: fileType,
      });

      // Create Metadata
      const newTranscript = {
        id: `trs_${Date.now()}`,
        matricNumber: matricNumber || 'Unknown',
        studentName: studentName || 'Unknown',
        department: department || '',
        faculty: faculty || '',
        level: level || '',
        cgpa: cgpa || '',
        session: session || '',
        fileName,
        fileType,
        fileUrl: blob.url,
        uploadedAt: new Date().toISOString(),
        fileSize: buffer.length,
      };

      // Save to KV
      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      transcripts.push(newTranscript);
      await kv.set(STORAGE_KEY, transcripts);

      return res.status(200).json(newTranscript);
    } catch (error: any) {
      return res.status(500).json({ error: 'Upload process failed', details: error.message });
    }
  }

  // 3. DELETE: Remove transcript
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });

      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      const updated = transcripts.filter((t) => t.id !== id);
      await kv.set(STORAGE_KEY, updated);

      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: 'Delete failed', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
