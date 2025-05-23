// 侧边导航栏控制
const sideNav = document.querySelector('.side-nav');
const triggerZone = 20; // 触发区域宽度（像素）
let isNavVisible = false;

// 获取档案区域元素
const archivesSection = document.querySelector('.archives-section');
const profile = document.querySelector('.profile');

document.addEventListener('mousemove', (e) => {
    // 获取鼠标相对于视口的X坐标
    const mouseX = e.clientX;
    
    // 如果导航栏可见，检查鼠标是否在导航栏区域内
    if (isNavVisible) {
        const navRect = sideNav.getBoundingClientRect();
        if (mouseX > navRect.right) {
            isNavVisible = false;
            sideNav.style.left = '-200px';
        }
    } 
    // 如果导航栏不可见，检查鼠标是否在触发区域内
    else if (mouseX <= triggerZone) {
        isNavVisible = true;
        sideNav.style.left = '0';
    }
});

// 当鼠标离开文档时，确保导航栏收起
document.addEventListener('mouseleave', () => {
    isNavVisible = false;
    sideNav.style.left = '-200px';
});

// 防止档案区域滚动触发页面滚动
if (archivesSection) {
    archivesSection.addEventListener('wheel', (e) => {
        const profile = e.currentTarget.querySelector('.profile');
        const isAtTop = profile.scrollTop === 0;
        const isAtBottom = profile.scrollHeight - profile.scrollTop === profile.clientHeight;

        // 如果不在顶部或底部，阻止事件冒泡
        if (!(isAtTop && e.deltaY < 0) && !(isAtBottom && e.deltaY > 0)) {
            e.stopPropagation();
        }
    });
}

const navBtn = document.getElementById('nav-btn');
if (navBtn) {
    navBtn.addEventListener('click', function() {
        // 这里写原有的点击回调内容
    });
}
