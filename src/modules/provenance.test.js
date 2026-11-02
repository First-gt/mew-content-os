/**
 * ==============================================================================
 * MEW CONTENT OS — Provenance Snapshot Unit Tests (Topic T30)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ProvenanceManager } from './provenance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T30: Provenance Snapshot เมื่อ Saved Note ถูกลบ', () => {
  const htmlPath = path.resolve(__dirname, '../components/provenance-badge.html');
  const cssPath = path.resolve(__dirname, '../styles/provenance-badge.css');
  const jsPath = path.resolve(__dirname, './provenance.js');

  test('T30-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'provenance-badge.html must exist');
    assert.ok(fs.existsSync(cssPath), 'provenance-badge.css must exist');
    assert.ok(fs.existsSync(jsPath), 'provenance.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'provenance-badge.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'provenance-badge.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'provenance.js must not be empty');
  });

  test('T30-02: HTML contains badge-source-unavailable and snapshot template', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="provenance-snapshot-root"'), 'Must contain provenance-snapshot-root');
    assert.ok(html.includes('id="badge-source-unavailable"'), 'Must contain badge-source-unavailable');
    assert.ok(html.includes('id="tmpl-provenance-snapshot-card"'), 'Must contain tmpl-provenance-snapshot-card');
  });

  test('T30-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'provenance-badge.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'provenance.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'provenance-badge.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T30-04: createSnapshot stores complete reference snapshot at save time', () => {
    const rawRefs = [
      {
        id: 'note-c-1',
        title: 'Deep Focus Method',
        founderWhy: 'Essential mindset note',
        sourceUrl: 'https://youtube.com/@example',
        vaultType: 'content',
        analysisVersionId: 'v1.2'
      }
    ];

    const snapshot = ProvenanceManager.createSnapshot(rawRefs);
    assert.equal(snapshot.length, 1);
    assert.equal(snapshot[0].refId, 'note-c-1');
    assert.equal(snapshot[0].title, 'Deep Focus Method');
    assert.equal(snapshot[0].why, 'Essential mindset note');
    assert.equal(snapshot[0].lens, 'content');
    assert.equal(snapshot[0].analysisVersion, 'v1.2');
    assert.ok(snapshot[0].snapshottedAt);
  });

  test('T30-05: resolveReference maintains data from snapshot when vault note is deleted (A19)', () => {
    const snapshotItem = {
      refId: 'deleted-note-99',
      title: 'Legacy Video',
      why: 'Great reason captured before deletion',
      sourceUrl: 'https://youtube.com/@deleted',
      lens: 'packaging',
      analysisVersion: 'v1.0'
    };

    // Active vault has 0 items (note was deleted!)
    const activeVault = [];

    const resolved = ProvenanceManager.resolveReference(snapshotItem, activeVault);

    assert.equal(resolved.isAvailable, false, 'Deleted note must have isAvailable = false');
    assert.ok(resolved.ref, 'Ref data must be restored from snapshot');
    assert.equal(resolved.ref.title, 'Legacy Video');
    assert.equal(resolved.ref.founderWhy, 'Great reason captured before deletion');
    assert.equal(resolved.unavailableBadge, true);
  });

  test('T30-06: resolveDraftTrace guarantees source trace is never empty after deletions', () => {
    const snapshots = [
      { refId: 'c1', title: 'Ref 1', why: 'Why 1', lens: 'content' },
      { refId: 'p1', title: 'Ref 2', why: 'Why 2', lens: 'packaging' }
    ];

    const activeVault = []; // both deleted from vault!
    const trace = ProvenanceManager.resolveDraftTrace(snapshots, activeVault);

    assert.equal(trace.length, 2, 'Trace must retain all 2 references from snapshot');
    assert.equal(trace[0].unavailableBadge, true);
    assert.equal(trace[1].unavailableBadge, true);
  });

  test('T30-07: DOD Test: ลบ note -> เปิด draft เดิม -> trace ครบ + badge ขึ้น', () => {
    // 1. Initial state: savedNotes has 2 references
    let vaultNotes = [
      {
        id: 'note-1',
        sourceId: 'src-1',
        title: 'Story Structure Masterclass',
        founderWhy: 'Hook in first 3 seconds then open loop',
        sourceUrl: 'https://example.com/story-1',
        vaultType: 'content',
        analysisVersionId: 'v1.0'
      },
      {
        id: 'note-2',
        sourceId: 'src-2',
        title: 'Split-Screen Tension',
        founderWhy: 'Dual angle visual pacing',
        sourceUrl: 'https://example.com/split-2',
        vaultType: 'packaging',
        analysisVersionId: 'v2.1'
      }
    ];

    // 2. Founder saves Remix Draft using these 2 references
    const rawDraft = {
      id: 'draft-xyz',
      conceptId: 'concept-101',
      title: 'High Retention Teaser',
      fullScript: 'Scene 1: Hook immediately...'
    };

    const draftWithSnapshot = ProvenanceManager.attachSnapshotToDraft(rawDraft, vaultNotes);
    assert.equal(draftWithSnapshot.referencesSnapshot.length, 2);
    assert.equal(draftWithSnapshot.referencesSnapshot[0].title, 'Story Structure Masterclass');
    assert.equal(draftWithSnapshot.referencesSnapshot[1].title, 'Split-Screen Tension');

    // 3. User deletes 'note-1' from savedNotes!
    vaultNotes = vaultNotes.filter(n => n.id !== 'note-1');
    assert.equal(vaultNotes.length, 1, 'note-1 has been deleted from vault');

    // 4. User opens the previously saved draft
    const { draft, resolvedTrace, hasUnavailableSources } = ProvenanceManager.openDraft(draftWithSnapshot, vaultNotes);

    // Assert: draft opens successfully, trace is NOT empty, and full data is preserved
    assert.ok(draft, 'Draft must open without errors');
    assert.equal(resolvedTrace.length, 2, 'Source trace must maintain all 2 items despite note deletion');
    assert.equal(hasUnavailableSources, true, 'Flag indicates deleted sources exist');

    // Note 1 (deleted): retrieved from snapshot, badge is active
    const item1 = resolvedTrace.find(t => t.id === 'note-1' || t.refId === 'note-1');
    assert.ok(item1, 'Deleted note must still be present in trace from snapshot');
    assert.equal(item1.title, 'Story Structure Masterclass');
    assert.equal(item1.founderWhy, 'Hook in first 3 seconds then open loop');
    assert.equal(item1.isAvailable, false, 'isAvailable must be false for deleted note');
    assert.equal(item1.unavailableBadge, true, 'unavailableBadge must be true');

    // Note 2 (still exists): isAvailable is true
    const item2 = resolvedTrace.find(t => t.id === 'note-2' || t.refId === 'note-2');
    assert.ok(item2, 'Existing note is present');
    assert.equal(item2.isAvailable, true);
    assert.equal(item2.unavailableBadge, false);
  });
});
