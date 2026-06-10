import { handleUpload } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    // 1. GET: Fetch all transcripts
    if (req.method === 'GET') {
      const transcripts = await kv.get('fedpolynas_transcripts');
      return res.status(200).json(transcripts || []);
    }

    // 2. POST: Token or Metadata
    if (req.method === 'POST') {
      // CASE A: Token generation for @vercel/blob
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

      // CASE B: Save to KV
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

    // 3. DELETE
    if (req.method === 'DELETE') {
      const { id } = req.query;
      const transcripts: any[] = (await kv.get('fedpolynas_transcripts')) || [];
      const updated = transcripts.filter((t: any) => t.id !== id);
      await kv.set('fedpolynas_transcripts', updated);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
