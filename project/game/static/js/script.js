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

const pauseBtn = document.querySelector('.pause-btn')
const activeScreen = pauseBtn.parentElement.parentElement.parentElement
const pauseMenu = document.querySelector('.pause-menu')
const continueMenuBtn = pauseMenu.querySelector('.continue-btn')
const tomainMenuBtn = pauseMenu.querySelector('.main-screen-btn')
const settingsMenuBtn = pauseMenu.querySelector('.settings-btn')
pauseBtn.addEventListener('click', () => {
    activeScreen.classList.toggle('brightness')
    pauseMenu.classList.toggle('active')
})
continueMenuBtn.addEventListener('click', () => {
    pauseMenu.classList.remove('active')
    activeScreen.classList.remove('brightness')
})
tomainMenuBtn.addEventListener('click', () => {
    activeScreen.classList.remove('brightness')
})

setInterval(handleFullscreenChange, 1000);