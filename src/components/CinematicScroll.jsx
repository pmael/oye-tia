import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import benchSceneBg from '../assets/images/bench-scene-bg.png';
import elenaBust from '../assets/images/elena-bust.png';
import elenaPop from '../assets/images/elena-pop.png';
import elenaWalking from '../assets/images/elena-walking.png';
import elenaWalkingReverse from '../assets/images/elena-walking-reverse.png';
import carPassing from '../assets/images/car-passing.png';
import busPassing from '../assets/images/bus-passing.png';
import luciaBust from '../assets/images/lucia-bust.png';
import luciaPop from '../assets/images/lucia-pop.png';
import buildingsPhoto from '../assets/images/buildings-photo.png';
import parallaxBackground from '../assets/images/parallax-background.png';
import pavement from '../assets/images/pavement.png';
import storefrontStreetBg from '../assets/images/storefront-street-bg.png';
import storefrontBuilding from '../assets/images/storefront-building.png';
import barInterior from '../assets/images/bar-interior.png';
import beerLeft from '../assets/images/coffee-left.png';
import beerRight from '../assets/images/coffee-right.png';
import beerBackground from '../assets/images/coffee-background.png';
import metroPlatform from '../assets/images/metro-station.png';
import luciaMetro1 from '../assets/images/lucia-metro-1.png';
import luciaMetro2 from '../assets/images/lucia-metro-2.png';
import luciaMetro3 from '../assets/images/lucia-metro-3.png';
import luciaMetro4 from '../assets/images/lucia-metro-4.png';
import metroTrain from '../assets/images/metro-train.png';
import finalBackground from '../assets/images/final-background.png';
import sideBuilding from '../assets/images/side-building.png';
import mainBuilding from '../assets/images/main-building.png';
import luciaWalking from '../assets/images/lucia-walking.png';
import menuBackground from '../assets/images/menu-background.png';
import SpeechBubble from './SpeechBubble';
import EpisodeCard from './EpisodeCard';
import { episodes } from '../data/content';
import './CinematicScroll.css';

// Standard cubic ease-in-out, used to smooth out the walking sway keyframes below
// (framer-motion's useTransform only accepts easing *functions*, not preset names).
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);

// Progress (0-1) boundaries for every beat of the story. Tweak these to
// speed up/slow down any individual scene.
//
// The street and cheers phases were widened earlier for their own multi-step animations
// (walking sway; converge/bounce/beer-rise), each time growing .cinematic height while
// re-deriving every other boundary as a fraction of the new total so no other scene's
// pacing changed: 1500vh->1735vh->2115vh. metroWait just got the same treatment for the
// 3-loop idle sprite cycle below: 2115vh->2495vh (+380vh, all of it added to metroWait).
const P = {
  bench: [0, 0.0541],
  buildingsWipe: [0.0541, 0.0962],
  street: [0.0962, 0.2685],
  // No longer an opaque "bus covers the screen" wipe of its own — the passing bus (see
  // busPassEnd below) now does that job as a curtain-reveal. Kept as a timing marker so
  // storefront's start doesn't drift if the street phase is ever retimed.
  busWipe: [0.2685, 0.3046],
  storefront: [0.3046, 0.3407],
  bar: [0.3107, 0.3948],
  cheers: [0.3948, 0.5952],
  metroWait: [0.5252, 0.8015],
  metroZoom: [0.7715, 0.8437],
  converge: [0.8437, 0.9038],
  lift: [0.9038, 0.9279],
  facadeZoom: [0.9279, 0.9459],
  menu: [0.9459, 1],
};

