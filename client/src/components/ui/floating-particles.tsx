import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  anchorX: number;
  anchorY: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
}

// Loose D shape anchor points - abstract, not perfect
const D_ANCHORS = [
  // Vertical spine (left side) - slightly wavy
  { x: -35, y: -45 }, { x: -38, y: -30 }, { x: -35, y: -15 }, { x: -37, y: 0 },
  { x: -35, y: 15 }, { x: -38, y: 30 }, { x: -35, y: 45 },
  // Top curve
  { x: -20, y: -48 }, { x: -5, y: -42 }, { x: 8, y: -32 },
  // Right curve (belly of D)
  { x: 18, y: -18 }, { x: 22, y: 0 }, { x: 18, y: 18 },
  // Bottom curve
  { x: 8, y: 32 }, { x: -5, y: 42 }, { x: -20, y: 48 },
];

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const startTimeRef = useRef(Date.now());
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

    // Colors: Light = blue accent + pale black, Dark = phosphoric royal blue + pale white
    const colors = isDark 
      ? ["46, 75, 255", "248, 250, 252"]    // #2E4BFF phosphoric royal blue, #F8FAFC pale white
      : ["37, 99, 235", "30, 41, 59"];       // #2563EB blue accent, #1E293B pale black

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    particlesRef.current = D_ANCHORS.map((anchor, i) => ({
      x: centerX + (Math.random() - 0.5) * 300,
      y: centerY + (Math.random() - 0.5) * 300,
      vx: 0,
      vy: 0,
      size: Math.random() * 2 + 2.5,
      color: colors[i % 2],
      anchorX: anchor.x,
      anchorY: anchor.y,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
    }));

    startTimeRef.current = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      lastMoveRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove);

    const noise = (x: number, y: number) => {
      return Math.sin(x * 0.01) * Math.cos(y * 0.01) + 
             Math.sin(x * 0.02 + y * 0.01) * 0.5;
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      timeRef.current += 0.02;

      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const timeSinceMove = Date.now() - lastMoveRef.current;
      const isMoving = timeSinceMove < 150;

      // Fade based on cursor movement
      if (isMoving) {
        opacityRef.current = Math.min(1, opacityRef.current + 0.08);
      } else {
        opacityRef.current = Math.max(0, opacityRef.current - 0.012);
      }

      if (opacityRef.current > 0.01) {
        const mouse = mouseRef.current;
        
        // Transition factor: 0 = fully scattered, 1 = loose D formation
        // Start transitioning after 7 seconds, complete over 3 seconds
        const coalesceProgress = Math.min(1, Math.max(0, (elapsedSeconds - 7) / 3));

        particlesRef.current.forEach((particle, index) => {
          // Noise-based organic movement
          const noiseX = noise(particle.noiseOffsetX + timeRef.current, particle.noiseOffsetY) * 50;
          const noiseY = noise(particle.noiseOffsetY + timeRef.current, particle.noiseOffsetX) * 50;
          
          // Jitter the D anchor points for imperfect shape
          const jitterX = Math.sin(timeRef.current * 0.5 + index) * 12;
          const jitterY = Math.cos(timeRef.current * 0.4 + index * 1.3) * 12;
          
          // D formation target (relative to cursor)
          const dTargetX = mouse.x + particle.anchorX * 1.8 + jitterX;
          const dTargetY = mouse.y + particle.anchorY * 1.8 + jitterY;
          
          // Scattered target (flowing around cursor)
          const scatterAngle = (index / particlesRef.current.length) * Math.PI * 2 + timeRef.current * 0.4;
          const scatterRadius = 80 + Math.sin(timeRef.current + index) * 40;
          const scatterTargetX = mouse.x + Math.cos(scatterAngle) * scatterRadius + noiseX;
          const scatterTargetY = mouse.y + Math.sin(scatterAngle) * scatterRadius + noiseY;
          
          // Blend between scattered and D formation based on progress
          const targetX = scatterTargetX * (1 - coalesceProgress) + dTargetX * coalesceProgress;
          const targetY = scatterTargetY * (1 - coalesceProgress) + dTargetY * coalesceProgress;

          // Liquid physics
          const dx = targetX - particle.x;
          const dy = targetY - particle.y;
          
          particle.vx += dx * 0.025;
          particle.vy += dy * 0.025;
          
          // Drag
          particle.vx *= 0.9;
          particle.vy *= 0.9;
          
          // Inter-particle repulsion for organic scatter
          particlesRef.current.forEach((other, otherIndex) => {
            if (index !== otherIndex) {
              const pdx = particle.x - other.x;
              const pdy = particle.y - other.y;
              const dist = Math.sqrt(pdx * pdx + pdy * pdy);
              if (dist < 25 && dist > 0) {
                const force = (25 - dist) / 25 * 0.4;
                particle.vx += (pdx / dist) * force;
                particle.vy += (pdy / dist) * force;
              }
            }
          });

          // Clamp velocity
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          if (speed > 6) {
            particle.vx = (particle.vx / speed) * 6;
            particle.vy = (particle.vy / speed) * 6;
          }

          particle.x += particle.vx;
          particle.y += particle.vy;

          // Render
          ctx.save();
          ctx.globalAlpha = opacityRef.current * (isDark ? 0.75 : 0.6);
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
