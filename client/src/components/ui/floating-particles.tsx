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

    // 10 concentric rings around cursor
    const ringCount = 10;
    ringsRef.current = Array.from({ length: ringCount }, (_, i) => ({
      baseRadius: 30 + i * 22,
      wavePhase: i * 0.6,
      waveSpeed: 0.15 + Math.random() * 0.1,
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

        dotsRef.current.forEach((dot) => {
          const ring = ringsRef.current[dot.ringIndex];
          
          // Sea wave motion - ripple outward
          const waveTime = timeRef.current * ring.waveSpeed;
          const dotAngle = dot.anglePosition * Math.PI * 2;
          
          // Ripple effect: wave travels through the rings
          const ripplePhase = waveTime * 2 + ring.wavePhase + dotAngle * 0.3;
          const waveHeight = Math.sin(ripplePhase) * 8;
          
          // Radius undulation
          const radiusWave = Math.sin(waveTime * 1.5 + ring.wavePhase) * 6;
          const currentRadius = ring.baseRadius + radiusWave;
          
          // Position on concentric circle
          const x = centerX + Math.cos(dotAngle) * currentRadius;
          const y = centerY + Math.sin(dotAngle) * currentRadius + waveHeight;
          
          // Brightness: dim most of the time, bright only at wave peak
          const peakValue = Math.sin(ripplePhase);
          const isAtPeak = peakValue > 0.85;
          
          // Target brightness
          const targetBrightness = isAtPeak ? 0.75 : 0.15;
          
          // Smooth transition - fast rise, slow fade
          if (isAtPeak) {
            dot.brightness = Math.min(0.75, dot.brightness + 0.15);
          } else {
            dot.brightness = Math.max(0.15, dot.brightness - 0.008);
          }

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
