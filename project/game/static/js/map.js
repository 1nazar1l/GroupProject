const minimapIcon = document.querySelector('.minimap-icon')
const map = document.querySelector('.map-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')
const shopArea = document.querySelector('.shop-area')
const bankArea = document.querySelector('.bank-area')


minimapIcon.addEventListener('click', () => {
    map.classList.toggle('active')
    shopScreen.classList.toggle('brightness')
    moneyInfo.classList.toggle('brightness')
    pauseBtn.classList.toggle('brightness')
})

pauseBtn.addEventListener('click', () => {
    minimapIcon.classList.add('brightness')
    map.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    minimapIcon.classList.remove('brightness')
    map.classList.remove('brightness')  
})

tomainMenuBtn.addEventListener('click', () => {
    minimapIcon.classList.remove('brightness')
    map.classList.remove('brightness')  
})