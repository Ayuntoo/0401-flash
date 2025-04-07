import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  count?: number;
  speed?: number;
  size?: number;
  glow?: boolean;
}

const StarField: React.FC<StarFieldProps> = ({ 
  count = 200, 
  speed = 0.05,
  size = 2,
  glow = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 创建高分辨率画布
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    // 设置正确的CSS尺寸
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    
    ctx.scale(dpr, dpr);
    
    // 生成星星
    const stars: {
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: number;
      alpha: number;
      alphaDirection: number;
      twinkle: boolean;
    }[] = [];
    
    // 蓝紫色调的星星
    const colors = ['#8be9fd', '#bd93f9', '#50fa7b', '#f1fa8c', '#f8f8f2'];
    
    for (let i = 0; i < count; i++) {
      const twinkle = Math.random() > 0.3; // 70% 的星星会闪烁
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * size + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: Math.random() * speed,
        alpha: Math.random(),
        alphaDirection: Math.random() > 0.5 ? 0.005 : -0.005,
        twinkle: twinkle
      });
    }
    
    // 渲染函数
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(10, 10, 25, 0.8)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      stars.forEach(star => {
        ctx.beginPath();
        
        // 增强发光效果
        if (glow) {
          ctx.shadowBlur = star.radius * 8;  // 增加辉光范围
          ctx.shadowColor = star.color;
        }
        
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = star.color;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 移动星星
        star.y += star.velocity;
        
        // 如果星星移出屏幕底部，重新在顶部生成
        if (star.y > window.innerHeight) {
          star.y = 0;
          star.x = Math.random() * window.innerWidth;
        }
        
        // 更新增强的闪烁效果
        if (star.twinkle) {
          star.alpha += star.alphaDirection;
          
          if (star.alpha > 1) {
            star.alpha = 1;
            star.alphaDirection *= -1;
            star.alphaDirection *= (Math.random() * 0.5 + 0.5); // 增加随机性
          } else if (star.alpha < 0.2) {
            star.alpha = 0.2;
            star.alphaDirection *= -1;
            star.alphaDirection *= (Math.random() * 0.5 + 0.5); // 增加随机性
          }
        }
      });
      
      requestAnimationFrame(render);
    };
    
    render();
    
    // 处理窗口尺寸变化
    const handleResize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [count, speed, size, glow]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0"
      style={{ background: 'linear-gradient(to bottom, #0a0a1a, #1a1a3a)' }}
    />
  );
};

export default StarField;
