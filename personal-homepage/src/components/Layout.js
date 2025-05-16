import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import SideNav from './SideNav';

const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(0);

  // 处理滚轮事件
  const handleWheel = (e) => {
    const now = Date.now();
    // 防止滚动过快，设置最小间隔时间
    if (now - lastScrollTime < 1000 || isScrolling) return;
    
    setLastScrollTime(now);

    // 向下滚动
    if (e.deltaY > 0 && !isScrolled) {
      setIsScrolling(true);
      setIsScrolled(true);
      setTimeout(() => setIsScrolling(false), 800); // 动画持续时间
    } 
    // 向上滚动
    else if (e.deltaY < 0 && isScrolled) {
      setIsScrolling(true);
      setIsScrolled(false);
      setTimeout(() => setIsScrolling(false), 800); // 动画持续时间
    }
  };

  // 添加滚轮事件监听
  useEffect(() => {
    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isScrolled, isScrolling, lastScrollTime]);

  return (
    <>
      {/* 歌词容器 */}
      <div className="lyrics-container">
        <div className="lyrics"></div>
      </div>
      
      <SideNav />
      <Navbar />
      
      <main className={`fullpage-container ${isScrolled ? 'scrolled' : ''}`}>
        {children}
      </main>
    </>
  );
};

export default Layout; 