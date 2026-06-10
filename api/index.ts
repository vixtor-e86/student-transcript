import { handleUpload } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  // 1. Set CORS headers manually for maximum compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Check for required environment variables
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.KV_URL) {
    console.error('MISSING ENV VARS: BLOB_READ_WRITE_TOKEN or KV_URL');
    return res.status(500).json({ error: 'Storage not configured in Vercel.' });
  }

  try {
    const { action } = req.query;

    // 3. GET: Fetch all transcripts
    if (req.method === 'GET') {
      const transcripts = await kv.get('fedpolynas_transcripts');
      return res.status(200).json(transcripts || []);
    }

    // 4. POST: Token Generation or Metadata Saving
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
              console.log('Blob upload completed:', blob.url);
            },
          });
          return res.status(200).json(jsonResponse);
        } catch (error: any) {
          console.error('handleUpload error:', error.message);
          return res.status(400).json({ error: error.message });
        }
      }

      // CASE B: Save metadata to KV
      const transcripts: any[] = (await kv.get('fedpolynas_transcripts')) || [];
      const newEntry = {
        ...req.body,
        id: `trs_${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      transcripts.push(newEntry);
      await kv.set('fedpolynas_transcripts', transcripts);
      return res.status(200).json(newEntry);
    }

    // 5. DELETE: Remove record
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });

      const transcripts: any[] = (await kv.get('fedpolynas_transcripts')) || [];
      const updated = transcripts.filter((t: any) => t.id !== id);
      await kv.set('fedpolynas_transcripts', updated);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Runtime API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
