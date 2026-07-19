const PARTICLES = [
  { left: '8%', delay: '0s', duration: '14s', size: 3 },
  { left: '18%', delay: '2.4s', duration: '18s', size: 2 },
  { left: '27%', delay: '5s', duration: '15s', size: 4 },
  { left: '39%', delay: '1.2s', duration: '20s', size: 2 },
  { left: '52%', delay: '7.5s', duration: '16s', size: 3 },
  { left: '61%', delay: '3.6s', duration: '19s', size: 2 },
  { left: '73%', delay: '9s', duration: '14s', size: 3 },
  { left: '84%', delay: '0.8s', duration: '21s', size: 4 },
  { left: '92%', delay: '6s', duration: '17s', size: 2 },
  { left: '46%', delay: '11s', duration: '15s', size: 3 },
];

export default function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="blob b4" />
      <div className="blob b5" />
      <div className="particles">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
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
