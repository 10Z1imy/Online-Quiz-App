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

// 示例歌词数据，您需要根据实际音乐时间点修改
const lyricsData = [
    { time: 0, text: "Welcome to my world" },
    { time: 3, text: "Where dreams come true" },
    { time: 6, text: "Let's dance together" },
    { time: 9, text: "In the moonlight" },
    { time: 12, text: "Feel the rhythm" },
    { time: 15, text: "Of our hearts" },
    { time: 18, text: "Dancing in the dark" },
    { time: 21, text: "Under the stars" }
];

// 创建歌词元素
function createLyric(text) {
    console.log('Creating lyric:', text); // 添加调试信息
    const lyric = document.createElement('div');
    lyric.className = 'lyric';
    lyric.textContent = text;
    
    // 随机水平位置
    const x = Math.random() * window.innerWidth;
    lyric.style.left = `${x}px`;
    
    lyricsContainer.appendChild(lyric);
    console.log('Lyric added to container'); // 添加调试信息
    
    // 动画结束后移除元素
    lyric.addEventListener('animationend', () => {
        console.log('Lyric animation ended:', text); // 添加调试信息
        lyric.remove();
    });
}

// 检查并显示歌词
function checkLyrics() {
    const currentTime = audio.currentTime;
    console.log('Checking lyrics at time:', currentTime); // 添加调试信息
    
    while (currentLyricIndex < lyricsData.length && 
           currentTime >= lyricsData[currentLyricIndex].time) {
        createLyric(lyricsData[currentLyricIndex].text);
        currentLyricIndex++;
    }
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
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        // 开始检查歌词
        lyricsInterval = setInterval(checkLyrics, 100);
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        // 暂停时清除定时器
        clearInterval(lyricsInterval);
    }
});

// 切歌控制
nextBtn.addEventListener('click', function() {
    if (songs.length > 0) {
        currentSongIndex = Math.floor(Math.random() * songs.length);
        audio.src = 'music/' + songs[currentSongIndex];
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        // 重置歌词索引
        currentLyricIndex = 0;
        // 清除旧的定时器并创建新的
        clearInterval(lyricsInterval);
        lyricsInterval = setInterval(checkLyrics, 100);
    }
});

// 歌曲结束时自动播放下一首
audio.addEventListener('ended', function() {
    if (songs.length > 0) {
        currentSongIndex = Math.floor(Math.random() * songs.length);
        audio.src = 'music/' + songs[currentSongIndex];
        audio.play();
        // 重置歌词索引
        currentLyricIndex = 0;
        // 清除旧的定时器并创建新的
        clearInterval(lyricsInterval);
        lyricsInterval = setInterval(checkLyrics, 100);
    }
});
