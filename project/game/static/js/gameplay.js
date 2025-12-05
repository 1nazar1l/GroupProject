const minimapIcon = document.querySelector('.minimap-icon')
const map = document.querySelector('.map-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')
const shopArea = document.querySelector('.shop-area')
const bankArea = document.querySelector('.bank-area')
const startDayBtn = document.querySelector('.start-day-btn')
const clock = document.querySelector('.clock');

pauseBtn.addEventListener('click', () => {
    clock.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    clock.classList.remove('brightness')
})

tomainMenuBtn.addEventListener('click', () => {
    clock.classList.remove('brightness')
})