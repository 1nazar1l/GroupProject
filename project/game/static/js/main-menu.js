const newGameBtn = document.querySelector('.new-save-btn')
const mainScreen = document.querySelector('.main-screen')
const mainMenu = mainScreen.querySelector('.main-menu')
const createSaveMenu = document.querySelector('.create-save-menu')
const chooseSaveMenuBtn = mainMenu.querySelector('.continue-btn')
const chooseSaveMenu = document.querySelector('.choose-save-menu')

newGameBtn.addEventListener('click', () => {
    mainScreen.classList.add('brightness')
    mainMenu.classList.add('hidden')
    createSaveMenu.classList.add('active')
})

chooseSaveMenuBtn.addEventListener('click', () => {
    mainScreen.classList.add('brightness')
    chooseSaveMenu.classList.add('active')
    mainMenu.classList.add('hidden')
})

chooseSaveMenu.querySelector('.exit').addEventListener('click', () => {
    mainScreen.classList.remove('brightness')
    chooseSaveMenu.classList.remove('active')
    mainMenu.classList.remove('hidden')
})

createSaveMenu.querySelector('.exit').addEventListener('click', () => {
    mainScreen.classList.remove('brightness')
    createSaveMenu.classList.remove('active')
    mainMenu.classList.remove('hidden')
})