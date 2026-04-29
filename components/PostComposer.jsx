"use client";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Image as ImageIcon, Video, ArrowUp, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PostComposer({ onPostCreated }) {
  const { user } = useSelector((s) => s.auth);
  const [content,   setContent]   = useState("");
  const [files,     setFiles]     = useState([]);
  const [previews,  setPreviews]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [focused,   setFocused]   = useState(false);
  const fileInputRef = useRef(null);

  const expanded = focused || content.length > 0 || previews.length > 0;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) return toast.error("Max 5 files allowed");
    setFiles((f) => [...f, ...selected]);
    setPreviews((p) => [
      ...p,
      ...selected.map((f) => ({ url: URL.createObjectURL(f), type: f.type.startsWith("video") ? "video" : "image" })),
    ]);
  };

  const removeFile = (i) => {
    URL.revokeObjectURL(previews[i].url);
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("content", content);
    files.forEach((f) => fd.append("files", f));
    try {
      const { data } = await api.post("/posts", fd);
      toast.success("Post shared!");
      setContent(""); setFiles([]); setPreviews([]); setFocused(false);
      onPostCreated?.(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-[var(--surface)] border-b border-[var(--border)] transition-all duration-200",
        expanded && "shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="px-5 py-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar src={user?.avatar} alt={user?.firstName} size="md" className="flex-shrink-0 mt-0.5" />

          {/* Composer body */}
          <div className="flex-1 min-w-0">
            <textarea
              placeholder={expanded ? "What's on your mind?" : `Post something, ${user?.firstName?.split(" ")[0] || "there"}…`}
              className={cn(
                "w-full bg-transparent resize-none outline-none text-[14px] leading-relaxed text-[var(--text-1)] placeholder:text-[var(--text-3)] transition-all duration-200",
                expanded ? "min-h-[96px]" : "min-h-[40px]"
              )}
              style={{ letterSpacing: "-0.005em" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
            />

            {/* Media previews */}
            <AnimatePresence>
              {previews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-3 gap-2 mt-3"
                >
                  {previews.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]">
                      {p.type === "image"
                        ? <Image src={p.url} alt="preview" fill sizes="120px" className="object-cover" />
                        : <video src={p.url} className="w-full h-full object-cover" />
                      }
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action bar */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]"
                >
                  {/* Media buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-ghost w-8 h-8 p-0 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="Add Photo"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-ghost w-8 h-8 p-0 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      title="Add Video"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>

                  <input hidden ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />

                  {/* Character count + post button */}
                  <div className="flex items-center gap-3">
                    {content.length > 200 && (
                      <span className={cn("text-[11px] font-medium", content.length > 480 ? "text-red-500" : "text-[var(--text-3)]")}>
                        {500 - content.length}
                      </span>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={loading || (!content.trim() && files.length === 0)}
                      className="btn-primary h-8 px-4 text-[13px] gap-1.5"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
                      Post
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
