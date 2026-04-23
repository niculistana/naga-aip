/* ============================================================
   overlays.jsx — Band E: Finish-Line bars, Mainstreaming matrix, Schedule
   ============================================================ */

function BandE({ items, useClean, pageKind }) {
  const { useState, useMemo } = React;
  const [open, setOpen] = useState(true);

  const base = useMemo(() => items.filter(x => !isOutlier(x)), [items]);

  // Finish-Line cluster bars
  const flData = useMemo(() => {
    const g = groupBy(base, x => x.finish_line_norm || 'Unclassified');
    return [...g.entries()].map(([k, v]) => ({
      key: k,
      label: k === 'Unclassified' ? 'Unclassified' : shortFL(k),
      full: k,
      value: rollup(v).total,
      paps: v.length,
    })).sort((a, b) => b.value - a.value);
  }, [base]);
  const flMax = Math.max(...flData.map(f => f.value), 1);

  // Mainstreaming matrix (plan × sector heatmap)
  const PLANS = ['CDP', 'LCCAP', 'LDRRMP', 'CLUP', 'GAD PLAN', "CITIZEN'S CHARTER", 'LYouthDP'];
  const SECTORS = ['Economic', 'Environment/Infrastructure/Housing', 'General Public Services', 'Social'];
  const matrix = useMemo(() => {
    const cells = {};
    for (const p of PLANS) for (const s of SECTORS) cells[p+'|'+s] = 0;
    let max = 0;
    for (const it of base) {
      if (!it.code_mainstreaming) continue;
      const tokens = it.code_mainstreaming.split(/[,/]/).map(t => t.trim().toUpperCase());
      for (const p of PLANS) {
        if (tokens.some(t => t.includes(p.toUpperCase()))) {
          cells[p + '|' + it.sector] = (cells[p + '|' + it.sector] || 0) + 1;
          if (cells[p + '|' + it.sector] > max) max = cells[p + '|' + it.sector];
        }
      }
    }
    return { cells, max };
  }, [base]);

  // Schedule swimlane — by sector, count overlapping PAPs per quarter
  const schedData = useMemo(() => {
    const quarters = [
      { label: 'Q1', start: '2026-01-01', end: '2026-03-31' },
      { label: 'Q2', start: '2026-04-01', end: '2026-06-30' },
      { label: 'Q3', start: '2026-07-01', end: '2026-09-30' },
      { label: 'Q4', start: '2026-10-01', end: '2026-12-31' },
    ];
    const sectors = {};
    for (const it of base) {
      if (!it.start_date || !it.end_date) continue;
      if (!sectors[it.sector]) sectors[it.sector] = [0, 0, 0, 0];
      const s = it.start_date, e = it.end_date;
      quarters.forEach((q, i) => {
        if (s <= q.end && e >= q.start) sectors[it.sector][i]++;
      });
    }
    const sum = Object.values(sectors).reduce((a, xs) => a.map((n, i) => n + xs[i]), [0, 0, 0, 0]);
    const max = Math.max(...Object.values(sectors).flat(), 1);
    return { sectors, quarters, sum, max };
  }, [base]);

  return (
    <div className="band">
      <div className="band-head">
        <span className="eyebrow">Band E</span>
        <h2 className="collapsible-head" onClick={() => setOpen(!open)}
            style={{cursor:'pointer'}}>
          <span className={`caret ${open ? 'open' : ''}`} style={{display:'inline-block'}}>{open ? '▾' : '▸'}</span>
          Strategic overlays
        </h2>
        <span className="sub">Finish-Line · Mainstreaming · Schedule</span>
      </div>

      {open && (
        <div className="overlays">
          {/* Finish-Line cluster bars */}
          <div className="card panel">
            <h3>
              2028 Finish-Line spend
              <span className="hint">₱M per cluster</span>
            </h3>
            {flData.map(f => (
              <div key={f.key} className="fl-bar">
                <div className="lab">{f.label} <span style={{color:'var(--ink-4)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace'}}>· {f.paps} PAPs</span></div>
                <div className="bar">
                  <div className="fill" style={{
                    width: `${(f.value / flMax) * 100}%`,
                    background: FINISH_LINE_COLORS[f.key] || 'var(--f-unspec)'
                  }}></div>
                </div>
                <div className="v">{fmtPeso(f.value)}</div>
              </div>
            ))}
          </div>

          {/* Mainstreaming matrix */}
          <div className="card">
            <h3 style={{padding:'20px 22px 0'}}>
              Mainstreaming coverage
              <span className="hint">development plan × sector</span>
            </h3>
            <div className="matrix" style={{
              gridTemplateColumns: `140px repeat(${SECTORS.length}, 1fr)`,
            }}>
              <div></div>
              {SECTORS.map(s => <div key={s} className="m-head">{shortSector(s)}</div>)}
              {PLANS.map(p => (
                <React.Fragment key={p}>
                  <div className="m-label">{p}</div>
                  {SECTORS.map(s => {
                    const n = matrix.cells[p + '|' + s] || 0;
                    if (n === 0) return <div key={s} className="m-cell empty">0</div>;
                    const intensity = 0.25 + 0.75 * (n / matrix.max);
                    return (
                      <div key={s} className="m-cell"
                           style={{ background: `rgba(47,62,122,${intensity})` }}
                           title={`${p} × ${shortSector(s)}: ${n} PAPs`}>
                        {n}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="card span-2">
            <h3 style={{padding:'20px 22px 0'}}>
              Schedule · PAPs active by quarter
              <span className="hint">start_date → end_date · counts overlap each quarter</span>
            </h3>
            <div className="swimlanes">
              <div className="sw-scale">
                <div></div>
                {schedData.quarters.map(q => (
                  <div key={q.label} className="qhead">{q.label} 2026</div>
                ))}
              </div>
              {Object.entries(schedData.sectors).sort((a,b) => b[1].reduce((s,x)=>s+x,0) - a[1].reduce((s,x)=>s+x,0)).map(([s, counts]) => (
                <div key={s} className="sw-row" style={{gridTemplateColumns: `160px repeat(4, 1fr)`}}>
                  <div className="unit">{shortSector(s)}</div>
                  {counts.map((n, i) => (
                    <div key={i} className="sw-track">
                      <div className="ev bright" style={{
                        left: 4,
                        right: 4,
                        background: FINISH_LINE_COLORS[Object.keys(FINISH_LINE_COLORS)[i]] || 'var(--accent-2)',
                        opacity: 0.25 + 0.75 * (n / schedData.max)
                      }}></div>
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        color: '#fff', fontWeight: 700,
                        textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                      }}>{n}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="sw-row" style={{gridTemplateColumns: `160px repeat(4, 1fr)`, borderTop: '2px solid var(--rule-strong)', borderBottom: 'none', marginTop: 4, paddingTop: 8, fontWeight: 600}}>
                <div className="unit">City-wide total</div>
                {schedData.sum.map((n, i) => (
                  <div key={i} style={{textAlign:'center', fontFamily:'JetBrains Mono, monospace', fontSize: 12}}>{n}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { BandE });
