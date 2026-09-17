import { motion } from 'framer-motion';
import './EpisodeCard.css';

function EpisodeCard({ episode, onSelect }) {
  const available = episode.available !== false;

  return (
    <motion.button
      type="button"
      className="episode-card"
      onClick={available ? () => onSelect(episode) : undefined}
      disabled={!available}
      whileHover={available ? { scale: 1.06 } : undefined}
      whileFocus={available ? { scale: 1.06 } : undefined}
      transition={{ duration: 0.25 }}
    >
      <img className="episode-card__cover" src={episode.cover} alt={episode.title} />
      <div className="episode-card__overlay">
        {available && <span className="episode-card__play">▶</span>}
        <h3 className="episode-card__title">{episode.title}</h3>
        <p className="episode-card__description">{episode.description}</p>
        <span className="episode-card__duration">{episode.duration}</span>
      </div>
    </motion.button>
  );
}

export default EpisodeCard;
