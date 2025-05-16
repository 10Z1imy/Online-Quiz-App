import { useState, useEffect } from 'react';
import fallingMusic from '../assets/music/falling.mp3';
import replayMusic from '../assets/music/replay.mp3';

const songList = [
  {
    id: 'falling',
    src: fallingMusic,
    title: 'Falling'
  },
  {
    id: 'replay',
    src: replayMusic,
    title: 'Replay'
  }
];

export const useSongs = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songs] = useState(songList);

  const nextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
  };

  return {
    songs,
    currentSong: songs[currentSongIndex],
    nextSong
  };
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default {
  useSongs,
  formatTime
}; 