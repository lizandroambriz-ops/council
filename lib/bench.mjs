export const PERMANENT_SEATS = [
  { key: 'adversary', name: 'The Adversary', role: 'permanent', format: 'adversary' },
  { key: 'pre-mortem', name: 'The Pre-Mortem', role: 'permanent', format: 'pre-mortem' },
  { key: 'resource-realist', name: 'The Resource Realist', role: 'permanent', format: 'resource-realist' },
];

export const DYNAMIC_FORMATS = new Set(['quantitative', 'qualitative', 'comparative']);

export function seatKey(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildBench(dynamicSeats = []) {
  const dynamic = dynamicSeats.map((s) => {
    if (!DYNAMIC_FORMATS.has(s.format)) {
      throw new Error(`invalid dynamic seat format: ${s.format}`);
    }
    return {
      key: seatKey(s.name),
      name: s.name,
      role: 'dynamic',
      background: s.background,
      lens: s.lens,
      format: s.format,
    };
  });
  return { permanent: PERMANENT_SEATS, dynamic };
}
