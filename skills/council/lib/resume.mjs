// Ordered earliest → latest; later matches win.
const PHASES = [
  { name: 'prebrief', has: (f) => f.includes('prebrief.json') },
  { name: 'casting', has: (f) => f.includes('seats.json') },
  { name: 'research', has: (f) => f.some((n) => n.startsWith('seat__')) },
  { name: 'cross-examination', has: (f) => f.some((n) => n.startsWith('rebuttal__')) },
  { name: 'chair', has: (f) => f.includes('verdict.md') },
  { name: 'resolve', has: (f) => f.includes('resolved.json') },
  { name: 'export', has: (f) => f.includes('DONE') },
];

export function lastCompletedPhase(files) {
  let phase = null;
  for (const { name, has } of PHASES) {
    if (has(files)) phase = name;
  }
  return phase;
}

export function selectResume(sessions) {
  const resumable = sessions.filter((s) => !s.done && !s.abandoned);
  if (resumable.length === 0) return { action: 'menu' };
  if (resumable.length === 1) return { action: 'resume', session: resumable[0] };
  return { action: 'picker', sessions: resumable };
}
