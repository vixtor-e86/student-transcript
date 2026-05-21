import { kv } from '@vercel/kv';
import { del as blobDelete } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { Transcript } from '../../src/types/transcript';

const STORAGE_KEY = 'fedpolynas_transcripts';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const transcripts = (await kv.get<Transcript[]>(STORAGE_KEY)) || [];
    const transcriptToDelete = transcripts.find(t => t.id === id);

    if (!transcriptToDelete) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
    }

    // 1. Delete from Vercel Blob
    if (transcriptToDelete.fileUrl) {
      await blobDelete(transcriptToDelete.fileUrl);
    }

    // 2. Delete from Vercel KV
    const updated = transcripts.filter(t => t.id !== id);
    await kv.set(STORAGE_KEY, updated);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete transcript' }, { status: 500 });
  }
}
