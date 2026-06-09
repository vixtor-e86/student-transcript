import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Search,
  Trash2,
  Download,
  FileText,
  Users,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranscriptDB } from '@/hooks/useTranscriptDB';
import type { Transcript, UploadFormData } from '@/types/transcript';

const ADMIN_PASSWORD = 'Admin0001';
const AUTH_KEY = 'fedpolynas_admin_auth';

const initialForm: UploadFormData = {
  matricNumber: '',
  studentName: '',
  department: '',
  faculty: '',
  level: '',
  cgpa: '',
  session: '',
};

export default function Admin() {
  const {
    addTranscript,
    deleteTranscript,
    downloadTranscript,
    searchTranscripts,
    getStats,
  } = useTranscriptDB();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [form, setForm] = useState<UploadFormData>(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid password. Please try again.');
    }
  };

  const stats = getStats();
  const filteredTranscripts = searchTranscripts(searchQuery);

  const showMessage = useCallback(
    (type: 'success' | 'error', text: string) => {
      setMessage({ type, text });
      setTimeout(() => setMessage(null), 5000);
    },
    []
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) {
        showMessage('error', 'Please select a transcript file to upload');
        return;
      }
      if (!form.matricNumber || !form.studentName) {
        showMessage('error', 'Matric number and student name are required');
        return;
      }
      try {
        await addTranscript(form, file);
        showMessage('success', 'Transcript uploaded successfully');
        setForm(initialForm);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        showMessage('error', err.message || 'Failed to upload transcript');
      }
    },
    [form, file, addTranscript, showMessage]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this transcript?')) {
        try {
          await deleteTranscript(id);
          showMessage('success', 'Transcript deleted');
        } catch (err: any) {
          showMessage('error', err.message || 'Failed to delete transcript');
        }
      }
    },
    [deleteTranscript, showMessage]
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sage flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-olive/10 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-forest" />
            </div>
            <h1 className="text-2xl font-semibold text-forest">Admin Login</h1>
            <p className="text-olive text-sm mt-2">
              Please enter the administrative password to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="py-6 bg-white/50 border-olive/20 focus:border-forest focus:ring-forest/20 text-center text-lg"
                autoFocus
              />
            </div>
            
            {authError && (
              <p className="text-red-500 text-xs text-center font-medium">
                {authError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-forest hover:bg-forest/90 text-sage rounded-xl py-6 text-base font-medium transition-all"
            >
              Unlock Portal
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light text-forest mb-2">
              Admin Portal
            </h1>
            <p className="text-olive">
              Upload and manage student transcripts securely.
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(AUTH_KEY);
              setIsAuthenticated(false);
            }}
            className="text-olive hover:text-forest w-fit"
          >
            Logout
          </Button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 px-5 py-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-forest/10 border border-forest/20 text-forest'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: 'Total Transcripts',
              value: stats.total,
              icon: FileText,
              color: 'text-forest',
            },
            {
              label: 'Students Registered',
              value: stats.total,
              icon: Users,
              color: 'text-gold',
            },
            {
              label: 'Storage Used',
              value: formatBytes(stats.totalSize),
              icon: HardDrive,
              color: 'text-olive',
            },
            {
              label: 'Last Upload',
              value: stats.lastUpload
                ? new Date(stats.lastUpload).toLocaleDateString()
                : 'Never',
              icon: Clock,
              color: 'text-forest',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-olive/10"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-olive uppercase tracking-[0.15em]">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-light text-forest">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-olive/10 sticky top-28">
              <h2 className="text-lg font-medium text-forest mb-5 flex items-center gap-2">
                <Upload className="w-5 h-5 text-gold" />
                Upload Transcript
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-olive uppercase tracking-[0.1em] mb-1.5">
                    Matric Number *
                  </label>
                  <Input
                    value={form.matricNumber}
                    onChange={(e) =>
                      setForm({ ...form, matricNumber: e.target.value })
                    }
                    placeholder="e.g. 18/30GR001"
                    className="bg-transparent border-olive/30 focus:border-forest focus:ring-forest/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-olive uppercase tracking-[0.1em] mb-1.5">
                    Student Name *
                  </label>
                  <Input
                    value={form.studentName}
                    onChange={(e) =>
                      setForm({ ...form, studentName: e.target.value })
                    }
                    placeholder="Full name"
                    className="bg-transparent border-olive/30 focus:border-forest focus:ring-forest/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-olive uppercase tracking-[0.1em] mb-1.5">
                      Department
                    </label>
                    <Input
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                      placeholder="e.g. Computer Science"
                      className="bg-transparent border-olive/30 focus:border-forest focus:ring-forest/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-olive uppercase tracking-[0.1em] mb-1.5">
                      Faculty
                    </label>
                    <Input
                      value={form.faculty}
                      onChange={(e) =>
                        setForm({ ...form, faculty: e.target.value })
                      }
                      placeholder="e.g. Pure & Applied Sciences"
                      className="bg-transparent border-olive/30 focus:border-forest focus:ring-forest/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-olive uppercase tracking-[0.1em] mb-1.5">
                      Level
                    </label>
                    <Input
                      value={form.level}
                      onChange={(e) =>
                        setForm({ ...form, level: e.target.value })
                      }
                      placeholder="e.g. 400L"
                      className="bg-transparent border-olive/30 focus:border-forest focus:ring-forest/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-olive uppercase tracking-[0.1em] mb-1.5">
                      CGPA
                    </label>
                    <Input
                      value={form.cgpa}
                      onChange={(e) =>
                        setForm({ ...form, cgpa: e.target.value })
                      }
                      placeholder="e.g. 4.52"
                      className="bg-transparent border-olive/30 focus:border-forest focus:ring-forest/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-olive uppercase tracking-[0.1em] mb-1.5">
                    Academic Session
                  </label>
                  <Input
                    value={form.session}
                    onChange={(e) =>
                      setForm({ ...form, session: e.target.value })
                    }
                    placeholder="e.g. 2023/2024"
                    className="bg-transparent border-olive/30 focus:border-forest focus:ring-forest/20"
                  />
                </div>

                {/* File Upload Zone */}
                <div>
                  <label className="block text-xs font-medium text-olive uppercase tracking-[0.1em] mb-1.5">
                    Transcript File *
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                      dragActive
                        ? 'border-gold bg-gold/10'
                        : file
                        ? 'border-forest bg-forest/5'
                        : 'border-olive/30 hover:border-olive/60'
                    }`}
                  >
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-forest">
                        <CheckCircle className="w-5 h-5 text-gold" />
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-olive">
                          ({formatBytes(file.size)})
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-olive" />
                        <p className="text-sm text-olive">
                          Drag & drop PDF here, or click to browse
                        </p>
                        <p className="text-xs text-olive/60 mt-1">
                          Supports PDF, JPG, PNG (max 5MB)
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-forest hover:bg-forest/90 text-sage rounded-full py-5 text-sm font-medium tracking-wide"
                >
                  Upload Transcript
                </Button>
              </form>
            </div>
          </div>

          {/* Transcripts List */}
          <div className="lg:col-span-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-olive/10 overflow-hidden">
              <div className="p-5 border-b border-olive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-medium text-forest flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  Uploaded Transcripts
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, matric, dept..."
                    className="pl-9 bg-transparent border-olive/30 focus:border-forest focus:ring-forest/20 w-full sm:w-64"
                  />
                </div>
              </div>

              {filteredTranscripts.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-olive/40" />
                  <p className="text-olive">
                    {searchQuery
                      ? 'No transcripts match your search'
                      : 'No transcripts uploaded yet'}
                  </p>
                  {!searchQuery && (
                    <p className="text-xs text-olive/60 mt-1">
                      Use the form on the left to upload the first transcript
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-olive/10">
                  {filteredTranscripts.map((t: Transcript) => (
                    <div key={t.id}>
                      <div
                        className="p-5 flex items-center justify-between hover:bg-forest/[0.02] transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedId(expandedId === t.id ? null : t.id)
                        }
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-forest" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-forest truncate">
                              {t.studentName}
                            </p>
                            <p className="text-xs text-olive">
                              {t.matricNumber} &middot; {t.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-olive/60 hidden sm:inline">
                            {new Date(t.uploadedAt).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadTranscript(t);
                            }}
                            className="text-olive hover:text-forest hover:bg-forest/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(t.id);
                            }}
                            className="text-olive hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {expandedId === t.id ? (
                            <ChevronUp className="w-4 h-4 text-olive" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-olive" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedId === t.id && (
                        <div className="px-5 pb-5 pl-[4.5rem]">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-olive/60 block mb-0.5">
                                Faculty
                              </span>
                              <span className="text-forest font-medium">
                                {t.faculty || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-olive/60 block mb-0.5">
                                Level
                              </span>
                              <span className="text-forest font-medium">
                                {t.level || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-olive/60 block mb-0.5">
                                CGPA
                              </span>
                              <span className="text-forest font-medium">
                                {t.cgpa || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-olive/60 block mb-0.5">
                                Session
                              </span>
                              <span className="text-forest font-medium">
                                {t.session || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-olive/60 block mb-0.5">
                                File
                              </span>
                              <span className="text-forest font-medium truncate block max-w-[150px]">
                                {t.fileName}
                              </span>
                            </div>
                            <div>
                              <span className="text-olive/60 block mb-0.5">
                                Size
                              </span>
                              <span className="text-forest font-medium">
                                {formatBytes(t.fileSize)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
