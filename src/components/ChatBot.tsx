import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Bot,
  User,
  Paperclip,
  Mic,
  MicOff,
  Trash2,
} from "lucide-react";
import { claimsApi } from "../api/claims.api";
import { axiosInstance } from "../api/axiosInstance";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "file" | "quick-reply";
  options?: string[];
  tone?: "success" | "error" | "warning" | "info";
}

type MessageTone = "success" | "error" | "warning" | "info";

interface ClaimItem {
  _id?: string;
  claimNumber?: string;
  patientId: { _id: string; firstName?: string; lastName?: string } | { _id: string };
  insuranceId?: { insuranceProvider?: string; policyNumber?: string };
  claimStatus?: string;
  billedAmount?: number;
  submittedDate?: string;
  notes?: string;
  denialReason?: string | null;
}


interface PatientItem {
  _id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant for medical insurance claims. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      type: "quick-reply",
      options: ["Submit a claim", "Check claim status", "Upload documents", "Get help"],
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);




  const fetchClaims = async (): Promise<ClaimItem[]> => {
    try {
      const data = await claimsApi.getAllClaims();
      return data;
    } catch (e) {
      console.warn("fetchClaims failed", e);
      return [];
    }
  };

  const fetchPatientById = async (id: string): Promise<PatientItem | null> => {
    try {
      const res = await axiosInstance.get(`/api/patients/${id}`);
      return res.data?.data ?? null;
    } catch (e) {
      console.warn("Patient fetch failed", id, e);
      return null;
    }
  };

  const getClaimsWithPatientNames = async () => {
    const claims = await fetchClaims();
    if (!claims.length) return [];

    const uniquePatientIds = Array.from(
      new Set(claims.map((c: any) => c.patientId?._id).filter(Boolean))
    );

    const patientMap: Record<string, PatientItem | null> = {};

    await Promise.all(
      uniquePatientIds.map(async (pid) => {
        patientMap[pid] = await fetchPatientById(pid);
      })
    );

    return claims.map((c) => {
      const pid = (c.patientId as any)?._id;
      const p = patientMap[pid] ?? (c.patientId as any);

      const fullName =
        (p?.firstName || p?.lastName)
          ? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()
          : pid;

      return {
        claimId: c._id,
        claimNumber: c.claimNumber ?? c._id,
        patientName: fullName,
        claimStatus: c.claimStatus,
        denialReason: c.denialReason,
      };
    });
  };




  const getBotResponse = async (
    userInput: string
  ): Promise<{ text: string; tone: MessageTone }> => {
    const input = userInput.toLowerCase().trim();




    const claimMatch = userInput.match(/clm[-\w\d]+/i);
    if (claimMatch) {
      const claimNumber = claimMatch[0].toUpperCase();

      const list = await getClaimsWithPatientNames();
      const result = list.find((c) => c.claimNumber === claimNumber);

      if (!result) {
        return {
          tone: "warning",
          text: `⚠️ No claim found with number **${claimNumber}**.`,
        };
      }

      return {
        tone: result.claimStatus === "Rejected" ? "error" : "info",
        text:
          `📄 **Claim Details Found**\n\n` +
          `**Claim:** ${result.claimNumber}\n` +
          `**Patient:** ${result.patientName}\n` +
          `**Status:** ${result.claimStatus}\n` +
          `**Reason:** ${result.denialReason || "—"}`,
      };
    }




    if (input.includes("show claims") || input.includes("claims")) {
      const list = await getClaimsWithPatientNames();

      if (!list.length) {
        return { tone: "info", text: "📋 No claims found." };
      }

      const formatted = list
        .map((l) => `Claim: ${l.claimNumber}\nPatient: ${l.patientName}`)
        .join("\n\n");

      return {
        tone: "info",
        text: `📋 **Here are the claims:**\n\n${formatted}`,
      };
    }


    if (input.includes("duplicate")) {
      return {
        tone: "error",
        text: "❌ Duplicate patient detected. A claim already exists.",
      };
    }

    if (input.includes("help")) {
      return {
        tone: "info",
        text: "Try typing a claim number like **CLM-PND-0002** or **show claims**.",
      };
    }


    return {
      tone: "info",
      text: "I'm here to help! Try **show claims** or enter a claim number.",
    };
  };




  const handleSendMessage = async (text?: string) => {
    const messageText = text ?? inputText;
    if (!messageText.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
      type: attachedFiles.length ? "file" : "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAttachedFiles([]);
    setIsTyping(true);

    const response = await getBotResponse(messageText);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response.text,
          tone: response.tone,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  const handleQuickReply = (option: string) => handleSendMessage(option);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert("Voice recording started... (demo)");
      setTimeout(() => {
        setIsRecording(false);
        setInputText("I need help submitting my medical claim");
      }, 2000);
    }
  };

  const clearChat = () => {
    if (confirm("Clear all chat messages?")) {
      setMessages([
        {
          id: "1",
          text: "Hello! I'm your AI assistant for medical insurance claims. How can I help you today?",
          sender: "bot",
          timestamp: new Date(),
          type: "quick-reply",
          options: ["Submit a claim", "Check claim status", "Upload documents", "Get help"],
        },
      ]);
    }
  };




  return (
    <>
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all z-40"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">MediClaim AI Assistant</h3>
                <p className="text-xs opacity-80">Online • Responds instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={clearChat} className="p-2 hover:bg-white/20 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onToggle} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-2 ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === "user" ? "bg-blue-600" : "bg-white border"
                        }`}
                    >
                      {msg.sender === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-blue-600" />
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-xs whitespace-pre-line 
                        ${msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : msg.tone === "error"
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : msg.tone === "warning"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              : msg.tone === "success"
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-white text-gray-900 border"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>

                {msg.type === "quick-reply" && msg.options && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-10">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(opt)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-2 items-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-end space-x-2">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500">
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                onClick={toggleRecording}
                className={`p-2 ${isRecording ? "text-red-600 bg-red-50" : "text-gray-500"}`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type: CLM-PND-0002"
                className="flex-1 p-3 border rounded-xl"
              />

              <button
                onClick={() => handleSendMessage()}
                className="ml-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-xl"
              >
                Send
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileAttach}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
