import { useState, useEffect, useCallback } from 'react';
import lyricsData from '../data/lyrics';

export const useLyrics = (audioRef, currentSong) => {
    const [currentLyrics, setCurrentLyrics] = useState(null);
    const [isLyricsPlaying, setIsLyricsPlaying] = useState(false);
    const [currentLyricIndex, setCurrentLyricIndex] = useState(0);

    const checkLyrics = useCallback(() => {
        if (!isLyricsPlaying || !audioRef?.current || !currentSong) return;
        
        const currentTime = audioRef.current.currentTime;
        const songLyrics = lyricsData[currentSong.id] || [];
        
        if (currentLyricIndex < songLyrics.length && 
            currentTime >= songLyrics[currentLyricIndex].time) {
            setCurrentLyrics(songLyrics[currentLyricIndex]);
            setCurrentLyricIndex(prev => prev + 1);
        }
    }, [audioRef, currentSong, isLyricsPlaying, currentLyricIndex]);

    useEffect(() => {
        const interval = setInterval(checkLyrics, 100);
        return () => clearInterval(interval);
    }, [checkLyrics]);

    useEffect(() => {
        // 当歌曲改变时重置歌词
        setCurrentLyricIndex(0);
        setCurrentLyrics(null);
    }, [currentSong]);

    const playLyrics = useCallback(() => {
        setIsLyricsPlaying(true);
    }, []);

    const pauseLyrics = useCallback(() => {
        setIsLyricsPlaying(false);
    }, []);

    return {
        currentLyrics,
        isLyricsPlaying,
        playLyrics,
        pauseLyrics
    };
};

export default useLyrics; 