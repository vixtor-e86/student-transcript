import { useState, useCallback } from 'react';
import {
  Search,
  Download,
  FileText,
  User,
  Building2,
  GraduationCap,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranscriptDB } from '@/hooks/useTranscriptDB';
import SineWaveTextHelix from '@/components/helix/SineWaveTextHelix';
import type { Transcript } from '@/types/transcript';

export default function Student() {
  const { findByMatricNumber, downloadTranscript } = useTranscriptDB();
...
  return (
    <div className="relative min-h-screen bg-moss">
      {/* WebGL Helix Background */}
      <SineWaveTextHelix />

      <div className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest/10 mb-5">
              <GraduationCap className="w-8 h-8 text-forest" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-forest mb-6">
              Student Portal
            </h1>
            <p className="text-olive max-w-md mx-auto text-lg">
              Enter your matriculation number to retrieve and download your
              academic transcript securely.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-olive/10 shadow-xl shadow-forest/5 mb-12">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive" />
                <Input
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="Enter your matric number"
                  className="pl-12 py-7 bg-white/50 border-olive/20 focus:border-forest focus:ring-forest/20 text-lg rounded-xl"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !matricNumber.trim()}
                className="bg-forest hover:bg-forest/90 text-sage rounded-xl px-10 py-7 text-base font-medium tracking-wide disabled:opacity-50 shadow-lg shadow-forest/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Search Records
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-sm text-olive/60 mt-4 text-center">
              Your matric number is located on your student ID card.
            </p>
          </div>

          {/* Result - Not Found */}
...
        {result && !result.found && (
          <div className="bg-red-50/80 border border-red-200 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Transcript Not Found
              </h3>
              <p className="text-sm text-red-600">{result.message}</p>
            </div>
          </div>
        )}

        {/* Result - Found */}
        {result?.found && result.transcript && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success Banner */}
            <div className="bg-forest/10 border border-forest/20 rounded-xl p-5 flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-forest shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-forest">
                  Transcript Found
                </h3>
                <p className="text-xs text-olive">
                  Academic record for {result.transcript.studentName} retrieved
                  successfully.
                </p>
              </div>
            </div>

            {/* Student Details Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-olive/10 overflow-hidden">
              <div className="p-6 border-b border-olive/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-forest flex items-center justify-center">
                    <User className="w-7 h-7 text-sage" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-forest">
                      {result.transcript.studentName}
                    </h2>
                    <p className="text-sm text-olive">
                      {result.transcript.matricNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-forest" />
                    </div>
                    <div>
                      <span className="text-xs text-olive uppercase tracking-[0.1em]">
                        Department
                      </span>
                      <p className="text-sm font-medium text-forest mt-0.5">
                        {result.transcript.department || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-forest" />
                    </div>
                    <div>
                      <span className="text-xs text-olive uppercase tracking-[0.1em]">
                        Faculty
                      </span>
                      <p className="text-sm font-medium text-forest mt-0.5">
                        {result.transcript.faculty || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <span className="text-xs text-olive uppercase tracking-[0.1em]">
                        CGPA
                      </span>
                      <p className="text-sm font-medium text-forest mt-0.5">
                        {result.transcript.cgpa || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <span className="text-xs text-olive uppercase tracking-[0.1em]">
                        Session
                      </span>
                      <p className="text-sm font-medium text-forest mt-0.5">
                        {result.transcript.session || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-forest" />
                    </div>
                    <div>
                      <span className="text-xs text-olive uppercase tracking-[0.1em]">
                        File
                      </span>
                      <p className="text-sm font-medium text-forest mt-0.5 truncate max-w-[200px]">
                        {result.transcript.fileName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-forest" />
                    </div>
                    <div>
                      <span className="text-xs text-olive uppercase tracking-[0.1em]">
                        Uploaded
                      </span>
                      <p className="text-sm font-medium text-forest mt-0.5">
                        {new Date(
                          result.transcript.uploadedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Action */}
              <div className="p-6 border-t border-olive/10 bg-forest/[0.02]">
                <Button
                  onClick={() => downloadTranscript(result.transcript!)}
                  className="w-full bg-forest hover:bg-forest/90 text-sage rounded-full py-6 text-sm font-medium tracking-wide"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Transcript
                </Button>
                <p className="text-xs text-olive/60 text-center mt-3">
                  File size: {formatBytes(result.transcript.fileSize)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!result && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Enter Matric Number',
                desc: 'Type your unique matriculation number in the search field above.',
              },
              {
                step: '02',
                title: 'Search Records',
                desc: 'The system checks the centralized database for your academic records.',
              },
              {
                step: '03',
                title: 'Download Transcript',
                desc: 'Once found, view your details and download your transcript instantly.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-olive/10"
              >
                <span className="text-xs font-medium text-gold tracking-[0.15em]">
                  STEP {item.step}
                </span>
                <h3 className="text-sm font-medium text-forest mt-2 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-olive leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
