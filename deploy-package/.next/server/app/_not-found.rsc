1:"$Sreact.fragment"
3:I[6607,["6530","static/chunks/6530-60cad77e061091d4.js","2960","static/chunks/2960-f37c3b163f53865d.js","9918","static/chunks/9918-12b114331db82f4a.js","6874","static/chunks/6874-8bbb54879253771a.js","9857","static/chunks/9857-03124f1645bd298c.js","722","static/chunks/722-b876653f270d89e2.js","4546","static/chunks/4546-28744afd10fcd5b3.js","7177","static/chunks/app/layout-39688be3c63ed634.js"],"ReactQueryProvider"]
4:I[4274,["6530","static/chunks/6530-60cad77e061091d4.js","2960","static/chunks/2960-f37c3b163f53865d.js","9918","static/chunks/9918-12b114331db82f4a.js","6874","static/chunks/6874-8bbb54879253771a.js","9857","static/chunks/9857-03124f1645bd298c.js","722","static/chunks/722-b876653f270d89e2.js","4546","static/chunks/4546-28744afd10fcd5b3.js","7177","static/chunks/app/layout-39688be3c63ed634.js"],"Providers"]
5:I[6555,["6530","static/chunks/6530-60cad77e061091d4.js","2960","static/chunks/2960-f37c3b163f53865d.js","9918","static/chunks/9918-12b114331db82f4a.js","6874","static/chunks/6874-8bbb54879253771a.js","9857","static/chunks/9857-03124f1645bd298c.js","722","static/chunks/722-b876653f270d89e2.js","4546","static/chunks/4546-28744afd10fcd5b3.js","7177","static/chunks/app/layout-39688be3c63ed634.js"],"DateProvider"]
6:I[5255,["6530","static/chunks/6530-60cad77e061091d4.js","2960","static/chunks/2960-f37c3b163f53865d.js","9918","static/chunks/9918-12b114331db82f4a.js","6874","static/chunks/6874-8bbb54879253771a.js","9857","static/chunks/9857-03124f1645bd298c.js","722","static/chunks/722-b876653f270d89e2.js","4546","static/chunks/4546-28744afd10fcd5b3.js","7177","static/chunks/app/layout-39688be3c63ed634.js"],"Navigation"]
7:I[7555,[],""]
8:I[1295,[],""]
9:I[9543,["6530","static/chunks/6530-60cad77e061091d4.js","4345","static/chunks/app/not-found-38df39de7ddcab75.js"],"default"]
a:I[3110,["6530","static/chunks/6530-60cad77e061091d4.js","2960","static/chunks/2960-f37c3b163f53865d.js","9918","static/chunks/9918-12b114331db82f4a.js","6874","static/chunks/6874-8bbb54879253771a.js","9857","static/chunks/9857-03124f1645bd298c.js","722","static/chunks/722-b876653f270d89e2.js","4546","static/chunks/4546-28744afd10fcd5b3.js","7177","static/chunks/app/layout-39688be3c63ed634.js"],"DateTestControl"]
b:I[9855,["6530","static/chunks/6530-60cad77e061091d4.js","2960","static/chunks/2960-f37c3b163f53865d.js","9918","static/chunks/9918-12b114331db82f4a.js","6874","static/chunks/6874-8bbb54879253771a.js","9857","static/chunks/9857-03124f1645bd298c.js","722","static/chunks/722-b876653f270d89e2.js","4546","static/chunks/4546-28744afd10fcd5b3.js","7177","static/chunks/app/layout-39688be3c63ed634.js"],"SmoothScrollScript"]
c:I[894,[],"ClientPageRoot"]
f:I[9665,[],"MetadataBoundary"]
11:I[9665,[],"OutletBoundary"]
14:I[4911,[],"AsyncMetadataOutlet"]
16:I[9665,[],"ViewportBoundary"]
18:I[6614,[],""]
:HL["/_next/static/css/108418459ad29eb9.css","style"]
2:T1111,
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
  0:{"P":null,"b":"mYYHz0WTLT-09YHgndvfS","p":"","c":["","_not-found"],"i":false,"f":[[["",{"children":["/_not-found",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/108418459ad29eb9.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","className":"__variable_343236 __variable_6d42d0 __variable_45bf65 __variable_3d8363 __variable_fa9af8 [object Object]","children":[["$","head",null,{"children":["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}]}],["$","body",null,{"className":"min-h-screen","children":[["$","$L3",null,{"children":["$","$L4",null,{"children":["$","$L5",null,{"children":[["$","$L6",null,{}],["$","div",null,{"className":"page-content","children":["$","$L7",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","$L9",null,{}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}],["$","$La",null,{}]]}]}]}],["$","$Lb",null,{}]]}]]}]]}],{"children":["/_not-found",["$","$1","c",{"children":[null,["$","$L7",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":["__PAGE__",["$","$1","c",{"children":[["$","$Lc",null,{"Component":"$9","searchParams":{},"params":{},"promises":["$@d","$@e"]}],["$","$Lf",null,{"children":"$L10"}],null,["$","$L11",null,{"children":["$L12","$L13",["$","$L14",null,{"promise":"$@15"}]]}]]}],{},null,false]},null,false]},null,false],["$","$1","h",{"children":[["$","meta",null,{"name":"robots","content":"noindex"}],["$","$1","92j8_E6606jXsPsaviRjj",{"children":[["$","$L16",null,{"children":"$L17"}],null]}],null]}],false]],"m":"$undefined","G":["$18","$undefined"],"s":false,"S":true}
19:"$Sreact.suspense"
1a:I[4911,[],"AsyncMetadata"]
d:{}
e:{}
10:["$","$19",null,{"fallback":null,"children":["$","$L1a",null,{"promise":"$@1b"}]}]
13:null
17:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
12:null
1b:{"metadata":[["$","title","0",{"children":"Lesya Svet"}],["$","meta","1",{"name":"description","content":"Lesya Svet"}],["$","link","2",{"rel":"icon","href":"/favicon.ico"}]],"error":null,"digest":"$undefined"}
15:{"metadata":"$1b:metadata","error":null,"digest":"$undefined"}
