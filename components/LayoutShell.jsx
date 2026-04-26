"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

// Pages where we don't show the sidebar (auth/landing)
const noShellRoutes = ["/auth", "/"];

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showShell = !noShellRoutes.includes(pathname);
  const isMessages = pathname.startsWith("/messages");

  if (!showShell) return <>{children}</>;

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-primary/30 flex flex-col overflow-hidden">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      
      <div className="flex flex-1 pt-16 h-full w-full overflow-hidden">
        {/* Edge-to-Edge Left Sidebar */}
        <div className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 relative z-10 overflow-y-auto custom-scrollbar">
          <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </div>
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isMobile />

        {/* Main Interface */}
        {isMessages ? (
          <main className="flex-1 w-full bg-white dark:bg-[#020617] relative">
            {children}
          </main>
        ) : (
          <main className="flex-1 w-full relative overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#020617]">
            <div className="mx-auto flex w-full max-w-6xl justify-center xl:justify-between gap-6 px-2 sm:px-6 py-4 sm:py-8 pb-20">
              
              {/* Center Content / Feed Area */}
              <div className="w-full max-w-2xl shrink-0">
                {children}
              </div>

              {/* Right Sidebar Placeholder */}
              <div className="hidden xl:block w-72 shrink-0 pb-10">
                <div className="sticky top-0">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="font-semibold mb-3">Trending</h3>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium hover:text-primary cursor-pointer transition-colors">Tech Meetup 2026</p>
                        <p className="text-xs text-slate-500">1,200 participants</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium hover:text-primary cursor-pointer transition-colors">Career Fair in Mumbai</p>
                        <p className="text-xs text-slate-500">500 participants</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium hover:text-primary cursor-pointer transition-colors">React conf announced</p>
                        <p className="text-xs text-slate-500">300 participants</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        )}
      </div>
    </div>
  );
}
