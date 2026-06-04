#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { aggregateScores } from './scores.mjs';
import { selectResume, lastCompletedPhase } from './resume.mjs';
import { sessionId } from './session.mjs';
import { recordOutcome, sessionOutcomeStatus } from './outcomes.mjs';
import { formatThreadEntry, recentEntries } from './thread.mjs';
import { renderLogbook } from './logbook.mjs';
import { renderHtml } from './html.mjs';
import { loadSession } from './sessionload.mjs';
import { buildDecisionCard } from './decisioncard.mjs';
import { tallyPreferences, buildComparisonVerdict } from './compare.mjs';
import { buildBench } from './bench.mjs';
import { topResolvable } from './unknowns.mjs';
import { renderSessionMarkdown } from './sessionmd.mjs';
import { loadConfig, saveConfig, setModel } from './config.mjs';
import { estimateAll, estimateEffort } from './estimate.mjs';
import {
  writeArtifact,
  readArtifact,
  presentArtifacts,
  scanSessions,
  writeDone,
  markSessionAbandoned,
} from './checkpoint.mjs';

const stdin = () => readFileSync(0, 'utf8');
const json = (v) => ({ json: v });
const text = (v) => ({ text: v });

const COMMANDS = {
  'aggregate-scores': () => json(aggregateScores(JSON.parse(stdin()))),
  'estimate-cost': () => {
    const opts = JSON.parse(stdin().trim() || '{}');
    return json(opts.effort ? estimateEffort(opts.effort, opts) : estimateAll(opts));
  },
  'select-resume': (args) => {
    const sessions = scanSessions(args[0]);
    const decision = selectResume(sessions);
    if (decision.session) decision.session.lastPhase = lastCompletedPhase(decision.session.files);
    return json(decision);
  },
  'session-id': () => text(sessionId(new Date())),
  'render-logbook': () => text(renderLogbook(JSON.parse(stdin()))),
  'render-html': () => text(renderHtml(JSON.parse(stdin()))),
  'render-session-md': () => text(renderSessionMarkdown(JSON.parse(stdin()))),
  'load-session': (args) => json(loadSession(args[0])),
  'format-thread-entry': () => text(formatThreadEntry(JSON.parse(stdin()))),
  'recent-entries': () => {
    const { thread, n } = JSON.parse(stdin());
    return json(recentEntries(thread, n));
  },
  'build-decision-card': () => json(buildDecisionCard(JSON.parse(stdin()))),
  'record-outcome': () => {
    const { outcomes, entry } = JSON.parse(stdin());
    return json(recordOutcome(outcomes, entry));
  },
  'session-outcome-status': () => {
    const { actions, outcomes } = JSON.parse(stdin());
    return text(sessionOutcomeStatus(actions, outcomes));
  },
  'tally-preferences': () => json(tallyPreferences(JSON.parse(stdin()))),
  'comparison-verdict': () => json(buildComparisonVerdict(JSON.parse(stdin()))),
  'top-unknowns': () => {
    const { unknowns, n } = JSON.parse(stdin());
    return json(topResolvable(unknowns, n));
  },
  'build-bench': () => json(buildBench(JSON.parse(stdin()))),
  'config-get': (args) => json(loadConfig(args[0])),
  'config-set': (args) => {
    const cfg = setModel(loadConfig(args[0]), args[1]);
    saveConfig(args[0], cfg);
    return json(cfg);
  },
  'scan-sessions': (args) => json(scanSessions(args[0])),
  'write-artifact': (args) => {
    const [dir, name] = args;
    const raw = stdin();
    writeArtifact(dir, name, name.endsWith('.json') ? JSON.parse(raw) : raw);
    return text('ok');
  },
  'read-artifact': (args) => {
    const [dir, name] = args;
    const data = readArtifact(dir, name);
    return name.endsWith('.json') ? json(data) : text(data);
  },
  'write-done': (args) => {
    writeDone(args[0]);
    return text('ok');
  },
  'mark-abandoned': (args) => {
    markSessionAbandoned(args[0]);
    return text('ok');
  },
  'last-phase': (args) => text(lastCompletedPhase(presentArtifacts(args[0])) ?? ''),
};

function main() {
  const [command, ...args] = process.argv.slice(2);
  const handler = COMMANDS[command];
  if (!handler) {
    process.stderr.write(`unknown command: ${command ?? '(none)'}\n`);
    process.exit(1);
  }
  const result = handler(args);
  process.stdout.write('json' in result ? JSON.stringify(result.json) : result.text);
  process.stdout.write('\n');
}

try {
  main();
} catch (err) {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
}
