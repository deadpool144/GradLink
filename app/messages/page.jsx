"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Search, MoreVertical, Send, Image as ImageIcon, Smile, 
  Paperclip, Plus, Loader2, MessageSquare, Check, CheckCheck,
  User, Trash2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { clsx } from "clsx";

export default function MessagesPage() {
  const dispatch = useDispatch();
  const socket = getSocket();
  const { user, onlineUsers } = useSelector((s) => s.auth);
  const { conversations, activeConvId, messages, unread, typingUsers } = useSelector((s) => s.chat);
  
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const activeConv = useMemo(() => conversations.find(c => c._id === activeConvId), [conversations, activeConvId]);
  
  const otherParticipant = useMemo(() => {
    if (!activeConv || activeConv.isGroupChat) return null;
    return activeConv.participants.find(p => p._id !== user?._id);
  }, [activeConv, user]);

  const isOtherOnline = onlineUsers.includes(otherParticipant?._id);

  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const { data } = await api.get("/messages");
        dispatch(setConversations(data.data));
        
        // If there's a convId in URL, select it
        const urlParams = new URLSearchParams(window.location.search);
        const convId = urlParams.get("convId");
        if (convId) selectConv(convId);
      } catch (err) {
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConvs();
  }, [dispatch]);

  const selectConv = async (id) => {
    if (id === activeConvId) return;
    dispatch(setActiveConv(id));
    setMsgLoading(true);
    try {
      const { data } = await api.get(`/messages/${id}`);
      dispatch(setMessages({ convId: id, messages: data.data.data }));
      socket?.emit("join_room", id);
      socket?.emit("mark_read", { convId: id });
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setMsgLoading(false);
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    
    if (!socket || !activeConvId) return;

    socket.emit("typing", { convId: activeConvId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { convId: activeConvId });
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const text = inputText;
    setInputText("");
    socket?.emit("stop_typing", { convId: activeConvId });

    try {
      await api.post(`/messages/${activeConvId}`, { text });
    } catch (err) {
      toast.error("Failed to send message");
      setInputText(text);
    }
  };

  const clearChat = async () => {
    if (!activeConvId || !confirm("Clear all messages in this chat?")) return;
    try {
      await api.delete(`/messages/${activeConvId}/clear`);
      dispatch(setMessages({ convId: activeConvId, messages: [] }));
      toast.success("Chat cleared");
    } catch (err) {
      toast.error("Failed to clear chat");
    }
  };

  const deleteConv = async () => {
    if (!activeConvId || !confirm("Delete this conversation?")) return;
    try {
      await api.delete(`/messages/${activeConvId}`);
      dispatch(setActiveConv(null));
      const { data } = await api.get("/messages");
      dispatch(setConversations(data.data));
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error("Failed to delete conversation");
    }
  };

  const currentMessages = messages[activeConvId] || [];
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, typingUsers]);

  const formatTime = (date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, "HH:mm");
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM d");
  };

  if (loading) return (
    <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-white dark:bg-slate-900 rounded-3xl">
      <Loader2 className="animate-spin text-primary w-8 h-8" />
    </div>
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-[#020617]">
      {/* Sidebar: Conversations List */}
      <div className={clsx(
        "w-full md:w-80 md:min-w-[320px] border-r border-slate-100 dark:border-slate-800/80 flex flex-col bg-slate-50/50 dark:bg-slate-900/30",
        activeConvId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-5 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Messages</h2>
            <button className="p-2 bg-primary/10 dark:bg-indigo-900/40 text-primary rounded-xl hover:bg-primary/20 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length > 0 ? conversations.map((conv) => {
            const partner = conv.participants.find(p => p._id !== user?._id);
            const isSelected = activeConvId === conv._id;
            const isOnline = partner && onlineUsers.includes(partner._id);
            const convUnread = unread[conv._id] || 0;
            const isTyping = typingUsers[conv._id]?.length > 0;

            return (
              <button
                key={conv._id}
                onClick={() => selectConv(conv._id)}
                className={clsx(
                  "w-full px-5 py-4 flex gap-4 text-left transition-all duration-200 relative",
                  isSelected 
                    ? "bg-primary/10/50 dark:bg-indigo-950/30" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm">
                    {partner?.avatar ? (
                      <Image src={partner.avatar} fill alt="P" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                        {partner?.firstName?.[0]}
                      </div>
                    )}
                  </div>
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={clsx(
                      "font-bold text-[14px] truncate leading-none",
                      convUnread > 0 ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {conv.isGroupChat ? conv.name : `${partner?.firstName} ${partner?.lastName}`}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                      {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={clsx(
                      "text-xs truncate flex-1",
                      isTyping ? "text-primary font-medium italic" : convUnread > 0 ? "text-slate-900 dark:text-white font-bold" : "text-slate-500"
                    )}>
                      {isTyping ? "Typing..." : conv.lastMessage?.text || "Started a conversation"}
                    </p>
                    {convUnread > 0 && (
                      <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-indigo-200 dark:shadow-none">
                        {convUnread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          }) : (
            <div className="p-10 text-center text-slate-400">
              <p className="text-sm font-medium">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className={clsx(
        "flex-1 flex-col bg-[#efeae2] dark:bg-[#0b141a] relative", 
        activeConvId ? "flex" : "hidden md:flex"
      )}>
        {activeConvId ? (
          <>
            {/* Window Header - WhatsApp style */}
            <div className="absolute top-0 left-0 right-0 z-20 h-16 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-2 sm:px-4 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => dispatch(setActiveConv(null))}
                  className="md:hidden p-2 -ml-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-[18px] overflow-hidden bg-slate-100 dark:bg-slate-800 ring-2 ring-primary/10 dark:ring-indigo-900/30 ring-offset-2 dark:ring-offset-slate-900 shadow-sm relative">
                    {otherParticipant?.avatar ? (
                      <Image src={otherParticipant.avatar} fill alt="P" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold text-lg">
                        {otherParticipant?.firstName?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  {isOtherOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-full shadow-sm z-10" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white leading-none mb-1">
                    {activeConv?.isGroupChat ? activeConv.name : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <p className={clsx("text-[10px] font-black uppercase tracking-widest", isOtherOnline ? "text-emerald-500" : "text-slate-400")}>
                      {isOtherOnline ? "Online Now" : "Currently Offline"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => router.push(`/profile/${otherParticipant?._id}`)}
                  className="hidden sm:flex btn-ghost p-2 text-slate-500 hover:text-primary rounded-xl"
                  title="View Profile"
                >
                  <User className="w-5 h-5" />
                </button>
                <div className="relative group">
                  <button className="p-2 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 card p-1 shadow-2xl invisible group-hover:visible z-30 ring-1 ring-slate-100 dark:ring-slate-800">
                    <button onClick={clearChat} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Clear History
                    </button>
                    <button onClick={deleteConv} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-20 pb-24 space-y-4 flex flex-col custom-scrollbar bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r2qE3tKjM_M.png')] dark:bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r2qE3tKjM_M.png')] bg-repeat opacity-95">
              <div className="flex-1" />
              {currentMessages.length > 0 ? (
                currentMessages.map((msg, i) => {
                  const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                  const showAvatar = !isMine && (i === 0 || (currentMessages[i-1]?.sender?._id || currentMessages[i-1]?.sender) !== (msg.sender?._id || msg.sender));
                  
                  return (
                    <div key={msg._id || i} className={clsx("flex group", isMine ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-2 duration-500")}>
                      {!isMine && (
                        <div className="w-8 mr-3 shrink-0 self-end mb-1">
                          {showAvatar && (
                            <Link href={`/profile/${msg.sender?._id || msg.sender}`} className="w-8 h-8 rounded-xl overflow-hidden relative shadow-sm hover:scale-110 transition-transform block">
                               {msg.sender?.avatar ? <Image src={msg.sender.avatar} fill className="object-cover" /> : <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{msg.sender?.firstName?.[0]}</div>}
                            </Link>
                          )}
                        </div>
                      )}
                      
                      <div className={clsx("max-w-[75%] sm:max-w-[65%] relative flex flex-col", isMine ? "items-end" : "items-start")}>
                        <div className={clsx(
                          "px-3 py-2 text-[14.5px] leading-relaxed shadow-sm transition-all relative overflow-hidden text-slate-800 dark:text-slate-100",
                          isMine 
                            ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-xl rounded-tr-none" 
                            : "bg-white dark:bg-[#202c33] rounded-xl rounded-tl-none"
                        )}>
                          {isMine && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />}
                          <p className="whitespace-pre-wrap relative z-10">{msg.text}</p>
                        </div>
                        <div className={clsx("flex items-center gap-1.5 mt-1.5 px-1 font-bold text-[9px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-300", isMine ? "flex-row-reverse text-indigo-400" : "text-slate-400")}>
                          <span>{format(new Date(msg.createdAt), "h:mm a")}</span>
                          {isMine && (msg.readBy?.length > 1 ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-10">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
                    <MessageSquare className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-1 opacity-60 font-medium italic">Your conversation is ready!</p>
                </div>
              )}
              
              {/* Typing indicators */}
              {typingUsers[activeConvId]?.length > 0 && (
                <div className="flex gap-2 items-center text-slate-400 animate-pulse ml-11">
                  <div className="flex gap-1.5 p-3 px-4 bg-white dark:bg-slate-800 rounded-3xl rounded-bl-none border border-slate-100 dark:border-slate-700/50 shadow-sm shadow-primary/10/50">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:1s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} className="pt-2" />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-3 px-3 sm:px-6 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-slate-200/50 dark:border-slate-800/50 shadow-sm">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-5xl mx-auto">
                <button type="button" className="p-3.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-95">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative group bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
                  <textarea
                    rows={1}
                    placeholder="Type your message..."
                    className="w-full bg-transparent border-none rounded-3xl py-4 pl-6 pr-14 text-[14px] font-medium text-slate-700 dark:text-slate-200 focus:ring-0 transition-all resize-none max-h-32 custom-scrollbar"
                    value={inputText}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button type="button" className="absolute right-4 top-3.5 p-1 text-slate-400 hover:text-primary hover:rotate-12 transition-all">
                    <Smile className="w-6 h-6" />
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  disabled={!inputText.trim()} 
                  className={clsx(
                    "p-4 rounded-3xl shadow-2xl transition-all transform active:scale-90 flex items-center justify-center",
                    inputText.trim() 
                      ? "bg-primary text-white shadow-primary/30 hover:bg-indigo-700 hover:-translate-y-0.5" 
                      : "bg-slate-100 text-slate-300 cursor-not-allowed"
                  )}
                >
                  <Send className={clsx("w-5 h-5", inputText.trim() && "animate-in slide-in-from-bottom-2")} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40">
            <div className="relative mb-10 group">
              <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
              <div className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl flex items-center justify-center relative z-10 animate-in zoom-in-50 duration-700">
                <div className="w-20 h-20 bg-primary/10 dark:bg-indigo-950/30 rounded-[2rem] flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-xl z-20 animate-bounce [animation-duration:2s]" />
            </div>
            <div className="text-center max-w-sm px-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Your Inbox</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-bold opacity-80 mb-8">
                Connect with fellow alumni, share ideas, and build lasting relationships. Select a chat to start messaging!
              </p>
              <button 
                onClick={() => router.push("/directory")}
                className="btn-primary w-full py-4 rounded-[20px] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Start New Conversation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
