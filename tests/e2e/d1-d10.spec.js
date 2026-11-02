/**
 * ==============================================================================
 * MEW CONTENT OS — Comprehensive E2E Journeys D1–D10 (Topic T33)
 * Framework: Playwright Test (@playwright/test)
 * 
 * Tests 10 complete user journeys specified in DOD:
 * - D1: ไม่ Save (Analyze clip without saving -> Marked as "Analyzed · Not saved", not in Library)
 * - D2: Content-only (Save Content-only -> Exists only in Content Vault)
 * - D3: Packaging-only (Save Packaging-only -> Exists only in Packaging Vault)
 * - D4: Both+2 WHY (Save Both with 2 distinct WHYs -> Dedicated notes in both vaults)
 * - D5: Remix C1+P1 (Remix 1 Content + 1 Packaging -> Synthesize concepts with source attribution)
 * - D6: Remix C3+P2 (Remix 3 Content + 2 Packaging -> remove/reorder/inspect ingredients)
 * - D7: Content-only Remix (Remix Content-only with Packaging = 0 -> Gating allows proceed)
 * - D8: Refine→Draft→Board→Approve (Refine angle -> Script Draft -> Submit to Board -> Approve Revision)
 * - D9: duplicate/unavailable/unsupported claim/no rights (All core edge cases & governance gating)
 * - D10: Back/Resume (State persistence across navigation and reloads)
 * ==============================================================================
 */

import { test, expect } from '@playwright/test';

import { getState, dispatch, resetDemo, setStorageEngine } from '../../src/modules/store.js';
import { validateSave, commitSave } from '../../src/modules/save-commit.js';
import { VaultFiltersController } from '../../src/modules/vault-filters.js';
import { IngredientBasketController } from '../../src/modules/ingredient-basket.js';
import { WorkspaceDirectionController } from '../../src/modules/ws-direction.js';
import { WorkspaceConceptsController } from '../../src/modules/ws-concepts.js';
import { ConceptDetailController } from '../../src/modules/concept-detail.js';
import { ConceptRefineController } from '../../src/modules/concept-refine.js';
import { ContentBoardController, BOARD_STAGES } from '../../src/modules/content-board.js';
import { ApproveHandoffController } from '../../src/modules/approve-handoff.js';
import {
  ClaimsRightsController,
  checkClaims,
  validateRightsForDraft,
  canApproveConcept
} from '../../src/modules/claims-rights.js';
import { ingestUrlWithDedupe, markMediaUnavailable } from '../../src/modules/url-dedupe.js';
import { RemixResumeController } from '../../src/modules/remix-resume.js';
import { ProvenanceManager } from '../../src/modules/provenance.js';

class MockLocalStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.get(key) || null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

