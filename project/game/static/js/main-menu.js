const newGameBtn = document.querySelector('.new-save-btn')
const mainScreen = document.querySelector('.main-screen')
const mainMenu = mainScreen.querySelector('.main-menu')
const createSaveMenu = document.querySelector('.create-save-menu')
const chooseSaveMenuBtn = mainMenu.querySelector('.continue-btn')
const chooseSaveMenu = document.querySelector('.choose-save-menu')

newGameBtn.addEventListener('click', () => {
    mainScreen.classList.add('brightness')
    mainMenu.classList.add('hidden')
    createSaveMenu.classList.add('active')
})

chooseSaveMenuBtn.addEventListener('click', () => {
    mainScreen.classList.add('brightness')
    chooseSaveMenu.classList.add('active')
    mainMenu.classList.add('hidden')
})

chooseSaveMenu.querySelector('.exit').addEventListener('click', () => {
    mainScreen.classList.remove('brightness')
    chooseSaveMenu.classList.remove('active')
    mainMenu.classList.remove('hidden')
})

createSaveMenu.querySelector('.exit').addEventListener('click', () => {
    mainScreen.classList.remove('brightness')
    createSaveMenu.classList.remove('active')
    mainMenu.classList.remove('hidden')
})

// Добавляем обработчик ко всем блокам
document.querySelectorAll('.save-block').forEach(block => {
    block.addEventListener('click', function(event) {
        // Предотвращаем всплытие события, если нужно
        event.stopPropagation();

        mainScreen.classList.add('brightness')
        mainMenu.classList.add('hidden')
        createSaveMenu.classList.add('active')

        chooseSaveMenu.classList.remove('active')
    });
});

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

// Функция для загрузки сохранения
async function loadSave(saveKey) {
    try {
        // Получаем данные сохранения
        const response = await fetch(`/api/get_save_data/?save_key=${saveKey}`);
        const result = await response.json();
        
        if (!result.success) {
            console.error('Ошибка загрузки сохранения:', result.error);
            return;
        }
        
        const saveData = result.save_data;
        
        // Сохраняем во временный JSON файл
        const csrftoken = getCookie('csrftoken');
        await fetch('/api/save_temp_json/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(saveData)
        });
        
        // Обновляем игровые данные на странице
        updateGameData(saveData);
        
        return saveData;
    } catch (error) {
        console.error('Ошибка при загрузке сохранения:', error);
    }
}

// Функция для обновления игровых данных на странице
function updateGameData(saveData, screenSelector = null) {
    // Если указан селектор экрана, обновляем на нем, иначе на активном
    const selector = screenSelector || '.active_shop';
    const screen = screenSelector ? document.querySelector(screenSelector) : document.querySelector(selector);
    
    if (screen) {
        // Обновляем деньги, если есть элемент
        const moneyElement = screen.querySelector('.money');
        if (moneyElement && saveData.capital !== undefined) {
            moneyElement.textContent = saveData.capital;
        }
    } else {
        // Fallback: ищем на активном экране
        const moneyElement = document.querySelector('.active_shop .money');
        if (moneyElement && saveData.capital !== undefined) {
            moneyElement.textContent = saveData.capital;
        }
    }
    
    // Можно добавить обновление других данных здесь
    // Например, день, имя персонажа и т.д.
}

// Функция для загрузки временного JSON при загрузке страницы
async function loadTempJsonOnStart() {
    try {
        const response = await fetch('/api/load_temp_json/');
        const result = await response.json();
        
        if (result.success && result.data) {
            updateGameData(result.data);
            
            // Переключаем экран, если указан shop
            if (result.data.shop) {
                const targetScreen = `${result.data.shop}_shop`;
                if (typeof switchScreen === 'function') {
                    switchScreen(targetScreen);
                } else {
                    document.querySelectorAll('.screen').forEach(screen => {
                        screen.classList.remove('active', 'active_shop');
                    });
                    const targetScreenElement = document.querySelector(`.${targetScreen}`);
                    if (targetScreenElement) {
                        targetScreenElement.classList.add('active', 'active_shop');
                    }
                }
            }
        }
    } catch (error) {
        // Временный JSON может не существовать, это нормально
        console.log('Временный JSON не найден или ошибка загрузки:', error);
    }
}

// Загружаем временный JSON при загрузке страницы
window.addEventListener('load', () => {
    loadTempJsonOnStart();
});

document.querySelectorAll('.choose-save-block').forEach(block => {
    block.addEventListener('click', async function(event) {
        // Предотвращаем всплытие события, если нужно
        event.stopPropagation();
        
        const saveKey = this.getAttribute('data-save-key');
        const targetScreen = this.getAttribute('data-screen-target');
        
        if (saveKey) {
            // Загружаем сохранение
            await loadSave(saveKey);
            
            // Переключаем экран, если указан
            if (targetScreen) {
                // Используем функцию switchScreen из base.js
                if (typeof switchScreen === 'function') {
                    switchScreen(targetScreen);
                } else {
                    // Если функция недоступна, используем стандартный способ
                    document.querySelectorAll('.screen').forEach(screen => {
                        screen.classList.remove('active', 'active_shop');
                    });
                    const targetScreenElement = document.querySelector(`.${targetScreen}`);
                    if (targetScreenElement) {
                        targetScreenElement.classList.add('active', 'active_shop');
                    }
                }
            }
        }
        
        // Закрываем меню
        mainScreen.classList.remove('brightness')
        mainMenu.classList.remove('hidden')
        createSaveMenu.classList.remove('active')
        chooseSaveMenu.classList.remove('active')
    });
});