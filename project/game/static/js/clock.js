function formatTime(num) {
    return num < 10 ? '0' + num : num;
}

let clockInterval = null;
let isClockPaused = false;
let clockIntervalMs = 333;
const clockIntervalAfter21 = 1000;
let clockAfter21Activated = false;

function setClockInterval(ms) {
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    clockIntervalMs = ms;
    clockInterval = setInterval(updateClock, clockIntervalMs);
}

function updateClock() {
    const clockElement = document.querySelector('.clock span');
    if (!clockElement) return;
    
    const currentTime = clockElement.textContent;
    const [hours, minutes] = currentTime.split(':').map(Number);
    
    let newHours = hours;
    let newMinutes = minutes + 1;
    
    if (newMinutes >= 60) {
        newMinutes = 0;
        newHours += 1;
        
        if (newHours >= 24) {
            newHours = 0;
        }
    }
    
    clockElement.textContent = `${formatTime(newHours)}:${formatTime(newMinutes)}`;
    
    updateBackground(newHours);

    if (newHours >= 21 && !clockAfter21Activated) {
        clockAfter21Activated = true;
        setClockInterval(clockIntervalAfter21);
    }
}

function updateBackground(hours) {
    const backgroundElement = document.querySelector('.background');
    if (!backgroundElement) return;
    
    const currentSrc = backgroundElement.src;
    
    let timeOfDay = '';
    if (hours >= 21 || hours < 6) {
        timeOfDay = '-evening';
    } else if (hours >= 12 && hours < 18) {
        timeOfDay = '';
    } else {
        timeOfDay = '-morning';
    }
    
    const basePath = currentSrc.replace(/(-morning|-evening)?(\.[a-zA-Z]+)$/, '');
    const extension = currentSrc.match(/\.[a-zA-Z]+$/)?.[0] || '.jpg';
    const newSrc = basePath + timeOfDay + extension;
    
    if (currentSrc !== newSrc) {
        backgroundElement.src = newSrc;
    }
}

function startClock() {
    if (!clockInterval) {
        setClockInterval(clockIntervalMs);
        isClockPaused = false;
        console.log('Часы запущены');
    }
}

function stopClock() {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
        isClockPaused = true;
        console.log('Часы остановлены');
    }
}

function toggleClockPause() {
    if (isClockPaused) {
        startClock();
    } else {
        stopClock();
    }
}

function resumeClock() {
    if (isClockPaused) {
        startClock();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const clockElement = document.querySelector('.clock span');
    if (clockElement && clockElement.textContent.trim() === '') {
        clockElement.textContent = '09:00';
    }
    
    const clockSpan = document.querySelector('.clock span');
    if (clockSpan) {
        const [hours] = clockSpan.textContent.split(':').map(Number);
        updateBackground(hours);
    }
    
    startClock();
    
    const pauseBtn = document.querySelector('.pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', toggleClockPause);
    }
    
    const continueMenuBtn = document.querySelector('.continue-btn');
    if (continueMenuBtn) {
        continueMenuBtn.addEventListener('click', resumeClock);
    }
});