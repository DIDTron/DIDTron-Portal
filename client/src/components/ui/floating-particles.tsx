import { useEffect, useRef, useState } from "react";

const D_LETTER_POINTS = [
  // Vertical line of D (left side)
  { x: -40, y: -50 }, { x: -40, y: -40 }, { x: -40, y: -30 }, { x: -40, y: -20 },
  { x: -40, y: -10 }, { x: -40, y: 0 }, { x: -40, y: 10 }, { x: -40, y: 20 },
  { x: -40, y: 30 }, { x: -40, y: 40 }, { x: -40, y: 50 },
  // Top horizontal of D
  { x: -30, y: -50 }, { x: -20, y: -50 }, { x: -10, y: -48 }, { x: 0, y: -44 },
  // Right curve of D (top to middle)
  { x: 10, y: -38 }, { x: 18, y: -30 }, { x: 24, y: -20 }, { x: 28, y: -10 },
  { x: 30, y: 0 },
  // Right curve of D (middle to bottom)
  { x: 28, y: 10 }, { x: 24, y: 20 }, { x: 18, y: 30 }, { x: 10, y: 38 },
  // Bottom horizontal of D
  { x: 0, y: 44 }, { x: -10, y: 48 }, { x: -20, y: 50 }, { x: -30, y: 50 },
  // Extra dots for fuller D shape
  { x: -30, y: -40 }, { x: -30, y: 40 },
  { x: -20, y: -42 }, { x: -20, y: 42 },
  { x: -10, y: -40 }, { x: -10, y: 40 },
  { x: 5, y: -35 }, { x: 5, y: 35 },
  { x: 15, y: -25 }, { x: 15, y: 25 },
  { x: 22, y: -15 }, { x: 22, y: 15 },
  { x: 25, y: -5 }, { x: 25, y: 5 },
];

interface Particle {
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  size: number;
  opacity: number;
  color: string;
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, moving: false });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const fadeRef = useRef(0);
  const lastMoveRef = useRef(0);
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

    const colors = isDark 
      ? ["56, 189, 248", "99, 102, 241", "129, 140, 248", "147, 197, 253"]
      : ["29, 78, 216", "37, 99, 235", "67, 56, 202", "99, 102, 241"];

    particlesRef.current = D_LETTER_POINTS.map((point) => ({
      targetX: point.x,
      targetY: point.y,
      currentX: point.x + (Math.random() - 0.5) * 100,
      currentY: point.y + (Math.random() - 0.5) * 100,
      size: Math.random() * 4 + 3,
      opacity: isDark ? 0.7 : 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        moving: true,
      };
      lastMoveRef.current = Date.now();
      fadeRef.current = 1;
    };

    const handleMouseLeave = () => {
      mouseRef.current.moving = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const timeSinceMove = Date.now() - lastMoveRef.current;
      if (timeSinceMove > 100) {
        fadeRef.current = Math.max(0, fadeRef.current - 0.02);
      }

      if (fadeRef.current > 0) {
        const mouse = mouseRef.current;

        particlesRef.current.forEach((particle) => {
          const targetScreenX = mouse.x + particle.targetX;
          const targetScreenY = mouse.y + particle.targetY;

          particle.currentX += (targetScreenX - particle.currentX) * 0.15;
          particle.currentY += (targetScreenY - particle.currentY) * 0.15;

          ctx.save();
          ctx.globalAlpha = particle.opacity * fadeRef.current;
          ctx.fillStyle = `rgba(${particle.color}, 1)`;
          ctx.beginPath();
          ctx.arc(particle.currentX, particle.currentY, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
