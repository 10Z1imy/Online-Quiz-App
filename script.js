// 音乐播放器控制
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
const lyricsContainer = document.querySelector('.lyrics');
let songs = [];
let currentSongIndex = 0;
let lyrics = [];
let currentLyricIndex = 0;
let lyricsInterval;
let isPlaying = false;

// 歌词控制面板
const startXInput = document.getElementById('start-x');
const endXInput = document.getElementById('end-x');
const rotationInput = document.getElementById('rotation');
const spreadInput = document.getElementById('spread');
const directionCircle = document.querySelector('.direction-circle');
const directionPointer = document.querySelector('.direction-pointer');
const startXValue = document.getElementById('start-x-value');
const endXValue = document.getElementById('end-x-value');
const rotationValue = document.getElementById('rotation-value');
const spreadValue = document.getElementById('spread-value');

// 方向控制变量
let directionX = 0;
let directionY = -1; // 默认向上

// 更新CSS变量
function updateAnimationVariables() {
    document.documentElement.style.setProperty('--start-x', `${startXInput.value}px`);
    document.documentElement.style.setProperty('--rotation', `${rotationInput.value}deg`);
    
    // 计算结束位置
    const distance = 1000; // 移动距离
    const endX = directionX * distance;
    const endY = directionY * distance;
    document.documentElement.style.setProperty('--end-x', `${endX}px`);
    document.documentElement.style.setProperty('--end-y', `${endY}px`);
}

// 更新指针位置
function updatePointerPosition(x, y) {
    const rect = directionCircle.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 计算相对于圆心的位置
    const relX = x - rect.left - centerX;
    const relY = y - rect.top - centerY;
    
    // 计算角度
    const angle = Math.atan2(relY, relX);
    
    // 计算单位向量
    directionX = Math.cos(angle);
    directionY = Math.sin(angle);
    
    // 更新指针位置
    const radius = Math.min(centerX, centerY) - 10;
    const pointerX = centerX + directionX * radius;
    const pointerY = centerY + directionY * radius;
    
    directionPointer.style.transform = `translate(${pointerX - centerX}px, ${pointerY - centerY}px)`;
    
    // 更新动画
    updateAnimationVariables();
}

// 添加拖拽事件
let isDragging = false;

directionCircle.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePointerPosition(e.clientX, e.clientY);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updatePointerPosition(e.clientX, e.clientY);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// 添加事件监听器
startXInput.addEventListener('input', () => {
    startXValue.textContent = `${startXInput.value}px`;
    updateAnimationVariables();
});

rotationInput.addEventListener('input', () => {
    rotationValue.textContent = `${rotationInput.value}°`;
    updateAnimationVariables();
});

spreadInput.addEventListener('input', () => {
    spreadValue.textContent = `${spreadInput.value}%`;
});

// 初始化CSS变量
updateAnimationVariables();

