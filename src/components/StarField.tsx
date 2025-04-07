
import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  starsCount?: number;
}

const StarField: React.FC<StarFieldProps> = ({ starsCount = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars && drawStars(); // Only call drawStars if stars exists
    };

    window.addEventListener('resize', resize);
    
    // Create stars
    const stars: { x: number; y: number; radius: number; opacity: number; speed: number }[] = [];
    
    for (let i = 0; i < starsCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05 + 0.02
      });
    }

    function drawStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
    }

    function animateStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        // Twinkle effect
        star.opacity = Math.max(0.2, Math.min(1, star.opacity + (Math.random() - 0.5) * 0.05));
        
        // Slow movement
        star.x += star.speed;
        
        // Reset if star moves off screen
        if (star.x > canvas.width) {
          star.x = 0;
        }
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animateStars);
    }

    // Initialize canvas size and draw stars
    resize();
    // Start animation
    animateStars();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [starsCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default StarField;
