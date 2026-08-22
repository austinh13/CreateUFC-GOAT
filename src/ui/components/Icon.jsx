/**
 * Icon.jsx — one inline SVG set, drawn on a 24×24 grid with a 1.75 stroke.
 *
 * Emoji are not icons: they render differently on every platform, cannot inherit
 * colour, and cannot be sized against the type scale. Everything visual in this app
 * comes from this file.
 */

const P = {
  home:      'M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5',
  dumbbell:  'M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11',
  trophy:    'M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9.5 20h5M12 14v6',
  news:      'M4 5h11v14H5.5A1.5 1.5 0 0 1 4 17.5V5ZM15 8h4a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-3 0V9M7 8.5h5M7 12h5M7 15.5h5',
  calendar:  'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12ZM4 10h16M8.5 3v4M15.5 3v4',
  user:      'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
  swords:    'M3 3.5h3l11.5 11.5M15 3.5h6v6M21 3.5 9.5 15M6.5 16.5 4 19l1 2 2 1 2.5-2.5M17.5 16.5 20 19l-1 2-2 1-2.5-2.5',
  flame:     'M12 3s5.5 4.2 5.5 9a5.5 5.5 0 1 1-11 0c0-2 1-3.6 2-4.6 0 1.6.9 2.6 2 2.6 1.6 0 2.2-1.5 1.5-7Z',
  chevron:   'm9 5 7 7-7 7',
  chevronDown: 'm5 9 7 7 7-7',
  arrowUp:   'M12 19V5M6 11l6-6 6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  minus:     'M6 12h12',
  x:         'm6 6 12 12M18 6 6 18',
  check:     'm5 12.5 4.5 4.5L19 7',
  plus:      'M12 5v14M5 12h14',
  download:  'M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15',
  upload:    'M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 19.5h15',
  alert:     'M12 8v5M12 16.5v.5M10.3 4l-7 12A2 2 0 0 0 5 19h14a2 2 0 0 0 1.7-3l-7-12a2 2 0 0 0-3.4 0Z',
  shield:    'M12 3.5 5 6v6c0 4 3 7 7 8.5 4-1.5 7-4.5 7-8.5V6l-7-2.5Z',
  pulse:     'M3 12.5h4l2-5.5 3.5 11 2.5-7 1.5 1.5H21',
  clock:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5.5l3.5 2',
  medal:     'M12 15.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8.5 8 6 3h12l-2.5 5',
  target:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  sparkle:   'm12 3 1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z',
  chart:     'M4 20V9M10 20V4M16 20v-7M22 20H2',
  save:      'M5 4h11l3 3v13H5V4ZM8 4v5h7V4M8 14h8v6H8v-6Z',
  refresh:   'M20 11a8 8 0 1 0-.7 4.3M20 5v6h-6',
  play:      'M8 5.5v13l11-6.5-11-6.5Z',
  skull:     'M12 3a8 8 0 0 0-8 8c0 2.8 1.6 4.6 3 5.6V20h10v-3.4c1.4-1 3-2.8 3-5.6a8 8 0 0 0-8-8ZM9 11.5h.01M15 11.5h.01',
  scale:     'M12 4v16M7 8h10M5 8l-2.5 6h5L5 8ZM19 8l-2.5 6h5L19 8ZM8.5 20h7',
  eye:       'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.75, ...rest }) {
  const d = P[name];
  if (!d) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

export const ICON_NAMES = Object.keys(P);
