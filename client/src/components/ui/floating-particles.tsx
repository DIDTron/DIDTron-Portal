import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  icon: string;
  color: string;
}

const ICONS = [
  "📞", "📱", "☎️", "📡", "🌐", "💬", "📶", "🔊", "🎙️", "📲",
  "⚡", "🔗", "💻", "🖥️", "⌨️", "🔒", "✨", "🚀", "💎", "🌟"
];

const COLORS = [
  "rgba(37, 99, 235, 0.6)",   // Primary blue
  "rgba(59, 130, 246, 0.5)",  // Lighter blue
  "rgba(99, 102, 241, 0.5)",  // Indigo
  "rgba(139, 92, 246, 0.4)",  // Purple
  "rgba(34, 197, 94, 0.4)",   // Green
];

export function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    const particleCount = 40;

    const initialParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 16 + 12,
      opacity: Math.random() * 0.4 + 0.2,
      icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    setParticles(initialParticles);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    container.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      setParticles((prev) =>
        prev.map((particle) => {
          const rect = container.getBoundingClientRect();
          const mouse = mouseRef.current;

          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let newVx = particle.vx;
          let newVy = particle.vy;

          if (distance < 150 && distance > 0) {
            const force = (150 - distance) / 150;
            const angle = Math.atan2(dy, dx);
            newVx += Math.cos(angle) * force * 0.3;
            newVy += Math.sin(angle) * force * 0.3;
          }

          newVx *= 0.98;
          newVy *= 0.98;

          newVx += (Math.random() - 0.5) * 0.1;
          newVy += (Math.random() - 0.5) * 0.1;

          let newX = particle.x + newVx;
          let newY = particle.y + newVy;

          if (newX < 0 || newX > rect.width) newVx *= -1;
          if (newY < 0 || newY > rect.height) newVy *= -1;

          newX = Math.max(0, Math.min(rect.width, newX));
          newY = Math.max(0, Math.min(rect.height, newY));

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-auto"
      style={{ zIndex: 0 }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute transition-transform duration-100 select-none"
          style={{
            left: particle.x,
            top: particle.y,
            fontSize: particle.size,
            opacity: particle.opacity,
            transform: "translate(-50%, -50%)",
            filter: "blur(0.5px)",
            textShadow: `0 0 10px ${particle.color}`,
          }}
        >
          {particle.icon}
        </div>
      ))}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.3) 100%)",
        }}
      />
    </div>
  );
}
