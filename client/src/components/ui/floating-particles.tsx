import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  color: string;
  type: "circle" | "square" | "diamond";
}

const BRAND_COLORS_LIGHT = [
  "15, 23, 42",     // Slate-900 - Very dark
  "29, 78, 216",    // #1d4ed8 - Dark blue
  "37, 99, 235",    // #2563eb - Primary blue
  "67, 56, 202",    // #4338ca - Indigo
];

const BRAND_COLORS_DARK = [
  "56, 189, 248",   // #38bdf8 - Light blue
  "99, 102, 241",   // #6366f1 - Violet
  "129, 140, 248",  // #818cf8 - Light violet
  "147, 197, 253",  // #93c5fd - Very light blue
];

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 80;
    const rect = canvas.getBoundingClientRect();
    const colors = isDark ? BRAND_COLORS_DARK : BRAND_COLORS_LIGHT;
    const baseOpacityRange = isDark ? { min: 0.25, max: 0.5 } : { min: 0.15, max: 0.35 };

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 5 + 3,
      baseOpacity: Math.random() * (baseOpacityRange.max - baseOpacityRange.min) + baseOpacityRange.min,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: ["circle", "square", "diamond"][Math.floor(Math.random() * 3)] as "circle" | "square" | "diamond",
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      timeRef.current += 0.01;

      particlesRef.current.forEach((particle) => {
        const mouse = mouseRef.current;
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200 && distance > 0) {
          const force = (200 - distance) / 200 * 0.4;
          const angle = Math.atan2(dy, dx);
          particle.vx += Math.cos(angle) * force;
          particle.vy += Math.sin(angle) * force;
        }

        particle.vx += Math.sin(timeRef.current + particle.x * 0.01) * 0.003;
        particle.vy += Math.cos(timeRef.current + particle.y * 0.01) * 0.003;

        particle.vx *= 0.96;
        particle.vy *= 0.96;

        const maxSpeed = 3;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = rect.width + 20;
        if (particle.x > rect.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = rect.height + 20;
        if (particle.y > rect.height + 20) particle.y = -20;

        const proximityBoost = distance < 150 ? (150 - distance) / 150 * 0.3 : 0;
        const finalOpacity = Math.min(particle.baseOpacity + proximityBoost, 0.8);

        ctx.save();
        ctx.globalAlpha = finalOpacity;
        ctx.fillStyle = `rgba(${particle.color}, 1)`;
        ctx.translate(particle.x, particle.y);

        if (particle.type === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.type === "square") {
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        } else if (particle.type === "diamond") {
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
