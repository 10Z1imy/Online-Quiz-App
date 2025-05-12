import React, { useState, useEffect } from 'react';
import './styles.css';

const Home = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [activeScreen, setActiveScreen] = useState(null);
    const [description, setDescription] = useState('点击任意表情查看描述');
    const [screens, setScreens] = useState([
        { emoji: '🎮', description: '这是一个充满活力的表情，代表快乐和积极' },
        { emoji: '🎲', description: '这是一个可爱的表情，代表温暖和友善' },
        { emoji: '🎯', description: '这是一个神秘的表情，代表未知和探索' }
    ]);

    const emojis = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎫', '🎬', '🎵', '🎹', '🎸', '🎺', '🎻', '🎼', '🎧', '🎤', '🎭', '🎪', '🎨', '🎯'];
    const descriptions = {
        '🎮': '这是一个充满活力的表情，代表快乐和积极',
        '🎲': '这是一个可爱的表情，代表温暖和友善',
        '🎯': '这是一个神秘的表情，代表未知和探索',
        // ... 其他描述
    };

    const getRandomEmoji = () => {
        return emojis[Math.floor(Math.random() * emojis.length)];
    };

    const updateScreens = () => {
        const newScreens = screens.map(() => ({
            emoji: getRandomEmoji(),
            description: descriptions[getRandomEmoji()] || '这是一个神秘的表情'
        }));
        setScreens(newScreens);
        setDescription('点击任意表情查看描述');
        setActiveScreen(null);
    };

    const handleLeverClick = () => {
        if (isSpinning) return;
        
        setIsSpinning(true);
        
        setTimeout(() => {
            setIsSpinning(false);
            updateScreens();
        }, 2000);
    };

    const handleScreenClick = (index) => {
        if (isSpinning) return;
        
        if (activeScreen === index) {
            setActiveScreen(null);
            setDescription('点击任意表情查看描述');
        } else {
            setActiveScreen(index);
            setDescription(screens[index].description);
        }
    };

    return (
        <div className="section page1">
            <div className="page1-container">
                {/* 左侧白色块 */}
                <section className="left-section">
                    <div className="section-content">
                        <div className="gacha-machine">
                            <div className="description-window">
                                <p>{description}</p>
                            </div>
                            <div className="display-screens">
                                {screens.map((screen, index) => (
                                    <div 
                                        key={index}
                                        className={`screen ${activeScreen === index ? 'active' : ''}`}
                                        onClick={() => handleScreenClick(index)}
                                    >
                                        <span className={`emoji ${isSpinning ? 'spinning' : ''}`}>
                                            {screen.emoji}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="lever" onClick={handleLeverClick}>
                                <div className="lever-handle"></div>
                                <div className="lever-base"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 右上角图片展示 */}
                <section className="image-showcase">
                    <div className="section-content">
                        <img src="/img/your-image.jpg" alt="展示图片" />
                    </div>
                </section>

                {/* MY RECIPE组件 */}
                <section id="home" className="recipe-section">
                    <div className="section-content">
                        <div className="hero">
                            <h1>MY RECIPE</h1>
                            <p>Wind chimes, handpan music, opal.</p>
                            {/* 音乐播放器组件将在后续添加 */}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home; 