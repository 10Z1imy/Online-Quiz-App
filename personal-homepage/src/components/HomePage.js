import React from 'react';
import MusicPlayer from './MusicPlayer';
import GachaMachine from './GachaMachine';
import ContactInfo from './ContactInfo';
import ProfileSection from './ProfileSection';
import LyricsDisplay from './LyricsDisplay';
import Layout from './Layout';
import showcaseImage from '../assets/images/IMG5124.PNG';

const HomePage = () => {
  return (
    <Layout>
      {/* 第一页：MY RECIPE */}
      <div className="section page1">
        <div className="page1-container">
          {/* 左侧白色块 */}
          <section className="left-section">
            <div className="section-content">
              <GachaMachine />
            </div>
          </section>

          {/* 右上角图片展示 */}
          <section className="image-showcase">
            <div className="section-content">
              <img src={showcaseImage} alt="展示图片" />
            </div>
          </section>

          {/* MY RECIPE组件 - 右下角1/6 */}
          <section id="home" className="recipe-section">
            <div className="section-content">
              <div className="hero">
                <h1>MY RECIPE</h1>
                <p>Wind chimes, handpan music, opal.</p>
                <MusicPlayer />
              </div>
            </div>
          </section>

          {/* 歌词控制面板 */}
          <LyricsDisplay />
        </div>
      </div>

      {/* 第二页：Archives和Contact */}
      <div className="section page2">
        <div className="page2-container">
          {/* Contact部分 - 左上角1/4 */}
          <ContactInfo />

          {/* 左下角组件 */}
          <section className="bottom-left-section">
            <div className="section-content">
              <h2>左下角组件</h2>
              <p>这里可以放置任何内容</p>
            </div>
          </section>

          {/* Archives部分 - 右侧1/2 */}
          <ProfileSection />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 