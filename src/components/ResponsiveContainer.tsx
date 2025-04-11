import React, { useEffect, useState, useRef } from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  // 处理窗口大小变化的函数
  const handleResize = () => {
    if (!containerRef.current) return;
    
    // 获取实际视口高度（解决移动设备上vh单位不准确的问题）
    const windowHeight = window.innerHeight;
    setViewportHeight(windowHeight);
    
    // 根据设计尺寸计算缩放比例
    // 假设基准设计宽度为1440px
    const designWidth = 1440;
    const currentWidth = window.innerWidth;
    const newScale = Math.min(1, currentWidth / designWidth);
    
    setScale(newScale);
  };
  
  // 在组件挂载和窗口大小变化时调整缩放
  useEffect(() => {
    // 初始化
    handleResize();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
    
    // 特别处理移动设备方向变化
    window.addEventListener('orientationchange', handleResize);
    
    // 修复iOS上视口高度变化问题
    const detectViewportChange = () => {
      // 防止iOS键盘弹出时的视口变化问题
      if (Math.abs(window.innerHeight - viewportHeight) > 150) {
        setViewportHeight(window.innerHeight);
      }
    };
    
    window.addEventListener('scroll', detectViewportChange);
    
    // 清理事件监听
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('scroll', detectViewportChange);
    };
  }, [viewportHeight]);
  
  return (
    <div 
      ref={containerRef} 
      className={`responsive-container ${className}`}
      style={{
        width: '100%',
        height: `${viewportHeight}px`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        className="responsive-content"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ResponsiveContainer; 