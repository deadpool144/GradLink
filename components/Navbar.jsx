"use client";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/lib/slices/authSlice";
import { disconnectSocket } from "@/lib/socket";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, Search, LogOut, User, Settings, Menu, X, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isLoggedIn } = useSelector((s) => s.auth);
  const unread = useSelector((s) => s.notif.unreadCount);
  const chatUnread = useSelector((s) =>
    Object.values(s.chat.unread).reduce((a, b) => a + b, 0)
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  // Detect scroll for navbar shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    disconnectSocket();
    router.push("/auth");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-200",
        scrolled
          ? "bg-[var(--surface)]/90 backdrop-blur-xl shadow-[var(--shadow-sm)] border-b border-[var(--border)]"
          : "bg-[var(--surface)] border-b border-[var(--border)]"
      )}
    >
      <div className="h-full flex items-center justify-between px-4 sm:px-6 max-w-[1400px] mx-auto gap-4">

        {/* ── Left: Logo ────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn && (
            <button
              onClick={onMenuClick}
              className="btn-ghost p-2 lg:hidden -ml-2"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link href={isLoggedIn ? "/feed" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[rgb(var(--primary-rgb))] rounded-[10px] flex items-center justify-center shadow-[var(--shadow-primary)] transition-transform group-hover:scale-105">
              <span className="text-white font-black text-sm tracking-tight">G</span>
            </div>
            <span className="hidden sm:block font-extrabold text-[15px] tracking-[-0.04em] text-[var(--text-1)]">
              GradLink
            </span>
          </Link>
        </div>

        {/* ── Center: Search ────────────────────────────────── */}
        <AnimatePresence>
          {mobileSearchOpen ? (
            <motion.div
              key="mobile-search"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 md:hidden overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
                <input
                  autoFocus
                  type="search"
                  placeholder="Search alumni, posts…"
                  className="input pl-9 pr-10 py-2 w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { router.push(`/directory?q=${e.target.value}`); setMobileSearchOpen(false); }
                    if (e.key === "Escape") setMobileSearchOpen(false);
                  }}
                />
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="desktop-search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:flex flex-1 max-w-xs mx-4"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
                <input
                  type="search"
                  placeholder="Search…"
                  className="input pl-9 py-2 text-sm w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") router.push(`/directory?q=${e.target.value}`);
                  }}
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-3)] bg-[var(--surface-3)] rounded-md border border-[var(--border)]">
                  ⌘K
                </kbd>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Right: Icons ──────────────────────────────────── */}
        <div className="flex items-center gap-1 shrink-0">
          {isLoggedIn ? (
            <>
              <ThemeToggle />

              {/* Mobile search trigger */}
              {!mobileSearchOpen && (
                <button
                  onClick={() => setMobileSearchOpen(true)}
                  className="btn-ghost p-2 md:hidden"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Messages */}
              <Link href="/messages">
                <button className="btn-ghost relative p-2">
                  <MessageSquare className="w-5 h-5" />
                  {chatUnread > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[rgb(var(--primary-rgb))] rounded-full ring-2 ring-[var(--surface)]" />
                  )}
                </button>
              </Link>

              {/* Notifications */}
              <Link href="/notifications">
                <button className="btn-ghost relative p-2">
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full px-1 flex items-center justify-center ring-2 ring-[var(--surface)]">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
              </Link>

              {/* Avatar + Dropdown */}
              <div className="relative ml-1" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={cn(
                    "w-8 h-8 rounded-full overflow-hidden transition-all duration-150 ring-2",
                    menuOpen
                      ? "ring-[rgb(var(--primary-rgb))]"
                      : "ring-transparent hover:ring-[var(--border-strong)]"
                  )}
                >
                  <Avatar src={user?.avatar} alt={user?.firstName} size="sm" />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-2 w-60 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] p-1.5 z-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      {/* User info */}
                      <div className="px-3.5 py-3 mb-1 border-b border-[var(--border)]">
                        <p className="font-semibold text-sm text-[var(--text-1)] truncate tracking-tight">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-[var(--text-3)] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        href={`/profile/${user?._id}`}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4" /> View Profile
                      </Link>
                      <Link
                        href="/manage-content"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Manage Content
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <div className="my-1 border-t border-[var(--border)]" />
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/auth">
                <button className="btn-ghost px-4 h-9 text-sm">Sign In</button>
              </Link>
              <Link href="/auth">
                <button className="btn-primary h-9 px-4 text-sm">Get Started</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
