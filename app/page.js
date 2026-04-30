"use client";

import { motion, useScroll, useTransform, AnimatePresence, useSpring, useInView } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Search, 
  Calendar, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Globe,
  Briefcase,
  Sun,
  Moon,
  Zap,
  CheckCircle,
  Share2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NoiseOverlay = () => <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />;

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none transition-colors duration-1000">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100/30 dark:bg-blue-900/5 rounded-full blur-[150px] animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 dark:bg-indigo-900/5 rounded-full blur-[150px] animate-blob animation-delay-2000" />
    </div>
  );
};

const Header = () => {
  return (
    <header className="absolute top-0 w-full z-50">
      <div className="max-w-7xl mx-auto h-20 md:h-24 px-4 sm:px-8 md:px-12 flex items-center justify-between">
        <Link href="/">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 shadow-lg shadow-blue-600/20">
              <div className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-md rotate-45" />
            </div>
            <span className="font-display font-black text-lg md:text-2xl tracking-tighter text-slate-900 dark:text-white uppercase hidden min-[400px]:block">GradLink</span>
          </motion.div>
        </Link>
        
        <div className="flex items-center gap-1.5 sm:gap-6">
          <div className="scale-90 sm:scale-100">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link href="/auth">
              <button className="h-9 sm:h-10 px-2 sm:px-6 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Login
              </button>
            </Link>
            <Link href="/auth">
              <button className="h-9 sm:h-10 px-4 sm:px-8 bg-slate-900 dark:bg-white text-white dark:text-black text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] rounded-lg sm:rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 dark:shadow-white/5">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const textX = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={containerRef} className="relative pt-32 md:pt-48 pb-40 md:pb-60 flex flex-col items-center justify-center min-h-[100vh] md:min-h-[110vh] overflow-hidden">
      <motion.div style={{ opacity, y, scale }} className="text-center z-10 max-w-6xl px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="mb-12"
        >
          <span className="bg-zinc-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.5em] px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800">
            A New Standard for Alumni
          </span>
        </motion.div>
        
        <motion.h1 
          className="font-display text-7xl md:text-[12rem] font-black text-slate-900 dark:text-white leading-[0.8] tracking-[-0.075em] mb-16"
        >
          SCALING <br />
          <motion.span style={{ x: textX }} className="inline-block italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800">LEGACY.</motion.span>
        </motion.h1>
        
        <p className="text-xl md:text-2xl text-slate-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed mb-20">
          The alumni network, architected for high-fidelity professional evolution. 
          Verified. Vetted. Visionary.
        </p>

        <div className="flex flex-col sm:row gap-6 justify-center items-center">
           <Link href="/auth">
             <button className="px-14 py-8 bg-blue-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-blue-500/30 cursor-pointer">
               Initialize Access
             </button>
           </Link>
           <button className="px-14 py-8 border-2 border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all cursor-pointer">
             Case Studies
           </button>
        </div>
      </motion.div>

      {/* Floating Interactive Mesh Background */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
      
      {/* 3D Elements */}
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -300]), rotate: -15, scale: 0.9 }}
        className="absolute top-1/4 -left-32 w-[30rem] h-[30rem] bg-zinc-50 dark:bg-zinc-900 rounded-[5rem] shadow-6xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-center p-12"
      >
        <img 
          src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" 
          className="w-full h-full object-cover rounded-[3rem] grayscale opacity-40"
          referrerPolicy="no-referrer"
          alt="Interface"
        />
      </motion.div>

      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -500]), rotate: 10 }}
        className="absolute bottom-[-10%] -right-32 w-[35rem] h-[40rem] bg-zinc-50 dark:bg-zinc-900 rounded-[6rem] shadow-6xl border border-zinc-100 dark:border-zinc-800 p-16"
      >
        <div className="w-full h-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[4rem] flex flex-col justify-center items-center gap-8 text-center p-8">
           <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-600">
             <Zap className="w-10 h-10" />
           </div>
           <h3 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tighter">NODE STATUS: <br /> OPTIMAL</h3>
           <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Latent Connections Found</p>
        </div>
      </motion.div>
    </section>
  );
};

