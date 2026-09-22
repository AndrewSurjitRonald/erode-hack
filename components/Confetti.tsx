"use client";

import { useEffect, useRef } from "react";

export function triggerConfetti() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("trigger-confetti"));
}

export function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotSpeed: number;
      life: number;
    }[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

    function explode() {
      if (!canvas) return;
      const count = 70;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height * 0.45,
          vx: (Math.random() - 0.5) * 16,
          vy: -Math.random() * 14 - 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 6,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 8,
          life: 1,
        });
      }
    }

    function handleTrigger() {
      explode();
    }
    window.addEventListener("trigger-confetti", handleTrigger);

    function loop() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.rotation += p.rotSpeed;
        p.life -= 0.012;

        if (p.life <= 0 || p.y > canvas.height) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("trigger-confetti", handleTrigger);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
