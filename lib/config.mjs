import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const MODELS = { OPUS: 'opus-4-7', SONNET: 'sonnet-4-6', HAIKU: 'haiku-4-5' };
export const DEFAULT_MODEL = MODELS.SONNET;
const VALID = new Set([MODELS.OPUS, MODELS.SONNET, MODELS.HAIKU]);

// Resilient read: unknown/missing values fall back to the default.
export function parseConfig(raw) {
  let obj = {};
  if (raw) {
    try {
      obj = JSON.parse(raw);
    } catch {
      obj = {};
    }
  }
  const model = VALID.has(obj.model) ? obj.model : DEFAULT_MODEL;
  return { model };
}

// Boundary write: reject anything not a known model.
export function setModel(config, model) {
  if (!VALID.has(model)) throw new Error(`invalid model: ${model}`);
  return { ...config, model };
}

export function loadConfig(path) {
  try {
    return parseConfig(readFileSync(path, 'utf8'));
  } catch {
    return parseConfig(null);
  }
}

export function saveConfig(path, config) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(config, null, 2));
}
