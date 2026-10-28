import type { DropPayload } from '../canvas/PlanCanvas';

// Tiny line drawings for the contents panel. They use currentColor so hover can tint them.
const chair = (x: number, y: number, r = 0) => (
  <rect key={`${x}-${y}`} x={x - 3} y={y - 2.5} width={6} height={5} rx={1.6} transform={`rotate(${r} ${x} ${y})`} />
);

export function Preview({ payload }: { payload: DropPayload }) {
  const common = { width: 44, height: 44, viewBox: '0 0 44 44', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 } as const;

  if (payload.type === 'table') {
    if (payload.shape === 'circle') {
      const n = payload.seats;
      return (
        <svg {...common}>
          <circle cx="22" cy="22" r={n > 8 ? 10 : 9} />
          {Array.from({ length: n }).map((_, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const r = n > 8 ? 16.5 : 15.5;
            return chair(22 + Math.cos(a) * r, 22 + Math.sin(a) * r, (a * 180) / Math.PI + 90);
          })}
        </svg>
      );
    }
    if (payload.shape === 'rectangle')
      return (
        <svg {...common}>
          <rect x="17" y="8" width="10" height="28" rx="2" />
          {[12, 18, 24, 30].flatMap((y) => [chair(12, y, 90), chair(32, y, 90)])}
          {chair(22, 4)}
          {chair(22, 40)}
        </svg>
      );
    if (payload.shape === 'square')
      return (
        <svg {...common}>
          <rect x="12" y="12" width="20" height="20" rx="2.5" />
          {[18, 26].flatMap((v) => [chair(v, 7), chair(v, 37), chair(7, v, 90), chair(37, v, 90)])}
        </svg>
      );
    return (
      <svg {...common}>
        {Array.from({ length: payload.seats }).map((_, i) => {
          const step = 7;
          const start = 22 - ((payload.seats - 1) * step) / 2;
          return <rect key={i} x={start + i * step - 2.8} y={19} width={5.6} height={6} rx={1.6} />;
        })}
      </svg>
    );
  }

  switch (payload.kind) {
    case 'stage':
      return (
        <svg {...common}>
          <rect x="6" y="13" width="32" height="18" rx="2" fill="currentColor" fillOpacity={0.12} />
          <path d="M6 27h32" />
        </svg>
      );
    case 'dance-floor':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="26" height="26" rx="2" />
          <path d="M17.7 9v26M26.3 9v26M9 17.7h26M9 26.3h26" strokeOpacity={0.5} />
        </svg>
      );
    case 'bar':
      return (
        <svg {...common}>
          <rect x="7" y="18" width="30" height="7" rx="2" fill="currentColor" fillOpacity={0.12} />
          <circle cx="13" cy="31" r="2" />
          <circle cx="22" cy="31" r="2" />
          <circle cx="31" cy="31" r="2" />
        </svg>
      );
    case 'buffet':
      return (
        <svg {...common}>
          <rect x="7" y="17" width="30" height="10" rx="2" />
          <path d="M12 22h4M20 22h4M28 22h4" />
        </svg>
      );
    case 'dj':
      return (
        <svg {...common}>
          <rect x="11" y="15" width="22" height="13" rx="2" fill="currentColor" fillOpacity={0.12} />
          <circle cx="17" cy="21.5" r="3" />
          <circle cx="27" cy="21.5" r="3" />
        </svg>
      );
    case 'entrance':
      return (
        <svg {...common}>
          <path d="M8 30h8M28 30h8" />
          <path d="M16 30a12 12 0 0 1 12-12" strokeDasharray="2 2" />
          <path d="M22 12v8m-3-3 3 3 3-3" />
        </svg>
      );
    case 'pillar':
      return (
        <svg {...common}>
          <circle cx="22" cy="22" r="6" fill="currentColor" fillOpacity={0.12} />
        </svg>
      );
    case 'cake':
      return (
        <svg {...common}>
          <circle cx="22" cy="22" r="13" />
          <circle cx="22" cy="22" r="8" fill="currentColor" fillOpacity={0.12} />
          <circle cx="22" cy="22" r="4" />
        </svg>
      );
    case 'gifts':
      return (
        <svg {...common}>
          <rect x="7" y="17" width="30" height="11" rx="2" />
          <rect x="11" y="13" width="7" height="7" rx="1" fill="currentColor" fillOpacity={0.12} />
          <rect x="22" y="11" width="9" height="9" rx="1" fill="currentColor" fillOpacity={0.12} />
          <path d="M26.5 11v9M22 15.5h9" strokeOpacity={0.6} />
        </svg>
      );
    case 'sign':
      return (
        <svg {...common}>
          <rect x="12" y="10" width="20" height="16" rx="1.5" />
          <path d="M16 15h12M18 19h8M15 26l-3 9M29 26l3 9M22 26v9" strokeOpacity={0.7} />
        </svg>
      );
    case 'photo-booth':
      return (
        <svg {...common}>
          <path d="M8 30V14h28v16" />
          <circle cx="13" cy="12" r="3" />
          <circle cx="31" cy="12" r="3" />
          <circle cx="22" cy="9" r="3" />
          <circle cx="22" cy="34" r="2.5" fill="currentColor" fillOpacity={0.2} />
        </svg>
      );
    case 'lounge':
      return (
        <svg {...common}>
          <rect x="8" y="10" width="28" height="9" rx="3" />
          <rect x="17" y="23" width="10" height="7" rx="1.5" fill="currentColor" fillOpacity={0.12} />
          <rect x="8" y="31" width="9" height="6" rx="2" />
          <rect x="27" y="31" width="9" height="6" rx="2" />
        </svg>
      );
    case 'plant':
      return (
        <svg {...common}>
          <circle cx="22" cy="22" r="8" />
          <path d="M22 14c-3 4-3 12 0 16M14 22c4-3 12-3 16 0" strokeOpacity={0.6} />
        </svg>
      );
  }
}
