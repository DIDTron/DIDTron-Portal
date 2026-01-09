import { useEffect, useRef, useState } from "react";

interface Ring {
  baseRadius: number;
  phase: number;
}

interface Dot {
  ringIndex: number;
  baseAngle: number;
  angleJitter: number;
  radiusJitter: number;
  size: number;
  colorIndex: number;
  brightness: number;
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

    // 8 rings with 60px spacing (400% of 15px), hollow center at 50px
    const ringCount = 8;
    ringsRef.current = Array.from({ length: ringCount }, (_, i) => ({
      baseRadius: 50 + i * 60, // Wide spacing: 50, 110, 170, 230...
      phase: i * 0.3,
    }));

    // Only 12 dots per ring - sparse, with jitter
    const dotsPerRing = 12;
    dotsRef.current = [];
    
    for (let ringIdx = 0; ringIdx < ringCount; ringIdx++) {
      for (let d = 0; d < dotsPerRing; d++) {
        dotsRef.current.push({
          ringIndex: ringIdx,
          baseAngle: (d / dotsPerRing) * Math.PI * 2,
          angleJitter: (Math.random() - 0.5) * 0.3, // Random angular offset
          radiusJitter: (Math.random() - 0.5) * 8, // Random radial offset
          size: 1.5 + Math.random() * 1,
          colorIndex: (ringIdx + d) % 2,
          brightness: 0.15,
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

        // Very slow crest rotation - only ~30% of arc visible
        const crestAngle = timeRef.current * 0.15; // Very slow rotation
        const crestWidth = Math.PI * 0.6; // ~30% of circle (0.6 radians = ~34 degrees each side)

        dotsRef.current.forEach((dot) => {
          const ring = ringsRef.current[dot.ringIndex];
          
          // Very slow wave motion
          const radiusWave = Math.sin(timeRef.current * 0.08 + ring.phase) * 5;
          const currentRadius = ring.baseRadius + radiusWave + dot.radiusJitter;
          
          // Angle with jitter and slow drift
          const angleDrift = Math.sin(timeRef.current * 0.05 + dot.baseAngle) * 0.08;
          const angle = dot.baseAngle + dot.angleJitter + angleDrift;
          
          // Position
          const x = centerX + Math.cos(angle) * currentRadius;
          const y = centerY + Math.sin(angle) * currentRadius;
          
          // Calculate if dot is in the visible crest arc
          const ringCrestOffset = ring.phase * 0.5; // Each ring has offset crest
          const dotAngleFromCrest = Math.abs(((angle - crestAngle - ringCrestOffset) + Math.PI) % (Math.PI * 2) - Math.PI);
          
          // Smooth visibility based on distance from crest
          const visibility = Math.max(0, 1 - dotAngleFromCrest / crestWidth);
          const smoothVis = visibility * visibility; // Quadratic falloff
          
          // Target brightness: mostly dim, bright only in crest
          const targetBrightness = 0.15 + smoothVis * 0.6;
          
          // Very slow fade transition
          const fadeSpeed = smoothVis > 0.3 ? 0.08 : 0.02;
          dot.brightness += (targetBrightness - dot.brightness) * fadeSpeed;

          ctx.save();
          ctx.globalAlpha = opacityRef.current * dot.brightness * (isDark ? 1 : 0.85);
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
