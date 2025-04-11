import React, { useEffect, useState, useRef } from 'react';
import { Position } from '@/types';

interface ElectricPathProps {
  startPosition: Position;
  endPosition: Position;
  color: string;
  animate?: boolean;
  duration?: number;
  thickness?: number;
  segments?: number;
  variance?: number;
  flashEffect?: boolean;
}

const ElectricPath: React.FC<ElectricPathProps> = ({
  startPosition,
  endPosition,
  color = 'blue',
  animate = true,
  duration = 500,
  thickness = 1.5,
  segments = 5,
  variance = 0.25,
  flashEffect = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [opacity, setOpacity] = useState(1);
  const [pathD, setPathD] = useState('');
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 根据颜色返回对应的CSS颜色值
  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'rgba(56, 189, 248, VAR)',
      'purple': 'rgba(168, 85, 247, VAR)',
      'cyan': 'rgba(34, 211, 238, VAR)',
      'pink': 'rgba(244, 114, 182, VAR)',
      'orange': 'rgba(251, 146, 60, VAR)',
      'green': 'rgba(52, 211, 153, VAR)',
      'peach': 'rgba(251, 113, 133, VAR)',
      'mint': 'rgba(4, 206, 206, VAR)',
    };
    return colorMap[color] || 'rgba(56, 189, 248, VAR)';
  };
  
  // 根据当前视口尺寸调整路径
  useEffect(() => {
    const generateLightningPath = () => {
      // 使用相对百分比位置计算实际坐标
      const start = {
        x: (startPosition.x / dimensions.width) * window.innerWidth,
        y: (startPosition.y / dimensions.height) * window.innerHeight
      };
      
      const end = {
        x: (endPosition.x / dimensions.width) * window.innerWidth,
        y: (endPosition.y / dimensions.height) * window.innerHeight
      };
      
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 路径点计算代码保持不变
      const points = [];
      points.push({ x: start.x, y: start.y });
      
      for (let i = 1; i < segments; i++) {
        const ratio = i / segments;
        const x = start.x + dx * ratio;
        const y = start.y + dy * ratio;
        
        // 添加随机偏移
        const offset = Math.random() * distance * variance;
        const angle = Math.random() * Math.PI * 2;
        points.push({
          x: x + Math.cos(angle) * offset,
          y: y + Math.sin(angle) * offset
        });
      }
      
      points.push({ x: end.x, y: end.y });
      
      // 创建SVG路径
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
      
      setPathD(d);
    };
    
    generateLightningPath();
    
    if (flashEffect) {
      const flashInterval = setInterval(() => {
        setOpacity(Math.random() * 0.5 + 0.5);
      }, 100);
      
      return () => clearInterval(flashInterval);
    }
  }, [startPosition, endPosition, segments, variance, flashEffect, dimensions]);
  
  // 动画结束时删除路径
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setOpacity(0);
      }, duration - 100); // 留出淡出时间
      
      return () => clearTimeout(timer);
    }
  }, [animate, duration]);
  
  // 获取发光颜色
  const glowColor = getColorValue(color).replace('VAR', '0.6');
  const strokeColor = getColorValue(color).replace('VAR', `${opacity}`);
  
  return (
    <svg 
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none electric-path-svg"
      style={{ 
        transition: `opacity ${animate ? 100 : 0}ms ease-out`,
        zIndex: 5  // 降低z-index，默认是10
      }}
    >
      <defs>
        <filter id={`glow-${color}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* 发光效果底层 */}
      <path 
        d={pathD}
        stroke={glowColor}
        strokeWidth={thickness * 3}
        fill="none"
        strokeLinecap="round"
        filter={`url(#glow-${color})`}
        style={{ opacity: opacity * 0.7 }}
      />
      
      {/* 主体电光线 */}
      <path 
        d={pathD}
        stroke={strokeColor}
        strokeWidth={thickness}
        fill="none"
        strokeLinecap="round"
        style={{ opacity }}
      />
    </svg>
  );
};

export default ElectricPath;
