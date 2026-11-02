/**
 * Unit Test: Founder Review & Pinpoint Fix Widget
 */
import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FounderReviewWidget, SECTION_MAP } from './founder-review-widget.js';

class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(k) {
    return this.store[k] || null;
  }
  setItem(k, v) {
    this.store[k] = String(v);
  }
  removeItem(k) {
    delete this.store[k];
  }
  clear() {
    this.store = {};
  }
}

describe('Topic: Founder Review & Pinpoint Fix Widget', () => {
  let mockStorage;
  let widget;

  beforeEach(() => {
    mockStorage = new MockStorage();
    widget = new FounderReviewWidget({ storage: mockStorage });
  });

  test('T-REV-01: Widget initializes cleanly with empty reviews', () => {
    assert.deepEqual(widget.reviews, []);
  });

  test('T-REV-02: SECTION_MAP covers all major modules S00 to S09', () => {
    assert.ok(SECTION_MAP.length >= 10);
    const hasOverview = SECTION_MAP.some(s => s.id === 'view-overview');
    const hasLibrary = SECTION_MAP.some(s => s.id === 'view-library');
    const hasRemix = SECTION_MAP.some(s => s.id === 'view-remix-workspace');
    assert.ok(hasOverview);
    assert.ok(hasLibrary);
    assert.ok(hasRemix);
  });

  test('T-REV-03: addReview blocks empty comments with clear validation error', () => {
    assert.throws(() => {
      widget.addReview({ sectionId: 'view-overview', comment: '   ' });
    }, /กรุณาระบุรายละเอียด/);
  });

  test('T-REV-04: addReview saves review to storage with PENDING status and target files', () => {
    const rev = widget.addReview({
      sectionId: 'view-overview',
      type: 'design',
      comment: 'ปรับสีการ์ดให้สว่างขึ้น'
    });

    assert.ok(rev.id.startsWith('rev-'));
    assert.equal(rev.sectionId, 'view-overview');
    assert.equal(rev.type, 'design');
    assert.equal(rev.status, 'PENDING');
    assert.ok(rev.relatedFiles.includes('src/components/dashboard.html'));

    // Check persistence
    const loaded = JSON.parse(mockStorage.getItem('mew_founder_reviews_v1'));
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].comment, 'ปรับสีการ์ดให้สว่างขึ้น');
  });

  test('T-REV-05: generateAIPrompt produces isolated prompt protecting other modules', () => {
    const rev = widget.addReview({
      sectionId: 'view-library',
      type: 'copy',
      comment: 'เปลี่ยนคำว่า Saved Notes เป็น คลังโน้ต'
    });

    const prompt = widget.generateAIPrompt(rev);
    assert.ok(prompt.includes('คำสั่งจาก Founder ให้ AI แก้ไขเฉพาะจุด'));
    assert.ok(prompt.includes('view-library'));
    assert.ok(prompt.includes('src/components/library.html'));
    assert.ok(prompt.includes('เปลี่ยนคำว่า Saved Notes เป็น คลังโน้ต'));
    assert.ok(prompt.includes('ห้ามแก้ไขโครงสร้างส่วนอื่น'));
  });

  test('T-REV-06: deleteReview removes item from memory and persistent storage', () => {
    const rev1 = widget.addReview({ sectionId: 'view-overview', comment: 'ข้อ 1' });
    const rev2 = widget.addReview({ sectionId: 'view-library', comment: 'ข้อ 2' });
    assert.equal(widget.reviews.length, 2);

    widget.deleteReview(rev1.id);
    assert.equal(widget.reviews.length, 1);
    assert.equal(widget.reviews[0].id, rev2.id);

    const stored = JSON.parse(mockStorage.getItem('mew_founder_reviews_v1'));
    assert.equal(stored.length, 1);
    assert.equal(stored[0].id, rev2.id);
  });
});
