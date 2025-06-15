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
d:I[9665,[],"MetadataBoundary"]
f:I[9665,[],"OutletBoundary"]
12:I[4911,[],"AsyncMetadataOutlet"]
14:I[9665,[],"ViewportBoundary"]
16:I[6614,[],""]
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
  0:{"P":null,"b":"mYYHz0WTLT-09YHgndvfS","p":"","c":["","gift"],"i":false,"f":[[["",{"children":["gift",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/108418459ad29eb9.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","className":"__variable_343236 __variable_6d42d0 __variable_45bf65 __variable_3d8363 __variable_fa9af8 [object Object]","children":[["$","head",null,{"children":["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}]}],["$","body",null,{"className":"min-h-screen","children":[["$","$L3",null,{"children":["$","$L4",null,{"children":["$","$L5",null,{"children":[["$","$L6",null,{}],["$","div",null,{"className":"page-content","children":["$","$L7",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","$L9",null,{}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}],["$","$La",null,{}]]}]}]}],["$","$Lb",null,{}]]}]]}]]}],{"children":["gift",["$","$1","c",{"children":[null,["$","$L7",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":["__PAGE__",["$","$1","c",{"children":["$Lc",["$","$Ld",null,{"children":"$Le"}],null,["$","$Lf",null,{"children":["$L10","$L11",["$","$L12",null,{"promise":"$@13"}]]}]]}],{},null,false]},null,false]},null,false],["$","$1","h",{"children":[null,["$","$1","8ijeGiBF1_-60WbpjoWFN",{"children":[["$","$L14",null,{"children":"$L15"}],null]}],null]}],false]],"m":"$undefined","G":["$16","$undefined"],"s":false,"S":true}
17:"$Sreact.suspense"
18:I[4911,[],"AsyncMetadata"]
e:["$","$17",null,{"fallback":null,"children":["$","$L18",null,{"promise":"$@19"}]}]
11:null
15:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
10:null
19:{"metadata":[["$","title","0",{"children":"Lesya Svet"}],["$","meta","1",{"name":"description","content":"Lesya Svet"}],["$","link","2",{"rel":"icon","href":"/favicon.ico"}]],"error":null,"digest":"$undefined"}
13:{"metadata":"$19:metadata","error":null,"digest":"$undefined"}
1a:I[4897,["6530","static/chunks/6530-60cad77e061091d4.js","6874","static/chunks/6874-8bbb54879253771a.js","6766","static/chunks/6766-a3607a63276375b5.js","9687","static/chunks/9687-ff2fd735645b915c.js","9125","static/chunks/app/gift/page-9a5d8f05faf89b7d.js"],"RoadmapGrid"]
1b:I[6874,["6530","static/chunks/6530-60cad77e061091d4.js","6874","static/chunks/6874-8bbb54879253771a.js","6766","static/chunks/6766-a3607a63276375b5.js","9687","static/chunks/9687-ff2fd735645b915c.js","9125","static/chunks/app/gift/page-9a5d8f05faf89b7d.js"],""]
c:["$","div",null,{"className":"relative bg-bg-white-0","children":["$","main",null,{"className":"min-h-screen bg-adaptive","children":[["$","div",null,{"className":"flex justify-center pt-24 md:pt-20 lg:pt-24 mb-8 md:mb-16","children":["$","h4",null,{"className":"text-center font-founders text-title-h4 uppercase text-adaptive","children":"gift roadmap"}]}],["$","div",null,{"className":"pb-6","children":["$","$L1a",null,{"gifts":[{"id":"cmbv8de4k0000lvjwdvvw9gx0","number":1,"title":"Тест","author":"Маша","nickname":"qwerty","isSecret":false,"openDate":"$D2025-05-31T19:00:00.000Z","englishDescription":"Lorem ipsum dolor sit amet","hintImageUrl":"https://lesyasvet.storage.yandexcloud.net/cmbv8de4k0000lvjwdvvw9gx0_hint_image_1749844796875.jpg","imageCover":"https://lesyasvet.storage.yandexcloud.net/cmbv8de4k0000lvjwdvvw9gx0_block_0848ab3102de7aaccf67cdf3b0f25495_1749844798914_1749844798914.jpg","hintText":"Look for a gift with this sticker","codeText":"This is the part of your cipher. Collect them all to reveal the last secret","code":"","contentPath":"cmbv8de4k0000lvjwdvvw9gx0","contentUrl":"https://lesyasvet.storage.yandexcloud.net/cmbv8de4k0000lvjwdvvw9gx0_content.json"}]}]}],["$","div",null,{"className":"flex flex-col items-center gap-6 sm:gap-8 md:gap-10 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-28 text-center px-4","children":[["$","span",null,{"className":"font-nyghtserif text-label-xl","children":"***"}],["$","h2",null,{"className":"font-founders text-title-h4 md:text-title-h3 uppercase","children":["To feel the  ",["$","br",null,{}],"sunlight"]}],["$","$L1b",null,{"href":"/","children":["$","button",null,{"ref":"$undefined","className":"btn-adaptive","children":"go home"}]}]]}]]}]}]
