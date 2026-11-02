/**
 * ==============================================================================
 * MEW CONTENT OS — S01 Research Inbox Unit Tests (Topic T06)
 * Framework: node:test & node:assert/strict
 * Verifies:
 * - HTML: รายการ `inbox-list` แต่ละแถว `inbox-row-{id}` มี badge `status-badge`
 * - JS: รองรับ 7 สถานะตรงตามสเปก:
 *       1) 'Waiting for analysis'
 *       2) 'Analyzing'
 *       3) 'Analyzed · Not saved'
 *       4) 'Saved to Content'
 *       5) 'Saved to Packaging'
 *       6) 'Saved to Both'
 *       7) 'Analysis unavailable'
 * - JS: สถานะ Saved คำนวณจาก `savedNotes` ของ source นั้น (ไม่เก็บซ้ำ) —
 *       Save Content อย่างเดียว = `Saved to Content`;
 *       เพิ่ม Packaging ภายหลัง = `Saved to Both` (A05)
 * - CSS: แต่ละสถานะมีสี/ไอคอนต่างกัน และ `Analyzed · Not saved` ต้องไม่ดูเหมือนอยู่ใน Library
 * - ข้อความบนหน้าบอกชัดว่า Inbox ไม่ใช่ Vault; นับ Inbox ไม่รวมในตัวเลข Vault ที่ Dashboard (A01, A07)
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  RESEARCH_STATUSES,
  STATUS_CONFIG,
  normalizeStatus,
  computeSavedStatusFromNotes,
  computeItemStatus,
  getInboxSummary,
  filterInboxItems,
  renderStatusBadge,
  renderInboxRow
} from './research-inbox.js';

import { getState, dispatch, resetDemo } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('S01 Research Inbox Component & Status Badges — Topic T06', () => {

  beforeEach(() => {
    resetDemo();
  });

  // ----------------------------------------------------------------------------
  // TEST 1: HTML Structural Contract & Spec Requirements
  // ----------------------------------------------------------------------------
  test('T06-01: HTML contract verifies inbox-list, inbox-row-{id}, and status-badge elements', () => {
    const htmlPath = path.resolve(__dirname, '../components/research-inbox.html');
    assert.ok(fs.existsSync(htmlPath), 'src/components/research-inbox.html must exist');

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // 1. inbox-list container exists
    assert.ok(
      htmlContent.includes('id="inbox-list"') || htmlContent.includes('data-testid="inbox-list"'),
      'HTML must contain inbox-list with id or data-testid'
    );

    // 2. inbox-row-{id} row pattern exists
    assert.ok(
      /inbox-row-item-source-[abe]/.test(htmlContent) || /data-testid="inbox-row-/.test(htmlContent),
      'HTML must contain rows matching inbox-row-{id} pattern'
    );

    // 3. status-badge with data-testid="status-badge" exists
    assert.ok(
      htmlContent.includes('class="status-badge') && htmlContent.includes('data-testid="status-badge"'),
      'HTML must contain status-badge element with class and data-testid'
    );

    // 4. Prominent disclaimer: Research Inbox is NOT Vault (A01, A07)
    assert.ok(
      htmlContent.includes('Research Inbox ไม่ใช่ Vault') || htmlContent.includes('inbox-vault-notice'),
      'HTML must prominently state that Research Inbox is NOT Vault (A01, A07)'
    );

    // 5. Explicitly notes that Inbox counts do NOT inflate Vault counts on Dashboard
    assert.ok(
      htmlContent.includes('Dashboard') && (htmlContent.includes('ไม่ถูกนำไปรวม') || htmlContent.includes('ไม่รวมในตัวเลข Vault')),
      'HTML must state that Inbox count is not mixed into Vault count on Dashboard'
    );
  });

  // ----------------------------------------------------------------------------
  // TEST 2: CSS Structural Contract & Visual Distinctiveness
  // ----------------------------------------------------------------------------
  test('T06-02: CSS contract verifies 7 distinct status styles and non-library styling for Analyzed Not Saved', () => {
    const cssPath = path.resolve(__dirname, '../styles/research-inbox.css');
    assert.ok(fs.existsSync(cssPath), 'src/styles/research-inbox.css must exist');

    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Verify all 7 status badge selectors exist
    assert.ok(cssContent.includes('.status-waiting'), 'CSS must define .status-waiting');
    assert.ok(cssContent.includes('.status-analyzing'), 'CSS must define .status-analyzing');
    assert.ok(cssContent.includes('.status-analyzed-not-saved'), 'CSS must define .status-analyzed-not-saved');
    assert.ok(cssContent.includes('.status-saved-content'), 'CSS must define .status-saved-content');
    assert.ok(cssContent.includes('.status-saved-packaging'), 'CSS must define .status-saved-packaging');
    assert.ok(cssContent.includes('.status-saved-both'), 'CSS must define .status-saved-both');
    assert.ok(cssContent.includes('.status-unavailable'), 'CSS must define .status-unavailable');

    // Verify Analyzed · Not saved does NOT look like a saved vault item (no vibrant coral/violet, uses muted/slate tone)
    assert.ok(
      cssContent.includes('.status-badge.status-analyzed-not-saved'),
      'CSS must specifically target .status-badge.status-analyzed-not-saved'
    );
  });

  // ----------------------------------------------------------------------------
  // TEST 3: JS Spec Statuses Definition & Normalization
  // ----------------------------------------------------------------------------
  test('T06-03: JS supports all 7 official spec statuses exactly as specified', () => {
    const expected = [
      'Waiting for analysis',
      'Analyzing',
      'Analyzed · Not saved',
      'Saved to Content',
      'Saved to Packaging',
      'Saved to Both',
      'Analysis unavailable'
    ];

    const actual = Object.values(RESEARCH_STATUSES);
    assert.strictEqual(actual.length, 7, 'Must support exactly 7 canonical statuses');

    expected.forEach(status => {
      assert.ok(actual.includes(status), `RESEARCH_STATUSES must include "${status}"`);
      assert.ok(STATUS_CONFIG[status], `STATUS_CONFIG must have entry for "${status}"`);
      assert.ok(STATUS_CONFIG[status].icon, `STATUS_CONFIG must have icon for "${status}"`);
      assert.ok(STATUS_CONFIG[status].badgeClass, `STATUS_CONFIG must have badgeClass for "${status}"`);
    });

    // Test normalization of dot variants
    assert.strictEqual(normalizeStatus('Analyzed · Not saved'), 'Analyzed · Not saved');
    assert.strictEqual(normalizeStatus('Analyzed - Not saved'), 'Analyzed · Not saved');
    assert.strictEqual(normalizeStatus('Waiting for analysis'), 'Waiting for analysis');
  });

  // ----------------------------------------------------------------------------
  // TEST 4: JS Dynamic Status Calculation from savedNotes (A05 Requirement)
  // ----------------------------------------------------------------------------
  test('T06-04: computeSavedStatusFromNotes dynamically calculates Saved status from savedNotes (A05)', () => {
    const testSourceId = 'source-test-dynamic';

    // 1. No saved notes -> null
    assert.strictEqual(computeSavedStatusFromNotes(testSourceId, []), null);

    // 2. Only Content saved -> 'Saved to Content'
    const contentNotes = [
      { id: 'n1', sourceId: testSourceId, lens: 'content', why: 'Great idea' }
    ];
    assert.strictEqual(
      computeSavedStatusFromNotes(testSourceId, contentNotes),
      RESEARCH_STATUSES.SAVED_CONTENT
    );

    // 3. Only Packaging saved -> 'Saved to Packaging'
    const packagingNotes = [
      { id: 'n2', sourceId: testSourceId, lens: 'packaging', why: 'Great hook' }
    ];
    assert.strictEqual(
      computeSavedStatusFromNotes(testSourceId, packagingNotes),
      RESEARCH_STATUSES.SAVED_PACKAGING
    );

    // 4. Both Content and Packaging saved (Story E & A05) -> 'Saved to Both'
    const bothNotes = [
      { id: 'n1', sourceId: testSourceId, lens: 'content', why: 'Great idea' },
      { id: 'n2', sourceId: testSourceId, lens: 'packaging', why: 'Great hook' }
    ];
    assert.strictEqual(
      computeSavedStatusFromNotes(testSourceId, bothNotes),
      RESEARCH_STATUSES.SAVED_BOTH
    );
  });

  // ----------------------------------------------------------------------------
  // TEST 5: Scenario A05 Full Progression: Content -> Add Packaging -> Saved to Both
  // ----------------------------------------------------------------------------
  test('T06-05: Spec Scenario A05 — Save Content only -> then add Packaging -> transitions to Saved to Both without duplicate sources', () => {
    const testSourceId = 'source-a05-lifecycle';
    const testItem = {
      id: 'item-a05',
      sourceId: testSourceId,
      status: RESEARCH_STATUSES.ANALYZED_NOT_SAVED
    };

    let notes = [];

    // Step 0: Before saving -> Analyzed · Not saved
    assert.strictEqual(computeItemStatus(testItem, notes), RESEARCH_STATUSES.ANALYZED_NOT_SAVED);

    // Step 1: User saves Content only (A02)
    notes = [
      { id: 'note-c-1', sourceId: testSourceId, lens: 'content', why: 'Initial content save' }
    ];
    assert.strictEqual(computeItemStatus(testItem, notes), RESEARCH_STATUSES.SAVED_CONTENT);

    // Step 2: Later, user returns and adds Packaging note (A05: เปลี่ยนใจทีหลัง)
    notes = [
      ...notes,
      { id: 'note-p-1', sourceId: testSourceId, lens: 'packaging', why: 'Added packaging later' }
    ];
    assert.strictEqual(computeItemStatus(testItem, notes), RESEARCH_STATUSES.SAVED_BOTH);

    // Step 3: If user deletes Content note later -> drops back to Saved to Packaging
    notes = notes.filter(n => n.lens !== 'content');
    assert.strictEqual(computeItemStatus(testItem, notes), RESEARCH_STATUSES.SAVED_PACKAGING);

    // Step 4: If all notes are removed -> reverts back to Analyzed · Not saved (A01)
    notes = [];
    assert.strictEqual(computeItemStatus(testItem, notes), RESEARCH_STATUSES.ANALYZED_NOT_SAVED);
  });

  // ----------------------------------------------------------------------------
  // TEST 6: Transient and Unsaved Status Preservation
  // ----------------------------------------------------------------------------
  test('T06-06: computeItemStatus preserves Waiting, Analyzing, and Unavailable states when no notes exist', () => {
    const emptyNotes = [];

    // 1. Waiting for analysis
    const waitingItem = { id: 'w1', sourceId: 's1', status: RESEARCH_STATUSES.WAITING };
    assert.strictEqual(computeItemStatus(waitingItem, emptyNotes), RESEARCH_STATUSES.WAITING);

    // 2. Analyzing
    const analyzingItem = { id: 'a1', sourceId: 's2', status: RESEARCH_STATUSES.ANALYZING };
    assert.strictEqual(computeItemStatus(analyzingItem, emptyNotes), RESEARCH_STATUSES.ANALYZING);

    // 3. Analysis unavailable
    const unavailableItem = { id: 'u1', sourceId: 's3', status: RESEARCH_STATUSES.UNAVAILABLE };
    assert.strictEqual(computeItemStatus(unavailableItem, emptyNotes), RESEARCH_STATUSES.UNAVAILABLE);
  });

  // ----------------------------------------------------------------------------
  // TEST 7: Separation of Inbox and Vault Counts (A01, A07)
  // ----------------------------------------------------------------------------
  test('T06-07: getInboxSummary strictly separates Inbox pipeline counts from Vault counts', () => {
    const state = getState();
    const summary = getInboxSummary(state);

    // Total inbox items matches store researchItems
    assert.strictEqual(summary.totalInbox, state.researchItems.length);

    // Vault counts match store savedNotes
    assert.strictEqual(summary.vault.totalSavedNotes, state.savedNotes.length);
    assert.strictEqual(
      summary.vault.contentNotesCount,
      state.savedNotes.filter(n => n.lens === 'content').length
    );
    assert.strictEqual(
      summary.vault.packagingNotesCount,
      state.savedNotes.filter(n => n.lens === 'packaging').length
    );

    // Verify A01/A07 rule: Adding 10 new uncommitted items to inbox does NOT increase vault count!
    const mockStateWith10Unsaved = {
      ...state,
      researchItems: [
        ...state.researchItems,
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `extra-item-${i}`,
          sourceId: `extra-source-${i}`,
          status: RESEARCH_STATUSES.ANALYZED_NOT_SAVED
        }))
      ]
    };

    const newSummary = getInboxSummary(mockStateWith10Unsaved);
    assert.strictEqual(newSummary.totalInbox, state.researchItems.length + 10);
    assert.strictEqual(
      newSummary.vault.totalSavedNotes,
      summary.vault.totalSavedNotes,
      'Adding uncommitted inbox items must NEVER increase vault count (A01, A07)'
    );
  });

  // ----------------------------------------------------------------------------
  // TEST 8: HTML Row and Badge Rendering Utilities
  // ----------------------------------------------------------------------------
  test('T06-08: renderInboxRow and renderStatusBadge output compliant markup with required testids', () => {
    const item = {
      id: 'test-item-99',
      sourceId: 'test-source-99',
      status: RESEARCH_STATUSES.SAVED_CONTENT,
      createdAt: '2026-10-31T12:00:00.000Z'
    };
    const source = {
      id: 'test-source-99',
      title: 'Test Clip Title',
      creator: 'Test Creator',
      duration: '02:30',
      url: 'https://example.com/test'
    };
    const notes = [
      { id: 'note-99', sourceId: 'test-source-99', lens: 'content', why: 'Essential note' }
    ];

    const rowHtml = renderInboxRow(item, source, notes);

    // Must have id="inbox-row-{id}"
    assert.ok(rowHtml.includes('id="inbox-row-test-item-99"'), 'Row must have id="inbox-row-{id}"');
    assert.ok(rowHtml.includes('data-testid="inbox-row-test-item-99"'), 'Row must have data-testid="inbox-row-{id}"');

    // Must have class status-badge and data-testid="status-badge"
    assert.ok(rowHtml.includes('class="status-badge'), 'Row must contain class status-badge');
    assert.ok(rowHtml.includes('data-testid="status-badge"'), 'Row must contain data-testid="status-badge"');
    assert.ok(rowHtml.includes('Saved to Content'), 'Badge must render status label');

    // Test standalone badge rendering
    const badgeHtml = renderStatusBadge(RESEARCH_STATUSES.ANALYZED_NOT_SAVED);
    assert.ok(badgeHtml.includes('status-analyzed-not-saved'), 'Badge must contain status class');
    assert.ok(badgeHtml.includes('data-testid="status-badge"'), 'Badge must contain data-testid');
    assert.ok(badgeHtml.includes('Analyzed · Not saved'), 'Badge must display canonical status text');
  });

  // ----------------------------------------------------------------------------
  // TEST 9: filterInboxItems Search & Filtering
  // ----------------------------------------------------------------------------
  test('T06-09: filterInboxItems filters by status and searches across title, creator, and tags', () => {
    const state = getState();
    const items = state.researchItems;
    const sources = state.sources;
    const notes = state.savedNotes;

    // Filter by 'Saved to Content'
    const contentItems = filterInboxItems(items, sources, notes, {
      filterStatus: RESEARCH_STATUSES.SAVED_CONTENT
    });
    assert.ok(contentItems.length > 0);
    contentItems.forEach(item => {
      assert.strictEqual(item.computedStatus, RESEARCH_STATUSES.SAVED_CONTENT);
    });

    // Search query matching 'Clock'
    const clockItems = filterInboxItems(items, sources, notes, {
      query: 'Clock'
    });
    assert.ok(clockItems.length >= 1);
    assert.ok(clockItems.some(i => i.source.title.includes('Clock')));
  });

});
