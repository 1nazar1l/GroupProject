import * as values from './base.js';

const pauseMenu = document.querySelector('.pause-menu')
const continueMenuBtn = pauseMenu.querySelector('.continue-btn')
const tomainMenuBtn = pauseMenu.querySelector('.main-screen-btn')
const settingsMenuBtn = pauseMenu.querySelector('.settings-btn')
const brushArea = document.querySelector('.brush_area')
const brush = document.querySelector('.brush')

// Функция для получения CSRF токена
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Функция для получения активного экрана и элементов
function getActiveShopElements() {
    // Ищем активный shop экран (может быть с классом active или active_shop)
    const activeScreen = document.querySelector('.screen.active.shop, .screen.active_shop.active, .screen.shop.active');
    if (!activeScreen) {
        // Fallback: ищем любой активный экран с кнопкой паузы
        const screens = document.querySelectorAll('.screen.active');
        for (const screen of screens) {
            if (screen.querySelector('.pause-btn')) {
                const pauseBtn = screen.querySelector('.pause-btn');
                const moneyInfo = screen.querySelector('.money-info');
                return { activeScreen: screen, pauseBtn, moneyInfo };
            }
        }
        return null;
    }
    
    const pauseBtn = activeScreen.querySelector('.pause-btn');
    const moneyInfo = activeScreen.querySelector('.money-info');
    
    return { activeScreen, pauseBtn, moneyInfo };
}

// Универсальный обработчик для всех кнопок паузы (делегирование событий)
document.addEventListener('click', (e) => {
    if (e.target.closest('.pause-btn')) {
        const elements = getActiveShopElements();
        if (elements) {
            elements.activeScreen.classList.toggle('brightness');
            if (elements.moneyInfo) {
                elements.moneyInfo.classList.toggle('brightness');
            }
            pauseMenu.classList.toggle('active');
        }
    }
});

continueMenuBtn.addEventListener('click', () => {
    const elements = getActiveShopElements();
    if (elements) {
        pauseMenu.classList.remove('active');
        elements.activeScreen.classList.remove('brightness');
        if (elements.moneyInfo) {
            elements.moneyInfo.classList.remove('brightness');
        }
    }
});

tomainMenuBtn.addEventListener('click', () => {
    const elements = getActiveShopElements();
    if (elements) {
        elements.activeScreen.classList.remove('brightness');
        if (elements.moneyInfo) {
            elements.moneyInfo.classList.remove('brightness');
        }
    }
})

brushArea.addEventListener('click', () => {
    brush.classList.add('active')
    brushArea.classList.add('hidden')
    setTimeout(async () => {
        brush.classList.remove('active')
        
        // Загружаем данные из временного JSON перед переключением
        let saveData = null;
        try {
            const response = await fetch('/api/load_temp_json/');
            const result = await response.json();
            if (result.success && result.data) {
                saveData = result.data;
            }
        } catch (error) {
            console.log('Ошибка загрузки временного JSON:', error);
        }
        
        // Обновляем тир магазина в сохранении
        if (saveData) {
            saveData.shop = "tier0_5";
            
            // Обновляем сохранение в базе данных
            try {
                const csrftoken = getCookie('csrftoken');
                await fetch('/api/update_save/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify({ shop: "tier0_5" })
                });
                
                // Обновляем временный JSON файл
                await fetch('/api/save_temp_json/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify(saveData)
                });
            } catch (error) {
                console.log('Ошибка обновления сохранения:', error);
            }
        }
        
        // Переключаем на экран tier0_5_shop
        if (typeof switchScreen === 'function') {
            switchScreen('tier0_5_shop');
            // Добавляем класс active_shop для shop экранов
            const tier0_5_shop = document.querySelector('.tier0_5_shop');
            if (tier0_5_shop) {
                tier0_5_shop.classList.add('active_shop');
                
                // Обновляем деньги на новом экране
                if (saveData && saveData.capital !== undefined) {
                    const moneyElement = tier0_5_shop.querySelector('.money');
                    if (moneyElement) {
                        moneyElement.textContent = saveData.capital;
                    }
                }
                
                // Дополнительная синхронизация после переключения с небольшой задержкой
                setTimeout(() => {
                    if (typeof syncContentWithImage === 'function') {
                        syncContentWithImage('tier0_5_shop');
                    }
                    // Повторно обновляем деньги после синхронизации
                    if (saveData && saveData.capital !== undefined) {
                        const moneyElement = tier0_5_shop.querySelector('.money');
                        if (moneyElement) {
                            moneyElement.textContent = saveData.capital;
                        }
                    }
                }, 100);
            }
        } else {
            // Fallback если switchScreen недоступна
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active', 'active_shop');
            });
            const tier0_5_shop = document.querySelector('.tier0_5_shop');
            if (tier0_5_shop) {
                tier0_5_shop.classList.add('active', 'active_shop');
                
                // Обновляем деньги на новом экране
                if (saveData && saveData.capital !== undefined) {
                    const moneyElement = tier0_5_shop.querySelector('.money');
                    if (moneyElement) {
                        moneyElement.textContent = saveData.capital;
                    }
                }
                
                setTimeout(() => {
                    if (typeof syncContentWithImage === 'function') {
                        syncContentWithImage('tier0_5_shop');
                    }
                    // Повторно обновляем деньги после синхронизации
                    if (saveData && saveData.capital !== undefined) {
                        const moneyElement = tier0_5_shop.querySelector('.money');
                        if (moneyElement) {
                            moneyElement.textContent = saveData.capital;
                        }
                    }
                }, 100);
            }
        }
    }, 2000);
})