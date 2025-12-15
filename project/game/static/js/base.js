function syncContentWithImage(screenClass) {
    const screen = document.querySelector(`.${screenClass}`);
    if (!screen) return;
    
    const background = screen.querySelector('.background');
    const content = screen.querySelector('.content');
    
    if (!background || !content) return;
    
    const imgRect = background.getBoundingClientRect();
    content.style.width = imgRect.width + 'px';
    content.style.height = imgRect.height + 'px';
    content.style.position = 'absolute';
    content.style.left = '50%';
    content.style.transform = 'translateX(-50%)';
    
    if (!background.complete) {
        background.addEventListener('load', function() {
            const rect = background.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                content.style.width = rect.width + 'px';
                content.style.height = rect.height + 'px';
            }
        }, { once: true });
    }
}

function switchScreen(toScreenClass) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.querySelector('.pause-menu').classList.remove('active');
    
    const toScreen = document.querySelector(`.${toScreenClass}`);
    if (toScreen) {
        toScreen.classList.add('active');
        syncContentWithImage(toScreenClass);
    }
}

function updateAllScreens() {
    const screens = [
        "main-screen", 
        "tier0_shop", 
        "tier0_5_shop", 
        "tier1_shop", 
        "bank", 
        "casino", 
        "tier2_shop", 
        "tier3_shop", 
        "tier4_shop",
        "tier5_shop", 
        "tier6_shop", 
        "tier7_shop",
        "tier8_shop", 
        "tier9_shop", 
        "gameplay"
    ];
    screens.forEach(screenClass => {
        syncContentWithImage(screenClass);
    });
}

function isFullscreen() {
    return !!(document.fullscreenElement || 
              document.webkitFullscreenElement ||
              document.mozFullScreenElement ||
              document.msFullscreenElement ||
              window.innerHeight === screen.height);
}

function toggleFullscreen() {
    if (!isFullscreen()) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function handleFullscreenChange() {
    const fullscreen = isFullscreen();
    
    document.body.classList.toggle('fullscreen-mode', fullscreen);
    
    updateAllScreens();
    
    document.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.textContent = fullscreen ? 'Обычный экран' : 'Полный экран';
    });
}

function handleKeyPress(event) {
    if (event.key === 'F11') {
        handleFullscreenChange(); 
    }
}

function handleResize() {
    updateAllScreens();
    handleFullscreenChange();
}

window.addEventListener('load', function() {    
    document.addEventListener('dragstart', function(event) {
        event.preventDefault();
    });
    
    updateAllScreens();
    
    document.querySelectorAll('[data-screen-target]').forEach(button => {
        button.addEventListener('click', function() {
            const targetScreen = this.getAttribute('data-screen-target');
            switchScreen(targetScreen);
        });
    });
    
    document.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.addEventListener('click', toggleFullscreen);
    });
    
    handleFullscreenChange(); 
});

window.addEventListener('resize', handleResize);

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

document.addEventListener('keydown', handleKeyPress);

const observer = new ResizeObserver(updateAllScreens);
document.querySelectorAll('.background').forEach(img => {
    observer.observe(img);
});

setInterval(handleFullscreenChange, 1000); 

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


const clickSound = new Audio('../../media/sfx/base_click.mp3');
let soundEnabled = false;

document.addEventListener('click', function enableSound() {
    soundEnabled = true;
    document.removeEventListener('click', enableSound);
    
    clickSound.play().catch(console.error);
});

document.addEventListener('click', () => {
    if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch(console.error);
    }
});

function handleScreenSize() {
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    
    if (screenWidth < 1200) {
        document.body.classList.add('screen_is_small');
    } else {
        document.body.classList.remove('screen_is_small');
    }
}

window.addEventListener('load', handleScreenSize);
window.addEventListener('resize', handleScreenSize);