function syncContentWithImage(screenClass) {
    const screen = document.querySelector(`.${screenClass}`);
    if (!screen) return;
    
    const background = screen.querySelector('.background');
    const content = screen.querySelector('.content');
    
    if (!background || !content) return;
    
    const imgRect = background.getBoundingClientRect();
    content.style.width = imgRect.width + 'px';
    content.style.height = imgRect.height + 'px';
    content.style.position = 'absolute';
    content.style.left = '50%';
    content.style.transform = 'translateX(-50%)';
}

// Функция для переключения экранов
function switchScreen(fromScreenClass, toScreenClass) {
    const fromScreen = document.querySelector(`.${fromScreenClass}`);
    const toScreen = document.querySelector(`.${toScreenClass}`);
    
    if (fromScreen && toScreen) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем целевой экран
        toScreen.classList.add('active');
        
        // Обновляем размеры для нового экрана
        syncContentWithImage(toScreenClass);
    }
}

// Функция для обновления всех экранов
function updateAllScreens() {
    const screens = ["main-screen", "tier0_shop"];
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
              // Проверяем размеры окна для F11
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
    
    // Обновляем текст кнопки
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.textContent = fullscreen ? 'Обычный экран' : 'Полный экран';
    }
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
    handleFullscreenChange(); // Проверяем состояние полноэкранного режима
}

// Инициализация при загрузке
window.addEventListener('load', function() {    
    updateAllScreens();
    
    // Добавляем обработчик для кнопки "Новая игра"
    const newGameBtn = document.querySelector('.new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            switchScreen('main-screen', 'tier0_shop');
        });
    }
    
    // Добавляем обработчик для кнопки полноэкранного режима
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Обновляем состояние после небольшой задержки
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

// Дополнительная проверка каждую секунду на случай если F11 не отслеживается
setInterval(handleFullscreenChange, 1000);