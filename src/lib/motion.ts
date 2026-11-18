// The app's springs for motion's animate(), so JS animations move like the
// CSS ones in tokens.css. The app gives each spring a damping ratio ζ and a
// stiffness k at mass 1; motion takes the damping coefficient c = 2ζ√k.
const spring = (ratio: number, stiffness: number) => ({
  type: 'spring' as const,
  stiffness,
  damping: 2 * ratio * Math.sqrt(stiffness),
  mass: 1,
});

export const SPRING = {
  /** press morph, toggle */
  spatialFast: spring(0.6, 800),
  /** chip select, indicator slide */
  spatial: spring(0.8, 380),
  /** screen-level moves, the gallery */
  spatialSlow: spring(0.8, 200),
  /** colour and opacity on press */
  effectsFast: spring(1, 3800),
  /** content fade-in */
  effects: spring(1, 1600),
  /** skeleton to content */
  effectsSlow: spring(1, 800),
  /** Counting a figure up: critically damped, so a number never passes its
      value and comes back. */
  count: spring(1, 400),
};

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
