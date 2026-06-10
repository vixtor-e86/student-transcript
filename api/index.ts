import { handleUpload, type HandleUploadBody } from '@vercel/blob';
import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const STORAGE_KEY = 'fedpolynas_transcripts';

export default async function handler(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 1. GET: Fetch all transcripts
    if (request.method === 'GET') {
      const transcripts = await kv.get(STORAGE_KEY);
      return new Response(JSON.stringify(transcripts || []), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. POST: Token or Metadata
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
          return new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Save metadata
      const body = await request.json();
      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      const newEntry = {
        ...body,
        id: `trs_${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      transcripts.push(newEntry);
      await kv.set(STORAGE_KEY, transcripts);

      return new Response(JSON.stringify(newEntry), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. DELETE
    if (request.method === 'DELETE') {
      const id = searchParams.get('id');
      const transcripts: any[] = (await kv.get(STORAGE_KEY)) || [];
      const updated = transcripts.filter((t: any) => t.id !== id);
      await kv.set(STORAGE_KEY, updated);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Edge API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
