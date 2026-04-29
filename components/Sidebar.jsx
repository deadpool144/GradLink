"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Users, Calendar, Bell, LayoutDashboard, GraduationCap, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/feed",           icon: Home,           label: "Feed" },
  { href: "/messages",       icon: MessageSquare,  label: "Messages" },
  { href: "/directory",      icon: Users,          label: "Directory" },
  { href: "/ai-assistant",   icon: Sparkles,       label: "AI Career Hub" },
  { href: "/manage-content", icon: LayoutDashboard, label: "Manage Content" },
  { href: "/events",         icon: Calendar,       label: "Events" },
  { href: "/notifications",  icon: Bell,           label: "Notifications" },
];

export default function Sidebar({ open, onClose, isMobile = false }) {
  const pathname = usePathname();
  const { user }       = useSelector((s) => s.auth);
  const unread         = useSelector((s) => s.notif.unreadCount);
  const chatUnread     = useSelector((s) =>
    Object.values(s.chat.unread).reduce((a, b) => a + b, 0)
  );

  if (!isMobile && open) return null;
  if (isMobile && !open) return null;

  const content = (
    <aside
      className={cn(
        "flex flex-col h-full",
        isMobile
          ? "fixed top-0 left-0 bottom-0 z-[70] w-72 bg-[var(--surface)] border-r border-[var(--border)] transition-transform duration-300"
          : "bg-transparent"
      )}
      style={isMobile ? { transform: open ? "translateX(0)" : "translateX(-100%)" } : {}}
    >
      {/* Mobile header */}
      {isMobile && (
        <div className="p-5 border-b border-[var(--border)]">
          <Link href="/feed" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 bg-[rgb(var(--primary-rgb))] rounded-xl flex items-center justify-center shadow-[var(--shadow-primary)]">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="font-extrabold text-lg tracking-[-0.04em] text-[var(--text-1)]">GradLink</span>
          </Link>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname && (pathname === href || (href !== "/feed" && pathname.startsWith(href)));
          const badge  = label === "Messages" ? chatUnread : label === "Notifications" ? unread : 0;

          return (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "nav-item group",
                active ? "active" : ""
              )}
            >
              <div className="relative flex-shrink-0">
                <Icon className="w-[18px] h-[18px]" />
                {badge > 0 && !active && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className="flex-1 text-[14px]">{label}</span>
              {badge > 0 && active && (
                <span className="px-2 py-0.5 bg-[rgb(var(--primary-rgb))] text-white text-[10px] font-bold rounded-full">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Admin link */}
        {user?.role === "admin" && (
          <>
            <div className="my-3 border-t border-[var(--border)]" />
            <Link
              href="/admin"
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "nav-item",
                pathname && pathname.startsWith("/admin") && "active"
              )}
            >
              <LayoutDashboard className="w-[18px] h-[18px]" />
              <span className="text-[14px]">Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* Profile card (desktop only) */}
      {!isMobile && user && (
        <div className="p-3 border-t border-[var(--border)]">
          <Link href={`/profile/${user._id}`}>
            <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--surface-2)] transition-colors group cursor-pointer">
              <Avatar src={user.avatar} alt={user.firstName} size="md" className="flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-[var(--text-1)] truncate tracking-tight group-hover:text-[rgb(var(--primary-rgb))] transition-colors">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-[var(--text-3)] truncate mt-0.5">
                  {user.headline || "View profile →"}
                </p>
              </div>
              <GraduationCap className="w-4 h-4 text-[var(--text-3)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>
      )}
    </aside>
  );

  if (!isMobile) return content;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      {content}
    </>
  );
}
