import React, { useEffect, useState } from 'react';

interface GeometricShape {
  id: number;
  type: 'triangle' | 'square' | 'circle' | 'hexagon' | 'line';
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  opacity: number;
  speed: number;
  direction: number;
  rotationSpeed: number;
}

interface GeometricShapesProps {
  count?: number;
}

const GeometricShapes: React.FC<GeometricShapesProps> = ({ count = 15 }) => {
  const [shapes, setShapes] = useState<GeometricShape[]>([]);
  
  // 初始化几何形状
  useEffect(() => {
    const types: Array<'triangle' | 'square' | 'circle' | 'hexagon' | 'line'> = [
      'triangle', 'square', 'circle', 'hexagon', 'line'
    ];
    
    const colors = [
      'rgba(64, 156, 255, 0.5)', // 蓝色
      'rgba(128, 90, 213, 0.5)', // 紫色
      'rgba(0, 204, 255, 0.5)',  // 青色
      'rgba(255, 89, 210, 0.5)'  // 粉色
    ];
    
    const initialShapes: GeometricShape[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * 100, // 位置以百分比表示
      y: Math.random() * 100,
      size: Math.random() * 40 + 10, // 10-50px
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.25 + 0.1, // 0.1-0.35
      speed: Math.random() * 0.5 + 0.1, // 移动速度
      direction: Math.random() * 360, // 移动方向（角度）
      rotationSpeed: (Math.random() - 0.5) * 0.5 // 旋转速度
    }));
    
    setShapes(initialShapes);
  }, [count]);
  
  // 移动几何形状
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setShapes(prevShapes => 
        prevShapes.map(shape => {
          // 计算新位置
          const radians = shape.direction * (Math.PI / 180);
          let newX = shape.x + Math.cos(radians) * shape.speed;
          let newY = shape.y + Math.sin(radians) * shape.speed;
          
          // 边界检查，如果超出边界则改变方向
          let newDirection = shape.direction;
          if (newX < 0 || newX > 100) {
            newDirection = 180 - newDirection;
            newX = Math.max(0, Math.min(100, newX));
          }
          if (newY < 0 || newY > 100) {
            newDirection = 360 - newDirection;
            newY = Math.max(0, Math.min(100, newY));
          }
          
          // 更新旋转
          let newRotation = (shape.rotation + shape.rotationSpeed) % 360;
          if (newRotation < 0) newRotation += 360;
          
          return {
            ...shape,
            x: newX,
            y: newY,
            rotation: newRotation,
            direction: newDirection
          };
        })
      );
    }, 100);
    
    return () => clearInterval(moveInterval);
  }, []);
  
  const renderShape = (shape: GeometricShape) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      opacity: shape.opacity,
      transform: `rotate(${shape.rotation}deg)`,
      transition: 'transform 0.5s ease-out, left 0.5s ease-out, top 0.5s ease-out',
      borderColor: shape.color
    };
    
    switch (shape.type) {
      case 'triangle':
        return (
          <div 
            key={shape.id} 
            style={{
              ...style,
              width: 0,
              height: 0,
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid ${shape.color}`,
              backgroundColor: 'transparent'
            }}
            className="geometric-shape"
          />
        );
      case 'square':
        return (
          <div 
            key={shape.id} 
            style={{
              ...style,
              border: `1px solid ${shape.color}`,
              backgroundColor: 'transparent'
            }}
            className="geometric-shape"
          />
        );
      case 'circle':
        return (
          <div 
            key={shape.id} 
            style={{
              ...style,
              borderRadius: '50%',
              border: `1px solid ${shape.color}`,
              backgroundColor: 'transparent'
            }}
            className="geometric-shape"
          />
        );
      case 'hexagon':
        return (
          <div 
            key={shape.id} 
            style={{
              ...style,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              border: `1px solid ${shape.color}`,
              backgroundColor: 'transparent'
            }}
            className="geometric-shape"
          />
        );
      case 'line':
        return (
          <div 
            key={shape.id} 
            style={{
              ...style,
              height: '1px',
              width: `${shape.size * 2}px`,
              backgroundColor: shape.color
            }}
            className="geometric-shape"
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="geometric-shapes">
      {shapes.map(renderShape)}
    </div>
  );
};

export default GeometricShapes; 