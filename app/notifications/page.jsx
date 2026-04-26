"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";
import { setNotifications, clearUnread } from "@/lib/slices/notifSlice";
import { Heart, MessageSquare, UserPlus, Check, Bell, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((s) => s.notif);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get("/notifications");
        dispatch(setNotifications({ notifs: data.data.data, unread: data.data.unreadCount }));
        api.put("/notifications/read-all");
        dispatch(clearUnread());
      } catch (err) {
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [dispatch]);

  const handleResponse = async (notifId, senderId, action) => {
    setActionLoading(notifId);
    try {
      await api.post(`/users/${senderId}/respond`, { action });
      toast.success(action === "accept" ? "Connection accepted" : "Request ignored");
      const updatedNotifs = notifications.filter(n => n._id !== notifId);
      dispatch(setNotifications({ notifs: updatedNotifs, unread: 0 }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    try {
      await api.delete("/notifications/clear");
      dispatch(setNotifications({ notifs: [], unread: 0 }));
      toast.success("Notifications cleared");
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  const handleDeleteOne = async (e, notifId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${notifId}`);
      const updatedNotifs = notifications.filter(n => n._id !== notifId);
      dispatch(setNotifications({ notifs: updatedNotifs, unread: 0 }));
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like": return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case "comment": return <MessageSquare className="w-4 h-4 text-primary" />;
      case "connection_request": return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "connection_accepted": return <Check className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-6 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated with your network&apos;s activity</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="btn-ghost text-sm text-red-600 font-semibold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-50 dark:border-slate-800/30">
        {(notifications && notifications.length > 0) ? (
          notifications.map((n) => (
            <div key={n._id} className={`group p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? "bg-primary/10/30 dark:bg-indigo-900/10" : ""}`}>
              <div className="relative shrink-0">
                <Link href={`/profile/${n.sender?._id}`} className="block w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                  {n.sender?.avatar ? (
                    <Image src={n.sender.avatar} fill alt="P" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold uppercase">
                      {n.sender?.firstName?.[0]}
                    </div>
                  )}
                </Link>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 flex items-center justify-center shadow-sm">
                  {getIcon(n.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-tight">
                      <Link href={`/profile/${n.sender?._id}`} className="font-bold hover:text-primary transition-colors">
                        {n.sender?.firstName} {n.sender?.lastName}
                      </Link>
                      {" "}{n.text}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => handleDeleteOne(e, n._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {n.type === "connection_request" && (
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => handleResponse(n._id, n.sender._id, "accept")}
                      disabled={actionLoading === n._id}
                      className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2"
                    >
                      {actionLoading === n._id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Accept
                    </button>
                    <button 
                      onClick={() => handleResponse(n._id, n.sender._id, "reject")}
                      disabled={actionLoading === n._id}
                      className="btn-secondary py-1.5 px-4 text-xs"
                    >
                      Ignore
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="font-bold">No notifications yet</p>
            <p className="text-sm">We&apos;ll let you know when something happens.</p>
          </div>
        )}
      </div>
    </div>
  );
}
