import { useEffect, useRef, useState } from "react";

interface Dot {
  type: "spike" | "core" | "halo";
  spikeIndex?: number;
  distanceRatio: number;
  angleOffset: number;
  size: number;
  colorIndex: number;
  brightness: number;
  phase: number;
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const dotsRef = useRef<Dot[]>([]);
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

    dotsRef.current = [];

    // 6 diffraction spikes
    const spikeCount = 6;
    const dotsPerSpike = 18;
    
    for (let s = 0; s < spikeCount; s++) {
      for (let d = 0; d < dotsPerSpike; d++) {
        const distanceRatio = (d + 1) / dotsPerSpike;
        dotsRef.current.push({
          type: "spike",
          spikeIndex: s,
          distanceRatio,
          angleOffset: (Math.random() - 0.5) * 0.08,
          size: 0.8 + (1 - distanceRatio) * 1.2,
          colorIndex: (s + d) % 2,
          brightness: 0.12,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Central core glow - 20 dots
    for (let c = 0; c < 20; c++) {
      const angle = (c / 20) * Math.PI * 2;
      dotsRef.current.push({
        type: "core",
        distanceRatio: 0.3 + Math.random() * 0.7,
        angleOffset: angle,
        size: 1.8 + Math.random() * 0.8,
        colorIndex: c % 2,
        brightness: 0.15,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Two halo rings
    const haloRadii = [0.4, 0.7];
    haloRadii.forEach((haloRatio, haloIdx) => {
      const dotsInHalo = 16;
      for (let h = 0; h < dotsInHalo; h++) {
        dotsRef.current.push({
          type: "halo",
          distanceRatio: haloRatio,
          angleOffset: (h / dotsInHalo) * Math.PI * 2,
          size: 1.2 + Math.random() * 0.6,
          colorIndex: (haloIdx + h) % 2,
          brightness: 0.1,
          phase: Math.random() * Math.PI * 2,
        });
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      lastMoveRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove);

    const colorsLight = ["37, 99, 235", "30, 41, 59"];
    const colorsDark = ["46, 75, 255", "248, 250, 252"];

    const maxSpikeLength = 140;
    const coreRadius = 15;
    const maxHaloRadius = 100;

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

      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.08;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.08;

      const colors = isDark ? colorsDark : colorsLight;

      if (opacityRef.current > 0.01) {
        const centerX = smoothMouseRef.current.x;
        const centerY = smoothMouseRef.current.y;

        // Slow rotation oscillation
        const rotationOffset = Math.sin(timeRef.current * 0.2) * 0.1;
        
        // Wave-driven spike length modulation
        const lengthWave = 1 + Math.sin(timeRef.current * 0.25) * 0.15;

        dotsRef.current.forEach((dot) => {
          let x = centerX;
          let y = centerY;
          
          // Twinkle phase
          const twinklePhase = timeRef.current * 0.3 + dot.phase;
          const twinkleValue = Math.sin(twinklePhase);
          const isAtPeak = twinkleValue > 0.8;
          
          if (isAtPeak) {
            dot.brightness = Math.min(0.7, dot.brightness + 0.12);
          } else {
            dot.brightness = Math.max(dot.type === "core" ? 0.18 : 0.1, dot.brightness - 0.006);
          }

          if (dot.type === "spike" && dot.spikeIndex !== undefined) {
            const baseAngle = (dot.spikeIndex / 6) * Math.PI * 2 + rotationOffset;
            const angle = baseAngle + dot.angleOffset;
            const distance = dot.distanceRatio * maxSpikeLength * lengthWave;
            
            // Wave motion along spike
            const waveOffset = Math.sin(timeRef.current * 0.4 + dot.distanceRatio * 3) * 4;
            
            x = centerX + Math.cos(angle) * distance;
            y = centerY + Math.sin(angle) * distance + waveOffset;
            
          } else if (dot.type === "core") {
            const pulseRadius = coreRadius * (1 + Math.sin(timeRef.current * 0.3) * 0.2);
            const angle = dot.angleOffset + rotationOffset;
            const distance = dot.distanceRatio * pulseRadius;
            
            x = centerX + Math.cos(angle) * distance;
            y = centerY + Math.sin(angle) * distance;
            
          } else if (dot.type === "halo") {
            const haloWave = 1 + Math.sin(timeRef.current * 0.2 + dot.phase) * 0.1;
            const angle = dot.angleOffset + rotationOffset * 0.5;
            const distance = dot.distanceRatio * maxHaloRadius * haloWave;
            
            const waveY = Math.sin(timeRef.current * 0.35 + dot.angleOffset) * 6;
            
            x = centerX + Math.cos(angle) * distance;
            y = centerY + Math.sin(angle) * distance + waveY;
          }

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
