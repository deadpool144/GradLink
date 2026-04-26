"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Search, MapPin, Users, Briefcase, Filter, Loader2, UserPlus, MessageSquare, Check } from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DirectoryPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");

  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (query) q.append("q", query);
      if (batch) q.append("batch", batch);
      if (department) q.append("department", department);

      const { data } = await api.get(`/users/directory?${q.toString()}`);
      setUsers(data.data.data);
    } catch (err) {
      toast.error("Failed to load directory");
    } finally {
      setLoading(false);
    }
  }, [query, batch, department]);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const { data } = await api.get("/users/suggestions?limit=6");
      setSuggestions(data.data);
    } catch (err) {
      console.error("Failed to load suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectory();
    fetchSuggestions();
  }, [fetchDirectory, fetchSuggestions]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDirectory();
  };

  const handleConnect = async (targetId) => {
    try {
      await api.post(`/users/${targetId}/connect`);
      toast.success("Connection request sent");
      setUsers(prev => prev.map(u => 
        u._id === targetId ? { ...u, connectionRequests: ["pending"] } : u
      ));
      setSuggestions(prev => prev.filter(s => s._id !== targetId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleRemoveConnection = async (targetId) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      await api.delete(`/users/${targetId}/connect`);
      toast.success("Connection removed");
      setUsers(prev => prev.map(u => 
        u._id === targetId ? { ...u, connections: [] } : u
      ));
    } catch (err) {
      toast.error("Failed to remove connection");
    }
  };

  const handleMessage = async (targetId) => {
    try {
      const { data } = await api.post("/messages/dm", { targetId });
      router.push(`/messages?convId=${data.data._id}`);
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  };

  return (
    <div className="p-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Alumni Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Connect with graduates from your batch and department</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or headline..."
            className="input pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 px-3 py-1.5 text-slate-500 border-r border-slate-200 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold">Filters</span>
        </div>
        
        <select 
          className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-primary"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {Array.from({ length: 26 }, (_, i) => 2000 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select 
          className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-primary"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electronics">Electronics</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Civil">Civil</option>
          <option value="MBA">MBA</option>
        </select>

        {(batch || department || query) && (
          <button 
            onClick={() => { setBatch(""); setDepartment(""); setQuery(""); }}
            className="text-sm text-primary font-semibold px-4"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Suggestions Section */}
      {!query && !batch && !department && suggestions.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              People you may know
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {suggestions.map((s) => (
              <div key={s._id} className="min-w-[240px] max-w-[240px] card p-4 flex flex-col items-center text-center">
                <Link href={`/profile/${s._id}`} className="w-16 h-16 rounded-2xl overflow-hidden relative mb-3 ring-2 ring-primary/10 ring-offset-2">
                  {s.avatar ? <Image src={s.avatar} fill className="object-cover" alt="S" /> : <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">{s.firstName[0]}</div>}
                </Link>
                <h4 className="font-bold text-sm truncate w-full">{s.firstName} {s.lastName}</h4>
                <p className="text-[10px] text-slate-500 truncate w-full mb-4">{s.headline || "Alumni"}</p>
                <button 
                  onClick={() => handleConnect(s._id)}
                  className="w-full btn-primary py-1.5 text-xs flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Directory Table/Grid Header */}
      <h2 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        {query || batch || department ? "Search Results" : "Alumni Directory"}
      </h2>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => {
            // Check if connected
            const isConnected = u.connections?.some(id => id === "me" || id._id === "me") || false; 
            // In a real app with Redux, we'd check against state.auth.user.connections
            // Here we assume the server send includes connection info or we use a better check
            const isPending = u.connectionRequests?.length > 0;

            return (
              <div key={u._id} className="card group hover:shadow-md transition-all duration-300">
                <div className="h-20 bg-gradient-to-br from-primary/10 to-purple-50 dark:from-indigo-950/20 dark:to-purple-900/10 relative overflow-hidden" />
                <div className="px-5 pb-5 pt-0 relative">
                  <Link href={`/profile/${u._id}`} className="block relative -mt-10 mb-3 w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                    {u.avatar ? (
                      <Image src={u.avatar} fill alt="P" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold text-xl">
                        {u.firstName?.[0]}
                      </div>
                    )}
                  </Link>
                  
                  <Link href={`/profile/${u._id}`} className="block">
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight hover:text-primary transition-colors">
                      {u.firstName} {u.lastName}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5 uppercase tracking-wider">{u.headline || "Alumni Member"}</p>
                  </Link>

                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleMessage(u._id)}
                      className="flex-1 btn-secondary py-2 text-xs text-center flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 font-bold" />
                      Message
                    </button>
                    
                    {isConnected ? (
                      <button 
                        onClick={() => handleRemoveConnection(u._id)}
                        className="p-2 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Remove Connection"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleConnect(u._id)}
                        disabled={isPending}
                        className={clsx(
                          "p-2 flex items-center justify-center rounded-xl transition-colors",
                          isPending 
                            ? "bg-slate-100 text-slate-400 cursor-default" 
                            : "bg-primary text-white hover:bg-indigo-700"
                        )}
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-20 text-center text-slate-400">
          <p className="text-lg font-bold">No alumni found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}
