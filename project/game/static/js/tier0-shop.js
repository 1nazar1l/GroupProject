const pauseBtn = document.querySelector('.pause-btn')
const activeScreen = document.querySelector('.active_shop')
const pauseMenu = document.querySelector('.pause-menu')
const continueMenuBtn = pauseMenu.querySelector('.continue-btn')
const tomainMenuBtn = pauseMenu.querySelector('.main-screen-btn')
const settingsMenuBtn = pauseMenu.querySelector('.settings-btn')
const moneyInfo = document.querySelector('.active_shop .money-info')
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

brushArea.addEventListener('click', (e) => {
    e.preventDefault(); // Отменяем стандартное поведение
    
    brush.classList.add('active');
    brushArea.classList.add('hidden');
    
    setTimeout(() => {
        brush.classList.remove('active');
        document.getElementById('nextTierForm').submit(); // Отправляем форму
    }, 2000);
});
