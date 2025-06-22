"use client";

import { useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

// Расширяем интерфейс Window с нашим методом
declare global {
  interface Window {
    presetGLImageRatio?: (url: string) => number;
  }
}

// Интерфейс для GLImage компонента
export interface GLImageProps {
  imageUrl: string;
  imageCover?: boolean;
  randomOffset?: number;
  alt?: string;
}

// Константа для ключа localStorage
const IMAGE_RATIOS_STORAGE_KEY = 'glimage-ratios-cache';

// Глобальный кеш для хранения реальных пропорций изображений
const imageRatioCache: Record<string, number> = {};
// Кеш для хранения промисов загрузки изображений
const imageLoadPromises: Record<string, Promise<{ width: number, height: number }>> = {};

// Инициализация кеша из localStorage при загрузке скрипта
if (typeof window !== 'undefined') {
  try {
    const savedRatios = localStorage.getItem(IMAGE_RATIOS_STORAGE_KEY);
    if (savedRatios) {
      const parsedRatios = JSON.parse(savedRatios);
      Object.assign(imageRatioCache, parsedRatios);
      console.log('Loaded image ratios from localStorage:', Object.keys(parsedRatios).length);
    }
  } catch (err) {
    console.error('Error loading image ratios from localStorage:', err);
  }
}

// Функция для сохранения кеша в localStorage
function saveRatiosToStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(IMAGE_RATIOS_STORAGE_KEY, JSON.stringify(imageRatioCache));
    } catch (err) {
      console.error('Error saving image ratios to localStorage:', err);
    }
  }
}

// Дебаунс для сохранения в localStorage (чтобы не сохранять слишком часто)
let saveTimeout: any = null;
function debouncedSaveRatios() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveRatiosToStorage();
    saveTimeout = null;
  }, 1000); // Задержка 1 секунда
}

