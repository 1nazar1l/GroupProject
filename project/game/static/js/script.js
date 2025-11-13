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
});

window.addEventListener('resize', updateAllScreens);

// Наблюдатель за изменениями размеров
const observer = new ResizeObserver(updateAllScreens);
document.querySelectorAll('.background').forEach(img => {
    observer.observe(img);
});