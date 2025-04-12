// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const entryPage = document.querySelector('.entry-page');
    const mainPage = document.querySelector('.main-page');
    const wheelContainer = document.querySelector('.wheel-container');
    const wheel = document.querySelector('.wheel');
    const pages = document.querySelectorAll('.page');
    const spinButton = document.querySelector('.spin-button');

    // 入场页面点击事件
    entryPage.addEventListener('click', function() {
        entryPage.classList.add('exit');
        setTimeout(() => {
            mainPage.classList.add('active');
            wheelContainer.classList.remove('hidden');
            // 显示首页内容
            document.getElementById('home').classList.add('active');
        }, 1000);
    });

    // 转盘点击事件
    const wheelSections = document.querySelectorAll('.wheel-section');
    wheelSections.forEach(section => {
        section.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-section');
            switchPage(targetPage);
        });
    });

    // 转盘旋转按钮点击事件
    spinButton.addEventListener('click', function() {
        const randomRotation = Math.floor(Math.random() * 360) + 720; // 至少旋转两圈
        wheel.style.transform = `rotate(${randomRotation}deg)`;
        
        setTimeout(() => {
            const normalizedRotation = randomRotation % 360;
            const sectionIndex = Math.floor(normalizedRotation / 72);
            const targetPage = wheelSections[sectionIndex].getAttribute('data-section');
            switchPage(targetPage);
        }, 4000);
    });

    // 页面切换函数
    function switchPage(targetPage) {
        // 隐藏所有页面
        pages.forEach(page => page.classList.remove('active'));
        
        // 显示目标页面
        document.getElementById(targetPage).classList.add('active');
    }

    // 项目卡片动画
    const projectCards = document.querySelectorAll('.project-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        observer.observe(card);
    });

    // 联系表单提交
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // 这里可以添加实际的表单提交逻辑
            alert('感谢您的留言！我们会尽快回复。');
            this.reset();
        });
    }

    // 技能项悬停效果
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.backgroundColor = 'rgba(255,255,255,0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.backgroundColor = 'rgba(255,255,255,0.1)';
        });
    });
});

// 页面切换功能
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 获取目标页面
        const targetPage = this.getAttribute('data-page');
        
        // 移除当前活动页面的active类
        document.querySelector('.page.active').classList.remove('active');
        
        // 添加新页面的active类
        document.getElementById(targetPage).classList.add('active');
        
        // 更新导航链接状态
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.background = '#fff';
    }
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 