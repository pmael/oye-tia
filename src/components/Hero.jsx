import { motion } from 'framer-motion';
import { podcast } from '../data/content';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <motion.img
          className="hero__cover"
          src={podcast.coverImage}
          alt={`Carátula de ${podcast.name}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        />
        <motion.div
          className="hero__text"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <h1 className="hero__title">{podcast.name}</h1>
          <p className="hero__tagline">{podcast.tagline}</p>
          <p className="hero__description">{podcast.description}</p>
          <div className="hero__links">
            {podcast.links.map((link) => (
              <a key={link.label} href={link.url} className="hero__link">
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll-cue"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <span>Desplázate</span>
        <motion.div
          className="hero__scroll-arrow"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}

export default Hero;
