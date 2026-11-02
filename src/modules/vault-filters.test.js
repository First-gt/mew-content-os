/**
 * ==============================================================================
 * MEW CONTENT OS — Vault Cards & Filters Unit Tests (Topic T16)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { VaultFiltersController } from './vault-filters.js';
import { getState, dispatch, resetDemo } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T16: Library Cards + Search/Filters (S04)', () => {
  const htmlPath = path.resolve(__dirname, '../components/vault-cards.html');
  const cssPath = path.resolve(__dirname, '../styles/vault-cards.css');
  const jsPath = path.resolve(__dirname, './vault-filters.js');

  test('T16-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'vault-cards.html must exist');
    assert.ok(fs.existsSync(cssPath), 'vault-cards.css must exist');
    assert.ok(fs.existsSync(jsPath), 'vault-filters.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'vault-cards.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'vault-cards.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'vault-filters.js must not be empty');
  });

  test('T16-02: HTML contains all specified filters, card template, and toast', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Search and common filters
    assert.ok(html.includes('id="search-vault"'), 'Must contain search-vault');
    assert.ok(html.includes('id="filter-topic"'), 'Must contain filter-topic');
    assert.ok(html.includes('id="filter-creator"'), 'Must contain filter-creator');
    assert.ok(html.includes('id="filter-tags"'), 'Must contain filter-tags');
    assert.ok(html.includes('id="filter-saved-date"'), 'Must contain filter-saved-date');
    assert.ok(html.includes('id="btn-clear-filters"'), 'Must contain btn-clear-filters');

    // Packaging extra filters
    assert.ok(html.includes('id="filter-hook-type"'), 'Must contain filter-hook-type');
    assert.ok(html.includes('id="filter-structure"'), 'Must contain filter-structure');
    assert.ok(html.includes('id="filter-sound-pacing"'), 'Must contain filter-sound-pacing');

    // Toast
    assert.ok(html.includes('id="toast-added-to-selection"'), 'Must contain toast-added-to-selection');

    // Card structure elements
    assert.ok(html.includes('founder-why'), 'Card must have founder-why section');
    assert.ok(html.includes('ai-insight'), 'Card must have ai-insight section');
    assert.ok(html.includes('link-source'), 'Card must have link-source');
    assert.ok(html.includes('btn-use-in-remix'), 'Card must have btn-use-in-remix');
  });

  test('T16-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'vault-cards.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'vault-filters.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'vault-cards.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T16-04: Card styling gives primary prominence to founder-why over ai-insight', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');
    assert.ok(css.includes('.founder-why-box'), 'Must define styles for .founder-why-box');
    assert.ok(css.includes('.ai-insight-box'), 'Must define styles for .ai-insight-box');
  });

  test('T16-05: Controller filterReferences isolates by vaultType and search query', () => {
    const ctrl = new VaultFiltersController({ activeVault: 'content' });

    const sampleRefs = [
      { id: '1', vaultType: 'content', title: 'Deep Work Method', creator: 'Cal Newport', tags: ['Focus'], founderWhy: 'Essential mindset' },
      { id: '2', vaultType: 'packaging', title: 'Fast Hook Video', creator: 'Ali Abdaal', tags: ['Hook'], founderWhy: 'Sensory audio cue' },
      { id: '3', vaultType: 'content', title: 'Writing Systems', creator: 'Nicolas Cole', tags: ['Systems'], founderWhy: 'Great framework' }
    ];

    // Filter only content vault
    const contentOnly = ctrl.filterReferences(sampleRefs);
    assert.equal(contentOnly.length, 2, 'Content tab must only return content vault items');
    assert.equal(contentOnly[0].id, '1');
    assert.equal(contentOnly[1].id, '3');

    // Switch to packaging vault
    ctrl.setActiveVault('packaging');
    const packagingOnly = ctrl.filterReferences(sampleRefs);
    assert.equal(packagingOnly.length, 1);
    assert.equal(packagingOnly[0].id, '2');

    // Search query test
    ctrl.setActiveVault('content');
    ctrl.setFilter('search', 'Deep Work');
    const searchResult = ctrl.filterReferences(sampleRefs);
    assert.equal(searchResult.length, 1);
    assert.equal(searchResult[0].title, 'Deep Work Method');
  });

  test('T16-06: Clear filters resets all filters to default', () => {
    const ctrl = new VaultFiltersController();
    ctrl.setFilter('search', 'test query');
    ctrl.setFilter('topic', 'mindset');
    ctrl.setFilter('creator', 'mew');

    ctrl.clearFilters();
    assert.equal(ctrl.filters.search, '');
    assert.equal(ctrl.filters.topic, 'all');
    assert.equal(ctrl.filters.creator, 'all');
  });

  test('T16-07: handleUseInRemix triggers selection callback', () => {
    let capturedId = null;
    const ctrl = new VaultFiltersController({
      onSelectionChange: (id) => { capturedId = id; }
    });

    ctrl.handleUseInRemix('ref-123');
    assert.equal(capturedId, 'ref-123');
  });
});
