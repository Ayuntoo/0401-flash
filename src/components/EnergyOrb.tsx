import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface EnergyOrbProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'cyan' | 'pink';
  className?: string;
  onClick?: () => void;
  content?: string;
  senderName?: string;
  isFloating?: boolean;
  id?: string;
}

const EnergyOrb: React.FC<EnergyOrbProps> = ({
  size = 'md',
  color = 'blue',
  className,
  onClick,
  content,
  senderName,
  isFloating = true,
  id
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  // 全新的多巴胺风格色彩方案
  const colorClasses = {
    blue: 'from-blue-500/90 via-indigo-400/80 to-blue-600/90 border-blue-300/50',
    purple: 'from-violet-500/90 via-purple-400/80 to-fuchsia-600/90 border-purple-300/50',
    cyan: 'from-cyan-400/90 via-teal-300/80 to-sky-500/90 border-cyan-200/50',
    pink: 'from-pink-400/90 via-rose-300/80 to-pink-500/90 border-pink-300/50',
  };

  // 简单缩短发送者名称
  const displayName = senderName ? senderName.charAt(0) : '';

  // 生成随机粒子
  const particles = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      size: Math.random() * 2 + 1,
      delay: i * 0.5,
      duration: Math.random() * 3 + 3
    }));
  }, []);

  return (
    <div
      id={id}
      className={cn(
        'relative rounded-full flex items-center justify-center cursor-pointer',
        'bg-gradient-to-tl border backdrop-blur-md',
        'transition-all duration-300 ease-in-out orb',
        'hover:scale-105',
        sizeClasses[size],
        colorClasses[color],
        isFloating && 'floating',
        className
      )}
      onClick={onClick}
      style={{ 
        boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.2)',
      }}
    >
      {/* 内部光晕效果 */}
      <div className="absolute inset-[10%] rounded-full bg-white/30 blur-md" />
      <div className="absolute inset-[20%] rounded-full bg-white/20 blur-sm" />
      
      {/* 内部旋转环效果 */}
      <div className="absolute inset-0 rounded-full rotate-slow bg-transparent border border-white/40" />
      <div className="absolute inset-2 rounded-full rotate-slow-reverse bg-transparent border border-white/30" />
      <div className="absolute inset-4 rounded-full rotate-slow bg-transparent border-b border-white/20" />
      
      {/* 悬浮粒子效果 */}
      <div className="orb-particles">
        {particles.map((particle, index) => (
          <div 
            key={index}
            className="orb-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>
      
      {/* 显示名称 */}
      {displayName && (
        <div className="flex items-center justify-center z-10">
          <p className="text-white text-xs sm:text-sm font-bold drop-shadow-lg">
            {displayName}
          </p>
        </div>
      )}
      
      {/* 脉冲边缘效果 */}
      <div className="absolute inset-0 rounded-full pulse-ring" />
    </div>
  );
};

export default EnergyOrb;
