const tabletIcon = document.querySelector('.tablet-icon')
const mapIcon = document.querySelector('.minimap-icon')
const tablet = document.querySelector('.tablet-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')

const tabletMainIcon = document.querySelector('.tablet-shop-icon')
const tabletOrderIcon = document.querySelector('.tablet-order-icon')
const tabletMessageIcon = document.querySelector('.tablet-message-icon')
const tabletSettingsIcon = document.querySelector('.tablet-settings-icon')

const tabletShopScreen = document.querySelector('.tablet-shop-screen')
const tabletOrderScreen = document.querySelector('.tablet-order-screen')
const tabletMessageScreen = document.querySelector('.tablet-messages-screen')
const tabletSettingsScreen = document.querySelector('.tablet-settings-screen')

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

tabletMainIcon.addEventListener('click', () => {
    tabletMainIcon.classList.add('active')
    tabletOrderIcon.classList.remove('active')
    tabletMessageIcon.classList.remove('active')
    tabletSettingsIcon.classList.remove('active')

    tabletShopScreen.classList.add('active')
    tabletOrderScreen.classList.remove('active')
    tabletMessageScreen.classList.remove('active')
    tabletSettingsScreen.classList.remove('active')
})

tabletOrderIcon.addEventListener('click', () => {
    tabletMainIcon.classList.remove('active')
    tabletOrderIcon.classList.add('active')
    tabletMessageIcon.classList.remove('active')
    tabletSettingsIcon.classList.remove('active')

    tabletShopScreen.classList.remove('active')
    tabletOrderScreen.classList.add('active')
    tabletMessageScreen.classList.remove('active')
    tabletSettingsScreen.classList.remove('active')
})

tabletMessageIcon.addEventListener('click', () => {
    tabletMainIcon.classList.remove('active')
    tabletOrderIcon.classList.remove('active')
    tabletMessageIcon.classList.add('active')
    tabletSettingsIcon.classList.remove('active')

    tabletShopScreen.classList.remove('active')
    tabletOrderScreen.classList.remove('active')
    tabletMessageScreen.classList.add('active')
    tabletSettingsScreen.classList.remove('active')
})

tabletSettingsIcon.addEventListener('click', () => {
    tabletMainIcon.classList.remove('active')
    tabletOrderIcon.classList.remove('active')
    tabletMessageIcon.classList.remove('active')
    tabletSettingsIcon.classList.add('active')

    tabletShopScreen.classList.remove('active')
    tabletOrderScreen.classList.remove('active')
    tabletMessageScreen.classList.remove('active')
    tabletSettingsScreen.classList.add('active')
})