// Глобальный загрузчик изображений, который загружает изображение и определяет его пропорции
export function preloadImage(url: string): Promise<{ width: number, height: number }> {
  // Если пропорции уже есть в кеше, возвращаем их
  if (imageRatioCache[url]) {
    return Promise.resolve({ 
      width: 1, 
      height: imageRatioCache[url] 
    });
  }
  
  // Если уже есть промис загрузки этого изображения, возвращаем его
  if (imageLoadPromises[url]) {
    return imageLoadPromises[url];
  }
  
  // Создаем новый промис для загрузки изображения
  const loadPromise = new Promise<{ width: number, height: number }>((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Если мы на сервере, используем фиксированное соотношение 1:1
      resolve({ width: 1, height: 1 });
      return;
    }
    
    // Создаем новый элемент Image для загрузки
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    
    // Устанавливаем обработчики событий
    img.onload = () => {
      // Вычисляем соотношение сторон
      const ratio = img.height / img.width;
      // Сохраняем в кеше
      imageRatioCache[url] = ratio;
      // Планируем сохранение в localStorage
      debouncedSaveRatios();
      // Резолвим промис с размерами
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${url}`);
      // В случае ошибки используем соотношение 1:1
      imageRatioCache[url] = 1;
      // Планируем сохранение в localStorage
      debouncedSaveRatios();
      resolve({ width: 1, height: 1 });
    };
    
    // Начинаем загрузку
    img.src = url;
  });
  
  // Сохраняем промис в кеше
  imageLoadPromises[url] = loadPromise;
  return loadPromise;
}

// Получаем размеры для начального рендера (с использованием cached значений)
function getInitialRatio(url: string): number {
  // Если уже есть в кеше, используем его
  if (imageRatioCache[url]) {
    return imageRatioCache[url];
  }
  
  // Иначе возвращаем стандартное значение
  return 1.0; // Квадратное соотношение как безопасное значение
}

// Функция для определения пропорций по URL
function getImageAspectRatio(url: string): number {
  // Проверяем кеш
  if (imageRatioCache[url]) {
    return imageRatioCache[url];
  }
  
  // Определяем пропорцию на основе паттернов в URL
  for (const [key, ratio] of Object.entries(presetImageRatios)) {
    if (url.includes(key)) {
      imageRatioCache[url] = ratio;
      return ratio;
    }
  }
  
  // Значение по умолчанию - горизонтальные изображения
  return presetImageRatios.default || 1.0;
}

// Инициализируем глобальную функцию для использования снаружи
if (typeof window !== 'undefined') {
  window.presetGLImageRatio = getImageAspectRatio;
}

// Предустановленные пропорции для изображений roadmap
// Это позволит избежать скачков при первом рендере, до загрузки изображений
const presetImageRatios: Record<string, number> = {
  // Вертикальные изображения (соотношение >1)
  'wall1.jpg': 1.5,
  'wall2.jpg': 1.33,
  'wall5.jpg': 1.5,
  'wall6.jpg': 1.7,
  
  // Горизонтальные изображения (соотношение <1)
  'wall3.jpg': 0.75,
  'wall4.jpg': 0.6,
  
  // По умолчанию используем квадратное соотношение
  'default': 1.0
};

// Singleton для управления общим WebGL контекстом 
class SharedWebGLManager {
  private static instance: SharedWebGLManager;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private animationFrame: number | null = null;
  private textures: Map<string, WebGLTexture> = new Map();
  private imageElements: Map<string, HTMLImageElement> = new Map();
  private renderTargets: Map<HTMLElement, { 
    canvas: HTMLCanvasElement, 
    textureUrl: string,
    hover: number,
    targetHover: number,
    isDirty: boolean
  }> = new Map();
  private isRendering = false;

  // WebGL шейдеры
  private vertexShaderSource = `
    precision mediump float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vUv = uv;
  }
`;

  private fragmentShaderSource = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uHover;
  
  void main() {
    vec2 uv = vUv;
    
    // Применяем эффект hover без искажения пропорций
    float HOVER_SCALE = 0.08;
      uv = uv - 0.5;
    float dist = length(uv);
    float scaleFactor = 1.0 - uHover * HOVER_SCALE * smoothstep(0.0, 1.0, dist * 1.4);
      uv = uv * scaleFactor;
      uv = uv + 0.5;
    
    // Исправляем перевернутую ось Y
    uv.y = 1.0 - uv.y;
    
    // Повышаем яркость при наведении
    vec4 color = texture2D(uTexture, uv);
    color.rgb = mix(color.rgb, color.rgb * 1.2, uHover);
    
    gl_FragColor = color;
  }
`;

  private constructor() {
    // Создаем скрытый общий canvas для WebGL
    if (typeof window !== 'undefined') {
      try {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '-9999px';
        this.canvas.style.visibility = 'hidden';
        document.body.appendChild(this.canvas);
        
        // Инициализируем WebGL
        this.initWebGL();
      } catch (error) {
        console.error('Error initializing SharedWebGLManager:', error);
      }
    }
  }

  public static getInstance(): SharedWebGLManager {
    if (!SharedWebGLManager.instance && typeof window !== 'undefined') {
      SharedWebGLManager.instance = new SharedWebGLManager();
    }
    return SharedWebGLManager.instance;
  }

  private initWebGL(): void {
    if (!this.canvas) return;

    try {
      // Создаем WebGL контекст
      this.gl = this.canvas.getContext('webgl', {
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: true,
      });

      if (!this.gl) {
        console.error('Failed to create WebGL context');
        return;
      }

      // Создаем шейдеры
      const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vertexShaderSource);
      const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSource);

      if (!vertexShader || !fragmentShader) {
        console.error('Failed to create shaders');
        return;
      }

      // Создаем программу
      this.program = this.gl.createProgram();
      if (!this.program) {
        console.error('Failed to create program');
        return;
      }

      this.gl.attachShader(this.program, vertexShader);
      this.gl.attachShader(this.program, fragmentShader);
      this.gl.linkProgram(this.program);

      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        console.error('Failed to link program:', this.gl.getProgramInfoLog(this.program));
        return;
      }

      this.gl.useProgram(this.program);

      // Настраиваем геометрию
      const positionLocation = this.gl.getAttribLocation(this.program, "position");
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        this.gl.STATIC_DRAW
      );
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

      const uvLocation = this.gl.getAttribLocation(this.program, "uv");
      const uvBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
        this.gl.STATIC_DRAW
      );
      this.gl.enableVertexAttribArray(uvLocation);
      this.gl.vertexAttribPointer(uvLocation, 2, this.gl.FLOAT, false, 0, 0);

      console.log('SharedWebGLManager initialized successfully');
    } catch (error) {
      console.error('Error initializing WebGL:', error);
    }
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(
        'An error occurred compiling the shaders:',
        this.gl.getShaderInfoLog(shader)
      );
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  public registerElement(
    element: HTMLElement, 
    canvas: HTMLCanvasElement, 
    textureUrl: string
  ): void {
    if (!this.renderTargets.has(element)) {
      this.renderTargets.set(element, {
        canvas,
        textureUrl,
        hover: 0,
        targetHover: 0,
        isDirty: true
      });

      this.loadTexture(textureUrl);
      this.startRenderLoop();
    }
  }

  public unregisterElement(element: HTMLElement): void {
    this.renderTargets.delete(element);
  }

  public setHoverState(element: HTMLElement, isHovered: boolean): void {
    const target = this.renderTargets.get(element);
    if (target) {
      target.targetHover = isHovered ? 1.0 : 0.0;
      target.isDirty = true;
      this.startRenderLoop();
    }
  }

  private loadTexture(url: string): void {
    if (this.textures.has(url) || !this.gl) return;

    const image = new window.Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      if (!this.gl) return;

      const texture = this.gl.createTexture();
      if (!texture) return;

      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

      this.textures.set(url, texture);
      this.imageElements.set(url, image);

      // Помечаем все связанные элементы как требующие перерисовки
      for (const [element, target] of this.renderTargets.entries()) {
        if (target.textureUrl === url) {
          target.isDirty = true;
        }
      }

      this.startRenderLoop();
    };

    image.onerror = () => {
      console.error(`Failed to load image: ${url}`);
    };

    image.src = url;
  }

  private startRenderLoop(): void {
    if (this.isRendering) return;
    this.isRendering = true;
    this.renderLoop();
  }

  private renderLoop = (): void => {
    let needsNextFrame = false;

    // Обрабатываем все элементы
    for (const [element, target] of this.renderTargets.entries()) {
      // Проверяем, что элемент присутствует в DOM
      if (!document.body.contains(element)) {
        this.renderTargets.delete(element);
        continue;
      }
      
      // Обновляем значение hover с анимацией
      if (Math.abs(target.hover - target.targetHover) > 0.001) {
        target.hover += (target.targetHover - target.hover) * 0.1;
        target.isDirty = true;
        needsNextFrame = true;
      }

      // Проверяем, нужно ли перерисовывать элемент
      if (target.isDirty) {
        try {
          this.renderElement(element, target);
          target.isDirty = false;
        } catch (error) {
          console.error('Error rendering element:', error);
          // Если произошла ошибка при рендеринге, пометим элемент для повторной попытки
          needsNextFrame = true;
        }
      }
    }

    if (needsNextFrame) {
      this.animationFrame = requestAnimationFrame(this.renderLoop);
    } else {
      this.animationFrame = null;
      this.isRendering = false;
    }
  };

  private renderElement(element: HTMLElement, target: { 
    canvas: HTMLCanvasElement, 
    textureUrl: string,
    hover: number,
    targetHover: number,
    isDirty: boolean
  }): void {
    const { canvas, textureUrl, hover } = target;

    // Проверяем доступность всех ресурсов
    if (!this.gl || !this.program || !this.textures.has(textureUrl)) return;

    const texture = this.textures.get(textureUrl)!;
    const image = this.imageElements.get(textureUrl)!;

    // Проверяем, имеет ли канвас размеры
    if (canvas.width === 0 || canvas.height === 0) {
      // Если канвас еще не имеет размеров, пропустим этот кадр
      return;
    }

    // Устанавливаем размеры временного canvas для рендеринга
    const tempCanvas = this.canvas!;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Всегда используем минимально допустимые размеры для общего canvas
    tempCanvas.width = Math.max(512, canvas.width);
    tempCanvas.height = Math.max(512, canvas.height);

    // Устанавливаем viewport
    this.gl.viewport(0, 0, tempCanvas.width, tempCanvas.height);

    // Очищаем canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Биндим текстуру
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
    // Устанавливаем uniform для шейдеров
    const uHoverLocation = this.gl.getUniformLocation(this.program, "uHover");
    this.gl.uniform1f(uHoverLocation, hover);

    const uTextureLocation = this.gl.getUniformLocation(this.program, "uTexture");
    this.gl.uniform1i(uTextureLocation, 0);

    // Отрисовываем
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    // Копируем результат в canvas элемента
    const destCtx = canvas.getContext('2d');
    if (destCtx) {
      // Проверяем размеры холста
      if (canvas.width > 0 && canvas.height > 0 && tempCanvas.width > 0 && tempCanvas.height > 0) {
        destCtx.clearRect(0, 0, canvas.width, canvas.height);
        destCtx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      } else {
        console.warn('Canvas has invalid dimensions:', 
          canvas.width, canvas.height, tempCanvas.width, tempCanvas.height);
      }
    }
  }

  public cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.gl) {
      // Удаляем все текстуры
      for (const texture of this.textures.values()) {
        this.gl.deleteTexture(texture);
      }

      // Удаляем программу
      if (this.program) {
        this.gl.deleteProgram(this.program);
      }
    }

    // Удаляем общий canvas из DOM
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.textures.clear();
    this.imageElements.clear();
    this.renderTargets.clear();
  }
}

