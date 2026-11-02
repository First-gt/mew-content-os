/**
 * ==============================================================================
 * MEW CONTENT OS — Analysis Versions & Re-analysis Controller (Topic T11)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Theme: mewteetawat.com V6.3
 * 
 * Definition of Done (DOD):
 * - HTML: ปุ่ม `btn-analyze-again` และตัวเลือก `select-analysis-version`
 * - JS: กด analyze ซ้ำ → เพิ่ม `analyses[]` version ใหม่ (`v2`, `v3`…) ตั้งเป็น current; version เก่ายังดูได้
 * - JS: ห้าม แก้/ลบ `savedNotes` ใด ๆ ของ source เดียวกัน (test: save → analyze again → savedNotes จำนวนและ why เท่าเดิม)
 * - CSS: version ปัจจุบันมี badge `current`
 * - SavedNote เก็บ `analysisVersionId` ที่ใช้ตอน save เพื่อแสดง snapshot ใน S05
 * 
 * STRICT NEGATIVE CONSTRAINT:
 * Absolutely NO fake or arbitrary statistics or fake percentage badges.
 * ==============================================================================
 */

import { getState, dispatch, subscribe } from './store.js';

/**
 * Tracks the actively selected analysis version ID per sourceId in client memory.
 * Map<sourceId, analysisVersionId>
 */
const activeVersionMap = new Map();

/**
 * Safely escapes HTML strings to prevent XSS.
 * @param {*} value 
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats ISO date string into human readable Thai date format.
 * @param {string} isoString 
 * @returns {string}
 */
export function formatVersionDate(isoString) {
  if (!isoString) return 'ไม่ทราบเวลา';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'ไม่ทราบเวลา';
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return 'ไม่ทราบเวลา';
  }
}

/**
 * Retrieves all analysis versions belonging to a given sourceId, sorted chronologically.
 * 
 * @param {string} sourceId 
 * @returns {Array<object>}
 */
export function getAnalysisVersions(sourceId) {
  if (!sourceId) return [];
  const state = typeof getState === 'function' ? getState() : {};
  const analyses = (state.analyses || []).filter(a => a.sourceId === sourceId);

  return analyses.sort((a, b) => {
    const vA = Number(a.version) || 1;
    const vB = Number(b.version) || 1;
    if (vA !== vB) return vA - vB;
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    return tA - tB;
  });
}

/**
 * Retrieves the currently selected (or newest fallback) analysis version for a source.
 * 
 * @param {string} sourceId 
 * @returns {object|null}
 */
export function getCurrentAnalysis(sourceId) {
  if (!sourceId) return null;
  const versions = getAnalysisVersions(sourceId);
  if (versions.length === 0) return null;

  const activeId = activeVersionMap.get(sourceId);
  if (activeId) {
    const found = versions.find(v => v.id === activeId);
    if (found) return found;
  }

  // Fallback: return the highest version
  const latest = versions[versions.length - 1];
  activeVersionMap.set(sourceId, latest.id);
  return latest;
}

/**
 * Sets the active analysis version for a source in the UI session.
 * 
 * @param {string} sourceId 
 * @param {string} versionId 
 * @returns {object|null} The resolved active analysis version
 */
export function setCurrentAnalysisVersion(sourceId, versionId) {
  if (!sourceId || !versionId) return null;
  const versions = getAnalysisVersions(sourceId);
  const target = versions.find(v => v.id === versionId);
  if (target) {
    activeVersionMap.set(sourceId, target.id);

    // Notify listeners via custom event in browser environment
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('mew:analysis-version-switched', {
        bubbles: true,
        detail: {
          sourceId,
          versionId: target.id,
          version: target.version,
          analysis: target
        }
      }));
    }
    return target;
  }
  return null;
}

/**
 * Re-analyzes an existing source by creating a NEW analysis version (v2, v3, …),
 * sets it as current, while strictly preserving all older versions and existing savedNotes.
 * 
 * CRITICAL DIRECTIVE & GUARANTEE:
 * 1. Appends new `analyses[]` object with incremented version number.
 * 2. Sets the new version as current.
 * 3. ห้าม แก้ไข หรือ ลบ `savedNotes` ใด ๆ ของ source เดียวกัน!
 *    (บันทึกเหตุผล WHY ทั้งหมดต้องคงอยู่ครบถ้วน)
 * 
 * @param {string} sourceId 
 * @param {object} [customOverrides={}] Optional content/packaging modifications
 * @returns {{ newAnalysis: object, version: number, allVersions: Array<object>, savedNotesPreserved: boolean }}
 */
