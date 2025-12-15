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

const spinSound = new Audio('../../media/sfx/circle-spin.mp3');
const winSound = new Audio('../../media/sfx/win.mp3');
const loseSound = new Audio('../../media/sfx/lose.mp3');

spinSound.loop = true;

function updateBetButtonsState() {
    const currentBalance = parseInt(balanceInput.value) || 0;
    
    betButtons.forEach(button => {
        const betText = button.textContent.trim();
        const betAmount = parseInt(betText);
        
        if (isNaN(betAmount) || betAmount <= 0) return;
        
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

function saveBalance() {
    if (casinoForm) {
        const formData = new FormData(casinoForm);
        const url = casinoForm.action;
        
        if (navigator.sendBeacon) {
            const data = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                data.append(key, value);
            }
            const blob = new Blob([data.toString()], { type: 'application/x-www-form-urlencoded' });
            navigator.sendBeacon(url, blob);
        } else {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, false); 
            xhr.send(formData);
        }
    }
}

window.addEventListener('beforeunload', function(e) {
    saveBalance();
});

function spinWheel(finalDegrees, callback) {
    const spins = 5; 
    const totalDegrees = (spins * 360) + finalDegrees;

    spinSound.currentTime = 0;
    spinSound.play().catch(err => {
        console.log('Ошибка воспроизведения звука вращения:', err);
    });

    wheelContent.style.transition = 'transform 10s cubic-bezier(0.1, 0.9, 0.3, 1)';
    wheelContent.style.transform = `rotate(-${totalDegrees}deg)`;
    
    setTimeout(() => {
        wheelContent.style.transition = 'none';
        wheelContent.style.transform = `rotate(-${finalDegrees}deg)`;
        
        spinSound.pause();
        spinSound.currentTime = 0;
        
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

betButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (isSpinning) return; 
        
        const betText = this.textContent.trim();
        const betAmount = parseInt(betText);
        
        if (isNaN(betAmount) || betAmount <= 0) return;
        
        let currentBalance = parseInt(balanceInput.value) || 0;
        
        if (currentBalance < betAmount) {
            alert(`Недостаточно средств! Ваш баланс: ${currentBalance}$, ставка: ${betAmount}$`);
            return;
        }
        
        currentBalance -= betAmount;
        balanceInput.value = currentBalance;
        
        if (moneyDisplay) {
            moneyDisplay.textContent = currentBalance;
        }
        
        updateBetButtonsState();
        saveBalance();
        
        isSpinning = true;
        const randomAngle = Math.floor(Math.random() * 360);
        
        spinWheel(randomAngle, function(sector) {
            if (sector % 2 === 0) {
                currentBalance += betAmount * 2;
                balanceInput.value = currentBalance;
                
                if (moneyDisplay) {
                    moneyDisplay.textContent = currentBalance;
                }
                
                winSound.currentTime = 0;
                winSound.play().catch(err => {
                    console.log('Ошибка воспроизведения звука выигрыша:', err);
                });
                
                console.log(`Выигрыш! Сектор ${sector} (четный). Баланс: ${currentBalance}`);
            } else {
                loseSound.currentTime = 0;
                loseSound.play().catch(err => {
                    console.log('Ошибка воспроизведения звука проигрыша:', err);
                });
                
                console.log(`Проигрыш. Сектор ${sector} (нечетный). Баланс: ${currentBalance}`);
            }
            
            updateBetButtonsState();
            saveBalance();
            
            isSpinning = false;
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    updateBetButtonsState();
});