import { useState, useCallback, useEffect } from 'react';
import type { Transcript, UploadFormData } from '@/types/transcript';

const API_URL = '/api/transcripts';
const DELETE_URL = '/api/delete';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useTranscriptDB() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTranscripts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setTranscripts(data);
      }
    } catch (error) {
      console.error('Failed to fetch transcripts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);

  const addTranscript = useCallback(
    async (formData: UploadFormData, file: File): Promise<Transcript> => {
      if (!file) throw new Error('No file provided');
      if (file.size > MAX_FILE_SIZE) throw new Error('File size exceeds 5MB limit');

      const data = new FormData();
      data.append('file', file);
      data.append('matricNumber', formData.matricNumber);
      data.append('studentName', formData.studentName);
      data.append('department', formData.department);
      data.append('faculty', formData.faculty);
      data.append('level', formData.level);
      data.append('cgpa', formData.cgpa);
      data.append('session', formData.session);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload transcript');
      }

      const newTranscript = await response.json();
      setTranscripts((prev) => [...prev, newTranscript]);
      return newTranscript;
    },
    []
  );

  const findByMatricNumber = useCallback((matricNumber: string) => {
    return transcripts.find(
      (t) => t.matricNumber.toLowerCase() === matricNumber.toLowerCase().trim()
    );
  }, [transcripts]);

  const deleteTranscript = useCallback(async (id: string) => {
    const response = await fetch(`${DELETE_URL}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete transcript');
    }

    setTranscripts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const downloadTranscript = useCallback((transcript: Transcript) => {
    window.open(transcript.fileUrl, '_blank');
  }, []);

  const searchTranscripts = useCallback((query: string) => {
    if (!query.trim()) return transcripts;
    const lower = query.toLowerCase();
    return transcripts.filter(
      (t) =>
        t.studentName.toLowerCase().includes(lower) ||
        t.matricNumber.toLowerCase().includes(lower) ||
        t.department.toLowerCase().includes(lower)
    );
  }, [transcripts]);

  const getStats = useCallback(() => {
    return {
      total: transcripts.length,
      totalSize: transcripts.reduce((acc, t) => acc + t.fileSize, 0),
      lastUpload: transcripts.length > 0 ? transcripts[transcripts.length - 1].uploadedAt : null,
    };
  }, [transcripts]);

  return {
    transcripts,
    isLoading,
    refresh: fetchTranscripts,
    addTranscript,
    findByMatricNumber,
    deleteTranscript,
    downloadTranscript,
    searchTranscripts,
    getStats,
  };
}
