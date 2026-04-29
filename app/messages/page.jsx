"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  setConversations,
  setActiveConv,
  setMessages,
  appendMessage,
} from "@/lib/slices/chatSlice";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";
import {
  Search, MoreVertical, Send, ArrowLeft,
  Plus, Loader2, MessageSquare, Check, CheckCheck,
  Trash2, User, Smile
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatConvTime(date) {
  const d = new Date(date);
  if (isToday(d))     return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function formatMsgTime(date) {
  return format(new Date(date), "HH:mm");
}

// ── Typing Dots ───────────────────────────────────────────────────────────────
function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-2 justify-start"
    >
      <div className="w-7 h-7 rounded-full bg-[var(--surface-3)] flex-shrink-0" />
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm shadow-[var(--shadow-sm)]"
        style={{ background: "var(--chat-other)" }}
      >
        {[0, 0.18, 0.36].map((d, i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--text-3)" }}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.9, delay: d }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Conversation Item ────────────────────────────────────────────────────────
function ConvItem({ conv, isSelected, onSelect, myId, onlineUsers, unread, typingUsers }) {
  const partner   = conv.participants.find(p => p._id !== myId);
  const isOnline  = partner && onlineUsers.includes(partner._id);
  const convUnread = unread[conv._id] || 0;
  const isTyping  = typingUsers[conv._id]?.length > 0;
  const name      = conv.isGroupChat ? conv.name : `${partner?.firstName} ${partner?.lastName}`;
  const initials  = partner ? (partner.firstName?.[0] || "") + (partner.lastName?.[0] || "") : "?";

  return (
    <button
      onClick={() => onSelect(conv._id)}
      className={cn(
        "w-full px-4 py-3.5 flex items-center gap-3.5 text-left transition-all duration-150 relative group",
        isSelected
          ? "bg-[var(--primary-alpha)]"
          : "hover:bg-[var(--surface-2)]"
      )}
    >
      {/* Active indicator */}
      {isSelected && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[rgb(var(--primary-rgb))] rounded-r-full" />
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={cn(
          "w-11 h-11 rounded-2xl overflow-hidden relative flex items-center justify-center font-bold text-sm",
          "bg-[var(--surface-2)]"
        )}
          style={!partner?.avatar ? { background: "var(--primary-alpha)", color: "rgb(var(--primary-rgb))" } : {}}
        >
          {partner?.avatar
            ? <Image src={partner.avatar} fill sizes="44px" alt={name} className="object-cover" />
            : <span>{initials}</span>
          }
        </div>
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[var(--surface)] rounded-full" />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn(
            "text-[13.5px] font-semibold truncate tracking-tight",
            isSelected
              ? "text-[rgb(var(--primary-rgb))]"
              : convUnread > 0
                ? "text-[var(--text-1)] font-bold"
                : "text-[var(--text-1)]"
          )}>
            {name}
          </span>
          {conv.lastMessage && (
            <span className="text-[10px] text-[var(--text-3)] flex-shrink-0 ml-2">
              {formatConvTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-[12px] truncate flex-1 leading-snug",
            isTyping
              ? "text-[rgb(var(--primary-rgb))] italic font-medium"
              : convUnread > 0
                ? "text-[var(--text-1)] font-semibold"
                : "text-[var(--text-2)]"
          )}>
            {isTyping ? "Typing…" : conv.lastMessage?.text || "Started a conversation"}
          </p>
          {convUnread > 0 && !isSelected && (
            <span className="min-w-[18px] h-[18px] px-1.5 bg-[rgb(var(--primary-rgb))] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
              {convUnread > 99 ? "99" : convUnread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, isMine, showAvatar }) {
  const isRead = msg.readBy?.length > 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex items-end gap-2 group", isMine ? "justify-end" : "justify-start")}
    >
      {/* Other's avatar */}
      {!isMine && (
        <div className="w-7 flex-shrink-0 self-end mb-1">
          {showAvatar ? (
            <div className="w-7 h-7 rounded-full overflow-hidden relative"
              style={{ background: "var(--primary-alpha)" }}
            >
              {msg.sender?.avatar
                ? <Image src={msg.sender.avatar} fill sizes="28px" alt="" className="object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ color: "rgb(var(--primary-rgb))" }}>{msg.sender?.firstName?.[0]}</span>
              }
            </div>
          ) : <div className="w-7 h-7" />}
        </div>
      )}

      <div className={cn("flex flex-col max-w-[70%] sm:max-w-[60%]", isMine ? "items-end" : "items-start")}>
        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-2.5 text-[14px] leading-[1.55] shadow-[var(--shadow-sm)] transition-all",
            isMine
              ? "rounded-2xl rounded-br-sm"
              : "rounded-2xl rounded-bl-sm"
          )}
          style={{
            background: isMine ? "var(--chat-mine)" : "var(--chat-other)",
            color:      isMine ? "var(--chat-mine-text)" : "var(--chat-other-text)",
          }}
        >
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        </div>

        {/* Meta: time + read */}
        <div className={cn(
          "flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium",
          isMine ? "flex-row-reverse text-[var(--text-3)]" : "text-[var(--text-3)]"
        )}>
          <span>{formatMsgTime(msg.createdAt)}</span>
          {isMine && (
            isRead
              ? <CheckCheck className="w-3 h-3 text-[rgb(var(--primary-rgb))]" />
              : <Check className="w-3 h-3" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyInbox({ onBrowse }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-[var(--shadow-md)]"
        style={{ background: "var(--primary-alpha)" }}
      >
        <MessageSquare className="w-9 h-9" style={{ color: "rgb(var(--primary-rgb))" }} />
      </div>
      <h3 className="text-[18px] font-bold text-[var(--text-1)] mb-2 tracking-tight">No conversation selected</h3>
      <p className="text-[13px] text-[var(--text-2)] leading-relaxed max-w-xs mb-6">
        Choose a conversation from the list, or start a new one by browsing the alumni directory.
      </p>
      <button onClick={onBrowse} className="btn-primary h-10 px-5 text-sm gap-2">
        <Plus className="w-4 h-4" /> New Conversation
      </button>
    </div>
  );
}

// ── Date Divider ─────────────────────────────────────────────────────────────
function DateDivider({ date }) {
  const d = new Date(date);
  const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "EEEE, MMMM d");
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-[var(--border)]" />
      <span className="text-[11px] font-semibold text-[var(--text-3)] px-2">{label}</span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const socket   = getSocket();

  const { user, onlineUsers }                              = useSelector(s => s.auth);
  const { conversations, activeConvId, messages, unread, typingUsers } = useSelector(s => s.chat);

  const [inputText,   setInputText]   = useState("");
  const [loading,     setLoading]     = useState(true);
  const [msgLoading,  setMsgLoading]  = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef        = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef         = useRef(null);

  const activeConv = useMemo(() =>
    conversations.find(c => c._id === activeConvId), [conversations, activeConvId]);

  const otherParticipant = useMemo(() => {
    if (!activeConv || activeConv.isGroupChat) return null;
    return activeConv.participants.find(p => p._id !== user?._id);
  }, [activeConv, user]);

  const isOtherOnline = onlineUsers.includes(otherParticipant?._id);
  const currentMessages = messages[activeConvId] || [];

  const filteredConvs = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => {
      const partner = c.participants.find(p => p._id !== user?._id);
      const name = c.isGroupChat ? c.name : `${partner?.firstName} ${partner?.lastName}`;
      return name.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery, user]);

  /* Fetch convs */
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const { data } = await api.get("/messages");
        dispatch(setConversations(data.data));
        const urlParams = new URLSearchParams(window.location.search);
        const convId = urlParams.get("convId");
        if (convId) selectConv(convId);
      } catch { toast.error("Failed to load conversations"); }
      finally { setLoading(false); }
    };
    fetchConvs();
  }, [dispatch]);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, typingUsers]);

  /* Focus input when conv changes */
  useEffect(() => {
    if (activeConvId) setTimeout(() => inputRef.current?.focus(), 200);
  }, [activeConvId]);

  const selectConv = async (id) => {
    if (id === activeConvId) return;
    dispatch(setActiveConv(id));
    setMsgLoading(true);
    setMenuOpen(false);
    try {
      const { data } = await api.get(`/messages/${id}`);
      dispatch(setMessages({ convId: id, messages: data.data }));
      socket?.emit("join_conv", id);
      socket?.emit("mark_read", { convId: id });
    } catch { toast.error("Failed to load messages"); }
    finally { setMsgLoading(false); }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (!socket || !activeConvId) return;
    socket.emit("typing", { convId: activeConvId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { convId: activeConvId });
    }, 2500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;
    const text = inputText;
    setInputText("");
    socket?.emit("stop_typing", { convId: activeConvId });
    try {
      await api.post(`/messages/${activeConvId}`, { text });
    } catch { toast.error("Failed to send message"); setInputText(text); }
  };

  const clearChat = async () => {
    if (!activeConvId || !confirm("Clear all messages?")) return;
    try {
      await api.delete(`/messages/${activeConvId}/clear`);
      dispatch(setMessages({ convId: activeConvId, messages: [] }));
      toast.success("Chat cleared"); setMenuOpen(false);
    } catch { toast.error("Failed to clear chat"); }
  };

  const deleteConv = async () => {
    if (!activeConvId || !confirm("Delete this conversation?")) return;
    try {
      await api.delete(`/messages/${activeConvId}`);
      dispatch(setActiveConv(null));
      const { data } = await api.get("/messages");
      dispatch(setConversations(data.data));
      toast.success("Conversation deleted"); setMenuOpen(false);
    } catch { toast.error("Failed to delete conversation"); }
  };

  /* Group messages by date */
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;
    currentMessages.forEach((msg, i) => {
      const d = format(new Date(msg.createdAt), "yyyy-MM-dd");
      if (d !== lastDate) { groups.push({ type: "divider", date: msg.createdAt }); lastDate = d; }
      groups.push({ type: "msg", msg, index: i });
    });
    return groups;
  }, [currentMessages]);

  if (loading) return (
    <div className="flex h-full items-center justify-center" style={{ background: "var(--bg)" }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: "rgb(var(--primary-rgb))" }} />
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* ═══════════════════════════════════════════════════════════════════
          LEFT: Conversations list
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "flex flex-col border-r border-[var(--border)]",
          "w-full md:w-[320px] md:flex-shrink-0",
          activeConvId ? "hidden md:flex" : "flex"
        )}
        style={{ background: "var(--surface)" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-[var(--text-1)] tracking-tight">Messages</h2>
            <button
              onClick={() => router.push("/directory")}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "var(--primary-alpha)", color: "rgb(var(--primary-rgb))" }}
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] py-2 pl-9 pr-4 rounded-xl outline-none border border-[var(--border)] transition-all"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-1)",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgb(var(--primary-rgb))"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </div>
        </div>

        {/* Conv list */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredConvs.length > 0 ? filteredConvs.map(conv => (
            <ConvItem
              key={conv._id}
              conv={conv}
              isSelected={activeConvId === conv._id}
              onSelect={selectConv}
              myId={user?._id}
              onlineUsers={onlineUsers}
              unread={unread}
              typingUsers={typingUsers}
            />
          )) : (
            <div className="p-10 text-center">
              <p className="text-[13px] text-[var(--text-3)]">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT: Chat window
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "flex-1 flex-col relative overflow-hidden",
          activeConvId ? "flex" : "hidden md:flex"
        )}
        style={{ background: "var(--chat-bg)" }}
      >
        {activeConvId ? (
          <>
            {/* ── Chat Header ─────────────────────────────────── */}
            <div
              className="absolute top-0 left-0 right-0 z-20 h-14 flex items-center justify-between px-4 border-b border-[var(--border)]"
              style={{ background: "var(--surface)", backdropFilter: "blur(8px)" }}
            >
              {/* Left: back + avatar + info */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => dispatch(setActiveConv(null))}
                  className="md:hidden p-2 -ml-2 rounded-xl transition-colors btn-ghost"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {otherParticipant?.avatar ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image src={otherParticipant.avatar} fill sizes="36px" alt="" className="object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "var(--primary-alpha)", color: "rgb(var(--primary-rgb))" }}
                  >
                    {otherParticipant?.firstName?.[0]}{otherParticipant?.lastName?.[0]}
                  </div>
                )}

                <div>
                  <Link
                    href={`/profile/${otherParticipant?._id}`}
                    className="text-[14px] font-bold text-[var(--text-1)] tracking-tight hover:text-[rgb(var(--primary-rgb))] transition-colors leading-tight block"
                  >
                    {activeConv?.isGroupChat
                      ? activeConv.name
                      : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                  </Link>
                  <p className={cn(
                    "text-[11px] font-medium leading-none mt-0.5",
                    isOtherOnline ? "text-emerald-500" : "text-[var(--text-3)]"
                  )}>
                    {isOtherOnline ? "● Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-1 relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="btn-ghost w-8 h-8 p-0 rounded-xl"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-2 w-48 border rounded-2xl shadow-[var(--shadow-lg)] p-1.5 z-50"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                      >
                        <button onClick={clearChat} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] rounded-xl transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Clear history
                        </button>
                        <button onClick={deleteConv} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete chat
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Messages ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto pt-16 pb-20 px-4 sm:px-6 space-y-1">
              <div className="flex-1 flex flex-col-reverse" />
              <div className="space-y-1">
                {groupedMessages.length > 0 ? (
                  groupedMessages.map((item, idx) => {
                    if (item.type === "divider") {
                      return <DateDivider key={`d-${idx}`} date={item.date} />;
                    }
                    const { msg, index } = item;
                    const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                    const prevSender = index > 0 ? (currentMessages[index - 1]?.sender?._id || currentMessages[index - 1]?.sender) : null;
                    const currSender = msg.sender?._id || msg.sender;
                    const showAvatar = !isMine && prevSender !== currSender;

                    return (
                      <MessageBubble
                        key={msg._id || idx}
                        msg={msg}
                        isMine={isMine}
                        showAvatar={showAvatar}
                      />
                    );
                  })
                ) : (
                  !msgLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: "var(--surface-2)" }}>
                        <MessageSquare className="w-6 h-6" style={{ color: "var(--text-3)" }} />
                      </div>
                      <p className="text-[13px] font-semibold text-[var(--text-2)]">No messages yet</p>
                      <p className="text-[12px] text-[var(--text-3)] mt-1">Say hello! 👋</p>
                    </div>
                  )
                )}

                {/* Loading spinner */}
                {msgLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-3)" }} />
                  </div>
                )}

                {/* Typing indicator */}
                <AnimatePresence>
                  {typingUsers[activeConvId]?.length > 0 && <TypingBubble />}
                </AnimatePresence>

                <div ref={scrollRef} />
              </div>
            </div>

            {/* ── Input bar ────────────────────────────────────── */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-2 border-t border-[var(--border)]"
              style={{ background: "var(--surface)" }}
            >
              <form onSubmit={handleSend} className="flex items-end gap-2.5">
                {/* Textarea */}
                <div
                  className="flex-1 relative rounded-2xl border border-[var(--border)] overflow-hidden transition-all focus-within:border-[rgb(var(--primary-rgb))] focus-within:shadow-[0_0_0_3px_rgba(67,56,202,0.10)]"
                  style={{ background: "var(--surface-2)" }}
                >
                  <textarea
                    ref={inputRef}
                    rows={1}
                    placeholder="Message…"
                    value={inputText}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                    }}
                    className="w-full bg-transparent py-3 pl-4 pr-11 text-[14px] leading-snug resize-none outline-none max-h-32"
                    style={{ color: "var(--text-1)" }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 bottom-2.5 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                {/* Send */}
                <motion.button
                  type="submit"
                  disabled={!inputText.trim()}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
                    inputText.trim()
                      ? "shadow-[var(--shadow-primary)]"
                      : "opacity-40 cursor-not-allowed"
                  )}
                  style={{
                    background: inputText.trim() ? "rgb(var(--primary-rgb))" : "var(--surface-3)",
                    color: inputText.trim() ? "#fff" : "var(--text-3)",
                  }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <EmptyInbox onBrowse={() => router.push("/directory")} />
        )}
      </div>
    </div>
  );
}
