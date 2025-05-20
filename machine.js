// 扭蛋老虎机功能
const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎫', '🎬', '🎵', '🎹', '🎸', '🎺', '🎻', '🎼', '🎧', '🎤', '🎭', '🎪', '🎨', '🎯'];
const descriptions = {
    '🎮': '这是一个充满活力的表情，代表快乐和积极',
    '🎲': '这是一个可爱的表情，代表温暖和友善',
    '🎯': '这是一个神秘的表情，代表未知和探索',
    '🎨': '这是一个艺术的表情，代表创造和想象',
    '🎭': '这是一个戏剧的表情，代表表演和娱乐',
    '🎪': '这是一个欢乐的表情，代表节日和庆祝',
    '🎫': '这是一个期待的表情，代表机会和可能',
    '🎬': '这是一个电影的表情，代表故事和梦想',
    '🎵': '这是一个音乐的表情，代表旋律和节奏',
    '🎹': '这是一个钢琴的表情，代表优雅和和谐',
    '🎸': '这是一个吉他的表情，代表激情和自由',
    '🎺': '这是一个喇叭的表情，代表响亮和活力',
    '🎻': '这是一个小提琴的表情，代表优雅和细腻',
    '🎼': '这是一个乐谱的表情，代表音乐和艺术',
    '🎧': '这是一个耳机的表情，代表音乐和享受',
    '🎤': '这是一个麦克风的表情，代表声音和表达',
};

const screens = document.querySelectorAll('.screen');
const lever = document.querySelector('.lever');
const descriptionWindow = document.querySelector('.description-window p');
let isSpinning = false;
let activeScreen = null;

// 随机获取表情
function getRandomEmoji() {
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// 更新屏幕显示
function updateScreens() {
    screens.forEach(screen => {
        const emoji = getRandomEmoji();
        screen.querySelector('.emoji').textContent = emoji;
        screen.dataset.description = descriptions[emoji] || '这是一个神秘的表情';
    });
    // 重置描述窗口
    descriptionWindow.textContent = '点击任意表情查看描述';
    // 移除所有屏幕的激活状态
    screens.forEach(screen => screen.classList.remove('active'));
    activeScreen = null;
}

// 处理拉杆点击
lever.addEventListener('click', () => {
    if (isSpinning) return;
    
    isSpinning = true;
    const handle = lever.querySelector('.lever-handle');
    handle.style.transform = 'translateX(-50%) rotate(-30deg)';
    
    // 开始旋转动画
    screens.forEach(screen => {
        screen.querySelector('.emoji').classList.add('spinning');
    });
    
    // 2秒后停止
    setTimeout(() => {
        screens.forEach(screen => {
            screen.querySelector('.emoji').classList.remove('spinning');
        });
        handle.style.transform = 'translateX(-50%) rotate(0deg)';
        updateScreens();
        isSpinning = false;
    }, 2000);
});

// 处理屏幕点击
screens.forEach(screen => {
    screen.addEventListener('click', () => {
        if (isSpinning) return;
        
        // 如果点击的是当前激活的屏幕，则取消激活
        if (activeScreen === screen) {
            screen.classList.remove('active');
            descriptionWindow.textContent = '点击任意表情查看描述';
            activeScreen = null;
        } else {
            // 移除其他屏幕的激活状态
            screens.forEach(s => s.classList.remove('active'));
            // 激活当前屏幕
            screen.classList.add('active');
            descriptionWindow.textContent = screen.dataset.description;
            activeScreen = screen;
        }
    });
});

// 扭蛋机显示/隐藏控制
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.toggle-gacha-btn');
    const gachaMachine = document.querySelector('.gacha-machine');
    const toggleIcon = toggleBtn.querySelector('i');
    
    // 初始状态设置
    gachaMachine.classList.add('hidden');
    
    toggleBtn.addEventListener('click', function() {
        // 切换显示状态
        gachaMachine.classList.toggle('hidden');
        
        // 切换图标
        if (gachaMachine.classList.contains('hidden')) {
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
            toggleBtn.setAttribute('title', '显示扭蛋机');
        } else {
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
            toggleBtn.setAttribute('title', '隐藏扭蛋机');
        }
    });
});
