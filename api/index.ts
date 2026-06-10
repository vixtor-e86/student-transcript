import { handleUpload } from '@vercel/blob/client';
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'nodejs',
};

const STORAGE_KEY = 'fedpolynas_transcripts';

export default async function handler(req: any, res: any) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    // 2. GET: Fetch all transcripts
    if (req.method === 'GET') {
      const transcripts = await kv.get(STORAGE_KEY);
      return res.status(200).json(transcripts || []);
    }

    // 3. POST: Upload Token or Save Metadata
    if (req.method === 'POST') {
      // CASE A: Generate token for client-side upload
      if (action === 'upload') {
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
            console.log('Blob upload completed:', blob.url);
          },
        });
        return res.status(200).json(jsonResponse);
      }

      // CASE B: Save metadata after successful upload
      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      const newEntry = {
        ...req.body,
        id: `trs_${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      transcripts.push(newEntry);
      await kv.set(STORAGE_KEY, transcripts);
      return res.status(200).json(newEntry);
    }

    // 4. DELETE
    if (req.method === 'DELETE') {
      const { id } = req.query;
      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      const updated = transcripts.filter((t: any) => t.id !== id);
      await kv.set(STORAGE_KEY, updated);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
