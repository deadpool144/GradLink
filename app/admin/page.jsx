"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { 
  Users, FileText, Calendar, Shield, 
  MoreVertical, Search, Loader2, ArrowUpRight, ArrowDownRight,
  Ban, Trash2, CheckCircle, XCircle
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="card p-6 flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h3>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend > 0 ? "text-emerald-500" : "text-rose-500"}`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users")
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data.data);
      } catch (err) {
        toast.error("Admin access denied or failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success("User role updated");
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-block`);
      const updatedUser = data.data;
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: updatedUser.isBlocked } : u));
      toast.success(updatedUser.isBlocked ? "User blocked" : "User unblocked");
      setActiveMenu(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to block user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success("User deleted permanently");
      setActiveMenu(null);
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const s = query.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(s) ||
      u.lastName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s)
    );
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform management and analytics</p>
        </div>
        <div className="flex items-center gap-2 p-2 px-3 bg-primary/10 dark:bg-indigo-900/30 rounded-2xl border border-primary/20 dark:border-indigo-800">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[11px] font-bold text-primary dark:text-indigo-400 uppercase tracking-tighter">System Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-primary shadow-lg shadow-primary/20" trend={12} />
        <StatCard title="Verified Users" value={stats?.verifiedUsers || 0} icon={CheckCircle} color="bg-emerald-600 shadow-lg shadow-emerald-600/20" trend={8} />
        <StatCard title="Total Posts" value={stats?.totalPosts || 0} icon={FileText} color="bg-violet-600 shadow-lg shadow-violet-600/20" trend={5} />
        <StatCard title="Total Events" value={stats?.totalEvents || 0} icon={Calendar} color="bg-amber-600 shadow-lg shadow-amber-600/20" trend={-2} />
      </div>

      {/* User Management */}
      <div className="card overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-[var(--surface)]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">User Directory</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-bold">{filteredUsers.length}</span>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search alumni..." 
                className="input py-2.5 pl-10 pr-4 text-sm w-full sm:w-80 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 uppercase tracking-widest text-[10px]">Alumni Profile</th>
                <th className="px-6 py-4 uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 uppercase tracking-widest text-[10px]">User Role</th>
                <th className="px-6 py-4 uppercase tracking-widest text-[10px]">Joined</th>
                <th className="px-6 py-4 uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                        {u.avatar ? <Image src={u.avatar} fill alt="P" className="object-cover" /> : <div className="w-full h-full bg-primary/10 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 flex items-center justify-center font-black text-xl">{u.firstName?.[0]}</div>}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-extrabold text-slate-900 dark:text-white truncate ${u.isBlocked ? 'opacity-50' : ''}`}>{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <span className={`w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${u.isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                        {u.isVerified ? "Verified" : "Pending"}
                      </span>
                      {u.isBlocked && (
                        <span className="w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          Blocked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary cursor-pointer px-3 py-1.5"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="sub-admin">Sub-Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "N/A"}
                  </td>
                  <td className="px-6 py-5 relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === u._id ? null : u._id)}
                      className="btn-ghost p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
                    >
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>

                    <AnimatePresence>
                      {activeMenu === u._id && (
                        <motion.div 
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 p-2"
                        >
                          <button 
                            onClick={() => handleToggleBlock(u._id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-colors ${u.isBlocked ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                          >
                            {u.isBlocked ? (
                              <><CheckCircle className="w-4 h-4" /> Unblock User</>
                            ) : (
                              <><Ban className="w-4 h-4" /> Block User</>
                            )}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors mt-1"
                          >
                            <Trash2 className="w-4 h-4" /> Delete User
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="w-10 h-10 opacity-20" />
                      <p>No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
