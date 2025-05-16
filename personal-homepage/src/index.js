import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 导入Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

// 导入CSS样式文件
import './styles/Layout.css';
import './styles/Navbar.css';
import './styles/SideNav.css';
import './styles/HomePage.css';
import './styles/ProfileSection.css';
import './styles/ContactInfo.css';
import './styles/MusicPlayer.css';
import './styles/LyricsDisplay.css';
import './styles/GachaMachine.css';
import './styles/ContentPages.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
