import { useEffect, useRef, useState } from "react";

interface Ring {
  baseRadius: number;
  wavePhase: number;
  waveSpeed: number;
}

interface Dot {
  ringIndex: number;
  anglePosition: number;
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

    // 10 concentric rings - START AT 60px for hollow center
    const ringCount = 10;
    ringsRef.current = Array.from({ length: ringCount }, (_, i) => ({
      baseRadius: 60 + i * 25, // Hollow center: starts at 60px
      wavePhase: i * 0.5,
      waveSpeed: 0.15 + i * 0.02,
    }));

    // 12 dots per ring
    const dotsPerRing = 12;
    dotsRef.current = [];
    
    for (let ringIdx = 0; ringIdx < ringCount; ringIdx++) {
      for (let d = 0; d < dotsPerRing; d++) {
        dotsRef.current.push({
          ringIndex: ringIdx,
          anglePosition: d / dotsPerRing,
          size: 1.5 + Math.random() * 1,
          colorIndex: (ringIdx + d) % 2,
          brightness: 0,
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

        // Wave crest position - travels outward slowly
        const waveCrests = [
          (timeRef.current * 0.15) % 1,
          ((timeRef.current * 0.15) + 0.33) % 1,
          ((timeRef.current * 0.15) + 0.66) % 1,
        ];

        dotsRef.current.forEach((dot) => {
          const ring = ringsRef.current[dot.ringIndex];
          
          // Ring's normalized position (0 = innermost, 1 = outermost)
          const ringNorm = dot.ringIndex / (ringCount - 1);
          
          // Sea wave motion
          const waveTime = timeRef.current * ring.waveSpeed;
          const dotAngle = dot.anglePosition * Math.PI * 2;
          
          // Gentle vertical wave
          const waveHeight = Math.sin(waveTime * 2 + ring.wavePhase) * 6;
          
          // Radius expansion effect
          const radiusWave = Math.sin(waveTime * 1.2 + ring.wavePhase) * 8;
          const currentRadius = ring.baseRadius + radiusWave;
          
          // Position on concentric circle
          const x = centerX + Math.cos(dotAngle) * currentRadius;
          const y = centerY + Math.sin(dotAngle) * currentRadius + waveHeight;
          
          // Calculate distance from each wave crest
          // Wave crest illuminates ~30% of rings at a time
          let maxCrestInfluence = 0;
          waveCrests.forEach(crest => {
            const distFromCrest = Math.abs(ringNorm - crest);
            const wrappedDist = Math.min(distFromCrest, 1 - distFromCrest);
            // Narrow window: ~0.15 on each side = 30% total
            const influence = Math.max(0, 1 - wrappedDist / 0.15);
            maxCrestInfluence = Math.max(maxCrestInfluence, influence);
          });
          
          // Target brightness based on crest proximity
          const targetBrightness = 0.15 + maxCrestInfluence * 0.6;
          
          // Smooth transition
          const fadeSpeed = maxCrestInfluence > 0.5 ? 0.2 : 0.02;
          dot.brightness += (targetBrightness - dot.brightness) * fadeSpeed;

          // Render dot
          ctx.save();
          ctx.globalAlpha = opacityRef.current * dot.brightness * (isDark ? 1 : 0.9);
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
