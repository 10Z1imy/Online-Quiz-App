import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import SecondPage from './components/SecondPage';
import './App.css';

function App() {
    const [currentPage, setCurrentPage] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        const handleWheel = (e) => {
            if (isScrolling) return;

            if (e.deltaY > 0 && currentPage < 1) {
                setIsScrolling(true);
                setCurrentPage(prev => prev + 1);
                setTimeout(() => setIsScrolling(false), 1000);
            } else if (e.deltaY < 0 && currentPage > 0) {
                setIsScrolling(true);
                setCurrentPage(prev => prev - 1);
                setTimeout(() => setIsScrolling(false), 1000);
            }
        };

        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [currentPage, isScrolling]);

    return (
        <div className="app">
            <div 
                className="pages-container"
                style={{
                    transform: `translateY(-${currentPage * 100}vh)`,
                    transition: 'transform 1s ease-in-out'
                }}
            >
                <Home />
                <SecondPage />
            </div>
        </div>
    );
}

export default App; 