const NetworkGraphGraphic = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.05, 0.8]);

  const nodes = useMemo(() => [...Array(20)].map((_, i) => ({
    x: Math.random() * 800 - 400,
    y: Math.random() * 800 - 400,
    size: Math.random() * 8 + 4,
    delay: i * 0.05
  })), []);

  return (
    <section ref={containerRef} className="py-60 bg-black text-white relative overflow-hidden">
      <div className="container mx-auto px-8 grid lg:grid-cols-2 gap-32 items-center">
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ margin: "-100px" }}
           className="space-y-12 relative z-10"
        >
           <div className="flex items-center gap-4 text-blue-500 font-black uppercase tracking-[0.6em] text-[10px]">
             <Share2 className="w-4 h-4" />
             <span>The Connection Mesh</span>
           </div>
           
           <h2 className="text-6xl md:text-9xl font-display font-black leading-[0.8] tracking-[-0.05em]">
             VISUALIZING <br /> <span className="text-blue-500">SYNERGY.</span>
           </h2>
           
           <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg">
             Stop guessing who knows whom. Our graph intelligence exposes the bridges between 250,000+ top-tier alumni globally.
           </p>

           <div className="space-y-6 pt-8">
              {[
                { label: 'Latency', value: '4ms' },
                { label: 'Active Nodes', value: '184k' },
                { label: 'Intersections', value: '1.2m' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-end border-b border-zinc-800 pb-4">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{stat.label}</span>
                   <span className="text-3xl font-display font-black tracking-tighter">{stat.value}</span>
                </div>
              ))}
           </div>
        </motion.div>

        <div className="relative aspect-square">
           <motion.div style={{ rotate, scale }} className="w-full h-full relative">
              <svg viewBox="-500 -500 1000 1000" className="w-full h-full">
                 <defs>
                    <filter id="glow">
                       <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                       <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                       </feMerge>
                    </filter>
                 </defs>
                 {nodes.map((node, i) => (
                    nodes.slice(i + 1, i + 3).map((target, j) => (
                      <motion.line 
                        key={`${i}-${j}`}
                        x1={node.x} y1={node.y} x2={target.x} y2={target.y}
                        stroke="rgba(59, 130, 246, 0.4)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: node.delay }}
                      />
                    ))
                 ))}
                 {nodes.map((node, i) => (
                    <motion.circle 
                       key={i}
                       cx={node.x} cy={node.y} r={node.size}
                       fill={i % 3 === 0 ? "#3b82f6" : "rgba(255,255,255,0.3)"}
                       initial={{ scale: 0 }}
                       whileInView={{ scale: 1 }}
                       transition={{ type: "spring", delay: node.delay }}
                       filter={i % 3 === 0 ? "url(#glow)" : "none"}
                    />
                 ))}
              </svg>
              {/* Core Flare */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
           </motion.div>
        </div>
      </div>
    </section>
  );
};

const VideoParallaxSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const zoom = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-80 bg-zinc-950 relative overflow-hidden">
      <motion.div style={{ scale: zoom, opacity }} className="absolute inset-0 z-0">
        <video 
          autoPlay loop muted playsInline
          className="w-full h-full object-cover grayscale opacity-20"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-business-people-walking-in-a-lobby-4464-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
      </motion.div>

      <div className="container mx-auto px-8 relative z-10 text-center">
         <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ margin: "-100px" }}
           className="space-y-16"
         >
            <h2 className="text-6xl md:text-[14rem] font-display font-black text-white leading-none tracking-[-0.08em] uppercase">
              PHYSICAL. <br /> <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">MEETS DIGITAL.</span>
            </h2>
            <p className="text-2xl text-zinc-400 font-medium max-w-xl mx-auto italic">
              "Networking isn't just about the handshake; it's about the data architecture behind it."
            </p>
         </motion.div>
      </div>
    </section>
  );
};

const ZigZagParallax = () => {
  const containerRef = useRef(null);
  const sections = [
    {
      title: "SCALING.",
      subtitle: "Exponential Growth",
      desc: "Direct-to-expert tunnels. Land interviews or secure funding within minutes, not months.",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
      direction: 1
    },
    {
      title: "VETTED.",
      subtitle: "Verified Assets",
      desc: "An unhackable chain of trust. Only university-verified graduates can access the mesh.",
      img: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1200&auto=format&fit=crop",
      direction: -1
    }
  ];

  return (
    <section ref={containerRef} className="py-60 space-y-80 bg-white dark:bg-black transition-colors overflow-hidden">
       {sections.map((section, i) => (
         <div key={i} className="container mx-auto px-8">
            <div className={`flex flex-col ${section.direction === 1 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-32 items-center`}>
               <motion.div 
                 initial={{ opacity: 0, x: section.direction * -100 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                 className="flex-1 space-y-12"
               >
                  <span className="text-blue-600 font-black uppercase tracking-[0.5em] text-[10px] pb-4 border-b border-zinc-100 dark:border-zinc-800 block w-max">
                    {section.subtitle}
                  </span>
                  <h2 className="text-7xl md:text-[10rem] font-display font-black text-slate-900 dark:text-white leading-[0.8] tracking-tighter">
                    {section.title}
                  </h2>
                  <p className="text-xl text-slate-500 dark:text-zinc-400 font-medium leading-relaxed max-w-lg">
                    {section.desc}
                  </p>
                  <button className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:gap-6 cursor-pointer text-slate-900 dark:text-white">
                    Explore Node <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
               </motion.div>

               <div className="flex-1 relative">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, rotate: section.direction * 10 }}
                    whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-[5rem] overflow-hidden shadow-6xl border-4 border-zinc-50 dark:border-zinc-900 aspect-[4/5]"
                  >
                     <img 
                       src={section.img} 
                       alt={section.title} 
                       className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100" 
                       referrerPolicy="no-referrer" 
                     />
                  </motion.div>
                  {/* Floating Detail Overlay */}
                  <motion.div
                    whileInView={{ y: 20 }}
                    className="absolute -bottom-10 -right-10 md:right-10 bg-white dark:bg-zinc-900 p-10 rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 max-w-[15rem] hidden md:block"
                  >
                     <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4">Node Metrics</p>
                     <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full mb-6 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "85%" }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-blue-600"
                        />
                     </div>
                     <p className="text-xs font-bold text-slate-900 dark:text-white">Active Participation: 85.4%</p>
                  </motion.div>
               </div>
            </div>
         </div>
       ))}
    </section>
  );
};

