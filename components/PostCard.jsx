"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2, Send } from "lucide-react";
import { useSelector } from "react-redux";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function PostCard({ post, onDelete }) {
  const { user } = useSelector((s) => s.auth);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setIsLiked(data.data.liked);
      setLikes(data.data.likeCount);
    } catch (err) {
      toast.error("Failed to like post");
    }
  };

  const fetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setLoadingComments(true);
    try {
      const { data } = await api.get(`/posts/${post._id}/comments`);
      setComments(data.data.data);
      setShowComments(true);
    } catch (err) {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: newComment });
      setComments([...comments, data.data]);
      setNewComment("");
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success("Post deleted");
      if (onDelete) onDelete(post._id);
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
        <Link href={`/profile/${post.author?._id}`} className="flex items-center gap-3 group">
          <Avatar src={post.author?.avatar} alt={post.author?.firstName} size="md" />
          <div>
            <h3 className="font-semibold text-sm group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">
              {post.author?.firstName} {post.author?.lastName}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{post.author?.headline || "Alumni"}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </p>
          </div>
        </Link>
        {post.author?._id === user?._id && (
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <MoreHorizontal className="w-5 h-5 text-slate-500" />
            </Button>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50 p-1">
                  <button
                    onClick={() => { setIsDropdownOpen(false); handleDelete(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" /> Delete post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent className="px-4 py-2">
        <p className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
          {post.content}
        </p>
      </CardContent>

      {/* Media */}
      {post.media?.length > 0 && (
        <div className={cn(
          "w-full bg-slate-100 dark:bg-slate-950 mt-2",
          post.media.length === 1 ? "pb-[56.25%]" : "grid grid-cols-2 gap-0.5",
          post.media.length === 1 && "relative"
        )}>
          {post.media.map((m, i) => (
            <div key={i} className={post.media.length === 1 ? "absolute inset-0" : "relative aspect-square"}>
              {m.type === "image" ? (
                <Image src={m.url} alt="post media" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
              ) : (
                <video src={m.url} controls className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {(likes > 0 || post.commentCount > 0) && (
        <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800/60">
          {likes > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-900 z-10">
                  <Heart className="w-2.5 h-2.5 fill-white text-white" />
                </div>
              </div>
              <span>{likes}</span>
            </div>
          ) : <div />}
          {post.commentCount > 0 && (
            <div className="hover:underline cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={fetchComments}>
              {post.commentCount} comments
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center px-2 py-1 gap-1 border-b border-slate-100 dark:border-slate-800/60">
        <Button
          variant="ghost"
          asMotion={!isLiked}
          className={cn(
            "flex-1 h-12 rounded-lg font-semibold gap-2 items-center",
            isLiked ? "text-blue-600 dark:text-blue-500" : "text-slate-600 dark:text-slate-400"
          )}
          onClick={handleLike}
        >
          <motion.div animate={isLiked ? { scale: [1, 1.2, 1], rotate: [0, -10, 0] } : {}} transition={{ duration: 0.3 }}>
            <Heart className={cn("w-[18px] h-[18px]", isLiked && "fill-current")} />
          </motion.div>
          <span>Like</span>
        </Button>
        <Button
          variant="ghost" 
          className="flex-1 h-12 rounded-lg font-semibold text-slate-600 gap-2 items-center dark:text-slate-400"
          onClick={fetchComments}
        >
          <MessageSquare className="w-[18px] h-[18px]" />
          <span>Comment</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 h-12 rounded-lg font-semibold text-slate-600 gap-2 items-center dark:text-slate-400"
          onClick={handleShare}
        >
          <Share2 className="w-[18px] h-[18px]" />
          <span>Share</span>
        </Button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/50"
          >
            <div className="p-4 flex gap-3">
              <Avatar src={user?.avatar} alt={user?.firstName} size="md" className="mt-1" />
              <form onSubmit={handleAddComment} className="flex-1 relative flex items-center">
                <Input
                  placeholder="Add a comment..."
                  className="pr-12 rounded-full bg-white dark:bg-slate-950 shadow-sm"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button 
                  disabled={!newComment.trim()} 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 w-8 h-8 rounded-full text-primary hover:bg-slate-100"
                  type="submit"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {loadingComments ? (
              <div className="p-4 text-center text-sm text-slate-500">Loading comments...</div>
            ) : (
              <div className="px-4 pb-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar src={comment.author?.avatar} alt={comment.author?.firstName} size="sm" />
                    <div className="flex-1 group">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 inline-block max-w-[90%]">
                        <div className="flex items-center justify-between gap-4 mb-0.5">
                          <h4 className="font-semibold text-sm hover:underline cursor-pointer">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </h4>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {formatDistanceToNow(new Date(comment.createdAt))}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

