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

wheelContent.style.animation = 'none';

function spinWheel(finalDegrees) {
    const spins = 5; 
    const totalDegrees = (spins * 360) + finalDegrees;

    wheelContent.style.transition = 'transform 10s cubic-bezier(0.1, 0.9, 0.3, 1)';
    wheelContent.style.transform = `rotate(-${totalDegrees}deg)`;
    
    setTimeout(() => {
        wheelContent.style.transition = 'none';
        wheelContent.style.transform = `rotate(-${finalDegrees}deg)`;
    }, 10000);
}

const randomAngle = Math.floor(Math.random() * 360);
let sector = (randomAngle / 30) + 1
let sectorRemainder = (sector % 1) * 100

if (sectorRemainder >= 50) {
    sector += 1
}

sector = Math.trunc(sector)

spinWheel(randomAngle);