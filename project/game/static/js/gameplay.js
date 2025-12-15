let maximumLowerLimitPeopleByDay = document.getElementById('maximum_lower_limit_people_by_day').value
let maximumUpperLimitPeopleByDay = document.getElementById('maximum_upper_limit_people_by_day').value
let productsByPeople = document.getElementById('products_by_people').value
let itemByProduct = document.getElementById('item_by_product').value
let tier = document.getElementById('tier').value

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
const endDayBlock = document.querySelector('.end-day-block')

const timeSpeed = 333

const doorbellSound = new Audio('../../media/sfx/doorbell.mp3');
const paymentFailureSound = new Audio('../../media/sfx/payment_failur.mp3');
const cashBoxSound = new Audio('../../media/sfx/cash_box.mp3');

tabletIcon.addEventListener('click', () => {
    clock.classList.toggle('brightness')
    ordersBlock.classList.toggle('brightness')
    endDayBlock.classList.toggle('brightness')
})

pauseBtn.addEventListener('click', () => {
    clock.classList.add('brightness')
    ordersBlock.classList.add('brightness')
    endDayBlock.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    clock.classList.remove('brightness')
    ordersBlock.classList.remove('brightness')
    endDayBlock.classList.remove('brightness')
})

tomainMenuBtn.addEventListener('click', () => {
    clock.classList.remove('brightness')
    ordersBlock.classList.remove('brightness')
    endDayBlock.classList.remove('brightness')
})

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min); 
  max = Math.floor(max); 
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(num) {
    return num < 10 ? '0' + num : num;
}

function generateRandomTime() {
    const hour = getRandomIntInclusive(9, 20);
    const minute = getRandomIntInclusive(0, 59);
    
    return {
        hour: hour,
        minute: minute,
        formatted: `${formatTime(hour)}:${formatTime(minute)}`
    };
}

function generatePeopleName(index) {
    const names = [
        "Алексей", "Мария", "Дмитрий", "Анна", "Сергей", 
        "Елена", "Андрей", "Ольга", "Иван", "Наталья",
        "Михаил", "Татьяна", "Владимир", "Юлия", "Павел",
        "Александра", "Николай", "Ирина", "Артем", "Екатерина"
    ];
    
    const randomNameIndex = getRandomIntInclusive(0, names.length - 1);
    return names[randomNameIndex];
}

let filteredProducts = window.filteredProducts || {}; 
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

