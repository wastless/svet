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
  
  void main() {
    vec2 uv = vUv;
    
    // Применяем эффект hover без искажения пропорций
    float HOVER_SCALE = 0.08;
    uv -= 0.5;
    float dist = length(uv);
    float scaleFactor = 1.0 - uHover * HOVER_SCALE * smoothstep(0.0, 1.0, dist * 1.4);
    uv *= scaleFactor;
    uv += 0.5;
    
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
  const isInitializedRef = useRef<boolean>(false);
  
  // Инициализация WebGL
  useEffect(() => {
    // Если imageUrl пустой, не инициализируем WebGL
    if (!imageUrl || imageUrl.trim() === "") return;
    
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
      if (!gl || !texture || !canvas || !container) return;
      
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      // Устанавливаем параметры текстуры
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
      // Сохраняем размеры изображения
      imageRef.current = { width: image.width, height: image.height };
      
      // Устанавливаем размеры canvas в соответствии с размерами изображения
      const updateCanvasSize = () => {
        const rect = container.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Вместо изменения высоты контейнера, сохраняем оригинальные пропорции изображения
        // для отображения через WebGL
        const aspectRatio = image.height / image.width;
        
        // Применяем полную ширину контейнера
        const containerWidth = rect.width;
        // Не меняем высоту контейнера - пусть изображение отображается в своих пропорциях
        
        // Устанавливаем размеры canvas
        canvas.width = containerWidth * pixelRatio;
        canvas.height = containerWidth * aspectRatio * pixelRatio;
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerWidth * aspectRatio}px`;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      
      updateCanvasSize();
      
      // Устанавливаем соотношение сторон изображения для шейдера
      gl.useProgram(program);
      const uImageRatioLocation = gl.getUniformLocation(program, "uImageRatio");
      gl.uniform2f(uImageRatioLocation, image.width, image.height);
      
      isInitializedRef.current = true;
      
      // Первоначальная отрисовка
      render();
      
      // Добавляем обработчик изменения размера окна
      const handleResize = () => {
        if (canvas && container && gl && isInitializedRef.current) {
          updateCanvasSize();
          render();
        }
      };
      
      // Используем обычный resize listener вместо ResizeObserver
      window.addEventListener('resize', handleResize);
      
      // Очистка при размонтировании будет выполнена в основном useEffect
    };
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    
    // Функция рендеринга
    const render = () => {
      if (!contextRef.current || !programRef.current || !canvasRef.current || !isInitializedRef.current) return;
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
        
        // Update image ratio uniform if needed
        if (imageRef.current) {
          const uImageRatioLocation = gl.getUniformLocation(programRef.current, "uImageRatio");
          gl.uniform2f(uImageRatioLocation, imageRef.current.width, imageRef.current.height);
        }
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
    
    // Обработчик изменения размера окна - УПРОЩЕН
    const handleResize = () => {
      if (canvas && container && gl && isInitializedRef.current) {
        const rect = container.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * pixelRatio;
        canvas.height = rect.height * pixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        render();
      }
    };
    
    // Используем обычный resize listener вместо ResizeObserver
    window.addEventListener('resize', handleResize);
    
    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [imageUrl, imageCover]);
  
  // Если imageUrl пустой, не рендерим ничего
  if (!imageUrl || imageUrl.trim() === "") {
    return null;
  }
  
  // Обработчики наведения
  const handleMouseEnter = () => {
    targetHoverRef.current = 1.0;
    if (contextRef.current && programRef.current && isInitializedRef.current) {
      requestRef.current = requestAnimationFrame(function animate() {
        if (!contextRef.current || !programRef.current || !isInitializedRef.current) return;
        
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
    if (contextRef.current && programRef.current && isInitializedRef.current) {
      requestRef.current = requestAnimationFrame(function animate() {
        if (!contextRef.current || !programRef.current || !isInitializedRef.current) return;
        
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
      style={{ 
        position: 'relative', 
        overflow: 'visible',
        height: 'auto'  // Авто-высота для сохранения пропорций
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <canvas 
        ref={canvasRef}
        className="w-full"
        style={{ 
          display: 'block',
          position: 'relative', // Изменено с absolute на relative
          objectFit: 'contain'
        }}
      />
      {/* Скрытое изображение для предзагрузки */}
      {imageUrl && imageUrl.trim() !== "" && (
        <div className="hidden">
          <Image
            src={imageUrl}
            alt={alt}
            width={1000}
            height={1000}
            unoptimized
          />
        </div>
      )}
    </div>
  );
}