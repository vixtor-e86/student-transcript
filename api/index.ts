import { handleUpload, type HandleUploadBody } from '@vercel/blob';
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'nodejs',
};

const STORAGE_KEY = 'fedpolynas_transcripts';

export default async function handler(request: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Check env vars
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.KV_URL) {
    console.error('Environment variables missing');
    return new Response(
      JSON.stringify({ error: 'Storage configuration missing. Please connect KV and Blob in Vercel.' }),
      { status: 500, headers }
    );
  }

  try {
    // Safe URL parsing
    const host = request.headers.get('host') || 'localhost';
    const url = new URL(request.url, `https://${host}`);
    const action = url.searchParams.get('action');

    // 1. GET: Fetch all transcripts
    if (request.method === 'GET') {
      const transcripts = (await kv.get(STORAGE_KEY)) || [];
      return new Response(JSON.stringify(transcripts), { status: 200, headers });
    }

    // 2. POST: Upload Token or Metadata
    if (request.method === 'POST') {
      if (action === 'upload') {
        const body = (await request.json()) as HandleUploadBody;
        try {
          const jsonResponse = await handleUpload({
            body,
            request,
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
          return new Response(JSON.stringify(jsonResponse), { status: 200, headers });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
        }
      }

      // Save metadata
      const body = await request.json();
      const newTranscript = {
        id: `trs_${Date.now()}`,
        ...body,
        uploadedAt: new Date().toISOString(),
      };

      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      transcripts.push(newTranscript);
      await kv.set(STORAGE_KEY, transcripts);

      return new Response(JSON.stringify(newTranscript), { status: 200, headers });
    }

    // 3. DELETE
    if (request.method === 'DELETE') {
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
