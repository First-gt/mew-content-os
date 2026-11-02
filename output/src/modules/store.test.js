/**
 * ==============================================================================
 * MEW CONTENT OS — Central Store Unit Tests (Topic T02)
 * Framework: node:test & node:assert/strict
 * Reference: MEW_Content_OS_Founder_UX_Spec_TH.md & plan.md Topic T02 DOD
 * 
 * Verifies:
 * 1. Initial state shape has all required properties:
 *    sources[], analyses[], researchItems[], savedNotes[],
 *    remixSelection{content[], packaging[]}, concepts[], boardItems[], approvedRevisions[]
 * 2. dispatch(action) modifies state and calls subscribers exactly ONCE per action
 * 3. unsubscribe() stops further calls
 * 4. LocalStorage persistence uses key 'mew-content-os-v1' and survives reload
 * 5. Storage fallback works safely in-memory when localStorage throws or is absent
 * 6. seed() loads Spec Section 6 samples:
 *    - Source A: "Post and forget it" (Content-only, Thai WHY)
 *    - Source B: "The Ticking Clock" (Packaging-only, Thai WHY)
 *    - Source E: "Myth vs Reality" (Both vaults, shares 1 sourceId, distinct Thai WHYs)
 *    - Multi-source C1-C3 and P1-P2 with authentic Thai WHYs
 * 7. resetDemo() restores original seed data
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getState,
  dispatch,
  subscribe,
  seed,
  resetDemo,
  setStorageEngine,
  STORAGE_KEY,
  computeSourceStatus
} from './store.js';

/**
 * In-memory Mock Storage implementation for testing persistence
 */
class MockStorage {
  constructor() {
    this.store = new Map();
    this.shouldThrowOnSet = false;
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    if (this.shouldThrowOnSet) {
      throw new Error('QuotaExceededError: storage is full');
    }
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

describe('Store — Topic T02 Central Store & Sample Data', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    setStorageEngine(mockStorage);
    resetDemo();
  });

  test('T02-01: State shape conforms to specification', () => {
    const state = getState();

    assert.ok(Array.isArray(state.sources), 'sources must be an array');
    assert.ok(Array.isArray(state.analyses), 'analyses must be an array');
    assert.ok(Array.isArray(state.researchItems), 'researchItems must be an array');
    assert.ok(Array.isArray(state.savedNotes), 'savedNotes must be an array');
    assert.ok(state.remixSelection && typeof state.remixSelection === 'object', 'remixSelection must be an object');
    assert.ok(Array.isArray(state.remixSelection.content), 'remixSelection.content must be an array');
    assert.ok(Array.isArray(state.remixSelection.packaging), 'remixSelection.packaging must be an array');
    assert.ok(Array.isArray(state.concepts), 'concepts must be an array');
    assert.ok(Array.isArray(state.boardItems), 'boardItems must be an array');
    assert.ok(Array.isArray(state.approvedRevisions), 'approvedRevisions must be an array');
  });

  test('T02-02: dispatch(action) notifies subscriber exactly once per action', () => {
    let callCount = 0;
    let receivedState = null;
    let receivedAction = null;

    const unsubscribe = subscribe((state, action) => {
      callCount++;
      receivedState = state;
      receivedAction = action;
    });

    const action = {
      type: 'ADD_SOURCE',
      payload: {
        id: 'test-source-99',
        title: 'Test Clip',
        creator: 'Tester',
        url: 'https://example.com/test-99'
      }
    };

    dispatch(action);

    assert.strictEqual(callCount, 1, 'Subscriber must be called exactly 1 time per action');
    assert.strictEqual(receivedAction.type, 'ADD_SOURCE');
    assert.ok(receivedState.sources.some(s => s.id === 'test-source-99'));

    unsubscribe();
  });

  test('T02-03: unsubscribe stops subscriber notifications', () => {
    let callCount = 0;
    const unsubscribe = subscribe(() => {
      callCount++;
    });

    dispatch({ type: 'ADD_SOURCE', payload: { id: 'test-sub-1' } });
    assert.strictEqual(callCount, 1);

    unsubscribe();

    dispatch({ type: 'ADD_SOURCE', payload: { id: 'test-sub-2' } });
    assert.strictEqual(callCount, 1, 'Subscriber must not be called after unsubscribe');
  });

  test('T02-04: Persistence to localStorage key mew-content-os-v1', () => {
    dispatch({
      type: 'ADD_SOURCE',
      payload: { id: 'storage-test-1', title: 'Storage Test' }
    });

    const storedRaw = mockStorage.getItem(STORAGE_KEY);
    assert.ok(storedRaw, 'Storage must contain serialized state under mew-content-os-v1');

    const parsed = JSON.parse(storedRaw);
    assert.ok(parsed.sources.some(s => s.id === 'storage-test-1'), 'Stored state must contain added source');
  });

