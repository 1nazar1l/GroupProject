const brushArea = document.querySelector('.brush_area')
const brush = document.querySelector('.brush')

brushArea.addEventListener('click', (e) => {
    e.preventDefault(); 
    
    brush.classList.add('active');
    brushArea.classList.add('hidden');
    
    setTimeout(() => {
        brush.classList.remove('active');
        document.getElementById('nextTierForm').submit(); 
    }, 2000);
});
