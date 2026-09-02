/**
 * The Indian national flag, drawn to the Flag Code's proportions: 3:2 overall,
 * three equal horizontal bands, and a navy Ashoka Chakra whose diameter equals
 * the height of the white band, with 24 evenly spaced spokes.
 */
const SPOKE_ANGLES = Array.from({ length: 24 }, (_, index) => index * 15)

const SAFFRON = '#FF9933'
const GREEN = '#138808'
const NAVY = '#000080'

type Props = { className?: string }

export default function IndiaFlag({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 600"
      role="img"
      aria-label="Flag of India"
    >
      <rect width="900" height="600" fill={SAFFRON} />
      <rect y="200" width="900" height="200" fill="#FFFFFF" />
      <rect y="400" width="900" height="200" fill={GREEN} />
      <g transform="translate(450 300)">
        <circle r="92" fill="none" stroke={NAVY} strokeWidth="9" />
        <circle r="17" fill={NAVY} />
        {SPOKE_ANGLES.map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <line y1="-16" y2="-88" stroke={NAVY} strokeWidth="3.5" />
            <circle cy="-80" r="5" fill={NAVY} />
          </g>
        ))}
      </g>
    </svg>
  )
}
