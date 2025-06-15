import "~/styles/globals.css";
import { type Metadata } from "next";
import { fontVariables, fontClasses } from "~/fonts/config";
import { Providers } from "@/utils/lib/providers";
import { Navigation } from "~/components/ui/navigation";
import { DateProvider } from "@/utils/hooks/useDateContext";
import { DateTestControl } from "~/components/ui/date-test-control";
import { SmoothScrollScript } from "~/components/ui/smooth-scroll";
import { ReactQueryProvider } from "@/utils/providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "Lesya Svet",
  description: "Lesya Svet",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Эта функция генерирует inline скрипт, который будет встроен в HTML документ
// и выполнится до того, как страница начнет рендериться
function generateInlineScript() {
  return `
    (function() {
      try {
        // Проверяем нужно ли показывать интро, чтобы определить начальную тему
        function checkIntroCompleted() {
          var cookies = document.cookie.split(';');
          for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.startsWith('intro_completed=true')) {
              return true;
            }
          }
          return false;
        }
          
        // Создаем стиль, который будет сразу применен
        var style = document.createElement('style');
        style.id = 'initial-theme-style';
        
        // Функция для обновления темы в зависимости от текущего пути
        function updateTheme() {
          var introCompleted = checkIntroCompleted();
          
          // Получаем или создаем элемент стиля
          var styleElement = document.getElementById('initial-theme-style');
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'initial-theme-style';
            document.head.appendChild(styleElement);
          }
          
          // Очищаем текущие стили
          styleElement.textContent = '';
          
          // Устанавливаем соответствующий стиль
          if (!introCompleted) {
            // Темная тема, если интро не пройдено
            styleElement.textContent = 'body { background-color: #171717 !important; color: #ffffff !important; }';
            
            // Скрываем навигацию, если интро не пройдено
            styleElement.textContent += ' nav { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }';
          } else {
            // Светлая тема, если интро пройдено
            styleElement.textContent = 'body { background-color: #ffffff !important; color: #171717 !important; }';
            styleElement.textContent += ' .bg-adaptive { background-color: #ffffff !important; } ';
            styleElement.textContent += ' .text-adaptive { color: #171717 !important; } ';
          }
        }
        
        // Применяем тему при первой загрузке
        updateTheme();
        
        // Скрываем контент до полной загрузки
        var loadingStyle = document.createElement('style');
        loadingStyle.textContent = '.page-content { opacity: 0; transition: opacity 0.3s ease-in-out; }';
        document.head.appendChild(loadingStyle);
        
        // После загрузки страницы, показываем контент
        window.addEventListener('load', function() {
          setTimeout(function() {
            var content = document.querySelector('.page-content');
            if (content) content.style.opacity = '1';
            
            // Удаляем стиль загрузки
            loadingStyle.remove();
          }, 100);
        });

        // Добавляем слушатель события изменения состояния интро
        window.addEventListener('introStateChange', function(event) {
          var completed = event.detail && event.detail.completed;
          if (completed) {
            updateTheme();
          }
        });
        
        // Добавляем слушатель изменения маршрута для Next.js
        if (typeof window !== 'undefined') {
          // Слушаем изменения URL
          var lastPath = window.location.pathname;
          
          // Проверяем изменения URL каждые 100мс
          setInterval(function() {
            var currentPath = window.location.pathname;
            if (currentPath !== lastPath) {
              lastPath = currentPath;
              // Обновляем тему при изменении маршрута
              setTimeout(updateTheme, 0);
            }
          }, 100);
        }
      } catch(e) {
        console.error('Error in initial theme script:', e);
      }
    })();
  `;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontVariables} ${fontClasses}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: generateInlineScript() }} />
      </head>
      <body className="min-h-screen">
        <ReactQueryProvider>
          <Providers>
            <DateProvider>
              <Navigation />
              <div className="page-content">
                {children}
              </div>
              <DateTestControl />
            </DateProvider>
          </Providers>
        </ReactQueryProvider>
        <SmoothScrollScript />
      </body>
    </html>
  );
}
