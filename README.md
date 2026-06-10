# Student Transcript Management System - Federal Polytechnic Nasarawa

A modern, secure, and efficient web application for managing academic transcripts, specifically tailored for Federal Polytechnic Nasarawa. Built for high performance and reliability using Supabase for both database and file storage.

## 🚀 Live Features
- **Student Portal:** Instant transcript search via matriculation number with secure download links.
- **Admin Portal:** Secure interface for uploading, managing, and deleting student transcript records.
- **Cloud Infrastructure:**
  - **Database:** Managed via Supabase (PostgreSQL) for secure and scalable student records.
  - **Asset Storage:** PDFs and images are stored securely in Supabase Storage with direct client-side uploads to bypass server limits.
- **Visual Excellence:** High-end aesthetics featuring a WebGL-powered Sine Wave Helix background and responsive design.

## 🛠️ Technology Stack
- **Frontend:** React (TypeScript), Vite, Tailwind CSS.
- **UI Components:** Shadcn/UI (Radix UI), Lucide Icons, Sonner (Toasts).
- **Backend/Storage:** Supabase (Database & Storage).
- **Deployment:** Vercel.

## 📂 Project Structure
```text
├── src/
│   ├── components/     # UI Components & Helix Visualizer
│   ├── hooks/          # useTranscriptDB (Supabase Integration)
│   ├── lib/            # Supabase Client Configuration
│   ├── pages/          # Student & Admin Portals
│   └── types/          # TypeScript interfaces
├── public/             # Static assets
└── index.html          # Entry point
```

## ⚙️ Configuration & Deployment

### Database & Storage Setup (Supabase)
Run the following SQL in your **Supabase SQL Editor** to set up the necessary table and storage bucket:

```sql
-- 1. Create the transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matric_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  department TEXT,
  faculty TEXT,
  level TEXT,
  cgpa TEXT,
  academic_session TEXT,
  file_name TEXT,
  file_type TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the table (Public Access)
CREATE POLICY "Allow public read" ON transcripts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON transcripts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON transcripts FOR DELETE USING (true);

-- 4. Create the storage bucket named 'Transcript'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('Transcript', 'Transcript', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Set up storage policies for the 'Transcript' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'Transcript');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'Transcript');
```

### Production Deployment (Vercel)
1. Push the code to a GitHub repository.
2. Import the project into **Vercel**.
3. **Security Note:** It is highly recommended to move the Supabase URL and Anon Key to Vercel Environment Variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) and update `src/lib/supabase.ts` to use them.
4. Deploy the project.

## 📋 Client Handoff Instructions
To deliver the project to the client, provide them with:
1. The GitHub repository access.
2. The Supabase dashboard access (for database and storage management).
3. The Vercel dashboard access.

---
*Created for Federal Polytechnic Nasarawa — 2026 Final Project*
