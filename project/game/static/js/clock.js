function formatTime(num) {
    return num < 10 ? '0' + num : num;
}

function updateClock() {
    const clockElement = document.querySelector('.clock span');
    if (!clockElement) return;
    
    const currentTime = clockElement.textContent;
    const [hours, minutes] = currentTime.split(':').map(Number);
    
    let newHours = hours;
    let newMinutes = minutes + 3;
    
    if (newMinutes >= 60) {
        newMinutes = 0;
        newHours += 1;
        
        if (newHours >= 24) {
            newHours = 0;
        }
    }
    
    clockElement.textContent = `${formatTime(newHours)}:${formatTime(newMinutes)}`;
    
    // Проверяем и обновляем фон при изменении времени
    updateBackground(newHours);
}

function updateBackground(hours) {
    const backgroundElement = document.querySelector('.background');
    if (!backgroundElement) return;
    
    const currentSrc = backgroundElement.src;
    
    // Определяем время суток
    let timeOfDay = '';
    if (hours >= 21 || hours < 6) {
        timeOfDay = '-evening';
    } else if (hours >= 12 && hours < 18) {
        timeOfDay = '';
    } else {
        timeOfDay = '-morning';
    }
    
    // Универсальная замена для любых расширений изображений
    const basePath = currentSrc.replace(/(-morning|-evening)?(\.[a-zA-Z]+)$/, '');
    const extension = currentSrc.match(/\.[a-zA-Z]+$/)?.[0] || '.jpg';
    const newSrc = basePath + timeOfDay + extension;
    
    if (currentSrc !== newSrc) {
        backgroundElement.src = newSrc;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const clockElement = document.querySelector('.clock span');
    if (clockElement && clockElement.textContent.trim() === '') {
        clockElement.textContent = '09:00';
    }
    
    // Устанавливаем начальный фон
    const clockSpan = document.querySelector('.clock span');
    if (clockSpan) {
        const [hours] = clockSpan.textContent.split(':').map(Number);
        updateBackground(hours);
    }
});

setInterval(updateClock, 1000);