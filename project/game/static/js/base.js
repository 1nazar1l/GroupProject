function syncContentWithImage(screenClass) {
    const screen = document.querySelector(`.${screenClass}`);
    if (!screen) return;
    
    const background = screen.querySelector('.background');
    const content = screen.querySelector('.content');
    
    if (!background || !content) return;
    
    // Синхронизируем сразу без проверок
    const imgRect = background.getBoundingClientRect();
    content.style.width = imgRect.width + 'px';
    content.style.height = imgRect.height + 'px';
    content.style.position = 'absolute';
    content.style.left = '50%';
    content.style.transform = 'translateX(-50%)';
    
    // Дополнительная синхронизация при загрузке изображения (на всякий случай)
    if (!background.complete) {
        background.addEventListener('load', function() {
            const rect = background.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                content.style.width = rect.width + 'px';
                content.style.height = rect.height + 'px';
            }
        }, { once: true });
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
        // Без задержки
        syncContentWithImage(toScreenClass);
    }
}

// Функция для обновления всех экранов
function updateAllScreens() {
    const screens = [
        "main-screen", 
        "tier0_shop", 
        "tier0_5_shop", 
        "tier1_shop", 
        "bank", 
        "casino", 
        "tier2_shop", 
        "tier3_shop", 
        "tier4_shop",
        "tier5_shop", 
        "tier6_shop", 
        "tier7_shop",
        "tier8_shop", 
        "tier9_shop", 
        "gameplay"
    ];
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
        handleFullscreenChange(); // Без задержки
    }
}

// Проверяем размеры окна при изменении размера
function handleResize() {
    updateAllScreens();
    handleFullscreenChange();
}

// Инициализация при загрузке
window.addEventListener('load', function() {    
    document.addEventListener('dragstart', function(event) {
        event.preventDefault();
    });
    
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
    
    handleFullscreenChange(); // Без задержки
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

setInterval(handleFullscreenChange, 1000); // Оставляем для периодической проверки

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


const clickSound = new Audio('../../media/sfx/base_click.mp3');
let soundEnabled = false;

document.addEventListener('click', function enableSound() {
    soundEnabled = true;
    document.removeEventListener('click', enableSound);
    
    clickSound.play().catch(console.error);
});

document.addEventListener('click', () => {
    if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch(console.error);
    }
});

// Обработчик изменения размера экрана
function handleScreenSize() {
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    
    if (screenWidth < 1200) {
        document.body.classList.add('screen_is_small');
    } else {
        document.body.classList.remove('screen_is_small');
    }
}

// Вызываем при загрузке страницы
window.addEventListener('load', handleScreenSize);

// Вызываем при изменении размера окна
window.addEventListener('resize', handleScreenSize);