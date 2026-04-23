/* ============================================================
   utils.jsx — Data loading, formatting, color helpers
   ============================================================ */

// Peso formatter: input in millions
function fmtPeso(val, opts = {}) {
  if (val == null || isNaN(val)) return '—';
  const abs = Math.abs(val);
  if (abs >= 1000) {
    return '₱' + (val / 1000).toFixed(2) + 'B';
  }
  if (abs >= 1) {
    return '₱' + val.toFixed(opts.decimals ?? 1) + 'M';
  }
  if (abs >= 0.001) {
    return '₱' + (val * 1000).toFixed(0) + 'K';
  }
  return '₱' + val.toFixed(3) + 'M';
}

function fmtPct(v, total) {
  if (!total || total === 0) return '—';
  return (100 * v / total).toFixed(1) + '%';
}

function fmtInt(v) {
  if (v == null || isNaN(v)) return '—';
  return Math.round(v).toLocaleString();
}

function fmtCompact(v) {
  if (v == null || isNaN(v)) return '—';
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'B';
  if (Math.abs(v) >= 1) return v.toFixed(1) + 'M';
  return (v * 1000).toFixed(0) + 'K';
}

// Normalize canonical funding source
function normalizeFunding(f) {
  if (!f) return 'Unspecified';
  const u = f.trim().toUpperCase();
  if (u.includes('DONATION') || u.includes('GRANT')) return 'Donations/Grants';
  if (u.startsWith('GAD')) return 'GAD';
  if (u === 'GF') return 'GF';
  if (u === 'SEF') return 'SEF';
  if (u === 'LDF') return 'LDF';
  if (u === 'LDRRMF') return 'LDRRMF';
  if (u === 'SPA') return 'SPA';
  if (u === 'PPP') return 'PPP';
  if (u === 'NGA') return 'NGA';
  if (u.includes('PHILHEALTH')) return 'PhilHealth Trust';
  return f;
}

// Seven canonical finish-line clusters
const FINISH_LINES = [
  'Inclusive and Thriving Economy',
  'Envi, Infra and Housing',
  'Transparent, Digital, and Accountable Governance',
  'Safe, Secure, and Humane Communities',
  'Culture, Arts, and Heritage',
  'Empowered and Educated Citizens',
  'Social Protection and Inclusion',
  'Healthy Nagueños',
];
function normalizeFinishLine(fl) {
  if (!fl) return null;
  const s = fl.trim();
  const findMatch = (s) => {
    const canon = [
      ['Inclusive', 'Inclusive and Thriving Economy'],
      ['Envi', 'Envi, Infra and Housing'],
      ['Transparent', 'Transparent, Digital, and Accountable Governance'],
      ['Safe, Secure', 'Safe, Secure, and Humane Communities'],
      ['Culture', 'Culture, Arts, and Heritage'],
      ['Educated', 'Empowered and Educated Citizens'],
      ['Empowered', 'Empowered and Educated Citizens'],
      ['Social Protection', 'Social Protection and Inclusion'],
      ['Healthy', 'Healthy Nagueños'],
    ];
    const m = canon.find(([pat]) => s.toLowerCase().includes(pat.toLowerCase()));
    return m ? m[1] : null;
  };
  // pick FIRST match from multi-value strings
  return findMatch(s) || s;
}

// Funding color map
const FUNDING_COLORS = {
  'GF': 'var(--f-gf)',
  'SEF': 'var(--f-sef)',
  'LDF': 'var(--f-ldf)',
  'LDRRMF': 'var(--f-ldrrmf)',
  'SPA': 'var(--f-spa)',
  'PPP': 'var(--f-ppp)',
  'NGA': 'var(--f-nga)',
  'Donations/Grants': 'var(--f-donations)',
  'GAD': 'var(--f-gad)',
  'PhilHealth Trust': 'var(--f-other)',
  'Unspecified': 'var(--f-unspec)',
};

const FINISH_LINE_COLORS = {
  'Inclusive and Thriving Economy': '#c47a2a',
  'Envi, Infra and Housing': '#2f827a',
  'Transparent, Digital, and Accountable Governance': '#2f3e7a',
  'Safe, Secure, and Humane Communities': '#a23b3b',
  'Culture, Arts, and Heritage': '#b0568a',
  'Empowered and Educated Citizens': '#6b5a9a',
  'Social Protection and Inclusion': '#7a6f3b',
  'Healthy Nagueños': '#3d6b3b',
  'Unclassified': '#bfb6a4',
};

// Short label for a finish line (for compact display)
function shortFL(fl) {
  if (!fl) return '—';
  const map = {
    'Inclusive and Thriving Economy': 'Economy',
    'Envi, Infra and Housing': 'Environment',
    'Transparent, Digital, and Accountable Governance': 'Governance',
    'Safe, Secure, and Humane Communities': 'Safety',
    'Culture, Arts, and Heritage': 'Culture',
    'Empowered and Educated Citizens': 'Education',
    'Social Protection and Inclusion': 'Social',
    'Healthy Nagueños': 'Health',
  };
  return map[fl] || fl;
}

// Short sector label
function shortSector(s) {
  if (!s) return '';
  if (s === 'Environment/Infrastructure/Housing') return 'Environment';
  if (s === 'General Public Services') return 'Public Services';
  return s;
}

// Flatten nested JSON into a list of items
function flattenData(json) {
  const items = [];
  for (const sector of json.sectors) {
    for (const unit of sector.units) {
      for (const sub of unit.subcategories) {
        for (const prog of sub.programs) {
          for (const item of prog.items) {
            items.push({
              ...item,
              sector: sector.name,
              unit: unit.name,
              subcategory: sub.name || 'Unspecified',
              program: prog.name,
              funding_norm: normalizeFunding(item.funding_source),
              finish_line_norm: normalizeFinishLine(item.finish_line),
            });
          }
        }
      }
    }
  }
  return items;
}

function rollup(items) {
  const r = { ps: 0, mooe: 0, co: 0, total: 0, cc_adapt: 0, cc_mitig: 0, pap_count: items.length };
  for (const it of items) {
    r.ps += it.amounts.ps || 0;
    r.mooe += it.amounts.mooe || 0;
    r.co += it.amounts.co || 0;
    r.total += it.amounts.total || 0;
    r.cc_adapt += it.amounts.cc_adapt || 0;
    r.cc_mitig += it.amounts.cc_mitig || 0;
  }
  return r;
}

function groupBy(items, keyFn) {
  const m = new Map();
  for (const it of items) {
    const k = keyFn(it);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(it);
  }
  return m;
}

function isOutlier(it) {
  return (it.data_quality_flag || '').startsWith('unit_check');
}

// Expose
Object.assign(window, {
  fmtPeso, fmtPct, fmtInt, fmtCompact,
  normalizeFunding, normalizeFinishLine, shortFL, shortSector,
  FUNDING_COLORS, FINISH_LINE_COLORS, FINISH_LINES,
  flattenData, rollup, groupBy, isOutlier,
});
