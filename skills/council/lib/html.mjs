function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- tiny markdown -> HTML (headings, bold, lists, tables, hr, paragraphs)
function md(src) {
  if (!src) return '';
  const e = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s) =>
    e(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  const lines = String(src).replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  const isRow = (l) => /^\s*\|.*\|\s*$/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { i++; continue; }
    if (/^\s*---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (isRow(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && isRow(lines[i + 1])) {
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && isRow(lines[i])) { rows.push(cells(lines[i])); i++; }
      let t = '<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      rows.forEach((r) => { t += '<tr>' + head.map((_, idx) => `<td>${inline(r[idx] || '')}</td>`).join('') + '</tr>'; });
      out.push(t + '</tbody></table>');
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`); i++; }
      out.push(`<ul>${items.join('')}</ul>`); continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`); i++; }
      out.push(`<ol>${items.join('')}</ol>`); continue;
    }
    const para = [line]; i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4})\s/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*---+\s*$/.test(lines[i]) && !isRow(lines[i])) { para.push(lines[i]); i++; }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

const DIMS = [
  ['feasibility', 'Feasibility'],
  ['differentiation', 'Differentiation'],
  ['upside', 'Upside'],
];

const STANCE_LABEL = { proceed: 'Proceed', reshape: 'Reshape', against: 'Push back' };

// Derive a stance from the seat's own scores if none is supplied.
// Set seat.stance = 'proceed' | 'reshape' | 'against' in your data to override.
function stanceOf(seat) {
  if (seat.stance) return seat.stance;
  const vals = DIMS.map(([k]) => Number(seat.scores?.[k] ?? 0));
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (mean >= 3.5) return 'proceed';
  if (mean >= 2.8) return 'reshape';
  return 'against';
}

const scoreColor = (v) => (v >= 4 ? 'var(--high)' : v >= 3 ? 'var(--med)' : 'var(--low)');

function dots(v) {
  let s = '<div class="dots">';
  for (let k = 1; k <= 5; k++) s += `<i style="background:${k <= v ? scoreColor(v) : 'var(--rule)'}"></i>`;
  return s + '</div>';
}

function miniScores(scores) {
  return '<div class="mini">' + DIMS.map(([k, label]) =>
    `<div class="m"><div class="ml"><span>${label.slice(0, 4)}</span><b>${esc(scores[k])}</b></div>${dots(Number(scores[k]))}</div>`
  ).join('') + '</div>';
}

