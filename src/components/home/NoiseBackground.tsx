import React from "react";

interface NoiseBackgroundProps {
  opacity?: number; // Прозрачность от 0 до 100
  className?: string;
}

export function NoiseBackground({
  opacity = 10,
  className = "",
}: NoiseBackgroundProps) {
  return (
    <div 
      className={`pointer-events-none fixed inset-0 z-10 ${className}`}
      style={{
        backgroundImage: 'url("/noise.gif")',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        opacity: opacity / 100,
        width: '100%',
        height: '100%'
      }}
    />
  );
} 