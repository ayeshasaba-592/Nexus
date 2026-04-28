import React, { useState, useEffect } from 'react';
import API from '../../services/api'; 
import { Upload, FileText, ExternalLink, CheckCircle, Eye, X } from 'lucide-react';
import { Button } from '../../components/ui/Button'; 
import { Badge } from '../../components/ui/Badge';

export const DocumentVault: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await API.get('/api/documents');
      setDocuments(res.data);
    } catch (err) { console.error("404 check: Backend might not be mounted at /api/documents"); }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);

    try {
      setUploading(true);
      await API.post('/api/documents/upload', formData);
      setFile(null); setTitle(''); fetchDocs();
    } catch (err) { alert("Upload failed. Verify 'backend/uploads' folder exists."); }
    finally { setUploading(false); }
  };

  const handleSign = async (id: string) => {
    try {
      await API.put(`/api/documents/sign/${id}`);
      fetchDocs();
    } catch (err) { alert("Signature failed"); }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="text-blue-600" /> Document Processing Chamber
      </h1>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
        <input type="text" value={title} placeholder="Document Title" className="w-full p-2 border rounded-lg" onChange={(e)=>setTitle(e.target.value)} required />
        <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
          <input type="file" id="f-u" className="hidden" accept=".pdf" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          <label htmlFor="f-u" className="cursor-pointer text-gray-500">
            <Upload className="mx-auto mb-2" />
            {file ? file.name : "Select PDF Document"}
          </label>
        </div>
        <Button type="submit" className="w-full" disabled={uploading}>{uploading ? "Uploading..." : "Secure Upload"}</Button>
      </form>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc._id} className="flex items-center justify-between p-4 bg-white rounded-xl border">
            <div className="flex items-center gap-4">
              <FileText className={doc.isSigned ? "text-green-500" : "text-blue-500"} />
              <div>
                <p className="font-bold text-sm">{doc.title}</p>
                <div className="flex gap-2">
                   <Badge variant={doc.isSigned ? "success" : "warning"}>{doc.status}</Badge>
                   <span className="text-[10px] text-gray-400">v{doc.version}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!doc.isSigned && (
                <Button size="sm" variant="outline" onClick={() => handleSign(doc._id)}>Sign</Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setPreviewUrl(doc.fileUrl)}><Eye size={18} /></Button>
              <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noreferrer"><ExternalLink size={18} /></a>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-bold text-gray-700">Document Inspection</span>
              <X className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setPreviewUrl(null)} />
            </div>
            <iframe src={`http://localhost:5000${previewUrl}`} className="flex-1 w-full rounded-b-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};