const STYLE = `
  :root{
    --paper:#f4efe4;--paper-2:#efe8d9;--card:#fbf8f0;
    --ink:#1b1712;--ink-2:#473f34;--ink-3:#7a7064;
    --rule:#d8cfbb;--rule-2:#c5b9a0;
    --accent:#7a2418;--accent-soft:#a8503f;
    --low:oklch(0.56 0.15 27);--med:oklch(0.66 0.12 72);--high:oklch(0.55 0.10 150);
    --serif:"Spectral",Georgia,serif;--sans:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace;
  }
  *{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.5;
    background-image:radial-gradient(var(--rule) 0.5px,transparent 0.5px);background-size:22px 22px;background-position:-11px -11px;}
  .wrap{max-width:1180px;margin:0 auto;padding:46px 40px 100px}
  .sheet{background:var(--paper);border:1px solid var(--rule-2);box-shadow:0 1px 0 #fff inset,0 30px 60px -40px rgba(40,28,16,.5);padding:54px 60px 64px}
  a{color:inherit}
  .kicker{font-family:var(--mono);font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);font-weight:600}
  .masthead{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;border-bottom:3px double var(--ink);padding-bottom:26px}
  .masthead .left{flex:1}
  h1.title{font-family:var(--serif);font-weight:700;font-size:50px;line-height:1.05;margin:14px 0 16px;letter-spacing:-.01em;max-width:20ch}
  .standfirst{font-family:var(--serif);font-size:21px;line-height:1.45;color:var(--ink-2);font-style:italic;max-width:62ch;margin:0}
  .stamp{flex:0 0 auto;width:150px;text-align:center;border:2px solid var(--med);color:var(--med);padding:14px 8px 12px;transform:rotate(3.5deg);border-radius:8px;box-shadow:0 0 0 1px var(--paper) inset}
  .stamp.low{border-color:var(--low);color:var(--low)} .stamp.medium{border-color:var(--med);color:var(--med)} .stamp.high{border-color:var(--high);color:var(--high)}
  .stamp .lab{font-family:var(--mono);font-size:10px;letter-spacing:.25em;text-transform:uppercase}
  .stamp .val{font-family:var(--serif);font-weight:700;font-size:30px;line-height:1;margin-top:4px}
  .stamp .sub{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;color:var(--ink-3);margin-top:7px}
  .byline{display:flex;flex-wrap:wrap;gap:22px;font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;color:var(--ink-3);text-transform:uppercase;padding:14px 0 0}
  .byline b{color:var(--ink);font-weight:600}
  .verdict-line{font-family:var(--serif);font-size:27px;line-height:1.32;font-weight:500;margin:34px 0 6px;max-width:48ch}
  .verdict-line .drop{float:left;font-weight:800;font-size:76px;line-height:.72;padding:8px 10px 0 0;color:var(--accent);font-family:var(--serif)}
  .sec-head{display:flex;align-items:baseline;gap:14px;margin:54px 0 22px}
  .sec-head h2{font-family:var(--mono);font-size:13px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;margin:0;color:var(--accent);white-space:nowrap}
  .sec-head .ln{flex:1;height:1px;background:var(--rule-2)}
  .sec-head .n{font-family:var(--mono);font-size:11px;color:var(--ink-3)}
  .agg{display:grid;grid-template-columns:repeat(3,1fr);gap:30px}
  .agg .dim{border-top:2px solid var(--ink);padding-top:14px}
  .agg .dlab{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);display:flex;justify-content:space-between}
  .agg .dnum{font-family:var(--serif);font-weight:700;font-size:46px;line-height:1;margin:8px 0 12px}
  .agg .dnum small{font-size:18px;color:var(--ink-3);font-weight:400}
  .track{height:7px;background:var(--paper-2);border:1px solid var(--rule);border-radius:6px;overflow:hidden}
  .track>span{display:block;height:100%}
  .agg .var{font-family:var(--mono);font-size:10.5px;color:var(--ink-3);margin-top:8px;letter-spacing:.04em}
  .seats{display:grid;grid-template-columns:1fr 1fr;gap:30px 40px}
  .seat{border-top:2px solid var(--ink);padding-top:16px;position:relative}
  .seat .col-rule{position:absolute;left:-20px;top:18px;bottom:0;width:1px;background:var(--rule)}
  .seat-name{font-family:var(--serif);font-weight:700;font-size:25px;line-height:1.08;margin:0;letter-spacing:-.01em}
  .seat-meta{display:flex;align-items:center;gap:10px;margin:9px 0 14px;font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)}
  .pill{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:20px;font-weight:600}
  .pill::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}
  .pill.proceed{color:var(--high);background:color-mix(in oklch,var(--high) 12%,transparent)}
  .pill.reshape{color:var(--med);background:color-mix(in oklch,var(--med) 14%,transparent)}
  .pill.against{color:var(--low);background:color-mix(in oklch,var(--low) 12%,transparent)}
  .seat-summary{font-family:var(--serif);font-size:16.5px;line-height:1.5;color:var(--ink);margin:0 0 16px}
  .mini{display:flex;gap:18px;margin:0 0 14px}
  .mini .m{flex:1}
  .mini .ml{font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);display:flex;justify-content:space-between;margin-bottom:5px}
  .mini .ml b{color:var(--ink);font-weight:600}
  .dots{display:flex;gap:3px}
  .dots i{width:100%;height:5px;border-radius:2px;background:var(--rule)}
  details.fold{border-top:1px solid var(--rule);margin-top:4px}
  details.fold>summary{list-style:none;cursor:pointer;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);padding:11px 0 2px;display:flex;align-items:center;gap:8px;user-select:none}
  details.fold>summary::-webkit-details-marker{display:none}
  details.fold>summary .chev{transition:transform .2s;font-size:10px}
  details.fold[open]>summary .chev{transform:rotate(90deg)}
  .reading{font-family:var(--serif);font-size:15px;line-height:1.62;color:var(--ink-2);padding:6px 2px 10px}
  .reading h1{font-size:18px;color:var(--ink);font-family:var(--sans);font-weight:700;letter-spacing:-.01em;margin:18px 0 8px}
  .reading h2{font-size:14px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.1em;color:var(--accent);margin:18px 0 6px}
  .reading h3{font-size:15px;color:var(--ink);font-family:var(--sans);font-weight:600;margin:14px 0 4px}
  .reading h4{font-size:14px;color:var(--ink);font-family:var(--sans);font-weight:600;margin:12px 0 4px}
  .reading p{margin:0 0 10px}
  .reading ul,.reading ol{margin:0 0 10px;padding-left:20px}
  .reading li{margin-bottom:5px}
  .reading strong{color:var(--ink)}
  .reading table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:12.5px;margin:6px 0 12px}
  .reading th,.reading td{border:1px solid var(--rule-2);padding:7px 9px;text-align:left;vertical-align:top;line-height:1.4}
  .reading th{background:var(--paper-2);font-weight:600;color:var(--ink)}
  .reading hr{border:0;border-top:1px solid var(--rule);margin:14px 0}
  .reading code{font-family:var(--mono);font-size:.92em;background:var(--paper-2);padding:1px 5px;border-radius:4px}
  .rebuttal{background:var(--paper-2);border-left:3px solid var(--accent-soft);padding:12px 16px;margin-top:10px}
  .rebuttal .rl{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
  .rebuttal p{font-family:var(--serif);font-size:14px;line-height:1.55;color:var(--ink-2);margin:0 0 9px}
  .rebuttal p:last-child{margin:0}
  .cond{counter-reset:c}
  .cond .row{counter-increment:c;display:grid;grid-template-columns:54px 1fr;gap:18px;padding:18px 0;border-bottom:1px solid var(--rule);align-items:start}
  .cond .row:first-child{border-top:1px solid var(--rule)}
  .cond .row::before{content:counter(c,decimal-leading-zero);font-family:var(--serif);font-weight:700;font-size:30px;color:var(--accent);line-height:1}
  .cond .row p{margin:0;font-size:16px;font-family:var(--serif);line-height:1.5}
  .actions{display:grid;grid-template-columns:repeat(3,1fr);gap:34px}
  .actions h3{font-family:var(--mono);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid var(--ink)}
  .actions ul{margin:0;padding:0;list-style:none}
  .actions li{font-family:var(--serif);font-size:14.5px;line-height:1.5;padding:11px 0 11px 22px;border-bottom:1px solid var(--rule);position:relative;color:var(--ink-2)}
  .actions li:last-child{border-bottom:0}
  .actions li::before{content:"";position:absolute;left:2px;top:18px;width:7px;height:7px;border:1.5px solid var(--accent);border-radius:50%}
  .synth .reading{font-size:15.5px}
  .resolved{background:var(--paper-2);border:1px solid var(--rule-2);padding:20px 24px;margin-top:14px}
  .resolved .q{font-family:var(--serif);font-weight:700;font-size:16px;margin:0 0 8px}
  .resolved .a{font-family:var(--serif);font-size:14px;line-height:1.55;color:var(--ink-2);margin:0}
  .endmark{text-align:center;font-family:var(--mono);font-size:11px;letter-spacing:.3em;color:var(--ink-3);margin-top:60px;text-transform:uppercase}
  .endmark::before,.endmark::after{content:"§";color:var(--accent);margin:0 14px}
  /* compare mode */
  .winner{font-family:var(--serif);font-weight:700;font-size:30px;color:var(--accent);margin:18px 0 0}
  .cmp{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:8px}
  .opt{border-top:2px solid var(--ink);padding-top:16px}
  .opt h3{font-family:var(--serif);font-weight:700;font-size:22px;margin:0 0 8px}
  .opt p.lead{font-family:var(--serif);font-size:16px;line-height:1.5;color:var(--ink-2);margin:0 0 12px}
  .opt ul{margin:0;padding-left:20px}
  .opt li{font-family:var(--serif);font-size:14.5px;line-height:1.5;color:var(--ink-2);margin-bottom:6px}
  .cmp-seat{border-top:1px solid var(--rule);padding-top:14px;margin-top:18px}
  .cmp-seat h4{font-family:var(--serif);font-weight:700;font-size:19px;margin:0 0 10px}
  .cmp-seat .pref{font-family:var(--serif);font-size:14.5px;color:var(--ink);margin:10px 0 0}
  @media (max-width:860px){
    .wrap{padding:18px}.sheet{padding:30px 22px}
    h1.title{font-size:36px}.agg,.seats,.actions,.cmp{grid-template-columns:1fr}
    .masthead{flex-direction:column}.stamp{transform:none}
  }
`;