// Компонент WebGL для изображения с hover-эффектом
export function GLImage({ 
  imageUrl, 
  imageCover = false,
  randomOffset = 0,
  alt = "Image"
}: GLImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  
  // Применяем начальные пропорции сразу при монтировании компонента
  // Это критично для предотвращения скачков при SSR
  useEffect(() => {
    if (!imageUrl) return;
    
    // Получаем начальное соотношение сторон (из кеша localStorage или стандартное)
    const initialRatio = getInitialRatio(imageUrl);
    
    // Применяем его немедленно
    setImageAspectRatio(initialRatio);
    
    // Если мы на клиенте, также запускаем предзагрузку для уточнения пропорций
    if (isClient) {
      // Предзагружаем без ожидания для оптимизации производительности
      preloadImage(imageUrl);
    }
  }, [imageUrl, isClient]);
    
  // Проверяем, что мы на клиенте (в браузере)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Получаем глобальный менеджер WebGL только на клиенте
  const webglManager = isClient ? SharedWebGLManager.getInstance() : null;
    
  // Загрузка и определение размеров изображения
  useEffect(() => {
    if (!imageUrl || !isClient) return;
    
    // Устанавливаем загрузку
    setIsLoading(true);
    
    // Используем нашу функцию предзагрузки, которая возвращает промис с размерами
    preloadImage(imageUrl).then(dimensions => {
      // Рассчитываем пропорции
      const ratio = dimensions.height / dimensions.width;
      
      // Устанавливаем пропорции в состояние компонента
      setImageAspectRatio(ratio);
      setIsLoading(false);
      
      // Если canvas уже доступен, обновляем его размеры
      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        const rect = container.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Настраиваем размеры с учетом пропорций изображения
        let containerWidth = Math.max(1, rect.width);
        let containerHeight = Math.max(1, ratio * containerWidth);
        
        canvas.width = containerWidth * pixelRatio;
        canvas.height = containerHeight * pixelRatio;
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerHeight}px`;
        
        // Регистрируем элемент в WebGL менеджере
        if (webglManager) {
          webglManager.registerElement(container, canvas, imageUrl);
        }
      }
    }).catch(error => {
      console.error(`Error loading image: ${imageUrl}`, error);
      
      // Используем стандартное соотношение сторон в случае ошибки
      const defaultRatio = 1.0; // Квадрат
      setImageAspectRatio(defaultRatio);
      setIsLoading(false);
    });
  }, [imageUrl, isClient, webglManager]);
      
  // Инициализация элемента
  useEffect(() => {
    // Проверяем только обязательные условия, аспектное соотношение может быть установлено позже
    if (!imageUrl || !canvasRef.current || !containerRef.current || !webglManager) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
      
    // Устанавливаем размеры canvas
    const updateCanvasSize = () => {
      if (!canvas || !container) return;
      
      // Получаем размеры контейнера
      const rect = container.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
        
      // Ширина всегда берётся из контейнера
      const containerWidth = Math.max(1, rect.width); // Минимум 1px для предотвращения ошибок
      
      let containerHeight;
      
      // Определяем высоту в зависимости от режима отображения
      if (imageCover) {
        // Для cover используем высоту контейнера
        containerHeight = Math.max(1, rect.height);
      } else {
        // Для contain вычисляем высоту на основе пропорций изображения
        // Если аспектное соотношение уже определено
        if (imageAspectRatio) {
          containerHeight = containerWidth * imageAspectRatio;
        } else {
          // Иначе используем соотношение 4:3 по умолчанию
          containerHeight = containerWidth * 0.75;
        }
      }
      
      // Устанавливаем минимальную высоту
      containerHeight = Math.max(50, containerHeight);
      
      // Устанавливаем размеры canvas
      canvas.width = containerWidth * pixelRatio;
      canvas.height = containerHeight * pixelRatio;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
    };

    // Обновляем размеры и регистрируем элемент
    updateCanvasSize();
    webglManager.registerElement(container, canvas, imageUrl);
    
    // Обработчик изменения размера окна
    const handleResize = () => {
      updateCanvasSize();
    };

    // Первоначальная настройка размера
    updateCanvasSize();

    // Добавляем слушатель изменения размера
    window.addEventListener('resize', handleResize);
    
    // Устанавливаем флаг инициализации
    setIsInitialized(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (webglManager) {
        webglManager.unregisterElement(container);
      }
    };
  }, [imageUrl, webglManager]);
  
    // Обработчики наведения мыши и принудительного обновления
  const handleMouseEnter = () => {
    if (webglManager && containerRef.current) {
      webglManager.setHoverState(containerRef.current, true);
    }
  };

  const handleMouseLeave = () => {
    if (webglManager && containerRef.current) {
      webglManager.setHoverState(containerRef.current, false);
    }
  };
  
  // Функция для принудительного обновления рендеринга
  const forceRerender = () => {
    if (webglManager && containerRef.current && canvasRef.current) {
      // Перерегистрируем элемент для обновления рендеринга
      webglManager.registerElement(containerRef.current, canvasRef.current, imageUrl);
      // Принудительно запускаем перерисовку
      webglManager.setHoverState(containerRef.current, false);
    }
  };
  
  // Отслеживаем скролл и другие события, которые могут влиять на видимость
  useEffect(() => {
    if (!isClient) return;
    
    // Функция для обработки скролла
    const handleScroll = () => {
      // Используем requestAnimationFrame для оптимизации
      requestAnimationFrame(forceRerender);
    };
    
    // Функция для обработки изменения размера окна
    const handleResize = () => {
      requestAnimationFrame(forceRerender);
    };
    
    // Функция для обработки видимости страницы
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        forceRerender();
      }
    };
    
    // Добавляем обработчики событий
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Запускаем первоначальную перерисовку
    forceRerender();
    
    // Очистка при размонтировании
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isClient, webglManager, imageUrl, isInitialized]);

  // Отслеживаем изменение маршрута для обновления рендеринга при навигации
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Эффект для обработки изменений маршрута
  useEffect(() => {
    if (!isClient || !webglManager || !containerRef.current || !canvasRef.current) return;
    
    // Используем setTimeout для обеспечения выполнения после завершения навигации
    const navigationTimer = setTimeout(() => {
      // Принудительно перерисовываем компонент
      forceRerender();
      
      // Добавляем еще одно обновление через 300мс для надежности
      // (после завершения анимаций перехода)
      setTimeout(forceRerender, 300);
    }, 100);
    
    return () => {
      clearTimeout(navigationTimer);
    };
  }, [pathname, searchParams, isClient, webglManager]);

  // Предзагрузка изображения для Next.js Image оптимизации
  // и предотвращения FOUC (Flash of Unstyled Content)
  const preloadedImage = imageUrl && (
    <div className="hidden">
      <Image 
        src={imageUrl} 
        alt={alt} 
        width={500} 
        height={500} 
        unoptimized
        onLoadingComplete={(img) => {
          // Когда Next.js Image загружено, обновляем пропорции
          // Это дополнительная подстраховка, чтобы избежать скачков
          if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
            const ratio = img.naturalHeight / img.naturalWidth;
            // Обновляем кеш и состояние, если они отличаются
            if (ratio !== imageAspectRatio && ratio > 0) {
              imageRatioCache[imageUrl] = ratio;
              setImageAspectRatio(ratio);
              setIsLoading(false);
            }
          }
        }}
      />
    </div>
  );

  // Если imageUrl не задан, возвращаем null
  if (!imageUrl || imageUrl.trim() === "") {
    return null;
  }
  
  // Определяем стиль контейнера на основе пропорций и режима отображения
  const containerStyle = useMemo(() => {
    // Получаем безопасное значение для соотношения сторон
    const ratio = imageAspectRatio || getInitialRatio(imageUrl);
    
    if (imageCover) {
      // Для растягивающихся изображений (cover) - просто прямоугольник
      return {
        position: 'relative' as const, 
        overflow: 'hidden' as const,
        width: '100%',
        height: '100%',
        minHeight: '200px' // Минимальная высота для отображения
      };
    } else {
      // Для сохраняющих пропорции изображений (contain)
      return {
        position: 'relative' as const, 
        overflow: 'visible' as const,
        width: '100%',
        height: '0', // Высота будет задана через padding-bottom
        // Используем padding-bottom с точным соотношением сторон
        paddingBottom: `${ratio * 100}%`,
        minHeight: '50px' // Минимальная высота, чтобы избежать нулевых размеров
      };
    }
  }, [imageUrl, imageCover, imageAspectRatio]);

  // Определяем стиль canvas
  const canvasStyle = {
    display: 'block',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: imageCover ? 'cover' as const : 'contain' as const
  };

  // Стили для скелетона во время загрузки
  const skeletonStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    opacity: isLoading ? 1 : 0,
    transition: 'opacity 0.3s ease',
    zIndex: 1
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full relative"
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Скелетон для отображения во время загрузки */}
      <div style={skeletonStyle} />
      
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          ...canvasStyle,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
      {preloadedImage}
    </div>
  );
}