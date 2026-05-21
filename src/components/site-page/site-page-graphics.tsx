export function HeroMountainSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 900 380" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <polygon points="0,380 200,70 340,160 440,18 580,130 740,52 900,110 900,380" fill="#D91F06" />
    </svg>
  );
}

export function HeroRunnersSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 260" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="72" cy="28" r="14" fill="#D91F06" />
      <line x1="72" y1="42" x2="70" y2="108" stroke="#D91F06" strokeWidth="7" strokeLinecap="round" />
      <line x1="71" y1="72" x2="44" y2="96" stroke="#D91F06" strokeWidth="6" strokeLinecap="round" />
      <line x1="71" y1="72" x2="100" y2="90" stroke="#D91F06" strokeWidth="6" strokeLinecap="round" />
      <line x1="70" y1="108" x2="48" y2="150" stroke="#D91F06" strokeWidth="7" strokeLinecap="round" />
      <line x1="70" y1="108" x2="96" y2="146" stroke="#D91F06" strokeWidth="7" strokeLinecap="round" />
      <circle cx="210" cy="22" r="17" fill="#1A1410" />
      <line x1="210" y1="39" x2="208" y2="118" stroke="#1A1410" strokeWidth="9" strokeLinecap="round" />
      <line x1="209" y1="76" x2="176" y2="102" stroke="#1A1410" strokeWidth="8" strokeLinecap="round" />
      <line x1="209" y1="76" x2="244" y2="94" stroke="#1A1410" strokeWidth="8" strokeLinecap="round" />
      <line x1="208" y1="118" x2="182" y2="166" stroke="#1A1410" strokeWidth="9" strokeLinecap="round" />
      <line x1="208" y1="118" x2="238" y2="162" stroke="#1A1410" strokeWidth="9" strokeLinecap="round" />
      <circle cx="360" cy="18" r="19" fill="#D91F06" />
      <line x1="360" y1="37" x2="356" y2="122" stroke="#D91F06" strokeWidth="10" strokeLinecap="round" />
      <line x1="358" y1="78" x2="322" y2="106" stroke="#D91F06" strokeWidth="9" strokeLinecap="round" />
      <line x1="358" y1="78" x2="398" y2="96" stroke="#D91F06" strokeWidth="9" strokeLinecap="round" />
      <line x1="356" y1="122" x2="328" y2="174" stroke="#D91F06" strokeWidth="10" strokeLinecap="round" />
      <line x1="356" y1="122" x2="390" y2="170" stroke="#D91F06" strokeWidth="10" strokeLinecap="round" />
      <circle cx="480" cy="26" r="13" fill="#1A1410" />
      <line x1="480" y1="39" x2="478" y2="110" stroke="#1A1410" strokeWidth="7" strokeLinecap="round" />
      <line x1="479" y1="73" x2="456" y2="93" stroke="#1A1410" strokeWidth="6" strokeLinecap="round" />
      <line x1="479" y1="73" x2="504" y2="88" stroke="#1A1410" strokeWidth="6" strokeLinecap="round" />
      <line x1="478" y1="110" x2="457" y2="148" stroke="#1A1410" strokeWidth="7" strokeLinecap="round" />
      <line x1="478" y1="110" x2="502" y2="145" stroke="#1A1410" strokeWidth="7" strokeLinecap="round" />
      <line x1="0" y1="196" x2="140" y2="196" stroke="#D91F06" strokeWidth="1.5" opacity=".22" />
      <line x1="160" y1="196" x2="310" y2="196" stroke="#D91F06" strokeWidth="1.5" opacity=".22" />
      <line x1="330" y1="196" x2="470" y2="196" stroke="#D91F06" strokeWidth="1.5" opacity=".22" />
    </svg>
  );
}

export function PhilosophyMountainSvg() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.07]"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <polygon points="0,300 110,70 200,150 260,20 340,100 400,55 400,300" fill="#D91F06" />
      <line x1="0" y1="220" x2="400" y2="220" stroke="#D91F06" strokeWidth="0.5" strokeDasharray="5,10" />
      <line x1="0" y1="180" x2="400" y2="180" stroke="#D91F06" strokeWidth="0.5" strokeDasharray="5,10" />
    </svg>
  );
}

