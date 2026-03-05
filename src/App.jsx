import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Workflow,
  Smartphone,
  Database,
  Terminal,
  Code2,
  ArrowRight
} from 'lucide-react';
import { SiSupabase, SiFirebase, SiVercel } from 'react-icons/si';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';

// --- Lenis Smooth Scroll ---
const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);
};

// --- Custom Hooks ---
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });
    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  return [targetRef, isIntersecting];
};

// --- Framer Motion Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 48 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const fadeInLeft = {
  hidden: { opacity: 0, x: 48 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

// --- Reveal Component (kept for components that use it) ---
const Reveal = ({ children, direction = 'up', delay = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const baseClasses = "transition-all duration-700 ease-out will-change-transform";
  const hiddenClasses = {
    up: "opacity-0 translate-y-12",
    down: "opacity-0 -translate-y-12",
    left: "opacity-0 translate-x-12",
    right: "opacity-0 -translate-x-12",
    fade: "opacity-0 scale-95"
  };
  const visibleClasses = "opacity-100 translate-y-0 translate-x-0 scale-100";

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${isVisible ? visibleClasses : hiddenClasses[direction]}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Rotating Word Component ---
const ROTATING_WORDS = ['Web-Apps.', 'native Apps.', 'Workflow-Automation.'];

const RotatingWord = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex overflow-hidden align-bottom relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-white"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
      <span
        className="inline-block w-[3px] ml-1 bg-white/80 rounded-sm self-stretch animate-[blink_0.7s_step-end_infinite]"
        aria-hidden="true"
      />
    </span>
  );
};

// --- Scroll Highlight Text ---
const ScrollHighlightText = ({ text }) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const words = text.split(' ');

  return (
    <section ref={sectionRef} className="relative" style={{ minHeight: '300vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <p className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight">
            {words.map((word, i) => (
              <HighlightWord
                key={i}
                word={word}
                index={i}
                total={words.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </p>
        </div>
      </div>
    </section>
  );
};

const HighlightWord = ({ word, index, total, scrollYProgress }) => {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.3em]">
      {word}
    </motion.span>
  );
};

// --- 3D Scroll Card ---
const ScrollCard3D = ({ children, index = 0 }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end center'],
  });

  const staggerOffset = index * 0.05;
  const rotateX = useTransform(scrollYProgress, [0 + staggerOffset, 0.6 + staggerOffset], [25, 0]);
  const translateY = useTransform(scrollYProgress, [0 + staggerOffset, 0.6 + staggerOffset], [80, 0]);
  const opacity = useTransform(scrollYProgress, [0 + staggerOffset, 0.5 + staggerOffset], [0.3, 1]);
  const scale = useTransform(scrollYProgress, [0 + staggerOffset, 0.6 + staggerOffset], [0.9, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
        rotateX,
        translateY,
        opacity,
        scale,
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
};

// --- Particle Network Background (LAAS-style: subtle, terminal-inspired) ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 60;
    const MAX_DIST = 120;
    const MOUSE_DIST = 150;

    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = particlesRef.current;

      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // Particle connections – subtle white/gray (matches app palette)
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse hover – green accent (like app's green-400 / terminal green)
        const mdx = pts[i].x - mouseRef.current.x;
        const mdy = pts[i].y - mouseRef.current.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_DIST) {
          const alpha = (1 - mdist / MOUSE_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('blur', onMouseLeave);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('blur', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', zIndex: 0 }}
    />
  );
};

// --- Hero Background Video ---
const HeroBackgroundVideo = () => {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = 0.7;
  }, []);
  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-40"
    >
      <source src="/mixkit-world-map-in-a-digital-world-12748-hd-ready.mp4" type="video/mp4" />
    </video>
  );
};

// --- Hero Terminal ---
const TERMINAL_MESSAGES = [
  'Willkommen! Hier entsteht Software, die zu dir passt.',
  'Apps, die deinen Alltag einfacher machen.',
  'Von der Idee bis zur fertigen Lösung – wir begleiten dich.',
  'Technik, die funktioniert. Ohne Fachchinesisch.'
];

const HeroTerminal = () => {
  const [typingText, setTypingText] = useState('');
  const cmdIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    let timeoutId;
    let mounted = true;

    function typeLoop() {
      if (!mounted) return;
      const current = TERMINAL_MESSAGES[cmdIndexRef.current];
      if (!isDeletingRef.current) {
        setTypingText(current.substring(0, charIndexRef.current + 1));
        charIndexRef.current++;
        if (charIndexRef.current === current.length) {
          isDeletingRef.current = true;
          timeoutId = setTimeout(typeLoop, 2500);
          return;
        }
        timeoutId = setTimeout(typeLoop, 50 + Math.random() * 40);
      } else {
        setTypingText(current.substring(0, charIndexRef.current - 1));
        charIndexRef.current--;
        if (charIndexRef.current === 0) {
          isDeletingRef.current = false;
          cmdIndexRef.current = (cmdIndexRef.current + 1) % TERMINAL_MESSAGES.length;
          timeoutId = setTimeout(typeLoop, 500);
          return;
        }
        timeoutId = setTimeout(typeLoop, 25);
      }
    }

    timeoutId = setTimeout(typeLoop, 800);
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="hero-terminal">
      <div className="terminal-bar">
        <span className="terminal-dot terminal-dot--red"></span>
        <span className="terminal-dot terminal-dot--yellow"></span>
        <span className="terminal-dot terminal-dot--green"></span>
        <span className="terminal-title">LAAS_app_studio: ~</span>
      </div>
      <div className="terminal-body">
        <p className="terminal-line flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
          <span className="typing-text">{typingText}</span>
          <span className="terminal-cursor">_</span>
        </p>
      </div>
    </div>
  );
};

// --- NavBar ---
const NavBar = ({ scrolled }) => (
  <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white/[0.02] backdrop-blur-xl border-b border-white/10 py-4 md:py-6`}>
    <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
      <a href="#" className="flex items-center group cursor-pointer">
        <img
          src="/liftapp.png"
          alt="LAAS – Luca Arnoldi App Studio"
          className="h-10 md:h-14 w-auto object-contain transition-all duration-300 group-hover:opacity-80 brightness-0 invert"
        />
      </a>
      <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
        <a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a>
        <a href="#about" className="text-gray-400 hover:text-white transition-colors">Studio</a>
        <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Kontakt</a>
      </div>
      <a href="#contact" className="hidden sm:inline-flex rounded-lg border border-white/20 bg-white/5 text-white font-mono text-xs font-medium uppercase tracking-widest px-6 py-2.5 hover:bg-white hover:text-black transition-all duration-300">
        INIT_PROJECT
      </a>
    </div>
  </nav>
);

// --- Card Components ---
const Card = ({ icon: Icon, title, description, label, children, className = '', hideExecute = false }) => (
  <div className={`group relative border border-white/10 rounded-2xl bg-[#0a0a0a] hover:bg-[#111] hover:border-white/30 transition-all duration-500 overflow-hidden min-h-[340px] flex flex-col justify-between ${className}`}>
    <div className="w-full border-b border-white/10 px-4 py-3 flex justify-between items-center bg-white/[0.02]">
      <div className="flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-red-400/80 transition-colors"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-yellow-400/80 transition-colors"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-green-400/80 transition-colors"></div>
      </div>
      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="p-8 flex-grow flex flex-col min-h-0">
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shrink-0">
        <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-semibold mb-3 tracking-tight font-mono">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">{title}</span>
      </h3>
      {children ? children : <p className="text-gray-400 leading-relaxed text-sm font-light">{description}</p>}
    </div>
    {!hideExecute && (
      <div className="px-8 pb-8 flex items-center font-mono text-xs uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors shrink-0">
        <span className="text-green-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span> Mehr <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    )}
  </div>
);

// Interaktives Terminal für Clean-Code-Kachel
const FRIENDLY_RESPONSES = [
  '✓ Executed. 0 errors. Systems nominal.',
  '✓ Roger that. Task complete.',
  '✓ Affirmative. Processing finished.',
  '✓ Done. Coffee break optional.',
  '✓ Command processed. 100% success rate.',
];

const CleanCodeTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    const response = FRIENDLY_RESPONSES[Math.floor(Math.random() * FRIENDLY_RESPONSES.length)];
    setHistory((h) => [...h, { cmd, response }]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className="space-y-1.5 text-gray-400 overflow-y-auto flex-grow min-h-0 cursor-text scrollbar-glass"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2">
        <Code2 className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
        <span className="text-white">deploy --prod</span>
      </div>
      <div className="text-green-400/80 pl-6">✓ Live in 0.4s</div>
      <div className="flex items-center gap-2 pt-2">
        <Code2 className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
        <span className="text-white">health check</span>
      </div>
      <div className="text-green-400/80 pl-6">✓ All systems operational</div>
      <div className="flex items-center gap-2 pt-2">
        <Code2 className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
        <span className="text-white">scale --instances 5</span>
      </div>
      <div className="text-green-400/80 pl-6">✓ 5 instances running</div>
      {history.map((h, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 pt-2">
            <Code2 className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
            <span className="text-white">{h.cmd}</span>
          </div>
          <div className="text-green-400/80 pl-6">{h.response}</div>
          <div className="pl-6 pt-2">
            <img
              src="/826041-robo.svg"
              alt=""
              className="w-14 h-14 object-contain opacity-90"
              style={{ filter: 'brightness(0) saturate(100%) invert(45%) sepia(55%) saturate(1000%) hue-rotate(350deg) brightness(0.6)' }}
            />
          </div>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
        <Code2 className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
        {!isFocused && <span className="terminal-cursor text-white shrink-0">|</span>}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=""
          className="flex-1 min-w-0 bg-transparent text-white outline-none border-none placeholder-gray-500 caret-white"
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
};

// Tools-Kachel mit Animationen
const ToolsCard = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="group relative border border-white/10 rounded-2xl bg-[#0a0a0a] hover:bg-[#111] hover:border-white/30 transition-all duration-500 overflow-hidden"
    >
      <div className="w-full border-b border-white/10 px-4 py-3 flex justify-between items-center bg-white/[0.02]">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-red-400/80 transition-colors"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-yellow-400/80 transition-colors"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-green-400/80 transition-colors"></div>
        </div>
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">TOOLS_01.EXE</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
        <div className="p-8">
          <h3
            className="text-lg font-semibold mb-6 tracking-tight font-mono text-white/90 transition-all duration-500"
            style={
              isVisible
                ? { animation: 'tool-item-in 0.5s ease-out forwards', opacity: 0 }
                : { opacity: 0 }
            }
          >
            Entwicklungstools
          </h3>
          <ToolList
            tools={[
              { icon: <img src="/cursor-icon-white.svg" alt="" className="w-full h-full object-contain" />, name: "Cursor AI" },
              { icon: <img src="/n8n-icon.svg" alt="" className="w-full h-full object-contain" />, name: "n8n" },
              { icon: <img src="/anthropic-icon.svg" alt="" className="w-full h-full object-contain" />, name: "Anthropic" }
            ]}
            animate
            isVisible={isVisible}
            baseDelay={100}
          />
        </div>
        <div className="p-8">
          <h3
            className="text-lg font-semibold mb-6 tracking-tight font-mono text-white/90 transition-all duration-500"
            style={
              isVisible
                ? { animation: 'tool-item-in 0.5s ease-out forwards', animationDelay: '50ms', opacity: 0 }
                : { opacity: 0 }
            }
          >
            Datenbank & Hosting
          </h3>
          <ToolList
            tools={[
              { icon: <SiSupabase className="w-5 h-5" style={{ color: '#3ECF8E' }} />, name: "Supabase" },
              { icon: <SiFirebase className="w-5 h-5" style={{ color: '#FFCA28' }} />, name: "Firebase" },
              { icon: <SiVercel className="w-5 h-5" style={{ color: '#FFFFFF' }} />, name: "Vercel" }
            ]}
            animate
            isVisible={isVisible}
            baseDelay={350}
          />
        </div>
      </div>
    </div>
  );
};

// Tool-Liste: nur Icon + Name (mit optionaler Stagger-Animation)
const ToolList = ({ tools, animate = false, isVisible = false, baseDelay = 0 }) => (
  <div className="flex flex-col gap-4">
    {tools.map((tool, i) => (
      <div
        key={i}
        className={`tool-item flex items-center gap-3 group cursor-default ${
          animate && !isVisible ? 'opacity-0' : ''
        }`}
        style={
          animate && isVisible
            ? {
                animation: 'tool-item-in 0.5s ease-out forwards',
                animationDelay: `${baseDelay + i * 80}ms`,
                opacity: 0
              }
            : undefined
        }
      >
        <div className="tool-item-icon w-10 h-10 rounded-lg flex items-center justify-center shrink-0 p-2 bg-white/5 border border-white/10">
          {tool.icon}
        </div>
        <span className="text-base text-gray-200 font-medium group-hover:text-white transition-colors duration-300">
          {tool.name}
        </span>
      </div>
    ))}
  </div>
);

// Terminal-Typing-Effekt: Text erscheint wie beim Codieren
const useTerminalTyping = (text, isActive, charDelay = 25) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isActive || !text) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(id);
      }
    }, charDelay);
    return () => clearInterval(id);
  }, [text, isActive, charDelay]);

  return [displayed, done];
};

