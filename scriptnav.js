// 侧边导航栏控制
const sideNav = document.querySelector('.side-nav');
const triggerZone = 20; // 触发区域宽度（像素）
let isNavVisible = false;

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
