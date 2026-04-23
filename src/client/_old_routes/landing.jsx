/* ============================================================
   landing.jsx — Magazine-style landing page
   ============================================================ */

const { useState: _useState, useEffect: _useEffect, useRef: _useRef, useMemo: _useMemo } = React;

/* ---------- hooks ---------- */

// Reveal an element when it scrolls into view
function useReveal(threshold = 0.15) {
  const ref = _useRef(null);
  const [visible, setVisible] = _useState(false);
  _useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { setVisible(true); io.unobserve(el); }
      });
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// Animate a number from 0 to `to` once `active` becomes true
function useCounter(to, active, duration = 1400) {
  const [val, setVal] = _useState(0);
  _useEffect(() => {
    if (!active) return;
    let start = null;
    let raf;
    const tick = (t) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const e = 1 - Math.pow(1 - p, 3);
      setVal(to * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, active, duration]);
  return val;
}

// Parallax translateY based on scroll position
function useParallax(factor = 0.15) {
  const ref = _useRef(null);
  const [y, setY] = _useState(0);
  _useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportMid = window.innerHeight / 2;
      const delta = (rect.top + rect.height / 2) - viewportMid;
      setY(-delta * factor);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [factor]);
  return [ref, y];
}

/* ---------- visual primitives ---------- */

// Gradient placeholder "photograph" block with a caption
function GradientImage({ palette, caption, kicker, ratio = '4/3', style = {}, children }) {
  const [ref, y] = useParallax(0.08);
  const [revealRef, revealed] = useReveal(0.2);
  const bg = palette.join(', ');
  return (
    <figure className={`grad-img ${revealed ? 'in' : ''}`} ref={revealRef} style={{...style, aspectRatio: ratio}}>
      <div className="grad-img-inner" ref={ref} style={{
        background: `linear-gradient(135deg, ${bg})`,
        transform: `translate3d(0, ${y}px, 0)`,
      }}>
        {/* grain texture */}
        <div className="grad-grain" />
        {/* abstract shapes */}
        <svg className="grad-shapes" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <circle cx="300" cy="80" r="60" fill="rgba(255,255,255,0.15)" />
          <circle cx="80" cy="240" r="90" fill="rgba(0,0,0,0.08)" />
          <rect x="140" y="120" width="200" height="3" fill="rgba(255,255,255,0.4)" />
        </svg>
        {children}
      </div>
      <figcaption>
        {kicker && <span className="kicker">{kicker}</span>}
        <span className="cap">{caption}</span>
      </figcaption>
    </figure>
  );
}

function BigNumber({ value, suffix = '', prefix = '', decimals = 0, label, sub, compact }) {
  const [ref, visible] = useReveal(0.3);
  const animated = useCounter(value, visible, 1600);
  const displayed = compact ? fmtCompact(animated) : animated.toFixed(decimals);
  return (
    <div ref={ref} className={`big-number ${visible ? 'in' : ''}`}>
      <div className="n">{prefix}{displayed}{suffix}</div>
      {label && <div className="l">{label}</div>}
      {sub && <div className="s">{sub}</div>}
    </div>
  );
}

/* ---------- cluster content map ---------- */

const CLUSTER_CONTENT = {
  'Inclusive and Thriving Economy': {
    palette: ['#e8a15e', '#c47a2a', '#7a4a1a'],
    kicker: 'Markets, MSMEs, Livelihoods',
    blurb: 'From the revitalized Naga City Public Market to PPP-powered commercial corridors, the 2026 plan puts working capital and enterprise support at the street level. Trainings, permit reforms, and business-matching services expand the tax base without displacing informal vendors.',
    location: 'Naga City Public Market',
  },
  'Envi, Infra and Housing': {
    palette: ['#4a7a6a', '#2f827a', '#1a4a3a'],
    kicker: 'River, Roads, Roofs',
    blurb: 'The Naga River rehabilitation, drainage master-planning, and the continued rollout of the resettlement program anchor this cluster. Capital outlay here shapes whether the next flood season is an emergency or a footnote.',
    location: 'Naga River corridor',
  },
  'Transparent, Digital, and Accountable Governance': {
    palette: ['#6a6aa0', '#3c4080', '#1a1e50'],
    kicker: 'Service Delivery, Open Data',
    blurb: 'Citizen-facing digital services, open-data publishing, and capacity-building inside the 94 offices that operate the city. Investments here are quiet — until you need a business permit in 15 minutes instead of 15 days.',
    location: 'Naga City Hall',
  },
  'Safe, Secure, and Humane Communities': {
    palette: ['#b8505a', '#8a3540', '#4a1a20'],
    kicker: 'Fire, Flood, First Response',
    blurb: 'Command-center upgrades, evacuation center hardening, and disaster risk reduction drills. In a city bracketed by two river systems and fronting the Bicol typhoon corridor, resilience is measured in minutes to deploy.',
    location: 'Emergency Operations Center',
  },
  'Culture, Arts, and Heritage': {
    palette: ['#d06a94', '#a03868', '#5a1840'],
    kicker: 'Heritage, Creative Economy',
    blurb: 'Peñafrancia traditions, heritage façade programs, and the creative-industries grant. A small slice of the budget carries an outsized share of what makes Naga recognizable to its own people.',
    location: 'Basilica Minore de Peñafrancia',
  },
  'Empowered and Educated Citizens': {
    palette: ['#5a9ab8', '#2f6890', '#15405a'],
    kicker: 'Schools, Scholarships, Skills',
    blurb: 'Scholarship portfolios, school feeding, TESDA partnerships, and the city\'s investment in its own bureaucracy as a training ground. Human capital is the slowest-compounding line in the budget — and the one that matters most by 2028.',
    location: 'Camarines Sur Polytechnic Colleges',
  },
  'Social Protection and Inclusion': {
    palette: ['#c89858', '#8a6230', '#4a3510'],
    kicker: 'Seniors, PWDs, Families',
    blurb: 'Social pension top-ups, PWD assistance, solo parent programs, and the unglamorous transfers that keep the most vulnerable Nagueños inside the safety net rather than outside it.',
    location: 'City Social Welfare & Development Office',
  },
  'Healthy Nagueños': {
    palette: ['#6ab85a', '#3c8a2a', '#1a4a15'],
    kicker: 'Clinics, Nutrition, Dignity',
    blurb: 'Barangay health stations, maternal care, mental health services, and the continuing universal-health-care rollout. The 2026 plan treats wellness as infrastructure — not as a line item.',
    location: 'Naga City Hospital',
  },
};

