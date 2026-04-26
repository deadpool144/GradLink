"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function SharedPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.data);
      } catch (err) {
        toast.error("Post not found or deleted");
        router.push("/feed");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-10 pt-4 sm:pt-6 px-4 sm:px-0">
      <button 
        onClick={() => router.push("/feed")}
        className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </button>

      {post ? (
        <PostCard 
          post={post} 
          onDelete={() => router.push("/feed")} 
        />
      ) : (
        <div className="card p-10 text-center text-slate-500">
          <p>This post is no longer available.</p>
        </div>
      )}
    </div>
  );
}
