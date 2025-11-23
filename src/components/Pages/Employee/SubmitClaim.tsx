import { useState } from "react";
import { Upload, Trash2, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AIProcessingModal from "../../ai/AIProcessingModal";

interface UploadedDoc {
  id: number;
  name: string;
  size: string;
  type: string;
  date: string;
  claimId: string;
  file?: File;
}

interface AIAnalysisResult {
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  processingTime: number;
}

const SubmitClaim: React.FC = () => {
  const [formData, setFormData] = useState({
    claimType: "",
    treatmentDate: "",
    amount: "",
    description: "",
    doctorName: "",
    hospitalName: "",
    policyNumber: ""
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedDoc[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIProcessing, setShowAIProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [generatedClaimId, setGeneratedClaimId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: "Supporting Document",
      date: new Date().toISOString().split("T")[0],
      claimId: "General",
      file
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newId = "CL" + Date.now().toString().slice(-6);
    setGeneratedClaimId(newId);
    setShowAIProcessing(true);
  };

  const handleAIComplete = (result: AIAnalysisResult) => {
    setAiResult(result);
    setShowAIProcessing(false);
    setShowSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setShowSuccess(false);
      setUploadedFiles([]);
      setGeneratedClaimId(null);
      setAiResult(null);
      setFormData({
        claimType: "",
        treatmentDate: "",
        amount: "",
        description: "",
        doctorName: "",
        hospitalName: "",
        policyNumber: ""
      });
    }, 5000);
  };

  return showSuccess ? (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold mb-3">Claim Submitted Successfully!</h2>
        <p className="text-gray-600 mb-6">AI processed your claim with {aiResult?.confidence}% confidence.</p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            Claim ID: <span className="font-mono font-bold text-blue-600">{generatedClaimId}</span>
          </p>
        </div>

        <Link to="/employee/claims" className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg">
          Track Your Claims <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Submit New Claim</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Policy Number *</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Claim Type *</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={formData.claimType}
                onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                required
              >
                <option value="">Select type</option>
                <option value="outpatient">Outpatient</option>
                <option value="inpatient">Inpatient</option>
                <option value="prescription">Prescription Drugs</option>
                <option value="emergency">Emergency Care</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Treatment Date *</label>
              <input
                type="date"
                className="w-full p-3 border rounded-lg"
                value={formData.treatmentDate}
                onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Claim Amount ($) *</label>
              <input
                type="number"
                className="w-full p-3 border rounded-lg"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Treatment Description *</label>
            <textarea
              rows={4}
              className="w-full p-3 border rounded-lg"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Supporting Documents</label>
            <div className="border-2 border-dashed p-8 rounded-lg text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />

              <input type="file" multiple id="claim-files" className="hidden" onChange={handleFileUpload} />
              <label htmlFor="claim-files" className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer inline-flex items-center">
                <Upload className="w-4 h-4 mr-2" /> Choose Files
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>

                    <button type="button" onClick={() => removeFile(file.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isSubmitting ? "Processing..." : "Process with AI"}
            </button>
          </div>

        </form>

        <AIProcessingModal
          isOpen={showAIProcessing}
          onClose={() => setShowAIProcessing(false)}
          claimData={{
            id: generatedClaimId || "temp",
            type: formData.claimType,
            amount: parseFloat(formData.amount) || 0,
            documents: uploadedFiles
          }}
          onComplete={handleAIComplete}
        />
      </div>
    </div>
  );
};

export default SubmitClaim;
