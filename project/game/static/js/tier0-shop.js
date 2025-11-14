const pauseBtn = document.querySelector('.pause-btn')
let activeScreen = pauseBtn.parentElement.parentElement.parentElement
const pauseMenu = document.querySelector('.pause-menu')
const continueMenuBtn = pauseMenu.querySelector('.continue-btn')
const tomainMenuBtn = pauseMenu.querySelector('.main-screen-btn')
const settingsMenuBtn = pauseMenu.querySelector('.settings-btn')
pauseBtn.addEventListener('click', () => {
    activeScreen.classList.toggle('brightness')
    pauseMenu.classList.toggle('active')
})
continueMenuBtn.addEventListener('click', () => {
    pauseMenu.classList.remove('active')
    activeScreen.classList.remove('brightness')
})
tomainMenuBtn.addEventListener('click', () => {
    activeScreen.classList.remove('brightness')
})