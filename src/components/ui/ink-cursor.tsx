'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function InkCursor() {
  useEffect(() => {
    // Компонент монтируется только на клиенте
    return () => {
      // Очистка при размонтировании
    };
  }, []);

  return (
    <>
      <svg className='ink-icon' xmlns="http://www.w3.org/2000/svg" version="1.1" width="400">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -15" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
      <div id="button" className="HoverButton"></div>
      <div className="circle"><p id="circle-content"></p></div>
      <div id="cursor" className="Cursor"></div>

      <style jsx global>{`
        .ink-icon {
          display: none;
        }
        .Cursor {
          pointer-events: none;
          position: fixed;
          display: block;
          border-radius: 0;
          transform-origin: center center;
          top: 0;
          left: 0;
          z-index: 1000;
          filter: url("#goo");
          mix-blend-mode: difference;
        }
        .Cursor span {
          position: absolute;
          display: block;
          width: 20px;
          height: 20px;
          border-radius: 20px;
          background-color: #fff;
          transform-origin: center center;
          transform: translate(-50%, -50%);
        }
        @media screen and (max-width: 480px) {
          .Cursor {
            display: none;
          }
        }
      `}</style>

      <Script id="ink-cursor-script" strategy="afterInteractive">
        {`
        function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}
        
        // Проверяем, загружена ли библиотека GSAP
        if (typeof window !== 'undefined') {
          // Загружаем GSAP, если его нет
          if (!window.TweenMax) {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenMax.min.js";
            script.async = true;
            document.body.appendChild(script);
            script.onload = initInkCursor;
          } else {
            initInkCursor();
          }
        }
        
        function initInkCursor() {
          const cursor = document.getElementById("cursor");
          if (!cursor) return;
          
          const amount = 17;  // Уменьшаем количество точек
          const sineDots = Math.floor(amount * 0.3);
          const width = 10;   // Уменьшенный размер точки
          const idleTimeout = 150;
          let lastFrame = 0;
          let mousePosition = { x: 0, y: 0 };
          let dots = [];
          let timeoutID;
          let idle = false;
          let hoverButton;
          
          class HoverButton {
            constructor(id) {
              _defineProperty(this, "onMouseEnter", () => {
                this.hoverInAnim();
              });
              _defineProperty(this, "hoverInAnim", () => {
                if (!this.hovered) {
                  this.hovered = true;
                  this.animatingHover = true;
                  this.forceOut = false;
                  TweenMax.fromTo(
                    this.bg,
                    this.timing,
                    { x: "-112%" },
                    {
                      x: "-12%",
                      ease: Power3.easeOut,
                      onComplete: () => {
                        this.animatingHover = false;
                        if (this.forceOut) {
                          this.foceOut = false;
                          this.hoverOutAnim();
                        }
                      }
                    }
                  );
                }
              });
              _defineProperty(this, "onMouseLeave", () => {
                if (!this.animatingHover) {
                  this.hoverOutAnim();
                } else {
                  this.forceOut = true;
                }
              });
              _defineProperty(this, "hoverOutAnim", () => {
                this.hovered = false;
                TweenMax.to(this.bg, this.timing, {
                  x: "100%",
                  ease: Power3.easeOut,
                  onComplete: () => {}
                });
              });
              
              this.hovered = false;
              this.animatingHover = false;
              this.forceOut = false;
              this.timing = 0.65;
              this.el = document.getElementById(id);
              if (this.el) {
                this.bg = this.el.getElementsByClassName("bg")[0];
                if (this.bg) {
                  this.el.addEventListener("mouseenter", this.onMouseEnter);
                  this.el.addEventListener("mouseleave", this.onMouseLeave);
                }
              }
            }
          }
          
          class Dot {
            constructor(index = 0) {
              this.index = index;
              this.anglespeed = 0.05;
              this.x = 0;
              this.y = 0;
              this.scale = 1 - 0.055 * index; // Увеличиваем разницу между точками
              this.range = width / 2 - width / 2 * this.scale + 1.5; // Уменьшаем диапазон
              this.limit = width * 0.72 * this.scale; // Уменьшаем лимит
              this.element = document.createElement("span");
              TweenMax.set(this.element, { scale: this.scale });
              cursor.appendChild(this.element);
            }
            
            lock() {
              this.lockX = this.x;
              this.lockY = this.y;
              this.angleX = Math.PI * 2 * Math.random();
              this.angleY = Math.PI * 2 * Math.random();
            }
            
            draw(delta) {
              if (!idle || this.index <= sineDots) {
                TweenMax.set(this.element, { x: this.x, y: this.y });
              } else {
                this.angleX += this.anglespeed;
                this.angleY += this.anglespeed;
                this.y = this.lockY + Math.sin(this.angleY) * this.range;
                this.x = this.lockX + Math.sin(this.angleX) * this.range;
                TweenMax.set(this.element, { x: this.x, y: this.y });
              }
            }
          }
          
          class Circle {
            constructor(id) {
              const el = document.getElementById(id);
              if (!el) return;
              
              const parent = el.parentElement;
              parent.removeChild(el);
              const chars = el.innerText.split("");
              chars.push(" ");
              
              for (let i = 0; i < chars.length; i++) {
                const span = document.createElement("span");
                span.innerText = chars[i];
                span.className = \`char\${i + 1}\`;
                parent.appendChild(span);
              }
            }
          }
          
          function init() {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("touchmove", onTouchMove);
            
            hoverButton = new HoverButton("button");
            new Circle("circle-content");
            
            lastFrame += new Date();
            buildDots();
            render();
          }
          
          function startIdleTimer() {
            timeoutID = setTimeout(goInactive, idleTimeout);
            idle = false;
          }
          
          function resetIdleTimer() {
            clearTimeout(timeoutID);
            startIdleTimer();
          }
          
          function goInactive() {
            idle = true;
            for (let dot of dots) {
              dot.lock();
            }
          }
          
          function buildDots() {
            for (let i = 0; i < amount; i++) {
              let dot = new Dot(i);
              dots.push(dot);
            }
          }
          
          const onMouseMove = event => {
            mousePosition.x = event.clientX - width / 2;
            mousePosition.y = event.clientY - width / 2;
            resetIdleTimer();
          };
          
          const onTouchMove = event => {
            mousePosition.x = event.touches[0].clientX - width / 2;
            mousePosition.y = event.touches[0].clientY - width / 2;
            resetIdleTimer();
          };
          
          const render = timestamp => {
            const delta = timestamp - lastFrame;
            positionCursor(delta);
            lastFrame = timestamp;
            requestAnimationFrame(render);
          };
          
          const positionCursor = delta => {
            let x = mousePosition.x;
            let y = mousePosition.y;
            
            dots.forEach((dot, index, dots) => {
              let nextDot = dots[index + 1] || dots[0];
              dot.x = x;
              dot.y = y;
              dot.draw(delta);
              
              if (!idle || index <= sineDots) {
                const dx = (nextDot.x - dot.x) * 0.33; // Уменьшаем коэффициент для более компактного хвоста
                const dy = (nextDot.y - dot.y) * 0.33;
                x += dx;
                y += dy;
              }
            });
          };
          
          init();
        }
        `}
      </Script>
    </>
  );
} 