// 歌词数据
const lyricsData = {
    'falling.mp3': [
        { time: 4, text: "It's something about you baby" },
        { time: 10, text: "That drives me wild and drives me crazy" },
        { time: 13, text: "Oh" },
        { time: 16, text: "I Don't know what I can't explain it" },
        { time: 18, text: "No" },
        { time: 19, text: "But you got me under your spell" },
        { time: 21, text: "You got me, you got me gone I can tell" },
        { time: 24, text: "Oh" },
        { time: 25, text: "Cause lately I've been feeling things I" },
        { time: 27, text: "Things I never felt before" },
        { time: 30, text: "I'm not sure where this could go" },
        { time: 32, text: "But all I, all I know is that when" },
        { time: 34, text: "When I'm around you" },
        { time: 37, text: "All I do is stumble" },
        { time: 38, text: "Don't know what it is" },
        { time: 41, text: "That's got me falling for you baby" },
        { time: 44, text: "When I miss you" },
        { time: 46, text: "Sometimes I start trippin'" },
        { time: 49, text: "Don't know what it is" },
        { time: 51, text: "That's got me falling for you baby" },
        { time: 55, text: "Yeah, Oh" },
        { time: 57, text: "See my heart starts racing" },
        { time: 58, text: "When I look into your eyes" },
        { time: 61, text: "Cause you're nothing short of amazing" },
        { time: 63, text: "I'll tell you a million times" },
        { time: 66, text: "Oh" },
        { time: 67, text: "And I don't want nobody else (nobody else)" },
        { time: 69, text: "Cause you got me under your spell" },
        { time: 71, text: "You got me, you got me gone I can tell" },
        { time: 74, text: "Oh" },
        { time: 74, text: "Cause lately I've been feeling things" },
        { time: 77, text: "Things I never felt before" },
        { time: 80, text: "I'm not sure where this could go" },
        { time: 82, text: "But all I, all I know is that when" },
        { time: 85, text: "When I'm around you" },
        { time: 87, text: "All I do is stumble" },
        { time: 89, text: "Don't know what it is" },
        { time: 91, text: "That's got me falling for you baby" },
        { time: 95, text: "When I miss you" },
        { time: 97, text: "Sometimes I start trippin'" },
        { time: 99, text: "Don't know what it is" },
        { time: 101, text: "That's got me falling for you baby" },
        { time: 105, text: "Oh Oh Oh Oh" },
        { time: 106, text: "Oh Oh Oh Oh" },
        { time: 108, text: "Oh Oh Oh Oh" },
        { time: 112, text: "I'm falling for you baby" },
        { time: 115, text: "Oh Oh Oh Oh" },
        { time: 121, text: "Oh Oh Oh Oh (tell me girl)" },
        { time: 126, text: "Oh Oh Oh Oh" },
        { time: 126, text: "I'm falling for you" },
        { time: 127, text: "When I'm around you" },
        { time: 128, text: "All I do is stumble" },
        { time: 129, text: "Don't know what it is" },
        { time: 132, text: "That's got me falling for you baby" },
        { time: 135, text: "When I miss you" },
        { time: 137, text: "Sometimes I start trippin'" },
        { time: 140, text: "Don't know what it is" },
        { time: 142, text: "That's got me falling for you baby" },
        { time: 146, text: "Yeah" }
    ],
    'replay.mp3': [
        { time: -3, text: "Shawty's like a melody in my head" },
        { time: 0, text: "That I can't keep out" },
        { time: 3, text: "Got me singin' like" },
        { time: 6, text: "Na na na na everyday" },
        { time: 9, text: "It's like my iPod's stuck on replay" },
        { time: 12, text: "Replay-ay-ay-ay" },
        { time: 15, text: "Shawty's like a melody in my head" },
        { time: 18, text: "That I can't keep out" },
        { time: 21, text: "Got me singin' like" },
        { time: 24, text: "Na na na na everyday" },
        { time: 27, text: "It's like my iPod's stuck on replay" },
        { time: 30, text: "Replay-ay-ay-ay" },
        { time: 33, text: "See you been all around the globe" },
        { time: 36, text: "Not once did you leave my mind" },
        { time: 39, text: "We talk on the phone, from night til the morn" },
        { time: 42, text: "Girl you really change my life" },
        { time: 45, text: "Doin' things I never do" },
        { time: 48, text: "I'm in the kitchen cookin' things she likes" },
        { time: 51, text: "We're real worldwide, breakin' all the rules" },
        { time: 54, text: "Someday I wanna make you my wife" },
        { time: 57, text: "That girl, like something off a poster" },
        { time: 60, text: "That girl, is a dime they say" },
        { time: 63, text: "That girl, is a gun to my holster" },
        { time: 66, text: "She's running through my mind all day" },
        { time: 69, text: "Shawty's like a melody in my head" },
        { time: 72, text: "That I can't keep out" },
        { time: 75, text: "Got me singin' like" },
        { time: 78, text: "Na na na na everyday" },
        { time: 81, text: "It's like my iPod's stuck on replay" },
        { time: 84, text: "Replay-ay-ay-ay" },
        { time: 87, text: "Shawty's like a melody in my head" },
        { time: 90, text: "That I can't keep out" },
        { time: 93, text: "Got me singin' like" },
        { time: 96, text: "Na na na na everyday" },
        { time: 99, text: "It's like my iPod's stuck on replay" },
        { time: 102, text: "Replay-ay-ay-ay" }
    ]
};

