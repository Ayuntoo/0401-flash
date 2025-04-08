import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface EnergyOrbProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'cyan' | 'pink' | 'orange' | 'green' | 'peach' | 'mint';
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
  
  // 多巴胺风格柔和渐变配色方案
  const colorClasses = {
    blue: 'from-blue-300/90 via-indigo-400/80 to-sky-400/90 border-blue-200/50',
    purple: 'from-violet-300/90 via-purple-400/80 to-indigo-400/90 border-purple-200/50',
    cyan: 'from-cyan-300/90 via-sky-400/80 to-teal-400/90 border-cyan-200/50',
    pink: 'from-pink-300/90 via-rose-400/80 to-pink-400/90 border-pink-200/50',
    orange: 'from-amber-200/90 via-orange-300/80 to-rose-300/90 border-amber-200/50',
    green: 'from-emerald-200/90 via-teal-300/80 to-cyan-300/90 border-emerald-200/50',
    peach: 'from-orange-200/90 via-amber-200/80 to-yellow-200/90 border-orange-100/50',
    mint: 'from-teal-200/90 via-emerald-200/80 to-green-300/90 border-teal-100/50',
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
        'bg-gradient-to-br border backdrop-blur-md',
        'transition-all duration-300 ease-in-out orb',
        'hover:scale-105',
        sizeClasses[size],
        colorClasses[color],
        isFloating && 'floating',
        className
      )}
      onClick={onClick}
      style={{ 
        boxShadow: '0 10px 25px rgba(0,0,0,0.2), inset 0 0 40px rgba(255,255,255,0.3)',
      }}
    >
      {/* 高光效果 */}
      <div className="absolute inset-[5%] rounded-full bg-white/40 blur-md transform translate-x-[-10%] translate-y-[-10%]" />
      <div className="absolute inset-[30%] rounded-full bg-white/30 blur-sm transform translate-x-[-15%] translate-y-[-15%]" />
      
      {/* 内部旋转环效果 */}
      <div className="absolute inset-0 rounded-full rotate-slow bg-transparent border border-white/30" />
      <div className="absolute inset-2 rounded-full rotate-slow-reverse bg-transparent border border-white/20" />
      <div className="absolute inset-4 rounded-full rotate-slow bg-transparent border-b border-white/10" />
      
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
