const newGameBtn = document.querySelector('.new-game-btn')
const registrationMenu = document.querySelector('.registration-menu')
const exitBtn = registrationMenu.querySelector('.exit-btn')
const mainScreen = document.querySelector('.main-screen')
const mainMenu = mainScreen.querySelector('.main-menu')


newGameBtn.addEventListener('click', () => {
    registrationMenu.classList.add('active')
    mainScreen.classList.add('brightness')
    mainMenu.classList.add('hidden')
})
exitBtn.addEventListener('click', () => {
    registrationMenu.classList.remove('active')
    mainScreen.classList.remove('brightness')
    mainMenu.classList.remove('hidden')
})

