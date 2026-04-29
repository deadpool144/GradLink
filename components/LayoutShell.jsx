"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Calendar, Users, ArrowRight, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const noShellRoutes = ["/auth", "/"];

// ── Right Sidebar Widgets ────────────────────────────────────────────────────
function RightSidebar() {
  const trending = [
    { label: "Tech Meetup 2026",        meta: "1,200 attending" },
    { label: "Career Fair — Mumbai",    meta: "500 registered" },
    { label: "React Conf announced",    meta: "300 interested" },
    { label: "Alumni Leadership Award", meta: "Nominations open" },
  ];

  const suggestedPeople = [
    { name: "Priya Sharma",   role: "Product Manager @ Google",    initials: "PS" },
    { name: "Rahul Mehta",    role: "SDE-2 @ Flipkart",           initials: "RM" },
    { name: "Aisha Khan",     role: "Data Scientist @ Amazon",    initials: "AK" },
  ];

  return (
    <div className="space-y-4">
      {/* Trending widget */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[rgb(var(--primary-rgb))]" />
          <h3 className="font-semibold text-[13px] text-[var(--text-1)] tracking-tight">Trending</h3>
        </div>
        <div className="space-y-3">
          {trending.map((t, i) => (
            <div key={i} className="group cursor-pointer">
              <p className="text-[13px] font-medium text-[var(--text-1)] group-hover:text-[rgb(var(--primary-rgb))] transition-colors leading-snug tracking-tight">
                {t.label}
              </p>
              <p className="text-[11px] text-[var(--text-3)] mt-0.5">{t.meta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* People you may know */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[rgb(var(--primary-rgb))]" />
          <h3 className="font-semibold text-[13px] text-[var(--text-1)] tracking-tight">Connect</h3>
        </div>
        <div className="space-y-3">
          {suggestedPeople.map((p, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[rgb(var(--primary-rgb))] to-violet-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                {p.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[var(--text-1)] truncate tracking-tight">{p.name}</p>
                <p className="text-[11px] text-[var(--text-3)] truncate">{p.role}</p>
              </div>
              <button className="text-[11px] font-semibold text-[rgb(var(--primary-rgb))] hover:underline flex-shrink-0">
                Follow
              </button>
            </div>
          ))}
        </div>
        <Link href="/directory" className="flex items-center gap-1 mt-4 text-[12px] font-semibold text-[rgb(var(--primary-rgb))] hover:opacity-80 transition-opacity">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-[var(--text-3)] px-1 leading-relaxed">
        © 2026 AlumniConnect · <a href="#" className="hover:underline">Privacy</a> · <a href="#" className="hover:underline">Terms</a>
      </p>
    </div>
  );
}

// ── Layout Shell ─────────────────────────────────────────────────────────────
export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { isLoggedIn, isCheckingAuth, user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
  const showShell  = pathname ? !noShellRoutes.includes(pathname) : true;
  const isAdmin    = pathname?.startsWith("/admin");
  const isMessages = pathname ? (pathname.startsWith("/messages") || pathname.startsWith("/ai-assistant")) : false;

  useEffect(() => {
    if (!isCheckingAuth && showShell) {
      if (!isLoggedIn || (user && !user.isVerified)) {
        router.push("/auth");
      }
    }
  }, [isCheckingAuth, isLoggedIn, user, showShell, router]);

  if (!showShell) return <>{children}</>;

  // Show a clean loading state while checking authentication for protected routes
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[rgb(var(--primary-rgb))] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xl">G</span>
          </div>
          <Loader2 className="w-6 h-6 text-[rgb(var(--primary-rgb))] animate-spin" />
        </div>
      </div>
    );
  }

  // If not logged in and on a protected route, don't render children while redirecting
  if (!isLoggedIn && showShell) return null;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg)", color: "var(--text-1)" }}
    >
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 pt-14 h-full w-full overflow-hidden">

        {/* ── Desktop Left Sidebar ─────────────────────────── */}
        <div className="hidden lg:flex lg:flex-col w-56 xl:w-60 border-r border-[var(--border)] bg-[var(--surface)] shrink-0 overflow-y-auto">
          <Sidebar open={false} onClose={() => {}} isMobile={false} />
        </div>

        {/* ── Mobile Sidebar ───────────────────────────────── */}
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isMobile />

        {/* ── Main Content ─────────────────────────────────── */}
        {isMessages || isAdmin ? (
          <main className={cn(
            "flex-1 w-full relative overflow-hidden",
            isAdmin ? "bg-[var(--bg)] overflow-y-auto" : "bg-[var(--surface)]"
          )}>
            <div className={cn(
              "mx-auto w-full h-full",
              isAdmin && "max-w-7xl px-4 sm:px-6 py-6"
            )}>
              {children}
            </div>
          </main>
        ) : (
          <main className="flex-1 w-full relative overflow-y-auto" style={{ background: "var(--bg)" }}>
            <div className="mx-auto flex w-full max-w-5xl xl:max-w-6xl justify-center xl:justify-between gap-6 px-4 sm:px-6 py-6 pb-24">

              {/* Feed / Center column */}
              <div className="w-full max-w-2xl min-w-0">
                {children}
              </div>

              {/* Right sidebar */}
              <div className="hidden xl:block w-72 shrink-0">
                <div className="sticky top-4">
                  <RightSidebar />
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