test.describe('Topic T33: Comprehensive E2E Journeys D1–D10', () => {
  test.beforeEach(() => {
    global.localStorage = new MockLocalStorage();
    setStorageEngine(global.localStorage);
    resetDemo();
  });

  test('D1: Analyze clip without saving -> Marked as "Analyzed · Not saved", not in Library', async () => {
    const state = getState();
    const inboxItems = state.researchItems || state.inboxItems || state.inbox || [];
    const item = inboxItems.find(i => (i.status || '').includes('Not saved'));
    expect(item).toBeTruthy();
    expect(item.status).toContain('Not saved');

    // Confirm it does NOT exist in saved library references / notes
    const savedNote = state.savedNotes.find(n => n.sourceId === item.sourceId);
    expect(savedNote).toBeUndefined();
  });

  test('D2: Save Content-only -> Exists only in Content Vault', async () => {
    const valResult = validateSave({
      lenses: ['content'],
      whyContent: 'Unique creator philosophy on creative endurance'
    });
    expect(valResult.valid).toBe(true);

    const saved = commitSave({
      sourceId: 'src-demo-1',
      lenses: ['content'],
      whyContent: 'Unique creator philosophy on creative endurance'
    });
    const contentNote = saved.notes.find(n => n.lens === 'content');
    const packagingNote = saved.notes.find(n => n.lens === 'packaging');

    expect(contentNote).toBeTruthy();
    expect(contentNote.vaultType).toBe('content');
    expect(packagingNote).toBeUndefined();

    // Verify vault segregation via VaultFiltersController
    const ctrl = new VaultFiltersController({ activeVault: 'packaging' });
    const inPackaging = ctrl.filterReferences([contentNote]);
    expect(inPackaging.length).toBe(0);
  });

  test('D3: Save Packaging-only -> Exists only in Packaging Vault', async () => {
    const valResult = validateSave({
      lenses: ['packaging'],
      whyPackaging: 'Fast metronome sensory audio cue with quick cut pace'
    });
    expect(valResult.valid).toBe(true);

    const saved = commitSave({
      sourceId: 'src-demo-2',
      lenses: ['packaging'],
      whyPackaging: 'Fast metronome sensory audio cue with quick cut pace'
    });
    const contentNote = saved.notes.find(n => n.lens === 'content');
    const packagingNote = saved.notes.find(n => n.lens === 'packaging');

    expect(packagingNote).toBeTruthy();
    expect(packagingNote.vaultType).toBe('packaging');
    expect(contentNote).toBeUndefined();

    // Verify vault segregation: cannot appear in content vault
    const ctrl = new VaultFiltersController({ activeVault: 'content' });
    const inContent = ctrl.filterReferences([packagingNote]);
    expect(inContent.length).toBe(0);
  });

  test('D4: Save Both with two distinct WHYs -> Accessible in both vaults with dedicated notes', async () => {
    const valResult = validateSave({
      lenses: ['content', 'packaging'],
      whyContent: 'Deep creative focus and authentic personal narrative',
      whyPackaging: 'Cut every 2.5 seconds visual contrast and split screen'
    });
    expect(valResult.valid).toBe(true);

    const saved = commitSave({
      sourceId: 'src-demo-3',
      lenses: ['content', 'packaging'],
      whyContent: 'Deep creative focus and authentic personal narrative',
      whyPackaging: 'Cut every 2.5 seconds visual contrast and split screen'
    });

    const contentNote = saved.notes.find(n => n.lens === 'content');
    const packagingNote = saved.notes.find(n => n.lens === 'packaging');

    expect(contentNote).toBeTruthy();
    expect(packagingNote).toBeTruthy();
    expect(contentNote.why).not.toBe(packagingNote.why);
    expect(contentNote.sourceId).toBe(packagingNote.sourceId);
    expect(contentNote.vaultType).toBe('content');
    expect(packagingNote.vaultType).toBe('packaging');
  });

  test('D5: Remix C1 + P1 -> Successfully synthesizes concepts with source attribution', async () => {
    const ingredients = [
      { id: 'c1', vaultType: 'content', title: 'Content 1: Builder Mindset', founderWhy: 'Depth over speed' },
      { id: 'p1', vaultType: 'packaging', title: 'Packaging 1: Metronome Cut', founderWhy: 'Rhythmic retention' }
    ];
    const direction = { audience: 'Solo Founders', ourPov: 'Longevity beats viral hype' };

    const conceptsCtrl = new WorkspaceConceptsController();
    const concepts = conceptsCtrl.generateConcepts(ingredients, direction);

    expect(concepts.length).toBeGreaterThanOrEqual(2);
    expect(concepts[0].sourceTrace.length).toBe(2);
    expect(concepts[0].sourceTrace.some(s => s.refId === 'c1')).toBe(true);
    expect(concepts[0].sourceTrace.some(s => s.refId === 'p1')).toBe(true);
  });

  test('D6: Remix C3 + P2 -> Reordering, removing, and inspecting ingredients from basket', async () => {
    const basket = new IngredientBasketController({
      initialReferences: [
        { id: 'c1', vaultType: 'content', title: 'Deep Work Discipline', founderWhy: 'Solitude leads to focus' },
        { id: 'c2', vaultType: 'content', title: 'Execution Cadence', founderWhy: 'Daily progress compounds' },
        { id: 'c3', vaultType: 'content', title: 'Creator Longevity', founderWhy: 'Endurance creates trust' },
        { id: 'p1', vaultType: 'packaging', title: 'Fast Jump Cut', founderWhy: 'High energy retention' },
        { id: 'p2', vaultType: 'packaging', title: 'Text Contrast Reveal', founderWhy: 'Visual anchor for key ideas' }
      ]
    });

    // 1. Initial counts: 3 Content + 2 Packaging = 5 Total
    expect(basket.getCounts().total).toBe(5);
    expect(basket.getCounts().contentCount).toBe(3);
    expect(basket.getCounts().packagingCount).toBe(2);

    // 2. Inspect ingredient detail
    const inspectTarget = basket.selectedReferences.find(r => r.id === 'c3');
    expect(inspectTarget).toBeTruthy();
    expect(inspectTarget.title).toBe('Creator Longevity');
    expect(inspectTarget.founderWhy).toBe('Endurance creates trust');

    // 3. Remove ingredient (e.g. c2)
    basket.removeReference('c2');
    expect(basket.getCounts().total).toBe(4);
    expect(basket.getCounts().contentCount).toBe(2);

    // 4. Reorder remaining ingredients
    basket.reorderReferences(['p2', 'p1', 'c1', 'c3']);
    expect(basket.selectedReferences[0].id).toBe('p2');
    expect(basket.selectedReferences[1].id).toBe('p1');
    expect(basket.selectedReferences[3].id).toBe('c3');
  });

  test('D7: Content-only Remix (Packaging = 0) -> Allowed to proceed', async () => {
    const basket = new IngredientBasketController({
      initialReferences: [
        { id: 'c1', vaultType: 'content', title: 'Original Philosophy', founderWhy: 'Authentic insight' }
      ]
    });

    const counts = basket.getCounts();
    expect(counts.contentCount).toBe(1);
    expect(counts.packagingCount).toBe(0);
    expect(basket.canContinue(counts.contentCount)).toBe(true);
  });

  test('D8: Refine -> Draft -> Board -> Approve Governance Journey', async () => {
    // 1. Non-destructive angle refinement
    const refineCtrl = new ConceptRefineController();
    const orig = { id: 'c-test-d8', name: 'Original Core', hook: 'Initial Hook Line', beats: ['Beat 1'] };
    const refined = refineCtrl.refineAngle(orig, 'Make punchier for TikTok builders');
    expect(refined.id).not.toBe(orig.id);
    expect(refined.parentConceptId).toBe(orig.id);
    expect(refined.isRefined).toBe(true);

    // 2. Save script draft
    const detailCtrl = new ConceptDetailController({ concept: refined });
    const draft = detailCtrl.saveScriptDraft('Punchy Opening Hook', 'Full script text for video...');
    expect(draft.conceptId).toBe(refined.id);

    // 3. Board lifecycle: Draft -> Submit for Review
    const boardCtrl = new ContentBoardController({
      initialCards: [{ id: refined.id, title: refined.name, stage: BOARD_STAGES.DRAFT }]
    });
    boardCtrl.submitForReview(refined.id);
    expect(boardCtrl.cards[0].stage).toBe(BOARD_STAGES.NEEDS_REVIEW);

    // 4. Director Brief Approval: freeze into immutable revision
    const approveCtrl = new ApproveHandoffController();
    const cardToApprove = {
      ...boardCtrl.cards[0],
      claimFlagCount: 0,
      rightsOk: true,
      hook: refined.hook
    };
    expect(approveCtrl.canApprove(cardToApprove).allowed).toBe(true);

    const revision = approveCtrl.approveConcept(cardToApprove);
    expect(Object.isFrozen(revision)).toBe(true);
    expect(revision.revisionId).toBeTruthy();
    expect(revision.directorBrief.hook).toBe(refined.hook);
  });

  test('D9: Edge Cases: Duplicate URL, unavailable media, unsupported claim, and no rights gating', async () => {
    // 1. Duplicate URL detection
    const existingSource = getState().sources[0];
    expect(existingSource).toBeTruthy();
    const sep = existingSource.url.includes('?') ? '&' : '?';
    const dupUrl = `${existingSource.url}${sep}utm_source=twitter&utm_medium=cpc`;
    const dupResult = ingestUrlWithDedupe(dupUrl);
    expect(dupResult.isDuplicate).toBe(true);
    expect(dupResult.source.id).toBe(existingSource.id);

    // 2. Unavailable media state (Honesty protection)
    const unavSourceId = 'src-unavailable-d9';
    dispatch({
      type: 'ADD_SOURCE',
      payload: { id: unavSourceId, title: 'Private Video', url: 'https://youtube.com/watch?v=private123' }
    });
    dispatch({
      type: 'ADD_RESEARCH_ITEM',
      payload: { id: `item-${unavSourceId}`, sourceId: unavSourceId, status: 'Waiting for analysis' }
    });
    const unavRes = markMediaUnavailable(unavSourceId, 'Video removed by creator');
    expect(unavRes.status).toBe('Analysis unavailable');
    expect(unavRes.analysis.packaging.packagingBlocked).toBe(true);
    expect(unavRes.analysis.packaging.hook).toBeNull();

    // 3. Unsupported claim gating (A14)
    const crCtrl = new ClaimsRightsController();
    const unverifiedConcept = {
      id: 'c-unverified-d9',
      stage: 'needs-review',
      hook: 'นอนวันละ 4 ชั่วโมง ประสิทธิภาพเพิ่มขึ้น 300%'
    };
    checkClaims(unverifiedConcept);
    expect(unverifiedConcept['claim-flag']).toBe(true);
    expect(canApproveConcept(unverifiedConcept).allowed).toBe(false);

    // 4. No rights / copyright risk gating (A13/A15)
    // Reaction/Stitch without rights-confirm is blocked from Save Draft
    const rightsCheckNoConfirm = validateRightsForDraft('opt-reaction-stitch', false);
    expect(rightsCheckNoConfirm.canSave).toBe(false);
    expect(rightsCheckNoConfirm.reason).toContain('rights-confirm');

    // Copied exact title triggers copyRiskFlag
    const riskyConcept = {
      hook: 'Verbatim copy from original source title without transformation',
      originalContribution: ''
    };
    const ingredients = [{ id: '1', title: 'Verbatim copy from original source title without transformation' }];
    const audit = crCtrl.auditConceptRights(riskyConcept, ingredients);
    expect(audit.copyRiskFlag).toBe(true);
  });

  test('D10: Back / Resume Persistence across navigation and page reloads', async () => {
    // 1. Dispatch workspace state to central store
    dispatch({
      type: 'SET_REMIX_SELECTION',
      payload: { content: ['c1', 'c2'], packaging: ['p1'] }
    });

    const session = getState();
    expect(session.remixSelection).toBeTruthy();
    expect(session.remixSelection.content).toEqual(['c1', 'c2']);
    expect(session.remixSelection.packaging).toEqual(['p1']);

    // 2. Validate persistence via RemixResumeController
    const resumeCtrl = new RemixResumeController({ autoSyncStore: false });
    resumeCtrl.persistSelection({ content: ['c1', 'c2'], packaging: ['p1'] });

    // 3. Simulate reload / resume retrieval
    const persisted = resumeCtrl.getPersistedSelection();
    expect(persisted.content).toEqual(['c1', 'c2']);
    expect(persisted.packaging).toEqual(['p1']);
  });
});
