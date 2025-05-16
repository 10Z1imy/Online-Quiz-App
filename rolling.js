// 全屏滚动功能
let currentPage = 0;
const container = document.querySelector('.fullpage-container');
const totalPages = 2;
let isScrolling = false;
let wheelTimeout;

function scrollToPage(page) {
    if (isScrolling) return;
    isScrolling = true;
    
    if (page === 1) {
        container.classList.add('scrolled');
    } else {
        container.classList.remove('scrolled');
    }
    
    currentPage = page;
    
    setTimeout(() => {
        isScrolling = false;
    }, 800);
}

// 监听滚轮事件
window.addEventListener('wheel', (e) => {
    if (wheelTimeout) {
        clearTimeout(wheelTimeout);
    }
    
    wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0 && currentPage < totalPages - 1) {
            scrollToPage(1);
        } else if (e.deltaY < 0 && currentPage > 0) {
            scrollToPage(0);
        }
    }, 50);
});

// 防止触摸设备上的默认滚动行为
document.addEventListener('touchmove', (e) => {
    if (isScrolling) {
        e.preventDefault();
    }
}, { passive: false });

