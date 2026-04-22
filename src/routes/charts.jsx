/* ============================================================
   charts.jsx — Treemap layout, donut, tooltip
   ============================================================ */

function useTooltip() {
  const [tip, setTip] = React.useState(null);
  const show = (e, content) => {
    setTip({ x: e.clientX + 14, y: e.clientY + 14, content });
  };
  const move = (e) => {
    setTip(t => t ? { ...t, x: e.clientX + 14, y: e.clientY + 14 } : t);
  };
  const hide = () => setTip(null);
  const el = tip && (
    <div className="tooltip" style={{ left: tip.x, top: tip.y }}>{tip.content}</div>
  );
  return { show, move, hide, el };
}

// Squarified treemap (simple recursive implementation)
function treemap(nodes, x, y, w, h) {
  const total = nodes.reduce((s, n) => s + Math.max(0, n.value), 0);
  if (total <= 0 || nodes.length === 0) return [];

  // Simple slice-and-dice for clarity; for one level it's fine up to ~40 items
  // Switch orientation based on aspect
  const result = [];
  const sorted = [...nodes].sort((a, b) => b.value - a.value);
  layoutSquarified(sorted, x, y, w, h, result);
  return result;
}

function worst(row, w) {
  let rmax = -Infinity, rmin = Infinity, s = 0;
  for (const r of row) {
    s += r.value;
    if (r.value > rmax) rmax = r.value;
    if (r.value < rmin) rmin = r.value;
  }
  const ww = w * w;
  const ss = s * s;
  return Math.max((ww * rmax) / ss, ss / (ww * rmin));
}

function layoutSquarified(nodes, x, y, w, h, out) {
  if (nodes.length === 0) return;
  const total = nodes.reduce((s, n) => s + Math.max(0, n.value), 0);
  if (total <= 0) return;

  // Convert to areas scaled to w*h
  const area = w * h;
  const scaled = nodes.map(n => ({ ...n, area: Math.max(0, n.value) / total * area }));

  let remain = [...scaled];
  let cx = x, cy = y, cw = w, ch = h;

  while (remain.length > 0) {
    const short = Math.min(cw, ch);
    const row = [remain[0]];
    let i = 1;
    while (i < remain.length) {
      const candidate = [...row, remain[i]];
      const rowSum = candidate.reduce((s, r) => s + r.area, 0);
      const side = rowSum / short;
      const wBest = worst(row.map(r => ({ value: r.area })), short);
      const wCand = worst(candidate.map(r => ({ value: r.area })), short);
      if (wCand <= wBest) {
        row.push(remain[i]);
        i++;
      } else break;
    }
    const rowSum = row.reduce((s, r) => s + r.area, 0);
    const thickness = rowSum / short;
    if (cw < ch) {
      let rx = cx;
      for (const r of row) {
        const rw = r.area / thickness;
        out.push({ ...r, x: rx, y: cy, w: rw, h: thickness });
        rx += rw;
      }
      cy += thickness; ch -= thickness;
    } else {
      let ry = cy;
      for (const r of row) {
        const rh = r.area / thickness;
        out.push({ ...r, x: cx, y: ry, w: thickness, h: rh });
        ry += rh;
      }
      cx += thickness; cw -= thickness;
    }
    remain = remain.slice(row.length);
  }
}

