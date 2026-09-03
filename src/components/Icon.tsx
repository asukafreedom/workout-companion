/** Authored icon set — one 2px-stroke voice, sized via CSS `em`. Decorative
 *  by default (aria-hidden); the owning control carries the accessible name. */

const PATHS = {
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M4.5 12.5l5 5L19.5 7" />,
  swap: <path d="M7 4L3.5 7.5L7 11M3.5 7.5H16M17 13l3.5 3.5L17 20M20.5 16.5H8" />,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  chevronUp: <path d="M6 14.5l6-6 6 6" />,
  play: <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />,
  edit: <path d="M4 20h4.5L19 9.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20ZM13.5 6l3 3" />,
  trend: <path d="M3.5 17.5l5.5-5.5 3.5 3.5 7-7.5M14 7.5h5.5V13" />,
  alert: <path d="M12 4.5l8.5 15h-17L12 4.5ZM12 10.5v4M12 17.2v.3" />,
  back: <path d="M15 5l-7 7 7 7" />,
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
