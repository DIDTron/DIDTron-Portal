import { useEffect, useRef, useState } from "react";

interface Arch {
  yOffset: number;
  radius: number;
  phase: number;
  fadePhase: number;
}

interface Dot {
  archIndex: number;
  anglePosition: number; // 0 to 1 along the arch
  size: number;
  colorIndex: number;
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const dotsRef = useRef<Dot[]>([]);
  const archesRef = useRef<Arch[]>([]);
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

    // 10 arches stacked vertically above each other
    const archCount = 10;
    const archSpacing = 22;
    const baseRadius = 120;

    archesRef.current = Array.from({ length: archCount }, (_, i) => ({
      yOffset: -i * archSpacing, // stacked upward from cursor
      radius: baseRadius - i * 8, // slightly smaller as they go up
      phase: i * 0.4, // wave phase offset
      fadePhase: i * 0.5, // fade phase offset
    }));

    // 8 dots per arch, evenly distributed
    const dotsPerArch = 8;
    dotsRef.current = [];
    
    for (let archIdx = 0; archIdx < archCount; archIdx++) {
      for (let d = 0; d < dotsPerArch; d++) {
        dotsRef.current.push({
          archIndex: archIdx,
          anglePosition: (d + 0.5) / dotsPerArch, // 0 to 1 evenly spaced
          size: 3 + Math.random() * 1.5,
          colorIndex: (archIdx + d) % 2,
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      lastMoveRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Colors
    const colorsLight = ["37, 99, 235", "30, 41, 59"];       // blue accent + pale black
    const colorsDark = ["46, 75, 255", "248, 250, 252"];     // phosphoric royal blue + pale white

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      timeRef.current += 0.025;

      const timeSinceMove = Date.now() - lastMoveRef.current;
      const isMoving = timeSinceMove < 200;

      // Fade based on cursor movement
      if (isMoving) {
        opacityRef.current = Math.min(1, opacityRef.current + 0.06);
      } else {
        opacityRef.current = Math.max(0, opacityRef.current - 0.012);
      }

      // Smooth cursor following
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.1;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.1;

      const colors = isDark ? colorsDark : colorsLight;

      if (opacityRef.current > 0.01) {
        const centerX = smoothMouseRef.current.x;
        const centerY = smoothMouseRef.current.y;

        dotsRef.current.forEach((dot) => {
          const arch = archesRef.current[dot.archIndex];
          
          // Wave motion - arches move up and down like waves
          const waveY = Math.sin(timeRef.current * 1.5 + arch.phase) * 12;
          
          // Fade/solid breathing - each arch fades at different times
          const fadeValue = 0.3 + (Math.sin(timeRef.current * 0.8 + arch.fadePhase) + 1) * 0.35;
          
          // Scale pulse - arches grow and shrink slightly
          const scaleValue = 1 + Math.sin(timeRef.current * 1.2 + arch.phase) * 0.08;
          
          // Calculate dot position on the arch (semi-circle)
          const angle = dot.anglePosition * Math.PI; // 0 to PI for semi-circle
          const currentRadius = arch.radius * scaleValue;
          
          const x = centerX + Math.cos(angle) * currentRadius - currentRadius; // offset so arch is centered
          const y = centerY + arch.yOffset + waveY - Math.sin(angle) * currentRadius * 0.4;

          // Render dot
          ctx.save();
          ctx.globalAlpha = opacityRef.current * fadeValue * (isDark ? 0.85 : 0.7);
          ctx.fillStyle = `rgba(${colors[dot.colorIndex]}, 1)`;
          ctx.beginPath();
          ctx.arc(x + currentRadius, y, dot.size, 0, Math.PI * 2);
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
