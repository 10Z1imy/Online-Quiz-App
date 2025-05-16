import React from 'react';
import { Link } from 'react-router-dom';

const SideNav = () => {
  return (
    <div className="side-nav">
      <div className="side-nav-content">
        <Link to="/"><i className="fas fa-home"></i> 首页</Link>
        <Link to="/wings"><i className="fas fa-palette"></i> 作品集</Link>
        <Link to="/page3"><i className="fas fa-book"></i> 文段展示1</Link>
        <Link to="/page4"><i className="fas fa-laptop-code"></i> 文段展示2</Link>
      </div>
    </div>
  );
};

export default SideNav; 