export function MerchTeeSvg() {
  return (
    <svg viewBox="0 0 160 185" width={130} aria-hidden>
      <path
        d="M30,32 L8,62 L34,70 L34,154 L126,154 L126,70 L152,62 L130,32 C120,45 108,50 80,50 C52,50 40,45 30,32Z"
        fill="#D91F06"
      />
      <path d="M30,32 L8,62 L34,70 L34,80 L8,72 Z" fill="#B8160A" opacity=".5" />
      <path d="M130,32 L152,62 L126,70 L126,80 L152,72 Z" fill="#B8160A" opacity=".5" />
      <text
        x="80"
        y="108"
        textAnchor="middle"
        fontFamily="var(--font-ksr-display), sans-serif"
        fontSize="20"
        fill="white"
        letterSpacing="3"
      >
        KSR
      </text>
      <text
        x="80"
        y="126"
        textAnchor="middle"
        fontFamily="var(--font-ksr-display), sans-serif"
        fontSize="9"
        fill="rgba(255,255,255,.55)"
        letterSpacing="4"
      >
        KAYSERI
      </text>
      <line x1="52" y1="136" x2="108" y2="136" stroke="rgba(255,255,255,.15)" strokeWidth="0.5" />
    </svg>
  );
}

export function MerchHoodieSvg() {
  return (
    <svg viewBox="0 0 160 195" width={130} aria-hidden>
      <path
        d="M18,42 L0,84 L32,94 L32,162 L128,162 L128,94 L160,84 L142,42 C132,54 118,62 104,66 L100,74 L60,74 L56,66 C42,62 28,54 18,42Z"
        fill="#1A1410"
      />
      <rect x="70" y="74" width="20" height="24" rx="2" fill="#111" />
      <rect x="32" y="94" width="8" height="68" fill="rgba(255,255,255,.03)" />
      <text
        x="80"
        y="122"
        textAnchor="middle"
        fontFamily="var(--font-ksr-display), sans-serif"
        fontSize="13"
        fill="rgba(255,255,255,.7)"
        letterSpacing="2"
      >
        SOCIAL
      </text>
      <text
        x="80"
        y="138"
        textAnchor="middle"
        fontFamily="var(--font-ksr-display), sans-serif"
        fontSize="13"
        fill="rgba(255,255,255,.7)"
        letterSpacing="2"
      >
        RUN
      </text>
      <rect x="68" y="142" width="24" height="2" rx="1" fill="#D91F06" opacity=".6" />
    </svg>
  );
}

export function MerchCapSvg() {
  return (
    <svg viewBox="0 0 160 145" width={130} aria-hidden>
      <ellipse cx="80" cy="100" rx="74" ry="15" fill="#B8160A" />
      <path d="M18,100 C18,52 142,52 142,100 Z" fill="#D91F06" />
      <path
        d="M18,100 C18,52 80,46 80,46 C80,46 142,52 142,100"
        fill="#B8160A"
        opacity=".6"
      />
      <circle cx="80" cy="47" r="5" fill="#8A0E04" />
      <line x1="80" y1="47" x2="80" y2="62" stroke="#8A0E04" strokeWidth="1.5" />
      <text
        x="80"
        y="88"
        textAnchor="middle"
        fontFamily="var(--font-ksr-display), sans-serif"
        fontSize="16"
        fill="white"
        letterSpacing="2"
      >
        KSR
      </text>
    </svg>
  );
}

export function MerchShortsSvg() {
  return (
    <svg viewBox="0 0 160 185" width={120} aria-hidden>
      <rect x="20" y="18" width="120" height="24" rx="4" fill="#D91F06" />
      <path d="M20,42 L20,132 C20,144 36,152 56,152 L80,152 L80,42 Z" fill="#D91F06" />
      <path
        d="M80,42 L80,152 L104,152 C124,152 140,144 140,132 L140,42 Z"
        fill="#B8160A"
      />
      <line x1="80" y1="42" x2="80" y2="152" stroke="rgba(255,255,255,.12)" strokeWidth="1" />
      <text
        x="50"
        y="104"
        textAnchor="middle"
        fontFamily="var(--font-ksr-display), sans-serif"
        fontSize="11"
        fill="rgba(255,255,255,.6)"
        letterSpacing="1"
      >
        KSR
      </text>
    </svg>
  );
}
