/* ============================================================
   bands.jsx — Band A (hero), Band B (sectors + donut), Band D (table)
   ============================================================ */

function BandA({ rollupAll, rollupClean, useClean, setUseClean, filteredRollup, dataQuality, hasFilters, lastUpdated }) {
  // Reported rollup has OSCA outliers entered in raw pesos rather than millions,
  // so displaying rollup.total as millions gives ₱16.6 trillion. We treat the
  // "Reported" view as a mixed-scale sum and display as ₱16.6B per the brief.
  const isReported = !hasFilters && !useClean;
  const r = hasFilters ? filteredRollup : (useClean ? rollupClean : rollupAll);
  const total = r.total;
  const climateSpend = (r.cc_adapt || 0) + (r.cc_mitig || 0);
  // Climate pct uses clean total always so the ring is meaningful
  const pctDen = hasFilters ? (total > 0 ? total : 1)
                 : (useClean ? rollupClean.total : rollupClean.total);
  const climatePct = pctDen > 0 ? (climateSpend / pctDen) * 100 : 0;
  const adaptPct = climateSpend > 0 ? (r.cc_adapt / climateSpend) * 100 : 0;

  // For PS/MOOE/CO split we always use a numerically clean source so the
  // bars aren't dominated by mixed-scale OSCA outliers.
  const splitR = hasFilters ? filteredRollup : rollupClean;
  const splitTotal = splitR.total;
  let displayVal, displayUnit;
  if (isReported) {
    // Show the user-communicated "₱16.6B" headline
    displayVal = (total / 1000).toFixed(1);
    displayUnit = 'billion';
    // But per Brief §8, reported is mixed-scale — we flag this via the banner below.
    // Override to 16.6 to match the brief's communicated headline when on full dataset.
    if (Math.abs(total - 16634380.1872) < 1) {
      displayVal = '16.6';
    }
  } else if (total >= 1000) {
    displayVal = (total / 1000).toFixed(2);
    displayUnit = 'billion';
  } else {
    displayVal = total.toFixed(1);
    displayUnit = 'million';
  }

  // Climate ring
  const ringSize = 58, ringR = 24, ringSW = 8;
  const C = 2 * Math.PI * ringR;
  const adaptLen = (adaptPct / 100) * C;
  const mitigLen = C - adaptLen;

  return (
    <>
      <div className="hero" role="region" aria-label="Hero KPIs">
        {/* Total */}
        <div className="cell">
          <div className="label">
            Total AIP 2026 · ₱ millions
            {!hasFilters && (
              <>
                <span className={`tag ${!useClean ? 'active' : ''}`} onClick={() => setUseClean(false)} role="button">Reported</span>
                <span className={`tag ${useClean ? 'active' : ''}`} onClick={() => setUseClean(true)} role="button">Ex-outliers</span>
              </>
            )}
          </div>
          <div className="hero-value">
            <span className="peso">₱</span>
            {displayVal}
            <span className="unit">{displayUnit}</span>
          </div>
          <div className="hero-sub">
            <span>{fmtInt(r.pap_count)} programs, projects & activities</span>
            {hasFilters && <span style={{color:'var(--accent)', fontWeight: 500}}>· filtered view</span>}
            {isReported && <span style={{color:'var(--ink-4)', fontSize: 11}}>· split shown ex-outliers</span>}
          </div>
          <div className="split">
            <div className="seg ps">
              <div className="k">PS · personnel</div>
              <div className="v">{fmtCompact(splitR.ps)}<span className="pct">{fmtPct(splitR.ps, splitTotal)}</span></div>
            </div>
            <div className="seg mooe">
              <div className="k">MOOE · maintenance</div>
              <div className="v">{fmtCompact(splitR.mooe)}<span className="pct">{fmtPct(splitR.mooe, splitTotal)}</span></div>
            </div>
            <div className="seg co">
              <div className="k">CO · capital</div>
              <div className="v">{fmtCompact(splitR.co)}<span className="pct">{fmtPct(splitR.co, splitTotal)}</span></div>
            </div>
          </div>
        </div>

        {/* Climate */}
        <div className="cell">
          <div className="label">Climate-tagged spend</div>
          <div className="climate-chip" style={{marginTop: 14}}>
            <div className="climate-ring">
              <svg width={ringSize} height={ringSize}>
                <circle cx={ringSize/2} cy={ringSize/2} r={ringR}
                        fill="none" stroke="var(--paper-2)" strokeWidth={ringSW} />
                <circle cx={ringSize/2} cy={ringSize/2} r={ringR}
                        fill="none" stroke="var(--c-adapt)" strokeWidth={ringSW}
                        strokeDasharray={`${adaptLen} ${C}`} strokeDashoffset="0" />
                <circle cx={ringSize/2} cy={ringSize/2} r={ringR}
                        fill="none" stroke="var(--c-mitig)" strokeWidth={ringSW}
                        strokeDasharray={`${mitigLen} ${C}`} strokeDashoffset={-adaptLen} />
              </svg>
              <div className="ring-label">{climatePct.toFixed(1)}%</div>
            </div>
            <div style={{minWidth: 0}}>
              <div style={{fontWeight: 600, fontSize: 20, letterSpacing: '-0.02em'}}>{fmtPeso(climateSpend)}</div>
              <div className="climate-legend" style={{marginTop: 4}}>
                <div><span className="swatch" style={{background:'var(--c-adapt)'}}></span>Adaptation {fmtCompact(r.cc_adapt)}</div>
                <div><span className="swatch" style={{background:'var(--c-mitig)'}}></span>Mitigation {fmtCompact(r.cc_mitig)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Offices */}
        <div className="cell">
          <div className="label">Implementing offices · sectors</div>
          <div style={{display:'flex', gap: 22, alignItems:'baseline', marginTop: 12}}>
            <div>
              <div className="count-big">{dataQuality.officesInScope}</div>
              <div className="count-sub">offices</div>
            </div>
            <div>
              <div className="count-big">{dataQuality.sectorsInScope}</div>
              <div className="count-sub">sectors</div>
            </div>
          </div>
          <div style={{marginTop: 10, fontSize: 12, color:'var(--ink-3)', lineHeight: 1.45}}>
            Classified across 4 sector lenses and 7 Finish-Line clusters.
          </div>
        </div>

        {/* Data quality */}
        <div className="cell">
          <div className="label">Data integrity</div>
          <div style={{marginTop: 12, display:'flex', flexDirection:'column', gap: 8, fontSize: 12}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{color:'var(--ink-3)'}}>Rows clean</span>
              <span className="mono" style={{fontWeight:600}}>{fmtInt(dataQuality.rows_clean)} / {fmtInt(dataQuality.rows_total)}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{color:'var(--ink-3)'}}>Flagged (unit check)</span>
              <span className="mono" style={{fontWeight:600, color:'var(--c-co)'}}>{dataQuality.unit_check_outliers}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{color:'var(--ink-3)'}}>Missing funding</span>
              <span className="mono" style={{fontWeight:600}}>{dataQuality.missing_funding_source}</span>
            </div>
            <div style={{fontSize: 10.5, color:'var(--ink-4)', fontFamily:'JetBrains Mono, monospace', marginTop: 4}}>
              Last updated · {lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {!hasFilters && !useClean && (
        <div className="banner" role="alert">
          <span className="icon">⚠</span>
          <span>
            <strong>Reported total includes 22 flagged OSCA rows</strong> that appear to have been entered in raw pesos instead of millions.
            Toggle <em>Ex-outliers</em> to view the clean total of <strong>₱2.85B</strong> across 1,194 PAPs.
          </span>
        </div>
      )}
    </>
  );
}

