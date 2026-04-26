"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Users, Calendar, Bell, LayoutDashboard } from "lucide-react";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/feed",          icon: Home,            label: "Feed" },
  { href: "/messages",      icon: MessageSquare,   label: "Messages" },
  { href: "/directory",     icon: Users,           label: "Directory" },
  { href: "/events",        icon: Calendar,        label: "Events" },
  { href: "/notifications", icon: Bell,            label: "Notifications" },
];

export default function Sidebar({ open, onClose, isMobile = false }) {
  const pathname = usePathname();
  const { user } = useSelector((s) => s.auth);
  const unread = useSelector((s) => s.notif.unreadCount);
  const chatUnread = useSelector((s) =>
    Object.values(s.chat.unread).reduce((a, b) => a + b, 0)
  );

  const containerClasses = isMobile
    ? cn(
        "fixed top-0 left-0 bottom-0 z-[70] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-500",
        open ? "translate-x-0" : "-translate-x-full"
      )
    : "flex flex-col bg-transparent";

  if (!isMobile && open) return null; // Don't show desktop one if mobile menu is open
  if (isMobile && !open) return null;

  return (
    <>
      {isMobile && open && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden" 
          onClick={onClose} 
        />
      )}

      <aside className={containerClasses}>
        {isMobile && (
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 mb-2">
            <Link href="/feed" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black">A</span>
              </div>
              <span className="font-extrabold text-xl tracking-tighter">AlumniConnect</span>
            </Link>
          </div>
        )}

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            const badge = label === "Messages" ? chatUnread : label === "Notifications" ? unread : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  "group flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-primary" : "")} />
                  {badge > 0 && active && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <span>{label}</span>
                {badge > 0 && !active && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 mt-4",
                pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
        </nav>

        {!isMobile && user && (
          <div className="mt-auto p-4 pb-6">
            <Link href={`/profile/${user._id}`}>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-primary/30 transition-colors shadow-sm dark:border-slate-800 dark:bg-slate-900 group">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} alt={user.firstName} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.headline || "View profile"}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
