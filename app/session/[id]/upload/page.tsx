'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileAudio, Loader2, ArrowRight, X, ArrowLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.webm'] },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/bhashini/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      toast.success('Transcription complete!');
      router.push(`/session/${sessionId}/processing`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Upload Interview Recording</h1>
      
      <Card className={`border-2 border-dashed transition-all ${
        isDragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200'
      }`}>
        <CardContent className="p-12 text-center">
          {!file ? (
            <div {...getRootProps()} className="cursor-pointer space-y-4">
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-semibold">Drag & drop audio file here</p>
                <p className="text-sm text-slate-500">Supports MP3, WAV, M4A, WebM (Max 25MB)</p>
              </div>
              <Button variant="outline">Browse Files</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                <FileAudio className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-semibold">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="ghost" onClick={() => setFile(null)} className="text-red-500">
                  <X className="w-4 h-4 mr-2" /> Remove
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700" 
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Transcribe & Extract
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