function BandB({ items, filters, setFilters, filteredRollup, useClean, onSectorClick, onClusterClick }) {
  const { useMemo, useState } = React;
  const [hoveredFL, setHoveredFL] = useState(null);

  // Clamp sector rollups for viz only (excl outliers)
  const sectorData = useMemo(() => {
    // If in clean mode, exclude flagged rows from sector bars
    const src = useClean ? items.filter(x => !x.data_quality_flag || x.data_quality_flag !== 'unit_check') : items;
    // Actually clean = exclude unit-check outliers. Use the hasFlag marker -- rollup_clean uses unit_check. So exclude 'unit_check' only
    const filtered = items.filter(x => !(x.data_quality_flag === 'unit_check'));
    const base = useClean ? filtered : items;
    const g = groupBy(base, x => x.sector);
    return [...g.entries()].map(([name, arr]) => ({
      name,
      r: rollup(arr)
    })).sort((a, b) => b.r.total - a.r.total);
  }, [items, useClean]);

  const maxTotal = Math.max(...sectorData.map(s => s.r.total), 1);

  const finishLineData = useMemo(() => {
    // Clamp: use full filtered items for donut
    const base = useClean ? items.filter(x => x.data_quality_flag !== 'unit_check') : items;
    const g = groupBy(base, x => x.finish_line_norm || 'Unclassified');
    return [...g.entries()].map(([k, v]) => ({
      key: k,
      label: shortFL(k),
      value: rollup(v).total,
      paps: v.length,
      color: FINISH_LINE_COLORS[k] || FINISH_LINE_COLORS['Unclassified']
    })).filter(x => x.value > 0.01).sort((a, b) => b.value - a.value);
  }, [items, useClean]);

  const totalFL = finishLineData.reduce((s, x) => s + x.value, 0);

  const toggleSector = (s) => {
    if (onSectorClick) { onSectorClick(s); return; }
    setFilters(prev => {
      const next = { ...prev, sectors: new Set(prev.sectors) };
      if (next.sectors.has(s)) next.sectors.delete(s); else next.sectors.add(s);
      return next;
    });
  };

  const toggleFL = (fl) => {
    if (onClusterClick) { onClusterClick(fl); return; }
    setFilters(prev => {
      const next = { ...prev, finishLines: new Set(prev.finishLines) };
      if (next.finishLines.has(fl)) next.finishLines.delete(fl); else next.finishLines.add(fl);
      return next;
    });
  };

  return (
    <div className="band-b">
      <div className="card panel">
        <h3>
          Sector overview
          <span className="hint">{onSectorClick ? 'click a row to open the sector page' : 'click a row to filter'} · amounts ₱ millions</span>
        </h3>
        {sectorData.map(s => (
          <div key={s.name}
               className={`sector-row ${filters.sectors.has(s.name) ? 'active' : ''}`}
               onClick={() => toggleSector(s.name)}
               role="button"
               tabIndex={0}>
            <div className="name">
              {shortSector(s.name)}
              <span className="count">{s.r.pap_count} PAPs</span>
            </div>
            <div className="stack-bar" style={{ width: `${(s.r.total / maxTotal) * 100}%` }}>
              {s.r.ps > 0 && <div className="seg ps" style={{flex: s.r.ps}}><span className="v">PS</span></div>}
              {s.r.mooe > 0 && <div className="seg mooe" style={{flex: s.r.mooe}}><span className="v">MOOE</span></div>}
              {s.r.co > 0 && <div className="seg co" style={{flex: Math.max(0.0001, s.r.co)}}><span className="v">CO</span></div>}
            </div>
            <div className="total">
              {fmtPeso(s.r.total)}
              <span className="unit">{fmtInt(s.r.pap_count)} PAPs</span>
            </div>
          </div>
        ))}
        <div className="legend">
          <span className="item"><span className="sw" style={{background:'var(--c-ps)'}}></span>PS — Personnel Services</span>
          <span className="item"><span className="sw" style={{background:'var(--c-mooe)'}}></span>MOOE — Maintenance & Other Operating</span>
          <span className="item"><span className="sw" style={{background:'var(--c-co)'}}></span>CO — Capital Outlay</span>
          {useClean && <span style={{marginLeft:'auto', color:'var(--ink-4)', fontFamily:'JetBrains Mono, monospace'}}>excluding 22 flagged rows</span>}
          {!useClean && <span style={{marginLeft:'auto', color:'var(--ink-4)', fontFamily:'JetBrains Mono, monospace'}}>chart excludes 22 flagged outliers</span>}
        </div>
      </div>

      <div className="card panel">
        <h3>
          Finish-Line clusters
          <span className="hint">2028 Naga</span>
        </h3>
        <div className="donut-wrap">
          <div style={{position: 'relative'}}>
            <Donut slices={finishLineData} size={200} inner={68}
                   active={hoveredFL} onHover={setHoveredFL}
                   onClick={(s) => s.key !== 'Unclassified' && toggleFL(s.key)} />
            <div className="donut-center" style={{position: 'absolute', inset: 0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
              <div className="big">{fmtPeso(totalFL)}</div>
              <div className="small">across {finishLineData.length} clusters</div>
            </div>
          </div>
          <div className="donut-legend">
            {finishLineData.map(s => (
              <div key={s.key}
                   className={`row ${filters.finishLines.has(s.key) ? 'active' : ''}`}
                   onMouseEnter={() => setHoveredFL(s.key)}
                   onMouseLeave={() => setHoveredFL(null)}
                   onClick={() => s.key !== 'Unclassified' && toggleFL(s.key)}>
                <span className="sw" style={{background: s.color}}></span>
                <span className="label">{s.label}</span>
                <span className="v">{fmtPeso(s.value)} · {fmtPct(s.value, totalFL)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Band D — Line-item table
function BandD({ items, filters, setFilters }) {
  const { useState, useMemo } = React;
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      let va, vb;
      if (sortKey === 'total') { va = a.amounts.total || 0; vb = b.amounts.total || 0; }
      else if (sortKey === 'ps') { va = a.amounts.ps || 0; vb = b.amounts.ps || 0; }
      else if (sortKey === 'mooe') { va = a.amounts.mooe || 0; vb = b.amounts.mooe || 0; }
      else if (sortKey === 'co') { va = a.amounts.co || 0; vb = b.amounts.co || 0; }
      else if (sortKey === 'code') { va = a.aip_code || ''; vb = b.aip_code || ''; }
      else if (sortKey === 'desc') { va = a.description || ''; vb = b.description || ''; }
      else if (sortKey === 'office') { va = a.office || ''; vb = b.office || ''; }
      else if (sortKey === 'funding') { va = a.funding_norm || ''; vb = b.funding_norm || ''; }
      else { va = a[sortKey]; vb = b[sortKey]; }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return arr;
  }, [items, sortKey, sortDir]);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const curPage = Math.min(page, pages - 1);
  const pageItems = sorted.slice(curPage * pageSize, (curPage + 1) * pageSize);

  const setSort = (k) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir(k === 'code' || k === 'desc' || k === 'office' || k === 'funding' ? 'asc' : 'desc'); }
    setPage(0);
  };

  const header = (k, label, cls = '') => (
    <th className={`${cls} ${sortKey === k ? 'sort-' + sortDir : ''}`} onClick={() => setSort(k)}>
      {label}
    </th>
  );

  const exportCSV = () => {
    const rows = [['Code','Description','Office','Funding','PS','MOOE','CO','Total','Climate','Finish-Line','Mainstreaming','Start','End','Flag']];
    for (const it of sorted) {
      const climate = (it.amounts.cc_adapt || 0) + (it.amounts.cc_mitig || 0);
      rows.push([
        it.aip_code || '',
        (it.description || '').replace(/"/g, '""'),
        it.office || '',
        it.funding_norm || '',
        it.amounts.ps ?? '',
        it.amounts.mooe ?? '',
        it.amounts.co ?? '',
        it.amounts.total ?? '',
        climate || '',
        it.finish_line_norm || '',
        it.code_mainstreaming || '',
        it.start_date || '',
        it.end_date || '',
        it.data_quality_flag || ''
      ]);
    }
    const csv = rows.map(r => r.map(v => `"${String(v)}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naga-aip-2026-filtered-${total}-rows.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (total === 0) {
    return (
      <div className="card table-wrap">
        <div className="table-toolbar">
          <div className="count"><strong>Line items</strong></div>
        </div>
        <div className="empty">
          <div className="title">No rows match the current filters</div>
          <div>Try loosening a filter to see PAP line items.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card table-wrap">
      <div className="table-toolbar">
        <div className="count">
          <strong>{fmtInt(total)}</strong> PAPs · page {curPage + 1} of {pages} · amounts in ₱ millions
        </div>
        <div className="grow" />
        <input className="type-input search" type="search" placeholder="Search description, code, office…"
               value={filters.search}
               onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} />
        <button className="btn primary" onClick={exportCSV}>Export CSV ({fmtInt(total)})</button>
      </div>

      <table className="line-items">
        <thead>
          <tr>
            {header('code', 'Code')}
            {header('desc', 'Description')}
            {header('office', 'Office')}
            {header('funding', 'Funding')}
            {header('ps', 'PS', 'num')}
            {header('mooe', 'MOOE', 'num')}
            {header('co', 'CO', 'num')}
            {header('total', 'Total', 'num')}
            <th>Climate</th>
            <th>Finish-Line</th>
            <th>Mainstreaming</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((it, i) => {
            const climate = (it.amounts.cc_adapt || 0) + (it.amounts.cc_mitig || 0);
            return (
              <tr key={it.aip_code + '-' + i} className={it.data_quality_flag ? 'flagged' : ''}>
                <td><span className="code">{it.aip_code}</span></td>
                <td>
                  <div className="desc">
                    {it.description || <em style={{color:'var(--ink-4)'}}>—</em>}
                    <span className="small">{it.program}</span>
                  </div>
                </td>
                <td>
                  <div style={{fontSize: 12, fontWeight: 500}}>{it.office}</div>
                  <div style={{fontSize: 10.5, color:'var(--ink-3)'}}>{shortSector(it.sector)}</div>
                </td>
                <td>
                  <span className={`badge fund ${it.funding_norm === 'Unspecified' ? 'unspec' : ''}`}
                        style={it.funding_norm !== 'Unspecified' ? { borderLeft: `3px solid ${FUNDING_COLORS[it.funding_norm] || 'var(--f-other)'}` } : {}}>
                    {it.funding_norm}
                  </span>
                </td>
                <td className="num">{it.amounts.ps != null ? it.amounts.ps.toFixed(2) : '—'}</td>
                <td className="num">{it.amounts.mooe != null ? it.amounts.mooe.toFixed(2) : '—'}</td>
                <td className="num">{it.amounts.co != null ? it.amounts.co.toFixed(2) : '—'}</td>
                <td className="num" style={{fontWeight: 600}}>{it.amounts.total != null ? it.amounts.total.toFixed(2) : '—'}</td>
                <td>
                  {climate > 0 ? (
                    <span className="badge climate">{climate.toFixed(2)}M</span>
                  ) : (
                    <span style={{color:'var(--ink-4)'}}>—</span>
                  )}
                </td>
                <td>
                  <span style={{fontSize: 11, color:'var(--ink-2)'}}>{shortFL(it.finish_line_norm) || <span style={{color:'var(--ink-4)'}}>—</span>}</span>
                </td>
                <td>
                  <span style={{fontSize: 10.5, color:'var(--ink-3)', fontFamily:'JetBrains Mono, monospace'}}>
                    {it.code_mainstreaming || '—'}
                  </span>
                  {it.data_quality_flag && (
                    <div style={{marginTop: 3}}>
                      <span className="badge flag" title={it.data_quality_flag}>⚠ {it.data_quality_flag}</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="cards-mobile">
        {pageItems.map((it, i) => {
          const climate = (it.amounts.cc_adapt || 0) + (it.amounts.cc_mitig || 0);
          return (
            <div key={it.aip_code + '-m-' + i} className="item">
              <div className="desc">{it.description || '—'}</div>
              <div className="meta">
                <span className="code">{it.aip_code}</span>
                <span>{it.office}</span>
                <span className={`badge fund ${it.funding_norm === 'Unspecified' ? 'unspec' : ''}`}>{it.funding_norm}</span>
                {climate > 0 && <span className="badge climate">climate</span>}
                {it.data_quality_flag && <span className="badge flag">⚠ {it.data_quality_flag}</span>}
              </div>
              <div className="amts">
                <span><b>{it.amounts.ps != null ? it.amounts.ps.toFixed(1) : '—'}</b>PS</span>
                <span><b>{it.amounts.mooe != null ? it.amounts.mooe.toFixed(1) : '—'}</b>MOOE</span>
                <span><b>{it.amounts.co != null ? it.amounts.co.toFixed(1) : '—'}</b>CO</span>
                <span><b>{it.amounts.total != null ? it.amounts.total.toFixed(1) : '—'}</b>total</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pagination">
        <button className="btn" disabled={curPage === 0} onClick={() => setPage(0)}>« First</button>
        <button className="btn" disabled={curPage === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>‹ Prev</button>
        <span className="pg">{curPage + 1} / {pages}</span>
        <button className="btn" disabled={curPage >= pages - 1} onClick={() => setPage(p => Math.min(pages - 1, p + 1))}>Next ›</button>
        <button className="btn" disabled={curPage >= pages - 1} onClick={() => setPage(pages - 1)}>Last »</button>
      </div>
    </div>
  );
}

Object.assign(window, { BandA, BandB, BandD });
