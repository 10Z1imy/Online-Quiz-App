import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="logo">Mental Port 1021</div>
        <div className="nav-links">
          <Link to="/">Lets Play</Link>
          <Link to="/#about">Intro</Link>
          <Link to="/#contact">Contact</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 