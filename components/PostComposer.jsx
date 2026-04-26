"use client";
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Image as ImageIcon, Video, Send, Loader2, X } from "lucide-react";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function PostComposer({ onPostCreated }) {
  const { user } = useSelector((s) => s.auth);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      return toast.error("Max 5 files allowed");
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    const newPreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image"
    }));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    files.forEach(file => formData.append("files", file));

    try {
      const { data } = await api.post("/posts", formData);
      toast.success("Post shared!");
      setContent("");
      setFiles([]);
      setPreviews([]);
      setIsFocused(false);
      if (onPostCreated) onPostCreated(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 mb-6 transition-shadow duration-200 focus-within:shadow-md dark:focus-within:border-slate-700">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} alt={user?.firstName} size="md" className="shrink-0" />
        <div className="flex-1">
          <textarea
            placeholder="Start a post..."
            className={cn(
              "w-full bg-transparent border-none focus:ring-0 resize-none py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 transition-all",
              (isFocused || content || previews.length > 0) ? "min-h-[100px]" : "min-h-[48px]"
            )}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
              {previews.map((p, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {p.type === "image" ? (
                    <Image src={p.url} alt="preview" fill sizes="100px" className="object-cover" />
                  ) : (
                    <video src={p.url} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-2 right-2 p-1 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {((isFocused || content || previews.length > 0)) && (
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full flex items-center justify-center w-10 h-10 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"
                  title="Add Photo"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full flex items-center justify-center w-10 h-10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500"
                  title="Add Video"
                >
                  <Video className="w-5 h-5" />
                </Button>
              </div>

              <input
                type="file"
                hidden
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />

              <Button
                disabled={loading || (!content.trim() && files.length === 0)}
                onClick={handleSubmit}
                isLoading={loading}
                className="rounded-full px-5 font-semibold shadow-none"
              >
                Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
