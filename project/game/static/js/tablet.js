const tabletIcon = document.querySelector('.tablet-icon')
const mapIcon = document.querySelector('.minimap-icon')
const tablet = document.querySelector('.tablet-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')
const startDayBtn = document.querySelector('.start-day-btn')

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
    startDayBtn.classList.toggle('brightness')
})

pauseBtn.addEventListener('click', () => {
    tabletIcon.classList.add('brightness')
    tablet.classList.add('brightness')
    startDayBtn.classList.add('brightness')
})

continueMenuBtn.addEventListener('click', () => {
    tabletIcon.classList.remove('brightness')
    tablet.classList.remove('brightness')
    startDayBtn.classList.remove('brightness')
})

tomainMenuBtn.addEventListener('click', () => {
    tabletIcon.classList.remove('brightness')
    tablet.classList.remove('brightness')
    startDayBtn.classList.remove('brightness')
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

// Находим все кнопки добавления и удаления ТОЛЬКО на экране заказа
document.querySelectorAll('.tablet-order-screen .add-button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const productElement = this.closest('.product');
        const countElement = productElement.querySelector('.order-product-count'); // Изменено
        
        let currentCount = parseInt(countElement.textContent) || 0;
        currentCount++;
        countElement.textContent = currentCount;
        
        updateOrderTotals();
    });
});

document.querySelectorAll('.tablet-order-screen .remove-button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const productElement = this.closest('.product');
        const countElement = productElement.querySelector('.order-product-count'); // Изменено
        
        let currentCount = parseInt(countElement.textContent) || 0;
        if (currentCount > 0) {
            currentCount--;
            countElement.textContent = currentCount;
            
            updateOrderTotals();
        }
    });
});

function updateOrderTotals() {
    let totalPrice = 0;
    let totalCount = 0;
    
    // Считаем только товары на экране заказа
    document.querySelectorAll('.tablet-order-screen .product').forEach(product => {
        const countElement = product.querySelector('.order-product-count'); // Изменено
        const priceElement = product.querySelector('.product-price');
        
        const count = parseInt(countElement.textContent) || 0;
        const priceText = priceElement.textContent;
        const price = parseFloat(priceText.replace('$', '')) || 0;
        
        totalCount += count;
        totalPrice += count * price;
    });
    
    const totalPriceSpan = document.getElementById('total-price');
    const totalCountSpan = document.getElementById('total-count');
    
    if (totalPriceSpan) totalPriceSpan.textContent = totalPrice.toFixed(2) + '$';
    if (totalCountSpan) totalCountSpan.textContent = totalCount;
    
    const formTotalPrice = document.getElementById('form-total-price');
    const formTotalCount = document.getElementById('form-total-count');
    
    if (formTotalPrice) formTotalPrice.value = totalPrice.toFixed(2);
    if (formTotalCount) formTotalCount.value = totalCount;
}

function prepareOrderForm() {
    const form = document.getElementById('order-form');
    
    const oldProductFields = form.querySelectorAll('input[name^="product_"]');
    oldProductFields.forEach(field => field.remove());
    
    // Используем только товары на экране заказа
    document.querySelectorAll('.tablet-order-screen .product').forEach(product => {
        const productId = product.getAttribute('data-product-id');
        const productName = product.querySelector('.product-name').textContent;
        const countElement = product.querySelector('.order-product-count'); // Изменено
        const count = parseInt(countElement.textContent) || 0;
        
        if (count > 0 && productId) {
            const idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.name = `product_id[]`;
            idInput.value = productId;
            form.appendChild(idInput);
            
            const nameInput = document.createElement('input');
            nameInput.type = 'hidden';
            nameInput.name = `product_name[]`;
            nameInput.value = productName;
            form.appendChild(nameInput);
            
            const countInput = document.createElement('input');
            countInput.type = 'hidden';
            countInput.name = `product_count[]`;
            countInput.value = count;
            form.appendChild(countInput);
        }
    });
    
    return true;
}

document.getElementById('complete-order').addEventListener('click', function(event) {
    const moneyElement = document.querySelector('.money');
    const formTotalPrice = document.getElementById('form-total-price').value;
    const totalPriceText = document.getElementById('total-price');
    
    console.log(typeof formTotalPrice, typeof moneyElement.textContent);
    
    const moneyValue = parseFloat(moneyElement.textContent) || 0;
    const formPriceValue = parseFloat(formTotalPrice) || 0;
    
    if (formPriceValue > moneyValue) {
        event.preventDefault();
        totalPriceText.classList.add('to_much');
    } else {
        prepareOrderForm();
        document.getElementById('order-form').submit();
    }
});
document.addEventListener('DOMContentLoaded', updateOrderTotals);