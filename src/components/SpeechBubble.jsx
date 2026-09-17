import { motion, useTransform } from 'framer-motion';
import './SpeechBubble.css';

// Bubble scales in, holds, then "pops" (overshoots and fades) near the end of `range`.
function SpeechBubble({ progress, range, name, image, align = 'right' }) {
  const [start, end] = range;
  const span = end - start;
  const inEnd = start + span * 0.18;
  const popStart = start + span * 0.8;

  const scale = useTransform(progress, [start, inEnd, popStart, end], [0.4, 1, 1, 1.4]);
  const opacity = useTransform(progress, [start, inEnd, popStart, end], [0, 1, 1, 0]);

  return (
    <motion.img
      className={`speech-bubble speech-bubble--${align}`}
      src={image}
      alt={name}
      style={{ scale, opacity }}
    />
  );
}

export default SpeechBubble;
