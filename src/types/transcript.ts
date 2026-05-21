export interface Transcript {
  id: string;
  matricNumber: string;
  studentName: string;
  department: string;
  faculty: string;
  level: string;
  cgpa: string;
  session: string;
  fileName: string;
  fileType: string;
  fileUrl: string; // URL from Vercel Blob
  uploadedAt: string;
  fileSize: number;
}

export interface UploadFormData {
  matricNumber: string;
  studentName: string;
  department: string;
  faculty: string;
  level: string;
  cgpa: string;
  session: string;
}

export interface SearchResult {
  found: boolean;
  transcript?: Transcript;
  message?: string;
}
