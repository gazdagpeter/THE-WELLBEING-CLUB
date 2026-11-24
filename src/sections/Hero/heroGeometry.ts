/**
 * The four rounded photo columns („Stúdiófotó – lamellák”) in Figma units,
 * relative to the 546.667 × 710 photo frame.
 */
export const PHOTO = { w: 546.667, h: 710 };

export const COLUMNS = [
  { x: 0, y: 63, h: 590 },
  { x: 146.667, y: 0, h: 710 },
  { x: 293.333, y: 93, h: 535 },
  { x: 440, y: 150, h: 538 },
];

export const COLUMN_W = 106.667;

/** Index of the column that grows into the 02 section photo on scroll. */
export const TRANSITION_COLUMN = 1;
