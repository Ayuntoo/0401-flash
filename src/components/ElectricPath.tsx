import React, { useEffect, useState } from 'react';
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
  const [opacity, setOpacity] = useState(1);
  const [pathD, setPathD] = useState('');
  
  // 根据颜色返回对应的CSS颜色值
  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'rgba(56, 189, 248, VAR)',
      'purple': 'rgba(168, 85, 247, VAR)',
      'cyan': 'rgba(34, 211, 238, VAR)',
      'pink': 'rgba(244, 114, 182, VAR)',
      'orange': 'rgba(251, 146, 60, VAR)',
      'green': 'rgba(52, 211, 153, VAR)',
    };
    return colorMap[color] || 'rgba(56, 189, 248, VAR)';
  };
  
  // 生成锯齿状闪电路径
  useEffect(() => {
    const generateLightningPath = () => {
      const dx = endPosition.x - startPosition.x;
      const dy = endPosition.y - startPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 创建路径点
      const points = [];
      points.push({ x: startPosition.x, y: startPosition.y });
      
      // 创建中间点 - 更多的分段和更大的变化
      for (let i = 1; i < segments; i++) {
        const ratio = i / segments;
        const x = startPosition.x + dx * ratio;
        const y = startPosition.y + dy * ratio;
        
        // 添加随机偏移 - 更大的偏移量创造更锯齿的效果
        const offset = Math.random() * distance * variance;
        const angle = Math.random() * Math.PI * 2;
        
        points.push({
          x: x + Math.cos(angle) * offset,
          y: y + Math.sin(angle) * offset
        });
      }
      
      points.push({ x: endPosition.x, y: endPosition.y });
      
      // 构建SVG路径
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
      
      setPathD(d);
    };
    
    generateLightningPath();
    
    // 如果启用了闪烁效果，添加随机闪烁
    if (flashEffect) {
      const flashInterval = setInterval(() => {
        setOpacity(Math.random() * 0.5 + 0.5); // 随机闪烁效果
      }, 100);
      
      return () => clearInterval(flashInterval);
    }
  }, [startPosition, endPosition, segments, variance, flashEffect]);
  
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
      className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
      style={{ transition: `opacity ${animate ? 100 : 0}ms ease-out` }}
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
