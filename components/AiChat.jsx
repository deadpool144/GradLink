"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, RotateCcw, Zap, GraduationCap } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

// ─── Minimal chat message timestamp formatter ────────────────────────────────
const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ─── Message Bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ msg, index }) => {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
            : "bg-slate-100 dark:bg-slate-800 text-indigo-500 border border-slate-200 dark:border-slate-700"
        }`}
      >
        {isUser ? (
          <span className="text-[11px] font-black tracking-tight">YOU</span>
        ) : (
          <Zap size={14} strokeWidth={2.5} />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-3xl text-sm leading-relaxed font-[450] ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-md shadow-md shadow-indigo-600/15"
              : "bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60 rounded-tl-md shadow-sm"
          }`}
          style={{ letterSpacing: "-0.01em" }}
        >
          {isUser ? (
            msg.content
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none 
              prose-p:leading-relaxed prose-p:my-1
              prose-ul:my-2 prose-li:my-0.5 
              prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400
              prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-headings:font-bold prose-headings:my-2"
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-600 px-1 font-medium">
          {formatTime(msg.time || new Date())}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Typing Indicator ────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    className="flex gap-3"
  >
    <div className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
      <Zap size={14} className="text-indigo-500" strokeWidth={2.5} />
    </div>
    <div className="px-4 py-3.5 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-3xl rounded-tl-md shadow-sm flex items-center gap-1.5">
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 bg-indigo-400 rounded-full block"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.9, delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  </motion.div>
);

// ─── AiChat Main ─────────────────────────────────────────────────────────────
const AiChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Alumni Connect assistant. Ask me anything — networking tips, platform features, career advice, or just a quick chat.",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();

    setMessages((prev) => [...prev, { role: "user", content: text, time: new Date() }]);
    setInput("");
    setIsLoading(true);

    try {
      const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://${hostname}:5001/api`;
      const { data } = await axios.post(`${baseUrl}/ai/chat`, { message: text }, { withCredentials: true });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.data.response, time: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't reach the AI service. Please make sure it's running.", time: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const clearChat = () =>
    setMessages([{ role: "assistant", content: "Fresh start! How can I help you today?", time: new Date() }]);

  const suggestions = [
    "How do I connect with alumni?",
    "Find events near me",
    "Career tips for freshers",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
          transition={{ type: "spring", damping: 30, stiffness: 320, mass: 0.8 }}
          className="fixed bottom-[90px] right-6 z-50 flex flex-col"
          style={{ width: "min(420px, calc(100vw - 1.5rem))", height: "min(580px, calc(100vh - 120px))" }}
        >
          {/* Glass card */}
          <div className="relative flex flex-col h-full rounded-[28px] overflow-hidden
            bg-white/95 dark:bg-[#0d1117]/95
            shadow-[0_32px_64px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)]
            dark:shadow-[0_32px_64px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]
            backdrop-blur-2xl border border-white/60 dark:border-white/[0.07]"
          >
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  {/* Logo mark */}
                  <div className="relative w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <GraduationCap size={20} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-[2.5px] border-white dark:border-[#0d1117] rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                      Alumni AI
                    </h3>
                    <p className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 mt-[1px]">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                      Online · Llama&nbsp;3.2
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearChat}
                    title="Clear chat"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all duration-150"
                  >
                    <RotateCcw size={16} strokeWidth={2.2} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all duration-150"
                  >
                    {/* Custom minimal close */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Messages ───────────────────────────────────────── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(148,163,184,0.3) transparent",
              }}
            >
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} index={i} />
              ))}
              <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>

              {/* Quick suggestions — show only when just 1 message */}
              {messages.length === 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="px-3.5 py-2 bg-slate-50 dark:bg-white/[0.06] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-slate-200 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/30 rounded-2xl text-[12px] font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all duration-200"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* ── Input ──────────────────────────────────────────── */}
            <div className="shrink-0 px-4 pb-4 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-end gap-2.5">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      // Auto-grow (max 4 rows)
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Ask Alumni AI…"
                    rows={1}
                    className="w-full resize-none bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]
                      focus:border-indigo-400 dark:focus:border-indigo-500/60
                      focus:ring-1 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20
                      rounded-2xl px-4 py-3 text-[14px] font-[450] text-slate-800 dark:text-slate-100
                      placeholder:text-slate-400 dark:placeholder:text-slate-600
                      outline-none transition-all duration-200 leading-relaxed"
                    style={{ letterSpacing: "-0.01em" }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-35 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-indigo-600/25 transition-all duration-200 shrink-0"
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </motion.button>
              </div>

              <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium mt-2.5 tracking-wide">
                Alumni Connect AI · Enter to send · Shift+Enter new line
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiChat;