export function reanalyzeSource(sourceId, customOverrides = {}) {
  if (!sourceId) {
    throw new Error('sourceId is required for re-analyzing');
  }

  const state = typeof getState === 'function' ? getState() : { analyses: [], savedNotes: [] };

  // 1. Snapshot existing savedNotes before re-analysis for integrity audit
  const savedNotesBefore = (state.savedNotes || []).filter(n => n.sourceId === sourceId);
  const savedNotesBeforeMap = new Map(savedNotesBefore.map(n => [n.id, { ...n }]));

  // 2. Determine existing versions and calculate next increment
  const existingVersions = getAnalysisVersions(sourceId);
  const maxVersion = existingVersions.reduce((max, a) => {
    const v = Number(a.version) || 1;
    return v > max ? v : max;
  }, 0);

  const nextVersion = maxVersion + 1;
  const newAnalysisId = `analysis-${sourceId}-v${nextVersion}`;

  // Find previous analysis to inherit baseline content structure
  const previousAnalysis = existingVersions.length > 0
    ? existingVersions[existingVersions.length - 1]
    : null;

  // 3. Construct new analysis object
  const newAnalysis = {
    id: newAnalysisId,
    sourceId: sourceId,
    version: nextVersion,
    createdAt: new Date().toISOString(),
    isReanalysis: true,
    previousVersionId: previousAnalysis?.id || null,
    content: customOverrides.content || {
      coreIdea: customOverrides.coreIdea || `Re-analysis (v${nextVersion}) of ${sourceId}: สังเคราะห์สาระสำคัญเพิ่มเติม`,
      audience: previousAnalysis?.content?.audience || 'General Audience',
      keyPoints: [
        ...(previousAnalysis?.content?.keyPoints || []),
        `มุมมองใหม่จากการวิเคราะห์ซ้ำเวอร์ชัน ${nextVersion}`
      ],
      claimsAndEvidence: previousAnalysis?.content?.claimsAndEvidence ? [...previousAnalysis.content.claimsAndEvidence] : [],
      examples: previousAnalysis?.content?.examples ? [...previousAnalysis.content.examples] : [],
      extendableAngles: previousAnalysis?.content?.extendableAngles ? [...previousAnalysis.content.extendableAngles] : [],
      whatIsGood: customOverrides.whatIsGood || previousAnalysis?.content?.whatIsGood || 'สาระสำคัญที่คมชัดยิ่งขึ้นจากการวิเคราะห์ซ้ำ'
    },
    packaging: customOverrides.packaging || {
      hook: customOverrides.hook || previousAnalysis?.packaging?.hook || `Hook structure (v${nextVersion})`,
      openingPattern: previousAnalysis?.packaging?.openingPattern || 'Talking Head',
      beats: previousAnalysis?.packaging?.beats || ['Hook', 'Body', 'Call to Action'],
      pacing: previousAnalysis?.packaging?.pacing || 'ปานกลาง',
      musicSfx: previousAnalysis?.packaging?.musicSfx || 'Background Lo-fi',
      editingMechanics: previousAnalysis?.packaging?.editingMechanics || 'Clean jump cuts',
      timestampHighlights: previousAnalysis?.packaging?.timestampHighlights ? [...previousAnalysis.packaging.timestampHighlights] : [],
      whatIsGood: previousAnalysis?.packaging?.whatIsGood || 'เทคนิคการดำเนินเรื่อง'
    }
  };

  // 4. Dispatch new analysis to store
  if (typeof dispatch === 'function') {
    dispatch({
      type: 'ADD_ANALYSIS',
      payload: newAnalysis
    });
  }

  // 5. Set new version as current active in UI session
  activeVersionMap.set(sourceId, newAnalysisId);

  // 6. STRICT INTEGRITY AUDIT:
  // Ensure that savedNotes for this source were NOT modified or deleted
  const stateAfter = typeof getState === 'function' ? getState() : { savedNotes: [] };
  const savedNotesAfter = (stateAfter.savedNotes || []).filter(n => n.sourceId === sourceId);

  if (savedNotesAfter.length !== savedNotesBefore.length) {
    throw new Error(`INTEGRITY VIOLATION: savedNotes count changed from ${savedNotesBefore.length} to ${savedNotesAfter.length} after re-analysis!`);
  }

  for (const note of savedNotesAfter) {
    const original = savedNotesBeforeMap.get(note.id);
    if (!original) {
      throw new Error(`INTEGRITY VIOLATION: SavedNote id=${note.id} was corrupted or replaced!`);
    }
    if (original.why !== note.why) {
      throw new Error(`INTEGRITY VIOLATION: SavedNote id=${note.id} founder WHY was altered! Expected "${original.why}", got "${note.why}"`);
    }
  }

  // 7. Dispatch event for UI reactivity
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('mew:analysis-reanalyzed', {
      bubbles: true,
      detail: {
        sourceId,
        newAnalysis,
        version: nextVersion,
        activeVersionId: newAnalysisId
      }
    }));
  }

  const allVersions = getAnalysisVersions(sourceId);

  return {
    newAnalysis,
    version: nextVersion,
    allVersions,
    savedNotesPreserved: true
  };
}