// 获取当前歌曲的歌词数据
function getCurrentLyrics() {
    const currentSong = songs[currentSongIndex];
    return lyricsData[currentSong] || [];
}

// 创建歌词元素
function createLyric(text) {
    const lyric = document.createElement('div');
    lyric.className = 'lyric';
    lyric.textContent = text;
    
    // 使用分散程度控制随机范围
    const spread = parseInt(spreadInput.value);
    const x = Math.random() * (window.innerWidth * (spread / 100));
    lyric.style.left = `${x}px`;
    
    // 如果暂停，暂停动画
    if (!isPlaying) {
        lyric.style.animationPlayState = 'paused';
    }
    
    lyricsContainer.appendChild(lyric);
    
    // 动画结束后移除元素
    lyric.addEventListener('animationend', () => {
        lyric.remove();
    });
}

// 检查并显示歌词
function checkLyrics() {
    if (!isPlaying) return;
    
    const currentTime = audio.currentTime;
    const currentLyrics = getCurrentLyrics();
    
    while (currentLyricIndex < currentLyrics.length && 
           currentTime >= currentLyrics[currentLyricIndex].time) {
        createLyric(currentLyrics[currentLyricIndex].text);
        currentLyricIndex++;
    }
}

// 暂停所有歌词动画
function pauseAllLyrics() {
    const allLyrics = document.querySelectorAll('.lyric');
    allLyrics.forEach(lyric => {
        lyric.style.animationPlayState = 'paused';
    });
}

// 继续所有歌词动画
function resumeAllLyrics() {
    const allLyrics = document.querySelectorAll('.lyric');
    allLyrics.forEach(lyric => {
        lyric.style.animationPlayState = 'running';
    });
}

// 获取music文件夹中的所有MP3文件
fetch('music/')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');
        
        songs = Array.from(links)
            .map(link => link.href)
            .filter(href => href.endsWith('.mp3'))
            .map(href => href.split('/').pop());
        
        if (songs.length > 0) {
            currentSongIndex = Math.floor(Math.random() * songs.length);
            audio.src = 'music/' + songs[currentSongIndex];
        }
    })
    .catch(error => console.error('Error loading music files:', error));

// 播放/暂停控制
playBtn.addEventListener('click', function() {
    if (audio.paused) {
        audio.play();
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        resumeAllLyrics();
        if (!lyricsInterval) {
            lyricsInterval = setInterval(checkLyrics, 100);
        }
    } else {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        pauseAllLyrics();
    }
});

// 切歌控制
nextBtn.addEventListener('click', function() {
    if (songs.length > 0) {
        currentSongIndex = Math.floor(Math.random() * songs.length);
        audio.src = 'music/' + songs[currentSongIndex];
        audio.play();
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        currentLyricIndex = 0;
        if (lyricsInterval) {
            clearInterval(lyricsInterval);
        }
        lyricsInterval = setInterval(checkLyrics, 100);
        resumeAllLyrics();
    }
});

// 歌曲结束时自动播放下一首
audio.addEventListener('ended', function() {
    if (songs.length > 0) {
        currentSongIndex = Math.floor(Math.random() * songs.length);
        audio.src = 'music/' + songs[currentSongIndex];
        audio.play();
        isPlaying = true;
        currentLyricIndex = 0;
        if (lyricsInterval) {
            clearInterval(lyricsInterval);
        }
        lyricsInterval = setInterval(checkLyrics, 100);
        resumeAllLyrics();
    }
});
