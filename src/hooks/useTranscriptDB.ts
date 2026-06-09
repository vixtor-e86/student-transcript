import { useState, useCallback, useEffect } from 'react';
import type { Transcript, UploadFormData } from '@/types/transcript';

const STORAGE_KEY = 'fedpolynas_transcripts';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Use Cloud API if we are in production (Vercel)
const isLocal = import.meta.env.DEV;

function getStoredTranscripts(): Transcript[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTranscripts(transcripts: Transcript[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transcripts));
}

export function useTranscriptDB() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    if (isLocal) {
      setTranscripts(getStoredTranscripts());
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api');
      if (response.ok) {
        const data = await response.json();
        setTranscripts(data);
      } else {
        const errorText = await response.text();
        console.error('API Fetch error:', response.status, errorText);
        // Try fallback to local if API is down
        setTranscripts(getStoredTranscripts());
      }
    } catch (error) {
      console.error('API Fetch error:', error);
      setTranscripts(getStoredTranscripts()); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTranscript = useCallback(
    async (formData: UploadFormData, file: File): Promise<Transcript> => {
      if (file.size > MAX_FILE_SIZE) throw new Error('File size exceeds 5MB limit');

      // Helper to convert file to Base64
      const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      if (isLocal) {
        const fileData = await toBase64(file);
        const newTranscript: Transcript = {
          id: `trs_${Date.now()}`,
          ...formData,
          fileName: file.name,
          fileType: file.type,
          fileUrl: fileData, // Local Base64
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
        };
        const updated = [...getStoredTranscripts(), newTranscript];
        saveTranscripts(updated);
        setTranscripts(updated);
        return newTranscript;
      }

      // Vercel Logic: Send as JSON with Base64
      try {
        const fileData = await toBase64(file);
        const response = await fetch('/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            file: fileData,
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Upload failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (e) {
            const text = await response.text();
            errorMessage = text || `Server returned ${response.status}`;
          }
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        setTranscripts(prev => [...prev, result]);
        return result;
      } catch (error: any) {
        console.error('Upload Error:', error);
        throw error;
      }
    },
    []
  );

  const deleteTranscript = useCallback(async (id: string) => {
    if (isLocal) {
      const updated = getStoredTranscripts().filter(t => t.id !== id);
      saveTranscripts(updated);
      setTranscripts(updated);
      return;
    }
    await fetch(`/api?id=${id}`, { method: 'DELETE' });
    setTranscripts(prev => prev.filter(t => t.id !== id));
  }, []);

  const downloadTranscript = useCallback((transcript: Transcript) => {
    if (transcript.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = transcript.fileUrl;
      link.download = transcript.fileName;
      link.click();
    } else {
      window.open(transcript.fileUrl, '_blank');
    }
  }, []);

  const findByMatricNumber = useCallback((matricNumber: string) => {
    return transcripts.find(t => t.matricNumber.toLowerCase() === matricNumber.toLowerCase().trim());
  }, [transcripts]);

  const searchTranscripts = useCallback((query: string) => {
    const lower = query.toLowerCase();
    return transcripts.filter(t => 
      t.studentName.toLowerCase().includes(lower) || 
      t.matricNumber.toLowerCase().includes(lower)
    );
  }, [transcripts]);

  const getStats = useCallback(() => ({
    total: transcripts.length,
    totalSize: transcripts.reduce((acc, t) => acc + t.fileSize, 0),
    lastUpload: transcripts.length > 0 ? transcripts[transcripts.length - 1].uploadedAt : null,
  }), [transcripts]);

  return { transcripts, isLoading, refresh, addTranscript, findByMatricNumber, deleteTranscript, downloadTranscript, searchTranscripts, getStats };
}