/**
 * Saves a human note (Save Gate) explicitly attaching the `analysisVersionId`
 * that was active at the moment of saving. This guarantees a locked snapshot in S05.
 * 
 * @param {object} notePayload
 * @param {string} notePayload.sourceId 
 * @param {'content'|'packaging'} notePayload.lens 
 * @param {string} notePayload.why Founder's genuine rationale
 * @param {Array<string>} [notePayload.tags=[]]
 * @param {string} [notePayload.analysisVersionId] Explicit version ID (or auto-resolved)
 * @returns {object} The created note object
 */
export function saveNoteWithVersion(notePayload) {
  if (!notePayload || !notePayload.sourceId || !notePayload.lens || !notePayload.why) {
    throw new Error('sourceId, lens, and why are required to save a note');
  }

  // Resolve active version ID if not provided
  let versionId = notePayload.analysisVersionId;
  if (!versionId) {
    const current = getCurrentAnalysis(notePayload.sourceId);
    versionId = current?.id || `analysis-${notePayload.sourceId}-v1`;
  }

  const newNote = {
    id: notePayload.id || `note-${notePayload.lens}-${Date.now()}`,
    sourceId: notePayload.sourceId,
    lens: notePayload.lens,
    why: notePayload.why,
    tags: notePayload.tags || [],
    analysisVersionId: versionId, // Captured Snapshot ID for S05
    createdAt: notePayload.createdAt || new Date().toISOString()
  };

  if (typeof dispatch === 'function') {
    dispatch({
      type: 'SAVE_NOTE',
      payload: newNote
    });
  }

  return newNote;
}

/**
 * Resolves the locked analysis snapshot for a saved note (used in S05 Reference Detail Drawer).
 * If the saved note references an older version, that exact older version is returned,
 * preserving the founder's original context.
 * 
 * @param {string|object} noteOrNoteId Saved note object or note ID
 * @returns {{ note: object, analysis: object|null, isHistoricalSnapshot: boolean }}
 */
export function getSavedNoteSnapshot(noteOrNoteId) {
  const state = typeof getState === 'function' ? getState() : { savedNotes: [], analyses: [] };
  
  let note = null;
  if (typeof noteOrNoteId === 'string') {
    note = (state.savedNotes || []).find(n => n.id === noteOrNoteId);
  } else if (noteOrNoteId && typeof noteOrNoteId === 'object') {
    note = noteOrNoteId;
  }

  if (!note) {
    return { note: null, analysis: null, isHistoricalSnapshot: false };
  }

  const allAnalyses = state.analyses || [];
  let matchingAnalysis = null;

  // 1. Try matching by exact analysisVersionId
  if (note.analysisVersionId) {
    matchingAnalysis = allAnalyses.find(a => a.id === note.analysisVersionId);
  }

  // 2. Fallback: match by sourceId and first version
  if (!matchingAnalysis && note.sourceId) {
    const sourceAnalyses = allAnalyses.filter(a => a.sourceId === note.sourceId);
    matchingAnalysis = sourceAnalyses[0] || null;
  }

  // Determine if this snapshot is older than the latest active version
  const currentActive = getCurrentAnalysis(note.sourceId);
  const isHistoricalSnapshot = Boolean(
    matchingAnalysis && currentActive && matchingAnalysis.id !== currentActive.id
  );

  return {
    note,
    analysis: matchingAnalysis,
    isHistoricalSnapshot
  };
}

/**
 * Renders HTML `<option>` items for the `select-analysis-version` dropdown element.
 * 
 * @param {HTMLSelectElement} selectEl 
 * @param {string} sourceId 
 * @param {string} [currentActiveId]
 */
