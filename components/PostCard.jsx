"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2, Send, Edit } from "lucide-react";
import { useSelector } from "react-redux";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

export default function PostCard({ post, onDelete }) {
  const { user } = useSelector((s) => s.auth);
  const [likes,          setLikes]          = useState(post.likes?.length || 0);
  const [isLiked,        setIsLiked]        = useState(post.likes?.includes(user?._id));
  const [showComments,   setShowComments]   = useState(false);
  const [comments,       setComments]       = useState([]);
  const [newComment,     setNewComment]     = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [editContent,    setEditContent]    = useState(post.content);
  const [isUpdating,     setIsUpdating]     = useState(false);
  const [localMedia,    setLocalMedia]    = useState(post.media || []);
  const [newFiles,      setNewFiles]      = useState([]);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setIsLiked(data.data.liked);
      setLikes(data.data.likeCount);
    } catch { toast.error("Failed to like post"); }
  };

  const fetchComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setLoadingComments(true);
    try {
      const { data } = await api.get(`/posts/${post._id}/comments`);
      setComments(data.data.data);
      setShowComments(true);
    } catch { toast.error("Failed to load comments"); }
    finally { setLoadingComments(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: newComment });
      setComments([...comments, data.data]);
      setNewComment("");
    } catch { toast.error("Failed to add comment"); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    toast.success("Link copied!");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success("Post deleted");
      onDelete?.(post._id);
    } catch { toast.error("Failed to delete post"); }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    setIsUpdating(true);
    try {
      const fd = new FormData();
      fd.append("content", editContent);
      fd.append("keptMedia", JSON.stringify(localMedia.map(m => m.url)));
      newFiles.forEach(f => fd.append("files", f));

      const { data } = await api.put(`/posts/${post._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Post updated");
      setIsEditing(false);
      // Update local post object
      post.content = data.data.content;
      post.media = data.data.media;
      setLocalMedia(data.data.media);
      setNewFiles([]);
    } catch (err) { 
      toast.error(err.response?.data?.message || "Failed to update post"); 
    }
    finally { setIsUpdating(false); }
  };

  const removeLocalMedia = (url) => {
    setLocalMedia(localMedia.filter(m => m.url !== url));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (localMedia.length + newFiles.length + files.length > 5) {
      toast.error("Max 5 files allowed");
      return;
    }
    setNewFiles([...newFiles, ...files]);
  };

  return (
    <article className="bg-[var(--surface)] border-b border-[var(--border)] hover:bg-[var(--surface-2)/30] transition-colors duration-150">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <Link href={`/profile/${post.author?._id}`} className="flex items-start gap-3 group min-w-0">
          <Avatar src={post.author?.avatar} alt={post.author?.firstName} size="md" className="flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h3 className="font-semibold text-[14px] text-[var(--text-1)] group-hover:text-[rgb(var(--primary-rgb))] transition-colors tracking-tight truncate">
              {post.author?.firstName} {post.author?.lastName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {post.author?.headline && (
                <span className="text-[12px] text-[var(--text-3)] truncate max-w-[160px]">{post.author.headline}</span>
              )}
              {post.author?.headline && <span className="text-[var(--text-3)] text-[10px]">·</span>}
              <span className="text-[12px] text-[var(--text-3)] flex-shrink-0">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>

        {/* Options menu */}
        {(post.author?._id === user?._id || user?.role === "admin") && (
          <div className="relative flex-shrink-0 ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn-ghost w-8 h-8 p-0 rounded-lg"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-1 w-36 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-lg)] z-50 p-1"
                  >
                    {post.author?._id === user?._id && (
                      <button
                        onClick={() => { setIsMenuOpen(false); setIsEditing(true); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit post
                      </button>
                    )}
                    <button
                      onClick={() => { setIsMenuOpen(false); handleDelete(); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete post
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="px-5 pb-3">
        {isEditing ? (
          <div className="mb-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full text-[14px] leading-[1.6] text-[var(--text-1)] min-h-[80px] p-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg outline-none"
              autoFocus
            />
            
            {/* Media management in edit mode */}
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {localMedia.map((m, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)]">
                    <Image src={m.url} alt="post" fill className="object-cover" />
                    <button onClick={() => removeLocalMedia(m.url)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {newFiles.map((f, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[rgb(var(--primary-rgb))] opacity-60">
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[10px] text-center p-1">{f.name}</div>
                    <button onClick={() => setNewFiles(newFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(localMedia.length + newFiles.length < 5) && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Send className="w-4 h-4 text-[var(--text-3)]" />
                    <span className="text-[10px] text-[var(--text-3)] mt-1">Add</span>
                    <input type="file" hidden multiple accept="image/*,video/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => { setIsEditing(false); setEditContent(post.content); setLocalMedia(post.media || []); setNewFiles([]); }} className="btn-ghost px-3 py-1 text-xs">Cancel</button>
              <button onClick={handleUpdate} disabled={isUpdating} className="btn-primary px-3 py-1 text-xs">Save Changes</button>
            </div>
          </div>
        ) : (
          <p className="text-[14px] leading-[1.6] text-[var(--text-1)] whitespace-pre-wrap" style={{ letterSpacing: "-0.005em" }}>
            {post.content}
          </p>
        )}
      </div>

      {/* ── Media ──────────────────────────────────────────── */}
      {post.media?.length > 0 && (
        <div className={cn(
          "w-full overflow-hidden border-y border-[var(--border)]",
          post.media.length > 1 && "grid grid-cols-2 gap-px bg-[var(--border)]"
        )}>
          {post.media.map((m, i) => (
            <div key={i} className={cn("relative bg-[var(--surface-2)]", post.media.length === 1 ? "aspect-video" : "aspect-square")}>
              {m.type === "image"
                ? <Image src={m.url} alt="post media" fill sizes="(max-width:768px)100vw,50vw" className="object-cover" />
                : <video src={m.url} controls className="w-full h-full object-cover" />
              }
            </div>
          ))}
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────── */}
      {(likes > 0 || post.commentCount > 0) && (
        <div className="px-5 py-2 flex items-center justify-between">
          {likes > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-[rgb(var(--primary-rgb))] flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 fill-white text-white" />
              </div>
              <span className="text-[12px] text-[var(--text-3)]">{likes}</span>
            </div>
          ) : <div />}
          {post.commentCount > 0 && (
            <button
              onClick={fetchComments}
              className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
            >
              {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      )}

      {/* ── Action Bar ─────────────────────────────────────── */}
      <div className="flex items-center border-t border-[var(--border)]">
        {[
          {
            icon: Heart,
            label: "Like",
            active: isLiked,
            onClick: handleLike,
            activeClass: "text-[rgb(var(--primary-rgb))]",
          },
          {
            icon: MessageSquare,
            label: "Comment",
            active: showComments,
            onClick: fetchComments,
            activeClass: "text-[rgb(var(--primary-rgb))]",
          },
          {
            icon: Share2,
            label: "Share",
            active: false,
            onClick: handleShare,
            activeClass: "",
          },
        ].map(({ icon: Icon, label, active, onClick, activeClass }) => (
          <button
            key={label}
            onClick={onClick}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-11 text-[13px] font-medium transition-all duration-150",
              "hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]",
              active ? activeClass : "text-[var(--text-2)]"
            )}
          >
            <motion.div animate={active && label === "Like" ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.25 }}>
              <Icon className={cn("w-[17px] h-[17px]", active && label === "Like" && "fill-current")} />
            </motion.div>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Comments Section ───────────────────────────────── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[var(--border)]"
          >
            {/* Comment input */}
            <div className="px-5 py-3 flex gap-3">
              <Avatar src={user?.avatar} alt={user?.firstName} size="sm" className="flex-shrink-0 mt-0.5" />
              <form onSubmit={handleAddComment} className="flex-1 flex items-center gap-2">
                <input
                  placeholder="Write a comment…"
                  className="input text-[13px] py-2 flex-1"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  disabled={!newComment.trim()}
                  type="submit"
                  className="w-8 h-8 rounded-lg bg-[rgb(var(--primary-rgb))] text-white flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Comment list */}
            {loadingComments ? (
              <div className="px-5 pb-4 text-[13px] text-[var(--text-3)] text-center">Loading…</div>
            ) : (
              <div className="px-5 pb-4 space-y-3">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <Avatar src={c.author?.avatar} alt={c.author?.firstName} size="sm" className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 bg-[var(--surface-2)] rounded-xl rounded-tl-sm px-3.5 py-2.5">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="font-semibold text-[12px] text-[var(--text-1)] tracking-tight">
                          {c.author?.firstName} {c.author?.lastName}
                        </span>
                        <span className="text-[10px] text-[var(--text-3)] flex-shrink-0">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[13px] text-[var(--text-1)] leading-snug">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
