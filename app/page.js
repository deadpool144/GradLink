"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Users, Shield, MessageSquare, ArrowRight, Zap, Globe } from "lucide-react";

export default function LandingPage() {
  const { isLoggedIn } = useSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/feed");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">AlumniConnect</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Sign In</Link>
            <Link href="/auth" className="btn-primary py-2.5 px-6 rounded-full shadow-lg shadow-primary/20">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-indigo-950 border border-primary/20 dark:border-indigo-900 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-black text-primary uppercase tracking-widest">Version 2.0 Now Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tighter">
            Where Ambition Meets <br />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Long-Lasting</span> Connection.
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
            The premium networking platform for alumni. Stay connected, share opportunities, 
            and accelerate your career with a community that matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="btn-primary px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 group w-full sm:w-auto">
              Join the Network <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="btn-secondary px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
              <Globe className="w-5 h-5" /> View Directory
            </button>
          </div>

          {/* Social Proof / Numbers */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Members", value: "10k+" },
              { label: "Global Chapters", value: "45+" },
              { label: "Job Postings", value: "1.2k" },
              { label: "Connections", value: "250k+" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">{s.value}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Built for Professionals</h2>
            <p className="text-slate-500">Everything you need to manage your alumni network effectively.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Real-time Messaging", icon: MessageSquare, desc: "Seamless 1-1 and group chats with typing indicators and read receipts." },
              { title: "Alumni Directory", icon: Users, desc: "Find former classmates using advanced batch and department filtering." },
              { title: "Secure & Private", icon: Shield, desc: "Enterprise-grade authentication with OTP verification for all users." },
            ].map((f, i) => (
              <div key={i} className="card p-8 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="font-black text-slate-900 dark:text-white">AlumniConnect</span>
          </div>
          <p className="text-sm text-slate-400">© 2026 AlumniConnect. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Globe className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
