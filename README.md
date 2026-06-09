# Student Transcript Management System - Federal Polytechnic Nasarawa

A modern, secure, and efficient web application for managing academic transcripts, specifically tailored for Federal Polytechnic Nasarawa. Built for high performance and scalability using the Vercel ecosystem.

## 🚀 Live Features
- **Student Portal:** Instant transcript search via matriculation number with secure download links.
- **Admin Portal:** Secure interface for uploading, managing, and deleting student transcript records.
- **Cloud Infrastructure:**
  - **Metadata:** Managed via Vercel KV (Serverless Redis) for real-time data consistency.
  - **Asset Storage:** PDFs and images are stored securely in Vercel Blob storage with a 5MB per-file limit.
- **Visual Excellence:** High-end aesthetics featuring a WebGL-powered Sine Wave Helix background and responsive design.

## 🛠️ Technology Stack
- **Frontend:** React (TypeScript), Vite, Tailwind CSS.
- **UI Components:** Shadcn/UI (Radix UI), Lucide Icons.
- **Storage:** Vercel Blob (Files), Vercel KV (JSON Metadata).
- **Backend:** Vercel Serverless Functions (Node.js API).

## 📂 Project Structure
```text
├── api/                # Vercel Serverless Functions (Backend API)
├── src/
│   ├── components/     # UI Components & Helix Visualizer
│   ├── hooks/          # useTranscriptDB (Hybrid Cloud/Local Hook)
│   ├── pages/          # Student & Admin Portals
│   └── types/          # TypeScript interfaces
├── public/             # Static assets
└── index.html          # Entry point
```

## ⚙️ Configuration & Deployment

### Local Development
1. **Clone the repo.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the dev server:**
   ```bash
   npm run dev
   ```
   *Note: If no Vercel tokens are found, the app automatically falls back to LocalStorage for development.*

### Production Deployment (Vercel)
1. Push the code to a GitHub repository.
2. Import the project into **Vercel**.
3. Go to the **Storage** tab in your Vercel project dashboard.
4. Create and connect:
   - **Vercel KV** (Database)
   - **Vercel Blob** (File Storage)
5. Vercel will automatically inject the necessary `KV_URL` and `BLOB_READ_WRITE_TOKEN` environment variables.
6. Re-deploy the project.

## 📋 Client Handoff Instructions
To deliver the project to the client, provide them with:
1. The GitHub repository access.
2. The Vercel dashboard access (or transfer the project to their Vercel team).
3. The PDF documentation generated for the project.

---
*Created by [Your Name] — 2026 Final Project*
