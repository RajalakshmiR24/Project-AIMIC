import { useState } from "react";
import { Upload, Trash2, Eye, Download, FileText } from "lucide-react";

interface UploadedDoc {
  id: number;
  name: string;
  size: string;
  date: string;
  type: string;
  claimId: string;
  file?: File;
}

const UploadDocuments: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDoc[]>([
    { id: 1, name: "medical_report.pdf", size: "2.4 MB", date: "2025-01-15", type: "Medical Report", claimId: "CL001" },
    { id: 2, name: "prescription.jpg", size: "1.1 MB", date: "2025-01-10", type: "Prescription", claimId: "CL002" },
    { id: 3, name: "invoice.pdf", size: "856 KB", date: "2025-01-08", type: "Invoice", claimId: "CL003" }
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedDoc[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      date: new Date().toISOString().split("T")[0],
      type: "Supporting Document",
      claimId: selectedClaimId || "General",
      file
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    const newFiles: UploadedDoc[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      date: new Date().toISOString().split("T")[0],
      type: "Supporting Document",
      claimId: selectedClaimId || "General",
      file
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const deleteFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Associate with Claim (Optional)</label>
          <select
            className="w-full md:w-64 p-3 border rounded-lg focus:ring-blue-500"
            value={selectedClaimId}
            onChange={(e) => setSelectedClaimId(e.target.value)}
          >
            <option value="">General Documents</option>
            <option value="CL001">CL001 - Outpatient Treatment</option>
            <option value="CL002">CL002 - Prescription Drugs</option>
            <option value="CL003">CL003 - Emergency Care</option>
          </select>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
            dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Drop files here</h3>
          <p className="text-gray-600 mb-4">or click to browse from your device</p>

          <input type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} id="file-upload" />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span>Choose Files</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Uploaded Documents ({uploadedFiles.length})</h3>
          <button onClick={() => setUploadedFiles([])} className="text-red-600 hover:text-red-700 text-sm flex items-center">
            <Trash2 className="w-4 h-4 mr-1" /> Clear All
          </button>
        </div>

        <div className="p-6">
          {uploadedFiles.length ? (
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">{file.size} • {file.type} • {file.claimId}</p>
                    </div>
                  </div>

                  <button onClick={() => deleteFile(file.id)} className="text-red-600 hover:text-red-700 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No documents uploaded yet</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default UploadDocuments;
