const minimapIcon = document.querySelector('.minimap-icon')
const map = document.querySelector('.map-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')
const shopArea = document.querySelector('.shop-area')
const bankArea = document.querySelector('.bank-area')
const startDayBtn = document.querySelector('.start-day-btn')
const clock = document.querySelector('.clock');

pauseBtn.addEventListener('click', () => {
    clock.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    clock.classList.remove('brightness')
})

tomainMenuBtn.addEventListener('click', () => {
    clock.classList.remove('brightness')
})

let peoples = {};
let maxPeoplesPerDay = 0;
let todayPeoples = 0;
let arrivalTimes = []; // Массив времен прибытия покупателей

// Функция для генерации случайного числа в диапазоне
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция для форматирования времени (часы:минуты)
function formatTime(num) {
    return num < 10 ? '0' + num : num;
}

// Функция для генерации случайного времени между 9:00 и 21:00
function generateRandomTime() {
    const hour = getRandomInt(9, 20);
    const minute = getRandomInt(0, 59);
    
    return {
        hour: hour,
        minute: minute,
        formatted: `${formatTime(hour)}:${formatTime(minute)}`
    };
}

// Функция для генерации имен покупателей
function generatePeopleName(index) {
    const names = [
        "Алексей", "Мария", "Дмитрий", "Анна", "Сергей", 
        "Елена", "Андрей", "Ольга", "Иван", "Наталья",
        "Михаил", "Татьяна", "Владимир", "Юлия", "Павел",
        "Александра", "Николай", "Ирина", "Артем", "Екатерина"
    ];
    
    const randomNameIndex = getRandomInt(0, names.length - 1);
    return names[randomNameIndex];
}

// Функция для генерации покупателей на день
function generatePeoplesForDay() {
    peoples = {};
    arrivalTimes = []; // Очищаем массив времен
    maxPeoplesPerDay = getRandomInt(8, 10);
    todayPeoples = 0;
    
    console.log(`На сегодня ${maxPeoplesPerDay} покупателей`);
    
    for (let i = 1; i <= maxPeoplesPerDay; i++) {
        const time = generateRandomTime();
        
        peoples[`people${i}`] = {
            "name": generatePeopleName(i),
            "time": time.formatted,
            "hour": time.hour,
            "minute": time.minute,
            "hasVisited": false,
            "isActive": false
        };
        
        // Добавляем время в массив для быстрой проверки
        arrivalTimes.push(time.formatted);
    }
    
    // Сортируем времена прибытия
    sortPeoplesByTime();
    
    console.log("Времена прибытия покупателей:", arrivalTimes);
    console.log("Сгенерированные покупатели:", peoples);
    
    return peoples;
}

// Функция для сортировки покупателей по времени
function sortPeoplesByTime() {
    // Сортируем arrivalTimes
    arrivalTimes.sort((a, b) => {
        const [hoursA, minutesA] = a.split(':').map(Number);
        const [hoursB, minutesB] = b.split(':').map(Number);
        return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
    });
    
    // Сортируем сам объект peoples
    const peoplesArray = Object.entries(peoples);
    peoplesArray.sort((a, b) => {
        const timeA = a[1].hour * 60 + a[1].minute;
        const timeB = b[1].hour * 60 + b[1].minute;
        return timeA - timeB;
    });
    
    peoples = {};
    peoplesArray.forEach(([key, value], index) => {
        peoples[`people${index + 1}`] = value;
    });
}

// Упрощенная проверка прибытия покупателей
function checkPeoplesArrivalSimple(currentTime) {
    // Проверяем, есть ли текущее время в массиве времен прибытия
    if (arrivalTimes.includes(currentTime)) {
        // Находим всех покупателей с таким временем
        Object.keys(peoples).forEach(key => {
            const person = peoples[key];
            
            if (person.time === currentTime && !person.hasVisited && !person.isActive) {
                // Активируем покупателя
                person.isActive = true;
                todayPeoples++;
                
                console.log(`⚠️ Покупатель прибыл! Имя: ${person.name}, Время: ${person.time}`);
                console.log(`Осталось покупателей сегодня: ${maxPeoplesPerDay - todayPeoples}`);
                
                // Удаляем время из массива, чтобы не проверять снова
                const index = arrivalTimes.indexOf(currentTime);
                if (index > -1) {
                    arrivalTimes.splice(index, 1);
                }
            }
        });
    }
}

// Функция для отметки покупателя как обслуженного
function markPeopleAsServed(peopleId) {
    if (peoples[peopleId]) {
        peoples[peopleId].hasVisited = true;
        peoples[peopleId].isActive = false;
        console.log(`✅ Покупатель ${peoples[peopleId].name} обслужен`);
    }
}

// Функция для получения активных покупателей
function getActivePeoples() {
    return Object.keys(peoples).filter(key => 
        peoples[key].isActive && !peoples[key].hasVisited
    );
}

// Функция для получения следующего покупателя
function getNextPeople() {
    const activePeoples = getActivePeoples();
    if (activePeoples.length > 0) {
        return peoples[activePeoples[0]];
    }
    return null;
}

// Функция для сброса дня
function resetDay() {
    Object.keys(peoples).forEach(key => {
        peoples[key].hasVisited = false;
        peoples[key].isActive = false;
    });
    
    todayPeoples = 0;
    console.log("День сброшен");
}

// Функция для проверки нового дня
function checkNewDay(currentHour, currentMinute) {
    if (currentHour === 9 && currentMinute === 0) {
        generatePeoplesForDay();
        console.log("🎉 Начался новый рабочий день!");
    }
    
    if (currentHour === 21) {
        console.log("🏪 Рабочий день окончен");
        
        const servedCount = Object.keys(peoples).filter(key => 
            peoples[key].hasVisited
        ).length;
        
        console.log(`📊 Статистика за день:`);
        console.log(`   Всего покупателей: ${maxPeoplesPerDay}`);
        console.log(`   Обслужено: ${servedCount}`);
        console.log(`   Пропущено: ${maxPeoplesPerDay - servedCount}`);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Генерируем покупателей на первый день
    generatePeoplesForDay();
    
    let lastCheckedTime = '';
    
    // Проверяем каждую секунду (или чаще, если нужно)
    setInterval(function() {
        const clockElement = document.querySelector('.clock span');
        if (!clockElement) return;
        
        const currentTime = clockElement.textContent;
        
        // Проверяем только если время изменилось
        if (currentTime !== lastCheckedTime) {
            lastCheckedTime = currentTime;
            
            const [currentHour, currentMinute] = currentTime.split(':').map(Number);
            
            // Проверяем новый день
            checkNewDay(currentHour, currentMinute);
            
            // Упрощенная проверка прибытия покупателей
            checkPeoplesArrivalSimple(currentTime);
            
            // Если магазин закрыт, сбрасываем активных
            if (currentHour >= 21) {
                Object.keys(peoples).forEach(key => {
                    if (peoples[key].isActive) {
                        peoples[key].isActive = false;
                        console.log(`⏰ Магазин закрыт, покупатель ${peoples[key].name} ушел`);
                    }
                });
                arrivalTimes = []; // Очищаем оставшиеся времена
            }
        }
    }, 1000); // Проверяем каждую секунду
    
    // Быстрая проверка после загрузки
    setTimeout(function() {
        const clockElement = document.querySelector('.clock span');
        if (clockElement) {
            const currentTime = clockElement.textContent;
            checkPeoplesArrivalSimple(currentTime);
        }
    }, 500);
});

