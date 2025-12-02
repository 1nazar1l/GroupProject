const updateWallpaperBtn = document.querySelector('.update-wallpaper-btn')
const brushBtn = updateWallpaperBtn.querySelector('.brush-img')
const confirmBlock = updateWallpaperBtn.querySelector('.confirm-block')
const money = document.querySelector('#money')

brushBtn.addEventListener('click', () => {
    brushBtn.classList.remove('active')
    confirmBlock.classList.add('active')
})

confirmBlock.addEventListener('click', () => {
    money.value = money.value - 150
    setTimeout(() => {
        document.getElementById('nextTierForm').submit();
    }, 2000);
})