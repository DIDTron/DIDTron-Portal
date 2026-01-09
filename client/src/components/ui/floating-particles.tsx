import { useEffect, useRef, useState } from "react";

interface Arch {
  baseRadius: number;
  phase: number;
  pulseSpeed: number;
  fadePhase: number;
  fadeSpeed: number;
  waveOffset: number;
}

interface Particle {
  archIndex: number;
  angle: number;
  size: number;
  color: string;
  angleSpeed: number;
  radiusOffset: number;
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
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

    // Colors
    const colors = isDark 
      ? ["46, 75, 255", "248, 250, 252"]    // phosphoric royal blue + pale white
      : ["37, 99, 235", "30, 41, 59"];       // blue accent + pale black

    // Create 10 arches with varying properties
    archesRef.current = Array.from({ length: 10 }, (_, i) => ({
      baseRadius: 40 + i * 25,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.3 + Math.random() * 0.4,
      fadePhase: Math.random() * Math.PI * 2,
      fadeSpeed: 0.2 + Math.random() * 0.3,
      waveOffset: Math.random() * Math.PI * 2,
    }));

    // Create particles scattered across arches - fewer particles, more spread
    const particlesPerArch = 4;
    particlesRef.current = [];
    
    archesRef.current.forEach((_, archIndex) => {
      for (let j = 0; j < particlesPerArch; j++) {
        particlesRef.current.push({
          archIndex,
          angle: (j / particlesPerArch) * Math.PI + Math.random() * 0.5 - 0.25,
          size: Math.random() * 2.5 + 2,
          color: colors[(archIndex + j) % 2],
          angleSpeed: (Math.random() - 0.5) * 0.01,
          radiusOffset: (Math.random() - 0.5) * 15,
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

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      timeRef.current += 0.016;

      const timeSinceMove = Date.now() - lastMoveRef.current;
      const isMoving = timeSinceMove < 200;

      // Fade based on cursor movement
      if (isMoving) {
        opacityRef.current = Math.min(1, opacityRef.current + 0.06);
      } else {
        opacityRef.current = Math.max(0, opacityRef.current - 0.01);
      }

      // Smooth cursor following
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.08;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.08;

      if (opacityRef.current > 0.01) {
        const centerX = smoothMouseRef.current.x;
        const centerY = smoothMouseRef.current.y;

        particlesRef.current.forEach((particle) => {
          const arch = archesRef.current[particle.archIndex];
          
          // Pulsing radius - each arch pulses at different speed/phase
          const pulseScale = 1 + Math.sin(timeRef.current * arch.pulseSpeed + arch.phase) * 0.3;
          const currentRadius = arch.baseRadius * pulseScale + particle.radiusOffset;
          
          // Wave motion on the arch
          const waveY = Math.sin(timeRef.current * 2 + arch.waveOffset + particle.angle * 2) * 8;
          
          // Fading opacity per arch - creates depth illusion
          const archOpacity = 0.4 + Math.sin(timeRef.current * arch.fadeSpeed + arch.fadePhase) * 0.35;
          
          // Move particle along its arch
          particle.angle += particle.angleSpeed;
          if (particle.angle > Math.PI) particle.angle -= Math.PI;
          if (particle.angle < 0) particle.angle += Math.PI;
          
          // Calculate position (arch is upper half of circle)
          const x = centerX + Math.cos(particle.angle) * currentRadius;
          const y = centerY - Math.abs(Math.sin(particle.angle)) * currentRadius + waveY;
          
          // Size variation based on arch pulse
          const sizeScale = 0.7 + pulseScale * 0.4;
          const finalSize = particle.size * sizeScale;

          // Render
          ctx.save();
          ctx.globalAlpha = opacityRef.current * archOpacity * (isDark ? 0.8 : 0.65);
          ctx.fillStyle = `rgba(${particle.color}, 1)`;
          ctx.beginPath();
          ctx.arc(x, y, finalSize, 0, Math.PI * 2);
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
