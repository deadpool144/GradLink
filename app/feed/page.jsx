"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (p = 1) => {
    if (p === 1) setLoading(true);
    try {
      const { data } = await api.get(`/posts/feed?page=${p}&limit=10`);
      if (p === 1) setPosts(data.data.data);
      else setPosts((prev) => [...prev, ...data.data.data]);
      
      if (data.data.data.length < 10) setHasMore(false);
    } catch (err) {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchFeed(1));
  }, [fetchFeed]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((p) => p._id !== postId));
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchFeed(next);
  };

  return (
    <div className="w-full pb-10 pt-4 sm:pt-6">
      <PostComposer onPostCreated={handlePostCreated} />

      {loading && page === 1 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
          ))}
          
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Load More
            </button>
          )}
        </div>
      ) : (
        <div className="card p-10 text-center text-slate-500">
          <p>No posts yet. Start by following alumni or creating a post!</p>
        </div>
      )}
    </div>
  );
}
