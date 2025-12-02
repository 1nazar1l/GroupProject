function syncContentWithImage(screenClass) {
    const screen = document.querySelector(`.${screenClass}`);
    if (!screen) return;
    
    const background = screen.querySelector('.background');
    const content = screen.querySelector('.content');
    
    if (!background || !content) return;
    
    // Проверяем, загружено ли изображение
    const sync = () => {
        const imgRect = background.getBoundingClientRect();
        if (imgRect.width > 0 && imgRect.height > 0) {
            content.style.width = imgRect.width + 'px';
            content.style.height = imgRect.height + 'px';
            content.style.position = 'absolute';
            content.style.left = '50%';
            content.style.transform = 'translateX(-50%)';
        }
    };
    
    // Если изображение уже загружено, синхронизируем сразу
    if (background.complete && background.naturalWidth > 0) {
        sync();
    } else {
        // Иначе ждем загрузки изображения
        background.addEventListener('load', sync, { once: true });
        // Также пробуем синхронизировать сразу на случай, если изображение уже загружено
        sync();
    }
}

// Функция для переключения экранов
function switchScreen(toScreenClass) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Скрываем меню паузы
    document.querySelector('.pause-menu').classList.remove('active');
    
    // Показываем целевой экран
    const toScreen = document.querySelector(`.${toScreenClass}`);
    if (toScreen) {
        toScreen.classList.add('active');
        // Добавляем небольшую задержку для синхронизации после того, как изображение загрузится
        setTimeout(() => {
            syncContentWithImage(toScreenClass);
        }, 50);
    }
}

// Функция для обновления всех экранов
function updateAllScreens() {
    const screens = ["main-screen", "tier0_shop", "tier0_5_shop", "tier1_shop", "bank", "casino"];
    screens.forEach(screenClass => {
        syncContentWithImage(screenClass);
    });
}

// Функция для проверки полноэкранного режима
function isFullscreen() {
    return !!(document.fullscreenElement || 
              document.webkitFullscreenElement ||
              document.mozFullScreenElement ||
              document.msFullscreenElement ||
              window.innerHeight === screen.height);
}

// Функция для переключения полноэкранного режима
function toggleFullscreen() {
    if (!isFullscreen()) {
        // Вход в полноэкранный режим
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        // Выход из полноэкранного режима
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Обработчик изменения полноэкранного режима
function handleFullscreenChange() {
    const fullscreen = isFullscreen();
    
    // Обновляем стили для полноэкранного режима
    document.body.classList.toggle('fullscreen-mode', fullscreen);
    
    // Обновляем размеры контента
    updateAllScreens();
    
    // Обновляем текст всех кнопок полноэкранного режима
    document.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.textContent = fullscreen ? 'Обычный экран' : 'Полный экран';
    });
}

// Обработчик нажатия F11
function handleKeyPress(event) {
    if (event.key === 'F11') {
        setTimeout(handleFullscreenChange, 100);
    }
}

// Проверяем размеры окна при изменении размера
function handleResize() {
    updateAllScreens();
    handleFullscreenChange();
}

// Инициализация при загрузке
window.addEventListener('load', function() {    
    updateAllScreens();
    
    // Инициализация навигации по экранам
    document.querySelectorAll('[data-screen-target]').forEach(button => {
        button.addEventListener('click', function() {
            const targetScreen = this.getAttribute('data-screen-target');
            switchScreen(targetScreen);
        });
    });
    
    // Обработчики для кнопок полноэкранного режима
    document.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.addEventListener('click', toggleFullscreen);
    });
    
    setTimeout(handleFullscreenChange, 500);
});

// Слушаем события изменения размера
window.addEventListener('resize', handleResize);

// Слушаем события полноэкранного режима
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

// Слушаем нажатие F11
document.addEventListener('keydown', handleKeyPress);

// Наблюдатель за изменениями размеров
const observer = new ResizeObserver(updateAllScreens);
document.querySelectorAll('.background').forEach(img => {
    observer.observe(img);
});

setInterval(handleFullscreenChange, 1000);

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