  test('T02-05: Storage reload restores state intact', () => {
    // 1. Dispatch custom note
    const customNote = {
      id: 'custom-note-persist',
      sourceId: 'source-a',
      lens: 'content',
      why: 'ทดสอบการจำลองการ Reload หน้าเว็บ',
      tags: ['Test'],
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'SAVE_NOTE', payload: customNote });

    const rawBefore = mockStorage.getItem(STORAGE_KEY);
    assert.ok(rawBefore);

    // 2. Simulate page reload by re-hydrating from storage
    const parsedState = JSON.parse(rawBefore);
    dispatch({ type: 'HYDRATE', payload: parsedState });

    const restoredState = getState();
    const found = restoredState.savedNotes.find(n => n.id === 'custom-note-persist');
    assert.ok(found, 'Restored state must retain savedNotes across reloads');
    assert.strictEqual(found.why, 'ทดสอบการจำลองการ Reload หน้าเว็บ');
  });

  test('T02-06: Storage fallback handles quota errors gracefully without crashing', () => {
    mockStorage.shouldThrowOnSet = true;

    // Dispatch should not throw even if setItem throws QuotaExceededError
    assert.doesNotThrow(() => {
      dispatch({
        type: 'ADD_SOURCE',
        payload: { id: 'in-memory-source', title: 'Runs In Memory' }
      });
    }, 'Store must fallback in-memory when storage throws');

    const state = getState();
    assert.ok(state.sources.some(s => s.id === 'in-memory-source'), 'In-memory state should still update');
  });

  test('T02-07: Spec Section 6 Sample Data — Story A "Post and forget it" (Content-only)', () => {
    seed();
    const state = getState();

    // Verify Source A
    const sourceA = state.sources.find(s => s.id === 'source-a');
    assert.ok(sourceA, 'Source A must exist');
    assert.ok(sourceA.title.includes('Post and forget it'));

    // Verify Saved Note A is Content-only
    const notesA = state.savedNotes.filter(n => n.sourceId === 'source-a');
    assert.strictEqual(notesA.length, 1, 'Story A must have exactly 1 note');
    assert.strictEqual(notesA[0].lens, 'content', 'Story A must be in Content Vault only');
    assert.ok(notesA[0].why.includes('ชอบสารหลัก อยากต่อยอด'), 'Note A must contain Founder Thai WHY from spec');
    assert.ok(notesA[0].why.includes('MEW'), 'Note A must reference MEW automation context');

    // Research status for Source A must be 'Saved to Content'
    const statusA = computeSourceStatus('source-a', state.savedNotes);
    assert.strictEqual(statusA, 'Saved to Content');
  });

  test('T02-08: Spec Section 6 Sample Data — Story B "The Ticking Clock" (Packaging-only)', () => {
    seed();
    const state = getState();

    // Verify Source B
    const sourceB = state.sources.find(s => s.id === 'source-b');
    assert.ok(sourceB, 'Source B must exist');
    assert.ok(sourceB.title.includes('The Ticking Clock'));

    // Verify Saved Note B is Packaging-only
    const notesB = state.savedNotes.filter(n => n.sourceId === 'source-b');
    assert.strictEqual(notesB.length, 1, 'Story B must have exactly 1 note');
    assert.strictEqual(notesB[0].lens, 'packaging', 'Story B must be in Packaging Vault only');
    assert.ok(notesB[0].why.includes('อยากลองโครงสร้างเปิดเรื่องที่กดดันแบบนี้'), 'Note B must contain Founder Thai WHY from spec');
    assert.ok(notesB[0].why.includes('ไม่เอาเสียงต้นฉบับ'), 'Note B must enforce rights guardrail');

    // Research status for Source B must be 'Saved to Packaging'
    const statusB = computeSourceStatus('source-b', state.savedNotes);
    assert.strictEqual(statusB, 'Saved to Packaging');
  });

  test('T02-09: Spec Section 6 Sample Data — Story E (Single Source -> Both Vaults with separate WHYs)', () => {
    seed();
    const state = getState();

    // Verify Source E
    const sourceE = state.sources.find(s => s.id === 'source-e');
    assert.ok(sourceE, 'Source E must exist');

    // Verify exactly 2 notes sharing source-e (one Content, one Packaging)
    const notesE = state.savedNotes.filter(n => n.sourceId === 'source-e');
    assert.strictEqual(notesE.length, 2, 'Story E must have 2 notes for the single canonical source');

    const contentNoteE = notesE.find(n => n.lens === 'content');
    const packagingNoteE = notesE.find(n => n.lens === 'packaging');

    assert.ok(contentNoteE, 'Source E must have a Content note');
    assert.ok(packagingNoteE, 'Source E must have a Packaging note');

    // Must have DIFFERENT, separate human WHY explanations in Thai
    assert.notStrictEqual(contentNoteE.why, packagingNoteE.why, 'Content and Packaging WHYs must be separate');
    assert.ok(contentNoteE.why.includes('แก้ความเข้าใจผิดเรื่องการสร้างแบรนด์'));
    assert.ok(packagingNoteE.why.includes('misconception แล้วค่อยเฉลย'));

    // Research status for Source E must be 'Saved to Both'
    const statusE = computeSourceStatus('source-e', state.savedNotes);
    assert.strictEqual(statusE, 'Saved to Both');
  });

  test('T02-10: Spec Section 6 Sample Data — C1–C3 and P1–P2 Multi-Source Ingredients', () => {
    seed();
    const state = getState();

    // C1 is note-a
    assert.ok(state.savedNotes.some(n => n.id === 'note-a' && n.lens === 'content'));
    // C2 is note-c2
    const noteC2 = state.savedNotes.find(n => n.id === 'note-c2');
    assert.ok(noteC2 && noteC2.lens === 'content');
    assert.ok(noteC2.why.includes('Market Research'), 'C2 WHY mentions Market Research');

    // C3 is note-c3
    const noteC3 = state.savedNotes.find(n => n.id === 'note-c3');
    assert.ok(noteC3 && noteC3.lens === 'content');
    assert.ok(noteC3.why.includes('ระบบช่วยคัดกรองและตอบคำถาม'), 'C3 WHY mentions Responsible Automation');

    // P1 is note-b
    assert.ok(state.savedNotes.some(n => n.id === 'note-b' && n.lens === 'packaging'));

    // P2 is note-p2
    const noteP2 = state.savedNotes.find(n => n.id === 'note-p2');
    assert.ok(noteP2 && noteP2.lens === 'packaging');
    assert.ok(noteP2.why.includes('ภาพเปรียบเทียบซ้ายขวา'), 'P2 WHY mentions visual comparison');
  });

  test('T02-11: resetDemo() resets modifications back to clean initial seed data', () => {
    // Make disruptive modifications
    dispatch({
      type: 'ADD_SOURCE',
      payload: { id: 'dirty-source', title: 'Will be wiped' }
    });
    dispatch({
      type: 'CLEAR_REMIX_SELECTION'
    });

    assert.ok(getState().sources.some(s => s.id === 'dirty-source'));
    assert.strictEqual(getState().remixSelection.content.length, 0);

    // Call resetDemo()
    resetDemo();

    const cleanState = getState();
    assert.strictEqual(cleanState.sources.some(s => s.id === 'dirty-source'), false, 'Dirty source must be wiped');
    assert.ok(cleanState.remixSelection.content.includes('note-a'), 'Default remix selection restored');
    assert.ok(cleanState.remixSelection.packaging.includes('note-b'), 'Default remix selection restored');
  });

  test('T02-12: Human Save Gate lifecycle (DELETE_NOTE updates status and removes from remix)', () => {
    seed();

    // Initially Source B is Saved to Packaging
    assert.strictEqual(computeSourceStatus('source-b', getState().savedNotes), 'Saved to Packaging');
    assert.ok(getState().remixSelection.packaging.includes('note-b'));

    // Delete Note B
    dispatch({ type: 'DELETE_NOTE', payload: { id: 'note-b' } });

    const state = getState();
    assert.strictEqual(state.savedNotes.some(n => n.id === 'note-b'), false, 'Note B must be removed');
    assert.strictEqual(state.remixSelection.packaging.includes('note-b'), false, 'Note B must be evicted from basket');

    // Status of Source B in inbox must now be 'Analyzed · Not saved'
    const statusB = computeSourceStatus('source-b', state.savedNotes);
    assert.strictEqual(statusB, 'Analyzed · Not saved');
  });

  test('T02-13: Remix multi-ingredient toggling works flexibly (Content >= 1, Packaging >= 0)', () => {
    seed();

    // Toggle out note-a, add note-c2 and note-c3
    dispatch({ type: 'TOGGLE_REMIX_INGREDIENT', payload: { lens: 'content', noteId: 'note-a' } });
    dispatch({ type: 'TOGGLE_REMIX_INGREDIENT', payload: { lens: 'content', noteId: 'note-c2' } });
    dispatch({ type: 'TOGGLE_REMIX_INGREDIENT', payload: { lens: 'content', noteId: 'note-c3' } });

    // Packaging: remove note-b (Packaging = 0 is valid!)
    dispatch({ type: 'REMOVE_REMIX_INGREDIENT', payload: { lens: 'packaging', noteId: 'note-b' } });

    const state = getState();
    assert.deepStrictEqual(state.remixSelection.content, ['note-c2', 'note-c3']);
    assert.deepStrictEqual(state.remixSelection.packaging, []);
  });
});
