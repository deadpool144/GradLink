"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import api from "@/lib/api";
import {
  Search, MapPin, Users, Briefcase, Filter,
  Loader2, UserPlus, MessageSquare, Check, X,
  UserCheck, Clock, LayoutGrid, UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: "all",         label: "All Alumni",  icon: Users },
  { id: "connections", label: "My Network",  icon: UserCheck },
];

// ── User Card ─────────────────────────────────────────────────────────────────
function AlumniCard({ u, myId, onConnect, onRemove, onMessage, isConnectionCard = false }) {
  const isConnected  = u.connections?.some(id => (id._id || id)?.toString() === myId);
  const isPending    = !isConnected && u.connectionRequests?.some(id => (id._id || id)?.toString() === myId);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] transition-all duration-200 group">
      {/* Banner strip */}
      <div className="h-16 bg-gradient-to-r from-[rgb(var(--primary-rgb))] to-violet-500 opacity-80" />

      <div className="px-5 pb-5 relative">
        {/* Avatar */}
        <Link href={`/profile/${u._id}`} className="block -mt-8 mb-3 w-14 h-14 rounded-xl border-2 border-[var(--surface)] overflow-hidden relative shadow-[var(--shadow-sm)] group-hover:scale-105 transition-transform">
          {u.avatar
            ? <Image src={u.avatar} fill sizes="56px" alt={`${u.firstName}`} className="object-cover" />
            : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg"
                style={{ background: "var(--primary-alpha)", color: "rgb(var(--primary-rgb))" }}>
                {u.firstName?.[0]}
              </div>
            )
          }
        </Link>

        {/* Info */}
        <Link href={`/profile/${u._id}`}>
          <h3 className="font-bold text-[14px] text-[var(--text-1)] hover:text-[rgb(var(--primary-rgb))] transition-colors tracking-tight leading-tight">
            {u.firstName} {u.lastName}
          </h3>
        </Link>
        <p className="text-[11px] text-[var(--text-3)] font-medium truncate mt-0.5 uppercase tracking-wider">
          {u.headline || "Alumni Member"}
        </p>
        {(u.batch || u.department) && (
          <p className="text-[12px] text-[var(--text-2)] mt-1">
            {u.department && <span>{u.department}</span>}
            {u.batch && u.department && <span className="mx-1">·</span>}
            {u.batch && <span>Batch {u.batch}</span>}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onMessage(u._id)}
            className="flex-1 btn-secondary h-8 text-xs gap-1.5 rounded-xl"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </button>

          {isConnectionCard ? (
            <button
              onClick={() => onRemove(u._id)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex-shrink-0"
              title="Remove Connection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : isConnected ? (
            <button
              onClick={() => onRemove(u._id)}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
              title="Remove Connection"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          ) : isPending ? (
            <button disabled className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 opacity-50 cursor-not-allowed"
              style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
              title="Request pending"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onConnect(u._id)}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-primary)] transition-all hover:scale-105"
              style={{ background: "rgb(var(--primary-rgb))", color: "#fff" }}
              title="Connect"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DirectoryPage() {
  const router = useRouter();
  const { user: me } = useSelector(s => s.auth);

  const [tab,         setTab]         = useState("all");
  const [users,       setUsers]       = useState([]);
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [conLoading,  setConLoading]  = useState(false);
  const [query,       setQuery]       = useState("");
  const [batch,       setBatch]       = useState("");
  const [department,  setDepartment]  = useState("");
  const [requests,    setRequests]    = useState([]);

  // ── Fetch directory ──────────────────────────────────────────────
  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (query)      q.append("q", query);
      if (batch)      q.append("batch", batch);
      if (department) q.append("department", department);
      const { data } = await api.get(`/users/directory?${q.toString()}`);
      setUsers(data.data.data);
    } catch { toast.error("Failed to load directory"); }
    finally { setLoading(false); }
  }, [query, batch, department]);

  // ── Fetch my connections ─────────────────────────────────────────
  const fetchConnections = useCallback(async () => {
    setConLoading(true);
    try {
      const { data } = await api.get("/users/me/connections");
      setConnections(data.data);
    } catch { toast.error("Failed to load connections"); }
    finally { setConLoading(false); }
  }, []);

  // ── Fetch suggestions ────────────────────────────────────────────
  const fetchSuggestions = useCallback(async () => {
    try {
      const { data } = await api.get("/users/suggestions?limit=6");
      setSuggestions(data.data);
    } catch { /* silent */ }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await api.get("/users/me/requests");
      setRequests(data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchDirectory();
    fetchSuggestions();
    fetchRequests();
  }, [fetchDirectory, fetchSuggestions, fetchRequests]);

  useEffect(() => {
    if (tab === "connections") fetchConnections();
  }, [tab, fetchConnections]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleConnect = async (targetId) => {
    try {
      await api.post(`/users/${targetId}/connect`);
      toast.success("Connection request sent!");
      // Mark as pending in directory list
      setUsers(prev => prev.map(u =>
        u._id === targetId
          ? { ...u, connectionRequests: [...(u.connectionRequests || []), me?._id] }
          : u
      ));
      setSuggestions(prev => prev.filter(s => s._id !== targetId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleRemove = async (targetId) => {
    if (!confirm("Remove this connection?")) return;
    try {
      await api.delete(`/users/${targetId}/connect`);
      toast.success("Connection removed");
      setConnections(prev => prev.filter(c => c._id !== targetId));
      setUsers(prev => prev.map(u =>
        u._id === targetId
          ? { ...u, connections: (u.connections || []).filter(id => (id._id || id)?.toString() !== me?._id) }
          : u
      ));
    } catch { toast.error("Failed to remove connection"); }
  };

  const handleMessage = async (targetId) => {
    try {
      const { data } = await api.post("/messages/dm", { targetId });
      router.push(`/messages?convId=${data.data._id}`);
    } catch { toast.error("Failed to start conversation"); }
  };

  const handleRespond = async (targetId, action) => {
    try {
      await api.post(`/users/${targetId}/respond`, { action });
      toast.success(`Request ${action}ed`);
      setRequests(prev => prev.filter(r => r._id !== targetId));
      if (action === "accept") {
        fetchConnections();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to respond");
    }
  };

  return (
    <div className="pb-10">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text-1)] tracking-tight">Alumni Directory</h1>
        <p className="text-[13px] text-[var(--text-2)] mt-1">Find and connect with graduates from your batch and department</p>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-[var(--surface-2)] rounded-xl w-fit border border-[var(--border)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all",
              tab === id
                ? "bg-[var(--surface)] text-[rgb(var(--primary-rgb))] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-2)] hover:text-[var(--text-1)]"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {id === "connections" && connections.length > 0 && (
              <span className="min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{ background: "var(--primary-alpha)", color: "rgb(var(--primary-rgb))" }}>
                {connections.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ALL ALUMNI tab ──────────────────────────────────── */}
      {tab === "all" && (
        <>
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
              <input
                type="text"
                placeholder="Search by name, headline…"
                className="input pl-9 pr-4 text-[13px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchDirectory()}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                className="input text-[13px] w-auto px-3 py-2 h-auto"
                style={{ width: "auto" }}
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              >
                <option value="">All Batches</option>
                {Array.from({ length: 26 }, (_, i) => 2000 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                className="input text-[13px] w-auto px-3 py-2 h-auto"
                style={{ width: "auto" }}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {["Computer Science", "Electronics", "Mechanical", "Civil", "MBA"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {(batch || department || query) && (
                <button
                  onClick={() => { setBatch(""); setDepartment(""); setQuery(""); }}
                  className="btn-ghost h-9 px-3 text-[13px] gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Invitations */}
          {!query && requests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[14px] font-bold text-[var(--text-1)] mb-4 flex items-center gap-2 tracking-tight">
                <Clock className="w-4 h-4" style={{ color: "rgb(var(--primary-rgb))" }} />
                Invitations ({requests.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map(req => (
                  <div key={req._id} className="card p-4 flex items-center gap-4">
                    <Avatar src={req.avatar} alt={req.firstName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[13px] truncate">{req.firstName} {req.lastName}</h4>
                      <p className="text-[11px] text-[var(--text-2)] truncate">{req.headline || "No headline"}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleRespond(req._id, "accept")} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRespond(req._id, "reject")} className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People you may know */}
          {!query && !batch && !department && suggestions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[14px] font-bold text-[var(--text-1)] mb-4 flex items-center gap-2 tracking-tight">
                <UserPlus className="w-4 h-4" style={{ color: "rgb(var(--primary-rgb))" }} />
                People you may know
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-3">
                {suggestions.map(s => (
                  <div key={s._id}
                    className="min-w-[200px] max-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-[var(--shadow-md)] transition-shadow">
                    <Link href={`/profile/${s._id}`} className="w-14 h-14 rounded-xl overflow-hidden relative mb-3 block">
                      {s.avatar
                        ? <Image src={s.avatar} fill sizes="56px" alt={s.firstName} className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center font-bold text-lg"
                            style={{ background: "var(--primary-alpha)", color: "rgb(var(--primary-rgb))" }}>
                            {s.firstName?.[0]}
                          </div>
                      }
                    </Link>
                    <h4 className="font-bold text-[13px] text-[var(--text-1)] truncate w-full tracking-tight">{s.firstName} {s.lastName}</h4>
                    <p className="text-[11px] text-[var(--text-3)] truncate w-full mb-4">{s.headline || "Alumni"}</p>
                    <button
                      onClick={() => handleConnect(s._id)}
                      className="w-full btn-primary h-8 text-[12px] gap-1.5"
                    >
                      <UserPlus className="w-3 h-3" /> Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section heading */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold text-[var(--text-1)] flex items-center gap-2 tracking-tight">
              <Users className="w-4 h-4" style={{ color: "rgb(var(--primary-rgb))" }} />
              {query || batch || department ? "Search Results" : "All Alumni"}
              {!loading && <span className="text-[var(--text-3)] font-normal ml-1">({users.length})</span>}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--primary-rgb))" }} />
            </div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => (
                <AlumniCard
                  key={u._id}
                  u={u}
                  myId={me?._id}
                  onConnect={handleConnect}
                  onRemove={handleRemove}
                  onMessage={handleMessage}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--surface-2)" }}>
                <Users className="w-6 h-6" style={{ color: "var(--text-3)" }} />
              </div>
              <p className="font-semibold text-[var(--text-1)]">No alumni found</p>
              <p className="text-[13px] text-[var(--text-2)] mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}

      {/* ── MY NETWORK tab ─────────────────────────────────── */}
      {tab === "connections" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold text-[var(--text-1)] flex items-center gap-2 tracking-tight">
              <UserCheck className="w-4 h-4" style={{ color: "rgb(var(--primary-rgb))" }} />
              My Connections
              {!conLoading && <span className="text-[var(--text-3)] font-normal ml-1">({connections.length})</span>}
            </h2>
          </div>

          {conLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--primary-rgb))" }} />
            </div>
          ) : connections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map(c => (
                <AlumniCard
                  key={c._id}
                  u={c}
                  myId={me?._id}
                  onConnect={handleConnect}
                  onRemove={handleRemove}
                  onMessage={handleMessage}
                  isConnectionCard
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--surface-2)" }}>
                <UserCheck className="w-6 h-6" style={{ color: "var(--text-3)" }} />
              </div>
              <p className="font-semibold text-[var(--text-1)]">No connections yet</p>
              <p className="text-[13px] text-[var(--text-2)] mt-1 mb-5">Start connecting with fellow alumni</p>
              <button onClick={() => setTab("all")} className="btn-primary h-9 px-5 text-sm gap-2">
                <Users className="w-4 h-4" /> Browse Alumni
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
