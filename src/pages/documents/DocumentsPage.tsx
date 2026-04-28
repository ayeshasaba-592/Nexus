import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, CheckCircle, Eye, X, RotateCcw } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import API from '../../services/api';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Signature States
  const [isSigningId, setIsSigningId] = useState<string | null>(null);
  const sigCanvas = useRef<any>(null); // Ref for the signature pad

  // Metadata Calculations
  const totalSize = documents.reduce((acc, d) => acc + (d.fileSize || 500000), 0); 
  const usagePercent = Math.min((totalSize / (10 * 1024 * 1024)) * 100, 100); 

  const fetchDocs = async () => {
    try {
      const res = await API.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error("Fetch error");
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      return alert("Please upload a PDF for proper preview rendering.");
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', file.name);

    try {
      setUploading(true);
      await API.post('/documents/upload', formData);
      fetchDocs();
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSign = async (id: string) => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      return alert("Please provide a signature first.");
    }

    try {
      const canvas = sigCanvas.current.getCanvas();
      const signatureImage = canvas.toDataURL('image/png');

      await API.put(`/documents/sign/${id}`, { signatureImage });
      
      setIsSigningId(null);
      fetchDocs();
      alert("Signed successfully!");
    } catch (err) {
      console.error("Signing error:", err);
      alert("Signing failed. Check backend console.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this document?")) return;
    try {
      await API.delete(`/documents/${id}`);
      fetchDocs();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6 p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Document Vault</h1>
          <p className="text-gray-500 mb-4">Secure Processing & Metadata Chamber</p>
          
          {/* Storage Metadata Visualization */}
          <div className="w-64 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
              <span>Vault Storage</span>
              <span>{usagePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
        </div>
        
        <input type="file" id="d-up" className="hidden" onChange={handleUpload} accept=".pdf" />
        <Button onClick={() => document.getElementById('d-up')?.click()} disabled={uploading}>
          <Upload size={18} className="mr-2" /> {uploading ? "Uploading..." : "Upload Documents"}
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No assets found in the processing chamber.</p>
          </div>
        ) : (
          documents.map(doc => (
            <Card key={doc._id} className="overflow-hidden border-l-4 border-l-blue-600 shadow-sm transition-all hover:shadow-md">
              <CardBody className="p-0">
                <div className="flex items-center p-4">
                  <div className={`p-3 rounded-xl mr-4 ${doc.isSigned ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    <FileText size={28} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{doc.title}</h3>
                      <Badge variant={doc.isSigned ? "success" : "warning"}>{doc.status}</Badge>
                    </div>
                    {/* Metadata Section: Name, Version, Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        Uploader: {doc.owner?.name || 'Session User'}
                      </span>
                      <span>•</span>
                      <span>v{doc.version || '1.0'}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* SIGNATURE SECTION */}
                    {!doc.isSigned ? (
                      isSigningId === doc._id ? (
                        <div className="flex flex-col items-end gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 animate-in fade-in">
                          <div className="bg-white border rounded shadow-inner">
                             <SignatureCanvas 
                               ref={sigCanvas}
                               penColor='black'
                               canvasProps={{width: 200, height: 80, className: 'sigCanvas'}} 
                             />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => sigCanvas.current.clear()} className="text-xs text-gray-500 hover:text-red-500 flex items-center">
                              <RotateCcw size={12} className="mr-1"/> Clear
                            </button>
                            <Button size="sm" onClick={() => handleSign(doc._id)}>Save Sign</Button>
                            <X size={18} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setIsSigningId(null)} />
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsSigningId(doc._id)} className="hover:bg-blue-50">
                          <CheckCircle size={16} className="mr-2" /> Sign
                        </Button>
                      )
                    ) : (
                      <div className="text-right pr-6 border-r border-gray-100">
                        <img src={doc.signatureImage} alt="E-Signature" className="h-12 w-auto object-contain mix-blend-multiply" />
                        <p className="text-[8px] text-gray-400 uppercase font-bold tracking-[0.2em]">Verified Signature</p>
                      </div>
                    )}
                    
                    {/* TOOLS SECTION */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(doc.fileUrl)}>
                        <Eye size={20} className="text-gray-500 hover:text-blue-600" />
                      </Button>
                      <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noreferrer" download>
                        <Button variant="ghost" size="sm"><Download size={20} className="text-gray-500 hover:text-green-600" /></Button>
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(doc._id)} className="text-gray-300 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in zoom-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <span className="font-semibold text-gray-600 text-sm">Document Inspection Mode</span>
              <button onClick={() => setPreviewUrl(null)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe src={`http://localhost:5000${previewUrl}`} className="w-full h-full border-none" title="Document Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
