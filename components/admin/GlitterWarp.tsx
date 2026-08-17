"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  z: number;
  size: number;
  twinkle: number;
  hue: number;
};

type GlitterWarpProps = {
  className?: string;
  particleCount?: number;
  speed?: number;
  opacity?: number;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resetParticle(particle: Particle, spread: number) {
  particle.x = (Math.random() - 0.5) * spread;
  particle.y = (Math.random() - 0.5) * spread;
  particle.z = Math.random() * spread + 1;
  particle.size = Math.random() * 1.8 + 0.6;
  particle.twinkle = Math.random() * Math.PI * 2;
  particle.hue = Math.random();
}

export default function GlitterWarp({
  className = "",
  particleCount = 200,
  speed = 0.88,
  opacity = 0.82,
}: GlitterWarpProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = !document.hidden;
    let lastTime = performance.now();

    const buildParticles = () => {
      const spread = Math.max(width, height, 900);
      particlesRef.current = Array.from({ length: particleCount }, () => {
        const particle = { x: 0, y: 0, z: 0, size: 1, twinkle: 0, hue: 0 };
        resetParticle(particle, spread);
        return particle;
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const paint = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.67, 2.4);
      lastTime = time;
      context.clearRect(0, 0, width, height);

      const centerX = width * 0.52;
      const centerY = height * 0.42;
      const spread = Math.max(width, height, 900);
      const travel = (visible && !reducedMotionRef.current ? speed : 0) * 8 * delta;

      const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, spread * 0.58);
      gradient.addColorStop(0, `rgba(134, 85, 239, ${opacity * 0.28})`);
      gradient.addColorStop(0.48, `rgba(54, 207, 160, ${opacity * 0.16})`);
      gradient.addColorStop(1, "rgba(255, 253, 244, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (const particle of particlesRef.current) {
        particle.z -= travel;
        particle.twinkle += 0.05 * delta;
        if (particle.z <= 1) resetParticle(particle, spread);

        const scale = 260 / particle.z;
        const x = centerX + particle.x * scale;
        const y = centerY + particle.y * scale;
        if (x < -80 || x > width + 80 || y < -80 || y > height + 80) {
          resetParticle(particle, spread);
          continue;
        }

        const tailScale = Math.min(26, Math.max(4, (spread - particle.z) / 30));
        const sparkle = 0.68 + Math.sin(particle.twinkle) * 0.28;
        const color =
          particle.hue < 0.34
            ? `rgba(255, 189, 36, ${opacity * sparkle})`
            : particle.hue < 0.68
              ? `rgba(134, 85, 239, ${opacity * sparkle})`
              : `rgba(54, 207, 160, ${opacity * sparkle})`;

        context.strokeStyle = color;
        context.lineWidth = particle.size * 1.12;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + (x - centerX) * 0.015 * tailScale, y + (y - centerY) * 0.015 * tailScale);
        context.stroke();

        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, particle.size * 1.05, 0, Math.PI * 2);
        context.fill();
      }

      rafRef.current = requestAnimationFrame(paint);
    };

    reducedMotionRef.current = prefersReducedMotion();
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const onVisibilityChange = () => {
      visible = !document.hidden;
      lastTime = performance.now();
    };
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      reducedMotionRef.current = motionQuery.matches;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener("change", onMotionChange);
    rafRef.current = requestAnimationFrame(paint);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [opacity, particleCount, speed]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`admin-glitter-warp ${className}`} />;
}
