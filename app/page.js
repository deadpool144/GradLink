"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowRight, Users, Shield, MessageSquare, Calendar, Zap, Network, Star, Globe } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ── Animated Counter ─────────────────────────────────────────────────────────
function CountUp({ to, suffix = "" }) {
  return <span>{to}{suffix}</span>;
}

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] transition-all duration-300"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h3 className="font-bold text-[15px] text-[var(--text-1)] mb-2 tracking-tight">{title}</h3>
      <p className="text-[13px] text-[var(--text-2)] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ── Stat ─────────────────────────────────────────────────────────────────────
function Stat({ value, label, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <p className="text-4xl md:text-5xl font-black text-[var(--text-1)] tracking-[-0.04em]">{value}</p>
      <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-[0.1em] mt-2">{label}</p>
    </motion.div>
  );
}

// ── Marquee strip ────────────────────────────────────────────────────────────
const logos = ["Google", "Microsoft", "Amazon", "Meta", "Flipkart", "Razorpay", "CRED", "Zepto", "PhonePe", "Paytm"];
function Marquee() {
  return (
    <div className="relative overflow-hidden py-4">
      <div className="flex gap-12 animate-[marquee_25s_linear_infinite] w-max">
        {[...logos, ...logos].map((name, i) => (
          <span key={i} className="text-[13px] font-bold text-[var(--text-3)] whitespace-nowrap tracking-wider uppercase">{name}</span>
        ))}
      </div>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent pointer-events-none" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isLoggedIn } = useSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) router.push("/feed");
  }, [isLoggedIn, router]);

  const features = [
    { icon: MessageSquare, title: "Real-time Messaging", desc: "Seamless 1-to-1 and group chats with typing indicators and read receipts.", color: "#4F46E5" },
    { icon: Users, title: "Alumni Directory", desc: "Find former classmates using advanced batch, year, and department filtering.", color: "#0EA5E9" },
    { icon: Calendar, title: "Events & Meetups", desc: "Discover and RSVP to alumni events in your city and online.", color: "#10B981" },
    { icon: Network, title: "Professional Network", desc: "Build your graph of meaningful professional connections that last a lifetime.", color: "#F59E0B" },
    { icon: Shield, title: "Secure & Verified", desc: "Enterprise-grade authentication with OTP email verification for all members.", color: "#EF4444" },
    { icon: Zap, title: "AI-Powered Assistant", desc: "Get instant answers, networking tips, and career advice from your Alumni AI.", color: "#8B5CF6" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-1)" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--surface)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto h-14 px-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[rgb(var(--primary-rgb))] rounded-[10px] flex items-center justify-center shadow-[var(--shadow-primary)]">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="font-extrabold text-[15px] tracking-[-0.04em] text-[var(--text-1)]">GradLink</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth">
              <button className="btn-ghost h-8 px-4 text-sm">Sign In</button>
            </Link>
            <Link href="/auth">
              <button className="btn-primary h-8 px-4 text-sm flex items-center gap-1.5">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-36 pb-24 px-5">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary-alpha)] border border-[rgba(79,70,229,0.2)] mb-8"
          >
            <span className="w-1.5 h-1.5 bg-[rgb(var(--primary-rgb))] rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-[rgb(var(--primary-rgb))] uppercase tracking-[0.08em]">AI-Powered Alumni Networking</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Where Alumni{" "}
            <br className="hidden sm:block" />
            <span className="text-gradient">Meet Opportunity</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl mx-auto text-[16px] text-[var(--text-2)] mb-10 leading-relaxed"
            style={{ letterSpacing: "-0.01em" }}
          >
            The premium networking platform built for alumni. Stay connected, share opportunities,
            and grow your career with the community that knows you best.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/auth">
              <button className="btn-primary h-12 px-8 text-[15px] w-full sm:w-auto group">
                Join the Network
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link href="/auth">
              <button className="btn-secondary h-12 px-8 text-[15px] w-full sm:w-auto">
                Explore Directory
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Alumni Companies ─────────────────────────────────────────────── */}
      <section className="py-8 border-y border-[var(--border)]">
        <p className="text-center text-[11px] font-bold text-[var(--text-3)] uppercase tracking-[0.12em] mb-6">
          Alumni working at
        </p>
        <Marquee />
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <Stat value="10k+" label="Active Members" delay={0} />
          <Stat value="45+" label="Global Chapters" delay={0.1} />
          <Stat value="1.2k" label="Job Postings" delay={0.2} />
          <Stat value="250k+" label="Connections" delay={0.3} />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 max-w-xl">
            <p className="text-[11px] font-bold text-[rgb(var(--primary-rgb))] uppercase tracking-[0.1em] mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-1)] mb-4" style={{ letterSpacing: "-0.035em" }}>
              Everything you need to<br />stay connected
            </h2>
            <p className="text-[14px] text-[var(--text-2)] leading-relaxed">
              Built with alumni in mind. Every feature designed to help you maintain and grow meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, rgb(79,70,229) 0%, rgb(139,92,246) 100%)",
              boxShadow: "0 32px 64px rgba(79,70,229,0.3)"
            }}
          >
            {/* Noise texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")" }}
            />

            <div className="relative">
              {/* <Star className="w-8 h-8 text-yellow-300 mx-auto mb-5 fill-yellow-300" /> */}
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4" style={{ letterSpacing: "-0.04em" }}>
                Your network is your net worth
              </h2>
              <p className="text-indigo-200 text-[15px] max-w-lg mx-auto mb-8 leading-relaxed">
                Join thousands of alumni who've found their next opportunity, mentor, or co-founder on AlumniConnect.
              </p>
              <Link href="/auth">
                <button className="h-12 px-8 bg-white text-indigo-600 font-bold rounded-xl text-[15px] hover:bg-indigo-50 transition-colors shadow-xl inline-flex items-center gap-2">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-12 px-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[rgb(var(--primary-rgb))] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="font-extrabold text-[14px] tracking-[-0.03em] text-[var(--text-1)]">GradLink</span>
          </div>
          <p className="text-[12px] text-[var(--text-3)]">© 2026 AlumniConnect. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Contact"].map(l => (
              <a key={l} href="#" className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Marquee animation ─────────────────────────── */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
