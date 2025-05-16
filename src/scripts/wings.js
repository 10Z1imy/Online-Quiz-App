document.addEventListener('DOMContentLoaded', () => {
    // 轮播图相关元素
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.nav-button.next');
    const prevButton = document.querySelector('.nav-button.prev');
    const dotsNav = document.querySelector('.carousel-indicators');
    const dots = Array.from(dotsNav.children);

    // 设置初始状态
    updateCarouselState(0);

    // 获取显示位置的索引（处理循环）
    function getVisibleIndices(currentIndex) {
        const totalSlides = slides.length;
        return {
            prev2: (currentIndex - 2 + totalSlides) % totalSlides,
            prev: (currentIndex - 1 + totalSlides) % totalSlides,
            current: currentIndex,
            next: (currentIndex + 1) % totalSlides,
            next2: (currentIndex + 2) % totalSlides
        };
    }

    // 更新轮播状态
    function updateCarouselState(currentIndex) {
        const indices = getVisibleIndices(currentIndex);
        
        slides.forEach((slide, index) => {
            // 移除所有类
            slide.classList.remove('current-slide', 'prev', 'next');
            
            // 设置位置和样式
            if (index === indices.current) {
                // 当前slide
                slide.classList.add('current-slide');
                slide.style.transform = 'scale(1.1) translateX(0)';
                slide.style.opacity = '1';
                slide.style.zIndex = '3';
                slide.style.visibility = 'visible';
            } else if (index === indices.prev) {
                // 前一个slide
                slide.classList.add('prev');
                slide.style.transform = 'scale(0.85) translateX(-100%)';
                slide.style.opacity = '0.6';
                slide.style.zIndex = '2';
                slide.style.visibility = 'visible';
            } else if (index === indices.next) {
                // 后一个slide
                slide.classList.add('next');
                slide.style.transform = 'scale(0.85) translateX(100%)';
                slide.style.opacity = '0.6';
                slide.style.zIndex = '2';
                slide.style.visibility = 'visible';
            } else if (index === indices.prev2) {
                // 前两个slide
                slide.style.transform = 'scale(0.7) translateX(-200%)';
                slide.style.opacity = '0.3';
                slide.style.zIndex = '1';
                slide.style.visibility = 'visible';
            } else if (index === indices.next2) {
                // 后两个slide
                slide.style.transform = 'scale(0.7) translateX(200%)';
                slide.style.opacity = '0.3';
                slide.style.zIndex = '1';
                slide.style.visibility = 'visible';
            } else {
                // 其他slide
                slide.style.visibility = 'hidden';
                slide.style.transform = 'scale(0.7) translateX(0)';
                slide.style.opacity = '0';
                slide.style.zIndex = '0';
            }
        });
    }

    // 更新圆点
    const updateDots = (currentDot, targetDot) => {
        currentDot.classList.remove('active');
        targetDot.classList.add('active');
    };

    // 移动到指定slide
    const moveToSlide = (targetIndex) => {
        const currentDot = dotsNav.querySelector('.active');
        const targetDot = dots[targetIndex];
        
        updateCarouselState(targetIndex);
        updateDots(currentDot, targetDot);
        updateGridItems(targetIndex);
    };

    // 点击右箭头
    nextButton.addEventListener('click', () => {
        const currentIndex = slides.findIndex(slide => slide.classList.contains('current-slide'));
        const nextIndex = (currentIndex + 1) % slides.length;
        moveToSlide(nextIndex);
    });

    // 点击左箭头
    prevButton.addEventListener('click', () => {
        const currentIndex = slides.findIndex(slide => slide.classList.contains('current-slide'));
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        moveToSlide(prevIndex);
    });

    // 点击导航圆点
    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('.indicator');
        if (!targetDot) return;
        
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        moveToSlide(targetIndex);
    });

    // 图片格子相关元素
    const gridItems = document.querySelectorAll('.grid-item');
    
    // 更新图片格子显示
    const updateGridItems = (index) => {
        gridItems.forEach((item, i) => {
            item.classList.remove('visible');
            if (i === index) {
                item.classList.add('visible');
            }
        });
    };

    // 初始化：显示第一个格子
    updateGridItems(0);

    // 监听滚动事件
    let lastScrollTime = 0;
    const scrollCooldown = 1000; // 1秒冷却时间

    window.addEventListener('wheel', (e) => {
        const currentTime = new Date().getTime();
        if (currentTime - lastScrollTime < scrollCooldown) return;

        const currentIndex = slides.findIndex(slide => slide.classList.contains('current-slide'));
        
        if (e.deltaY > 0) {
            // 向下滚动
            moveToSlide((currentIndex + 1) % slides.length);
            lastScrollTime = currentTime;
        } else if (e.deltaY < 0) {
            // 向上滚动
            moveToSlide((currentIndex - 1 + slides.length) % slides.length);
            lastScrollTime = currentTime;
        }
    });

    // 触摸事件支持
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    track.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    });

    track.addEventListener('touchend', () => {
        const currentIndex = slides.findIndex(slide => slide.classList.contains('current-slide'));
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) { // 最小滑动距离
            if (diff > 0) {
                // 向左滑动
                moveToSlide((currentIndex + 1) % slides.length);
            } else {
                // 向右滑动
                moveToSlide((currentIndex - 1 + slides.length) % slides.length);
            }
        }
    });

    // 自动轮播
    let autoplayInterval;
    const startAutoplay = () => {
        autoplayInterval = setInterval(() => {
            const currentIndex = slides.findIndex(slide => slide.classList.contains('current-slide'));
            moveToSlide((currentIndex + 1) % slides.length);
        }, 5000);
    };

    // 停止自动轮播
    const stopAutoplay = () => {
        clearInterval(autoplayInterval);
    };

    // 鼠标进入停止自动轮播
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // 开始自动轮播
    startAutoplay();
}); 