const minimapIcon = document.querySelector('.minimap-icon')
const map = document.querySelector('.map-block')
const shopScreen = document.querySelector('.screen')
const moneyInfo = document.querySelector('.money-info')
const pauseBtn = document.querySelector('.pause-btn')
const continueMenuBtn = document.querySelector('.continue-btn')
const tomainMenuBtn = document.querySelector('.main-screen-btn')
const shopArea = document.querySelector('.shop-area')
const bankArea = document.querySelector('.bank-area')

bankArea.addEventListener('click', () => {
    map.classList.remove('active')
    shopScreen.classList.remove('brightness')
    moneyInfo.classList.remove('brightness')
    pauseBtn.classList.remove('brightness')
})

// Логика кредита
document.addEventListener('DOMContentLoaded', () => {
    const amountRange = document.getElementById('credit_amount_range');
    const daysRange = document.getElementById('credit_days_range');
    const sumEl = document.getElementById('credit_sum');
    const percentEl = document.getElementById('credit_percent');
    const totalEl = document.getElementById('credit_total');
    const daysEl = document.getElementById('credit_days');
    const amountInput = document.getElementById('credit_amount_input');
    const daysInput = document.getElementById('credit_days_input');

    function calcMultiplier(days) {
        const minMult = 1.3; // 1 день => +30%
        const maxMult = 2.0; // 10 дней => +100%
        const k = (maxMult - minMult) / 9; // линейная интерполяция
        return minMult + (days - 1) * k;
    }

    function updateCredit() {
        const amount = parseInt(amountRange?.value || '0', 10) || 0;
        const days = parseInt(daysRange?.value || '1', 10) || 1;

        const multiplier = calcMultiplier(days);
        const percent = (multiplier - 1) * 100;
        const total = Math.round(amount * multiplier);

        if (sumEl) sumEl.textContent = amount;
        if (percentEl) percentEl.textContent = `${percent.toFixed(0)}%`;
        if (totalEl) totalEl.textContent = total;
        if (daysEl) daysEl.textContent = days;

        if (amountInput) amountInput.value = amount;
        if (daysInput) daysInput.value = days;
    }

    if (amountRange) amountRange.addEventListener('input', updateCredit);
    if (daysRange) daysRange.addEventListener('input', updateCredit);

    updateCredit();
});