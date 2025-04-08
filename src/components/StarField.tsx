import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  starCount?: number;
  depth?: number;
  speed?: number;
  backgroundColor?: string;
}

const StarField: React.FC<StarFieldProps> = ({
  starCount = 200,
  depth = 3,
  speed = 0.5,
  backgroundColor = 'transparent'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸为窗口大小
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // 创建星星
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() * 1.5 + 0.5;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: radius,
        color: Math.random() > 0.2 ? 'rgba(255, 255, 255, 1)' : 'rgba(210, 230, 255, 1)',
        depth: Math.random() * depth,
        opacity: Math.random() * 0.8 + 0.2,
        speed: (Math.random() * 0.5 + 0.1) * speed,
        directionX: (Math.random() - 0.5) * 0.2,
        directionY: (Math.random() - 0.5) * 0.1
      });
    }
    
    // 简化的绘制函数
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // 绘制星星
      stars.forEach(star => {
        // 移动星星
        star.x += star.directionX;
        star.y += star.directionY;
        
        // 如果超出边界，从另一侧重新进入
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;
        
        // 绘制星星
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        // 设置颜色和透明度
        const flickerOpacity = star.opacity * (0.7 + 0.3 * Math.sin(Date.now() * 0.001 * star.speed));
        ctx.fillStyle = star.color.replace('1)', `${flickerOpacity})`);
        ctx.fill();
        
        // 为亮星星添加光晕
        if (star.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          const glow = ctx.createRadialGradient(
            star.x, star.y, star.radius * 0.5,
            star.x, star.y, star.radius * 3
          );
          glow.addColorStop(0, star.color.replace('1)', '0.3)'));
          glow.addColorStop(1, star.color.replace('1)', '0)'));
          ctx.fillStyle = glow;
          ctx.fill();
        }
      });
      
      requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [starCount, depth, speed, backgroundColor]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default StarField;