export function populateVersionSelect(selectEl, sourceId, currentActiveId = null) {
  if (!selectEl || !sourceId) return;

  const versions = getAnalysisVersions(sourceId);
  const activeId = currentActiveId || activeVersionMap.get(sourceId) || versions[versions.length - 1]?.id;

  if (versions.length === 0) {
    selectEl.innerHTML = '<option value="">ไม่มีเวอร์ชันการวิเคราะห์</option>';
    return;
  }

  selectEl.innerHTML = versions.map((v) => {
    const isCurrent = v.id === activeId;
    const versionLabel = `v${v.version || 1}.0`;
    const titleLabel = v.version === 1 ? 'Initial Analysis' : `Re-analysis (v${v.version})`;
    const currentTag = isCurrent ? ' (Current)' : '';
    const selectedAttr = isCurrent ? ' selected' : '';
    return `<option value="${escapeHtml(v.id)}"${selectedAttr}>${escapeHtml(`${versionLabel} · ${titleLabel}${currentTag}`)}</option>`;
  }).join('');
}

/**
 * Renders the version history list items with the `.current` badge on the active version.
 * 
 * @param {HTMLElement} listContainerEl 
 * @param {string} sourceId 
 * @param {string} [currentActiveId]
 */
export function renderVersionHistoryList(listContainerEl, sourceId, currentActiveId = null) {
  if (!listContainerEl || !sourceId) return;

  const state = typeof getState === 'function' ? getState() : { savedNotes: [] };
  const versions = getAnalysisVersions(sourceId);
  const activeId = currentActiveId || activeVersionMap.get(sourceId) || versions[versions.length - 1]?.id;
  const savedNotes = (state.savedNotes || []).filter(n => n.sourceId === sourceId);

  listContainerEl.innerHTML = versions.map(v => {
    const isCurrent = v.id === activeId;
    const versionNum = v.version || 1;
    const versionTitle = versionNum === 1 ? 'Initial Analysis' : `Re-analysis v${versionNum}`;
    const dateFormatted = formatVersionDate(v.createdAt);
    
    // Check how many saved notes reference this version snapshot
    const linkedNotes = savedNotes.filter(n => n.analysisVersionId === v.id);
    const linkedText = linkedNotes.length > 0 
      ? `ผูกกับ ${linkedNotes.length} บันทึก (Snapshot Lock)` 
      : 'ยังไม่มีบันทึกที่ผูกกับเวอร์ชันนี้';

    return `
      <li 
        class="version-history-item ${isCurrent ? 'is-active' : ''}" 
        data-version-id="${escapeHtml(v.id)}"
        role="button"
        tabindex="0"
        aria-current="${isCurrent ? 'true' : 'false'}"
      >
        <div class="item-version-marker font-num">v${versionNum}</div>
        <div class="item-version-content">
          <div class="item-version-title-row">
            <strong class="item-version-name">${escapeHtml(versionTitle)}</strong>
            ${isCurrent ? '<span class="badge-version current" data-testid="item-current-badge">current</span>' : ''}
          </div>
          <div class="item-version-meta">
            <span class="item-version-time font-num">${escapeHtml(dateFormatted)}</span>
            <span class="item-version-snapshots font-num">${escapeHtml(linkedText)}</span>
          </div>
        </div>
      </li>
    `;
  }).join('');
}

/**
 * ==============================================================================
 * AnalysisVersionsController
 * Handles DOM event delegation, version switching, re-analyzing, and UI synchronization.
 * ==============================================================================
 */
export class AnalysisVersionsController {
  /**
   * @param {object} [options={}]
   * @param {HTMLElement|string} [options.container]
   * @param {string} [options.sourceId]
   */
  constructor(options = {}) {
    this.root = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : (options.container || document.getElementById('analysis-versions-container'));

    this.sourceId = options.sourceId || null;
    this.unsubscribeStore = null;

    if (this.root) {
      this.cacheDom();
      this.bindEvents();
      if (this.sourceId) {
        this.render();
      }
    }
  }

  /**
   * Caches internal DOM elements
   */
  cacheDom() {
    if (!this.root) return;

    this.dom = {
      btnAnalyzeAgain: this.root.querySelector('#btn-analyze-again, [data-testid="btn-analyze-again"]'),
      selectVersion: this.root.querySelector('#select-analysis-version, [data-testid="select-analysis-version"]'),
      badgeCurrent: this.root.querySelector('#badge-version-current, [data-testid="badge-version-current"]'),
      badgeLabel: this.root.querySelector('#badge-version-label'),
      versionCountBadge: this.root.querySelector('#version-count-badge'),
      historyList: this.root.querySelector('#version-history-list, [data-testid="version-history-list"]'),
      s05Panel: this.root.querySelector('#s05-snapshot-panel, [data-testid="s05-snapshot-panel"]'),
      snapshotTag: this.root.querySelector('#snapshot-version-tag'),
      snapshotAnalysisId: this.root.querySelector('#snapshot-analysis-id')
    };
  }

