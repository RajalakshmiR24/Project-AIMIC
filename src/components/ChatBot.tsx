import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Paperclip, Mic, MicOff, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'file' | 'quick-reply';
  options?: string[];
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant for medical insurance claims. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'quick-reply',
      options: ['Submit a claim', 'Check claim status', 'Upload documents', 'Get help']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: attachedFiles.length > 0 ? 'file' : 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachedFiles([]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(messageText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (option: string) => {
    handleSendMessage(option);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('submit') || input.includes('claim')) {
      return 'To submit a claim:\n\n1. Go to Employee Portal\n2. Click "Submit New Claim"\n3. Fill out the form with treatment details\n4. Upload required documents (medical reports, invoices)\n5. Submit for AI processing\n\nRequired documents: Medical report, treatment invoice, prescription (if applicable). Would you like me to guide you through the process?';
    } else if (input.includes('status') || input.includes('track')) {
      return 'You can track your claim status in several ways:\n\n• **Employee Dashboard**: View real-time status updates\n• **Email Notifications**: Automatic updates sent to your email\n• **SMS Alerts**: Optional text message updates\n\nClaim statuses:\n✅ **Approved** - Payment processed\n⏳ **Pending** - Under AI review\n🔍 **Under Review** - Manual verification needed\n\nWould you like me to check a specific claim ID?';
    } else if (input.includes('document') || input.includes('upload')) {
      return 'Document upload guidelines:\n\n**Accepted formats**: PDF, JPG, PNG\n**Maximum size**: 10MB per file\n**Required documents**:\n• Medical report from hospital\n• Treatment invoice/receipt\n• Prescription details (for medication claims)\n• Insurance card copy\n\n**Tips for faster processing**:\n• Ensure documents are clear and readable\n• Include all relevant medical codes\n• Submit complete documentation to avoid delays\n\nNeed help with a specific document type?';
    } else if (input.includes('hospital') || input.includes('medical')) {
      return 'For healthcare providers:\n\n**hospital Portal Features**:\n• Submit medical reports directly\n• Manage patient records\n• Track report submission status\n• Access claim-related communications\n\n**Required information**:\n• Patient details and insurance ID\n• Diagnosis with ICD-10 codes\n• Treatment provided\n• Recommended follow-up care\n\nhospitals can access the portal at the top navigation. Need help with report submission?';
    } else if (input.includes('help') || input.includes('support')) {
      return 'I can assist you with:\n\n🏥 **Claim Submission**: Step-by-step guidance\n📋 **Status Tracking**: Real-time updates\n📄 **Document Upload**: Format and requirements\n💰 **Payment Information**: Processing times\n🔒 **Security Questions**: Data protection\n📞 **Contact Support**: Human assistance\n\nWhat specific area would you like help with?';
    } else if (input.includes('payment') || input.includes('money')) {
      return 'Payment processing information:\n\n**Approved Claims**:\n• Payment processed within 24-48 hours\n• Direct deposit to registered bank account\n• Email confirmation with transaction details\n\n**Payment Methods**:\n• Direct bank transfer (recommended)\n• Check by mail (5-7 business days)\n• Digital wallet (where available)\n\n**Payment Status**:\n• Track in Employee Portal under "My Claims"\n• Automatic notifications when payment is sent\n\nNeed to update your payment information?';
    } else if (input.includes('ai') || input.includes('artificial intelligence')) {
      return 'Our AI-powered claim processing:\n\n🤖 **Advanced Analysis**: 99.2% accuracy rate\n⚡ **Lightning Fast**: 2-3 minute processing time\n🔍 **Fraud Detection**: Advanced algorithms detect anomalies\n📋 **Document Verification**: OCR and computer vision\n🏥 **Medical Code Validation**: Real-time ICD-10/CPT verification\n📊 **Risk Assessment**: Predictive analytics\n\n**How it works**:\n1. Upload your documents\n2. AI analyzes and verifies everything\n3. Get instant confidence score and recommendations\n4. Automatic approval for low-risk claims\n\nWant to see AI in action? Submit a claim to experience it!';
    } else if (input.includes('login') || input.includes('account')) {
      return 'Account and Login Help:\n\n**Demo Accounts** (for testing):\n• Employee: employee@mediclaim.com (password: password123)\n• hospital: hospital@mediclaim.com (password: password123)\n• Insurance: insurance@mediclaim.com (password: password123)\n\n**Features**:\n• JWT-based secure authentication\n• Role-based access control\n• Password reset functionality\n• Remember me option\n\n**Having trouble?**\n• Check your email and password\n• Use the "Forgot Password" link\n• Contact support for account issues\n\nNeed help with registration or login?';
    } else {
      return 'I\'m here to help with your medical insurance claims! I can assist with:\n\n• **Claim submission** and requirements\n• **Status tracking** and updates\n• **Document upload** guidelines\n• **Payment processing** information\n• **General questions** about the platform\n\nWhat would you like to know more about?';
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeAttachedFile = (fileId: number) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert('Voice recording started... (This is a demo)');
      setTimeout(() => {
        setIsRecording(false);
        setInputText('I need help submitting my medical claim');
      }, 3000);
    }
  };

  const clearChat = () => {
    if (confirm('Clear all chat messages?')) {
      setMessages([{
        id: '1',
        text: 'Hello! I\'m your AI assistant for medical insurance claims. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'quick-reply',
        options: ['Submit a claim', 'Check claim status', 'Upload documents', 'Get help']
      }]);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40 group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border z-50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="w-8 h-8" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold">MediClaim AI Assistant</h3>
                <p className="text-xs opacity-90">Online • Responds instantly</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={clearChat}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={onToggle}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-white border-2 border-gray-200'}`}>
                      {message.sender === 'user' ? 
                        <User className="w-4 h-4 text-white" /> : 
                        <Bot className="w-4 h-4 text-blue-600" />
                      }
                    </div>
                    <div className={`p-3 rounded-2xl max-w-xs ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-md' 
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      {message.type === 'file' && (
                        <div className="mt-2 text-xs opacity-75">
                          📎 File attached
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Quick Reply Options */}
                {message.type === 'quick-reply' && message.options && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-10">
                    {message.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(option)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                    <span>{file.name}</span>
                    <button 
                      onClick={() => removeAttachedFile(file.id)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleRecording}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecording 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={isRecording ? "Stop recording" : "Voice message"}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={isRecording ? "Recording..." : "Type your message..."}
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isRecording}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() && attachedFiles.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileAttach}
            />
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button 
                onClick={() => handleQuickReply('What documents do I need?')}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                📄 Required docs
              </button>
              <button 
                onClick={() => handleQuickReply('How long does processing take?')}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                ⏱️ Processing time
              </button>
              <button 
                onClick={() => handleQuickReply('Check claim CL001')}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                🔍 Check status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;