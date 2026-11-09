/**
 * Unit Test: Founder Review & Pinpoint Fix Widget
 */
import test, { describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  FounderReviewWidget,
  SECTION_MAP,
  CLIENT_MODE_KEY,
  CLOUD_RELAY_TOPIC,
  CLOUD_RELAY_URL,
  buildSelectorForElement,
  extractBlockSnippet
} from './founder-review-widget.js';

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
    widget = new FounderReviewWidget({ storage: mockStorage, fetch: null });
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

  test('T-REV-07: Client Hand-off Mode enables, persists to storage, and unlocks via ?review=1', () => {
    assert.equal(widget.isClientMode(), false);

    widget.enableClientMode();
    assert.equal(widget.isClientMode(), true);
    assert.equal(mockStorage.getItem(CLIENT_MODE_KEY), '1');
    assert.ok(widget.lastToastMessage.includes('?review=1'));

    widget.disableClientMode();
    assert.equal(widget.isClientMode(), false);
    assert.equal(mockStorage.getItem(CLIENT_MODE_KEY), null);

    // Re-enable then test automatic unlock on init() when URL contains ?review=1
    widget.enableClientMode();
    assert.equal(widget.isClientMode(), true);

    const unlockedWidget = new FounderReviewWidget({
      storage: mockStorage,
      location: { search: '?review=1', hash: '' },
      fetch: null
    });
    unlockedWidget.init(null);
    assert.equal(unlockedWidget.isClientMode(), false);
    assert.equal(mockStorage.getItem(CLIENT_MODE_KEY), null);
  });

  test('T-REV-08: buildSelectorForElement and extractBlockSnippet accurately target specific UI blocks', () => {
    const byId = { id: 'keep-going-modal', tagName: 'DIV', textContent: 'Keep Going Modal Content' };
    assert.equal(buildSelectorForElement(byId), '#keep-going-modal');

    const byIdea = {
      tagName: 'ARTICLE',
      getAttribute(attr) {
        return attr === 'data-idea-id' ? 'idea-07' : null;
      },
      textContent: 'ไอเดียที่ 7: เล่าเรื่องเบื้องหลังการทำงานจริง'
    };
    assert.equal(buildSelectorForElement(byIdea), '[data-idea-id="idea-07"]');

    const byNav = {
      tagName: 'BUTTON',
      getAttribute(attr) {
        return attr === 'data-navigate' ? 'view-remix-workspace' : null;
      }
    };
    assert.equal(buildSelectorForElement(byNav), '[data-navigate="view-remix-workspace"]');

    const child1 = { tagName: 'DIV', className: 'summary-card founder-inspect-hover' };
    const child2 = { tagName: 'DIV', className: 'summary-card active-card' };
    const parent = { id: 'dashboard-grid', children: [child1, child2] };
    child1.parentElement = parent;
    child2.parentElement = parent;

    assert.equal(buildSelectorForElement(child2), '#dashboard-grid > div.summary-card.active-card:nth-of-type(2)');

    const longEl = {
      textContent: '   ข้อความยาวมากสำหรับการทดสอบการตัด Snippet ให้เหลือเพียงแปดสิบตัวอักษรแรกเท่านั้นเพื่อแสดงบนการ์ดรีวิวเฉพาะจุดของเจ้านาย   '
    };
    const snippet = extractBlockSnippet(longEl);
    assert.ok(snippet.length <= 80);
    assert.ok(snippet.startsWith('ข้อความยาวมาก'));
  });

  test('T-REV-09: SECTION_MAP includes keep-going-modal entry with its source files', () => {
    const kgEntry = SECTION_MAP.find(s => s.id === 'keep-going-modal');
    assert.ok(kgEntry, 'keep-going-modal should exist in SECTION_MAP');
    assert.equal(kgEntry.label, 'S00: Keep-Going Reminder & 20 Lifesaver Ideas Modal');
    assert.ok(kgEntry.file.includes('src/modules/keep-going-modal.js'));
    assert.ok(kgEntry.file.includes('src/styles/keep-going-modal.css'));
  });

  test('T-REV-10: Status updates (PENDING -> IN_PROGRESS -> RESOLVED) and history card status rendering', () => {
    const rev = widget.addReview({
      sectionId: 'keep-going-modal',
      selector: '[data-idea-id="idea-03"]',
      snippet: 'ไอเดียช่วยชีวิตข้อที่ 3',
      type: 'copy',
      comment: 'ปรับข้อความหัวข้อให้โดนใจกว่าเดิม'
    });

    assert.equal(rev.status, 'PENDING');
    let html = widget.renderHistoryList();
    assert.ok(html.includes('⏳ รอส่งลูกน้อง'));
    assert.ok(html.includes('[data-idea-id=&quot;idea-03&quot;]'));

    widget.updateReviewStatus(rev.id, 'IN_PROGRESS');
    html = widget.renderHistoryList();
    assert.ok(html.includes('⚡ ลูกน้อง Argon กำลังแก้โค้ด...'));

    widget.updateReviewStatus(rev.id, 'RESOLVED', {
      resolutionNote: 'ปรับหัวข้อไอเดียที่ 3 เรียบร้อยแล้ว'
    });
    html = widget.renderHistoryList();
    assert.ok(html.includes('✅ แก้เสร็จแล้ว'));
    assert.ok(html.includes('🔄 รีเฟรชหน้าเว็บดูผล'));
    assert.ok(html.includes('🔁 สั่งแก้ซ้ำ'));
    assert.ok(html.includes('ปรับหัวข้อไอเดียที่ 3 เรียบร้อยแล้ว'));
    assert.ok(widget.lastToastMessage.includes('ลูกน้อง Gemini 4 Argon แก้ไขจุด'));
  });

  test('T-REV-11: syncToServer and pollServerStatus transition review from PENDING to IN_PROGRESS and RESOLVED', async () => {
    let serverStatus = 'IN_PROGRESS';
    const mockFetch = async (url, opts) => {
      if (opts && opts.method === 'POST') {
        const body = JSON.parse(opts.body);
        return {
          ok: true,
          async json() {
            return {
              ok: true,
              review: { ...body, status: 'IN_PROGRESS', startedAt: '2026-11-09T07:00:00.000Z' }
            };
          }
        };
      }
      return {
        ok: true,
        async json() {
          return {
            ok: true,
            reviews: widgetWithServer.reviews.map(r => ({
              ...r,
              status: serverStatus,
              resolvedAt: serverStatus === 'RESOLVED' ? '2026-11-09T07:02:00.000Z' : undefined,
              resolutionNote: serverStatus === 'RESOLVED' ? 'แก้ไขสำเร็จ 100%' : undefined
            }))
          };
        }
      };
    };

    const widgetWithServer = new FounderReviewWidget({
      storage: mockStorage,
      fetch: mockFetch
    });

    const rev = widgetWithServer.addReview({
      sectionId: 'view-overview',
      targetName: 'การ์ดสรุปผลงาน',
      selector: '.summary-card',
      snippet: 'สรุปงานประจำวัน',
      type: 'design',
      comment: 'เพิ่มขอบสีทอง'
    });

    // Synchronously PENDING right after addReview
    assert.equal(rev.status, 'PENDING');

    // Wait for async syncToServer to complete
    await widgetWithServer.syncToServer(rev);
    assert.equal(widgetWithServer.reviews[0].status, 'IN_PROGRESS');

    // Now simulate server completing the Argon worker run
    serverStatus = 'RESOLVED';
    await widgetWithServer.pollServerStatus();
    widgetWithServer.stopPolling();

    assert.equal(widgetWithServer.reviews[0].status, 'RESOLVED');
    assert.equal(widgetWithServer.reviews[0].resolutionNote, 'แก้ไขสำเร็จ 100%');
    assert.ok(widgetWithServer.lastToastMessage.includes('การ์ดสรุปผลงาน'));
  });

  test('T-REV-12: Remote user without local server syncs and receives RESOLVED status via Cloud Relay (CLOUD_RELAY_URL)', async () => {
    assert.equal(CLOUD_RELAY_TOPIC, 'mew-content-os-pinpoint-v6');
    assert.equal(CLOUD_RELAY_URL, 'https://ntfy.sh/mew-content-os-pinpoint-v6');

    const postedRelayPayloads = [];
    let currentReviewId = null;

    const remoteMockFetch = async (url, opts) => {
      // Simulate remote user on different internet where local port 4545 /api/reviews is unreachable
      if (String(url).includes('/api/reviews')) {
        throw new Error('Failed to fetch: local port 4545 unreachable on remote internet');
      }

      if (url === CLOUD_RELAY_URL && opts && opts.method === 'POST') {
        const parsed = JSON.parse(opts.body);
        postedRelayPayloads.push(parsed);
        currentReviewId = parsed.review?.id || currentReviewId;
        return {
          ok: true,
          async text() {
            return JSON.stringify({ id: 'ntfy-msg-1', event: 'message', topic: CLOUD_RELAY_TOPIC });
          }
        };
      }

      if (url === `${CLOUD_RELAY_URL}/json?poll=1&since=30m`) {
        const ndjson = [
          JSON.stringify({ id: 'ntfy-keepalive', event: 'keepalive' }),
          JSON.stringify({
            id: 'ntfy-status-1',
            event: 'message',
            topic: CLOUD_RELAY_TOPIC,
            message: JSON.stringify({
              eventType: 'STATUS_UPDATE',
              review: {
                id: currentReviewId,
                status: 'IN_PROGRESS',
                startedAt: '2026-11-09T16:10:00.000Z'
              }
            })
          }),
          JSON.stringify({
            id: 'ntfy-status-2',
            event: 'message',
            topic: CLOUD_RELAY_TOPIC,
            message: JSON.stringify({
              eventType: 'STATUS_UPDATE',
              review: {
                id: currentReviewId,
                status: 'RESOLVED',
                resolvedAt: '2026-11-09T16:12:00.000Z',
                resolutionNote: 'แก้ไขผ่าน Cloud Relay และอัปเดต GitHub Pages เรียบร้อยแล้ว'
              }
            })
          })
        ].join('\n');

        return {
          ok: true,
          async text() {
            return ndjson;
          }
        };
      }

      throw new Error(`Unexpected URL: ${url}`);
    };

    const remoteWidget = new FounderReviewWidget({
      storage: mockStorage,
      fetch: remoteMockFetch
    });

    assert.equal(remoteWidget.cloudRelayUrl, CLOUD_RELAY_URL);

    const rev = remoteWidget.addReview({
      sectionId: 'view-overview',
      targetName: 'ปุ่มสั่งงานจากระยะไกล',
      selector: '#btn-remote-target',
      snippet: 'สั่งแก้ข้ามอินเทอร์เน็ต',
      type: 'design',
      comment: 'ปรับสีปุ่มให้เด่นขึ้นจากเครื่องที่กรุงเทพฯ'
    });
    currentReviewId = rev.id;

    // Wait for syncToServer fallback to Cloud Relay
    const synced = await remoteWidget.syncToServer(rev);
    assert.ok(synced);
    assert.equal(remoteWidget.reviews[0].status, 'IN_PROGRESS');
    assert.ok(postedRelayPayloads.some(p => p.eventType === 'NEW_REVIEW' && p.review.id === rev.id));

    // Poll status updates from Cloud Relay NDJSON stream
    await remoteWidget.pollServerStatus();
    remoteWidget.stopPolling();

    assert.equal(remoteWidget.reviews[0].status, 'RESOLVED');
    assert.equal(remoteWidget.reviews[0].resolvedAt, '2026-11-09T16:12:00.000Z');
    assert.equal(
      remoteWidget.reviews[0].resolutionNote,
      'แก้ไขผ่าน Cloud Relay และอัปเดต GitHub Pages เรียบร้อยแล้ว'
    );
    assert.ok(remoteWidget.lastToastMessage.includes('ปุ่มสั่งงานจากระยะไกล'));
  });

  test('T-REV-13: checkUrlUnlock, startPinpointInspector, openDrawer, and toggleDrawer auto-dismiss #onboarding-modal so review buttons are never blocked', () => {
    const obModal = { id: 'onboarding-modal', style: { display: 'flex' } };
    const drawer = {
      id: 'founder-review-drawer',
      classList: {
        _set: new Set(),
        add(c) { this._set.add(c); },
        remove(c) { this._set.delete(c); },
        contains(c) { return this._set.has(c); }
      },
      removeAttribute() {}
    };
    const host = {
      id: 'founder-review-widget-host',
      style: {
        position: '',
        zIndex: '',
        setProperty() {},
        removeProperty() {}
      },
      setAttribute() {},
      removeAttribute() {},
      classList: { add() {}, remove() {} },
      querySelector() { return null; }
    };

    const prevDoc = globalThis.document;
    globalThis.document = {
      body: {
        classList: { add() {}, remove() {} },
        appendChild() {}
      },
      createElement() { return host; },
      querySelectorAll() { return []; },
      getElementById(id) {
        if (id === 'onboarding-modal') return obModal;
        if (id === 'founder-review-drawer') return drawer;
        if (id === 'founder-review-widget-host') return host;
        return null;
      }
    };

    try {
      obModal.style.display = 'flex';
      widget.checkUrlUnlock({ search: '?review=1', hash: '' });
      assert.equal(obModal.style.display, 'none');

      obModal.style.display = 'flex';
      widget.startPinpointInspector();
      assert.equal(obModal.style.display, 'none');

      obModal.style.display = 'flex';
      widget.openDrawer('new');
      assert.equal(obModal.style.display, 'none');

      obModal.style.display = 'flex';
      widget.toggleDrawer();
      assert.equal(obModal.style.display, 'none');
    } finally {
      globalThis.document = prevDoc;
    }
  });
});
