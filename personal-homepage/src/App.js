import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import WingsPage from './components/WingsPage';
import Page3 from './components/Page3';
import Page4 from './components/Page4';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wings" element={<WingsPage />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/page4" element={<Page4 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
