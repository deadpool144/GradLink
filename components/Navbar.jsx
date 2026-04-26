"use client";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/lib/slices/authSlice";
import { disconnectSocket } from "@/lib/socket";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, Search, LogOut, User, Settings, Menu } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

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

  const logout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    disconnectSocket();
    router.push("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto gap-4">
        {/* Left: Logo + mobile menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={onMenuClick} className="btn-ghost lg:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="hidden sm:block font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">AlumniConnect</span>
          </Link>
        </div>

        {/* Center: Search (Desktop) */}
        {!mobileSearchOpen && (
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search alumni, posts..."
                className="input py-2 pl-9 pr-4 bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/directory?q=${e.target.value}`);
                }}
              />
            </div>
          </div>
        )}

        {/* Mobile Search Input (when toggled) */}
        {mobileSearchOpen && (
          <div className="flex-1 md:hidden">
            <div className="relative w-full">
              <input
                autoFocus
                type="search"
                placeholder="Search..."
                className="input py-2 pl-4 pr-10 bg-slate-100 dark:bg-slate-800 border-none w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(`/directory?q=${e.target.value}`);
                    setMobileSearchOpen(false);
                  }
                }}
                onBlur={() => setMobileSearchOpen(false)}
              />
              <button onClick={() => setMobileSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2">
                <LogOut className="w-4 h-4 text-slate-400 rotate-90" />
              </button>
            </div>
          </div>
        )}

        {/* Right: Nav icons + avatar */}
        {isLoggedIn ? (
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {!mobileSearchOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden"
              >
                <Search className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            )}
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="relative group">
                <MessageSquare className="h-[1.2rem] w-[1.2rem]" />
                {chatUnread > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform"></span>
                )}
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative group">
                <Bell className="h-[1.2rem] w-[1.2rem]" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform"></span>
                )}
              </Button>
            </Link>

            {/* Avatar dropdown */}
            <div className="relative ml-2">
              <button
                className="rounded-full overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Avatar src={user?.avatar} alt={user?.firstName} size="md" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50 pointer-events-auto" onClick={() => setMenuOpen(false)}>
                  <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link href={`/profile/${user?._id}`} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary rounded-xl transition-colors font-medium">
                    <User className="w-4 h-4" /> View Profile
                  </Link>
                  <Link href="/profile/edit" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary rounded-xl transition-colors font-medium">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl w-full transition-colors font-medium">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
