/* ============================================================
   app.jsx — Root with page-based navigation
   ============================================================ */

const { useState, useEffect, useMemo, useRef } = React;

// Pages = Landing (default) + Data overview + one per finish-line cluster
function buildPages(allItems) {
  const pages = [
    { id: 'landing', kind: 'landing', label: 'Home' },
    { id: 'overview', kind: 'overview', label: 'Data' },
  ];
  for (const fl of FINISH_LINES) {
    pages.push({ id: 'cluster:' + fl, kind: 'cluster', label: shortFL(fl), cluster: fl, color: FINISH_LINE_COLORS[fl] });
  }
  return pages;
}

function PageHero({ page, items }) {
  if (page.kind === 'overview') return null;
  const base = items.filter((x) => !isOutlier(x));
  const scoped = base.filter((x) => {
    if (page.kind === 'sector') return x.sector === page.sector;
    if (page.kind === 'cluster') return x.finish_line_norm === page.cluster;
    return true;
  });
  const r = rollup(scoped);
  const blurb = page.kind === 'sector' ?
  `All ${r.pap_count} programs, projects & activities in the ${shortSector(page.sector)} sector. Drill into offices, line items, and strategic overlays filtered to this lens.` :
  `PAPs aligned to the 2028 Finish-Line cluster — ${page.cluster}. Cross-sectoral view of programs advancing this theme.`;

  const accentColor = page.kind === 'cluster' ? page.color : 'var(--accent)';

  return (
    <div className="page-hero" style={page.kind === 'cluster' ? {
      borderTop: `4px solid ${accentColor}`
    } : {}}>
      <div>
        <div className="eyebrow">
          {page.kind === 'sector' ? 'Sector' : '2028 Finish-Line Cluster'}
        </div>
        <h1>{page.kind === 'cluster' ? page.cluster : shortSector(page.sector)}</h1>
        <div className="blurb">{blurb}</div>
      </div>
      <div className="stats">
        <div>
          <div className="k">Total</div>
          <div className="v">{fmtPeso(r.total)}</div>
        </div>
        <div>
          <div className="k">PAPs</div>
          <div className="v">{fmtInt(r.pap_count)}</div>
        </div>
        <div>
          <div className="k">Offices</div>
          <div className="v">{new Set(scoped.map((x) => x.unit)).size}</div>
        </div>
      </div>
    </div>);

}

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [useClean, setUseClean] = useState(false);
  const [level, setLevel] = useState({ type: 'sector' });
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [accent, setAccent] = useState(window.TWEAKS?.accent || 'indigo');
  const [density, setDensity] = useState(window.TWEAKS?.density || 'comfortable');

  // Page routing (persists in localStorage)
  const [pageId, setPageId] = useState(() => {
    try {return localStorage.getItem('naga.page') || 'landing';}
    catch {return 'landing';}
  });
  useEffect(() => {
    try {localStorage.setItem('naga.page', pageId);} catch {}
  }, [pageId]);

  useEffect(() => {
    fetch('data/aip2026.json').then((r) => r.json()).then(setData).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    document.documentElement.setAttribute('data-density', density);
  }, [accent, density]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksVisible(true);else
      if (e.data.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent?.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Sticky header: scrolled state + on-dark detection (when header overlaps .L-digin)
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerOnDark, setHeaderOnDark] = useState(false);
  useEffect(() => {
    let raf = null;
    const check = () => {
      raf = null;
      setHeaderScrolled(window.scrollY > 8);
      // is the sticky header (y=0..~130) currently overlapping a .L-digin block?
      const darkEls = document.querySelectorAll('.L-digin');
      let onDark = false;
      for (const el of darkEls) {
        const r = el.getBoundingClientRect();
        // header occupies roughly 0..130 at top. If .L-digin top < 130 and bottom > 0, overlapping.
        if (r.top < 130 && r.bottom > 0) { onDark = true; break; }
      }
      setHeaderOnDark(onDark);
    };
    const onScroll = () => {
      if (raf == null) raf = requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pageId]);

  useEffect(() => {
    window.parent?.postMessage({ type: '__edit_mode_set_keys', edits: { accent, density } }, '*');
  }, [accent, density]);

  const allItems = useMemo(() => data ? flattenData(data) : [], [data]);
  const allUnits = useMemo(() => [...new Set(allItems.map((x) => x.unit))].sort(), [allItems]);
  const pages = useMemo(() => buildPages(allItems), [allItems]);
  const page = pages.find((p) => p.id === pageId) || pages[0];

  // Scope items to the active page BEFORE filters
  const pageItems = useMemo(() => {
    if (!page || page.kind === 'overview') return allItems;
    if (page.kind === 'sector') return allItems.filter((x) => x.sector === page.sector);
    if (page.kind === 'cluster') return allItems.filter((x) => x.finish_line_norm === page.cluster);
    return allItems;
  }, [allItems, page]);

  const filtered = useMemo(() => applyFilters(pageItems, filters), [pageItems, filters]);
  const hasFilters = hasAnyFilter(filters);
  const filteredRollup = useMemo(() => rollup(filtered), [filtered]);

  const rollupAll = data?.rollup;
  const rollupClean = data?.rollup_clean_excluding_outliers;
  const dq = data?.data_quality;
  const dataQuality = dq && {
    ...dq,
    officesInScope: new Set(allItems.map((x) => x.unit)).size,
    sectorsInScope: 4
  };

  // Reset drill-down when page changes
  useEffect(() => {
    if (page?.kind === 'sector') setLevel({ type: 'unit', sector: page.sector });else
    setLevel({ type: 'sector' });
  }, [pageId]);

  if (error) return <div className="shell"><div className="empty"><div className="title">Could not load data</div><div>{error}</div></div></div>;
  if (!data) return (
    <div className="shell">
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--ink-3)' }}>Loading 1,216 PAPs…</div>
      </div>
    </div>);


  const lastUpdated = 'Nov 2025 template';
  const sectorPages = pages.filter((p) => p.kind === 'sector');
  const clusterPages = pages.filter((p) => p.kind === 'cluster');

  return (
    <>
      <div className={`topbar ${headerScrolled ? 'scrolled' : ''} ${headerOnDark ? 'on-dark' : ''}`}>
        <div className="wordmark">
          <img className="seal-img" src="assets/naga-seal.png" alt="Naga City" />
          <span className="sep">·</span>
          <span className="title">Annual Investment Program — Fiscal Year 2026</span>
          <span className="badge">Transparency</span>
        </div>
        <div className="grow" />
        <div className="meta">
          <a className="top-link" href="https://www2.naga.gov.ph" target="_blank" rel="noopener noreferrer">naga.gov.ph</a>
          <a className="top-link" href="https://www2.naga.gov.ph/about-naga/" target="_blank" rel="noopener noreferrer">About</a>
          <a className="top-link" href="https://www2.naga.gov.ph/contact-us/" target="_blank" rel="noopener noreferrer">Contact</a>
        </div>
      </div>

      {/* Navigation */}
      <div className={`nav-tabs ${headerScrolled ? 'scrolled' : ''} ${headerOnDark ? 'on-dark' : ''}`} role="tablist">
        <div className="nav-tabs-inner">
          <button className={`nav-tab ${page.id === 'landing' ? 'active' : ''}`}
          onClick={() => setPageId('landing')}
          role="tab">
            Home
          </button>
          <button className={`nav-tab ${page.id === 'overview' ? 'active' : ''}`}
          onClick={() => setPageId('overview')}
          role="tab">
            Overview
          </button>
          <div className="nav-divider" />
          {clusterPages.map((p) => <button key={p.id}
            className={`nav-tab ${page.id === p.id ? 'active' : ''}`}
            onClick={() => setPageId(p.id)}
            role="tab">
              {p.label}
            </button>
          )}
        </div>
      </div>

      {page.kind === 'landing' ? (
        <Landing items={allItems} rollupAll={rollupAll} rollupClean={rollupClean}
                 setPageId={setPageId} />
      ) : (
      <div className="shell">
        <PageHero page={page} items={allItems} />

        {/* Band A — Hero KPIs (only on Overview) */}
        {page.kind === 'overview' &&
        <div className="band">
            <div className="band-head">
              <span className="eyebrow">Headline</span>
              <h2>Where ₱2.85 billion goes in 2026</h2>
              <span className="sub">All amounts in Philippine pesos, millions</span>
            </div>
            <BandA rollupAll={rollupAll}
          rollupClean={rollupClean}
          useClean={useClean}
          setUseClean={setUseClean}
          filteredRollup={filteredRollup}
          dataQuality={dataQuality}
          hasFilters={hasFilters}
          lastUpdated={lastUpdated} />
          </div>
        }

        {/* Filter rail */}
        <div className="band">
          <div className="band-head">
            <span className="eyebrow">Filters</span>
            <h2 style={{ fontSize: 22, color: 'var(--ink-2)' }}>Narrow the view</h2>
            <span className="sub">
              {page.kind === 'overview' ?
              'All panels below cascade · clicking a chart also filters' :
              `Scoped to ${page.kind === 'cluster' ? page.cluster : shortSector(page.sector)} · additional filters cascade to the panels below`}
            </span>
          </div>
          <FilterRail items={pageItems} filters={filters} setFilters={setFilters} allUnits={allUnits} />
          <Breadcrumb filters={filters} setFilters={setFilters}
          filteredCount={filtered.length} totalCount={pageItems.length} />
        </div>

        {/* Band B — sector overview only on Overview */}
        {page.kind === 'overview' &&
        <div className="band">
            <div className="band-head">
              <span className="eyebrow">Sectors</span>
              <h2>Sector mix and Finish-Line themes</h2>
              <span className="sub">Click a sector or cluster to jump to its page</span>
            </div>
            <BandB items={filtered} filters={filters} setFilters={setFilters}
          filteredRollup={filteredRollup} useClean={useClean}
          onClusterClick={(c) => setPageId('cluster:' + c)} />
          </div>
        }

        {/* Band C — treemap */}
        <div className="band">
          <div className="band-head">
            <span className="eyebrow">Offices</span>
            <h2>{page.kind === 'sector' ? 'Offices in this sector' :
              page.kind === 'cluster' ? 'Programs aligned to this cluster' :
              'Office deep-dive'}</h2>
            <span className="sub">Click a tile to drill down · click a crumb to zoom out</span>
          </div>
          <div className="card">
            <Treemap items={filtered.filter((x) => !isOutlier(x))} level={level} setLevel={setLevel}
            setFilters={setFilters} filters={filters}
            pinnedSector={page.kind === 'sector' ? page.sector : null} />
          </div>
        </div>

        {/* Band D */}
        <div className="band">
          <div className="band-head">
            <span className="eyebrow">Line items</span>
            <h2>PAP register</h2>
            <span className="sub">Sortable · climate-tagged rows marked · flagged rows highlighted</span>
          </div>
          <BandD items={filtered} filters={filters} setFilters={setFilters} />
        </div>

        {/* Band E */}
        <BandE items={filtered} useClean={useClean} pageKind={page.kind} />

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--rule)',
          fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.6,
          display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>About this dashboard</div>
            <div>
              Naga City's 2026 Annual Investment Program — ₱2.85 billion across 1,200+ programs,
              projects and activities submitted by 94 implementing offices. Classified across
              four sector lenses and seven 2028 Finish-Line clusters.
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>Data notes</div>
            <div>
              All amounts in ₱ millions. 22 OSCA rows flagged as raw-peso outliers.
              299 PAPs have no recorded funding source — shown as "Unspecified", never dropped.
              CSV export reflects current filter state.
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>Schema</div>
            <div className="mono" style={{ fontSize: 10.5 }}>
              aip2026.v1 · generated {lastUpdated}<br />
              1,216 rows × 23 columns
            </div>
          </div>
        </div>
      </div>
      )}

      <TweaksPanel visible={tweaksVisible}
      accent={accent} setAccent={setAccent}
      density={density} setDensity={setDensity} />
    </>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);