function Treemap({ items, level, setLevel, setFilters, filters, pinnedSector }) {
  const { useState, useRef, useEffect, useMemo } = React;
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 900, h: 420 });
  const tt = useTooltip();

  // If a sector is pinned (we're on a sector page), skip 'sector' level
  useEffect(() => {
    if (pinnedSector && level.type === 'sector') {
      setLevel({ type: 'unit', sector: pinnedSector });
    }
  }, [pinnedSector, level.type, setLevel]);

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width } = e.contentRect;
        setSize({ w: Math.max(320, Math.floor(width)), h: 420 });
      }
    });
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  // Build groups based on level
  const groups = useMemo(() => {
    let keyFn;
    if (level.type === 'sector') keyFn = x => x.sector;
    else if (level.type === 'unit') keyFn = x => x.unit;
    else keyFn = x => x.program;

    const filtered = items.filter(it => {
      if (level.type === 'unit' && it.sector !== level.sector) return false;
      if (level.type === 'program') {
        if (it.sector !== level.sector) return false;
        if (it.unit !== level.unit) return false;
      }
      return true;
    });

    const g = groupBy(filtered, keyFn);
    const nodes = [...g.entries()].map(([k, v]) => {
      const r = rollup(v);
      // dominant funding
      const fg = groupBy(v, x => x.funding_norm);
      let dom = 'Unspecified', domVal = 0;
      for (const [f, vs] of fg) {
        const sum = vs.reduce((s, x) => s + (x.amounts.total || 0), 0);
        if (sum > domVal) { domVal = sum; dom = f; }
      }
      const climate = r.cc_adapt + r.cc_mitig > 0;
      return { key: k, value: Math.max(0.001, r.total), rollup: r, funding: dom, climate };
    });
    // Sort & clamp: very small tiles become a "..." aggregate
    nodes.sort((a, b) => b.value - a.value);
    return nodes;
  }, [items, level]);

  const tiles = useMemo(() => {
    if (groups.length === 0) return [];
    return treemap(groups, 0, 0, size.w, size.h);
  }, [groups, size]);

  const onClickTile = (node) => {
    if (level.type === 'sector') {
      setLevel({ type: 'unit', sector: node.key });
    } else if (level.type === 'unit') {
      setLevel({ type: 'program', sector: level.sector, unit: node.key });
      // Also apply unit filter to cascade
      setFilters(prev => {
        const next = { ...prev, units: new Set(prev.units) };
        next.units.add(node.key);
        return next;
      });
    } else {
      // leaf — just add to filters
    }
  };

  const crumbs = (
    <div className="crumbs">
      {pinnedSector ? (
        <span className={`lvl ${level.type === 'unit' ? 'cur' : ''}`}
              onClick={() => setLevel({ type: 'unit', sector: pinnedSector })}>
          {shortSector(pinnedSector)}
        </span>
      ) : (
        <span className={`lvl ${level.type === 'sector' ? 'cur' : ''}`}
              onClick={() => setLevel({ type: 'sector' })}>All sectors</span>
      )}
      {!pinnedSector && level.type !== 'sector' && (
        <>
          <span className="arrow">›</span>
          <span className={`lvl ${level.type === 'unit' ? 'cur' : ''}`}
                onClick={() => setLevel({ type: 'unit', sector: level.sector })}>
            {shortSector(level.sector)}
          </span>
        </>
      )}
      {level.type === 'program' && (
        <>
          <span className="arrow">›</span>
          <span className="lvl cur">{level.unit}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="treemap-wrap">
      <div className="treemap-header">
        {crumbs}
        <div style={{marginLeft: 'auto', fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace'}}>
          area = budget · color = dominant funding · ● climate-tagged
        </div>
      </div>
      <div ref={ref} className="treemap" style={{ height: size.h }}>
        {tiles.map((t, i) => {
          const short = Math.min(t.w, t.h);
          const cls = `tile ${short < 55 ? 'tiny' : ''} ${short < 26 ? 'micro' : ''} ${t.climate ? 'climate-marker' : ''}`;
          return (
            <div key={t.key}
                 className={cls}
                 style={{
                   left: t.x, top: t.y, width: t.w - 1, height: t.h - 1,
                   background: FUNDING_COLORS[t.funding] || 'var(--f-other)',
                 }}
                 onClick={() => onClickTile(t)}
                 onMouseEnter={(e) => tt.show(e, (
                   <>
                     <div className="t-title">{t.key}</div>
                     <div className="t-row"><span className="k">Total</span><span>{fmtPeso(t.rollup.total)}</span></div>
                     <div className="t-row"><span className="k">PAPs</span><span>{t.rollup.pap_count}</span></div>
                     <div className="t-row"><span className="k">PS / MOOE / CO</span><span>{fmtCompact(t.rollup.ps)} / {fmtCompact(t.rollup.mooe)} / {fmtCompact(t.rollup.co)}</span></div>
                     <div className="t-row"><span className="k">Funding</span><span>{t.funding}</span></div>
                     {t.climate && <div className="t-row"><span className="k">Climate</span><span>{fmtPeso(t.rollup.cc_adapt + t.rollup.cc_mitig)}</span></div>}
                   </>
                 ))}
                 onMouseMove={tt.move}
                 onMouseLeave={tt.hide}>
              <div className="name">{t.key}</div>
              <div className="amt">{fmtPeso(t.rollup.total)}</div>
              <div className="paps">{t.rollup.pap_count} PAP{t.rollup.pap_count !== 1 ? 's' : ''}</div>
            </div>
          );
        })}
      </div>
      {/* Funding legend */}
      <div className="funding-legend">
        {Object.entries(FUNDING_COLORS).map(([f, c]) => (
          <span key={f} className="item">
            <span className="sw" style={{ background: c }}></span>
            {f}
          </span>
        ))}
      </div>
      {tt.el}
    </div>
  );
}

// Donut chart
function Donut({ slices, size = 180, inner = 64, onHover, active, onClick }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2-2} fill="none" stroke="var(--rule)" strokeWidth="1.5"/></svg>;
  let acc = 0;
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 4;
  const paths = slices.map((s, i) => {
    const frac = s.value / total;
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += s.value;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const ix1 = cx + inner * Math.cos(start);
    const iy1 = cy + inner * Math.sin(start);
    const ix2 = cx + inner * Math.cos(end);
    const iy2 = cy + inner * Math.sin(end);
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return (
      <path key={i} d={d}
            fill={s.color}
            stroke="#fff" strokeWidth="1"
            style={{ opacity: active && active !== s.key ? 0.3 : 1, cursor: 'pointer', transition: 'opacity .15s' }}
            onMouseEnter={() => onHover?.(s.key)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => onClick?.(s)} />
    );
  });
  return <svg width={size} height={size}>{paths}</svg>;
}

Object.assign(window, { useTooltip, treemap, Treemap, Donut });
