const pad = (n) => String(n).padStart(2, '0');

export function sessionId(date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`
  );
}

export function buildMeta({ idea, model, effort, createdAt, stakes }) {
  return { idea, model, effort, createdAt, stakes, abandoned: false };
}

export function markAbandoned(meta) {
  return { ...meta, abandoned: true };
}
