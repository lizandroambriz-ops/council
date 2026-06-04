import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { parseConfig, setModel, loadConfig, saveConfig, MODELS } from './config.mjs';

test('setModel returns a config carrying the chosen primary model', () => {
  const cfg = setModel(parseConfig(null), MODELS.OPUS);
  assert.equal(cfg.model, 'opus-4-7');
});

test('defaults to Sonnet when config is missing or invalid', () => {
  assert.equal(parseConfig(null).model, 'sonnet-4-6');
  assert.equal(parseConfig('not json{').model, 'sonnet-4-6');
  assert.equal(parseConfig('{"model":"gpt-9"}').model, 'sonnet-4-6');
});

test('parses a stored valid model', () => {
  assert.equal(parseConfig('{"model":"opus-4-7"}').model, 'opus-4-7');
});

test('Haiku is a valid primary model and round-trips', () => {
  assert.equal(parseConfig('{"model":"haiku-4-5"}').model, 'haiku-4-5');
  assert.equal(setModel(parseConfig(null), MODELS.HAIKU).model, 'haiku-4-5');
});

test('setModel rejects an unknown model', () => {
  assert.throws(() => setModel({ model: 'sonnet-4-6' }, 'gpt-9'), /invalid model/i);
});

test('saveConfig then loadConfig round-trips the preference', () => {
  const dir = mkdtempSync(join(tmpdir(), 'council-cfg-'));
  try {
    const path = join(dir, 'nested', 'quorum_config.json');
    saveConfig(path, setModel(parseConfig(null), MODELS.OPUS));
    assert.equal(loadConfig(path).model, 'opus-4-7');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
