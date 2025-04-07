import React from 'react';
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
  
  const colorClasses = {
    blue: 'from-blue-500/70 to-blue-600/90 border-blue-400/80',
    purple: 'from-purple-500/70 to-purple-600/90 border-purple-400/80',
    cyan: 'from-cyan-500/70 to-cyan-600/90 border-cyan-400/80',
    pink: 'from-pink-500/70 to-pink-600/90 border-pink-400/80',
  };

  const glowClasses = {
    blue: '',
    purple: '',
    cyan: '',
    pink: '',
  };

  // Extract surname if available
  const surname = senderName ? senderName.split(' ').pop() || senderName : '';

  return (
    <div
      id={id}
      className={cn(
        'relative rounded-full flex items-center justify-center cursor-pointer',
        'bg-gradient-to-r border-2 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        'before:absolute before:inset-0 before:rounded-full before:bg-opacity-40 before:animate-pulse',
        'before:bg-gradient-to-r',
        `before:${colorClasses[color].split(' ')[0]} before:to-transparent`,
        'before:blur-md before:animate-pulse',
        sizeClasses[size],
        colorClasses[color],
        glowClasses[color],
        isFloating && 'floating',
        'orb',
        className
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-full rotate-slow bg-transparent border-t-2 border-white/30" />
      <div className="absolute inset-2 rounded-full rotate-slow-reverse bg-transparent border-b-2 border-white/20" />
      <div className="absolute inset-4 rounded-full rotate-slow bg-transparent border-t border-white/10" />
      
      {surname && (
        <div className="absolute w-full h-full flex items-center justify-center px-2 text-center">
          <p className="text-white text-xs sm:text-sm font-medium truncate glow-text">
            {surname}
          </p>
        </div>
      )}

      {/* 添加轨道粒子 */}
      <div className="orb-particles">
        <div className="orb-particle" style={{ color: color }}></div>
        <div className="orb-particle" style={{ color: color }}></div>
        <div className="orb-particle" style={{ color: color }}></div>
      </div>
    </div>
  );
};

export default EnergyOrb;
