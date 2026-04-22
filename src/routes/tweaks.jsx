/* ============================================================
   tweaks.jsx — Accent palette variant selector
   ============================================================ */

function TweaksPanel({ visible, accent, setAccent, density, setDensity }) {
  if (!visible) return null;
  const palettes = [
    { key: 'indigo',  label: 'Warm Indigo',   colors: ['#2f3e7a', '#2f827a', '#c47a2a'] },
    { key: 'teal',    label: 'Monsoon Teal',  colors: ['#1f5b57', '#7a6f3b', '#c47a2a'] },
    { key: 'sunrise', label: 'Bicol Sunrise', colors: ['#a23b3b', '#c4582a', '#6b5a9a'] },
  ];
  return (
    <div className="tweaks-panel" role="region" aria-label="Tweaks">
      <h4>
        <span>Tweaks</span>
        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize: 10, color:'var(--ink-4)'}}>v1</span>
      </h4>
      <div className="group">
        <div className="g-lab">Accent palette</div>
        <div className="swatch-row">
          {palettes.map(p => (
            <button key={p.key}
                    className={`swatch-btn ${accent === p.key ? 'active' : ''}`}
                    onClick={() => setAccent(p.key)}>
              <div className="bar">
                {p.colors.map((c, i) => <span key={i} style={{background: c}}></span>)}
              </div>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="group" style={{marginBottom: 0}}>
        <div className="g-lab">Density</div>
        <div className="swatch-row">
          <button className={`swatch-btn ${density === 'comfortable' ? 'active' : ''}`}
                  onClick={() => setDensity('comfortable')}>
            <span>Comfortable</span>
          </button>
          <button className={`swatch-btn ${density === 'compact' ? 'active' : ''}`}
                  onClick={() => setDensity('compact')}>
            <span>Compact</span>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TweaksPanel });
