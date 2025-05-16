import React, { useState } from 'react';

const GachaMachine = () => {
  const [currentDescription, setCurrentDescription] = useState('点击任意表情查看描述');
  const [isLeverPulled, setIsLeverPulled] = useState(false);
  
  const emojis = [
    { emoji: '🎮', description: '这是一个充满活力的表情，代表快乐和积极' },
    { emoji: '🎲', description: '这是一个可爱的表情，代表温暖和友善' },
    { emoji: '🎯', description: '这是一个神秘的表情，代表未知和探索' }
  ];

  const handleEmojiClick = (description) => {
    setCurrentDescription(description);
  };

  const handleLeverClick = () => {
    setIsLeverPulled(true);
    
    // 随机选择一个emoji显示动画
    const randomEmoji = Math.floor(Math.random() * emojis.length);
    
    // 动画结束后重置杠杆状态
    setTimeout(() => {
      setIsLeverPulled(false);
    }, 1000);
  };

  return (
    <div className="gacha-machine">
      <div className="description-window">
        <p>{currentDescription}</p>
      </div>
      <div className="display-screens">
        {emojis.map((item, index) => (
          <div 
            key={index}
            className="screen" 
            onClick={() => handleEmojiClick(item.description)}
          >
            <span className="emoji">{item.emoji}</span>
          </div>
        ))}
      </div>
      <div 
        className={`lever ${isLeverPulled ? 'pulled' : ''}`}
        onClick={handleLeverClick}
      >
        <div className="lever-handle"></div>
        <div className="lever-base"></div>
      </div>
    </div>
  );
};

export default GachaMachine; 