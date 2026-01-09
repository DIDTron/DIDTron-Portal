import { useEffect, useRef, useState } from "react";

interface Dot {
  x: number;
  y: number;
  distance: number;
  angle: number;
  size: number;
  colorIndex: number;
  brightness: number;
  noiseOffset: number;
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

    // Generate randomly distributed dots in radial bands
    // Hollow center: min 40px, max 300px
    const dotCount = 80;
    dotsRef.current = [];
    
    for (let i = 0; i < dotCount; i++) {
      // Random distance from center (hollow core at 40px)
      const distance = 40 + Math.random() * 260;
      // Random angle
      const angle = Math.random() * Math.PI * 2;
      
      dotsRef.current.push({
        x: 0,
        y: 0,
        distance,
        angle,
        size: 1.5 + Math.random() * 1.2,
        colorIndex: i % 2,
        brightness: 0,
        noiseOffset: Math.random() * 100,
      });
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

    // Simple noise function
    const noise = (x: number, y: number) => {
      return Math.sin(x * 0.5) * Math.cos(y * 0.7) * 0.5 + 
             Math.sin(x * 0.3 + y * 0.4) * 0.3 +
             Math.cos(x * 0.8 - y * 0.2) * 0.2;
    };

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

        // Slow expanding ripple wave (radial)
        const ripplePhase = (timeRef.current * 0.08) % 1; // Very slow
        
        // Slow rotating angular wave
        const angularWave = timeRef.current * 0.03; // Very slow rotation

        dotsRef.current.forEach((dot) => {
          // Slight position wobble
          const wobbleX = Math.sin(timeRef.current * 0.1 + dot.noiseOffset) * 3;
          const wobbleY = Math.cos(timeRef.current * 0.08 + dot.noiseOffset * 1.3) * 3;
          
          // Calculate position
          const x = centerX + Math.cos(dot.angle) * dot.distance + wobbleX;
          const y = centerY + Math.sin(dot.angle) * dot.distance + wobbleY;
          
          // Normalize distance (0 = inner, 1 = outer)
          const distNorm = (dot.distance - 40) / 260;
          
          // Radial ripple: wave expanding outward
          const radialDist = Math.abs(distNorm - ripplePhase);
          const radialWrap = Math.min(radialDist, 1 - radialDist);
          const radialInfluence = Math.max(0, 1 - radialWrap / 0.2);
          
          // Angular wave: sweeping around
          const angleDist = Math.abs(Math.sin(dot.angle - angularWave));
          const angularInfluence = angleDist > 0.7 ? (angleDist - 0.7) / 0.3 : 0;
          
          // Noise field for organic variation
          const noiseVal = noise(
            dot.angle * 2 + timeRef.current * 0.05,
            distNorm * 3 + timeRef.current * 0.03 + dot.noiseOffset
          );
          const noiseInfluence = (noiseVal + 1) * 0.5; // 0 to 1
          
          // Combined visibility: need both radial AND angular OR noise to be high
          const combined = Math.max(
            radialInfluence * angularInfluence,
            radialInfluence * noiseInfluence * 0.6
          );
          
          // Target brightness
          const targetBrightness = 0.1 + combined * 0.7;
          
          // Slow smooth transition
          const fadeSpeed = combined > 0.3 ? 0.04 : 0.015;
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
