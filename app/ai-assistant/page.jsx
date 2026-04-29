"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  FileText,
  Image as ImageIcon,
  Paperclip,
  X,
  GraduationCap,
  Download,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";

const AIHub = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "# Welcome to the AI Career Hub! \n\nI'm your dedicated advisor. Use the tools below to get started:\n\n- **Documents**: Upload your Resume or Cover Letter for analysis.\n- **Images**: Upload screenshots of job postings or certifications.\n- **Chat**: Ask me anything about networking or career growth.\n\nHow can I assist your professional journey today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadType, setUploadType] = useState(null); // 'image' or 'doc'
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file.");
        return;
      }
    } else {
      const validDocs = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validDocs.includes(file.type)) {
        toast.error("Please upload a PDF or DOCX file.");
        return;
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setAttachedFile(file);
    setUploadType(type);
    toast.success(`${file.name} attached!`);
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const userText = input.trim() || (attachedFile ? `Please analyze this ${uploadType}: ${attachedFile.name}` : "");
    const currentFile = attachedFile;
    const currentType = uploadType;

    // Add user message
    setMessages(prev => [...prev, {
      role: "user",
      content: userText,
      file: currentFile ? { name: currentFile.name, type: currentType } : null,
      time: new Date()
    }]);

    setInput("");
    setAttachedFile(null);
    setUploadType(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", userText);
      // Add history context (last 5 messages)
      formData.append("history", JSON.stringify(messages.slice(-5)));

      if (currentFile) {
        formData.append("file", currentFile);
      }

      const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://${hostname}:5001/api`;

      const { data } = await axios.post(`${baseUrl}/ai/analyze`, formData, {
        withCredentials: true
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.data.response,
        time: new Date()
      }]);
    } catch (err) {
      toast.error("Trouble Encountered");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered some trouble processing your request. Please ensure the AI service is running and try again.",
        time: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] overflow-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-8 py-5 border-b border-[var(--border)] bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-1)] tracking-tight">AI Career Hub</h1>
            <p className="text-[13px] text-emerald-500 font-semibold flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Alumni AI
            </p>
          </div>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
        >
          Clear History
        </button>
      </div>

      {/* ── Messages ───────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-10 space-y-8 bg-slate-50/30 dark:bg-transparent"
      >
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 border border-[var(--border)] text-indigo-500"
                }`}>
                {msg.role === "user" ? <GraduationCap size={20} /> : <Sparkles size={20} />}
              </div>

              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-6 py-4 rounded-[28px] text-[15px] leading-relaxed shadow-sm ${msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-md"
                  : "bg-white dark:bg-slate-800 border border-[var(--border)] text-[var(--text-1)] rounded-tl-md"
                  }`}>
                  {msg.file && (
                    <div className="mb-4 p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl flex items-center gap-3">
                      {msg.file.type === 'image' ? <ImageIcon size={20} className="text-indigo-500" /> : <FileText size={20} className="text-indigo-500" />}
                      <span className="text-[13px] font-bold truncate">{msg.file.name}</span>
                    </div>
                  )}
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                    prose-p:my-2 prose-headings:my-3 prose-ul:my-3 prose-li:my-1
                    prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                <span className="text-[11px] text-[var(--text-3)] font-bold px-3 tracking-wide opacity-70">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-[var(--border)] flex items-center justify-center text-indigo-500 animate-pulse">
                <Sparkles size={20} />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-[var(--border)] px-6 py-4 rounded-3xl rounded-tl-md shadow-sm flex items-center gap-3">
                <span className="text-[14px] text-[var(--text-2)] font-bold italic tracking-tight">Processing your request...</span>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Input Area ─────────────────────────────────────── */}
      <div className="px-8 pb-8 pt-4 bg-white dark:bg-slate-900 border-t border-[var(--border)] z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto w-full">
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl shadow-sm"
            >
              {uploadType === 'image' ? <ImageIcon size={18} className="text-indigo-600" /> : <FileText size={18} className="text-indigo-600" />}
              <span className="text-[13px] font-bold text-indigo-700 dark:text-indigo-300">{attachedFile.name}</span>
              <button onClick={() => { setAttachedFile(null); setUploadType(null); }} className="p-1 hover:bg-indigo-200/50 rounded-full transition-colors ml-1">
                <X size={16} className="text-indigo-600" />
              </button>
            </motion.div>
          )}

          <div className="flex items-end gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-[32px] border border-[var(--border)] focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-400/5 transition-all shadow-sm">
            <div className="flex items-center gap-1 pl-2 mb-1">
              <button
                onClick={() => { setUploadType('doc'); fileInputRef.current.click(); }}
                title="Upload Document (PDF/DOCX)"
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all"
              >
                <FileText size={22} />
              </button>
              <button
                onClick={() => { setUploadType('image'); fileInputRef.current.click(); }}
                title="Upload Image"
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all"
              >
                <ImageIcon size={22} />
              </button>
            </div>

            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, uploadType)}
              accept={uploadType === 'image' ? ".png,.jpg,.jpeg" : ".pdf,.docx"}
            />

            <textarea
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Message your Career Advisor..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-4 px-3 outline-none resize-none font-medium text-[var(--text-1)]"
            />

            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !attachedFile)}
              className="bg-indigo-600 text-white p-4 rounded-[24px] shadow-lg shadow-indigo-600/30 disabled:opacity-30 disabled:shadow-none hover:bg-indigo-700 transition-all mb-1 mr-1"
            >
              <Send size={22} />
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-4 font-bold tracking-tight">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