const HEAD = (title) => `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>${STYLE}</style>
</head>`;

function page(title, inner) {
  return `<!DOCTYPE html>
<html lang="en">
${HEAD(title)}
<body>
<div class="wrap">
  <article class="sheet">
${inner}
  </article>
  <div class="endmark">End of deliberation</div>
</div>
</body>
</html>`;
}

function secHead(label, note) {
  return `<div class="sec-head"><h2>${esc(label)}</h2><span class="ln"></span>${note ? `<span class="n">${esc(note)}</span>` : ''}</div>`;
}

function masthead(session) {
  const card = session.card;
  const conf = String(card.confidence || '');
  const confClass = conf.toLowerCase();
  const agg = DIMS.map(([k, l]) => `<span>${l.slice(0, 4)} · <b>${Number(card.scores[k].mean).toFixed(1)}</b></span>`).join('');
  const head = session.headline
    ? `<p class="verdict-line"><span class="drop">${esc(session.headline.charAt(0))}</span>${esc(session.headline.slice(1))}</p>`
    : '';
  return `<div class="masthead">
    <div class="left">
      <div class="kicker">The Council · Deliberation Record</div>
      <h1 class="title">${esc(session.idea)}</h1>
      ${session.brief ? `<p class="standfirst">${esc(session.brief)}</p>` : ''}
    </div>
    <div class="stamp ${confClass}">
      <div class="lab">Confidence</div>
      <div class="val">${esc(conf)}</div>
      <div class="sub">${session.seats.length} seats convened</div>
    </div>
  </div>
  <div class="byline">
    ${session.date ? `<span>Session · <b>${esc(session.date)}</b></span>` : ''}
    <span>Panel · <b>${session.seats.length} seats</b></span>
    ${agg}
  </div>
  ${head}`;
}

