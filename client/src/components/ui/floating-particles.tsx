import { useEffect, useRef, useState } from "react";

interface Ring {
  baseRadius: number;
  phase: number;
}

interface Dot {
  ringIndex: number;
  angle: number;
  size: number;
  colorIndex: number;
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const dotsRef = useRef<Dot[]>([]);
  const ringsRef = useRef<Ring[]>([]);
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

    // 8 rings, smaller size, hollow center starts at 35px
    const ringCount = 8;
    ringsRef.current = Array.from({ length: ringCount }, (_, i) => ({
      baseRadius: 35 + i * 15, // Smaller: 35px to 140px
      phase: i * 0.4,
    }));

    // MANY dots per ring (48) to make solid-looking circles
    const dotsPerRing = 48;
    dotsRef.current = [];
    
    for (let ringIdx = 0; ringIdx < ringCount; ringIdx++) {
      for (let d = 0; d < dotsPerRing; d++) {
        dotsRef.current.push({
          ringIndex: ringIdx,
          angle: (d / dotsPerRing) * Math.PI * 2,
          size: 1.2 + Math.random() * 0.6, // Tiny dots
          colorIndex: (ringIdx + d) % 2,
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

    const colorsLight = ["37, 99, 235", "30, 41, 59"];
    const colorsDark = ["46, 75, 255", "248, 250, 252"];

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      timeRef.current += 0.016;

      const timeSinceMove = Date.now() - lastMoveRef.current;
      const isMoving = timeSinceMove < 200;

      if (isMoving) {
        opacityRef.current = Math.min(1, opacityRef.current + 0.06);
      } else {
        opacityRef.current = Math.max(0, opacityRef.current - 0.012);
      }

      // Smooth cursor following
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.08;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.08;

      const colors = isDark ? colorsDark : colorsLight;

      if (opacityRef.current > 0.01) {
        const centerX = smoothMouseRef.current.x;
        const centerY = smoothMouseRef.current.y;

        // Wave travels outward - expands from center
        const wavePosition = (timeRef.current * 0.2) % 1; // Slow wave

        dotsRef.current.forEach((dot) => {
          const ring = ringsRef.current[dot.ringIndex];
          const ringNorm = dot.ringIndex / (ringCount - 1);
          
          // Gentle wave motion on each ring
          const waveOffset = Math.sin(timeRef.current * 0.5 + ring.phase) * 4;
          const currentRadius = ring.baseRadius + waveOffset;
          
          // Position
          const x = centerX + Math.cos(dot.angle) * currentRadius;
          const y = centerY + Math.sin(dot.angle) * currentRadius;
          
          // Wave crest visibility - expanding outward
          const distFromWave = Math.abs(ringNorm - wavePosition);
          const wrappedDist = Math.min(distFromWave, 1 - distFromWave);
          
          // Only ~30% visible: sharp falloff
          const visibility = Math.max(0, 1 - wrappedDist / 0.15);
          const brightness = 0.1 + visibility * 0.65;

          ctx.save();
          ctx.globalAlpha = opacityRef.current * brightness * (isDark ? 1 : 0.85);
          ctx.fillStyle = `rgba(${colors[dot.colorIndex]}, 1)`;
          ctx.beginPath();
          ctx.arc(x, y, dot.size, 0, Math.PI * 2);
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
