/**
 * ==============================================================================
 * MEW CONTENT OS — Central Application Store (Topic T02)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Reference: MEW_Content_OS_Founder_UX_Spec_TH.md & plan.md
 * 
 * Definition of Done (DOD):
 * - Export: getState(), dispatch(action), subscribe(fn)
 * - Persist to localStorage key: `mew-content-os-v1`
 * - Try/catch with fallback to in-memory when localStorage is unavailable or throws
 * - State shape:
 *     sources[]
 *     analyses[] (versioned)
 *     researchItems[]
 *     savedNotes[] ({ id, sourceId, lens: 'content' | 'packaging', why, tags, createdAt })
 *     remixSelection { content[], packaging[] }
 *     concepts[]
 *     boardItems[]
 *     approvedRevisions[]
 * - seed(): loads sample data according to spec section 6 (Story A-E, C1-C3, P1-P2)
 * - resetDemo(): resets to initial seed sample data
 * - Subscriber called exactly once per dispatch
 * ==============================================================================
 */

import { getSampleData } from './sample-data.js';

export const STORAGE_KEY = 'mew-content-os-v1';

/**
 * Custom storage engine override (e.g. for unit testing or SSR)
 */
let customStorage = undefined;

/**
 * Sets or resets the custom storage engine (useful for testing or fallback mocking).
 * Pass null or undefined to revert to window/globalThis.localStorage.
 * @param {Storage|null} engine 
 */
export function setStorageEngine(engine) {
  customStorage = engine;
}

/**
 * Safely resolves the active Storage engine.
 * @returns {Storage|null}
 */
function getStorage() {
  if (customStorage !== undefined) {
    return customStorage;
  }
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (err) {
    // Access denied or sandbox restricted
    return null;
  }
  return null;
}

/**
 * Creates a clean default empty state shape.
 */
export function createDefaultState() {
  return {
    sources: [],
    analyses: [],
    researchItems: [],
    savedNotes: [],
    remixSelection: {
      content: [],
      packaging: []
    },
    concepts: [],
    boardItems: [],
    approvedRevisions: []
  };
}

/**
 * Persists the given state to storage safely.
 * If storage fails or is unavailable, silently falls back to in-memory.
 * @param {object} state 
 */
function persistState(state) {
  const storage = getStorage();
  if (!storage) return;

  try {
    const serialized = JSON.stringify(state);
    storage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    // Quota exceeded, private browsing or storage disabled: fallback to in-memory
    console.warn('[Store] LocalStorage write failed; running in-memory fallback:', err?.message || err);
  }
}

/**
 * Attempts to load persisted state from storage.
 * @returns {object|null}
 */
function loadPersistedState() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (err) {
    console.warn('[Store] LocalStorage read failed; falling back to seed/memory:', err?.message || err);
  }
  return null;
}

/**
 * Derives the research status for a source based on its current savedNotes.
 * Statuses: 'Saved to Content' | 'Saved to Packaging' | 'Saved to Both' | 'Analyzed · Not saved'
 * @param {string} sourceId 
 * @param {Array} notes 
 * @returns {string}
 */
export function computeSourceStatus(sourceId, notes = []) {
  const sourceNotes = notes.filter(n => n.sourceId === sourceId);
  const hasContent = sourceNotes.some(n => n.lens === 'content');
  const hasPackaging = sourceNotes.some(n => n.lens === 'packaging');

  if (hasContent && hasPackaging) return 'Saved to Both';
  if (hasContent) return 'Saved to Content';
  if (hasPackaging) return 'Saved to Packaging';
  return 'Analyzed · Not saved';
}

/**
 * Master Reducer function for handling state mutations
 * @param {object} state 
 * @param {object|function} action 
 * @returns {object}
 */
