import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  noiseOffsetX: number;
  noiseOffsetY: number;
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const lastMoveRef = useRef(0);
  const opacityRef = useRef(0);
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

    // Colors: Light mode = blue accent + pale black, Dark mode = phosphoric blue + pale white
    const colors = isDark 
      ? ["56, 249, 255", "248, 250, 252"]  // #38F9FF phosphoric blue, #F8FAFC pale white
      : ["37, 99, 235", "30, 41, 59"];      // #2563EB blue accent, #1E293B pale black

    const particleCount = isDark ? 18 : 14;
    const rect = canvas.getBoundingClientRect();

    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      x: rect.width / 2 + (Math.random() - 0.5) * 200,
      y: rect.height / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      size: Math.random() * 2 + 2.5,
      color: colors[i % 2],
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      mouseRef.current.vx = newX - mouseRef.current.x;
      mouseRef.current.vy = newY - mouseRef.current.y;
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.x = newX;
      mouseRef.current.y = newY;
      
      lastMoveRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Simple noise function for organic movement
    const noise = (x: number, y: number) => {
      return Math.sin(x * 0.01) * Math.cos(y * 0.01) + 
             Math.sin(x * 0.02 + y * 0.01) * 0.5;
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      timeRef.current += 0.02;

      const timeSinceMove = Date.now() - lastMoveRef.current;
      const isMoving = timeSinceMove < 150;
      
      // Fade in/out based on cursor movement
      if (isMoving) {
        opacityRef.current = Math.min(1, opacityRef.current + 0.08);
      } else {
        opacityRef.current = Math.max(0, opacityRef.current - 0.015);
      }

      if (opacityRef.current > 0.01) {
        const mouse = mouseRef.current;

        particlesRef.current.forEach((particle, index) => {
          // Calculate target position around cursor with organic offset
          const angle = (index / particlesRef.current.length) * Math.PI * 2 + timeRef.current * 0.3;
          const spreadRadius = 60 + Math.sin(timeRef.current + index) * 30;
          
          const noiseX = noise(particle.noiseOffsetX + timeRef.current, particle.noiseOffsetY) * 40;
          const noiseY = noise(particle.noiseOffsetY + timeRef.current, particle.noiseOffsetX) * 40;
          
          const targetX = mouse.x + Math.cos(angle) * spreadRadius + noiseX;
          const targetY = mouse.y + Math.sin(angle) * spreadRadius + noiseY;

          // Liquid-like physics: smooth acceleration toward target
          const dx = targetX - particle.x;
          const dy = targetY - particle.y;
          
          particle.vx += dx * 0.03;
          particle.vy += dy * 0.03;
          
          // Apply drag for smooth deceleration
          particle.vx *= 0.92;
          particle.vy *= 0.92;
          
          // Inter-particle repulsion for organic scatter
          particlesRef.current.forEach((other, otherIndex) => {
            if (index !== otherIndex) {
              const pdx = particle.x - other.x;
              const pdy = particle.y - other.y;
              const dist = Math.sqrt(pdx * pdx + pdy * pdy);
              if (dist < 30 && dist > 0) {
                const force = (30 - dist) / 30 * 0.5;
                particle.vx += (pdx / dist) * force;
                particle.vy += (pdy / dist) * force;
              }
            }
          });

          // Clamp velocity
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          if (speed > 8) {
            particle.vx = (particle.vx / speed) * 8;
            particle.vy = (particle.vy / speed) * 8;
          }

          particle.x += particle.vx;
          particle.y += particle.vy;

          // Render
          ctx.save();
          ctx.globalAlpha = opacityRef.current * (isDark ? 0.7 : 0.6);
          ctx.fillStyle = `rgba(${particle.color}, 1)`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
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
