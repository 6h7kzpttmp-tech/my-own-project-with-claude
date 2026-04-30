const GEAR_TEETH_10 = Array.from({ length: 10 }, (_, i) => i * 36)
const GEAR_TEETH_8  = Array.from({ length: 8  }, (_, i) => i * 45)
const GEAR_TEETH_6  = Array.from({ length: 6  }, (_, i) => i * 60)
const SPOKES_4 = Array.from({ length: 4 }, (_, i) => i * 45)
const SPOKES_3 = Array.from({ length: 3 }, (_, i) => i * 60)

const sparks = [
  { cx: 876, cy: 536, delay: '0.0s', dx: -8, dy: -14 },
  { cx: 890, cy: 548, delay: '0.4s', dx:  6, dy: -18 },
  { cx: 868, cy: 524, delay: '0.8s', dx: -4, dy: -10 },
  { cx: 882, cy: 558, delay: '1.2s', dx:  9, dy: -12 },
  { cx: 872, cy: 542, delay: '1.6s', dx: -6, dy: -16 },
]

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
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#07111f" />
            <stop offset="100%" stopColor="#0d1a2b" />
          </linearGradient>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f1e30" />
            <stop offset="100%" stopColor="#162333" />
          </linearGradient>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#101822" />
            <stop offset="100%" stopColor="#070d14" />
          </linearGradient>
          <radialGradient id="spot" cx="0.5" cy="0" r="0.8">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="neonHalo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow" x="-80%" y="-80%" width="360%" height="360%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <style>{`
            @keyframes carLift {
              0%,100% { transform: translateY(0px); }
              50%      { transform: translateY(-28px); }
            }
            @keyframes robotBob {
              0%,100% { transform: translateY(0px); }
              50%      { transform: translateY(-6px); }
            }
            @keyframes armSwing {
              0%,100% { transform: rotate(-35deg); }
              50%      { transform: rotate(20deg); }
            }
            @keyframes eyeBlink {
              0%,88%,100% { opacity:1; }
              92%          { opacity:0; }
            }
            @keyframes ledPulse {
              0%,100% { opacity:0.9; }
              50%      { opacity:0.4; }
            }
            @keyframes gearCW  { to { transform: rotate(360deg);  } }
            @keyframes gearCCW { to { transform: rotate(-360deg); } }
            @keyframes spark {
              0%   { opacity:0; transform:translate(0,0) scale(0.4); }
              40%  { opacity:1; }
              100% { opacity:0; transform:translate(var(--dx),var(--dy)) scale(0); }
            }
            @keyframes neonFlicker {
              0%,18%,20%,22%,52%,54%,100% { opacity:1; }
              19%,21%,53%                  { opacity:0.35; }
            }
            @keyframes toolFloat1 {
              0%,100% { transform:translateY(0)   rotate(-8deg);  }
              50%      { transform:translateY(-14px) rotate(4deg); }
            }
            @keyframes toolFloat2 {
              0%,100% { transform:translateY(0)   rotate(12deg);  }
              50%      { transform:translateY(-18px) rotate(-5deg); }
            }
            @keyframes toolFloat3 {
              0%,100% { transform:translateY(0)    rotate(0deg);  }
              50%      { transform:translateY(-10px) rotate(15deg); }
            }
            .car-lift     { animation: carLift   7s ease-in-out infinite; }
            .robot-bob    { animation: robotBob  3s ease-in-out infinite; }
            .arm-swing    { transform-origin: 0 0; animation: armSwing 1.6s ease-in-out infinite; }
            .eye-blink    { animation: eyeBlink  5s ease-in-out infinite; }
            .led-pulse    { animation: ledPulse  2s ease-in-out infinite; }
            .gear-cw-s    { animation: gearCW   14s linear infinite; }
            .gear-ccw-m   { animation: gearCCW   9s linear infinite; }
            .gear-cw-f    { animation: gearCW    5s linear infinite; }
            .neon-flicker { animation: neonFlicker 6s linear infinite; }
            .tf1 { animation: toolFloat1 4.5s ease-in-out infinite; }
            .tf2 { animation: toolFloat2 5.5s ease-in-out infinite; animation-delay:-2s; }
            .tf3 { animation: toolFloat3 3.8s ease-in-out infinite; animation-delay:-1.5s; }
          `}</style>
        </defs>

        {/* ── Background ── */}
        <rect width="1440" height="900" fill="url(#bgGrad)" />
        <rect width="1440" height="490" fill="url(#wallGrad)" />
        <rect y="490" width="1440" height="410" fill="url(#floorGrad)" />

        {/* Floor grid */}
        {[540,600,670,760,870].map((y, i) => (
          <line key={i} x1="0" y1={y} x2="1440" y2={y} stroke="#fff" strokeWidth="0.6" opacity="0.035" />
        ))}
        {[-5,-3,-1,1,3,5].map((n, i) => (
          <line key={i} x1={720 + n * 100} y1="490" x2={720 + n * 240} y2="900" stroke="#fff" strokeWidth="0.6" opacity="0.035" />
        ))}

        {/* ── Overhead spotlights ── */}
        {[260, 720, 1180].map((x, i) => (
          <g key={i}>
            <rect x={x - 32} y="0" width="64" height="14" rx="4" fill="#1e2d3d" />
            <rect x={x - 26} y="10" width="52" height="6" rx="2" fill="#fbbf24" opacity="0.75" />
            <polygon points={`${x-10},16 ${x+10},16 ${x+130},490 ${x-130},490`} fill="url(#spot)" opacity="0.35" />
          </g>
        ))}

        {/* ══════════════════════════════════════
            LEFT : GARAGE DOOR + TOOL CART
        ══════════════════════════════════════ */}

        {/* Garage door */}
        <rect x="30" y="110" width="290" height="380" rx="5" fill="#0e1a27" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x="33" y={113 + i * 31} width="284" height="29" rx="2" fill="#122034" />
        ))}
        <rect x="155" y="475" width="30" height="10" rx="5" fill="#334155" />

        {/* Neon AUTO SERVICE sign */}
        <g className="neon-flicker">
          <rect x="38" y="72" width="274" height="34" rx="7" fill="#07111f" />
          <rect x="42" y="76" width="266" height="26" rx="5" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.8" />
          <text x="175" y="95" textAnchor="middle" fill="#fbbf24" fontSize="13" fontFamily="monospace" fontWeight="bold" letterSpacing="3" opacity="0.95">AUTO SERVICE</text>
        </g>
        {/* Glow halo */}
        <rect x="38" y="72" width="274" height="34" rx="7" fill="none" stroke="#fbbf24" strokeWidth="6" opacity="0.12" filter="url(#softGlow)" />

        {/* Tool cart */}
        <g transform="translate(390,555)">
          <rect x="-42" y="-72" width="84" height="104" rx="6" fill="#0f1e2e" />
          {[[-55,'#1a2d40'],[-22,'#1a2d40'],[11,'#1a2d40']].map(([y, c], i) => (
            <rect key={i} x="-37" y={y as number} width="74" height="28" rx="3" fill={c as string} />
          ))}
          {[-44,-11,22].map((y, i) => (
            <rect key={i} x="-10" y={y} width="20" height="5" rx="2" fill="#2d4a66" />
          ))}
          {/* wheels */}
          <circle cx="-28" cy="34" r="9" fill="#0a1017" />
          <circle cx="28"  cy="34" r="9" fill="#0a1017" />
          {/* top */}
          <rect x="-42" y="-82" width="84" height="12" rx="3" fill="#162638" />
          {/* tools on top */}
          <rect x="-32" y="-88" width="5" height="14" rx="2" fill="#475569" />
          <rect x="-22" y="-90" width="5" height="18" rx="2" fill="#475569" />
          <rect x="-10" y="-86" width="5" height="12" rx="2" fill="#475569" />
          <rect x="4"   y="-91" width="5" height="20" rx="2" fill="#475569" />
        </g>

        {/* ══════════════════════════════════════
            CENTER : CAR ON HYDRAULIC LIFT
        ══════════════════════════════════════ */}

        {/* Fixed lift posts */}
        <rect x="492" y="564" width="16" height="170" rx="3" fill="#162233" />
        <rect x="820" y="564" width="16" height="170" rx="3" fill="#162233" />
        {/* Post top caps */}
        <rect x="488" y="558" width="24" height="10" rx="3" fill="#1e2d3d" />
        <rect x="816" y="558" width="24" height="10" rx="3" fill="#1e2d3d" />

        {/* Car + platform (animated) */}
        <g className="car-lift">
          {/* Lift platform */}
          <rect x="484" y="556" width="360" height="14" rx="3" fill="#1e2d3d" />
          <rect x="484" y="556" width="360" height="4"  rx="2" fill="#243447" />

          {/* Car body */}
          <path
            d="M496,552 L496,516 Q500,498 518,488 L570,476
               Q600,468 640,462 L790,462 Q820,462 836,476
               L850,492 Q858,506 858,518 L858,552 Z"
            fill="#162233"
          />
          {/* Hood slope */}
          <path d="M496,552 L496,516 Q500,498 518,488 L540,484 L525,552 Z" fill="#1a2940" />
          {/* Trunk slope */}
          <path d="M858,552 L858,518 Q854,506 844,492 L830,476 L845,552 Z" fill="#1a2940" />
          {/* Cabin */}
          <path d="M550,480 L575,454 L820,454 L840,476 L790,476 L640,476 L600,476 Z" fill="#1e3045" />
          {/* Windshield */}
          <path d="M558,478 L578,456 L648,456 L632,478 Z" fill="#1c3a5a" opacity="0.85" />
          {/* Side windows */}
          <rect x="638" y="457" width="140" height="21" rx="3" fill="#1c3a5a" opacity="0.85" />
          {/* Rear window */}
          <path d="M788,456 L816,474 L800,478 L784,460 Z" fill="#1c3a5a" opacity="0.85" />
          {/* Front light */}
          <rect x="494" y="522" width="10" height="18" rx="2" fill="#fbbf24" opacity="0.7" filter="url(#glow)" />
          {/* Rear light */}
          <rect x="850" y="520" width="10" height="20" rx="2" fill="#ef4444" opacity="0.7" filter="url(#glow)" />
          {/* Wheels */}
          <circle cx="578" cy="557" r="22" fill="#0a1017" /><circle cx="578" cy="557" r="12" fill="#0f1a24" />
          <circle cx="778" cy="557" r="22" fill="#0a1017" /><circle cx="778" cy="557" r="12" fill="#0f1a24" />
          {/* Undercarriage */}
          <rect x="540" y="547" width="280" height="8" rx="2" fill="#0a1017" opacity="0.6" />
        </g>

        {/* ══════════════════════════════════════
            CENTER-RIGHT : REPAIR ROBOT
        ══════════════════════════════════════ */}
        <g transform="translate(940,480)" className="robot-bob">
          {/* Legs */}
          <rect x="-18" y="58" width="14" height="44" rx="5" fill="#1e3045" />
          <rect x="4"   y="58" width="14" height="44" rx="5" fill="#1e3045" />
          {/* Feet */}
          <rect x="-23" y="99" width="22" height="9" rx="5" fill="#162233" />
          <rect x="1"   y="99" width="22" height="9" rx="5" fill="#162233" />

          {/* Body */}
          <rect x="-30" y="-8" width="60" height="68" rx="7" fill="#1e3045" />
          {/* Chest panel */}
          <rect x="-20" y="2" width="40" height="24" rx="4" fill="#0f1e2e" />
          {/* LED row */}
          <circle cx="-10" cy="14" r="4" fill="#22c55e" className="led-pulse" filter="url(#glow)" />
          <circle cx="0"   cy="14" r="4" fill="#fbbf24" filter="url(#glow)" style={{animationDelay:'-0.7s'}} className="led-pulse"/>
          <circle cx="10"  cy="14" r="4" fill="#ef4444"  filter="url(#glow)" style={{animationDelay:'-1.4s'}} className="led-pulse"/>
          {/* Chest strip */}
          <rect x="-20" y="34" width="40" height="4" rx="2" fill="#2d4a66" />
          {/* Belly bolt */}
          <circle cx="0" cy="46" r="5" fill="#0f1e2e" />
          <circle cx="0" cy="46" r="2" fill="#2d4a66" />

          {/* Left arm (static, pointing down-forward) */}
          <rect x="-56" y="-4" width="28" height="10" rx="5" fill="#243447" />
          <rect x="-60" y="3"  width="10" height="28" rx="5" fill="#243447" />
          {/* Left hand gripper */}
          <rect x="-63" y="28" width="6"  height="12" rx="3" fill="#162233" />
          <rect x="-55" y="28" width="6"  height="12" rx="3" fill="#162233" />

          {/* Right shoulder pivot → arm swings here */}
          <g transform="translate(30, 0)">
            <g className="arm-swing">
              {/* Upper arm */}
              <rect x="0" y="-5" width="32" height="10" rx="5" fill="#243447" />
              {/* Forearm */}
              <rect x="28" y="-3" width="10" height="26" rx="5" fill="#243447" />
              {/* Wrench */}
              <g transform="translate(33,24)">
                {/* Handle */}
                <rect x="-4" y="0" width="8" height="32" rx="4" fill="#64748b" />
                {/* Head body */}
                <rect x="-13" y="-22" width="26" height="26" rx="5" fill="#64748b" />
                {/* Jaw cutouts */}
                <rect x="-11" y="-20" width="9" height="16" rx="3" fill="#0a1017" />
                <rect x="2"   y="-20" width="9" height="16" rx="3" fill="#0a1017" />
                {/* Wrench shine */}
                <rect x="-11" y="-22" width="26" height="3" rx="1" fill="#94a3b8" opacity="0.4" />
              </g>
            </g>
          </g>

          {/* Neck */}
          <rect x="-9" y="-18" width="18" height="12" rx="4" fill="#243447" />

          {/* Head */}
          <rect x="-26" y="-58" width="52" height="42" rx="7" fill="#243447" />
          {/* Visor / face screen */}
          <rect x="-20" y="-52" width="40" height="22" rx="4" fill="#07111f" />
          {/* Eyes */}
          <circle cx="-9" cy="-41" r="6" fill="#22c55e" className="eye-blink" filter="url(#glow)" />
          <circle cx="9"  cy="-41" r="6" fill="#22c55e" className="eye-blink" filter="url(#glow)" style={{animationDelay:'-0.05s'}} />
          {/* Eye shine */}
          <circle cx="-7" cy="-43" r="2" fill="#fff" opacity="0.4" className="eye-blink" />
          <circle cx="11" cy="-43" r="2" fill="#fff" opacity="0.4" className="eye-blink" />
          {/* Antenna */}
          <line x1="0" y1="-58" x2="0" y2="-73" stroke="#2d4a66" strokeWidth="3" />
          <circle cx="0" cy="-77" r="5" fill="#ef4444" filter="url(#glow)" />
          {/* Ear bolts */}
          <circle cx="-26" cy="-40" r="4" fill="#162233" />
          <circle cx="26"  cy="-40" r="4" fill="#162233" />
        </g>

        {/* ── Sparks near wrench ── */}
        {sparks.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r="2.5"
            fill="#fbbf24"
            style={{
              '--dx': `${s.dx}px`,
              '--dy': `${s.dy}px`,
              animation: `spark 1.8s ease-out ${s.delay} infinite`,
            } as React.CSSProperties}
          />
        ))}
        {sparks.map((s, i) => (
          <circle
            key={`w${i}`}
            cx={s.cx + 2}
            cy={s.cy - 2}
            r="1.5"
            fill="#fff"
            style={{
              '--dx': `${s.dx * 0.6}px`,
              '--dy': `${s.dy * 0.8}px`,
              animation: `spark 1.8s ease-out ${s.delay} infinite`,
            } as React.CSSProperties}
          />
        ))}

        {/* ══════════════════════════════════════
            RIGHT : ROTATING GEARS
        ══════════════════════════════════════ */}

        {/* Large gear */}
        <g transform="translate(1200,240)" className="gear-cw-s">
          <circle r="72" fill="#0f1e2e" />
          {GEAR_TEETH_10.map(a => (
            <rect key={a} x="-6" y="-80" width="12" height="16" rx="2" fill="#0f1e2e" transform={`rotate(${a})`} />
          ))}
          {/* Ring */}
          <circle r="54" fill="none" stroke="#1e3045" strokeWidth="10" />
          <circle r="20" fill="#07111f" />
          {SPOKES_4.map(a => (
            <rect key={a} x="-4" y="-50" width="8" height="100" rx="4" fill="#07111f" transform={`rotate(${a})`} />
          ))}
          <circle r="8" fill="#1e3045" />
        </g>

        {/* Medium gear (interlocks with large) */}
        <g transform="translate(1323,360)" className="gear-ccw-m">
          <circle r="46" fill="#0f1e2e" />
          {GEAR_TEETH_8.map(a => (
            <rect key={a} x="-5" y="-53" width="10" height="13" rx="2" fill="#0f1e2e" transform={`rotate(${a})`} />
          ))}
          <circle r="34" fill="none" stroke="#1e3045" strokeWidth="8" />
          <circle r="14" fill="#07111f" />
          {SPOKES_3.map(a => (
            <rect key={a} x="-3" y="-30" width="6" height="60" rx="3" fill="#07111f" transform={`rotate(${a})`} />
          ))}
          <circle r="5" fill="#1e3045" />
        </g>

        {/* Small gear */}
        <g transform="translate(1132,346)" className="gear-cw-f">
          <circle r="28" fill="#0f1e2e" />
          {GEAR_TEETH_6.map(a => (
            <rect key={a} x="-4" y="-34" width="8" height="10" rx="2" fill="#0f1e2e" transform={`rotate(${a})`} />
          ))}
          <circle r="20" fill="none" stroke="#1e3045" strokeWidth="6" />
          <circle r="8" fill="#07111f" />
          <circle r="3" fill="#1e3045" />
        </g>

        {/* ── Floating tools ── */}

        {/* Wrench (top-left area) */}
        <g transform="translate(185,210)" className="tf1" opacity="0.55">
          <rect x="-4" y="0" width="8" height="40" rx="4" fill="#475569" />
          <rect x="-14" y="-26" width="28" height="30" rx="5" fill="#475569" />
          <rect x="-12" y="-24" width="10" height="20" rx="3" fill="#07111f" />
          <rect x="2"   y="-24" width="10" height="20" rx="3" fill="#07111f" />
          <rect x="-14" y="-26" width="28" height="4" rx="2" fill="#64748b" />
        </g>

        {/* Screwdriver (left side low) */}
        <g transform="translate(100,620)" className="tf3" opacity="0.5">
          <rect x="-4" y="-50" width="8" height="60" rx="4" fill="#475569" />
          <rect x="-9" y="-32" width="18" height="18" rx="4" fill="#334155" />
          <polygon points="0,-54 -4,-50 4,-50" fill="#94a3b8" />
        </g>

        {/* Gear icon (top-right, floating) */}
        <g transform="translate(1360,140)" className="tf2" opacity="0.5">
          <circle r="22" fill="#1e3045" />
          {GEAR_TEETH_6.map(a => (
            <rect key={a} x="-3.5" y="-28" width="7" height="9" rx="1.5" fill="#1e3045" transform={`rotate(${a})`} />
          ))}
          <circle r="14" fill="none" stroke="#2d4a66" strokeWidth="5" />
          <circle r="5"  fill="#07111f" />
        </g>

        {/* Oil can (right-low) */}
        <g transform="translate(1380,680)" className="tf1" opacity="0.45">
          <rect x="-12" y="-28" width="28" height="36" rx="4" fill="#334155" />
          <rect x="-6"  y="-34" width="16" height="8"  rx="3" fill="#475569" />
          <rect x="16"  y="-20" width="22" height="4"  rx="2" fill="#475569" />
          <rect x="36"  y="-26" width="4"  height="14" rx="2" fill="#475569" />
          <rect x="-12" y="-28" width="28" height="6"  rx="4" fill="#4a6080" />
        </g>
      </svg>
    </div>
  )
}