function rootReducer(state, action) {
  // If action is a direct mutator function: dispatch(state => newState)
  if (typeof action === 'function') {
    const next = action(state);
    return next && typeof next === 'object' ? next : state;
  }

  if (!action || !action.type) {
    return state;
  }

  switch (action.type) {
    case 'HYDRATE': {
      return {
        ...createDefaultState(),
        ...(action.payload || {})
      };
    }

    case 'SEED':
    case 'RESET_DEMO': {
      return getSampleData();
    }

    // --- SOURCES ---
    case 'ADD_SOURCE': {
      const source = action.payload;
      if (!source || !source.id) return state;
      const exists = state.sources.some(s => s.id === source.id);
      return {
        ...state,
        sources: exists
          ? state.sources.map(s => s.id === source.id ? { ...s, ...source } : s)
          : [...state.sources, source]
      };
    }

    case 'UPDATE_SOURCE': {
      const { id, ...updates } = action.payload || {};
      if (!id) return state;
      return {
        ...state,
        sources: state.sources.map(s => s.id === id ? { ...s, ...updates } : s)
      };
    }

    // --- ANALYSES ---
    case 'ADD_ANALYSIS': {
      const analysis = action.payload;
      if (!analysis || !analysis.id) return state;
      const filtered = state.analyses.filter(a => a.id !== analysis.id);
      return {
        ...state,
        analyses: [...filtered, analysis]
      };
    }

    // --- RESEARCH ITEMS ---
    case 'ADD_RESEARCH_ITEM': {
      const item = action.payload;
      if (!item || !item.id) return state;
      const exists = state.researchItems.some(ri => ri.id === item.id);
      return {
        ...state,
        researchItems: exists
          ? state.researchItems.map(ri => ri.id === item.id ? { ...ri, ...item } : ri)
          : [...state.researchItems, item]
      };
    }

    case 'UPDATE_RESEARCH_ITEM': {
      const { id, ...updates } = action.payload || {};
      if (!id) return state;
      return {
        ...state,
        researchItems: state.researchItems.map(ri => ri.id === id ? { ...ri, ...updates } : ri)
      };
    }

    // --- SAVED NOTES (HUMAN SAVE GATE) ---
    case 'SAVE_NOTE': {
      const note = action.payload;
      if (!note || !note.id || !note.sourceId || !note.lens || !note.why) {
        return state;
      }

      // Check if note already exists
      const existingIndex = state.savedNotes.findIndex(n => n.id === note.id);
      let updatedNotes;
      if (existingIndex >= 0) {
        updatedNotes = state.savedNotes.map((n, idx) => idx === existingIndex ? { ...n, ...note } : n);
      } else {
        updatedNotes = [...state.savedNotes, {
          ...note,
          createdAt: note.createdAt || new Date().toISOString()
        }];
      }

      // Automatically recalculate status for research inbox item matching sourceId
      const newStatus = computeSourceStatus(note.sourceId, updatedNotes);
      const updatedResearchItems = state.researchItems.map(ri => {
        if (ri.sourceId === note.sourceId) {
          return { ...ri, status: newStatus };
        }
        return ri;
      });

      return {
        ...state,
        savedNotes: updatedNotes,
        researchItems: updatedResearchItems
      };
    }

    case 'UPDATE_NOTE': {
      const { id, why, tags } = action.payload || {};
      if (!id) return state;
      return {
        ...state,
        savedNotes: state.savedNotes.map(n => {
          if (n.id === id) {
            return {
              ...n,
              ...(why !== undefined ? { why } : {}),
              ...(tags !== undefined ? { tags } : {})
            };
          }
          return n;
        })
      };
    }

    case 'DELETE_NOTE': {
      const targetId = typeof action.payload === 'object' ? action.payload?.id : action.payload;
      if (!targetId) return state;

      const targetNote = state.savedNotes.find(n => n.id === targetId);
      const updatedNotes = state.savedNotes.filter(n => n.id !== targetId);

      // Recalculate research item status
      let updatedResearchItems = state.researchItems;
      if (targetNote) {
        const newStatus = computeSourceStatus(targetNote.sourceId, updatedNotes);
        updatedResearchItems = state.researchItems.map(ri => {
          if (ri.sourceId === targetNote.sourceId) {
            return { ...ri, status: newStatus };
          }
          return ri;
        });
      }

      // Also remove from remixSelection if present
      const updatedRemix = {
        content: state.remixSelection.content.filter(id => id !== targetId),
        packaging: state.remixSelection.packaging.filter(id => id !== targetId)
      };

      return {
        ...state,
        savedNotes: updatedNotes,
        researchItems: updatedResearchItems,
        remixSelection: updatedRemix
      };
    }

    // --- REMIX BASKET SELECTION ---
    case 'SET_REMIX_SELECTION': {
      const { content, packaging } = action.payload || {};
      return {
        ...state,
        remixSelection: {
          content: Array.isArray(content) ? [...content] : state.remixSelection.content,
          packaging: Array.isArray(packaging) ? [...packaging] : state.remixSelection.packaging
        }
      };
    }

    case 'TOGGLE_REMIX_INGREDIENT': {
      const { lens, noteId } = action.payload || {};
      if (!lens || !noteId || !['content', 'packaging'].includes(lens)) return state;

      const currentList = state.remixSelection[lens] || [];
      const isSelected = currentList.includes(noteId);
      const nextList = isSelected
        ? currentList.filter(id => id !== noteId)
        : [...currentList, noteId];

      return {
        ...state,
        remixSelection: {
          ...state.remixSelection,
          [lens]: nextList
        }
      };
    }

    case 'ADD_REMIX_INGREDIENT': {
      const { lens, noteId } = action.payload || {};
      if (!lens || !noteId || !['content', 'packaging'].includes(lens)) return state;

      const currentList = state.remixSelection[lens] || [];
      if (currentList.includes(noteId)) return state;

      return {
        ...state,
        remixSelection: {
          ...state.remixSelection,
          [lens]: [...currentList, noteId]
        }
      };
    }

    case 'REMOVE_REMIX_INGREDIENT': {
      const { lens, noteId } = action.payload || {};
      if (!lens || !noteId || !['content', 'packaging'].includes(lens)) return state;

      return {
        ...state,
        remixSelection: {
          ...state.remixSelection,
          [lens]: (state.remixSelection[lens] || []).filter(id => id !== noteId)
        }
      };
    }

    case 'CLEAR_REMIX_SELECTION': {
      return {
        ...state,
        remixSelection: { content: [], packaging: [] }
      };
    }

    // --- CONCEPTS ---
    case 'ADD_CONCEPT': {
      const concept = action.payload;
      if (!concept || !concept.id) return state;
      return {
        ...state,
        concepts: [...state.concepts.filter(c => c.id !== concept.id), concept]
      };
    }

    case 'UPDATE_CONCEPT': {
      const { id, ...updates } = action.payload || {};
      if (!id) return state;
      return {
        ...state,
        concepts: state.concepts.map(c => c.id === id ? { ...c, ...updates } : c)
      };
    }

    // --- CONTENT BOARD ---
    case 'ADD_BOARD_ITEM': {
      const item = action.payload;
      if (!item || !item.id) return state;
      return {
        ...state,
        boardItems: [...state.boardItems.filter(b => b.id !== item.id), item]
      };
    }

    case 'UPDATE_BOARD_ITEM': {
      const { id, ...updates } = action.payload || {};
      if (!id) return state;
      return {
        ...state,
        boardItems: state.boardItems.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)
      };
    }

    case 'UPDATE_BOARD_CARD_STAGE': {
      const { cardId, stage, revisionId } = action.payload || {};
      if (!cardId) return state;
      return {
        ...state,
        boardItems: state.boardItems.map(b => (b.id === cardId || b.conceptId === cardId) ? { ...b, stage, ...(revisionId ? { revisionId } : {}), updatedAt: new Date().toISOString() } : b)
      };
    }

    // --- APPROVED IMMUTABLE REVISIONS ---
    case 'APPROVE_REVISION': {
      const revision = action.payload;
      if (!revision || !revision.revisionId) return state;

      // Update concept status to 'Approved'
      const updatedConcepts = state.concepts.map(c => {
        if (c.id === revision.conceptId) {
          return { ...c, status: 'Approved' };
        }
        return c;
      });

      // Update board item stage to 'Approved'
      const updatedBoardItems = state.boardItems.map(b => {
        if (b.conceptId === revision.conceptId) {
          return { ...b, stage: 'Approved', updatedAt: new Date().toISOString() };
        }
        return b;
      });

      return {
        ...state,
        approvedRevisions: [
          ...state.approvedRevisions.filter(r => r.revisionId !== revision.revisionId),
          {
            ...revision,
            approvedAt: revision.approvedAt || new Date().toISOString()
          }
        ],
        concepts: updatedConcepts,
        boardItems: updatedBoardItems
      };
    }

    default:
      return state;
  }
}

