import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Bot,
  User, Trash2,
  Send
} from "lucide-react";
import { axiosInstance } from "../api/axiosInstance";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "html";
  options?: string[];
  tone?: "success" | "error" | "warning" | "info" | "neutral";
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "👋 Hello! I'm <span class='font-bold text-indigo-600'>MediBot</span>, your AI insurance assistant.<br>How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      type: "html",
      tone: "neutral",
      options: ["Check Status", "Analysis", "Bulk Submit All", "Help"],
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<number>(0);
  const [lookupData, setLookupData] = useState<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addBotMessage = (text: string, tone: Message["tone"] = "neutral", options?: string[], type: "text" | "html" = "text") => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender: "bot",
        timestamp: new Date(),
        tone,
        options,
        type: type,
      },
    ]);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text ?? inputText;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      await processInput(messageText);
    } catch (error) {
      console.error(error);
      addBotMessage("Something went wrong. Please try again.", "error");
    } finally {
      setIsTyping(false);
    }
  };

  const processInput = async (input: string) => {
    const lower = input.toLowerCase();


    if (lower === "help") {
      setStep(0);
      const html = `
        <div class="space-y-2">
            <p>I can assist you with:</p>
            <ul class="list-disc pl-4 text-xs text-gray-600 space-y-1">
                <li><b>Check Status</b>: Provide a Reference ID.</li>
                <li><b>Analysis</b>: View real-time charts.</li>
            </ul>
            
            <div class="mt-3 pt-3 border-t border-gray-100">
                <p class="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Test Data (Guidance)</p>
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="navigator.clipboard.writeText('Vivaan Kapoor')" class="text-xs bg-gray-50 hover:bg-gray-100 p-1 rounded text-left border">👤 Vivaan Kapoor <span class="text-[10px] text-gray-400 block">ENT</span></button>
                    <button onclick="navigator.clipboard.writeText('Diya Malhotra')" class="text-xs bg-gray-50 hover:bg-gray-100 p-1 rounded text-left border">👤 Diya Malhotra <span class="text-[10px] text-gray-400 block">Dental</span></button>
                    <button onclick="navigator.clipboard.writeText('Ananya Nair')" class="text-xs bg-red-50 hover:bg-red-100 p-1 rounded text-left border">👤 Ananya Nair <span class="text-[10px] text-red-400 block">Expired</span></button>
                    <button onclick="navigator.clipboard.writeText('Raghav Sharma')" class="text-xs bg-green-50 hover:bg-green-100 p-1 rounded text-left border">👤 Raghav Sharma <span class="text-[10px] text-green-500 block">Happy Path</span></button>
                </div>
            </div>
        </div>
      `;
      addBotMessage(html, "neutral", ["Check Status", "Analysis", "Why Rejected?"], "html");
      return;
    }


    if (lower === "check claim status" || lower === "check status") {
      setStep(2);
      addBotMessage("Please enter the <span class='font-bold text-gray-800'>Reference ID</span> or <span class='font-bold text-gray-800'>Claim Number</span>.", "info", undefined, "html");
      return;
    }

    if (lower.includes("analysis") || lower.includes("chart")) {
      setStep(0);
      await fetchStats();
      return;
    }

    if (lower.includes("why rejected") || lower.includes("view rejected") || lower.includes("mistake")) {
      setStep(0);
      await fetchRejectedAnalysis();
      return;
    }

    if (lower === "bulk submit all" || lower === "submit all") {
      setStep(3);
      const html = `
        <div class="space-y-2">
            <p class="font-bold text-gray-800">Bulk Submit Claims?</p>
            <p class="text-xs text-gray-600">This will automatically submit claims for all "Submitted" medical reports that haven't been claimed yet.</p>
            <p class="text-xs text-blue-600">Are you sure you want to proceed?</p>
        </div>
      `;
      addBotMessage(html, "warning", ["Yes, Submit All", "Cancel"], "html");
      return;
    }

    if (step === 3) {
      if (lower.includes("yes") || lower.includes("submit")) {
        await performBulkSubmit();
      } else {
        addBotMessage("Bulk submission canceled.", "info");
        setStep(0);
      }
      return;
    }

    if (step === 2) {
      if (lower === "exit" || lower === "cancel" || lower === "done") {
        addBotMessage("Exited status check mode.", "info");
        setStep(0);
        return;
      }
      await searchClaim(input.trim());
      return;
    }

    if (step === 1) {
      if (lower.startsWith("y") || lower.includes("proceed") || lower.includes("sure")) {
        await createClaim();
      } else {
        addBotMessage("Action canceled. You can type a <span class='font-bold text-gray-800'>Patient Name</span> to start over.", "info", undefined, "html");
        setStep(0);
        setLookupData(null);
      }
      return;
    }

    if (lower === "cancel") {
      addBotMessage("Nothing to cancel. You can start a <span class='font-bold text-gray-800'>New Claim</span>.", "info", undefined, "html");
      return;
    }
    if (lower === "yes, proceed" || lower === "yes") {
      addBotMessage("No active claim context found. Please click <span class='font-bold text-gray-800'>New Claim</span> to start fresh.", "warning", undefined, "html");
      return;
    }

    await lookupPatient(input);
  };

  const lookupPatient = async (name: string) => {
    try {
      const res = await axiosInstance.post("/api/chatbot/lookup", { patientName: name });
      const data = res.data;

      if (data.found) {
        setLookupData(data);
        const valid = data.validation.valid;

        const html = `
              <div class="space-y-3">
                <div class="flex items-center justify-between border-b pb-2">
                    <span class="text-gray-500 text-xs uppercase tracking-wider">Patient Found</span>
                    <span class="font-bold text-gray-800">${data.patientName}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span class="text-gray-400 text-xs">Billed Amount</span>
                        <p class="font-semibold">₹${data.billedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                        <span class="text-gray-400 text-xs">Eligibility</span>
                        <p class="${valid ? 'text-green-600' : 'text-red-500'} font-bold flex items-center gap-1">
                            ${valid ? '✓ Eligible' : '⚠ Issue Detected'}
                        </p>
                    </div>
                </div>
                ${!valid ? `<div class="bg-red-50 text-red-600 text-xs p-2 rounded border border-red-100">${data.validation.reason}</div>` : ""}
                <div class="pt-2 text-xs text-center text-gray-500">Proceed with claim creation?</div>
              </div>
            `;

        addBotMessage(html, valid ? "success" : "warning", ["Yes, Proceed", "Cancel"], "html");
        setStep(1);
      }
    } catch (e: any) {
      if (e.response?.status === 404) {
        addBotMessage(`⚠️ ${e.response.data.error}`, "warning");
      } else {
        addBotMessage("⚠️ Error looking up patient.", "error");
      }
    }
  };

  const createClaim = async () => {
    if (!lookupData) return;

    try {
      const res = await axiosInstance.post("/api/chatbot/claim", {
        patientId: lookupData.patientId,
        insuranceId: lookupData.insuranceId,
        medicalReportId: lookupData.medicalReportId,
        hospitalUserId: lookupData.hospitalUserId
      });

      const result = res.data;
      const isApproved = result.claimStatus === "Approved";
      const isPending = result.claimStatus === "Pending";

      let colorClass = isApproved ? "green" : (isPending ? "yellow" : "red");
      let icon = isApproved ?
        '<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' :
        (isPending ? '<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' :
          '<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>');

      const html = `
            <div class="text-center p-2">
                <div class="mx-auto w-12 h-12 bg-${colorClass}-100 rounded-full flex items-center justify-center mb-2">
                    ${icon}
                </div>
                <h4 class="font-bold text-gray-800 text-lg mb-1">${isPending ? 'Submission Successful' : (isApproved ? 'Claim Approved!' : 'Claim Rejected')}</h4>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Reference ID</p>
                <p class="text-xs font-mono bg-gray-100 p-1 rounded select-all mb-3 text-gray-600 break-all">${result.claimId || result.claimNumber}</p>
                
                <div class="bg-${colorClass}-50 p-2 rounded text-${colorClass}-800 text-sm font-medium">
                    ${isPending ? 'Status: Pending Review' : (isApproved ? `Approved: ₹${result.approvedAmount.toLocaleString()}` : result.reason)}
                </div>
            </div>
        `;

      addBotMessage(html, isPending ? "info" : (isApproved ? "success" : "error"), ["Check Status", "New Claim"], "html");
      setStep(0);
      setLookupData(null);
    } catch (e) {
      addBotMessage("Failed to create claim.", "error");
    }
  };

  const generateRejectionHtml = (c: any) => {
    let extraHtml = "";
    const fDate = (d: any) => d ? new Date(d).toLocaleDateString() : "N/A";

    if (c.denialReason === "Incorrect patient details" && c.patientId && c.insuranceId?.policyHolder) {
      const p = c.patientId;
      const i = c.insuranceId.policyHolder;

      const nameMatch = p.lastName?.toLowerCase() === i.lastName?.toLowerCase();
      const fNameMatch = p.firstName?.toLowerCase() === i.firstName?.toLowerCase();

      const pDob = fDate(p.dob);
      const iDob = fDate(i.dob);
      const dobMatch = pDob === iDob;

      const pPhone = String(p.phone || "").trim();
      const iPhone = String(c.insuranceId.phone || "").trim();
      const phoneMatch = pPhone === iPhone;

      if (!nameMatch || !dobMatch || !fNameMatch || !phoneMatch) {
        extraHtml = `
            <div class="mt-2 bg-white rounded border overflow-hidden">
                <table class="w-full text-[10px] text-left">
                    <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Field</th><th class="p-1">Patient DB</th><th class="p-1">Insurance Data</th></tr></thead>
                    <tbody>
                        ${!fNameMatch ? `<tr><td class="p-1 font-medium">First Name</td><td class="p-1 text-gray-700">${p.firstName}</td><td class="p-1 text-red-600 font-bold">${i.firstName}</td></tr>` : ""}
                        ${!nameMatch ? `<tr><td class="p-1 font-medium">Last Name</td><td class="p-1 text-gray-700">${p.lastName}</td><td class="p-1 text-red-600 font-bold">${i.lastName}</td></tr>` : ""}
                        ${!dobMatch ? `<tr><td class="p-1 font-medium">DOB</td><td class="p-1 text-gray-700">${pDob}</td><td class="p-1 text-red-600 font-bold">${iDob}</td></tr>` : ""}
                        ${!phoneMatch ? `<tr><td class="p-1 font-medium">Phone</td><td class="p-1 text-gray-700">${pPhone}</td><td class="p-1 text-red-600 font-bold">${iPhone}</td></tr>` : ""}
                    </tbody>
                </table>
            </div>`;
      }
    } else if (c.denialReason === "Time limit expired") {
      const subDate = fDate(c.submittedDate || c.createdAt);
      const servDate = fDate(c.medicalReportId?.serviceDateFrom || c.createdAt);
      extraHtml = `
            <div class="mt-2 bg-white rounded border overflow-hidden">
                <table class="w-full text-[10px] text-left">
                    <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Event</th><th class="p-1">Date</th></tr></thead>
                    <tbody>
                        <tr><td class="p-1 font-medium">Service Date</td><td class="p-1 text-gray-700">${servDate}</td></tr>
                        <tr><td class="p-1 font-medium">Submission Date</td><td class="p-1 text-red-600 font-bold">${subDate}</td></tr>
                        <tr><td class="p-1 font-medium">Limit</td><td class="p-1 text-gray-500">90 Days from Service</td></tr>
                    </tbody>
                </table>
            </div>`;
    } else if (c.denialReason === "Doctor is not in network") {
      const providerName = c.submittedBy?.hospitalProviderData?.[0]?.name || "Unknown Hospital";
      extraHtml = `
            <div class="mt-2 bg-white rounded border overflow-hidden">
                <table class="w-full text-[10px] text-left">
                     <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Provider</th><th class="p-1">Network Status</th></tr></thead>
                     <tbody>
                        <tr><td class="p-1 font-medium">${providerName}</td><td class="p-1 text-red-600 font-bold">OUT OF NETWORK</td></tr>
                        <tr><td colspan="2" class="p-1 text-gray-400 italic">Please visit a participating provider.</td></tr>
                     </tbody>
                </table>
            </div>`;
    } else if (c.denialReason === "Non-covered charges") {
      const codes = c.medicalReportId?.procedureCodes?.map((p: any) => p.cpt).join(", ") || "N/A";
      extraHtml = `
            <div class="mt-2 bg-white rounded border overflow-hidden">
                <table class="w-full text-[10px] text-left">
                     <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Procedure(s)</th><th class="p-1">Plan Status</th></tr></thead>
                     <tbody>
                        <tr><td class="p-1 font-medium">${codes}</td><td class="p-1 text-red-600 font-bold">NOT COVERED</td></tr>
                        <tr><td colspan="2" class="p-1 text-gray-400 italic">Review plan benefits summary.</td></tr>
                     </tbody>
                </table>
            </div>`;
    } else if (c.denialReason === "Medical records not valid") {
      extraHtml = `
            <div class="mt-2 bg-white rounded border overflow-hidden">
                <table class="w-full text-[10px] text-left">
                     <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Submitted</th><th class="p-1">Required</th></tr></thead>
                     <tbody>
                        <tr><td class="p-1 text-gray-700">Generic Report</td><td class="p-1 font-bold">Detailed Lab Results & Diagnosis</td></tr>
                         <tr><td colspan="2" class="p-1 text-red-600 font-bold text-center">INSUFFICIENT PROOF</td></tr>
                     </tbody>
                </table>
            </div>`;
    } else if (c.denialReason === "Patient must renew insurance coverage") {
      const expDate = fDate(c.insuranceId?.expirationDate);
      extraHtml = `
            <div class="mt-2 bg-white rounded border overflow-hidden">
                 <table class="w-full text-[10px] text-left">
                     <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Policy Status</th><th class="p-1">Expiration Date</th></tr></thead>
                     <tbody>
                        <tr><td class="p-1 text-red-600 font-bold">EXPIRED</td><td class="p-1 font-medium">${expDate}</td></tr>
                     </tbody>
                </table>
            </div>`;
    } else if (c.denialReason === "Prior authorization required") {
      const codes = c.medicalReportId?.procedureCodes?.map((p: any) => p.cpt).join(", ") || "Unknown";
      extraHtml = `
            <div class="mt-2 bg-white rounded border overflow-hidden">
                 <table class="w-full text-[10px] text-left">
                     <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Procedure</th><th class="p-1">Auth Status</th></tr></thead>
                     <tbody>
                        <tr><td class="p-1 font-medium">${codes}</td><td class="p-1 text-red-600 font-bold">MISSING</td></tr>
                        <tr><td colspan="2" class="p-1 text-gray-400 italic">Provider listed does not have active pre-auth.</td></tr>
                     </tbody>
                </table>
            </div>`;
    }
    return extraHtml;
  };

  const searchClaim = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/api/chatbot/claims/${id}`);
      const claim = res.data;
      const status = claim.claimStatus;
      let color = status === 'Approved' ? 'text-green-600' : (status === 'Pending' ? 'text-yellow-600' : 'text-red-500');

      let approvedDetails = "";
      if (status === 'Approved') {
        const serviceDate = claim.medicalReportId?.serviceDateFrom ? new Date(claim.medicalReportId.serviceDateFrom).toLocaleDateString() : "N/A";
        approvedDetails = `
            <div class="mt-2 pt-2 border-t border-gray-100">
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div><span class="text-gray-400 block">Patient</span><span class="font-semibold text-gray-700">${claim.patientId?.firstName} ${claim.patientId?.lastName}</span></div>
                    <div><span class="text-gray-400 block">Tx Date</span><span class="font-semibold text-gray-700">${serviceDate}</span></div>
                    <div class="col-span-2 pt-1"><span class="text-gray-400 block">Approved Amount</span><span class="font-bold text-green-600 text-sm">₹${(claim.approvedAmount || 0).toLocaleString()}</span></div>
                </div>
            </div>
           `;
      }

      let rejectionDetails = "";
      if (status === 'Rejected') {
        rejectionDetails = generateRejectionHtml(claim);
      }

      const html = `
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                        <span class="text-lg">📄</span>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 text-sm break-all">${claim.claimNumber || claim._id}</p>
                        <p class="text-xs text-gray-500">Patient: ${claim.patientId?.firstName} (${claim.patientId?.patientCode || "-"})</p>
                        <p class="text-xs text-gray-400">Ins: ${claim.insuranceId?.insuranceId || "-"}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                    <span class="text-gray-500">Status</span>
                    <span class="font-bold ${color} px-2 py-0.5 rounded bg-white shadow-sm border">
                        ${status}
                    </span>
                </div>
                ${approvedDetails}
                ${claim.denialReason ? `<div class="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-100"><strong class="block text-[10px] uppercase text-gray-400 mb-1">Reason</strong>${claim.denialReason}${rejectionDetails}</div>` : ""}
                <p class="text-[10px] text-gray-400 mt-2 italic">Type another ID to check again, or "Exit".</p>
            </div>
         `;
      addBotMessage(html, "info", ["Exit", "New Claim"], "html");
    } catch (e) {
      addBotMessage(`Claim **${id}** not found.`, "warning");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/api/chatbot/stats");
      const { approved, rejected, pending, total } = res.data;

      if (total === 0) {
        addBotMessage("No claims data available yet.", "info");
        return;
      }

      const ap = ((approved / total) * 100);
      const rp = ((rejected / total) * 100);
      const pp = ((pending / total) * 100);

      const pieStyle = `conic-gradient(
              #4ade80 0% ${ap}%, 
              #f87171 ${ap}%, 
              #facc15 ${ap + rp}% 100%
          )`;

      const html = `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h5 class="font-bold text-gray-700">Analytics Dashboard</h5>
                    <span class="text-xs text-gray-400">Real-time</span>
                </div>

                <div class="flex justify-center mb-4 relative">
                    <div class="w-24 h-24 rounded-full border-4 border-white shadow-lg" style="background: ${pieStyle}"></div>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div class="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm">
                            <span class="text-xs font-bold text-gray-500">${total}</span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-green-700 font-medium flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-400"></span> Approved</span>
                            <span class="text-gray-500">${approved} (${ap.toFixed(0)}%)</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div class="bg-green-400 h-1.5 rounded-full" style="width: ${ap}%"></div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-red-700 font-medium flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-400"></span> Rejected</span>
                            <span class="text-gray-500">${rejected} (${rp.toFixed(0)}%)</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div class="bg-red-400 h-1.5 rounded-full" style="width: ${rp}%"></div>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-yellow-700 font-medium flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-400"></span> Pending</span>
                            <span class="text-gray-500">${pending} (${pp.toFixed(0)}%)</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div class="bg-yellow-400 h-1.5 rounded-full" style="width: ${pp}%"></div>
                        </div>
                    </div>
                </div>
            </div>
          `;
      addBotMessage(html, "neutral", ["Check Status", "Analysis", "Why Rejected?"], "html");

    } catch (e) {
      addBotMessage("Could not fetch stats.", "error");
    }
  };

  const fetchRejectedAnalysis = async () => {
    try {
      const res = await axiosInstance.get("/api/chatbot/rejected");
      const claims = res.data;

      if (claims.length === 0) {
        addBotMessage("Good news! No rejected claims found.", "success");
        return;
      }

      const html = `
        <div class="space-y-3">
             <div class="flex items-center justify-between border-b pb-2">
                <span class="font-bold text-red-700">Rejected Claims Analysis</span>
                <span class="text-xs text-gray-400">${claims.length} found</span>
            </div>
            ${claims.map((c: any) => {
        let extraHtml = "";

        const fDate = (d: any) => d ? new Date(d).toLocaleDateString() : "N/A";

        if (c.denialReason === "Incorrect patient details" && c.patientId && c.insuranceId?.policyHolder) {
          const p = c.patientId;
          const i = c.insuranceId.policyHolder;

          const nameMatch = p.lastName?.toLowerCase() === i.lastName?.toLowerCase();
          const fNameMatch = p.firstName?.toLowerCase() === i.firstName?.toLowerCase();

          const pDob = fDate(p.dob);
          const iDob = fDate(i.dob);
          const dobMatch = pDob === iDob;

          const pPhone = String(p.phone || "").trim();
          const iPhone = String(c.insuranceId.phone || "").trim();
          const phoneMatch = pPhone === iPhone;

          if (!nameMatch || !dobMatch || !fNameMatch || !phoneMatch) {
            extraHtml = `
                    <div class="mt-2 bg-white rounded border overflow-hidden">
                        <table class="w-full text-[10px] text-left">
                            <thead class="bg-gray-100 text-gray-600">
                                <tr><th class="p-1">Field</th><th class="p-1">Patient DB</th><th class="p-1">Insurance Data</th></tr>
                            </thead>
                            <tbody>
                                ${!fNameMatch ? `<tr><td class="p-1 font-medium">First Name</td><td class="p-1 text-gray-700">${p.firstName}</td><td class="p-1 text-red-600 font-bold">${i.firstName}</td></tr>` : ""}
                                ${!nameMatch ? `<tr><td class="p-1 font-medium">Last Name</td><td class="p-1 text-gray-700">${p.lastName}</td><td class="p-1 text-red-600 font-bold">${i.lastName}</td></tr>` : ""}
                                ${!dobMatch ? `<tr><td class="p-1 font-medium">DOB</td><td class="p-1 text-gray-700">${pDob}</td><td class="p-1 text-red-600 font-bold">${iDob}</td></tr>` : ""}
                                ${!phoneMatch ? `<tr><td class="p-1 font-medium">Phone</td><td class="p-1 text-gray-700">${pPhone}</td><td class="p-1 text-red-600 font-bold">${iPhone}</td></tr>` : ""}
                            </tbody>
                        </table>
                    </div>`;
          }
        }

        else if (c.denialReason === "Time limit expired") {
          const subDate = fDate(c.submittedDate || c.createdAt);
          const servDate = fDate(c.medicalReportId?.serviceDateFrom || c.createdAt);
          extraHtml = `
                <div class="mt-2 bg-white rounded border overflow-hidden">
                    <table class="w-full text-[10px] text-left">
                        <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Event</th><th class="p-1">Date</th></tr></thead>
                        <tbody>
                            <tr><td class="p-1 font-medium">Service Date</td><td class="p-1 text-gray-700">${servDate}</td></tr>
                            <tr><td class="p-1 font-medium">Submission Date</td><td class="p-1 text-red-600 font-bold">${subDate}</td></tr>
                            <tr><td class="p-1 font-medium">Limit</td><td class="p-1 text-gray-500">90 Days from Service</td></tr>
                        </tbody>
                    </table>
                </div>`;
        }

        else if (c.denialReason === "Doctor is not in network") {
          const providerName = c.submittedBy?.hospitalProviderData?.[0]?.name || "Unknown Hospital";
          extraHtml = `
                <div class="mt-2 bg-white rounded border overflow-hidden">
                    <table class="w-full text-[10px] text-left">
                         <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Provider</th><th class="p-1">Network Status</th></tr></thead>
                         <tbody>
                            <tr>
                                <td class="p-1 font-medium">${providerName}</td>
                                <td class="p-1 text-red-600 font-bold">OUT OF NETWORK</td>
                            </tr>
                            <tr><td colspan="2" class="p-1 text-gray-400 italic">Please visit a participating provider.</td></tr>
                         </tbody>
                    </table>
                </div>`;
        }

        else if (c.denialReason === "Non-covered charges") {
          const codes = c.medicalReportId?.procedureCodes?.map((p: any) => p.cpt).join(", ") || "N/A";
          extraHtml = `
                <div class="mt-2 bg-white rounded border overflow-hidden">
                    <table class="w-full text-[10px] text-left">
                         <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Procedure(s)</th><th class="p-1">Plan Status</th></tr></thead>
                         <tbody>
                            <tr>
                                <td class="p-1 font-medium">${codes}</td>
                                <td class="p-1 text-red-600 font-bold">NOT COVERED</td>
                            </tr>
                            <tr><td colspan="2" class="p-1 text-gray-400 italic">Review plan benefits summary.</td></tr>
                         </tbody>
                    </table>
                </div>`;
        }

        else if (c.denialReason === "Medical records not valid") {
          extraHtml = `
                <div class="mt-2 bg-white rounded border overflow-hidden">
                    <table class="w-full text-[10px] text-left">
                         <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Submitted</th><th class="p-1">Required</th></tr></thead>
                         <tbody>
                            <tr>
                                <td class="p-1 text-gray-700">Generic Report</td>
                                <td class="p-1 font-bold">Detailed Lab Results & Diagnosis</td>
                            </tr>
                             <tr><td colspan="2" class="p-1 text-red-600 font-bold text-center">INSUFFICIENT PROOF</td></tr>
                         </tbody>
                    </table>
                </div>`;
        }

        else if (c.denialReason === "Patient must renew insurance coverage") {
          const expDate = fDate(c.insuranceId?.expirationDate);
          extraHtml = `
                <div class="mt-2 bg-white rounded border overflow-hidden">
                     <table class="w-full text-[10px] text-left">
                         <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Policy Status</th><th class="p-1">Expiration Date</th></tr></thead>
                         <tbody>
                            <tr>
                                <td class="p-1 text-red-600 font-bold">EXPIRED</td>
                                <td class="p-1 font-medium">${expDate}</td>
                            </tr>
                         </tbody>
                    </table>
                </div>`;
        }

        else if (c.denialReason === "Prior authorization required") {
          const codes = c.medicalReportId?.procedureCodes?.map((p: any) => p.cpt).join(", ") || "Unknown";
          extraHtml = `
                <div class="mt-2 bg-white rounded border overflow-hidden">
                     <table class="w-full text-[10px] text-left">
                         <thead class="bg-gray-100 text-gray-600"><tr><th class="p-1">Procedure</th><th class="p-1">Auth Status</th></tr></thead>
                         <tbody>
                            <tr>
                                <td class="p-1 font-medium">${codes}</td>
                                <td class="p-1 text-red-600 font-bold">MISSING</td>
                            </tr>
                            <tr><td colspan="2" class="p-1 text-gray-400 italic">Provider listed does not have active pre-auth.</td></tr>
                         </tbody>
                    </table>
                </div>`;
        }

        return `
                <div class="bg-red-50 p-2 rounded border border-red-100 text-sm">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-bold text-gray-800 break-all">${c.claimNumber || c._id}</span>
                        <span class="text-[10px] text-gray-500 bg-white px-1 rounded border">₹${c.billedAmount}</span>
                    </div>
                    <p class="text-xs text-gray-600 mb-1">
                        Patient: <b>${c.patientId?.firstName} ${c.patientId?.lastName}</b>
                    </p>
                    <div class="text-red-600 text-xs mt-2 bg-white p-2 rounded border-l-2 border-l-red-400">
                        <strong class="block text-[10px] uppercase text-gray-400">Mistake / Reason:</strong>
                        ${c.denialReason || c.notes || "No reason specified."}
                        ${extraHtml}
                    </div>
                </div>
            `;
      }).join('')}
             <p class="text-[10px] text-gray-400 text-center italic mt-2">Showing last ${claims.length}</p>
        </div>
      `;

      addBotMessage(html, "error", ["Analysis", "Check Status"], "html");

    } catch (e) {
      addBotMessage("Error fetching rejected claims.", "error");
    }
  };

  const performBulkSubmit = async () => {
    addBotMessage("Processing bulk submission... Please wait.", "neutral");

    try {
      const res = await axiosInstance.post("/api/chatbot/bulk-submit");
      const { processed, success, failed } = res.data;

      if (processed === 0) {
        addBotMessage("ℹ️ No pending reports found to submit.", "info");
      } else {
        const html = `
                <div class="space-y-2">
                    <h5 class="font-bold text-gray-800">Batch Submission Complete</h5>
                    <div class="grid grid-cols-3 gap-1 text-center text-xs">
                        <div class="bg-blue-50 p-1 rounded">
                            <span class="block font-bold text-blue-600 text-lg">${processed}</span>
                            <span class="text-gray-500">Found</span>
                        </div>
                         <div class="bg-green-50 p-1 rounded">
                            <span class="block font-bold text-green-600 text-lg">${success}</span>
                            <span class="text-gray-500">Success</span>
                        </div>
                         <div class="bg-red-50 p-1 rounded">
                            <span class="block font-bold text-red-600 text-lg">${failed}</span>
                            <span class="text-gray-500">Failed</span>
                        </div>
                    </div>
                    ${failed > 0 ? `<p class="text-xs text-red-500 mt-2">Some claims failed. Check server logs.</p>` : ''}
                </div>
             `;
        addBotMessage(html, "success", ["Check Status", "Analysis"], "html");
      }
      setStep(0);

    } catch (e) {
      console.error(e);
      addBotMessage("⚠️ Bulk submission failed due to a server error.", "error");
      setStep(0);
    }
  };

  const handleQuickReply = (option: string) => handleSendMessage(option);

  const clearChat = () => {
    if (confirm("Clear all chat messages?")) {
      setMessages([messages[0]]);
      setStep(0);
      setLookupData(null);
    }
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-blue-500/25 transition-all z-40 group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden font-sans">

          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide">MediBot AI</h3>
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">Claims Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onToggle} className="p-2 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-5 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in-up">
                <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>

                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm text-xs select-none
                        ${msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-white text-blue-600 border border-gray-100"}`}>
                      {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                    </div>

                    <div className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed
                        ${msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-700 border border-gray-100 rounded-bl-none"
                      }
                        ${msg.tone === 'error' && msg.sender === 'bot' ? 'border-l-4 border-l-red-500' : ''}
                        ${msg.tone === 'success' && msg.sender === 'bot' ? 'border-l-4 border-l-green-500' : ''}
                    `}>
                      {msg.type === "html" ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      )}
                    </div>
                  </div>
                </div>

                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-10">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(opt)}
                        className="text-xs font-medium bg-white text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition shadow-sm hover:shadow"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-gray-400 text-xs ml-10 animate-pulse">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animation-delay-200"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animation-delay-400"></div>
                <span>MediBot is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 px-2 py-1 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">

              <button
                onClick={() => handleSendMessage("help")}
                className="p-2 text-gray-400 hover:text-indigo-600 transition"
                title="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={step === 2 ? "Enter Reference ID..." : "Type your message..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-gray-700 placeholder-gray-400 pl-4"
                autoFocus
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className={`p-2 rounded-lg transition-all ${inputText.trim() ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-300 font-medium">Powered by Secure ClaimCheck AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
