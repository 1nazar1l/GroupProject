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

// Глобальные переменные
let filteredProducts = window.filteredProducts || {}; // Используем данные из window
let peoples = {};
let maxPeoplesPerDay = 0;
let todayPeoples = 0;
let arrivalTimes = [];

// Функция для получения случайных уникальных элементов из массива
function getRandomItems(array, count) {
    if (array.length === 0) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
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

// Функция для генерации списка покупок покупателя
function generatePurchaseList() {
    const items = [];
    let totalCost = 0;
    
    // Получаем доступные товары (только те, у которых count > 0)
    const availableProducts = Object.keys(filteredProducts).filter(productId => 
        filteredProducts[productId] && 
        filteredProducts[productId].count > 0
    );
    
    console.log('Доступные товары с количеством > 0:', availableProducts);
    
    if (availableProducts.length === 0) {
        console.log('Нет доступных товаров для покупки');
        return { items: [], totalCost: 0 };
    }
    
    // Определяем сколько товаров купит покупатель (1-4 или меньше)
    const maxItemsToBuy = Math.min(4, availableProducts.length);
    const itemsCount = getRandomInt(1, maxItemsToBuy);
    
    console.log(`Покупатель выберет ${itemsCount} товаров из ${availableProducts.length}`);
    
    // Выбираем случайные товары (без повторений)
    const selectedProducts = getRandomItems(availableProducts, itemsCount);
    
    console.log('Выбранные товары:', selectedProducts);
    
    // Для каждого выбранного товара определяем количество
    selectedProducts.forEach(productId => {
        const product = filteredProducts[productId];
        if (!product) return;
        
        const maxQuantity = Math.min(3, product.count || 0); // Не больше 3 и не больше доступного количества
        
        if (maxQuantity > 0) {
            const quantity = getRandomInt(1, maxQuantity);
            const itemCost = quantity * product.price;
            
            items.push({
                id: productId,
                name: product.name,
                quantity: quantity,
                price: product.price,
                total: itemCost
            });
            
            totalCost += itemCost;
            console.log(`Добавлен товар: ${product.name}, количество: ${quantity}, цена: ${product.price}`);
        }
    });
    
    console.log('Итоговый список покупок:', items);
    return { items, totalCost: Math.round(totalCost * 100) / 100 };
}

// Функция для генерации покупателей на день
function generatePeoplesForDay() {
    peoples = {};
    arrivalTimes = [];
    maxPeoplesPerDay = getRandomInt(8, 10);
    todayPeoples = 0;
    
    console.log(`На сегодня ${maxPeoplesPerDay} покупателей`);
    console.log('Текущие доступные товары:', filteredProducts);
    
    for (let i = 1; i <= maxPeoplesPerDay; i++) {
        const time = generateRandomTime();
        
        // Генерируем список покупок для покупателя
        const purchaseList = generatePurchaseList();
        
        peoples[`people${i}`] = {
            "name": generatePeopleName(i),
            "time": time.formatted,
            "hour": time.hour,
            "minute": time.minute,
            "hasVisited": false,
            "isActive": false,
            "purchases": purchaseList.items,
            "totalCost": purchaseList.totalCost
        };
        
        arrivalTimes.push(time.formatted);
    }
    
    sortPeoplesByTime();
    
    console.log("Сгенерированные покупатели:", peoples);
    return peoples;
}

// Функция для проверки, пришел ли покупатель
function checkPeoplesArrivalSimple(currentTime) {
    if (arrivalTimes.includes(currentTime)) {
        Object.keys(peoples).forEach(key => {
            const person = peoples[key];
            
            if (person.time === currentTime && !person.hasVisited && !person.isActive) {
                person.isActive = true;
                todayPeoples++;
                
                console.log(`⚠️ Покупатель прибыл! Имя: ${person.name}, Время: ${person.time}`);
                console.log(`Осталось покупателей сегодня: ${maxPeoplesPerDay - todayPeoples}`);
                
                // Показываем информацию о покупках
                if (person.purchases && person.purchases.length > 0) {
                    console.log('🛒 Список покупок:');
                    person.purchases.forEach((item, index) => {
                        console.log(`   ${index + 1}. ${item.name}: ${item.quantity} шт. × ${item.price}$ = ${item.total}$`);
                    });
                    console.log(`💰 Итого: ${person.totalCost}$`);
                } else {
                    console.log('🛒 Покупатель ничего не хочет покупать');
                }
                
                // Удаляем время из массива
                const index = arrivalTimes.indexOf(currentTime);
                if (index > -1) {
                    arrivalTimes.splice(index, 1);
                }
            }
        });
    }
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

// Функция для обновления количества товаров после покупки
function updateProductQuantity(productId, quantitySold) {
    if (filteredProducts[productId]) {
        filteredProducts[productId].count -= quantitySold;
        
        // Если товар закончился, удаляем его из доступных
        if (filteredProducts[productId].count <= 0) {
            delete filteredProducts[productId];
            console.log(`Товар ${productId} закончился`);
        }
        
        console.log(`Обновлено количество товара ${productId}: осталось ${filteredProducts[productId]?.count || 0}`);
    }
}

// Функция для обработки покупки покупателя
function processCustomerPurchase(peopleId) {
    const customer = peoples[peopleId];
    if (!customer || !customer.purchases || customer.purchases.length === 0) {
        return { success: false, message: "У покупателя нет покупок" };
    }
    
    let totalSold = 0;
    const soldItems = [];
    
    // Проверяем, все ли товары еще доступны в нужном количестве
    for (const purchase of customer.purchases) {
        const product = filteredProducts[purchase.id];
        if (!product || product.count < purchase.quantity) {
            return { 
                success: false, 
                message: `Недостаточно товара: ${purchase.name}` 
            };
        }
    }
    
    // Продаем товары
    for (const purchase of customer.purchases) {
        updateProductQuantity(purchase.id, purchase.quantity);
        totalSold += purchase.total;
        soldItems.push(purchase);
    }
    
    return {
        success: true,
        customerName: customer.name,
        soldItems: soldItems,
        totalAmount: totalSold
    };
}

// Функция для отметки покупателя как обслуженного
function markPeopleAsServed(peopleId) {
    if (peoples[peopleId]) {
        const result = processCustomerPurchase(peopleId);
        
        if (result.success) {
            peoples[peopleId].hasVisited = true;
            peoples[peopleId].isActive = false;
            
            console.log(`✅ Покупатель ${peoples[peopleId].name} обслужен`);
            console.log(`💰 Продано товаров на сумму: ${result.totalAmount}$`);
            console.log('📦 Проданные товары:', result.soldItems);
            
            return result;
        } else {
            console.log(`❌ Не удалось обслужить покупателя ${peoples[peopleId].name}: ${result.message}`);
            return result;
        }
    }
    return { success: false, message: "Покупатель не найден" };
}

// Функция для получения активных покупателей
function getActivePeoples() {
    return Object.keys(peoples).filter(key => 
        peoples[key].isActive && !peoples[key].hasVisited
    );
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Доступные товары из window:', filteredProducts);
    
    // Проверяем, есть ли товары с количеством > 0
    const availableProducts = Object.keys(filteredProducts).filter(productId => 
        filteredProducts[productId] && 
        filteredProducts[productId].count > 0
    );
    
    console.log('Товары с количеством > 0:', availableProducts);
    
    if (availableProducts.length === 0) {
        console.log('⚠️ Внимание: Нет доступных товаров для продажи!');
    }
    
    // Генерируем покупателей на первый день
    generatePeoplesForDay();
    
    let lastCheckedTime = '';
    let checkInterval = null;
    
    // Функция для проверки времени и покупателей
    function checkTimeAndPeoples() {
        const clockElement = document.querySelector('.clock span');
        if (!clockElement) return;
        
        const currentTime = clockElement.textContent;
        
        if (currentTime !== lastCheckedTime) {
            lastCheckedTime = currentTime;
            
            const [currentHour, currentMinute] = currentTime.split(':').map(Number);
            
            checkNewDay(currentHour, currentMinute);
            checkPeoplesArrivalSimple(currentTime);
            
            if (currentHour >= 21) {
                Object.keys(peoples).forEach(key => {
                    if (peoples[key].isActive) {
                        peoples[key].isActive = false;
                        console.log(`⏰ Магазин закрыт, покупатель ${peoples[key].name} ушел`);
                    }
                });
                arrivalTimes = [];
            }
        }
    }
    
    // Запускаем проверку покупателей
    function startCustomerChecker() {
        if (!checkInterval) {
            // ТУТ МЕНЯТЬ СКОРОСТЬ ВРЕМЕНИ
            checkInterval = setInterval(checkTimeAndPeoples, 333);
            console.log('Проверка покупателей запущена');
        }
    }
    
    // Останавливаем проверку
    function stopCustomerChecker() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
            console.log('Проверка покупателей остановлена');
        }
    }
    
    // Запускаем проверку
    startCustomerChecker();
    
    // Быстрая проверка после загрузки
    setTimeout(function() {
        const clockElement = document.querySelector('.clock span');
        if (clockElement) {
            const currentTime = clockElement.textContent;
            checkPeoplesArrivalSimple(currentTime);
        }
    }, 500);
    
    console.log('✅ Система покупателей инициализирована');
});