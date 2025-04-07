
import React, { useState, useEffect } from 'react';

interface ElectricPathProps {
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  color?: string;
  thickness?: number;
  animate?: boolean;
  duration?: number;
  onAnimationEnd?: () => void;
}

const ElectricPath: React.FC<ElectricPathProps> = ({
  startPosition,
  endPosition,
  color = "#00e5ff",
  thickness = 2,
  animate = true,
  duration = 800, // Further reduced from 1000ms to 800ms
  onAnimationEnd
}) => {
  const [path, setPath] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(animate);

  // Generate a lightning-like path between two points
  useEffect(() => {
    const generateElectricPath = () => {
      const dx = endPosition.x - startPosition.x;
      const dy = endPosition.y - startPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Number of segments based on distance - increased for more zigzags
      const segments = Math.max(7, Math.floor(distance / 20));
      
      // Start point
      let pathString = `M${startPosition.x},${startPosition.y} `;
      
      // Generate zigzag points
      for (let i = 1; i < segments; i++) {
        const ratio = i / segments;
        
        // Base point on straight line
        const baseX = startPosition.x + dx * ratio;
        const baseY = startPosition.y + dy * ratio;
        
        // Random offset perpendicular to line
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        // More extreme randomness for lightning effect
        const jitterFactor = Math.sin(ratio * Math.PI) * 35;
        const randomOffset = (Math.random() - 0.5) * jitterFactor;
        
        const pointX = baseX + perpX * randomOffset;
        const pointY = baseY + perpY * randomOffset;
        
        pathString += `L${pointX},${pointY} `;
      }
      
      // End point
      pathString += `L${endPosition.x},${endPosition.y}`;
      
      return pathString;
    };

    setPath(generateElectricPath());

    if (animate) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (onAnimationEnd) onAnimationEnd();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [startPosition, endPosition, animate, duration, onAnimationEnd]);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        className={isAnimating ? "path" : ""}
        style={
          isAnimating
            ? {
                animation: `travel ${duration / 1000}s forwards`,
                filter: "url(#glow)"
              }
            : { opacity: 0 }
        }
      />
    </svg>
  );
};

export default ElectricPath;
