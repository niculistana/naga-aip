/* ============================================================
   filters.jsx — Filter state, filtering, breadcrumb
   ============================================================ */

const initialFilters = {
  sectors: new Set(),
  units: new Set(),
  fundingSources: new Set(),
  subcategories: new Set(),
  finishLines: new Set(),
  climateOnly: false,
  hideFlagged: true,
  search: '',
  unitQuery: '',
};

function applyFilters(items, f) {
  return items.filter(it => {
    if (f.sectors.size && !f.sectors.has(it.sector)) return false;
    if (f.units.size && !f.units.has(it.unit)) return false;
    if (f.fundingSources.size && !f.fundingSources.has(it.funding_norm)) return false;
    if (f.subcategories.size && !f.subcategories.has(it.subcategory)) return false;
    if (f.finishLines.size) {
      if (!it.finish_line_norm) return false;
      if (!f.finishLines.has(it.finish_line_norm)) return false;
    }
    if (f.climateOnly) {
      const hasClimate = (it.amounts.cc_adapt || 0) + (it.amounts.cc_mitig || 0) > 0;
      if (!hasClimate) return false;
    }
    if (f.hideFlagged && isOutlier(it)) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!(it.description || '').toLowerCase().includes(q) &&
          !(it.aip_code || '').toLowerCase().includes(q) &&
          !(it.office || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function hasAnyFilter(f) {
  return f.sectors.size || f.units.size || f.fundingSources.size ||
         f.subcategories.size || f.finishLines.size ||
         f.climateOnly || f.search;
}

function FilterRail({ items, filters, setFilters, allUnits }) {
  const { useState, useMemo } = React;
  const update = (fn) => setFilters(prev => {
    const next = { ...prev,
      sectors: new Set(prev.sectors),
      units: new Set(prev.units),
      fundingSources: new Set(prev.fundingSources),
      subcategories: new Set(prev.subcategories),
      finishLines: new Set(prev.finishLines),
    };
    fn(next);
    return next;
  });

  const toggle = (setKey, val) => update(n => {
    if (n[setKey].has(val)) n[setKey].delete(val); else n[setKey].add(val);
  });

  const sectors = useMemo(() => {
    const g = groupBy(items, x => x.sector);
    return [...g.entries()].map(([k, v]) => [k, v.length]).sort((a,b) => b[1]-a[1]);
  }, [items]);

  const fundingSources = useMemo(() => {
    const g = groupBy(items, x => x.funding_norm);
    return [...g.entries()].map(([k, v]) => [k, v.length]).sort((a,b) => b[1]-a[1]);
  }, [items]);

  const subs = useMemo(() => {
    const g = groupBy(items, x => x.subcategory);
    return [...g.entries()].map(([k, v]) => [k, v.length]).sort((a,b) => b[1]-a[1]);
  }, [items]);

  const fls = FINISH_LINES;

  // Filter units via typeahead
  const filteredUnits = useMemo(() => {
    const q = filters.unitQuery.toLowerCase().trim();
    if (!q) return [];
    return allUnits.filter(u => u.toLowerCase().includes(q)).slice(0, 8);
  }, [allUnits, filters.unitQuery]);

  return (
    <div className="filter-rail" role="region" aria-label="Filters">
      <div className="group span-4">
        <div className="glabel">Sector</div>
        <div className="chip-row">
          {sectors.map(([s, count]) => (
            <button key={s} className={`chip ${filters.sectors.has(s) ? 'active' : ''}`}
                    onClick={() => toggle('sectors', s)}>
              {shortSector(s)}<span className="count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="group span-4">
        <div className="glabel">Funding Source</div>
        <div className="chip-row">
          {fundingSources.map(([f, count]) => (
            <button key={f} className={`chip ${filters.fundingSources.has(f) ? 'active' : ''}`}
                    onClick={() => toggle('fundingSources', f)}>
              {f}<span className="count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="group span-4">
        <div className="glabel">Subcategory</div>
        <div className="chip-row">
          {subs.map(([s, count]) => (
            <button key={s} className={`chip ${filters.subcategories.has(s) ? 'active' : ''}`}
                    onClick={() => toggle('subcategories', s)}>
              {s}<span className="count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="group span-6">
        <div className="glabel">2028 Finish-Line Cluster</div>
        <div className="chip-row">
          {fls.map(fl => (
            <button key={fl} className={`chip ${filters.finishLines.has(fl) ? 'active' : ''}`}
                    onClick={() => toggle('finishLines', fl)}
                    style={filters.finishLines.has(fl) ? { background: FINISH_LINE_COLORS[fl], borderColor: FINISH_LINE_COLORS[fl] } : {}}>
              {shortFL(fl)}
            </button>
          ))}
        </div>
      </div>

      <div className="group span-3">
        <div className="glabel">Office / Unit</div>
        <input className="type-input" type="text"
               placeholder="Type to search 94 offices…"
               value={filters.unitQuery}
               onChange={(e) => update(n => { n.unitQuery = e.target.value; })} />
        {filteredUnits.length > 0 && (
          <div className="chip-row" style={{marginTop: 4}}>
            {filteredUnits.map(u => (
              <button key={u} className={`chip ${filters.units.has(u) ? 'active' : ''}`}
                      onClick={() => toggle('units', u)}>
                {u}
              </button>
            ))}
          </div>
        )}
        {filters.units.size > 0 && filters.unitQuery === '' && (
          <div className="chip-row" style={{marginTop: 4}}>
            {[...filters.units].map(u => (
              <button key={u} className="chip active" onClick={() => toggle('units', u)}>
                {u}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="group span-3">
        <div className="glabel">Toggles</div>
        <div className="chip-row">
          <button className={`chip toggle ${filters.climateOnly ? 'active' : ''}`}
                  onClick={() => update(n => { n.climateOnly = !n.climateOnly; })}>
            Climate-tagged only
          </button>
          <button className={`chip toggle ${filters.hideFlagged ? 'active' : ''}`}
                  onClick={() => update(n => { n.hideFlagged = !n.hideFlagged; })}>
            Hide 22 flagged rows
          </button>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb({ filters, setFilters, filteredCount, totalCount }) {
  const crumbs = [];
  const update = (fn) => setFilters(prev => {
    const next = { ...prev,
      sectors: new Set(prev.sectors),
      units: new Set(prev.units),
      fundingSources: new Set(prev.fundingSources),
      subcategories: new Set(prev.subcategories),
      finishLines: new Set(prev.finishLines),
    };
    fn(next);
    return next;
  });

  filters.sectors.forEach(s => crumbs.push({ label: `Sector: ${shortSector(s)}`, remove: () => update(n => n.sectors.delete(s)) }));
  filters.units.forEach(u => crumbs.push({ label: `Office: ${u}`, remove: () => update(n => n.units.delete(u)) }));
  filters.fundingSources.forEach(f => crumbs.push({ label: `Funding: ${f}`, remove: () => update(n => n.fundingSources.delete(f)) }));
  filters.subcategories.forEach(s => crumbs.push({ label: `${s}`, remove: () => update(n => n.subcategories.delete(s)) }));
  filters.finishLines.forEach(fl => crumbs.push({ label: `Cluster: ${shortFL(fl)}`, remove: () => update(n => n.finishLines.delete(fl)) }));
  if (filters.climateOnly) crumbs.push({ label: 'Climate-tagged only', remove: () => update(n => { n.climateOnly = false; }) });
  if (filters.hideFlagged === false) crumbs.push({ label: 'Flagged rows shown', remove: () => update(n => { n.hideFlagged = true; }) });
  if (filters.search) crumbs.push({ label: `"${filters.search}"`, remove: () => update(n => { n.search = ''; }) });

  const clearAll = () => setFilters({ ...initialFilters,
    sectors: new Set(), units: new Set(), fundingSources: new Set(),
    subcategories: new Set(), finishLines: new Set() });

  return (
    <div className="breadcrumb" aria-live="polite">
      <span style={{fontFamily:'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ink-3)', marginRight: 4}}>
        {fmtInt(filteredCount)} / {fmtInt(totalCount)} PAPs
      </span>
      {crumbs.length === 0 ? (
        <span className="none">no filters · viewing all {fmtInt(totalCount)} PAPs</span>
      ) : (
        <>
          {crumbs.map((c, i) => (
            <span key={i} className="crumb">
              {c.label}
              <span className="x" onClick={c.remove} role="button" aria-label={`Remove ${c.label}`}>×</span>
            </span>
          ))}
          <span className="clear" onClick={clearAll} role="button">clear all</span>
        </>
      )}
    </div>
  );
}

Object.assign(window, { initialFilters, applyFilters, hasAnyFilter, FilterRail, Breadcrumb });