  /**
   * Attaches event listeners
   */
  bindEvents() {
    // 1. Re-analyze button click
    this.dom?.btnAnalyzeAgain?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleAnalyzeAgain();
    });

    // 2. Version select change
    this.dom?.selectVersion?.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (selectedId && this.sourceId) {
        this.switchVersion(selectedId);
      }
    });

    // 3. History list item click
    this.dom?.historyList?.addEventListener('click', (e) => {
      const item = e.target.closest('.version-history-item');
      if (item) {
        const versionId = item.getAttribute('data-version-id');
        if (versionId && this.sourceId) {
          this.switchVersion(versionId);
        }
      }
    });

    // 4. Keyboard support on history list items
    this.dom?.historyList?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.version-history-item');
        if (item) {
          e.preventDefault();
          const versionId = item.getAttribute('data-version-id');
          if (versionId && this.sourceId) {
            this.switchVersion(versionId);
          }
        }
      }
    });

    // 5. Store subscription for real-time reactivity
    if (typeof subscribe === 'function') {
      this.unsubscribeStore = subscribe(() => {
        if (this.sourceId) {
          this.render();
        }
      });
    }
  }

  /**
   * Sets the active source ID and re-renders
   * @param {string} sourceId 
   */
  setSource(sourceId) {
    this.sourceId = sourceId;
    this.render();
  }

  /**
   * Handles user clicking Analyze Again
   */
  handleAnalyzeAgain() {
    if (!this.sourceId) return;

    // Trigger visual pulse / spin animation
    if (this.dom?.btnAnalyzeAgain) {
      this.dom.btnAnalyzeAgain.classList.add('is-analyzing');
    }

    try {
      const result = reanalyzeSource(this.sourceId);
      this.render();

      // Clear animation
      setTimeout(() => {
        if (this.dom?.btnAnalyzeAgain) {
          this.dom.btnAnalyzeAgain.classList.remove('is-analyzing');
        }
      }, 350);

      return result;
    } catch (err) {
      console.error('[AnalysisVersionsController] Re-analysis failed:', err);
      if (this.dom?.btnAnalyzeAgain) {
        this.dom.btnAnalyzeAgain.classList.remove('is-analyzing');
      }
    }
  }

  /**
   * Switches the active version in UI
   * @param {string} versionId 
   */
  switchVersion(versionId) {
    if (!this.sourceId || !versionId) return;
    const resolved = setCurrentAnalysisVersion(this.sourceId, versionId);
    if (resolved) {
      this.render();
    }
  }

  /**
   * Renders the complete versioning component state
   */
  render() {
    if (!this.sourceId) return;

    const versions = getAnalysisVersions(this.sourceId);
    const current = getCurrentAnalysis(this.sourceId);
    const activeId = current?.id;

    // 1. Populate dropdown
    if (this.dom?.selectVersion) {
      populateVersionSelect(this.dom.selectVersion, this.sourceId, activeId);
    }

    // 2. Update badge .current
    if (this.dom?.badgeCurrent && this.dom?.badgeLabel) {
      const vNum = current?.version || 1;
      this.dom.badgeLabel.textContent = `v${vNum} · Current`;
      this.dom.badgeCurrent.classList.add('current');
    }

    // 3. Update count badge
    if (this.dom?.versionCountBadge) {
      this.dom.versionCountBadge.textContent = `${versions.length} Version${versions.length > 1 ? 's' : ''}`;
    }

    // 4. Render timeline list
    if (this.dom?.historyList) {
      renderVersionHistoryList(this.dom.historyList, this.sourceId, activeId);
    }
  }

  /**
   * Shows S05 Snapshot Panel for a specific saved note
   * @param {string|object} noteOrNoteId 
   */
  renderS05Snapshot(noteOrNoteId) {
    if (!this.dom?.s05Panel) return;

    const snapshotData = getSavedNoteSnapshot(noteOrNoteId);
    if (!snapshotData.note) {
      this.dom.s05Panel.hidden = true;
      return;
    }

    this.dom.s05Panel.hidden = false;

    if (this.dom.snapshotTag) {
      const vNum = snapshotData.analysis?.version || 1;
      this.dom.snapshotTag.textContent = `Linked to v${vNum}`;
    }

    if (this.dom.snapshotAnalysisId) {
      this.dom.snapshotAnalysisId.textContent = snapshotData.analysis?.id || snapshotData.note.analysisVersionId || 'Initial';
    }
  }

  /**
   * Cleanup event listeners and subscriptions
   */
  destroy() {
    if (typeof this.unsubscribeStore === 'function') {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
  }
}
