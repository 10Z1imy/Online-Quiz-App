// 扭蛋老虎机功能
const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎫', '🎬', '🎵', '🎹', '🎸', '🎼', '🎧', '🎤', '🎭', '🎪', '🎨', '🎯'];
const descriptions = {
    '🎮': 'etc',
    '🎲': 'etc',
    '🎯': 'etc',
    '🎨': 'life-time hobby perhaps..',
    '🎭': '左眼，用来忘记你..',
    '🎪': 'love reminiscing about the summer camp days',
    '🎫': 'Went to see Echoes of Life!',
    '🎬': 'seldoms',
    '🎵': 'propels the construction of personal narratives',
    '🎹': 'Reach Grade 2 ^^',
    '🎸': 'guitar guy has added charm',
    '🎼': 'Wirting poems or...live life to the fullest?',
    '🎧': 'Travel memories should always be etched into a rhythm',
    '🎤': 'Sing It Aloud!',
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
        const emojiElem = screen.querySelector('.emoji');
        if (emojiElem) {
            const emoji = getRandomEmoji();
            emojiElem.textContent = emoji;
            screen.dataset.description = descriptions[emoji] || 'O.o';
        }
    });
    // 重置描述窗口
    descriptionWindow.textContent = 'click any emoji to see the description';
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
        const emojiElem = screen.querySelector('.emoji');
        if (emojiElem) {
            emojiElem.classList.add('spinning');
        }
    });
    
    // 2秒后停止
    setTimeout(() => {
        screens.forEach(screen => {
            const emojiElem = screen.querySelector('.emoji');
            if (emojiElem) {
                emojiElem.classList.remove('spinning');
            }
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
            descriptionWindow.textContent = 'click any emoji to see the description';
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

// 初始化时隐藏扭蛋机
document.addEventListener('DOMContentLoaded', function() {
    const gachaMachine = document.querySelector('.gacha-machine');
    const toggleBtn = document.querySelector('.toggle-gacha-btn');
    const icon = toggleBtn.querySelector('i');
    
    // 设置初始状态为显示
    gachaMachine.style.display = 'block';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
    
    // 点击按钮切换显示状态
    toggleBtn.addEventListener('click', function() {
        if (gachaMachine.style.display === 'none') {
            gachaMachine.style.display = 'block';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            gachaMachine.style.display = 'none';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });
});