// ==============================================================================
// Store State & Subscription Infrastructure
// ==============================================================================

let currentState = null;
const subscribers = new Set();
let isDispatching = false;

/**
 * Initializes the state: loads from storage if available, otherwise initializes sample seed.
 */
function initStore() {
  const loaded = loadPersistedState();
  if (loaded && Array.isArray(loaded.sources) && loaded.sources.length > 0) {
    currentState = {
      ...createDefaultState(),
      ...loaded
    };
  } else {
    // If no existing saved state in localStorage, initialize with sample data
    currentState = getSampleData();
    persistState(currentState);
  }
}

// Auto initialize store on module import
initStore();

/**
 * Returns the current state snapshot (immutable reference).
 * @returns {object}
 */
export function getState() {
  return currentState;
}

/**
 * Subscribes a listener function to store updates.
 * Listener is called with (state, action) exactly once per dispatch.
 * Returns an unsubscribe function.
 * 
 * @param {function(object, object): void} listener 
 * @returns {function(): void}
 */
export function subscribe(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('Subscriber listener must be a function');
  }

  subscribers.add(listener);

  return function unsubscribe() {
    subscribers.delete(listener);
  };
}

/**
 * Dispatches an action, updates state, persists to localStorage, and calls all subscribers.
 * 
 * @param {object|function} action 
 * @returns {object} The new state
 */
export function dispatch(action) {
  if (isDispatching) {
    throw new Error('Reducers may not dispatch actions while dispatching');
  }

  try {
    isDispatching = true;
    currentState = rootReducer(currentState, action);
  } finally {
    isDispatching = false;
  }

  // Persist state to localStorage key `mew-content-os-v1`
  persistState(currentState);

  // Notify all registered subscribers exactly once
  for (const listener of subscribers) {
    try {
      listener(currentState, action);
    } catch (err) {
      console.error('[Store] Subscriber threw an error:', err);
    }
  }

  return currentState;
}

/**
 * Seeds the store with sample data according to Spec Section 6.
 * Story A ("Post and forget it"), Story B ("The Ticking Clock"), Story E (Both),
 * and C1-C3 / P1-P2 with Thai WHY texts.
 * 
 * @returns {object} The seeded state
 */
export function seed() {
  return dispatch({ type: 'SEED' });
}

/**
 * Resets the demo state back to default seeded sample data and persists.
 * 
 * @returns {object} The reset state
 */
export function resetDemo() {
  return dispatch({ type: 'RESET_DEMO' });
}
