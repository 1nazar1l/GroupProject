const pauseBtn = document.querySelector('.pause-btn')
const activeScreen = document.querySelector('.active_shop')
const moneyInfo = document.querySelector('.active_shop .money-info')
const pauseMenu = document.querySelector('.pause-menu')
const continueMenuBtn = pauseMenu.querySelector('.continue-btn')
const tomainMenuBtn = pauseMenu.querySelector('.main-screen-btn')
const settingsMenuBtn = pauseMenu.querySelector('.settings-btn')
const progressBar = document.querySelector('.progress-bar')
const nextTierBtn = document.querySelector('.next-tier-btn')

pauseBtn.addEventListener('click', () => {
    activeScreen.classList.add('brightness')
    pauseBtn.classList.add('brightness')
    moneyInfo.classList.add('brightness')
    pauseMenu.classList.add('active')
    progressBar.classList.add('brightness')
    nextTierBtn.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    pauseMenu.classList.remove('active')
    activeScreen.classList.remove('brightness')
    moneyInfo.classList.remove('brightness')
    pauseBtn.classList.remove('brightness')
    progressBar.classList.remove('brightness')
    nextTierBtn.classList.remove('brightness')
})

tomainMenuBtn.addEventListener('click', () => {
    activeScreen.classList.remove('brightness')
    moneyInfo.classList.remove('brightness')  
    progressBar.classList.remove('brightness')
    nextTierBtn.classList.remove('brightness')
})