import React from "react";

interface DigitalNoiseProps {
  opacity?: number;
  className?: string;
  speed?: number;
  density?: number;
}

export function DigitalNoise({
  opacity = 20,
  className = "",
  speed = 5,
  density = 20,
}: DigitalNoiseProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initial setup
    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw noise
      const pixelSize = Math.max(1, Math.floor(100 / density));
      const cols = Math.ceil(canvas.width / pixelSize);
      const rows = Math.ceil(canvas.height / pixelSize);
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (Math.random() < 0.1) {
            const value = Math.random() < 0.5 ? 0 : 255;
            ctx.fillStyle = `rgba(${value}, ${value}, ${value}, ${opacity / 100})`;
            ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
          }
        }
      }
      
      // Schedule next frame
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [opacity, speed, density]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-10 ${className}`}
      style={{ opacity: opacity / 100 }}
    />
  );
}

export default DigitalNoise; 