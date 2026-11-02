/**
 * ==============================================================================
 * MEW CONTENT OS — Founder 3 Demo Paths E2E Suite (Topic T33)
 * Framework: Playwright Test (@playwright/test)
 * 
 * Verifies the 3 core founder presentation flows:
 * - Path 1: Save Content only
 * - Path 2: Save Both with two distinct WHYs
 * - Path 3: Remix C3 + P2 -> Original Concept -> Script Draft
 * ==============================================================================
 */

import { test, expect } from '@playwright/test';

import { getState, dispatch, resetDemo, setStorageEngine } from '../../src/modules/store.js';
import { validateSave, commitSave } from '../../src/modules/save-commit.js';
import { WorkspaceConceptsController } from '../../src/modules/ws-concepts.js';
import { ConceptDetailController } from '../../src/modules/concept-detail.js';

class MockLocalStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.get(key) || null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

test.describe('Topic T33: Founder 3 Demo Paths', () => {
  test.beforeEach(() => {
    global.localStorage = new MockLocalStorage();
    setStorageEngine(global.localStorage);
    resetDemo();
  });

  test('Demo Path 1: Save Content Only workflow', async () => {
    const val = validateSave({
      lenses: ['content'],
      whyContent: 'Founder philosophy on creative detachment'
    });
    expect(val.valid).toBe(true);

    const saved = commitSave({
      sourceId: 'source-demo-path-1',
      lenses: ['content'],
      whyContent: 'Founder philosophy on creative detachment'
    });
    expect(saved.contentNote).toBeTruthy();
    expect(saved.packagingNote).toBeNull();
    expect(saved.contentNote.vaultType).toBe('content');
  });

  test('Demo Path 2: Save Both with Two Distinct WHYs workflow', async () => {
    const val = validateSave({
      lenses: ['content', 'packaging'],
      whyContent: 'Core mindset value',
      whyPackaging: 'Audio metronome pacing structure'
    });
    expect(val.valid).toBe(true);

    const saved = commitSave({
      sourceId: 'source-demo-path-2',
      lenses: ['content', 'packaging'],
      whyContent: 'Core mindset value',
      whyPackaging: 'Audio metronome pacing structure'
    });
    expect(saved.contentNote).toBeTruthy();
    expect(saved.packagingNote).toBeTruthy();
    expect(saved.contentNote.founderWhy).not.toBe(saved.packagingNote.founderWhy);
  });

  test('Demo Path 3: Remix C3 + P2 -> Original Concepts -> Script Draft workflow', async () => {
    const ingredients = [
      { id: 'c1', vaultType: 'content', title: 'Mindset', founderWhy: 'Depth' },
      { id: 'c2', vaultType: 'content', title: 'Routine', founderWhy: 'Habit' },
      { id: 'c3', vaultType: 'content', title: 'Longevity', founderWhy: 'Endurance' },
      { id: 'p1', vaultType: 'packaging', title: 'Metronome', founderWhy: 'Pacing' },
      { id: 'p2', vaultType: 'packaging', title: 'Contrast Cut', founderWhy: 'Visuals' }
    ];
    const direction = {
      audience: 'Independent Solo Builders',
      ourPov: 'Authentic 100-piece output discipline',
      cta: 'Join community'
    };

    // 1. Synthesize concepts
    const conceptsCtrl = new WorkspaceConceptsController();
    const concepts = conceptsCtrl.generateConcepts(ingredients, direction);
    expect(concepts.length).toBeGreaterThanOrEqual(2);

    // 2. Open Concept Detail & write script draft
    const detailCtrl = new ConceptDetailController({ concept: concepts[0] });
    const draft = detailCtrl.saveScriptDraft('Stop counting day 1 views', 'Opening monologue script...');

    expect(draft.conceptId).toBe(concepts[0].id);
    expect(draft.savedAt).toBeTruthy();
  });
});
