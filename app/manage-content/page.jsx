"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "@/lib/api";
import PostCard from "@/components/PostCard";
import { LayoutDashboard, Loader2, Search, Filter, Trash2, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageContentPage() {
  const { user } = useSelector((s) => s.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("my"); // "my" or "all" (if admin)

  useEffect(() => {
    if (user?._id) fetchPosts();
  }, [filter, user?._id]);

  const fetchPosts = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      let url = "/posts";
      if (filter === "my") {
        url = `/posts/user/${user._id}`;
      }
      const { data } = await api.get(url);
      // Backend returns paginateResult which has data in .data
      setPosts(data.data.data || data.data || []);
    } catch (err) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.content?.toLowerCase().includes(search.toLowerCase()) ||
    `${p.author?.firstName} ${p.author?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    setPosts(posts.filter(p => p._id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto pt-8 px-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" /> Manage Content
          </h1>
          <p className="text-slate-500 mt-1">Review, edit, and moderate posts on the platform</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="input pl-10 h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {user?.role === "admin" && (
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="input h-10 text-sm w-32"
            >
              <option value="my">My Posts</option>
              <option value="all">All Users</option>
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-4">
             {filteredPosts.map(post => (
               <div key={post._id} className="relative group">
                 <PostCard post={post} onDelete={handleDelete} />
                 <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-primary/20">
                      MANAGEMENT MODE
                    </span>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="card p-20 text-center text-slate-400">
            <p className="text-lg font-medium">No posts found.</p>
            <p className="text-sm mt-1">Try a different search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
