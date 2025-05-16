import React from 'react';
import Layout from './Layout';
import profileImage from '../assets/images/IMG_5048.PNG';

const WingsPage = () => {
  return (
    <Layout>
      <div className="wings-page">
        <h1>作品集</h1>
        <div className="portfolio-container">
          {/* 这里可以根据原来的wings.html内容进行转换 */}
          <div className="portfolio-item">
            <img src={profileImage} alt="作品1" />
            <h3>作品标题1</h3>
            <p>作品描述...</p>
          </div>
          <div className="portfolio-item">
            <img src={profileImage} alt="作品2" />
            <h3>作品标题2</h3>
            <p>作品描述...</p>
          </div>
          <div className="portfolio-item">
            <img src={profileImage} alt="作品3" />
            <h3>作品标题3</h3>
            <p>作品描述...</p>
          </div>
          {/* 更多作品项目 */}
        </div>
      </div>
    </Layout>
  );
};

export default WingsPage; 