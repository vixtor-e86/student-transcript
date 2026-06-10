import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Transcript, UploadFormData } from '@/types/transcript';

export function useTranscriptDB() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Map Supabase snake_case to our camelCase types
      const mappedData: Transcript[] = (data || []).map((t: any) => ({
        id: t.id,
        matricNumber: t.matric_number,
        studentName: t.student_name,
        department: t.department,
        faculty: t.faculty,
        level: t.level,
        cgpa: t.cgpa,
        session: t.academic_session,
        fileName: t.file_name,
        fileType: t.file_type,
        fileUrl: t.file_url,
        uploadedAt: t.uploaded_at,
        fileSize: t.file_size,
      }));

      setTranscripts(mappedData);
    } catch (error) {
      console.error('Supabase fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTranscript = useCallback(
    async (formData: UploadFormData, file: File): Promise<Transcript> => {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.matricNumber.replace(/\//g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Transcript')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('Transcript')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // 3. Save Record to Database
      const { data: insertData, error: dbError } = await supabase
        .from('transcripts')
        .insert([
          {
            matric_number: formData.matricNumber,
            student_name: formData.studentName,
            department: formData.department,
            faculty: formData.faculty,
            level: formData.level,
            cgpa: formData.cgpa,
            academic_session: formData.session,
            file_name: file.name,
            file_type: file.type,
            file_url: fileUrl,
            file_size: file.size,
          },
        ])
        .select()
        .single();

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      const newTranscript: Transcript = {
        id: insertData.id,
        matricNumber: insertData.matric_number,
        studentName: insertData.student_name,
        department: insertData.department,
        faculty: insertData.faculty,
        level: insertData.level,
        cgpa: insertData.cgpa,
        session: insertData.academic_session,
        fileName: insertData.file_name,
        fileType: insertData.file_type,
        fileUrl: insertData.file_url,
        uploadedAt: insertData.uploaded_at,
        fileSize: insertData.file_size,
      };

      setTranscripts(prev => [newTranscript, ...prev]);
      return newTranscript;
    },
    []
  );

  const deleteTranscript = useCallback(async (id: string) => {
    // Note: In a real app, you'd also delete the file from Storage
    const { error } = await supabase.from('transcripts').delete().eq('id', id);
    if (error) throw error;
    setTranscripts(prev => prev.filter(t => t.id !== id));
  }, []);

  const downloadTranscript = useCallback((transcript: Transcript) => {
    window.open(transcript.fileUrl, '_blank');
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
    totalSize: transcripts.reduce((acc, t) => acc + (t.fileSize || 0), 0),
    lastUpload: transcripts.length > 0 ? transcripts[0].uploadedAt : null,
  }), [transcripts]);

  return { 
    transcripts, 
    isLoading, 
    refresh, 
    addTranscript, 
    findByMatricNumber, 
    deleteTranscript, 
    downloadTranscript, 
    searchTranscripts, 
    getStats 
  };
}
