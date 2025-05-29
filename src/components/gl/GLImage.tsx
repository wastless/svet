"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// Интерфейс для GLImage компонента
export interface GLImageProps {
  imageUrl: string;
  imageCover?: boolean;
  randomOffset?: number;
  alt?: string;
}

// WebGL shader для hover-эффекта
const vertexShader = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vUv = uv;
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform vec2 uImageRatio;
  
  vec2 imageuv(vec2 uv, vec2 size, vec2 resolution) {
    vec2 ratio = vec2(
      min((resolution.x/resolution.y)/(size.x/size.y), 1.0),
      min((resolution.y/resolution.x)/(size.y/size.x), 1.0)
    );
    return vec2(
      uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
  }

  void main() {
    vec2 uv = vUv;
    
    // Применяем эффект hover
    float HOVER_SCALE = 0.08;
    uv -= 0.5;
    float dist = length(uv);
    float scaleFactor = 1.0 - uHover * HOVER_SCALE * smoothstep(0.0, 1.0, dist * 1.4);
    uv *= scaleFactor;
    uv *= 1.0 - uHover * 0.02;
    uv += 0.5;
    
    // Корректируем uv для правильного соотношения сторон
    uv = imageuv(uv, uImageRatio, vec2(1.0));
    
    // Исправляем перевернутую ось Y
    uv.y = 1.0 - uv.y;
    
    // Повышаем яркость при наведении
    vec4 color = texture2D(uTexture, uv);
    color.rgb = mix(color.rgb, color.rgb * 1.2, uHover);
    
    gl_FragColor = color;
  }
`;

// Компонент WebGL для изображения с hover-эффектом
export function GLImage({ 
  imageUrl, 
  imageCover = false,
  randomOffset = 0,
  alt = "Image"
}: GLImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const contextRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const hoverValueRef = useRef<number>(0);
  const targetHoverRef = useRef<number>(0);
  const imageRef = useRef<{ width: number; height: number } | null>(null);
  
  // Инициализация WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) return;
    
    contextRef.current = gl;

    // Создаем шейдерную программу
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;
    
    programRef.current = program;
    
    // Создаем геометрию (полноэкранный квад)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // UV координаты
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    
    const uvLocation = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Создаем текстуру
    const texture = gl.createTexture();
    textureRef.current = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Временное заполнение текстуры (1x1 пиксель)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );
    
    // Загружаем изображение
    const image = new window.Image();
    image.onload = () => {
      if (!gl || !texture) return;
      
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      // Устанавливаем параметры текстуры
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
      // Устанавливаем соотношение сторон
      const uImageRatioLocation = gl.getUniformLocation(program, "uImageRatio");
      const ratio = [image.width, image.height];
      gl.uniform2fv(uImageRatioLocation, ratio);
      
      // Сохраняем размеры изображения
      imageRef.current = { width: image.width, height: image.height };
      
      // Установка размеров контейнера на основе пропорций изображения
      const imageRatio = image.height / image.width;
      container.style.paddingBottom = `${imageRatio * 100}%`;
      
      // Устанавливаем размеры canvas
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      // Первоначальная отрисовка
      render();
    };
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    
    // Функция рендеринга
    const render = () => {
      if (!contextRef.current || !programRef.current || !canvasRef.current) return;
      const gl = contextRef.current;
      
      // Плавно анимируем значение hover
      hoverValueRef.current += (targetHoverRef.current - hoverValueRef.current) * 0.05;
      
      gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.useProgram(programRef.current);
      
      // Устанавливаем значение hover uniform
      const uHoverLocation = gl.getUniformLocation(programRef.current, "uHover");
      gl.uniform1f(uHoverLocation, hoverValueRef.current);
      
      // Привязываем текстуру
      gl.activeTexture(gl.TEXTURE0);
      if (textureRef.current) {
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        const uTextureLocation = gl.getUniformLocation(programRef.current, "uTexture");
        gl.uniform1i(uTextureLocation, 0);
      }
      
      // Отрисовываем
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // Продолжаем анимацию, пока hover не достигнет целевого значения
      if (Math.abs(hoverValueRef.current - targetHoverRef.current) > 0.001) {
        requestRef.current = requestAnimationFrame(render);
      }
    };
    
    // Создание шейдерной программы
    function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      if (!vertexShader) return null;
      
      gl.shaderSource(vertexShader, vertexSource);
      gl.compileShader(vertexShader);
      
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fragmentShader) return null;
      
      gl.shaderSource(fragmentShader, fragmentSource);
      gl.compileShader(fragmentShader);
      
      const program = gl.createProgram();
      if (!program) return null;
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      return program;
    }
    
    // Обработчик изменения размера окна
    const handleResize = () => {
      if (canvas && container && gl && imageRef.current) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        render();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [imageUrl]);
  
  // Обработчики наведения
  const handleMouseEnter = () => {
    targetHoverRef.current = 1.0;
    if (contextRef.current && programRef.current) {
      requestRef.current = requestAnimationFrame(function animate() {
        if (!contextRef.current || !programRef.current) return;
        
        hoverValueRef.current += (targetHoverRef.current - hoverValueRef.current) * 0.05;
        
        const gl = contextRef.current;
        gl.useProgram(programRef.current);
        
        const uHoverLocation = gl.getUniformLocation(programRef.current, "uHover");
        gl.uniform1f(uHoverLocation, hoverValueRef.current);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        if (Math.abs(hoverValueRef.current - targetHoverRef.current) > 0.001) {
          requestRef.current = requestAnimationFrame(animate);
        }
      });
    }
  };
  
  const handleMouseLeave = () => {
    targetHoverRef.current = 0.0;
    if (contextRef.current && programRef.current) {
      requestRef.current = requestAnimationFrame(function animate() {
        if (!contextRef.current || !programRef.current) return;
        
        hoverValueRef.current += (targetHoverRef.current - hoverValueRef.current) * 0.05;
        
        const gl = contextRef.current;
        gl.useProgram(programRef.current);
        
        const uHoverLocation = gl.getUniformLocation(programRef.current, "uHover");
        gl.uniform1f(uHoverLocation, hoverValueRef.current);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        if (Math.abs(hoverValueRef.current - targetHoverRef.current) > 0.001) {
          requestRef.current = requestAnimationFrame(animate);
        }
      });
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full relative"
      style={{ position: 'relative', overflow: 'hidden' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      {/* Скрытое изображение для предзагрузки */}
      <div className="hidden">
        <Image
          src={imageUrl}
          alt={alt}
          width={1}
          height={1}
        />
      </div>
    </div>
  );
} 