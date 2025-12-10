let maximumLowerLimitPeopleByDay = 8
let maximumUpperLimitPeopleByDay = 10
let productsByPeople = 4
let itemByProduct = 3

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
const tabletIcon = document.querySelector('.tablet-icon')
const ordersBlock = document.querySelector('.orders-block')

const timeSpeed = 333

tabletIcon.addEventListener('click', () => {
    clock.classList.toggle('brightness')
    ordersBlock.classList.toggle('brightness')
})

pauseBtn.addEventListener('click', () => {
    clock.classList.add('brightness')
    ordersBlock.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    clock.classList.remove('brightness')
    ordersBlock.classList.remove('brightness')
})

tomainMenuBtn.addEventListener('click', () => {
    clock.classList.remove('brightness')
    ordersBlock.classList.remove('brightness')
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
let hasGeneratedToday = false;
let endOfDayActivated = false;
let moneyEarnedToday = 0;
let peopleServedToday = 0;

function updateEndDayStats() {
    const moneyEl = document.getElementById('money_earned');
    const moneyVal = document.getElementById('moneyVal')
    const servedEl = document.getElementById('people_served');
    const peopleVal = document.getElementById('peopleVal')
    if (moneyEl) moneyEl.textContent = moneyEarnedToday;

    if (moneyVal) {
        moneyVal.value = moneyEarnedToday;
        moneyVal.setAttribute('value', moneyEarnedToday);
    }

    if (servedEl) servedEl.textContent = peopleServedToday;

    if (peopleVal) {
        peopleVal.value = peopleServedToday;
        peopleVal.setAttribute('value', peopleServedToday);
    }
}

// Уменьшаем значения скрытых полей по проданным товарам
function updateHiddenInventory(soldItems) {
    if (!Array.isArray(soldItems)) return;
    soldItems.forEach(item => {
        if (!item || !item.id) return;
        const hiddenInput = document.getElementById(item.id);
        if (!hiddenInput) return;
        const current = parseInt(hiddenInput.value) || 0;
        const next = Math.max(0, current - (item.quantity || 0));
        hiddenInput.value = next;
    });
}

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
    if (availableProducts.length) {
        const countsInfo = availableProducts.map(pid => `${pid}: ${filteredProducts[pid].count}`);
        console.log('Остатки по товарам:', countsInfo);
    }
    
    if (availableProducts.length === 0) {
        console.log('Нет доступных товаров для покупки');
        return { items: [], totalCost: 0 };
    }
    
    // Определяем сколько товаров купит покупатель (1-4 или меньше)
    const maxItemsToBuy = Math.min(productsByPeople, availableProducts.length);
    const itemsCount = getRandomInt(1, maxItemsToBuy);
    
    console.log(`Покупатель выберет ${itemsCount} товаров из ${availableProducts.length}`);
    
    // Выбираем случайные товары (без повторений)
    const selectedProducts = getRandomItems(availableProducts, itemsCount);
    
    console.log('Выбранные товары:', selectedProducts);
    
    // Для каждого выбранного товара определяем количество
    selectedProducts.forEach(productId => {
        const product = filteredProducts[productId];
        if (!product) return;
        
        const maxQuantity = Math.min(itemByProduct, product.count || 0); // Не больше 3 и не больше доступного количества
        
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
            
            // Резервируем товар сразу при раздаче покупателям
            filteredProducts[productId].count -= quantity;
            if (filteredProducts[productId].count <= 0) {
                delete filteredProducts[productId];
                console.log(`Товар ${product.name} закончился при раздаче покупателям`);
            }
            
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
    maxPeoplesPerDay = getRandomInt(maximumLowerLimitPeopleByDay, maximumUpperLimitPeopleByDay);
    todayPeoples = 0;
    hasGeneratedToday = true;
    moneyEarnedToday = 0;
    peopleServedToday = 0;
    updateEndDayStats();
    
    console.log(`На сегодня ${maxPeoplesPerDay} покупателей`);
    console.log('Текущие доступные товары:', filteredProducts);
    
    for (let i = 1; i <= maxPeoplesPerDay; i++) {
        // Генерируем список покупок для покупателя
        const purchaseList = generatePurchaseList();
        // Если покупок нет — отправляем на 23:00 (после закрытия)
        const time = (purchaseList.items && purchaseList.items.length > 0)
            ? generateRandomTime()
            : { hour: 23, minute: 0, formatted: '23:00' };
        
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

// Функция для обновления блока заказов на странице
function updateOrdersBlock() {
    const ordersBlock = document.querySelector('.orders-block');
    if (!ordersBlock) return;
    
    // Находим контейнер для заказов (внутри orders-block, после img)
    const existingOrders = ordersBlock.querySelectorAll('.order-block');
    existingOrders.forEach(order => order.remove());
    
    // Получаем всех активных покупателей
    const activePeoples = Object.keys(peoples).filter(key => 
        peoples[key].isActive && !peoples[key].hasVisited
    );
    
    // Создаем блоки для каждого активного покупателя
    activePeoples.forEach(key => {
        const person = peoples[key];
        
        // Создаем блок заказа
        const orderBlock = document.createElement('div');
        orderBlock.className = 'order-block';
        
        // Создаем имя покупателя
        const buyerName = document.createElement('div');
        buyerName.className = 'buyer-name';
        buyerName.textContent = person.name;
        
        // Создаем контейнер для товаров
        const buyerProducts = document.createElement('div');
        buyerProducts.className = 'buyer-products';
        
        // Добавляем товары
        if (person.purchases && person.purchases.length > 0) {
            person.purchases.forEach(purchase => {
                const buyerProduct = document.createElement('div');
                buyerProduct.className = 'buyer-product';
                
                const productSpan = document.createElement('span');
                productSpan.textContent = `${purchase.name} - ${purchase.quantity}шт.`;
                
                buyerProduct.appendChild(productSpan);
                buyerProducts.appendChild(buyerProduct);
            });
        }
        
        // Собираем блок
        orderBlock.appendChild(buyerName);
        orderBlock.appendChild(buyerProducts);
        ordersBlock.appendChild(orderBlock);
    });
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
                
                // Обновляем блок заказов
                updateOrdersBlock();
                
                // Удаляем время из массива
                const index = arrivalTimes.indexOf(currentTime);
                if (index > -1) {
                    arrivalTimes.splice(index, 1);
                }
            }
        });
    }
}

// Получаем id первого активного покупателя
function getFirstActivePeopleId() {
    const active = Object.keys(peoples).filter(key =>
        peoples[key].isActive && !peoples[key].hasVisited
    );
    return active.length ? active[0] : null;
}

// Собираем заказ из планшета (по названиям и количествам)
function collectTabletOrder() {
    const products = [];

    document.querySelectorAll('.tablet-order-screen .product').forEach(productEl => {
        const nameEl = productEl.querySelector('.product-name');
        const countEl = productEl.querySelector('.order-product-count');
        const priceEl = productEl.querySelector('.product-price');

        if (!nameEl || !countEl) return;

        const quantity = parseInt(countEl.textContent) || 0;
        if (quantity <= 0) return;

        const name = nameEl.textContent.trim();
        const price = priceEl ? parseFloat(priceEl.textContent.replace('$', '')) || 0 : 0;

        products.push({ name, quantity, price });
    });

    return products;
}

// Проверяем соответствие заказа активному покупателю
function isOrderCorrectForCustomer(orderItems, customer) {
    if (!customer || !Array.isArray(customer.purchases)) return false;

    // Строим карту заказов и ожидаемых покупок по имени
    const orderMap = {};
    orderItems.forEach(item => {
        orderMap[item.name] = (orderMap[item.name] || 0) + item.quantity;
    });

    const expectedMap = {};
    customer.purchases.forEach(item => {
        expectedMap[item.name] = (expectedMap[item.name] || 0) + item.quantity;
    });

    const orderNames = Object.keys(orderMap);
    const expectedNames = Object.keys(expectedMap);

    if (orderNames.length !== expectedNames.length) return false;

    return expectedNames.every(name => orderMap[name] === expectedMap[name]);
}

// Сбрасываем счетчики заказа
function resetTabletOrder() {
    document.querySelectorAll('.tablet-order-screen .order-product-count').forEach(counter => {
        counter.textContent = '0';
    });
}

// Функция для проверки нового дня
function checkNewDay(currentHour, currentMinute) {
    if (currentHour === 9 && currentMinute === 0 && !hasGeneratedToday) {
        generatePeoplesForDay();
        console.log("🎉 Начался новый рабочий день!");
    }
    
    if (currentHour === 21 && currentMinute === 0) {
        hasGeneratedToday = false; // готовим к следующему дню при повторном запуске
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
    
    for (const purchase of customer.purchases) {
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
            
            // Обновляем блок заказов
            updateOrdersBlock();
            
            // Обновляем дневную статистику
            moneyEarnedToday += result.totalAmount;
            peopleServedToday += 1;
            updateEndDayStats();
            updateHiddenInventory(result.soldItems);
            
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
            
            // Активация конца дня в 21:00
            if (currentHour >= 21 && !endOfDayActivated) {
                endOfDayActivated = true;
                const endDayBlock = document.querySelector('.end-day-block');
                if (endDayBlock) {
                    endDayBlock.classList.add('active');
                }
                
                // Увеличиваем длительность игровой минуты до 1000 мс после 21:00
                if (checkInterval) {
                    clearInterval(checkInterval);
                }
                checkInterval = setInterval(checkTimeAndPeoples, 1000);
            }
            
            if (currentHour >= 21) {
                Object.keys(peoples).forEach(key => {
                    if (peoples[key].isActive) {
                        peoples[key].isActive = false;
                        console.log(`⏰ Магазин закрыт, покупатель ${peoples[key].name} ушел`);
                    }
                });
                arrivalTimes = [];
                // Обновляем блок заказов
                updateOrdersBlock();
            }
        }
    }
    
    // Запускаем проверку покупателей
    function startCustomerChecker() {
        if (!checkInterval) {
            // ТУТ МЕНЯТЬ СКОРОСТЬ ВРЕМЕНИ
            checkInterval = setInterval(checkTimeAndPeoples, timeSpeed);
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

    // Привязка кнопок увеличения/уменьшения товаров (каптчур, чтобы не задвоить обработчики из tablet.js)
    const tabletOrderScreen = document.querySelector('.tablet-order-screen');
    if (tabletOrderScreen) {
        tabletOrderScreen.addEventListener('click', function(event) {
            const addBtn = event.target.closest('.add-button');
            const removeBtn = event.target.closest('.remove-button');

            if (addBtn || removeBtn) {
                event.stopImmediatePropagation();
                const productElement = (addBtn || removeBtn).closest('.product');
                if (!productElement) return;

                const countElement = productElement.querySelector('.order-product-count');
                if (!countElement) return;

                let currentCount = parseInt(countElement.textContent) || 0;

                if (addBtn) currentCount++;
                if (removeBtn && currentCount > 0) currentCount--;

                countElement.textContent = currentCount;
            }
        }, true);
    }

    // Кнопка "Отдать" — проверка заказа с активным покупателем
    const completeOrderBtn = document.querySelector('.complete-order-btn');
    if (completeOrderBtn) {
        completeOrderBtn.addEventListener('click', function() {
            const peopleId = getFirstActivePeopleId();
            if (!peopleId) {
                console.log('Нет активных покупателей');
                return;
            }

            const customer = peoples[peopleId];
            const orderItems = collectTabletOrder();

            if (!orderItems.length) {
                console.log('Заказ пустой');
                return;
            }

            const isCorrect = isOrderCorrectForCustomer(orderItems, customer);

            if (!isCorrect) {
                console.log('Неправильный заказ, покупатель остается в магазине');
                return;
            }

            const result = markPeopleAsServed(peopleId);
            if (result.success) {
                // Обновляем деньги на экране
                const moneyEl = document.querySelector('.money');
                if (moneyEl) {
                    const currentMoney = parseFloat((moneyEl.textContent || moneyEl.innerText || '0').replace(/\s/g, '')) || 0;
                    const newMoney = Math.round((currentMoney + result.totalAmount) * 100) / 100;
                    moneyEl.textContent = newMoney;
                    if (moneyEl.hasAttribute('value')) {
                        moneyEl.setAttribute('value', newMoney);
                    }
                }

                resetTabletOrder();
            } else {
                console.log('Не удалось обслужить покупателя:', result.message);
            }
        });
    }
});