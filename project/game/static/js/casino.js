const minimapIcon = document.querySelector('.minimap-icon')
const map = document.querySelector('.map-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')
const shopArea = document.querySelector('.shop-area')
const bankArea = document.querySelector('.bank-area')
const casinoArea = document.querySelector('.casino-area')

const triangle = document.querySelector('.triangle')
const wheel = document.querySelector('.wheel')
const betValues = document.querySelector('.bet-values')

pauseBtn.addEventListener('click', () => {
    triangle.classList.add('brightness')
    wheel.classList.add('brightness')
    betValues.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    triangle.classList.remove('brightness')
    wheel.classList.remove('brightness')
    betValues.classList.remove('brightness')
})

minimapIcon.addEventListener('click', () => {
    triangle.classList.toggle('brightness')
    wheel.classList.toggle('brightness')
    betValues.classList.toggle('brightness')
})

casinoArea.addEventListener('click', () => {
    map.classList.remove('active')
    shopScreen.classList.remove('brightness')
    moneyInfo.classList.remove('brightness')
    pauseBtn.classList.remove('brightness')

    triangle.classList.remove('brightness')
    wheel.classList.remove('brightness')
    betValues.classList.remove('brightness')
})

const wheelContent = document.querySelector('.wheel-content');
const balanceInput = document.getElementById('casino_balance');
const betButtons = document.querySelectorAll('.bet-values .bet');
const casinoForm = document.getElementById('casino_reload_form');
const moneyDisplay = document.querySelector('.money');

wheelContent.style.animation = 'none';

let isSpinning = false;

// Звуки
const spinSound = new Audio('../../media/sfx/circle-spin.mp3');
const winSound = new Audio('../../media/sfx/win.mp3');
const loseSound = new Audio('../../media/sfx/lose.mp3');

// Настройка звуков
spinSound.loop = true; // Звук вращения должен зацикливаться

// Функция для обновления состояния кнопок ставок
function updateBetButtonsState() {
    const currentBalance = parseInt(balanceInput.value) || 0;
    
    betButtons.forEach(button => {
        const betText = button.textContent.trim();
        const betAmount = parseInt(betText);
        
        if (isNaN(betAmount) || betAmount <= 0) return;
        
        // Блокируем кнопку, если недостаточно средств
        if (currentBalance < betAmount) {
            button.style.opacity = '0.5';
            button.style.pointerEvents = 'none';
            button.style.cursor = 'not-allowed';
        } else {
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
        }
    });
}

// Функция для отправки формы
function saveBalance() {
    if (casinoForm) {
        const formData = new FormData(casinoForm);
        const url = casinoForm.action;
        
        // Используем navigator.sendBeacon для надежной отправки
        // Это гарантирует отправку даже при закрытии страницы
        if (navigator.sendBeacon) {
            const data = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                data.append(key, value);
            }
            // Отправляем как Blob для поддержки POST
            const blob = new Blob([data.toString()], { type: 'application/x-www-form-urlencoded' });
            navigator.sendBeacon(url, blob);
        } else {
            // Fallback для старых браузеров - используем синхронный XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, false); // false = синхронный запрос
            xhr.send(formData);
        }
    }
}

// Отправка формы при обновлении страницы
window.addEventListener('beforeunload', function(e) {
    saveBalance();
});

function spinWheel(finalDegrees, callback) {
    const spins = 5; 
    const totalDegrees = (spins * 360) + finalDegrees;

    // Запускаем звук вращения
    spinSound.currentTime = 0;
    spinSound.play().catch(err => {
        console.log('Ошибка воспроизведения звука вращения:', err);
    });

    wheelContent.style.transition = 'transform 10s cubic-bezier(0.1, 0.9, 0.3, 1)';
    wheelContent.style.transform = `rotate(-${totalDegrees}deg)`;
    
    setTimeout(() => {
        wheelContent.style.transition = 'none';
        wheelContent.style.transform = `rotate(-${finalDegrees}deg)`;
        
        // Останавливаем звук вращения
        spinSound.pause();
        spinSound.currentTime = 0;
        
        // Вычисляем сектор
        let sector = (finalDegrees / 30) + 1;
        let sectorRemainder = (sector % 1) * 100;
        
        if (sectorRemainder >= 50) {
            sector += 1;
        }
        
        sector = Math.trunc(sector);
        
        if (callback) {
            callback(sector);
        }
    }, 10000);
}

// Обработчики для кнопок ставок
betButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (isSpinning) return; // Предотвращаем повторные клики во время вращения
        
        const betText = this.textContent.trim();
        const betAmount = parseInt(betText);
        
        if (isNaN(betAmount) || betAmount <= 0) return;
        
        // Получаем текущий баланс
        let currentBalance = parseInt(balanceInput.value) || 0;
        
        // Проверяем, достаточно ли средств
        if (currentBalance < betAmount) {
            alert(`Недостаточно средств! Ваш баланс: ${currentBalance}$, ставка: ${betAmount}$`);
            return;
        }
        
        // Уменьшаем баланс на ставку
        currentBalance -= betAmount;
        balanceInput.value = currentBalance;
        
        // Обновляем отображение денег на странице
        if (moneyDisplay) {
            moneyDisplay.textContent = currentBalance;
        }
        
        // Обновляем состояние кнопок ставок
        updateBetButtonsState();
        
        // Сохраняем баланс сразу после ставки
        saveBalance();
        
        // Запускаем вращение
        isSpinning = true;
        const randomAngle = Math.floor(Math.random() * 360);
        
        spinWheel(randomAngle, function(sector) {
            // После завершения вращения проверяем четность сектора
            if (sector % 2 === 0) {
                // Четное - выигрыш: увеличиваем баланс на удвоенную ставку
                currentBalance += betAmount * 2;
                balanceInput.value = currentBalance;
                
                // Обновляем отображение денег на странице
                if (moneyDisplay) {
                    moneyDisplay.textContent = currentBalance;
                }
                
                // Воспроизводим звук выигрыша
                winSound.currentTime = 0;
                winSound.play().catch(err => {
                    console.log('Ошибка воспроизведения звука выигрыша:', err);
                });
                
                console.log(`Выигрыш! Сектор ${sector} (четный). Баланс: ${currentBalance}`);
            } else {
                // Нечетное - проигрыш: баланс остается прежним
                
                // Воспроизводим звук проигрыша
                loseSound.currentTime = 0;
                loseSound.play().catch(err => {
                    console.log('Ошибка воспроизведения звука проигрыша:', err);
                });
                
                console.log(`Проигрыш. Сектор ${sector} (нечетный). Баланс: ${currentBalance}`);
            }
            
            // Обновляем состояние кнопок ставок после изменения баланса
            updateBetButtonsState();
            
            // Сохраняем баланс после завершения игры
            saveBalance();
            
            isSpinning = false;
        });
    });
});

// Инициализация состояния кнопок при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateBetButtonsState();
});