function getRandomItems(array, count) {
    if (array.length === 0) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

function sortPeoplesByTime() {
    arrivalTimes.sort((a, b) => {
        const [hoursA, minutesA] = a.split(':').map(Number);
        const [hoursB, minutesB] = b.split(':').map(Number);
        return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
    });
    
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

function generatePurchaseList() {
    const items = [];
    let totalCost = 0;
    
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
    
    const maxItemsToBuy = Math.min(productsByPeople, availableProducts.length);
    const itemsCount = getRandomIntInclusive(1, maxItemsToBuy);
    
    console.log(`Покупатель выберет ${itemsCount} товаров из ${availableProducts.length}`);
    
    const selectedProducts = getRandomItems(availableProducts, itemsCount);
    
    console.log('Выбранные товары:', selectedProducts);
    
    selectedProducts.forEach(productId => {
        const product = filteredProducts[productId];
        if (!product) return;
        
        const maxQuantity = Math.min(itemByProduct, product.count || 0); 
        
        if (maxQuantity > 0) {
            const quantity = getRandomIntInclusive(1, maxQuantity);
            const itemCost = quantity * product.price;
            
            items.push({
                id: productId,
                name: product.name,
                quantity: quantity,
                price: product.price,
                total: itemCost
            });
            
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

function generatePeoplesForDay() {
    peoples = {};
    arrivalTimes = [];
    maxPeoplesPerDay = getRandomIntInclusive(maximumLowerLimitPeopleByDay, maximumUpperLimitPeopleByDay);
    if (maxPeoplesPerDay > 99) {
        maxPeoplesPerDay = maxPeoplesPerDay.slice(-2);
    }
    console.log(`__________________________${maxPeoplesPerDay}`)
    todayPeoples = 0;
    hasGeneratedToday = true;
    moneyEarnedToday = 0;
    peopleServedToday = 0;
    updateEndDayStats();
    
    console.log(`На сегодня ${maxPeoplesPerDay} покупателей`);
    console.log('Текущие доступные товары:', filteredProducts);
    
    for (let i = 1; i <= maxPeoplesPerDay; i++) {
        const purchaseList = generatePurchaseList();
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

function updateOrdersBlock() {
    const ordersBlock = document.querySelector('.orders-block');
    if (!ordersBlock) return;
    
    const existingOrders = ordersBlock.querySelectorAll('.order-block');
    existingOrders.forEach(order => order.remove());
    
    const activePeoples = Object.keys(peoples).filter(key => 
        peoples[key].isActive && !peoples[key].hasVisited
    );
    
    activePeoples.forEach(key => {
        const person = peoples[key];
        
        const orderBlock = document.createElement('div');
        orderBlock.className = 'order-block';
        
        const buyerName = document.createElement('div');
        buyerName.className = 'buyer-name';
        buyerName.textContent = person.name;
        
        const buyerProducts = document.createElement('div');
        buyerProducts.className = 'buyer-products';
        
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
        
        orderBlock.appendChild(buyerName);
        orderBlock.appendChild(buyerProducts);
        ordersBlock.appendChild(orderBlock);
    });
}

function checkPeoplesArrivalSimple(currentTime) {
    if (arrivalTimes.includes(currentTime)) {
        Object.keys(peoples).forEach(key => {
            const person = peoples[key];
            
            if (person.time === currentTime && !person.hasVisited && !person.isActive) {
                person.isActive = true;
                todayPeoples++;
                
                doorbellSound.currentTime = 0;
                doorbellSound.play().catch(err => {
                    console.log('Ошибка воспроизведения звука дверного звонка:', err);
                });
                
                console.log(`⚠️ Покупатель прибыл! Имя: ${person.name}, Время: ${person.time}`);
                console.log(`Осталось покупателей сегодня: ${maxPeoplesPerDay - todayPeoples}`);
                
                if (person.purchases && person.purchases.length > 0) {
                    console.log('🛒 Список покупок:');
                    person.purchases.forEach((item, index) => {
                        console.log(`   ${index + 1}. ${item.name}: ${item.quantity} шт. × ${item.price}$ = ${item.total}$`);
                    });
                    console.log(`💰 Итого: ${person.totalCost}$`);
                } else {
                    console.log('🛒 Покупатель ничего не хочет покупать');
                }
                
                updateOrdersBlock();
                
                const index = arrivalTimes.indexOf(currentTime);
                if (index > -1) {
                    arrivalTimes.splice(index, 1);
                }
            }
        });
    }
}

function getFirstActivePeopleId() {
    const active = Object.keys(peoples).filter(key =>
        peoples[key].isActive && !peoples[key].hasVisited
    );
    return active.length ? active[0] : null;
}

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

function isOrderCorrectForCustomer(orderItems, customer) {
    if (!customer || !Array.isArray(customer.purchases)) return false;

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

function resetTabletOrder() {
    document.querySelectorAll('.tablet-order-screen .order-product-count').forEach(counter => {
        counter.textContent = '0';
    });
}

function checkNewDay(currentHour, currentMinute) {
    if (currentHour === 9 && currentMinute === 0 && !hasGeneratedToday) {
        generatePeoplesForDay();
        console.log("🎉 Начался новый рабочий день!");
    }
    
    if (currentHour === 21 && currentMinute === 0) {
        hasGeneratedToday = false; 
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

function updateProductQuantity(productId, quantitySold) {
    if (filteredProducts[productId]) {
        filteredProducts[productId].count -= quantitySold;
        
        if (filteredProducts[productId].count <= 0) {
            delete filteredProducts[productId];
            console.log(`Товар ${productId} закончился`);
        }
        
        console.log(`Обновлено количество товара ${productId}: осталось ${filteredProducts[productId]?.count || 0}`);
    }
}

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

function markPeopleAsServed(peopleId) {
    if (peoples[peopleId]) {
        const result = processCustomerPurchase(peopleId);
        
        if (result.success) {
            peoples[peopleId].hasVisited = true;
            peoples[peopleId].isActive = false;
            
            console.log(`✅ Покупатель ${peoples[peopleId].name} обслужен`);
            console.log(`💰 Продано товаров на сумму: ${result.totalAmount}$`);
            console.log('📦 Проданные товары:', result.soldItems);
            
            updateOrdersBlock();
            
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

function getActivePeoples() {
    return Object.keys(peoples).filter(key => 
        peoples[key].isActive && !peoples[key].hasVisited
    );
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Доступные товары из window:', filteredProducts);
    
    const availableProducts = Object.keys(filteredProducts).filter(productId => 
        filteredProducts[productId] && 
        filteredProducts[productId].count > 0
    );
    
    console.log('Товары с количеством > 0:', availableProducts);
    
    if (availableProducts.length === 0) {
        console.log('⚠️ Внимание: Нет доступных товаров для продажи!');
    }
    
    generatePeoplesForDay();
    
    let lastCheckedTime = '';
    let checkInterval = null;
    
    function checkTimeAndPeoples() {
        const clockElement = document.querySelector('.clock span');
        if (!clockElement) return;
        
        const currentTime = clockElement.textContent;
        
        if (currentTime !== lastCheckedTime) {
            lastCheckedTime = currentTime;
            
            const [currentHour, currentMinute] = currentTime.split(':').map(Number);
            
            checkNewDay(currentHour, currentMinute);
            checkPeoplesArrivalSimple(currentTime);
            
            if (currentHour >= 21 && !endOfDayActivated) {
                endOfDayActivated = true;
                const endDayBlock = document.querySelector('.end-day-block');
                if (endDayBlock) {
                    endDayBlock.classList.add('active');
                }
                
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
                updateOrdersBlock();
            }
        }
    }
    
    function startCustomerChecker() {
        if (!checkInterval) {
            // ТУТ МЕНЯТЬ СКОРОСТЬ ВРЕМЕНИ
            checkInterval = setInterval(checkTimeAndPeoples, timeSpeed);
            console.log('Проверка покупателей запущена');
        }
    }
    
    function stopCustomerChecker() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
            console.log('Проверка покупателей остановлена');
        }
    }
    
    startCustomerChecker();
    
    setTimeout(function() {
        const clockElement = document.querySelector('.clock span');
        if (clockElement) {
            const currentTime = clockElement.textContent;
            checkPeoplesArrivalSimple(currentTime);
        }
    }, 500);
    
    console.log('✅ Система покупателей инициализирована');

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
                paymentFailureSound.currentTime = 0;
                paymentFailureSound.play().catch(err => {
                    console.log('Ошибка воспроизведения звука ошибки оплаты:', err);
                });
                
                console.log('Неправильный заказ, покупатель остается в магазине');
                return;
            }

            const result = markPeopleAsServed(peopleId);
            if (result.success) {
                cashBoxSound.currentTime = 0;
                cashBoxSound.play().catch(err => {
                    console.log('Ошибка воспроизведения звука кассы:', err);
                });
                
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