/* ---------- the Landing component ---------- */

function Landing({ items, rollupAll, rollupClean, setPageId }) {
  const climateSpend = rollupAll.cc_adapt + rollupAll.cc_mitig;
  const climatePct = (climateSpend / rollupClean.total) * 100;

  // Cluster rollups (exclude outliers for stability)
  const clusterRollups = _useMemo(() => {
    const clean = items.filter(x => !isOutlier(x));
    return FINISH_LINES.map(fl => {
      const rows = clean.filter(x => x.finish_line_norm === fl);
      return { fl, ...rollup(rows), pap_count: rows.length };
    });
  }, [items]);

  const total = rollupClean.total;
  const coPct = (rollupClean.co / total) * 100;
  const climateSpendPct = climatePct;

  return (
    <div className="landing">

      {/* ========== HERO ========== */}
      <section className="L-hero">
        <div className="L-hero-bg">
          <div className="bg-block bg-1" />
          <div className="bg-block bg-2" />
          <div className="bg-block bg-3" />
        </div>

        <div className="L-hero-inner">
          <div className="L-hero-mast">
            <div className="issue-line">
              <span className="vol">VOL. XXVI · ISSUE 01</span>
              <span className="sep">—</span>
              <span className="date">FISCAL YEAR 2026</span>
              <span className="sep">—</span>
              <span className="cost">OPEN CIVIC BRIEFING</span>
            </div>
            <h1 className="L-headline">
              A city<br />
              <span className="serif-it">building toward</span><br />
              2028.
            </h1>
            <div className="L-deck">
              <p>
                Naga City's Annual Investment Program for 2026 commits
                <strong> ₱2.85 billion</strong> across <strong>1,216 programs, projects, and activities</strong>
                — submitted by <strong>94 implementing offices</strong>, mapped across
                four sector lenses, and aligned to seven 2028 Finish-Line clusters that the
                administration has pledged to deliver by the end of its term.
              </p>
              <p className="byline">
                An editorial dashboard by the Office of the City Mayor · Budget and Management.
                Every figure below links to the underlying line items.
              </p>
            </div>
          </div>

          <div className="L-hero-stats">
            <BigNumber value={2.85} decimals={2} prefix="₱" suffix="B" label="Total 2026 AIP" sub="Reported, before data-quality review" />
            <BigNumber value={1216} label="Programs, projects, activities" sub="Submitted Nov 2025" />
            <BigNumber value={94} label="Implementing offices" sub="Across four sector mandates" />
          </div>
        </div>

        <div className="L-scroll-hint">
          <span>Scroll</span>
          <div className="line" />
        </div>
      </section>

      {/* ========== FEATURED: CLIMATE ========== */}
      <section className="L-feature">
        <div className="L-feature-grid">
          <div className="L-feature-image">
            <GradientImage
              palette={['#e8d18a', '#2f827a', '#1a4a3a']}
              kicker="Naga River"
              caption="Adaptation and mitigation spending, concentrated along the flood corridor."
              ratio="4/5"
            />
          </div>
          <div className="L-feature-text">
            <div className="eyebrow">The climate line item</div>
            <h2 className="L-h2">
              <span className="serif-it">Two percent</span> of the budget
              — and the <span className="underline-accent">entire case</span> for resilience.
            </h2>
            <div className="L-copy">
              <p>
                Climate-tagged spending reaches
                <strong> ₱{climateSpend.toFixed(1)}M</strong> in 2026 —
                roughly <strong>{climateSpendPct.toFixed(1)}%</strong> of a ₱2.85 billion budget.
                Modest on paper; consequential in practice.
              </p>
              <p>
                The two categories tell different stories. <em>Adaptation</em> —
                drainage, evacuation, early warning — absorbs most of the envelope.
                <em> Mitigation</em> — solar streetlights, waste-to-energy pilots, active-transport
                corridors — is smaller, and grows slowly. Both are underwritten almost entirely
                by the General Fund, which means council politics, not donor cycles, decide the pace.
              </p>
              <p>
                For a city that sits between two river systems and under a typhoon corridor,
                this line is less an expense than an insurance premium on the rest of the budget.
              </p>
            </div>
            <button className="L-cta" onClick={() => setPageId('cluster:Envi, Infra and Housing')}>
              See every climate-tagged line →
            </button>
          </div>
        </div>

        <div className="L-feature-stats">
          <BigNumber value={climateSpend} compact prefix="₱" suffix="M" label="Climate-tagged spend" sub="Adaptation + mitigation combined" />
          <BigNumber value={climateSpendPct} decimals={1} suffix="%" label="of total 2026 AIP" sub="Ex-outliers denominator" />
          <BigNumber value={rollupClean.co} compact prefix="₱" suffix="M" label="Capital outlay" sub="The hard infrastructure spine" />
        </div>
      </section>

      {/* ========== 7 CLUSTER SPOTLIGHTS ========== */}
      <section className="L-clusters">
        <div className="L-section-head">
          <div className="eyebrow">Eight promises · 2028 Finish-Line</div>
          <h2 className="L-h2">
            Where the money is <span className="serif-it">supposed</span> to land.
          </h2>
          <p className="L-lede">
            The Finish-Line framework organizes the 2028 administration commitments into eight clusters.
            Each spread below pulls its own 2026 envelope, its own PAP count, and the offices advancing it.
          </p>
        </div>

        <div className="L-cluster-spreads">
          {FINISH_LINES.map((fl, i) => {
            const c = CLUSTER_CONTENT[fl];
            const r = clusterRollups.find(x => x.fl === fl);
            const reversed = i % 2 === 1;
            return (
              <ClusterSpread key={fl}
                fl={fl} content={c} rollup={r} reversed={reversed}
                color={FINISH_LINE_COLORS[fl]}
                index={i}
                onClick={() => setPageId('cluster:' + fl)} />
            );
          })}
        </div>
      </section>

      {/* ========== DIG IN CTA ========== */}
      <section className="L-digin">
        <div className="L-digin-inner">
          <div className="eyebrow">The long view</div>
          <h2 className="L-h2">
            <span className="serif-it">Every</span> peso.
            <span className="serif-it"> Every</span> office.
            <span className="serif-it"> Every</span> line.
          </h2>
          <p>
            The landing page is editorial. The <strong>Data</strong> tab is operational —
            a full filterable registry of every PAP, with exports, climate flags, funding sources,
            and the 22 rows where the source spreadsheet reported outlier values we still need to reconcile.
          </p>
          <div className="L-digin-cta">
            <button className="btn primary large" onClick={() => setPageId('overview')}>
              Open the full dashboard →
            </button>
            <button className="btn large" onClick={() => setPageId('cluster:Inclusive and Thriving Economy')}>
              Browse by cluster
            </button>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="L-footer">
        <div className="L-footer-col">
          <div className="k">Published</div>
          <div className="v">Naga City Office of the Mayor · Nov 2025</div>
        </div>
        <div className="L-footer-col">
          <div className="k">Data source</div>
          <div className="v">AIP FY2026 submission · 1,216 rows × 23 columns</div>
        </div>
        <div className="L-footer-col">
          <div className="k">Notes</div>
          <div className="v">22 OSCA rows flagged · 299 PAPs unspecified funding</div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- cluster spread ---------- */

function ClusterSpread({ fl, content, rollup: r, reversed, color, index, onClick }) {
  const [ref, visible] = useReveal(0.12);
  return (
    <article ref={ref}
             className={`L-spread ${reversed ? 'rev' : ''} ${visible ? 'in' : ''}`}
             onClick={onClick}
             role="button">
      <div className="L-spread-num" style={{color}}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="L-spread-image">
        <GradientImage
          palette={content.palette}
          kicker={content.kicker}
          caption={content.location}
          ratio="4/5"
        />
      </div>
      <div className="L-spread-text">
        <div className="eyebrow" style={{color}}>Cluster {index + 1} of 8</div>
        <h3 className="L-spread-title">{fl}</h3>
        <div className="L-spread-rail">
          <div className="rail-item">
            <div className="k">2026 envelope</div>
            <div className="v">{fmtPeso(r.total)}</div>
          </div>
          <div className="rail-item">
            <div className="k">PAPs</div>
            <div className="v">{fmtInt(r.pap_count)}</div>
          </div>
          <div className="rail-item">
            <div className="k">Climate-tagged</div>
            <div className="v">{fmtCompact((r.cc_adapt || 0) + (r.cc_mitig || 0))}</div>
          </div>
        </div>
        <p className="L-spread-body">{content.blurb}</p>
        <span className="L-spread-link" style={{color}}>
          Read the cluster page →
        </span>
      </div>
    </article>
  );
}

window.Landing = Landing;
