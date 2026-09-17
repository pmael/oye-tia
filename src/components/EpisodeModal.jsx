import { useEffect } from 'react';
import { motion } from 'framer-motion';
import './EpisodeModal.css';

function EpisodeModal({ episode, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="episode-modal__backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="episode-modal__panel"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={episode.title}
      >
        <button
          type="button"
          className="episode-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <img className="episode-modal__cover" src={episode.cover} alt={episode.title} />
        <div className="episode-modal__info">
          <h3 className="episode-modal__title">{episode.title}</h3>
          <span className="episode-modal__duration">{episode.duration}</span>
          <p className="episode-modal__description">{episode.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EpisodeModal;