// Service-Kachel mit Terminal-Typing-Animation
const ServiceCard = ({ icon: Icon, title, description, delay = 0, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(() => setStartTyping(true), delay);
    return () => clearTimeout(t);
  }, [isVisible, delay]);

  const [titleText, titleDone] = useTerminalTyping(title, startTyping, 30);
  const [descStart, setDescStart] = useState(false);
  useEffect(() => {
    if (!titleDone) return;
    const t = setTimeout(() => setDescStart(true), 150);
    return () => clearTimeout(t);
  }, [titleDone]);
  const [descText, descDone] = useTerminalTyping(description, descStart, 15);

  return (
    <div ref={ref} className="opacity-100">
      <div className="group relative border border-white/10 rounded-2xl bg-[#0a0a0a] hover:bg-[#111] hover:border-white/30 transition-all duration-500 overflow-hidden h-[420px] flex flex-col justify-between">
        <div className="w-full border-b border-white/10 px-4 py-3 flex justify-between items-center bg-white/[0.02]">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-red-400/80 transition-colors"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-yellow-400/80 transition-colors"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-green-400/80 transition-colors"></div>
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">SRV_0{index}.EXE</span>
        </div>
        <div className="p-8 flex-grow flex flex-col min-h-0">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shrink-0">
            <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-semibold mb-3 tracking-tight font-mono min-h-[2.5rem]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">{titleText}</span>
            {!titleDone && <span className="terminal-cursor text-green-400">|</span>}
          </h3>
          <p className="text-gray-400 leading-relaxed text-sm font-light font-mono min-h-[3rem]">
            {descStart && <span className="text-green-400/70 mr-1">&gt;</span>}
            {descText}
            {descStart && !descDone && <span className="terminal-cursor text-green-400">|</span>}
          </p>
        </div>
        <div className="px-8 pb-8 flex items-center font-mono text-xs uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors shrink-0">
          <span className="text-green-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span> Mehr <ArrowRight className="w-4 h-4 ml-2" />
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useLenis();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 font-sans overflow-x-hidden selection:bg-white/20 selection:text-white">

      <NavBar scrolled={scrolled} />

      <main className="relative z-10">

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <HeroBackgroundVideo />
            <div className="absolute inset-0 bg-[#050505]/60"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <HeroTerminal />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 leading-[1.1]"
            >
              <span className="text-gray-500">Hey, ich bin Luca.</span>
              <br />
              <span className="text-white">Ich mache </span>
              <RotatingWord />
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="mt-4 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-8"
            >
              KI-Automatisierungen, Web-Apps, Hosting. Ich baue dir, was du brauchst – ohne bla bla.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.4}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href="#services" className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white text-black font-mono text-sm font-bold uppercase tracking-widest hover:bg-gray-200 hover:scale-105 transition-all duration-300">
                Execute Services
              </a>
              <a href="#contact" className="w-full sm:w-auto px-8 py-4 rounded-lg border border-white/20 bg-white/5 text-white font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                &gt; Terminal öffnen
              </a>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 relative overflow-hidden">
          <ParticleBackground />
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Engineering <span className="text-gray-500 font-mono text-2xl md:text-4xl font-normal ml-2">_Excellence</span>
              </h2>
              <div className="text-gray-400 text-lg mb-10 max-w-2xl font-light">
                <p className="font-mono text-xs text-green-400 mb-2">[ Module geladen: 4 ]</p>
                <p>Was ich anbiete – von KI-Workflows über Apps bis Hosting. Ehrlich und direkt.</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollCard3D index={0}>
                <ServiceCard index={1} icon={Smartphone} title="App Entwicklung" description="Maßgeschneiderte Native- und Web-Apps. Perfektes UI/UX-Design nach modernsten Standards." delay={100} />
              </ScrollCard3D>
              <ScrollCard3D index={1}>
                <ServiceCard index={2} icon={Cpu} title="Automatisierung" description="KI-Modelle einbauen, Prozesse automatisieren, Daten auswerten – ich helfe dir dabei." delay={200} />
              </ScrollCard3D>
              <ScrollCard3D index={2}>
                <ServiceCard index={3} icon={Workflow} title="Smart Workflows" description="Deine Tools vernetzen, Pipelines bauen – kein Copy-Paste mehr nötig." delay={300} />
              </ScrollCard3D>
              <ScrollCard3D index={3}>
                <ServiceCard index={4} icon={Database} title="Premium Hosting" description="Blitzschnelles, DSGVO-konformes Hosting. Server, Backups und Skalierung laufen vollautomatisch." delay={400} />
              </ScrollCard3D>
            </div>
          </div>
        </section>

        {/* About / Scroll Highlight Text Section */}
        <ScrollHighlightText
          text="Ich baue Software, die nicht nur funktioniert, sondern begeistert. Clean Code, smarte Architektur und echte Ergebnisse – keine leeren Versprechen. Von der ersten Zeile Code bis zum fertigen Produkt."
        />

        {/* Bento Grid / Studio Section */}
        <section id="about" className="py-12 relative overflow-hidden">
          <ParticleBackground />
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <Reveal direction="left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Development <span className="text-gray-500 font-mono text-2xl md:text-4xl font-normal ml-2">_Studio</span>
              </h2>
              <div className="text-gray-400 text-lg mb-10 max-w-2xl font-light">
                <p className="font-mono text-xs text-green-400 mb-2">[ Stack geladen: Modern Web Tech ]</p>
                <p>Mein Werkzeugkasten – Tools, Code-Standards und Infrastruktur, die funktionieren.</p>
              </div>
            </Reveal>

            <div className="space-y-8">
              {/* Clean Code Kachel */}
              <Reveal direction="up" delay={100}>
                <Card
                  icon={Code2}
                  title="Clean Code. High Performance."
                  label="CODE_01.EXE"
                  className="h-[500px]"
                  hideExecute={true}
                >
                  <div className="rounded-lg bg-black/60 border border-white/10 p-4 font-mono text-xs overflow-hidden flex-grow min-h-0 flex flex-col">
                    <CleanCodeTerminal />
                  </div>
                </Card>
              </Reveal>

              {/* Tools-Kachel: Mitte geteilt, mit Animationen */}
              <Reveal direction="up" delay={200}>
                <ToolsCard />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Referenzen Section – Kunden ohne Kachel */}
        <section id="referenzen" className="py-10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <p className="text-gray-500 text-sm font-mono text-center mb-6">
              Kunden, mit denen ich zusammen arbeite
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {[
                { src: '/harley-davidson-logo.png', name: 'Harley-Davidson Power Shop' },
                { src: '/intersport-gemo-logo.png', name: 'Intersport GEMO', large: true },
                { src: '/mobileobjects-logo.png', name: 'mobileObjects', large: true },
              ].map((client, i) => (
                <div key={i} className="flex items-center justify-center">
                  <img
                    src={client.src}
                    alt={client.name}
                    className={`w-auto object-contain ${client.large ? 'max-h-64 md:max-h-96' : 'max-h-40 md:max-h-56'}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 relative overflow-hidden">
          <ParticleBackground />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-white/10 bg-white/5 mb-6 backdrop-blur-md">
                <Terminal className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                Lust auf ein Projekt?
              </h2>
              <p className="text-lg text-gray-400 font-light mb-8 max-w-xl mx-auto leading-relaxed">
                Schreib mir – dann starten wir.
              </p>
              <form className="flex flex-col gap-4 max-w-xl mx-auto w-full">
                <div className="relative w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">&gt;</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="deine_email@domain.com"
                    className="pl-10 pr-6 py-4 w-full rounded-xl border border-white/20 bg-white/5 font-mono text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all text-white placeholder-gray-600 backdrop-blur-sm"
                  />
                </div>
                <div className="relative w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">&gt;</span>
                  <select
                    name="interesse"
                    className="pl-10 pr-10 py-4 w-full rounded-xl border border-white/20 bg-white/5 font-mono text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all text-white backdrop-blur-sm appearance-none bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
                  >
                    <option value="" className="bg-[#0a0a0a] text-gray-400">Was interessiert dich?</option>
                    <option value="web-app" className="bg-[#0a0a0a] text-white">Web-App</option>
                    <option value="app-entwicklung" className="bg-[#0a0a0a] text-white">App-Entwicklung</option>
                    <option value="automatisierung" className="bg-[#0a0a0a] text-white">Automatisierung</option>
                    <option value="hosting" className="bg-[#0a0a0a] text-white">Hosting</option>
                    <option value="sonstiges" className="bg-[#0a0a0a] text-white">Sonstiges</option>
                  </select>
                </div>
                <div className="relative w-full">
                  <span className="absolute left-4 top-5 text-gray-500 font-mono text-sm">&gt;</span>
                  <textarea
                    name="nachricht"
                    placeholder="Deine Nachricht..."
                    rows={4}
                    className="pl-10 pr-6 py-4 w-full rounded-xl border border-white/20 bg-white/5 font-mono text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all text-white placeholder-gray-600 backdrop-blur-sm resize-y min-h-[120px]"
                  />
                </div>
                <button type="submit" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white bg-white text-black font-mono font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors duration-300 shrink-0 self-center">
                  Senden //
                </button>
              </form>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer – volle Breite mit Blur wie Header */}
      <motion.footer
        className="w-full bg-white/[0.06] backdrop-blur-xl border-t border-white/10 py-6 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <a href="#" className="flex items-center group cursor-pointer shrink-0">
              <img
                src="/liftapp.png"
                alt="LAAS – Luca Arnoldi App Studio"
                className="h-8 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 brightness-0 invert"
              />
            </a>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs font-mono text-gray-500 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-white transition-colors">AGB</a>
            </div>
            <span className="flex items-center gap-2 text-gray-600 font-mono text-[10px] uppercase tracking-widest shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              &copy; {new Date().getFullYear()} LAAS
            </span>
          </div>
        </div>
      </motion.footer>

    </div>
  );
}
