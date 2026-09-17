import { useEffect, useRef, useState } from 'react';
import './PlayerBar.css';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function PlayerBar({ episode }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!episode) return;
    setCurrentTime(0);
    setDuration(0);
    const audio = audioRef.current;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [episode]);

  if (!episode) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSeek = (event) => {
    const ratio = Number(event.target.value) / 100;
    const audio = audioRef.current;
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const handleVolume = (event) => {
    const value = Number(event.target.value) / 100;
    audioRef.current.volume = value;
    setVolume(value);
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-bar">
      <audio
        ref={audioRef}
        src={episode.audioSrc}
        onTimeUpdate={(event) => setCurrentTime(event.target.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.target.duration)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <div className="player-bar__track">
        <img className="player-bar__cover" src={episode.cover} alt="" />
        <span className="player-bar__title">{episode.title}</span>
      </div>

      <div className="player-bar__transport">
        <button
          type="button"
          className="player-bar__button player-bar__button--play"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          className="player-bar__button"
          onClick={stop}
          aria-label="Detener"
        >
          ■
        </button>
        <span className="player-bar__time">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="player-bar__seek"
          min="0"
          max="100"
          step="0.1"
          value={progressPct}
          onChange={handleSeek}
          aria-label="Progreso"
        />
        <span className="player-bar__time">{formatTime(duration)}</span>
      </div>

      <div className="player-bar__volume">
        <span className="player-bar__volume-icon" aria-hidden="true">
          🔊
        </span>
        <input
          type="range"
          className="player-bar__volume-slider"
          min="0"
          max="100"
          step="1"
          value={volume * 100}
          onChange={handleVolume}
          aria-label="Volumen"
        />
      </div>
    </div>
  );
}

export default PlayerBar;
