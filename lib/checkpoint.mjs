import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import { join } from 'node:path';
import { markAbandoned } from './session.mjs';

const DONE = 'DONE';
const SEAT_RE = /^seat__(.+)\.json$/;

export function writeArtifact(sessionDir, name, data) {
  mkdirSync(sessionDir, { recursive: true });
  const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  writeFileSync(join(sessionDir, name), body);
}

export function readArtifact(sessionDir, name) {
  const raw = readFileSync(join(sessionDir, name), 'utf8');
  return name.endsWith('.json') ? JSON.parse(raw) : raw;
}

export function presentArtifacts(sessionDir) {
  if (!existsSync(sessionDir)) return [];
  return readdirSync(sessionDir).sort();
}

export function listSeatOutputs(sessionDir) {
  return presentArtifacts(sessionDir)
    .map((f) => f.match(SEAT_RE))
    .filter(Boolean)
    .map((m) => m[1]);
}

export function writeDone(sessionDir) {
  writeArtifact(sessionDir, DONE, '');
}

export function isDone(sessionDir) {
  return existsSync(join(sessionDir, DONE));
}

export function markSessionAbandoned(sessionDir) {
  const meta = readArtifact(sessionDir, 'meta.json');
  writeArtifact(sessionDir, 'meta.json', markAbandoned(meta));
}

export function scanSessions(checkpointsRoot) {
  if (!existsSync(checkpointsRoot)) return [];
  return readdirSync(checkpointsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const sessionDir = join(checkpointsRoot, d.name);
      let meta = {};
      try {
        meta = readArtifact(sessionDir, 'meta.json');
      } catch {
        meta = {};
      }
      return {
        id: d.name,
        done: isDone(sessionDir),
        abandoned: Boolean(meta.abandoned),
        files: presentArtifacts(sessionDir),
      };
    });
}
