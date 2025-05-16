import React, { useState, useEffect, useRef } from 'react';
import { useSongs } from '../utils/musicUtils';
import { useLyrics } from '../utils/lyricsUtils';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [error, setError] = useState(null);
  const { songs, currentSong, nextSong } = useSongs();
  const audioRef = useRef(null);
  const { playLyrics, pauseLyrics } = useLyrics(audioRef, currentSong);

  useEffect(() => {
    // 音频播放状态改变时更新UI
    const handlePlayState = () => {
      const playing = !audioRef.current.paused;
      setIsPlaying(playing);
      if (playing) {
        playLyrics();
      } else {
        pauseLyrics();
      }
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setError('音频加载失败');
      setIsPlaying(false);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('play', handlePlayState);
      audioRef.current.addEventListener('pause', handlePlayState);
      audioRef.current.addEventListener('ended', handleNext);
      audioRef.current.addEventListener('error', handleError);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlayState);
        audioRef.current.removeEventListener('pause', handlePlayState);
        audioRef.current.removeEventListener('ended', handleNext);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, [currentSong]);

  const togglePlay = () => {
    if (!currentSong) return;
    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('播放失败:', error);
          setError('播放失败，请重试');
        });
      }
    } else {
      audioRef.current.pause();
    }
  };

  const handleNext = () => {
    nextSong();
    setError(null);
    if (isPlaying) {
      setTimeout(() => {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('播放下一首失败:', error);
            setError('播放失败，请重试');
          });
        }
      }, 100);
    }
  };

  const toggleLyricsPanel = () => {
    setShowLyricsPanel(!showLyricsPanel);
    const event = new CustomEvent('toggleLyricsPanel', {
      detail: { show: !showLyricsPanel }
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="player">
      <audio 
        ref={audioRef} 
        src={currentSong?.src} 
        preload="auto"
        onLoadStart={() => setError(null)}
      >
        您的浏览器不支持音频播放
      </audio>
      {error && <div className="error-message">{error}</div>}
      <div className="controls">
        <button onClick={togglePlay} id="play-btn" disabled={!currentSong}>
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
        <button onClick={handleNext} id="next-btn">
          <i className="fas fa-forward"></i>
        </button>
        <button 
          onClick={toggleLyricsPanel} 
          id="settings-btn"
          className={showLyricsPanel ? 'active' : ''}
        >
          <i className="fas fa-cog"></i>
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer; 