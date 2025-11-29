const pauseBtn = document.querySelector('.pause-btn')
const activeScreen = document.querySelector('.active_shop')
const pauseMenu = document.querySelector('.pause-menu')
const continueMenuBtn = pauseMenu.querySelector('.continue-btn')
const tomainMenuBtn = pauseMenu.querySelector('.main-screen-btn')
const settingsMenuBtn = pauseMenu.querySelector('.settings-btn')
const moneyInfo = document.querySelector('.active_shop .money-info')
const brushArea = document.querySelector('.brush_area')
const brush = document.querySelector('.brush')

pauseBtn.addEventListener('click', () => {
    activeScreen.classList.toggle('brightness')
    moneyInfo.classList.toggle('brightness')
    pauseMenu.classList.toggle('active')
})
continueMenuBtn.addEventListener('click', () => {
    pauseMenu.classList.remove('active')
    activeScreen.classList.remove('brightness')
    moneyInfo.classList.remove('brightness')
})
tomainMenuBtn.addEventListener('click', () => {
    activeScreen.classList.remove('brightness')
    moneyInfo.classList.remove('brightness')
    
})

brushArea.addEventListener('click', (e) => {
    e.preventDefault(); // Отменяем стандартное поведение
    
    brush.classList.add('active');
    brushArea.classList.add('hidden');
    
    setTimeout(() => {
        brush.classList.remove('active');
        document.getElementById('nextTierForm').submit(); // Отправляем форму
    }, 2000);
});