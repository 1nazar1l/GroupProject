const tabletIcon = document.querySelector('.tablet-icon')
const mapIcon = document.querySelector('.minimap-icon')
const tablet = document.querySelector('.tablet-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')

tabletIcon.addEventListener('click', () => {
    tablet.classList.toggle('active')
    shopScreen.classList.toggle('brightness')
    moneyInfo.classList.toggle('brightness')
    pauseBtn.classList.toggle('brightness')
    mapIcon.classList.toggle('brightness')
})

pauseBtn.addEventListener('click', () => {
    tabletIcon.classList.add('brightness')
    tablet.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    tabletIcon.classList.remove('brightness')
    tablet.classList.remove('brightness')  
})

tomainMenuBtn.addEventListener('click', () => {
    tabletIcon.classList.remove('brightness')
    tablet.classList.remove('brightness')  
})