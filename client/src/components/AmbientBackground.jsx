const PARTICLES = [
  { left: '4%', delay: '0s', duration: '13s', size: 3, tone: 'a' },
  { left: '11%', delay: '2.2s', duration: '17s', size: 2, tone: 'p' },
  { left: '18%', delay: '5.4s', duration: '15s', size: 4, tone: 'a' },
  { left: '26%', delay: '1s', duration: '19s', size: 2, tone: 'a' },
  { left: '33%', delay: '8s', duration: '14s', size: 3, tone: 'p' },
  { left: '41%', delay: '3.2s', duration: '20s', size: 2, tone: 'a' },
  { left: '49%', delay: '10.5s', duration: '16s', size: 4, tone: 'a' },
  { left: '57%', delay: '0.6s', duration: '18s', size: 2, tone: 'p' },
  { left: '64%', delay: '6.8s', duration: '13s', size: 3, tone: 'a' },
  { left: '71%', delay: '4.4s', duration: '21s', size: 2, tone: 'a' },
  { left: '78%', delay: '9.2s', duration: '15s', size: 4, tone: 'p' },
  { left: '85%', delay: '2s', duration: '17s', size: 3, tone: 'a' },
  { left: '91%', delay: '7.2s', duration: '19s', size: 2, tone: 'a' },
  { left: '58%', delay: '12s', duration: '14s', size: 3, tone: 'a' },
  { left: '15%', delay: '13.5s', duration: '16s', size: 2, tone: 'p' },
];

const BREATH_RINGS = [
  { top: '18%', left: '82%', size: 260, delay: '0s', duration: '9s' },
  { top: '68%', left: '12%', size: 320, delay: '3s', duration: '11s' },
  { top: '40%', left: '48%', size: 200, delay: '1.5s', duration: '8s' },
];

export default function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="blob b4" />
      <div className="blob b5" />

      {/* breathwork: slow expanding/contracting rings, like an inhale-exhale */}
      {BREATH_RINGS.map((r, i) => (
        <div
          key={i}
          className="breath-ring"
          style={{
            top: r.top,
            left: r.left,
            width: r.size,
            height: r.size,
            animationDelay: r.delay,
            animationDuration: r.duration,
          }}
        />
      ))}

      {/* the floor: small motes of light drifting and swaying upward */}
      <div className="particles">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`particle tone-${p.tone}`}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
}
