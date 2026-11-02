/**
 * ==============================================================================
 * Test Suite: Topic T07 — URL Deduplication & Media States Controller
 * Pure Client-Side JavaScript · Node.js native test runner
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getState, dispatch } from './store.js';
import {
  normalizeUrl,
  isTrackingParam,
  findDuplicateSource,
  ingestUrlWithDedupe,
  createAnalysisVersion,
  getAnalysisVersions,
  markMediaUnavailable,
  markMediaPartial,
  TRACKING_PARAMS
} from './url-dedupe.js';

describe('Topic T07: URL Deduplication & Unavailable/Partial Media States', () => {

  beforeEach(() => {
    // Reset store to known baseline before each test
    dispatch({ type: 'RESET_DEMO' });
  });

  describe('1. normalizeUrl(url) and Tracking Parameter Removal', () => {
    test('T07-01: Removes UTM parameters and social trackers', () => {
      const dirtyUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=twitter&utm_medium=social&utm_campaign=launch&fbclid=IwAR234&si=xyz789';
      const cleanUrl = normalizeUrl(dirtyUrl);
      assert.strictEqual(cleanUrl, 'https://youtube.com/watch?v=dQw4w9WgXcQ');
    });

    test('T07-02: Strips URL fragments (#...) completely', () => {
      const urlWithHash = 'https://youtube.com/watch?v=dQw4w9WgXcQ#t=1m30s';
      const cleanUrl = normalizeUrl(urlWithHash);
      assert.strictEqual(cleanUrl, 'https://youtube.com/watch?v=dQw4w9WgXcQ');
    });

    test('T07-03: Canonicalizes youtu.be shortlinks to youtube.com/watch?v=', () => {
      const shortUrl = 'https://youtu.be/dQw4w9WgXcQ?si=abcdef123';
      const canonical = normalizeUrl(shortUrl);
      assert.strictEqual(canonical, 'https://youtube.com/watch?v=dQw4w9WgXcQ');
    });

    test('T07-04: Removes www prefix and strips default ports', () => {
      const url = 'http://www.tiktok.com:80/@user/video/123456789/';
      const clean = normalizeUrl(url);
      assert.strictEqual(clean, 'http://tiktok.com/@user/video/123456789');
    });

    test('T07-05: Alphabetizes query parameters for deterministic deduplication', () => {
      const url1 = 'https://example.com/video?b=2&a=1';
      const url2 = 'https://example.com/video?a=1&b=2';
      assert.strictEqual(normalizeUrl(url1), normalizeUrl(url2));
    });

    test('T07-06: Throws error on empty or invalid URL', () => {
      assert.throws(() => normalizeUrl(''), /URL_EMPTY/);
      assert.throws(() => normalizeUrl('   '), /URL_EMPTY/);
      assert.throws(() => normalizeUrl('not-a-valid-url'), /URL_MALFORMED/);
      assert.throws(() => normalizeUrl('ftp://ftp.example.com/video'), /INVALID_PROTOCOL/);
    });

    test('T07-07: isTrackingParam correctly identifies tracking query names', () => {
      assert.strictEqual(isTrackingParam('utm_campaign'), true);
      assert.strictEqual(isTrackingParam('UTM_SOURCE'), true);
      assert.strictEqual(isTrackingParam('fbclid'), true);
      assert.strictEqual(isTrackingParam('igshid'), true);
      assert.strictEqual(isTrackingParam('si'), true);
      assert.strictEqual(isTrackingParam('v'), false);
      assert.strictEqual(isTrackingParam('id'), false);
    });
  });

  describe('2. A16 Deduplication Check (No Duplicate Sources Created)', () => {
    test('T07-08: Ingesting duplicate URL opens existing source without creating new source', () => {
      const stateBefore = getState();
      const existingSourcesCount = stateBefore.sources.length;
      const existingSource = stateBefore.sources[0]; // e.g. source-a
      assert.ok(existingSource, 'At least one seed source should exist');

      // Add tracking parameters and different case to test normalization match
      const sep = existingSource.url.includes('?') ? '&' : '?';
      const duplicateUrl = `${existingSource.url}${sep}utm_source=email&utm_campaign=newsletter#timestamp`;
      
      const result = ingestUrlWithDedupe(duplicateUrl);

      assert.strictEqual(result.isDuplicate, true, 'Should detect URL as duplicate');
      assert.strictEqual(result.source.id, existingSource.id, 'Should return the existing source object');
      
      const stateAfter = getState();
      assert.strictEqual(stateAfter.sources.length, existingSourcesCount, 'Source count must NOT increase (A16)');
      assert.ok(result.bannerData, 'Must return bannerData for duplicate banner');
      assert.strictEqual(result.bannerData.isDuplicate, true);
    });

    test('T07-09: Ingesting a truly new URL creates a new source and researchItem', () => {
      const stateBefore = getState();
      const beforeCount = stateBefore.sources.length;

      const newUrl = 'https://youtube.com/watch?v=completelyNewVideo999';
      const result = ingestUrlWithDedupe(newUrl, { extraMeta: { title: 'New Unique Video' } });

      assert.strictEqual(result.isDuplicate, false);
      assert.ok(result.source.id);
      assert.strictEqual(result.source.title, 'New Unique Video');
      assert.strictEqual(result.researchItem.status, 'Waiting for analysis');

      const stateAfter = getState();
      assert.strictEqual(stateAfter.sources.length, beforeCount + 1);
    });
  });

  describe('3. Re-analysis Versioning (A16 Analysis Versioning)', () => {
    test('T07-10: Re-analyzing existing source creates a new version without deleting older versions', () => {
      const state = getState();
      const source = state.sources[0];

      // Initial versions for this source
      const initialVersions = (state.analyses || []).filter(a => a.sourceId === source.id);
      const initialCount = initialVersions.length;

      // Perform re-analysis
      const { newAnalysis, version, allVersions } = createAnalysisVersion(source.id, {
        content: { coreIdea: 'Updated v2 insights on content strategy' }
      });

      assert.strictEqual(version, initialCount + 1, 'Version should increment');
      assert.strictEqual(newAnalysis.sourceId, source.id);
      assert.strictEqual(newAnalysis.isReanalysis, true);

      // Verify all versions are preserved in store
      const updatedState = getState();
      const versionsAfter = updatedState.analyses.filter(a => a.sourceId === source.id);
      assert.strictEqual(versionsAfter.length, initialCount + 1, 'Older analysis versions must NOT be deleted');

      // Verify original version still exists
      if (initialCount > 0) {
        const original = versionsAfter.find(a => a.id === initialVersions[0].id);
        assert.ok(original, 'Original v1 analysis must still exist');
      }
    });

    test('T07-11: getAnalysisVersions returns versions sorted chronologically', () => {
      const state = getState();
      const source = state.sources[0];

      createAnalysisVersion(source.id);
      createAnalysisVersion(source.id);

      const sortedVersions = getAnalysisVersions(source.id);
      assert.ok(sortedVersions.length >= 2);
      for (let i = 0; i < sortedVersions.length - 1; i++) {
        assert.ok(Number(sortedVersions[i].version) <= Number(sortedVersions[i + 1].version));
      }
    });
  });

  describe('4. Unavailable & Partial Media States (A15 Honesty Protection)', () => {
    test('T07-12: markMediaUnavailable sets status to "Analysis unavailable" and forbids fake packaging', () => {
      const sourceId = 'source-test-unavailable';
      dispatch({
        type: 'ADD_SOURCE',
        payload: { id: sourceId, title: 'Private / Inaccessible Video', url: 'https://example.com/private' }
      });
      dispatch({
        type: 'ADD_RESEARCH_ITEM',
        payload: { id: `item-${sourceId}`, sourceId, status: 'Waiting for analysis' }
      });

      const res = markMediaUnavailable(sourceId, 'Video is private or restricted');
      assert.strictEqual(res.status, 'Analysis unavailable');
      assert.strictEqual(res.analysis.packaging.status, 'unavailable');
      assert.strictEqual(res.analysis.packaging.label, 'Analysis unavailable');
      assert.strictEqual(res.analysis.packaging.labelTh, 'วิเคราะห์ไม่ได้');
      assert.strictEqual(res.analysis.packaging.packagingBlocked, true);
      assert.strictEqual(res.analysis.packaging.hook, null, 'Must NOT generate fake hook');
      assert.strictEqual(res.analysis.packaging.pacing, null, 'Must NOT generate fake pacing');

      // Verify store updated researchItem
      const updatedItem = getState().researchItems.find(i => i.sourceId === sourceId);
      assert.strictEqual(updatedItem.status, 'Analysis unavailable');
    });

    test('T07-13: markMediaPartial separates Content from Packaging', () => {
      const sourceId = 'source-test-partial';
      const res = markMediaPartial(sourceId, {
        coreIdea: 'Extracted transcript core message'
      });

      assert.strictEqual(res.analysis.isPartial, true);
      assert.strictEqual(res.analysis.content.coreIdea, 'Extracted transcript core message');
      assert.strictEqual(res.analysis.packaging.status, 'unavailable');
      assert.strictEqual(res.analysis.packaging.labelTh, 'วิเคราะห์ไม่ได้');
      assert.strictEqual(res.analysis.packaging.hook, null);
    });
  });

  describe('5. Strict Negative Constraints', () => {
    test('T07-14: No fake or arbitrary statistics ("12 สัปดาห์", fake badges) in code or strings', () => {
      const codeString = JSON.stringify(TRACKING_PARAMS) + normalizeUrl.toString() + ingestUrlWithDedupe.toString();
      assert.strictEqual(codeString.includes('12 สัปดาห์'), false, 'Code must not contain arbitrary 12 สัปดาห์ stats');
      assert.strictEqual(codeString.includes('+12 สัปดาห์นี้'), false, 'Code must not contain arbitrary +12 สัปดาห์นี้ stats');
    });
  });

});
