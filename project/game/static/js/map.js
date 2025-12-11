const minimapIcon = document.querySelector('.minimap-icon')
const tabletIcon = document.querySelector('.tablet-icon')
const map = document.querySelector('.map-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')
const shopArea = document.querySelector('.shop-area')
const bankArea = document.querySelector('.bank-area')
const startDayBtn = document.querySelector('.start-day-btn')
const progressBar = document.querySelector('.progress-bar')
const nextTierBtn = document.querySelector('.next-tier-btn')

minimapIcon.addEventListener('click', () => {
    map.classList.toggle('active')
    shopScreen.classList.toggle('brightness')
    moneyInfo.classList.toggle('brightness')
    pauseBtn.classList.toggle('brightness')
    tabletIcon.classList.toggle('brightness')
    startDayBtn.classList.toggle('brightness')
    progressBar.classList.toggle('brightness')
    nextTierBtn.classList.toggle('brightness')
})

pauseBtn.addEventListener('click', () => {
    minimapIcon.classList.add('brightness')
    map.classList.add('brightness')
    startDayBtn.classList.add('brightness')
    progressBar.classList.add('brightness')
    nextTierBtn.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    minimapIcon.classList.remove('brightness')
    map.classList.remove('brightness')  
    progressBar.classList.remove('brightness')
    nextTierBtn.classList.remove('brightness')
})

tomainMenuBtn.addEventListener('click', () => {
    minimapIcon.classList.remove('brightness')
    map.classList.remove('brightness')  
    progressBar.classList.remove('brightness')
    nextTierBtn.classList.remove('brightness')
})

shopArea.addEventListener('click', () => {
    tabletIcon.classList.remove('brightness')
    progressBar.classList.remove('brightness')
    nextTierBtn.classList.remove('brightness')
})