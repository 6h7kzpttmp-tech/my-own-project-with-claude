const stars = [
  [45,35,0.9,1.5],[180,55,0.7,1],[280,25,0.85,1.5],[390,45,0.6,1],[480,80,0.8,1],
  [550,30,0.75,1.5],[640,60,0.9,1],[730,20,0.7,1],[810,50,0.85,1.5],[920,35,0.6,1],
  [1010,70,0.8,1],[1120,40,0.75,1],[1230,65,0.9,1.5],[1340,30,0.7,1],[1420,55,0.8,1],
  [90,120,0.7,1],[210,100,0.85,1.5],[340,130,0.6,1],[460,115,0.8,1],[590,95,0.7,1],
  [700,130,0.85,1],[820,105,0.6,1.5],[940,125,0.8,1],[1060,100,0.75,1],[1170,115,0.9,1],
  [1280,130,0.7,1],[1390,110,0.8,1.5],[140,185,0.7,1],[290,200,0.8,1],[440,170,0.65,1],
  [580,195,0.75,1],[720,175,0.85,1.5],[860,200,0.7,1],[1000,180,0.8,1],[1140,195,0.65,1],
  [1300,175,0.75,1],[200,255,0.6,1],[390,240,0.7,1],[560,265,0.8,1],[750,245,0.65,1],
  [930,260,0.7,1],[1110,240,0.8,1],[1300,255,0.6,1],
] as const

// center line dashes: [x, y, w, h] — computed from perspective
const centerDashes = [
  [718.5,382,3,6],[718.4,397,3.2,7],[718.1,415,3.8,8],[717.75,438,4.5,10],
  [717.25,469,5.5,12],[716.5,508,7,15],[715.6,563,8.8,19],[714.5,637,11,24],
  [713.3,738,13.4,30],[712,862,16,38],
] as const

// speed lines left: [y, x2]  (x1 always 0, gradient fades to road edge)
const speedLinesLeft = [
  [440,539],[458,517],[476,496],[498,470],[520,445],[545,416],
  [575,380],[608,341],[640,304],[675,263],[710,222],[748,178],
  [790,129],[830,82],[868,37],
] as const

// speed lines right: [y, x1]  (x2 always 1440)
const speedLinesRight = [
  [440,902],[458,923],[476,944],[498,970],[520,996],[545,1025],
  [575,1060],[608,1098],[640,1136],[675,1177],[710,1218],[748,1262],
  [790,1311],[830,1359],[868,1402],
] as const

const standRowsY = [110,128,146,164,182,200,218,236,254,272,290,308,326,344,362]

export default function RacingBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <svg
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020b18" />
            <stop offset="60%" stopColor="#071428" />
            <stop offset="100%" stopColor="#0d1b38" />
          </linearGradient>
          <linearGradient id="roadSurface" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e2a3a" />
            <stop offset="100%" stopColor="#0c1219" />
          </linearGradient>
          <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="45%" stopColor="#f97316" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="speedL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="speedR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
          </linearGradient>
          <pattern id="checker" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="10" height="10" fill="white" />
            <rect x="10" y="10" width="10" height="10" fill="white" />
          </pattern>
        </defs>

        {/* Sky */}
        <rect width="1440" height="900" fill="url(#bgSky)" />

        {/* Stars */}
        {stars.map(([x, y, opacity, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={opacity} />
        ))}

        {/* Left grandstand */}
        <rect x="0" y="100" width="610" height="270" fill="#040d1a" opacity="0.92" />
        {standRowsY.map((y, i) => (
          <rect key={i} x="10" y={y} width="590" height="2" fill="white" opacity="0.04" />
        ))}
        {/* Stadium lights left */}
        {[50, 200, 350, 500].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={105} r={15} fill="#ffd700" opacity={0.12} />
            <circle cx={x} cy={105} r={6} fill="#ffd700" opacity={0.85} />
          </g>
        ))}

        {/* Right grandstand */}
        <rect x="830" y="100" width="610" height="270" fill="#040d1a" opacity="0.92" />
        {standRowsY.map((y, i) => (
          <rect key={i} x="840" y={y} width="590" height="2" fill="white" opacity="0.04" />
        ))}
        {/* Stadium lights right */}
        {[940, 1090, 1240, 1390].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={105} r={15} fill="#ffd700" opacity={0.12} />
            <circle cx={x} cy={105} r={6} fill="#ffd700" opacity={0.85} />
          </g>
        ))}

        {/* Horizon glow */}
        <rect x="0" y="320" width="1440" height="90" fill="url(#horizonGlow)" />

        {/* Road surface */}
        <polygon points="620,370 820,370 1440,900 0,900" fill="url(#roadSurface)" />

        {/* Left edge line */}
        <polygon points="620,370 633,370 76,900 0,900" fill="white" opacity="0.65" />
        {/* Right edge line */}
        <polygon points="807,370 820,370 1440,900 1364,900" fill="white" opacity="0.65" />

        {/* Center dashes */}
        {centerDashes.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="white" opacity="0.88" />
        ))}

        {/* Speed lines left */}
        {speedLinesLeft.map(([y, x2], i) => (
          <line
            key={i}
            x1="0" y1={y} x2={x2} y2={y}
            stroke="url(#speedL)"
            strokeWidth={i % 3 === 0 ? 2 : 1.2}
            opacity={0.3 + (i % 4) * 0.12}
          />
        ))}

        {/* Speed lines right */}
        {speedLinesRight.map(([y, x1], i) => (
          <line
            key={i}
            x1={x1} y1={y} x2="1440" y2={y}
            stroke="url(#speedR)"
            strokeWidth={i % 3 === 0 ? 2 : 1.2}
            opacity={0.3 + (i % 4) * 0.12}
          />
        ))}

        {/* Checkered flag strips — bottom corners */}
        <rect x="0" y="845" width="140" height="55" fill="url(#checker)" opacity="0.25" />
        <rect x="1300" y="845" width="140" height="55" fill="url(#checker)" opacity="0.25" />
      </svg>
    </div>
  )
}
