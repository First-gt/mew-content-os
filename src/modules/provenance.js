/**
 * ==============================================================================
 * MEW CONTENT OS — Provenance Snapshot Controller (Topic T30)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

export class ProvenanceManager {
  /**
   * Creates an immutable, self-contained snapshot of references for a draft (Spec A19)
   * Captures why, source title, URL, lens, and version snapshot at save time.
   * @param {Array<Object>} references - List of references or notes to snapshot
   * @returns {Array<Object>} Deep copy of snapshot items
   */
  static createSnapshot(references = []) {
    if (!Array.isArray(references)) return [];

    return references.map(ref => {
      const refId = ref.refId || ref.id || ref.noteId || '';
      const sourceId = ref.sourceId || ref.id || refId;
      const title = ref.title || ref.sourceTitle || ref.name || 'Untitled Reference';
      const why = ref.founderWhy || ref.why || ref.borrowText || '';
      const sourceUrl = ref.sourceUrl || ref.url || ref.canonicalUrl || '';
      const lens = ref.vaultType || ref.lens || (Array.isArray(ref.lenses) && ref.lenses[0]) || 'content';
      const analysisVersion = ref.analysisVersionId || ref.analysisVersion || ref.version || 'v1.0';
      const snapshottedAt = ref.snapshottedAt || new Date().toISOString();

      return Object.freeze({
        refId,
        sourceId,
        title,
        why,
        sourceUrl,
        lens,
        analysisVersion,
        snapshottedAt
      });
    });
  }

  /**
   * Resolves a snapshot item against current active vault references.
   * If note was deleted from vault, resolves strictly from snapshot and sets isAvailable = false.
   * Guarantees that data is never silently wiped out (A19).
   * @param {Object} snapshotItem 
   * @param {Array<Object>} currentVaultReferences 
   * @returns {{ ref: Object, isAvailable: boolean, unavailableBadge: boolean }}
   */
  static resolveReference(snapshotItem, currentVaultReferences = []) {
    if (!snapshotItem) {
      return {
        ref: null,
        isAvailable: false,
        unavailableBadge: true
      };
    }

    const activeList = Array.isArray(currentVaultReferences) ? currentVaultReferences : [];
    
    // Look up note in active vault by refId, sourceId, or id
    const foundInVault = activeList.find(r => 
      (r && r.id && (r.id === snapshotItem.refId || r.id === snapshotItem.sourceId)) ||
      (r && r.sourceId && (r.sourceId === snapshotItem.sourceId || r.sourceId === snapshotItem.refId))
    );

    if (foundInVault) {
      return {
        ref: {
          ...foundInVault,
          id: foundInVault.id || snapshotItem.refId,
          sourceId: foundInVault.sourceId || snapshotItem.sourceId,
          title: foundInVault.title || snapshotItem.title,
          founderWhy: foundInVault.founderWhy || foundInVault.why || snapshotItem.why,
          why: foundInVault.founderWhy || foundInVault.why || snapshotItem.why,
          sourceUrl: foundInVault.sourceUrl || snapshotItem.sourceUrl,
          lens: foundInVault.vaultType || foundInVault.lens || snapshotItem.lens,
          analysisVersion: foundInVault.analysisVersionId || foundInVault.version || snapshotItem.analysisVersion,
          snapshottedAt: snapshotItem.snapshottedAt
        },
        isAvailable: true,
        unavailableBadge: false
      };
    }

    // Source note was deleted from vault: restore strictly and completely from snapshot!
    return {
      ref: {
        id: snapshotItem.refId,
        sourceId: snapshotItem.sourceId,
        title: snapshotItem.title,
        founderWhy: snapshotItem.why,
        why: snapshotItem.why,
        sourceUrl: snapshotItem.sourceUrl,
        lens: snapshotItem.lens,
        analysisVersion: snapshotItem.analysisVersion,
        snapshottedAt: snapshotItem.snapshottedAt
      },
      isAvailable: false,
      unavailableBadge: true
    };
  }

  /**
   * Resolves all items for a draft's source trace.
   * Guarantees a non-empty trace even if all vault items were deleted.
   * @param {Array<Object>} draftSnapshots 
   * @param {Array<Object>} currentVaultReferences 
   * @returns {Array<Object>}
   */
  static resolveDraftTrace(draftSnapshots = [], currentVaultReferences = []) {
    if (!Array.isArray(draftSnapshots)) return [];

    return draftSnapshots.map(snap => {
      const resolved = this.resolveReference(snap, currentVaultReferences);
      return {
        ...resolved.ref,
        refId: snap.refId || resolved.ref?.id,
        isAvailable: resolved.isAvailable,
        unavailableBadge: resolved.unavailableBadge
      };
    });
  }

  /**
   * Attaches immutable reference snapshots to a Remix Draft when saving.
   * Stores complete metadata so the draft is immune to future note deletions.
   * @param {Object} draft - Draft object to decorate
   * @param {Array<Object>} references - References used in this remix
   * @returns {Object} Draft with snapshots attached
   */
  static attachSnapshotToDraft(draft = {}, references = []) {
    const snapshots = this.createSnapshot(references);
    return {
      ...draft,
      referencesSnapshot: snapshots,
      sourceTrace: snapshots,
      snapshotCapturedAt: new Date().toISOString()
    };
  }

  /**
   * Safely opens a draft and guarantees its source trace is never empty
   * even when referenced notes have been deleted from the vault (DoD Requirement).
   * @param {Object} draft 
   * @param {Array<Object>} currentVaultReferences 
   * @returns {{ draft: Object, resolvedTrace: Array<Object>, hasUnavailableSources: boolean }}
   */
  static openDraft(draft = {}, currentVaultReferences = []) {
    if (!draft) return { draft: null, resolvedTrace: [], hasUnavailableSources: false };

    // Retrieve snapshots from referencesSnapshot or sourceTrace
    const snapshots = (Array.isArray(draft.referencesSnapshot) && draft.referencesSnapshot.length > 0)
      ? draft.referencesSnapshot
      : (Array.isArray(draft.sourceTrace) && draft.sourceTrace.length > 0)
        ? draft.sourceTrace
        : (Array.isArray(draft.references) ? this.createSnapshot(draft.references) : []);

    const resolvedTrace = this.resolveDraftTrace(snapshots, currentVaultReferences);
    const hasUnavailableSources = resolvedTrace.some(item => !item.isAvailable);

    const safeDraft = {
      ...draft,
      sourceTrace: resolvedTrace,
      referencesSnapshot: snapshots,
      hasUnavailableSources
    };

    return {
      draft: safeDraft,
      resolvedTrace,
      hasUnavailableSources
    };
  }

  /**
   * Helper to create the unavailable badge DOM element
   * @param {Object} options
   * @returns {HTMLElement}
   */
  static createUnavailableBadgeElement(options = {}) {
    if (typeof document === 'undefined') return null;

    const wrap = document.createElement('div');
    wrap.className = 'provenance-badge-wrap';
    wrap.id = options.id || 'badge-source-unavailable';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-label', 'ต้นทางถูกนำออกจากคลังแล้ว');

    wrap.innerHTML = `
      <span class="provenance-badge badge-source-unavailable font-bold">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
        <span class="badge-text">${options.text || 'ต้นทางถูกนำออกจากคลังแล้ว (แสดงข้อมูลผ่าน Provenance Snapshot)'}</span>
      </span>
    `;

    return wrap;
  }

  /**
   * Renders resolved trace items into a container (.c-source-trace),
   * displaying the badge-source-unavailable when a source is deleted.
   * @param {HTMLElement} containerEl - Container element
   * @param {Array<Object>} resolvedTrace - List of resolved trace objects
   * @param {Object} [options]
   */
  static renderSourceTrace(containerEl, resolvedTrace = [], options = {}) {
    if (!containerEl || typeof document === 'undefined') return;

    containerEl.innerHTML = '';
    let localCCount = 0;
    let localPCount = 0;

    resolvedTrace.forEach((item, index) => {
      const isContent = item.lens === 'content';
      if (isContent) localCCount++;
      else localPCount++;

      const prefix = isContent ? `C${localCCount}` : `P${localPCount}`;
      const pillClass = isContent ? 'content' : 'packaging';
      const isUnavailable = !item.isAvailable || item.unavailableBadge;

      const itemEl = document.createElement('div');
      itemEl.className = `source-trace-item ${isUnavailable ? 'is-source-deleted' : ''}`;
      itemEl.setAttribute('data-ref-id', item.refId || item.id || `trace-${index}`);

      const unavailableBadgeHtml = isUnavailable
        ? `<span class="badge-source-unavailable-tag badge-source-unavailable font-num" role="status" aria-label="ต้นทางไม่อยู่ในคลัง">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
            <span>ต้นทางไม่อยู่ในคลัง</span>
          </span>`
        : '';

      const sourceLinkHtml = item.sourceUrl
        ? `<a href="${item.sourceUrl}" class="trace-link font-num" target="_blank" rel="noopener noreferrer" aria-label="ดูที่มา ${item.title}">
            ดูที่มา &rarr;
          </a>`
        : `<span class="trace-link font-num">Snapshot</span>`;

      itemEl.innerHTML = `
        <div class="source-trace-left">
          <span class="source-trace-pill ${pillClass}">
            ${prefix} (${isContent ? 'Source Content' : 'Transferable Packaging'})
          </span>
          <span class="source-trace-desc">${item.title || 'Untitled Reference'}</span>
          ${unavailableBadgeHtml}
        </div>
        ${sourceLinkHtml}
      `;

      containerEl.appendChild(itemEl);
    });

    if (options.originalContribution) {
      const valEl = document.createElement('div');
      valEl.className = 'source-trace-item';
      valEl.innerHTML = `
        <div class="source-trace-left">
          <span class="source-trace-pill original-value">New Original Value</span>
          <span class="source-trace-desc">${options.originalContribution}</span>
        </div>
        <span class="trace-link font-num">Founder POV</span>
      `;
      containerEl.appendChild(valEl);
    }
  }
}
