import React, { useState, useEffect, useRef } from 'react';
import { useLyrics } from '../utils/lyricsUtils';
import '../styles/Lyrics.css';

const LyricsDisplay = () => {
  const [rotation, setRotation] = useState(315);
  const [directionX, setDirectionX] = useState(0);
  const [directionY, setDirectionY] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const directionCircleRef = useRef(null);
  const directionPointerRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  
  const { currentLyrics, isLyricsPlaying } = useLyrics();

  // 创建歌词元素
  const createLyric = (text) => {
    if (!lyricsContainerRef.current) return;

    const lyric = document.createElement('div');
    lyric.className = 'lyric';
    lyric.textContent = `⭐ ${text} ⭐`;
    
    // 固定分散程度为15%
    const spread = 15;
    const x = Math.random() * (window.innerWidth * (spread / 100));
    lyric.style.left = `${x}px`;
    
    // 设置动画变量
    lyric.style.setProperty('--rotation', `${rotation}deg`);
    lyric.style.setProperty('--start-x', `${-directionX * 2000}px`);
    lyric.style.setProperty('--start-y', `${-directionY * 2000}px`);
    lyric.style.setProperty('--end-x', `${directionX * 2000}px`);
    lyric.style.setProperty('--end-y', `${directionY * 2000}px`);
    
    // 如果暂停，暂停动画
    if (!isLyricsPlaying) {
      lyric.style.animationPlayState = 'paused';
    }
    
    lyricsContainerRef.current.appendChild(lyric);
    
    // 动画结束后移除元素
    lyric.addEventListener('animationend', () => {
      lyric.remove();
    });
  };

  // 监听歌词变化
  useEffect(() => {
    if (currentLyrics && isLyricsPlaying) {
      createLyric(currentLyrics.text);
    }
  }, [currentLyrics, isLyricsPlaying]);

  // 更新CSS变量
  const updateAnimationVariables = () => {
    document.documentElement.style.setProperty('--rotation', `${rotation}deg`);
    
    // 计算移动距离
    const distance = 2000;
    
    // 计算小球的对角位置（起始位置）
    const startX = -directionX * distance;
    const startY = -directionY * distance;
    
    // 设置起始位置
    document.documentElement.style.setProperty('--start-x', `${startX}px`);
    document.documentElement.style.setProperty('--start-y', `${startY}px`);
    
    // 设置结束位置（指向小球位置）
    const endX = directionX * distance;
    const endY = directionY * distance;
    document.documentElement.style.setProperty('--end-x', `${endX}px`);
    document.documentElement.style.setProperty('--end-y', `${endY}px`);
  };

  // 更新指针位置
  const updatePointerPosition = (x, y) => {
    if (!directionCircleRef.current) return;
    
    const rect = directionCircleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 计算相对于圆心的位置
    const relX = x - centerX;
    const relY = y - centerY;
    
    // 计算到圆心的距离
    const distance = Math.sqrt(relX * relX + relY * relY);
    const radius = rect.width / 2 - 8;
    
    // 如果距离超过半径，将点限制在圆上
    let finalX = relX;
    let finalY = relY;
    if (distance > radius) {
      const ratio = radius / distance;
      finalX = relX * ratio;
      finalY = relY * ratio;
    }
    
    // 计算角度
    const angle = Math.atan2(finalY, finalX);
    
    // 计算单位向量
    setDirectionX(Math.cos(angle));
    setDirectionY(Math.sin(angle));
    
    // 更新指针位置
    if (directionPointerRef.current) {
      directionPointerRef.current.style.transform = `translate(${finalX}px, ${finalY}px)`;
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updatePointerPosition(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      updatePointerPosition(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotationChange = (e) => {
    setRotation(e.target.value);
  };

  // 监听拖动事件
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 更新动画变量
  useEffect(() => {
    updateAnimationVariables();
  }, [rotation, directionX, directionY]);

  // 监听控制面板显示/隐藏
  useEffect(() => {
    const handleToggle = (e) => {
      setIsVisible(e.detail.show);
    };

    document.addEventListener('toggleLyricsPanel', handleToggle);
    return () => {
      document.removeEventListener('toggleLyricsPanel', handleToggle);
    };
  }, []);

  return (
    <>
      <div className={`lyrics-control-panel ${isVisible ? 'show' : ''}`}>
        <div className="control-group">
          <label htmlFor="rotation">倾斜角度：</label>
          <input 
            type="range" 
            id="rotation" 
            min="0" 
            max="360" 
            value={rotation}
            onChange={handleRotationChange}
          />
          <span id="rotation-value">{rotation}°</span>
        </div>
        <div className="control-group direction-control">
          <label>移动方向：</label>
          <div 
            className="direction-circle" 
            ref={directionCircleRef}
            onMouseDown={handleMouseDown}
          >
            <div className="direction-pointer" ref={directionPointerRef}></div>
          </div>
        </div>
      </div>
      <div className="lyrics-container" ref={lyricsContainerRef}></div>
    </>
  );
};

export default LyricsDisplay; 