function CinematicScroll({ onSelectEpisode }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Past its own last keyframe, useTransform in this framer-motion version doesn't hold
  // (clamp) at the final value the way its docs describe — it drifts back toward the
  // *first* keyframe's value by progress=1 instead (confirmed with an isolated repro:
  // e.g. useTransform(p, [0.1,0.2], [1,0]) reads back ~0 right past 0.2 as expected, but
  // by p=1 it's climbed back to ~1). Appending an explicit keyframe at 1 that repeats the
  // last real value sidesteps it — every opacity transform in this file needs this, since
  // any of them left unpatched would silently un-fade past its own end point.
  const useFade = (start, end, edge = 0.015) => {
    const times = [start, start + edge, end - edge, end];
    const values = [0, 1, 1, 0];
    if (end < 1) {
      times.push(1);
      values.push(0);
    }
    return useTransform(scrollYProgress, times, values);
  };

  // The buildings finish sliding in before the end of their own phase, leaving a short
  // tail where they hold fully opaque then hand off to the street scene — keeping the
  // bench-cover crossfade and the buildings-street crossfade from happening at once
  // (which was producing a triple-exposure ghosting effect).
  const buildingsSlideEnd = P.buildingsWipe[0] + (P.buildingsWipe[1] - P.buildingsWipe[0]) * 0.85;

  // --- Elena on a bench, bubble appears then pops ---
  // It's the very first thing on screen, so unlike every other scene it doesn't fade in
  // from anything — useFade's usual fade-in edge would otherwise leave a 1-frame gap of
  // raw .cinematic background visible right at progress 0. Stays fully visible until the
  // buildings have fully slid across and covered her (not just through her own phase), so
  // the wipe covers a still-visible scene instead of the bench dissolving away beforehand.
  const benchOpacity = useTransform(scrollYProgress, [buildingsSlideEnd - 0.015, buildingsSlideEnd, 1], [1, 0, 0]);

  // --- Buildings wipe across the screen, covering the bench scene beneath it ---
  const buildingsX = useTransform(scrollYProgress, [P.buildingsWipe[0], buildingsSlideEnd], ['-100%', '0%']);
  const buildingsOpacity = useTransform(
    scrollYProgress,
    [P.buildingsWipe[0], P.buildingsWipe[0] + 0.01, buildingsSlideEnd, P.buildingsWipe[1], 1],
    [0, 1, 1, 0, 0]
  );

  // --- Walking street: parallax landmarks + sidewalk, Elena drifting through ---
  // Fades in during the same tail window the buildings fade out, so the handoff is a
  // single clean crossfade instead of three layers dissolving at once. Stays visible
  // through the *entire* bus-curtain pass (see below) — the curtain reveal only works if
  // there's still something underneath it to cover.
  const streetOpacity = useTransform(
    scrollYProgress,
    [buildingsSlideEnd, P.buildingsWipe[1], P.busWipe[1] - 0.015, P.busWipe[1], 1],
    [0, 1, 1, 0, 0]
  );
  const landmarkX = useTransform(scrollYProgress, P.street, ['2vw', '-2vw']);
  const sidewalkX = useTransform(scrollYProgress, P.street, ['4vw', '-9vw']);
  // End point scaled up along with the phase's widened span so she covers proportionally
  // more ground and keeps the same left-to-right speed rather than slowing down.
  const elenaWalkX = useTransform(scrollYProgress, P.street, ['-8vw', '80vw']);

  // A smooth, eased floating sway: a gentle left/right pivot synced with a soft vertical
  // bob, repeating a few times over the (now much longer) walk so it reads as continuous
  // "alive" motion rather than one single dip.
  const streetSpan = P.street[1] - P.street[0];
  const swayKeyTimes = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => P.street[0] + streetSpan * (i / 8));
  const elenaWalkRotate = useTransform(
    scrollYProgress,
    swayKeyTimes,
    [0, -5, 0, 5, 0, -5, 0, 5, 0],
    { ease: easeInOut }
  );
  const elenaWalkY = useTransform(
    scrollYProgress,
    swayKeyTimes,
    ['0px', '-4px', '-7px', '-4px', '0px', '4px', '7px', '4px', '0px'],
    { ease: easeInOut }
  );

  // A fast car passes left -> right early in the walk, straight (no sway). Window is a
  // small slice of the (now much longer) street phase so it reads as a quick foreground
  // whoosh rather than drifting at Elena's pace. Base position + travel distance are
  // tight (car's own width is ~54vw at this scale) so the whole window is spent visible
  // instead of idling off-screen at either end.
  const carPassStart = P.street[0] + streetSpan * 0.15;
  const carPassEnd = P.street[0] + streetSpan * 0.25;
  const carPassX = useTransform(scrollYProgress, [carPassStart, carPassEnd], ['0vw', '170vw']);

  // Elena's own exit point isn't her raw x value — it's her base `left: 34vw` plus that
  // translate, so she actually leaves the visible viewport around 84% through the street
  // phase (34vw + (-8vw + 0.84*88vw) ≈ 100vw), well before the phase itself ends.
  // The bus passes right -> left starting right around that point, straight, and — instead
  // of a separate opaque "bus covers the screen" wipe afterwards — the bus itself *is* the
  // transition: it's a curtain, and the storefront scene is the window behind it. The
  // window's own [0.438, ...] start doubles as this pass's end, so extending the bus's
  // window into the old busWipe slot gives the curtain pull room to read as deliberate
  // rather than instant.
  const busPassStart = P.street[0] + streetSpan * 0.85;
  const busPassEnd = P.busWipe[1];
  const busPassX = useTransform(scrollYProgress, [busPassStart, busPassEnd], ['50vw', '-300vw']);
  const busPassingOpacity = useTransform(scrollYProgress, [busPassStart, busPassStart + 0.005], [1, 1]);

  // The reveal boundary tracks the bus's actual rendered left edge (base `left: 100vw` +
  // its translate above) as a percentage of viewport width. Clipping the storefront layer
  // to [boundary, 100%] means only the region the bus has already passed over (to its
  // right) shows the next scene — the "curtain" opening as the bus slides left.
  const busCurtainX = useTransform(scrollYProgress, [busPassStart, busPassEnd], ['100%', '-50%']);
  const busCurtainClipPath = useTransform(busCurtainX, (v) => `inset(0 0 0 ${v})`);

  // --- Zoom into the storefront, revealed behind the bus curtain, crossfading to the bar ---
  const storefrontScale = useTransform(scrollYProgress, P.storefront, [1, 4.5]);
  const storefrontOpacity = useTransform(
    scrollYProgress,
    [busPassStart, busPassStart + 0.01, P.storefront[1] - 0.015, P.storefront[1], 1],
    [0, 1, 1, 0, 0]
  );

  // --- Lucia at the bar, bubble appears then pops ---
  // Stays visible until the beer has fully risen and covered the screen (not just
  // through her own phase) — same "stays put until the next layer physically covers it"
  // rule as the bench/buildings and street/bus handoffs above. If she faded out on her
  // own schedule instead, she'd flash back into view while the beer recedes later.
  const cheersSpan = P.cheers[1] - P.cheers[0];
  const cheersConvergeEnd = P.cheers[0] + cheersSpan * 0.24;
  const cheersBounceEnd = P.cheers[0] + cheersSpan * 0.3;
  const cheersRiseStart = P.cheers[0] + cheersSpan * 0.32;
  const cheersRiseEnd = P.cheers[0] + cheersSpan * 0.65;
  const cheersRecedeStart = P.cheers[0] + cheersSpan * 0.71;
  const barOpacity = useFade(P.bar[0], cheersRiseEnd);

  // --- Cheers: two beer glasses converge from off-screen, clink, bounce back a touch,
  // then freeze while a wall of beer rises from below to cover the whole screen. ---
  const cheersBounceMid = (cheersConvergeEnd + cheersBounceEnd) / 2;
  const beerLeftX = useTransform(
    scrollYProgress,
    [P.cheers[0], cheersConvergeEnd, cheersBounceMid, cheersBounceEnd],
    ['-80vw', '-20vw', '-24vw', '-23vw'],
    { ease: easeInOut }
  );
  const beerRightX = useTransform(
    scrollYProgress,
    [P.cheers[0], cheersConvergeEnd, cheersBounceMid, cheersBounceEnd],
    ['80vw', '20vw', '24vw', '23vw'],
    { ease: easeInOut }
  );

  // The beer wall: hidden far below at rest, rises 1:1 with scroll to fully cover the
  // viewport, holds there (this is when the scene underneath swaps to the metro platform,
  // invisibly), then recedes back down at the same rate, revealing the new scene top-down
  // as it goes. One continuous transform handles rise -> hold -> recede: before
  // cheersRiseStart and after cheersRecedeEnd it's clamped at '100%' (fully hidden).
  // Height is taller than the viewport specifically because the source image has a
  // transparent margin along its own top ~23% — '-25%' pushes that margin just past the
  // top edge so the *opaque* beer actually fills the full 100vh once "risen".
  const beerBgY = useTransform(
    scrollYProgress,
    [cheersRiseStart, cheersRiseEnd, cheersRecedeStart, P.cheers[1]],
    ['100%', '-25%', '-25%', '100%']
  );

  // --- Metro: wait, then the train grows and zooms toward the center ---
  // Fades in while still hidden behind the risen beer (well before the recede starts
  // uncovering it), so the platform is already in place the moment it becomes visible.
  // Holds fully opaque until the converge scene's own background has fully faded in
  // (P.converge[0] + buildingOpacity's own 0.015 edge) rather than fading out on its own
  // phase boundary — those two points used to coincide exactly, leaving a window where
  // neither layer was opaque and the raw .cinematic background showed through.
  const metroPlatformOpacity = useTransform(
    scrollYProgress,
    [cheersRiseEnd, cheersRiseEnd + 0.005, P.converge[0] + 0.015, P.converge[0] + 0.016, 1],
    [0, 1, 1, 0, 0]
  );
  const metroCharOpacity = useTransform(
    scrollYProgress,
    [P.metroWait[0], P.metroWait[0] + 0.003, P.metroZoom[0], P.metroZoom[0] + (P.metroZoom[1] - P.metroZoom[0]) * 0.3, 1],
    [0, 1, 1, 0, 0]
  );

  // She plays her 4-frame idle animation (LuciaM-1..4) as a forward-then-back ping-pong
  // (1,2,3,4,4,3,2,1), looped 3 times, filling the whole time she's visible and waiting
  // before the train arrives. idleFrameIndex steps through 1-4 with only a hair's-width
  // gap between holds (so consecutive frames snap rather than crossfade — a proper sprite
  // swap, not a dissolve); each frame's own opacity is just "am I the current one",
  // multiplied by her overall fade in/out above.
  const idleSequence = [1, 2, 3, 4, 4, 3, 2, 1, 1, 2, 3, 4, 4, 3, 2, 1];
  const idleStart = P.metroWait[0] + 0.003;
  const idleSpan = P.metroWait[1] - idleStart;
  const idleStepEps = idleSpan * 0.002;
  const idleFrameKeyTimes = [];
  const idleFrameKeyValues = [];
  idleSequence.forEach((frame, i) => {
    const segStart = idleStart + (idleSpan * i) / idleSequence.length;
    const segEnd = idleStart + (idleSpan * (i + 1)) / idleSequence.length;
    idleFrameKeyTimes.push(segStart, segEnd - idleStepEps);
    idleFrameKeyValues.push(frame, frame);
  });
  const idleFrameIndex = useTransform(scrollYProgress, idleFrameKeyTimes, idleFrameKeyValues);
  const useIdleFrameOpacity = (frameNumber) => {
    const isCurrent = useTransform(idleFrameIndex, (v) => (Math.round(v) === frameNumber ? 1 : 0));
    return useTransform([metroCharOpacity, isCurrent], ([fade, current]) => fade * current);
  };
  const luciaMetro1Opacity = useIdleFrameOpacity(1);
  const luciaMetro2Opacity = useIdleFrameOpacity(2);
  const luciaMetro3Opacity = useIdleFrameOpacity(3);
  const luciaMetro4Opacity = useIdleFrameOpacity(4);

  // Scale keyframes and the fixed pivot below were both derived from the 5 reference
  // screenshots: the train's headlights (a stable point on it) move a lot on screen as
  // it grows, but tracking them across all 5 steps and fitting a line showed that's just
  // the ordinary look of scaling up from one fixed, off-center point — not a separate
  // translate — sitting at viewport (0% of width, 71% of height). TRAIN_ORIGIN itself is
  // that pivot re-expressed *relative to the .cinematic__train box's own position*
  // (left:2vw/top:64.5vh in the CSS) since CSS transform-origin is always local to the
  // element, not the viewport — it'll drift if that box position ever moves without
  // this being recalculated to match.
  const TRAIN_ORIGIN = '-25.5vw 8.1vh';
  const metroZoomSpan = P.metroZoom[1] - P.metroZoom[0];
  // Arrival growth stops at f=0.35 and holds (train fully stopped) for the rest of the
  // phase — this is the train-wrap's own scale, pivoting on TRAIN_ORIGIN.
  const trainArrivalScale = useTransform(
    scrollYProgress,
    [0.1, 0.15, 0.35].map((f) => P.metroZoom[0] + metroZoomSpan * f),
    [0.15, 1.30, 1.8]
  );
  // From f=0.55 the *whole* metro scene (platform + train together, see
  // cinematic__metro-scene below) zooms in on the now-stationary train, like a camera
  // push-in — everything scaling up together in one shared transform reads as one zoom
  // instead of just the train growing while the platform around it stays put.
  const METRO_ZOOM_ORIGIN = '38% 62%';
  const metroZoomScale = useTransform(
    scrollYProgress,
    [0.55, 1].map((f) => P.metroZoom[0] + metroZoomSpan * f),
    [1, 2.6]
  );
  // Fades in on the phase's own start, but (like metroPlatformOpacity above) holds until
  // the converge scene's background has fully covered it instead of fading out on
  // P.metroZoom's own boundary, closing the same background-leak gap.
  const trainOpacity = useTransform(
    scrollYProgress,
    [P.metroZoom[0], P.metroZoom[0] + 0.015, P.converge[0] + 0.015, P.converge[0] + 0.016, 1],
    [0, 1, 1, 0, 0]
  );

  // --- The two journeys converge in front of the buildings ---
  // Lucia enters from the left, Elena from the right; both walk in over the first 70% of
  // the phase then hold at their converged mark for the remainder. The sway reuses the
  // exact same 8-keyframe ping-pong pattern as elenaWalkRotate/elenaWalkY on the street,
  // just re-keyed to this phase's own span, and clamps to rest (0/0px) once the walk ends
  // since useTransform holds the last keyframe value past its defined range.
  const convergeWalkEnd = P.converge[0] + (P.converge[1] - P.converge[0]) * 0.7;
  const convergeWalkSpan = convergeWalkEnd - P.converge[0];
  const convergeSwayKeyTimes = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => P.converge[0] + convergeWalkSpan * (i / 8));
  const convergeWalkRotate = useTransform(scrollYProgress, convergeSwayKeyTimes, [0, -5, 0, 5, 0, -5, 0, 5, 0], {
    ease: easeInOut,
  });
  const convergeWalkY = useTransform(
    scrollYProgress,
    convergeSwayKeyTimes,
    ['0px', '-4px', '-7px', '-4px', '0px', '4px', '7px', '4px', '0px'],
    { ease: easeInOut }
  );
  const luciaConvergeX = useTransform(scrollYProgress, [P.converge[0], convergeWalkEnd], ['-60vw', '0vw']);
  const elenaConvergeX = useTransform(scrollYProgress, [P.converge[0], convergeWalkEnd], ['60vw', '0vw']);
  // Fades in once at the start of converge, then just holds — the girls no longer fade
  // out partway through lift, they sink down out of frame with the buildings instead
  // (see walkerLiftY below), so there's nothing left for opacity to hide by then.
  const convergeCharsOpacity = useTransform(scrollYProgress, [P.converge[0], P.converge[0] + 0.01, 1], [0, 1, 1]);

  // --- The 3 buildings: hold through converge, lift together, then push in through the
  // center door. Each building is its own tall PNG (only its bottom couple of floors are
  // ever in frame, same "extends above the viewport top on purpose" idea as the storefront
  // building) positioned/sized to match FinalStep1.png. They lift by the same *absolute*
  // vh amount rather than a %, since a % of each element's own (different) height would
  // desync them; the scale then zooms all 3 together toward one shared viewport point (the
  // center building's door) via the same shared-pivot technique as the cheers glasses —
  // each building's transform-origin below is that point re-expressed relative to its own
  // box position, so the side buildings swing away from it exactly like a dolly zoom.
  // Fade-out holds until the end menu (below) has fully faded in — no window-zoom step
  // between them any more, the building zoom *is* the transition straight into the menu.
  const buildingOpacity = useFade(P.converge[0], P.facadeZoom[1] + 0.03);
  // Trailing keyframe holds 56vh through progress 1 (see useFade's comment on the
  // useTransform clamping bug) — needed now more than before, since walkerLiftY below
  // rides this same value and a drift back toward 0vh would pull the girls back into
  // view instead of leaving them off-screen.
  const buildingLiftY = useTransform(scrollYProgress, [...P.lift, 1], ['0vh', '56vh', '56vh']);
  const buildingScale = useTransform(scrollYProgress, P.facadeZoom, [1, 5]);
  const BUILDING_LEFT_ORIGIN = '100.7vh 194vh';
  const BUILDING_CENTER_ORIGIN = '36.5vh 186.2vh';
  const BUILDING_RIGHT_ORIGIN = '-22.1vh 194vh';

  // The two girls sink down out of the screen at the same rate as the buildings once they
  // stop walking — same buildingLiftY value, combined with their own walking sway (which
  // has already settled back to 0px by the time lift starts, since the walk-in finishes
  // before P.lift begins) via calc() since one's in px and the other's in vh.
  const walkerLiftY = useTransform(
    [convergeWalkY, buildingLiftY],
    ([sway, lift]) => `calc(${sway} + ${lift})`
  );

  // --- The end menu: crossfades straight in once the building zoom finishes, no
  // intermediate window-zoom step (the building's own zoom-into-the-door is the
  // transition now) — clamps at 1 for the rest of the scroll since it's the final scene.
  const menuOpacity = useTransform(scrollYProgress, [P.facadeZoom[1], P.facadeZoom[1] + 0.03, 1], [0, 1, 1]);

  // --- Episode cards: fade in on top of the end menu, right at the very end of the
  // scroll, instead of living in a separate section you had to keep scrolling to reach.
  // Function-based (not keyframe-array-based) on purpose — sidesteps the useTransform
  // clamping bug entirely (see useFade's comment above) rather than needing a trailing
  // keyframe, since this one already ends exactly at progress 1 with no room to add one.
  const episodesStart = 0.985;
  const episodesOpacity = useTransform(scrollYProgress, (p) =>
    Math.max(0, Math.min(1, (p - episodesStart) / (1 - episodesStart)))
  );
  const episodesPointerEvents = useTransform(scrollYProgress, (p) => (p > episodesStart ? 'auto' : 'none'));

  return (
    <section ref={sectionRef} className="cinematic">
      <div className="cinematic__sticky">
        {/* Elena, bench, intro bubble */}
        <motion.div className="cinematic__scene" style={{ opacity: benchOpacity }}>
          <img className="cinematic__bench-bg" src={benchSceneBg} alt="" />
          <img className="cinematic__elena-bust" src={elenaBust} alt="" />
          <SpeechBubble progress={scrollYProgress} range={P.bench} name="ELENA" image={elenaPop} align="right" />
        </motion.div>

        {/* Buildings wipe, on top of the (still visible) bench scene */}
        <motion.img
          className="cinematic__layer cinematic__wide cinematic__buildings-photo"
          src={buildingsPhoto}
          alt=""
          style={{ x: buildingsX, opacity: buildingsOpacity }}
        />

        {/* Walking street: landmarks + sidewalk parallax, Elena drifting through */}
        <motion.div className="cinematic__scene" style={{ opacity: streetOpacity }}>
          {/* parallax-background.png has a transparent sky (it's just the two landmark
              buildings), so this plain sky-colored fill sits behind it and pavement.png's
              own transparent margin — otherwise both would leak the raw .cinematic
              background through, the same bug fixed earlier for this exact scene. */}
          <div className="cinematic__street-sky" />
          <motion.img className="cinematic__landmark" src={parallaxBackground} alt="" style={{ x: landmarkX }} />
          <motion.div className="cinematic__pavement" style={{ x: sidewalkX, backgroundImage: `url(${pavement})` }} />
          <motion.img
            className="cinematic__elena-walking"
            src={elenaWalking}
            alt=""
            style={{ x: elenaWalkX, y: elenaWalkY, rotate: elenaWalkRotate }}
          />
          <motion.img className="cinematic__car-passing" src={carPassing} alt="" style={{ x: carPassX }} />
        </motion.div>

        {/* Storefront street: the bus curtain (below) clips this whole group to reveal it
            progressively, then it crossfades into the bar once fully revealed. Background
            + building zoom together (same scale/origin) so the door stays the zoom target. */}
        <motion.div
          className="cinematic__scene"
          style={{
            opacity: storefrontOpacity,
            clipPath: busCurtainClipPath,
            scale: storefrontScale,
            transformOrigin: '105vh 65vh',
          }}
        >
          <img className="cinematic__storefront-bg" src={storefrontStreetBg} alt="" />
          <img className="cinematic__storefront" src={storefrontBuilding} alt="" />
        </motion.div>

        {/* The bus curtain itself — rendered above the storefront reveal so it always
            stays visually in front of the wipe boundary it's driving */}
        <motion.img
          className="cinematic__bus-passing"
          src={busPassing}
          alt=""
          style={{ x: busPassX, opacity: busPassingOpacity }}
        />

        {/* Lucia, bar, intro bubble, then the cheers glasses converge in front of her */}
        <motion.div className="cinematic__scene" style={{ opacity: barOpacity }}>
          <img className="cinematic__full cinematic__bar-bg" src={barInterior} alt="" />
          <img className="cinematic__lucia-bust" src={luciaBust} alt="" />
          <SpeechBubble progress={scrollYProgress} range={P.bar} name="LUCIA" image={luciaPop} align="left" />
          <motion.img
            className="cinematic__beer cinematic__beer--left"
            src={beerLeft}
            alt=""
            style={{ x: beerLeftX, rotate: -10 }}
          />
          <motion.img
            className="cinematic__beer cinematic__beer--right"
            src={beerRight}
            alt=""
            style={{ x: beerRightX, rotate: 10 }}
          />
        </motion.div>

        {/* Metro: wait (Lucia's 4-frame idle sprite loops 3x), then the train grows and
            stops, then the whole scene (platform + train) zooms in on it together */}
        <motion.div className="cinematic__scene" style={{ scale: metroZoomScale, transformOrigin: METRO_ZOOM_ORIGIN }}>
          <motion.img className="cinematic__full" src={metroPlatform} alt="" style={{ opacity: metroPlatformOpacity }} />
          <motion.img className="cinematic__lucia-metro" src={luciaMetro1} alt="" style={{ opacity: luciaMetro1Opacity }} />
          <motion.img className="cinematic__lucia-metro" src={luciaMetro2} alt="" style={{ opacity: luciaMetro2Opacity }} />
          <motion.img className="cinematic__lucia-metro" src={luciaMetro3} alt="" style={{ opacity: luciaMetro3Opacity }} />
          <motion.img className="cinematic__lucia-metro" src={luciaMetro4} alt="" style={{ opacity: luciaMetro4Opacity }} />
          <motion.div
            className="cinematic__train-wrap"
            style={{ scale: trainArrivalScale, opacity: trainOpacity, transformOrigin: TRAIN_ORIGIN }}
          >
            <img className="cinematic__train" src={metroTrain} alt="" />
          </motion.div>
        </motion.div>

        {/* The buildings the two journeys converge on, background first, center building
            (higher z-layer, per the reference) last so it stacks above both side ones */}
        <motion.img
          className="cinematic__final-bg"
          src={finalBackground}
          alt=""
          style={{ opacity: buildingOpacity }}
        />
        <motion.img
          className="cinematic__building cinematic__building--left"
          src={sideBuilding}
          alt=""
          style={{ opacity: buildingOpacity, y: buildingLiftY, scale: buildingScale, transformOrigin: BUILDING_LEFT_ORIGIN }}
        />
        <motion.img
          className="cinematic__building cinematic__building--right"
          src={sideBuilding}
          alt=""
          style={{ opacity: buildingOpacity, y: buildingLiftY, scale: buildingScale, transformOrigin: BUILDING_RIGHT_ORIGIN }}
        />
        <motion.img
          className="cinematic__building cinematic__building--center"
          src={mainBuilding}
          alt=""
          style={{ opacity: buildingOpacity, y: buildingLiftY, scale: buildingScale, transformOrigin: BUILDING_CENTER_ORIGIN }}
        />
        <motion.img
          className="cinematic__walker cinematic__walker--lucia"
          src={luciaWalking}
          alt=""
          style={{ x: luciaConvergeX, y: walkerLiftY, rotate: convergeWalkRotate, opacity: convergeCharsOpacity }}
        />
        <motion.img
          className="cinematic__walker cinematic__walker--elena"
          src={elenaWalkingReverse}
          alt=""
          style={{ x: elenaConvergeX, y: walkerLiftY, rotate: convergeWalkRotate, opacity: convergeCharsOpacity }}
        />

        {/* End menu: straight crossfade in behind the building zoom, no window step */}
        <motion.img className="cinematic__full" src={menuBackground} alt="" style={{ opacity: menuOpacity }} />

        {/* The beer wall: rendered last so it sits on top of every layer above (including
            the metro platform it briefly covers). Hidden off-screen except during its own
            rise/hold/recede window, so its position at any other point in the scroll is
            harmless regardless of what's rendered before it. */}
        <motion.img className="cinematic__beer-bg" src={beerBackground} alt="" style={{ y: beerBgY }} />

        <div className="cinematic__vignette" />

        {/* Episode cards: fade in on top of the end menu once you've scrolled all the way
            down, instead of a separate section further below — above the vignette so they
            read at full clarity, not dimmed by its edge darkening. */}
        <motion.div
          className="cinematic__episodes"
          style={{ opacity: episodesOpacity, pointerEvents: episodesPointerEvents }}
        >
          <div className="cinematic__episodes-content">
            <h2 className="cinematic__episodes-heading">Episodios</h2>
            <div className="cinematic__episodes-cards">
              {episodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} onSelect={onSelectEpisode} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CinematicScroll;