const MinimalistFooter = () => {
  return (
    <footer className="pt-60 pb-12 bg-white dark:bg-black border-t border-zinc-100 dark:border-zinc-900 transition-colors">
      <div className="container mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-32 mb-48">
           <div className="col-span-2 space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-lg rotate-45 shadow-lg" />
                </div>
                <span className="font-display font-black text-5xl tracking-tighter text-slate-900 dark:text-white uppercase transition-colors">GradLink</span>
              </div>
              <p className="text-3xl text-slate-400 dark:text-zinc-500 font-medium max-w-lg leading-tight tracking-tight italic">
                "The most valuable asset in the modern world is an unhackable network."
              </p>
           </div>
           
           <div className="space-y-12">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-900 dark:text-white">The Mesh</h4>
              <ul className="space-y-6 text-sm font-bold text-zinc-400 dark:text-zinc-600">
                {['Directory', 'Intelligence', 'C-Suite Access', 'Legacy Founders'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
           </div>

           <div className="space-y-12">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-900 dark:text-white">Connect</h4>
               <div className="flex flex-wrap gap-4">
                  {[Globe, Share2, MessageSquare].map((Icon, idx) => (
                     <motion.a 
                       key={idx} 
                       whileHover={{ y: -5, scale: 1.1 }}
                       href="#" 
                       className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-all shadow-sm border border-zinc-100 dark:border-zinc-800"
                     >
                       <Icon className="w-6 h-6" />
                     </motion.a>
                  ))}
               </div>
           </div>
        </div>

        <div className="flex flex-col md:row justify-between items-center gap-12 pt-16 border-t border-zinc-100 dark:border-zinc-900 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
           <p>© 2026 GradLink Digital Architecture. All rights reserved.</p>
           <div className="flex gap-12">
             <span className="flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
               Nodes Optimized
             </span>
             <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Encryption</span>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  const { isLoggedIn } = useSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) router.push("/feed");
  }, [isLoggedIn, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-blue-600 selection:text-white transition-colors duration-1000 w-full overflow-x-hidden">
       <NoiseOverlay />
       <AnimatedBackground />
       <Header />

       <main>
          <Hero />
          
          <section className="py-20 opacity-30 grayscale hover:opacity-60 transition-all cursor-default">
             <div className="flex overflow-hidden relative whitespace-nowrap">
                <motion.div 
                  initial={{ x: 0 }}
                  animate={{ x: "-100%" }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="flex gap-40 text-4xl md:text-6xl font-display font-black uppercase tracking-tighter pr-40"
                >
                  <span>Stanford</span> <span>Oxford</span> <span>MIT</span> <span>Harvard</span> <span>Cambridge</span> <span>Berkeley</span>
                </motion.div>
                <motion.div 
                  initial={{ x: 0 }}
                  animate={{ x: "-100%" }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="flex gap-40 text-4xl md:text-6xl font-display font-black uppercase tracking-tighter pr-40"
                >
                  <span>Stanford</span> <span>Oxford</span> <span>MIT</span> <span>Harvard</span> <span>Cambridge</span> <span>Berkeley</span>
                </motion.div>
             </div>
          </section>

          <NetworkGraphGraphic />
          <ZigZagParallax />
          <VideoParallaxSection />

          <section className="py-80 bg-white dark:bg-black">
             <div className="container mx-auto px-8 text-center space-y-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ margin: "-100px" }}
                  className="space-y-12"
                >
                   <div className="inline-flex items-center gap-4 bg-zinc-900 dark:bg-white text-white dark:text-black py-3 px-6 rounded-full text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl">
                      <Layers className="w-4 h-4" />
                      <span>Ready to Deploy</span>
                   </div>
                   
                   <h2 className="text-7xl md:text-[14rem] font-display font-black text-slate-900 dark:text-white leading-[0.8] tracking-[-0.08em]">
                      YOUR TURN <br /> <motion.span whileHover={{ scale: 1.05 }} className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 transition-transform cursor-pointer inline-block">TO LEAD.</motion.span>
                   </h2>
                   
                   <div className="flex flex-col sm:row gap-8 justify-center pt-12 items-center">
                      <Link href="/auth">
                        <button className="px-16 py-8 bg-blue-600 text-white rounded-[3rem] text-[10px] font-black uppercase tracking-[0.5em] hover:scale-105 active:scale-95 shadow-3xl shadow-blue-500/40 transition-all cursor-pointer">
                          Initialize Node
                        </button>
                      </Link>
                      <button className="px-16 py-8 border-2 border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[3rem] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all cursor-pointer">
                        View Documentation
                      </button>
                   </div>
                </motion.div>
             </div>
          </section>
       </main>

       <MinimalistFooter />
    </div>
  );
}
