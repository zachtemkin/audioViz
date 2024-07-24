import { useRef, useCallback, useEffect } from "react";

const useParticles = () => {
  const particlesRef = useRef([]);

  const emitParticles = useCallback((x, y) => {
    const particleCount = Math.floor(Math.random() * 6) + 5; // Emit between 5 and 20 particles
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x,
        y,
        radius: 2,
        opacity: 1,
        velocity: {
          // x: (Math.random() - 0.5) * 15,
          x: (Math.random() - 0.5) * 15,
          y: 0,
        },
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  useEffect(() => {
    const updateParticles = () => {
      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          // radius: Math.abs(particle.radius * particle.velocity.x),
          x: particle.x + particle.velocity.x,
          y: particle.y + particle.velocity.y,
          opacity: particle.opacity - 0.02,
        }))
        .filter((particle) => particle.opacity > 0);
    };

    const interval = setInterval(updateParticles, 1000 / 60); // 60 FPS
    return () => clearInterval(interval);
  }, []);

  return { particlesRef, emitParticles };
};

export default useParticles;
