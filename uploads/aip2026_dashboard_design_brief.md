# Naga City AIP 2026 Dashboard — UI Design Brief

> A brief written for the **Claude Design** skill (`design:design-critique`, `design:design-handoff`, `design:ux-copy`, `design:accessibility-review`). Drop this in front of the skill and ask it to produce mockups, critique a draft, or write developer-ready handoff specs.

## 1 · Product summary

A public-facing, single-page web dashboard that visualises Naga City's **2026 Annual Investment Program (AIP)** — ₱2.85 billion across 1,200+ programs, projects and activities (PAPs) submitted by 95 implementing offices, classified across four sectors and seven 2028 Finish-Lines clusters.

**Source data:** `aip2026_dashboard_data.csv` (flat, 1,216 rows × 23 columns) and `aip2026_dashboard_data.json` (same data nested as Sector → Unit → Subcategory → Program → Items, with roll-ups precomputed at every level).

## 2 · Audience & jobs-to-be-done

| Persona | Primary use | What they need to see in <30 seconds |
|---------|-------------|--------------------------------------|
| **City Mayor / Sangguniang Panlungsod** | Approve and defend the budget | Sector totals, sector mix, climate-tagged spend, alignment to 2028 Finish Lines |
| **City Budget Office / CPDO** | Reconcile and monitor close | PS/MOOE/CO mix per office, funding-source breakdown, data-quality flags |
| **Department heads** | See "my office's" allocation | Drill into one `unit`, line-item table, my share vs. sector |
| **Citizen / civic-tech / press** | Transparency view | Plain-language sector summary, "where does my tax peso go", finish-line themes |

## 3 · Information architecture (single page, four bands)

**Band A — Hero KPI strip** (sticky, always visible)
- Total AIP ₱ (single big number, ₱ millions)
- Split chip: PS ▸ MOOE ▸ CO
- Climate-tagged spend (Adaptation + Mitigation) as % of total
- PAP count + last-updated stamp

**Band B — Sector overview**
- Stacked horizontal bar chart: 4 sectors × (PS / MOOE / CO)
- Side panel with finish-line cluster mix (donut)
- Click on a sector → filters every panel below to that sector

**Band C — Office (unit) deep-dive**
- Treemap: `sector → unit → program`, area = `amount_total`, color = `funding_source`
- Hover reveals tooltip with PAP count, PS/MOOE/CO split, climate spend
- Click a tile → opens Band D filtered to that unit

**Band D — Line-item table**
- Sortable, paginated table of PAPs (1 row per PAP)
- Columns: Code · Description · Office · Funding · PS · MOOE · CO · Total · Climate · Finish-Line · Mainstreaming
- Inline data-quality badge (yellow chip) for rows where `data_quality_flag` is non-null
- Export-to-CSV button (filtered subset)

**Band E — Strategic overlays** (collapsible, optional)
- 2028 Finish Lines cluster bar (₱ per cluster theme)
- Mainstreaming coverage matrix (development plan × sector heatmap)
- Schedule swimlane (Gantt of `start_date` → `end_date` by unit, batched by quarter)

## 4 · Filter rail (left or top, persistent)

- Sector (multi-select chips)
- Office / unit (typeahead)
- Funding source (chips: GF, SEF, LDF, LDRRMF, SPA, PPP, NGA, Donations)
- Subcategory (GAS / STO / Operations)
- 2028 Finish Line cluster (multi-select)
- Date range (start_date)
- Climate spend toggle ("Show only climate-tagged PAPs")
- Data-quality toggle ("Hide flagged rows")

Selecting any filter cascades to all bands. A breadcrumb row shows active filters with one-tap clear.

## 5 · Visual language

- **Tone:** civic and trustworthy, not corporate or playful. Naga City brand colors as accents, neutral grayscale chrome.
- **Hierarchy:** numbers are the heroes — use one large display weight for hero KPIs, one body weight for everything else. Avoid more than three font sizes per band.
- **Color encoding (consistent across all charts):**
  - PS = blue · MOOE = teal · CO = amber (warm, because it's capital)
  - Climate Adaptation = green · Climate Mitigation = lime
  - Funding source uses a single categorical palette (max 8 hues)
- **Empty states:** every band must have a graceful "no data for current filter" state with a one-click "clear filters" CTA.
- **Density:** desktop-first, but the table band must collapse cleanly to vertical cards on mobile.

## 6 · Key interactions

- **Cross-filter:** clicking any segment of any chart filters the rest of the page, never opens a modal.
- **Drill-down:** clicking a treemap tile zooms into that node and updates the breadcrumb; back button restores.
- **Hover tooltips:** every chart shows ₱ value, % of parent, and PAP count.
- **Saved views:** allow the user to copy a URL that encodes the active filter state.

## 7 · Accessibility (WCAG 2.1 AA target)

- All chart colors must clear 3:1 contrast against background; provide a colorblind-safe alt palette toggle.
- Every chart needs a "View data as table" affordance for screen readers.
- All interactive elements reachable by keyboard, focus rings visible.
- Numbers in tables right-aligned and use tabular figures.
- Currency and units stated in headers (₱ millions) — never assume the reader knows.

## 8 · Data and integrity notes the design must reflect

- 22 PAPs (all in OSCA office) appear to have been entered in raw pesos instead of millions and are flagged. The dashboard should **show two totals** when a flagged row is in scope: "Reported" vs. "Reported excluding flagged outliers", and surface a small banner explaining why.
- 299 PAPs have no `funding_source` recorded; show these in a neutral "Unspecified" bucket, not silently dropped.
- All amounts are in **₱ millions** by design — the unit must appear in every axis label, tooltip, and column header.

## 9 · Tech & delivery constraints

- Static dashboard (no auth) is sufficient for v1 — read once from the JSON file.
- File size: JSON is ~1.7 MB; safe to ship inline. CSV (~530 KB) is the export format.
- Stack-agnostic spec: works equally for an HTML+D3 artifact, a React+Recharts SPA, or a Looker Studio embed.

## 10 · Out of scope for v1

- Multi-year comparison (only 2026 data exists in this workbook)
- Editing or workflow approvals
- Authentication and role-based views
- Live data sync — refresh is manual, file drop

## 11 · Suggested next prompts to Claude Design

- *"Critique a low-fi wireframe of Band B against this brief."* → `design:design-critique`
- *"Generate a developer handoff spec for Band C treemap and the filter rail."* → `design:design-handoff`
- *"Write empty-state and tooltip microcopy for the climate spend toggle."* → `design:ux-copy`
- *"Run a WCAG 2.1 AA review of the current color encoding."* → `design:accessibility-review`
