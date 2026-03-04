import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Workflow, 
  Smartphone, 
  Database, 
  Terminal,
  Code2,
  Globe,
  ArrowRight,
  MonitorPlay
} from 'lucide-react';

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

// --- Components ---

// --- Particle Network Background ---
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

    const COUNT = 80;
    const MAX_DIST = 140;
    const MOUSE_DIST = 160;

    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: 1.5 + Math.random() * 1.5,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = particlesRef.current;

      // Update positions
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.4;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Mouse connections
        const mdx = pts[i].x - mouseRef.current.x;
        const mdy = pts[i].y - mouseRef.current.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_DIST) {
          const alpha = (1 - mdist / MOUSE_DIST) * 0.6;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.strokeStyle = `rgba(51, 255, 51, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Draw dots
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
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
        <span className="terminal-title">laas@studio:~</span>
      </div>
      <div className="terminal-body">
        <p className="terminal-line">
          <span className="terminal-prompt">$</span>
          <span className="typing-text">{typingText}</span>
          <span className="terminal-cursor">_</span>
        </p>
      </div>
    </div>
  );
};

const NavBar = ({ scrolled }) => (
  <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
    <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
      <a href="#" className="flex items-center group cursor-pointer">
        <img
          src="/LAAS_schriftzug.png"
          alt="LAAS – Luca Arnoldi App Studio"
          className="h-8 md:h-10 w-auto object-contain transition-all duration-300 group-hover:opacity-80 invert"
        />
      </a>
      <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
        <a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a>
        <a href="#about" className="text-gray-400 hover:text-white transition-colors">Studio</a>
        <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Kontakt</a>
      </div>
      <a href="#contact" className="hidden sm:inline-flex rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white font-mono text-xs font-medium uppercase tracking-widest px-6 py-2.5 hover:bg-white hover:text-black transition-all duration-300">
        INIT_PROJECT
      </a>
    </div>
  </nav>
);

const ServiceCard = ({ icon: Icon, title, description, delay, index }) => (
  <Reveal delay={delay} direction="up">
    <div className="group relative border border-white/10 rounded-2xl bg-[#0a0a0a] hover:bg-[#111] hover:border-white/30 transition-all duration-500 overflow-hidden min-h-[340px] flex flex-col justify-between">
      <div className="w-full border-b border-white/10 px-4 py-3 flex justify-between items-center bg-white/[0.02]">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-red-400/80 transition-colors"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-yellow-400/80 transition-colors"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-green-400/80 transition-colors"></div>
        </div>
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">SRV_0{index}.EXE</span>
      </div>
      <div className="p-8 flex-grow">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
          <Icon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm font-light">{description}</p>
      </div>
      <div className="px-8 pb-8 flex items-center font-mono text-xs uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
        <span className="text-green-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span> Execute <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </div>
  </Reveal>
);

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 font-sans overflow-x-hidden selection:bg-white/20 selection:text-white">

      <NavBar scrolled={scrolled} />

      <main className="relative z-10">

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50">
              <source src="/mixkit-world-map-in-a-digital-world-12748-hd-ready.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[#050505]/60"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">

            <Reveal direction="fade" delay={0}>
              <HeroTerminal />
            </Reveal>

            <Reveal direction="up" delay={100}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
                Software, die <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
                  funktioniert
                  <span className="absolute -right-4 md:-right-8 top-[58%] -translate-y-1/2 w-3 md:w-5 h-10 md:h-16 bg-white/80 animate-[pulse_1s_steps(2,start)_infinite]"></span>
                </span>
              </h1>
            </Reveal>

            <Reveal direction="up" delay={200}>
              <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                KI-Automatisierungen, Web-Apps, Hosting. Ich baue dir, was du brauchst – ohne bla bla.
              </p>
            </Reveal>

            <Reveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#services" className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white text-black font-mono text-sm font-bold uppercase tracking-widest hover:bg-gray-200 hover:scale-105 transition-all duration-300">
                  Execute Services
                </a>
                <a href="#contact" className="w-full sm:w-auto px-8 py-4 rounded-lg border border-white/20 bg-white/5 text-white font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  &gt; Terminal öffnen
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-32 relative overflow-hidden">
          <ParticleBackground />
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <Reveal direction="left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Engineering <span className="text-gray-500 font-mono text-2xl md:text-4xl font-normal ml-2">_Excellence</span>
              </h2>
              <p className="text-gray-400 text-lg mb-16 max-w-2xl font-light">
                <span className="font-mono text-xs text-green-400 mr-2">[ Module geladen: 4 ]</span>
                Was ich anbiete – von KI-Workflows über Apps bis Hosting. Ehrlich und direkt.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ServiceCard index={1} icon={Cpu} title="KI Automatisierung" description="Integriere smarte KI-Modelle. Wir automatisieren kognitive Prozesse und werten Daten in Echtzeit aus." delay={100} />
              <ServiceCard index={2} icon={Workflow} title="Smart Workflows" description="Kein manuelles Copy-Paste. Wir vernetzen deine Tools und bauen automatische, fehlerfreie Pipelines." delay={200} />
              <ServiceCard index={3} icon={Smartphone} title="App Entwicklung" description="Maßgeschneiderte Native- und Web-Apps. Perfektes UI/UX-Design nach modernsten Standards." delay={300} />
              <ServiceCard index={4} icon={Database} title="Premium Hosting" description="Blitzschnelles, DSGVO-konformes Hosting. Server, Backups und Skalierung laufen vollautomatisch." delay={400} />
            </div>
          </div>
        </section>

        {/* Bento Grid / Studio Section */}
        <section id="about" className="py-20 relative overflow-hidden">
          <ParticleBackground />
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">

              <div className="md:col-span-2 md:row-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-10 relative overflow-hidden group hover:border-white/30 transition-all duration-500">
                <div className="absolute top-8 right-8 text-white/5 group-hover:text-white/10 transition-colors duration-500">
                  <MonitorPlay className="w-64 h-64" strokeWidth={0.5} />
                </div>
                <Reveal>
                  <div className="h-full flex flex-col justify-end relative z-10">
                    <div className="w-14 h-14 rounded-xl border border-white/20 bg-white/10 text-white flex items-center justify-center mb-8 backdrop-blur-md">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight mb-4">Clean Code. High Performance.</h3>
                    <p className="text-gray-400 max-w-md font-light leading-relaxed">
                      Bei LAAS schreiben wir Code, der nicht nur heute funktioniert, sondern auch für die Herausforderungen von morgen skaliert. Jede Zeile ist streng optimiert.
                    </p>
                  </div>
                </Reveal>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-center relative group hover:bg-white/[0.04] transition-colors duration-500">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
                <Globe className="w-10 h-10 text-gray-300 mb-6" strokeWidth={1.5} />
                <h4 className="text-xl font-bold tracking-tight mb-2">Global_Scale</h4>
                <p className="text-sm text-gray-500 font-light leading-relaxed">Weltweites Edge-CDN für minimale Latenz, unabhängig vom Client-Standort.</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-center items-center text-center group hover:bg-white/[0.04] transition-colors duration-500">
                <h4 className="text-6xl font-bold text-white tracking-tighter mb-4">99.9<span className="text-gray-500">%</span></h4>
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Uptime Garantie</p>
              </div>

            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 relative overflow-hidden">
          <ParticleBackground />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <Reveal direction="up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-white/10 bg-white/5 mb-10 backdrop-blur-md">
                <Terminal className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                Lust auf ein Projekt?
              </h2>
              <p className="text-lg text-gray-400 font-light mb-12 max-w-xl mx-auto leading-relaxed">
                Schreib mir – dann schauen wir, ob wir zusammenpassen.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                <div className="relative w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">&gt;</span>
                  <input
                    type="email"
                    placeholder="deine_email@domain.com"
                    className="pl-10 pr-6 py-4 w-full rounded-xl border border-white/20 bg-white/5 font-mono text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all text-white placeholder-gray-600 backdrop-blur-sm"
                  />
                </div>
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white bg-white text-black font-mono font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors duration-300 shrink-0">
                  Senden //
                </button>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#020202] pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <a href="#" className="flex items-center group cursor-pointer">
              <img
                src="/LAAS_schriftzug.png"
                alt="LAAS – Luca Arnoldi App Studio"
                className="h-8 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 invert"
              />
            </a>
            <div className="flex flex-wrap justify-center gap-6 text-xs font-mono text-gray-500 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-white transition-colors">AGB</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 font-mono text-[10px] uppercase tracking-widest border-t border-white/5 pt-8">
            <span>© {new Date().getFullYear()} LUCA ARNOLDI APP STUDIO.</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              STATUS: ALL_SYSTEMS_NOMINAL
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
