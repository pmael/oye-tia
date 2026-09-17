import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import CinematicScroll from './components/CinematicScroll';
import EpisodeModal from './components/EpisodeModal';
import PlayerBar from './components/PlayerBar';
import './App.css';

function App() {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  // Separate from selectedEpisode (which only controls the info modal) so playback keeps
  // going in the bottom bar after the modal is closed, like SoundCloud's persistent player.
  const [nowPlaying, setNowPlaying] = useState(null);

  const handleSelectEpisode = (episode) => {
    setSelectedEpisode(episode);
    setNowPlaying(episode);
  };

  return (
    <div className="App">
      <Hero />
      <CinematicScroll onSelectEpisode={handleSelectEpisode} />
      <AnimatePresence>
        {selectedEpisode && (
          <EpisodeModal episode={selectedEpisode} onClose={() => setSelectedEpisode(null)} />
        )}
      </AnimatePresence>
      <PlayerBar episode={nowPlaying} />
    </div>
  );
}

export default App;
