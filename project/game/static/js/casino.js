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

casinoArea.addEventListener('click', () => {
    map.classList.remove('active')
    shopScreen.classList.remove('brightness')
    moneyInfo.classList.remove('brightness')
    pauseBtn.classList.remove('brightness')
})

const wheelContent = document.querySelector('.wheel-content');
const balanceInput = document.getElementById('casino_balance');
const betButtons = document.querySelectorAll('.bet-values .bet');
const casinoForm = document.getElementById('casino_reload_form');
const moneyDisplay = document.querySelector('.money');

wheelContent.style.animation = 'none';

let isSpinning = false;

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

    wheelContent.style.transition = 'transform 10s cubic-bezier(0.1, 0.9, 0.3, 1)';
    wheelContent.style.transform = `rotate(-${totalDegrees}deg)`;
    
    setTimeout(() => {
        wheelContent.style.transition = 'none';
        wheelContent.style.transform = `rotate(-${finalDegrees}deg)`;
        
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
            console.log('Недостаточно средств');
            return;
        }
        
        // Уменьшаем баланс на ставку
        currentBalance -= betAmount;
        balanceInput.value = currentBalance;
        
        // Обновляем отображение денег на странице
        if (moneyDisplay) {
            moneyDisplay.textContent = currentBalance;
        }
        
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
                
                console.log(`Выигрыш! Сектор ${sector} (четный). Баланс: ${currentBalance}`);
            } else {
                // Нечетное - проигрыш: баланс остается прежним
                console.log(`Проигрыш. Сектор ${sector} (нечетный). Баланс: ${currentBalance}`);
            }
            
            // Сохраняем баланс после завершения игры
            saveBalance();
            
            isSpinning = false;
        });
    });
});