function aggregate(card) {
  return `${secHead('The Tally', 'aggregate of all seats')}
  <div class="agg">
    ${DIMS.map(([k, label]) => {
      const v = Number(card.scores[k].mean);
      const hv = card.scores[k].highVariance;
      return `<div class="dim">
        <div class="dlab"><span>${label}</span><span>${hv ? 'high variance' : 'aligned'}</span></div>
        <div class="dnum">${v.toFixed(1)}<small>/5</small></div>
        <div class="track"><span style="width:${(v / 5) * 100}%;background:${scoreColor(v)}"></span></div>
        <div class="var">${hv ? 'wide spread — seats split' : 'within tolerance'}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function seatCard(seat) {
  const stance = stanceOf(seat);
  return `<section class="seat">
    <span class="col-rule"></span>
    <h3 class="seat-name">${esc(seat.name)}</h3>
    <div class="seat-meta">
      <span class="pill ${stance}">${STANCE_LABEL[stance]}</span>
      <span>${esc(seat.format)}</span>
    </div>
    <p class="seat-summary">${esc(seat.summary)}</p>
    ${miniScores(seat.scores)}
    <details class="fold">
      <summary><span class="chev">▶</span> Read the full opinion</summary>
      <div class="reading">${md(seat.reasoning)}
        ${seat.rebuttal ? `<div class="rebuttal"><div class="rl">Cross-examination · rebuttal</div>${md(seat.rebuttal)}</div>` : ''}
      </div>
    </details>
  </section>`;
}

function conditions(list) {
  if (!list || !list.length) return '';
  return `${secHead('Blocking Conditions', 'all must hold to ship')}
  <div class="cond">${list.map((c) => `<div class="row"><p>${esc(c)}</p></div>`).join('')}</div>`;
}

function actions(na) {
  if (!na) return '';
  const cols = [['Today', na.today], ['This week', na.thisWeek], ['This month', na.thisMonth]];
  return `${secHead('Next Actions', 'the docket')}
  <div class="actions">
    ${cols.map(([k, items]) => `<div><h3>${k}</h3><ul>${(items || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}
  </div>`;
}

function synthesis(verdict) {
  if (!verdict) return '';
  return `${secHead('Chair Synthesis', 'the resolution')}
  <div class="synth"><div class="reading">${md(verdict)}</div></div>`;
}

function resolvedSection(resolved) {
  if (!resolved || !resolved.length) return '';
  return `${secHead('Pre-resolved')}
  ${resolved.map((r) => `<div class="resolved"><p class="q">${esc(r.question)}</p><p class="a">${esc(r.answer)}</p></div>`).join('')}`;
}

// ---- compare mode (Dossier-styled) ----
function comparisonSeatCard(seat) {
  const findings = (items) => `<ul>${(items ?? []).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`;
  const pref = seat.prefers ? `<p class="pref"><strong>Prefers ${esc(seat.prefers)}:</strong> ${esc(seat.reason ?? '')}</p>` : '';
  return `<div class="cmp-seat">
    <h4>${esc(seat.name)} <small style="font-family:var(--mono);font-size:11px;color:var(--ink-3)">(${esc(seat.format)})</small></h4>
    <div class="cmp">
      <div class="opt" style="border-top:0;padding-top:0"><strong>Option A</strong>${findings(seat.findingsA)}</div>
      <div class="opt" style="border-top:0;padding-top:0"><strong>Option B</strong>${findings(seat.findingsB)}</div>
    </div>
    ${pref}
  </div>`;
}

function comparisonDoc(session) {
  const v = session.comparison;
  const winnerLabel = v.tie ? 'Tie — no clear winner' : `Winner · Option ${v.winner} (${v.tally.a}–${v.tally.b})`;
  const caseList = (cases) => `<ul>${(cases ?? []).map((c) => `<li><strong>${esc(c.seat)}:</strong> ${esc(c.reason)}</li>`).join('')}</ul>`;
  const inner = `<div class="masthead">
    <div class="left">
      <div class="kicker">The Council · Ideas Head-to-Head</div>
      <h1 class="title">Two ideas, weighed</h1>
      <p class="winner">${esc(winnerLabel)}</p>
    </div>
  </div>
  ${secHead('The Options')}
  <div class="cmp">
    <div class="opt"><h3>Option A</h3><p class="lead">${esc(session.optionA)}</p>${caseList(v.casesForA)}</div>
    <div class="opt"><h3>Option B</h3><p class="lead">${esc(session.optionB)}</p>${caseList(v.casesForB)}</div>
  </div>
  ${secHead('The Bench', 'how each seat split the two')}
  ${session.seats.map(comparisonSeatCard).join('')}
  ${session.verdict ? synthesis(session.verdict) : ''}`;
  return page('The Council — Ideas Head-to-Head', inner);
}

export function renderHtml(session) {
  if (session.mode === 'compare') return comparisonDoc(session);
  const inner = `${masthead(session)}
  ${aggregate(session.card)}
  ${secHead('The Bench', 'individual opinions')}
  <div class="seats">${session.seats.map(seatCard).join('')}</div>
  ${conditions(session.card.blockingConditions)}
  ${actions(session.card.nextActions)}
  ${synthesis(session.verdict)}
  ${resolvedSection(session.resolvedUnknowns)}`;
  return page(`The Council — ${session.idea}`, inner);
}
