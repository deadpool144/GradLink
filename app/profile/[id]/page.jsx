"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import api from "@/lib/api";
import PostCard from "@/components/PostCard";
import {
  MapPin, Calendar, Briefcase, Link as LinkIcon, Edit,
  MessageSquare, UserPlus, Check, UserMinus, Loader2, Camera, ArrowLeft, ArrowRight
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me } = useSelector((s) => s.auth);
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);

  const isMe = me?._id === id || id === "me";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetId = id === "me" ? "me" : id;
        const { data } = await api.get(`/users/${targetId}`);
        setUser(data.data);
        
        // Fetch posts by this user
        const { data: postData } = await api.get(`/posts/user/${data.data._id}`);
        setPosts(postData.data.data || []);
      } catch (err) {
        toast.error("User not found");
        router.push("/feed");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, router]);

  const handleConnect = async () => {
    setReqLoading(true);
    try {
      await api.post(`/users/${user._id}/connect`);
      toast.success("Connection request sent");
      // Update local state for immediate feedback
      setUser({ ...user, connectionRequests: [...(user.connectionRequests || []), me._id] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setReqLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const { data } = await api.post("/messages/dm", { targetId: user._id });
      router.push(`/messages?convId=${data.data._id}`);
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  };

  const handleRemoveConnection = async () => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      await api.delete(`/users/${user._id}/connect`);
      toast.success("Connection removed");
      setUser({ ...user, connections: user.connections.filter(c => c._id !== me._id && c !== me._id) });
    } catch (err) {
      toast.error("Failed to remove connection");
    }
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied!");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  const isConnected = user?.connections?.some(c => c._id === me?._id || c === me?._id);
  const isPending   = user?.connectionRequests?.includes(me?._id);

  return (
    <div className="max-w-4xl mx-auto pt-6 px-6 pb-10">
      {/* Cover & Avatar Header */}
      <div className="card overflow-hidden mb-6">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 relative">
          {user?.coverImage && <Image src={user.coverImage} fill alt="Cover" className="object-cover" />}
          {isMe && (
            <button className="absolute bottom-4 right-4 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white transition-colors">
              <Camera className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
          )}
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="relative -mt-16 mb-4 w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-md">
            {user?.avatar ? (
              <Image src={user.avatar} fill alt="Avatar" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold text-4xl">
                {user?.firstName?.[0]}
              </div>
            )}
            {isMe && (
              <button className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-lg leading-snug">{user?.headline || "No headline yet"}</p>
              
              <div className="flex flex-wrap gap-y-2 gap-x-5 mt-4 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {user?.location || "Unknown"}</span>
                <span className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-indigo-950/50 text-primary dark:text-indigo-400 border border-primary/20 dark:border-indigo-900/50">
                   {user?.connections?.length || 0} connections
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 lg:pt-0">
              {isMe ? (
                <div className="flex gap-2 w-full lg:w-auto">
                  <button onClick={() => router.push("/profile/edit")} className="flex-1 lg:flex-none btn-secondary flex items-center justify-center gap-2 px-6">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                  <button onClick={handleShareProfile} className="btn-ghost p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 w-full lg:w-auto">
                  {isConnected ? (
                    <>
                      <button onClick={handleMessage} className="flex-1 lg:flex-none btn-primary flex items-center justify-center gap-2 px-6">
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                      <button onClick={handleRemoveConnection} className="btn-secondary px-4 text-red-600 hover:bg-red-50" title="Remove Connection">
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </>
                  ) : isPending ? (
                    <button disabled className="flex-1 lg:flex-none btn-secondary flex items-center justify-center gap-2 opacity-70 px-6 cursor-default">
                      <Check className="w-4 h-4" /> Pending
                    </button>
                  ) : (
                    <button onClick={handleConnect} disabled={reqLoading} className="flex-1 lg:flex-none btn-primary flex items-center justify-center gap-2 px-6">
                      {reqLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Connect
                    </button>
                  )}
                  <button onClick={handleShareProfile} className="btn-secondary px-4">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Info */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold mb-4">About</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {user?.bio || "This user hasn't added a bio yet."}
            </p>
            <div className="mt-4 space-y-3">
              {user?.batch && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Batch of <span className="font-semibold text-slate-800 dark:text-slate-200">{user.batch}</span></span>
                </div>
              )}
              {user?.department && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{user.department}</span>
                </div>
              )}
              {user?.website && (
                <div className="flex items-center gap-3 text-sm">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  <a href={user.website} target="_blank" className="text-primary hover:underline">{user.website.replace(/^https?:\/\//, "")}</a>
                </div>
              )}
            </div>
          </div>

          {/* Experience Section */}
          {user?.experience?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Experience
              </h3>
              <div className="space-y-4">
                {user.experience.map((ex, i) => (
                  <div key={i} className="border-l-2 border-slate-100 dark:border-slate-800 pl-4 relative">
                    <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-1.5" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{ex.title}</h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{ex.company}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ex.from} — {ex.to || "Present"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {user?.education?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Education
              </h3>
              <div className="space-y-4">
                {user.education.map((ed, i) => (
                  <div key={i} className="border-l-2 border-slate-100 dark:border-slate-800 pl-4 relative">
                    <div className="absolute w-2 h-2 rounded-full bg-indigo-500 -left-[5px] top-1.5" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{ed.school}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{ed.degree}{ed.fieldOfStudy ? `, ${ed.fieldOfStudy}` : ""}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ed.from} — {ed.to}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mid/Right Col: Activity */}
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="font-bold">Recent Activity</h3>
            {isMe && (
              <button 
                onClick={() => router.push("/manage-content")}
                className="text-sm text-primary font-bold hover:underline flex items-center gap-1"
              >
                Manage All Content <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {posts.length > 0 ? (
              <>
                {posts.slice(0, 3).map(post => (
                  <PostCard key={post._id} post={post} onDelete={(id) => setPosts(posts.filter(p => p._id !== id))} />
                ))}
                {posts.length > 3 && (
                  <button 
                    onClick={() => router.push(isMe ? "/manage-content" : `/profile/${user._id}/posts`)}
                    className="w-full card p-4 text-center text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                  >
                    View all {posts.length} posts
                  </button>
                )}
              </>
            ) : (
              <div className="card p-10 text-center text-slate-400">
                <p>No activity to show yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
