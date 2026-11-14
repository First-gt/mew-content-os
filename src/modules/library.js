/**
 * ==============================================================================
 * MEW CONTENT OS - S04 & S05 Dual-Vault Reference Library & Detail Controller
 * Theme: mewteetawat.com V6.3 (Warm Stone, Emerald Green, Violet & Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch, subscribe } from './store.js';

// Fallback Founder Sample Data (Story A & Story B as defined in Blueprint)
export const FOUNDER_SAMPLE_REFERENCES = [
  {
    id: 'note-a',
    noteId: 'note-a',
    sourceId: 'source-a',
    lens: 'content',
    vaultType: 'content',
    title: 'Post and forget it',
    subtitle: 'ทำไมการปล่อยคอนเทนต์แล้วเลิกนั่งเฝ้ายอดวิว ถึงทำให้สร้างสรรค์งานที่ดีกว่าได้ในระยะยาว',
    creator: 'Mew Teetawat',
    creatorAvatar: 'MT',
    sourceUrl: 'https://youtube.com/@mewteetawat',
    thumbnailUrl: 'assets/video_preview.png',
    duration: '2:15 นาที',
    tags: ['Mindset', 'Creator Economy', 'Creative Longevity', 'Consistency'],
    founderWhy: 'ตรงกับปรัชญาของเรา: คอนเทนต์ที่ดีเกิดจากความสม่ำเสมอและปล่อยวาง ไม่ใช่การ refresh ดูยอดวิวทุก 5 นาที ชอบประเด็นเรื่อง detachment ที่ทำให้ไม่เบิร์นเอาท์ นำไปเล่าต่อเป็นแก่นเรื่องคอนเทนต์คุณภาพได้',
    why: 'ตรงกับปรัชญาของเรา: คอนเทนต์ที่ดีเกิดจากความสม่ำเสมอและปล่อยวาง ไม่ใช่การ refresh ดูยอดวิวทุก 5 นาที ชอบประเด็นเรื่อง detachment ที่ทำให้ไม่เบิร์นเอาท์ นำไปเล่าต่อเป็นแก่นเรื่องคอนเทนต์คุณภาพได้',
    aiInsight: 'แก่นความคิดมุ่งเน้น Decoupling creation from outcome validation ชี้ให้เห็นว่า feedback loop ทันทีทำให้เกิด bias ต่อ vanity metrics การสร้าง continuous publishing rhythm มีผลต่อความสำเร็จระยะยาวมากกว่า',
    savedAt: '2026-10-28T10:00:00.000Z',
    formattedDate: '28 ต.ค. 2026',
    beats: [
      { time: '0:00 - 0:05', title: 'Hook Point', desc: 'ชวนตั้งคำถามต่อพฤติกรรมการเสพติดยอดวิวทันทีหลังโพสต์' },
      { time: '0:06 - 0:42', title: 'Problem Agitation', desc: 'อธิบายวงจรจิตวิทยาที่ทำให้ Creator สูญเสียตัวตนเมื่อผูกคุณค่ากับตัวเลข' },
      { time: '0:43 - 1:20', title: 'Core Framework', desc: 'กฎ 72 ชั่วโมงแห่งการไม่เปิดดูสถิติ เพื่อรักษาโฟกัสในการผลิตชิ้นถัดไป' }
    ]
  },
  {
    id: 'note-c2',
    noteId: 'note-c2',
    sourceId: 'source-c2',
    lens: 'content',
    vaultType: 'content',
    title: 'The $0 Marketing Playbook',
    subtitle: 'การสร้างคอนเทนต์ที่เป็น Asset ถาวร แทนการวิ่งไล่กระแสชั่วคราวที่จางหายใน 24 ชั่วโมง',
    creator: 'Alex Hormozi',
    creatorAvatar: 'AH',
    sourceUrl: 'https://youtube.com/@alexhormozi',
    thumbnailUrl: 'assets/video_preview.png',
    duration: '3:40 นาที',
    tags: ['Creator Economy', 'Mindset', 'Consistency'],
    founderWhy: 'ชอบความชัดเจนเรื่อง Evergreen Asset: คอนเทนต์ควรแก้ปัญหาจริงให้คนดูจนเกิดความเชื่อใจสะสม ไม่ใช่แค่ทำตามเทรนด์ไวรัลรายวัน',
    why: 'ชอบความชัดเจนเรื่อง Evergreen Asset: คอนเทนต์ควรแก้ปัญหาจริงให้คนดูจนเกิดความเชื่อใจสะสม ไม่ใช่แค่ทำตามเทรนด์ไวรัลรายวัน',
    aiInsight: 'เปลี่ยนมุมมองจาก Content as Ad เป็น Content as Compounding Trust Asset โดยเน้นการตอบคำถามที่ลูกค้าถามซ้ำบ่อยที่สุด',
    savedAt: '2026-10-29T16:00:00.000Z',
    formattedDate: '29 ต.ค. 2026',
    beats: [
      { time: '0:00 - 0:06', title: 'Contrarian Claim', desc: 'ชี้ให้เห็นว่าไวรัลที่ไร้แก่นสารไม่สร้างยอดขายจริง' },
      { time: '0:07 - 1:45', title: 'Asset vs Trend Matrix', desc: 'เปรียบเทียบผลลัพธ์ของคอนเทนต์แก้ปัญหาจริงกับคอนเทนต์ตามกระแส' },
      { time: '1:46 - 3:40', title: 'Execution System', desc: 'วิธีเก็บคำถามจริงจากลูกค้ามาสร้างคลังเนื้อหาหลักของแบรนด์' }
    ]
  },
  {
    id: 'note-e-content',
    noteId: 'note-e-content',
    sourceId: 'source-e',
    lens: 'content',
    vaultType: 'content',
    savedOrigin: 'both',
    title: 'Myth vs Reality: การสร้างแบรนด์ที่แท้จริง',
    subtitle: 'แยกแยะความเชื่อผิดๆ เรื่องการปั้นช่อง กับระบบหลังบ้านที่ทำให้ธุรกิจเติบโตจริง',
    creator: 'Mew Teetawat',
    creatorAvatar: 'MT',
    sourceUrl: 'https://youtube.com/@mewteetawat',
    thumbnailUrl: 'assets/video_preview.png',
    duration: '2:40 นาที',
    tags: ['Mindset', 'Creator Economy', 'Consistency'],
    founderWhy: 'เก็บเข้าทั้ง 2 คลัง (Story E): ฝั่ง Content ชอบโครงความคิดเรื่องการแยกความเชื่อลวงตาออกจากความจริงในการทำธุรกิจคอนเทนต์',
    why: 'เก็บเข้าทั้ง 2 คลัง (Story E): ฝั่ง Content ชอบโครงความคิดเรื่องการแยกความเชื่อลวงตาออกจากความจริงในการทำธุรกิจคอนเทนต์',
    aiInsight: 'ใช้แก่นความจริงจากประสบการณ์ตรงมาหักล้างความเข้าใจผิดยอดนิยม ช่วยสร้าง Authority และคัดกรองกลุ่มเป้าหมายคุณภาพสูง',
    savedAt: '2026-10-30T15:00:00.000Z',
    formattedDate: '30 ต.ค. 2026',
    beats: [
      { time: '0:00 - 0:05', title: 'Myth Statement', desc: 'ยกความเชื่อที่คนส่วนใหญ่เข้าใจผิดขึ้นมาเปิดประเด็น' },
      { time: '0:06 - 1:30', title: 'Reality Breakdown', desc: 'ผ่าโครงสร้างการทำงานจริงเบื้องหลังที่สร้างผลลัพธ์ยั่งยืน' }
    ]
  },
  {
    id: 'note-b',
    noteId: 'note-b',
    sourceId: 'source-b',
    lens: 'packaging',
    vaultType: 'packaging',
    title: 'The Ticking Clock',
    subtitle: 'เริ่มต้นด้วยเสียงนับถอยหลัง 5 วินาทีก่อนพูดประโยคแรก สร้าง retention สูงสุดใน 3 วินาทีแรก',
    creator: 'Ali Abdaal',
    creatorAvatar: 'AA',
    sourceUrl: 'https://youtube.com/@aliabdaal',
    thumbnailUrl: 'assets/video_preview.png',
    duration: '0:58 นาที',
    tags: ['Hook Technique', 'Pacing', 'Sound Design', 'Audio Cue'],
    founderWhy: 'เทคนิค Sound Pacing ดีมาก การใช้จังหวะเคาะเวลานับถอยหลังเร่งความรู้สึก FOMO ของคนดู ทำให้สายตาหยุดเลื่อนฟีดทันทีก่อนที่ประโยคแรกจะจบ เหมาะเอามาเป็นจังหวะเปิดคลิปของซีรีส์เรา',
    why: 'เทคนิค Sound Pacing ดีมาก การใช้จังหวะเคาะเวลานับถอยหลังเร่งความรู้สึก FOMO ของคนดู ทำให้สายตาหยุดเลื่อนฟีดทันทีก่อนที่ประโยคแรกจะจบ เหมาะเอามาเป็นจังหวะเปิดคลิปของซีรีส์เรา',
    aiInsight: 'จังหวะโครงสร้างแบบ Sensory Hook ใช้ Metronome/Ticking clock sound 5 BPM ไวขึ้นเรื่อยๆ สร้าง Pattern Interrupt ทางโสตประสาท ดึง Average Watch Time ช่วง 0-3 วินาทีแรก',
    savedAt: '2026-10-29T14:30:00.000Z',
    formattedDate: '29 ต.ค. 2026',
    beats: [
      { time: '0:00 - 0:03', title: 'Metronome Hook', desc: 'เสียงนับถอยหลัง 5 วินาที พร้อมกราฟิกเข็มนาฬิกาเร่งจังหวะ' },
      { time: '0:04 - 0:25', title: 'Fast Value Pitch', desc: 'ยิงประเด็น 3 สิ่งที่สูญเสียเวลาเร็วที่สุด โดยไม่เสียเวลาเกริ่นนำ' },
      { time: '0:26 - 0:58', title: 'Visual Contrast', desc: 'สลับภาพมุมกว้างและโคลสอัพตัดสลับทุกๆ 2.5 วินาทีคงความสนใจ' }
    ]
  },
  {
    id: 'note-p2',
    noteId: 'note-p2',
    sourceId: 'source-p2',
    lens: 'packaging',
    vaultType: 'packaging',
    title: 'One-Breath Delivery Cut',
    subtitle: 'การพูดประโยคเปิดตัวด้วยความเร็วคงที่โดยไม่เว้นช่องว่างอากาศ ตัด jump cut ทุกคำเชื่อม',
    creator: 'Colin and Samir',
    creatorAvatar: 'CS',
    sourceUrl: 'https://youtube.com/@colinandsamir',
    thumbnailUrl: 'assets/video_preview.png',
    duration: '1:10 นาที',
    tags: ['Hook Technique', 'Pacing', 'Consistency'],
    founderWhy: 'จังหวะการตัดต่อกระชับมาก ดึงสมาธิคนดูได้อยู่หมัดใน 4 วินาทีแรก เหมาะนำมาห่อหุ้มเนื้อหาแนวสรุป Playbook ของเรา',
    why: 'จังหวะการตัดต่อกระชับมาก ดึงสมาธิคนดูได้อยู่หมัดใน 4 วินาทีแรก เหมาะนำมาห่อหุ้มเนื้อหาแนวสรุป Playbook ของเรา',
    aiInsight: 'เทคนิค J-Cut ผสาน One-Breath Pacing ตัดช่องว่างเสียงหายใจออกทั้งหมดในช่วงต้นคลิป เพื่อสร้างความรู้สึกเร่งด่วนและน่าติดตาม',
    savedAt: '2026-10-30T11:30:00.000Z',
    formattedDate: '30 ต.ค. 2026',
    beats: [
      { time: '0:00 - 0:04', title: 'Zero-Gap Hook', desc: 'เข้าประโยคปมปัญหาทันทีตั้งแต่วินาทีที่ 0.1 โดยไม่เกริ่นนำ' },
      { time: '0:05 - 0:40', title: 'Rhythmic B-Roll', desc: 'วางภาพประกอบทุกครั้งที่มีการเปลี่ยนคีย์เวิร์ดสำคัญ' }
    ]
  },
  {
    id: 'note-e-packaging',
    noteId: 'note-e-packaging',
    sourceId: 'source-e',
    lens: 'packaging',
    vaultType: 'packaging',
    savedOrigin: 'both',
    title: 'Myth vs Reality: Split-Screen Contrast',
    subtitle: 'โครงสร้างสลับฉาก 2 ขั้ว (ความเชื่อเดิม vs ความจริง) พร้อมเสียงชัตเตอร์เปลี่ยนมุมกล้อง',
    creator: 'Mew Teetawat',
    creatorAvatar: 'MT',
    sourceUrl: 'https://youtube.com/@mewteetawat',
    thumbnailUrl: 'assets/video_preview.png',
    duration: '2:40 นาที',
    tags: ['Hook Technique', 'Pacing', 'Sound Design'],
    founderWhy: 'เก็บเข้าทั้ง 2 คลัง (Story E): ฝั่ง Packaging ชอบจังหวะสลับการ์ดสีแดง (Myth) กับสีเขียว (Reality) พร้อมเสียงชัตเตอร์คลิกที่ทำให้คนดูเข้าใจประเด็นซับซ้อนได้ทันที',
    why: 'เก็บเข้าทั้ง 2 คลัง (Story E): ฝั่ง Packaging ชอบจังหวะสลับการ์ดสีแดง (Myth) กับสีเขียว (Reality) พร้อมเสียงชัตเตอร์คลิกที่ทำให้คนดูเข้าใจประเด็นซับซ้อนได้ทันที',
    aiInsight: 'โครงสร้าง Visual Polar Contrast ช่วยลดภาระการประมวลผลของสมองคนดู (Cognitive Ease) ทำให้จดจำประเด็นหลักได้แม่นยำขึ้น',
    savedAt: '2026-10-30T15:05:00.000Z',
    formattedDate: '30 ต.ค. 2026',
    beats: [
      { time: '0:00 - 0:05', title: 'Visual Card Flip', desc: 'ขึ้นการ์ดข้อความสีตัดกันพร้อมเสียง Camera Shutter' },
      { time: '0:06 - 1:30', title: 'Side-by-Side Proof', desc: 'เทียบให้เห็นความต่างระหว่างวิธีเดิมกับระบบใหม่แบบชัดเจน' }
    ]
  }
];

/**
 * Extracts and maps คลังโน้ต items from the central store into standardized library references.
 * Strictly excludes any source with status "Analyzed · Not saved" or without คลังโน้ต entries.
 * Sources saved to Both appear with their same sourceId, but separate cards and respective lens notes.
 * @param {Object} [state] Optional state override
 * @returns {Array<Object>}
 */
export function getSavedReferencesFromStore(state = null) {
  const currentState = state || (typeof getState === 'function' ? getState() : null);
  if (!currentState || !Array.isArray(currentState.savedNotes) || currentState.savedNotes.length === 0) {
    return [];
  }

  const { sources = [], savedNotes = [], analyses = [] } = currentState;
  const sourcesMap = new Map(sources.map(s => [s.id, s]));
  const sourceLensesMap = new Map();
  savedNotes.forEach(n => {
    if (!n || !n.sourceId) return;
    if (!sourceLensesMap.has(n.sourceId)) sourceLensesMap.set(n.sourceId, new Set());
    if (n.lens) sourceLensesMap.get(n.sourceId).add(n.lens);
  });

  // Strictly filter only notes with a valid lens ('content' or 'packaging')
  // Clips that are "Analyzed · Not saved" have no คลังโน้ต entries and are strictly excluded!
  return savedNotes.map(note => {
    const source = sourcesMap.get(note.sourceId) || {};
    const lensesForSource = sourceLensesMap.get(note.sourceId);
    const savedOrigin = (lensesForSource && lensesForSource.has('content') && lensesForSource.has('packaging'))
      ? 'both'
      : (note.lens === 'packaging' ? 'packaging' : 'content');
    const sourceAnalyses = analyses.filter(a => a.sourceId === note.sourceId);
    const analysis = sourceAnalyses.find(a => a.isCurrent) || sourceAnalyses[sourceAnalyses.length - 1] || null;

    const formattedDate = note.createdAt ? new Date(note.createdAt).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : 'บันทึกเมื่อเร็วๆ นี้';

    const isContent = note.lens === 'content';
    const fallbackInsight = isContent
      ? (analysis?.contentAnalysis?.coreMessage || analysis?.contentAnalysis?.whatIsGood || 'แก่นความคิดมุ่งเน้นการส่งมอบคุณค่าที่แท้จริง')
      : (analysis?.packagingAnalysis?.hookType || analysis?.packagingAnalysis?.structure || 'เทคนิคการเปิดคลิปและคุมจังหวะเพื่อดึงความสนใจ');

    return {
      id: note.id,
      noteId: note.id,
      sourceId: note.sourceId,
      lens: note.lens,
      vaultType: note.lens,
      savedOrigin: savedOrigin,
      title: source.title || 'Untitled Reference',
      subtitle: source.subtitle || source.title || '',
      creator: source.creator || 'Anonymous Creator',
      creatorAvatar: source.creatorAvatar || (source.creator ? source.creator.slice(0, 2).toUpperCase() : 'CR'),
      sourceUrl: source.url || '#',
      thumbnailUrl: source.thumbnailUrl || source.thumbnail || 'assets/video_preview.png',
      duration: source.duration || '1:00 นาที',
      tags: Array.isArray(note.tags) && note.tags.length > 0 ? note.tags : (source.tags || ['Reference']),
      founderWhy: note.why || '',
      why: note.why || '',
      aiInsight: fallbackInsight,
      savedAt: note.createdAt || new Date().toISOString(),
      formattedDate: formattedDate,
      beats: Array.isArray(analysis?.packagingAnalysis?.beats) && analysis.packagingAnalysis.beats.length > 0
        ? analysis.packagingAnalysis.beats
        : (isContent ? [
            { time: '0:00 - 0:05', title: 'Hook Point', desc: 'ชวนตั้งคำถามต่อพฤติกรรมการเสพติดยอดวิวทันทีหลังโพสต์' },
            { time: '0:06 - 0:42', title: 'Problem Agitation', desc: 'อธิบายวงจรจิตวิทยาที่ทำให้ Creator สูญเสียตัวตนเมื่อผูกคุณค่ากับตัวเลข' },
            { time: '0:43 - 1:20', title: 'Core Framework', desc: 'กฎ 72 ชั่วโมงแห่งการไม่เปิดดูสถิติ เพื่อรักษาโฟกัสในการผลิตชิ้นถัดไป' }
          ] : [
            { time: '0:00 - 0:03', title: 'Metronome Hook', desc: 'เสียงนับถอยหลัง 5 วินาที พร้อมกราฟิกเข็มนาฬิกาเร่งจังหวะ' },
            { time: '0:04 - 0:25', title: 'Fast Value Pitch', desc: 'ยิงประเด็น 3 สิ่งที่สูญเสียเวลาเร็วที่สุด โดยไม่เสียเวลาเกริ่นนำ' },
            { time: '0:26 - 0:58', title: 'Visual Contrast', desc: 'สลับภาพมุมกว้างและโคลสอัพตัดสลับทุกๆ 2.5 วินาทีคงความสนใจ' }
          ])
    };
  });
}

export class LibraryController {
  /**
   * Initializes the Dual-Vault Reference Library
   * @param {Object} options 
   * @param {HTMLElement|string} options.rootId Root container selector or element
   * @param {'content'|'packaging'} [options.activeVault='content'] Initial active vault tab
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? document.querySelector(options.rootId)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('library-root') || document.body : null));

    this.activeVault = options.activeVault || 'content'; // 'content' | 'packaging'
    this.searchQuery = '';
    this.activeTag = 'all';
    this.activeDetailId = null;
    this.toastTimer = null;
    this.lastFocusedElement = null;
    this.selectedCardIds = new Set();

    this.initData();
    if (this.root) {
      this.cacheDom();
      this.bindEvents();
      this.render();
    }
  }

  /**
   * Initializes data from central store with fallback to sample data
   */
  initData() {
    this.syncFromStore();

    // Subscribe to store updates so any new save immediately updates both tabs and counts
    if (typeof subscribe === 'function') {
      try {
        this.unsubscribeStore = subscribe(() => {
          this.syncFromStore();
          if (this.dom && this.dom.tabContent) {
            this.render();
          }
        });
      } catch (err) {
        console.warn('[LibraryController] Failed to subscribe to store:', err);
      }
    }
  }

  /**
   * Syncs references from store or localStorage fallback
   */
  syncFromStore() {
    let customSaved = [];
    try {
      if (typeof localStorage !== 'undefined') {
        const userClipsRaw = localStorage.getItem('mew_user_saved_clips');
        const savedRefsRaw = localStorage.getItem('mew_saved_references');
        const combinedRaw = [];

        if (userClipsRaw) {
          const parsedUser = JSON.parse(userClipsRaw);
          if (Array.isArray(parsedUser)) combinedRaw.push(...parsedUser);
        }
        if (savedRefsRaw) {
          const parsedSaved = JSON.parse(savedRefsRaw);
          if (Array.isArray(parsedSaved)) combinedRaw.push(...parsedSaved);
        }

        const seenCustom = new Set();
        for (const item of combinedRaw) {
          if (!item || (!item.id && !item.noteId)) continue;
          const baseId = item.id || item.noteId;
          if (seenCustom.has(baseId)) continue;
          seenCustom.add(baseId);

          if (item.vaultType === 'both' || item.lens === 'both') {
            customSaved.push(this.normalizeReference({ ...item, id: `${baseId}-content`, noteId: `${baseId}-content`, lens: 'content', vaultType: 'content' }));
            customSaved.push(this.normalizeReference({ ...item, id: `${baseId}-packaging`, noteId: `${baseId}-packaging`, lens: 'packaging', vaultType: 'packaging' }));
          } else {
            customSaved.push(this.normalizeReference(item));
          }
        }
      }
    } catch (err) {
      console.warn('[LibraryController] Failed to load from localStorage:', err);
    }

    try {
      const storeReferences = getSavedReferencesFromStore();
      if (storeReferences && storeReferences.length > 0) {
        const seen = new Set(customSaved.map(r => r.id));
        this.references = [...customSaved, ...storeReferences.filter(r => !seen.has(r.id))];
        return;
      }
    } catch (err) {
      console.warn('[LibraryController] Error querying central store:', err);
    }

    const seen = new Set(customSaved.map(r => r.id));
    this.references = [...customSaved, ...FOUNDER_SAMPLE_REFERENCES.filter(r => !seen.has(r.id))];
  }

  /**
   * Normalizes reference items into standard model
   */
  normalizeReference(item) {
    const formattedDate = item.formattedDate || (item.savedAt ? new Date(item.savedAt).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : 'บันทึกเมื่อเร็วๆ นี้');

    const lens = item.lens || item.vaultType || 'content';
    let founderWhy = item.founderWhy || item.why || item.whyNote || '';
    if (!founderWhy && item.reasons) {
      founderWhy = item.reasons.content || item.reasons.packaging || '';
    }

    const aiInsight = item.aiInsight || (lens === 'content'
      ? (item.what?.coreTakeaway || 'สรุปย่อแก่นความคิดสำหรับนำไปสังเคราะห์ใน Remix Studio')
      : (item.how?.psychology || item.how?.hookType || 'สรุปย่อเทคนิคการนำเสนอและจังหวะตัดต่อสำหรับ Remix Studio'));

    return {
      id: item.id || item.noteId || `ref-${Date.now()}`,
      noteId: item.noteId || item.id || `note-${Date.now()}`,
      sourceId: item.sourceId || item.id,
      lens: lens,
      vaultType: lens,
      savedOrigin: item.savedOrigin || (lens === 'packaging' ? 'packaging' : 'content'),
      title: item.title || item.clipTitle || 'Untitled Reference',
      subtitle: item.subtitle || item.title || '',
      creator: item.creator || item.author || 'Anonymous Creator',
      creatorAvatar: item.creatorAvatar || (item.creator ? item.creator.slice(0, 2).toUpperCase() : 'CR'),
      sourceUrl: item.sourceUrl || item.url || '#',
      thumbnailUrl: item.thumbnailUrl || item.thumbnail || 'assets/video_preview.png',
      duration: item.duration || '1:00 นาที',
      tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : (item.what?.tags || ['Reference']),
      founderWhy: founderWhy || 'บันทึกโดย Founder ไว้เพื่อนำไปสังเคราะห์คอนเทนต์',
      why: founderWhy || 'บันทึกโดย Founder ไว้เพื่อนำไปสังเคราะห์คอนเทนต์',
      aiInsight: aiInsight,
      savedAt: item.savedAt || item.createdAt || new Date().toISOString(),
      formattedDate: formattedDate,
      beats: Array.isArray(item.beats) ? item.beats : [
        { time: '0:00 - 0:05', title: 'Hook', desc: 'จุดเริ่มต้นดึงดูดความสนใจของผู้รับชม' },
        { time: '0:06 - 0:35', title: 'Core Body', desc: 'สาระสำคัญและประเด็นที่หยิบยกมาอธิบาย' }
      ]
    };
  }

  /**
   * Caches internal DOM elements
   */
  cacheDom() {
    if (!this.root) return;

    this.dom = {
      // Vault Tabs
      tabContent: this.root.querySelector('#tab-content-vault'),
      tabPackaging: this.root.querySelector('#tab-packaging-vault'),
      countContent: this.root.querySelector('#count-content-vault'),
      countPackaging: this.root.querySelector('#count-packaging-vault'),

      // Panels
      panelContent: this.root.querySelector('#panel-content-vault'),
      panelPackaging: this.root.querySelector('#panel-packaging-vault'),
      gridContent: this.root.querySelector('#grid-content-vault'),
      gridPackaging: this.root.querySelector('#grid-packaging-vault'),
      emptyContent: this.root.querySelector('#empty-content-vault'),
      emptyPackaging: this.root.querySelector('#empty-packaging-vault'),

      // Controls
      inputSearch: this.root.querySelector('#input-library-search'),
      btnClearSearch: this.root.querySelector('#btn-clear-search'),
      tagChips: this.root.querySelectorAll('.tag-filter-chip'),
      summaryText: this.root.querySelector('#vault-summary-text'),

      // S05 Detail Drawer
      drawerBackdrop: this.root.querySelector('#library-detail-drawer'),
      drawerPanel: this.root.querySelector('#drawer-panel-card'),
      btnCloseDrawer: this.root.querySelector('#btn-close-library-drawer'),
      btnFooterCloseDrawer: this.root.querySelector('#btn-footer-close-drawer'),
      drawerVaultBadge: this.root.querySelector('#drawer-vault-badge'),
      drawerSavedDate: this.root.querySelector('#drawer-saved-date'),
      drawerTitle: this.root.querySelector('#drawer-reference-title'),
      drawerDesc: this.root.querySelector('#drawer-reference-desc'),
      drawerAuthorAvatar: this.root.querySelector('#drawer-author-avatar'),
      drawerAuthorName: this.root.querySelector('#drawer-author-name'),
      drawerSourceInfo: this.root.querySelector('#drawer-source-info'),
      drawerSourceUrl: this.root.querySelector('#drawer-source-url'),
      drawerTagsList: this.root.querySelector('#drawer-tags-list'),
      drawerFounderWhyText: this.root.querySelector('#drawer-founder-why-text'),
      drawerAiInsightText: this.root.querySelector('#drawer-ai-insight-text'),
      drawerBeatsList: this.root.querySelector('#drawer-beats-list'),
      btnDrawerUseRemix: this.root.querySelector('#btn-drawer-use-in-remix'),

      // Drawer Inline Note Edit
      btnToggleEditWhy: this.root.querySelector('#btn-toggle-edit-why'),
      btnEditText: this.root.querySelector('#btn-edit-text'),
      displayWhyView: this.root.querySelector('#display-founder-note-view'),
      formWhyEdit: this.root.querySelector('#form-founder-note-edit'),
      inputDrawerEditNote: this.root.querySelector('#input-drawer-edit-note'),
      drawerEditCharCount: this.root.querySelector('#drawer-edit-char-count'),
      btnSaveDrawerNote: this.root.querySelector('#btn-save-drawer-note'),
      btnCancelDrawerNote: this.root.querySelector('#btn-cancel-drawer-note'),

      // Toast Notification
      toastBox: this.root.querySelector('#library-toast') || this.root.querySelector('#toast-added-to-selection'),
      toastTitle: this.root.querySelector('#library-toast-title'),
      toastDesc: this.root.querySelector('#library-toast-desc'),
      toastIcon: this.root.querySelector('#library-toast-icon'),
      btnDismissToast: this.root.querySelector('#btn-library-toast-dismiss'),

      // Multi-Select Remix Action Bar & Overview Blocks
      remixActionBar: this.root.querySelector('#library-remix-action-bar') || document.getElementById('library-remix-action-bar'),
      actionBarSelectionText: this.root.querySelector('#action-bar-selection-text') || document.getElementById('action-bar-selection-text'),
      btnBatchRemix: this.root.querySelector('#btn-batch-remix') || document.getElementById('btn-batch-remix'),
      btnClearSelection: this.root.querySelector('#btn-clear-selection') || document.getElementById('btn-clear-selection'),
      overviewCountContent: this.root.querySelector('#overview-count-content') || document.getElementById('overview-count-content'),
      overviewCountPackaging: this.root.querySelector('#overview-count-packaging') || document.getElementById('overview-count-packaging'),
      overviewSwitchCards: this.root.querySelectorAll('[data-vault-switch]')
    };
  }

  /**
   * Binds event listeners
   */
  bindEvents() {
    if (!this.dom) return;

    // Vault Tab clicks
    this.dom.tabContent?.addEventListener('click', () => this.switchVault('content'));
    this.dom.tabPackaging?.addEventListener('click', () => this.switchVault('packaging'));
    this.dom.overviewSwitchCards?.forEach(card => {
      card.addEventListener('click', () => {
        const targetVault = card.getAttribute('data-vault-switch');
        if (targetVault) this.switchVault(targetVault);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const targetVault = card.getAttribute('data-vault-switch');
          if (targetVault) this.switchVault(targetVault);
        }
      });
    });

    // Keyboard navigation on tabs (Arrow Left / Right)
    this.dom.tabContent?.addEventListener('keydown', (e) => this.handleTabKey(e, 'content'));
    this.dom.tabPackaging?.addEventListener('keydown', (e) => this.handleTabKey(e, 'packaging'));

    // Search input
    this.dom.inputSearch?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      if (this.dom.btnClearSearch) {
        this.dom.btnClearSearch.hidden = !this.searchQuery;
      }
      this.render();
    });

    this.dom.btnClearSearch?.addEventListener('click', () => {
      if (this.dom.inputSearch) this.dom.inputSearch.value = '';
      this.searchQuery = '';
      this.dom.btnClearSearch.hidden = true;
      this.render();
      this.dom.inputSearch?.focus();
    });

    // Tag filter chips
    this.dom.tagChips?.forEach(chip => {
      chip.addEventListener('click', () => {
        this.dom.tagChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeTag = chip.getAttribute('data-tag') || 'all';
        this.render();
      });
    });

    // Drawer Close Buttons
    this.dom.btnCloseDrawer?.addEventListener('click', () => this.closeDrawer());
    this.dom.btnFooterCloseDrawer?.addEventListener('click', () => this.closeDrawer());

    // Drawer Backdrop click to close
    this.dom.drawerBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.dom.drawerBackdrop) {
        this.closeDrawer();
      }
    });

    // Drawer keyboard Esc
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.dom.drawerBackdrop && !this.dom.drawerBackdrop.hidden) {
          this.closeDrawer();
        }
      });
    }

    // Drawer Note In-line Edit Toggle
    this.dom.btnToggleEditWhy?.addEventListener('click', () => this.toggleNoteEdit());
    this.dom.btnCancelDrawerNote?.addEventListener('click', () => this.cancelNoteEdit());
    this.dom.btnSaveDrawerNote?.addEventListener('click', () => this.saveDrawerNote());

    // Character counter on note editing
    this.dom.inputDrawerEditNote?.addEventListener('input', (e) => {
      const count = e.target.value.trim().length;
      if (this.dom.drawerEditCharCount) {
        this.dom.drawerEditCharCount.textContent = `${count} ตัวอักษร`;
      }
    });

    // Use in Remix from Drawer
    this.dom.btnDrawerUseRemix?.addEventListener('click', () => {
      if (this.activeDetailId) {
        this.useInRemix(this.activeDetailId);
      }
    });

    // Toast Dismiss
    this.dom.btnDismissToast?.addEventListener('click', () => this.hideToast());

    // Multi-Select Batch Remix Actions
    this.dom.btnClearSelection?.addEventListener('click', () => {
      this.selectedCardIds.clear();
      this.render();
      this.updateRemixActionBar();
    });

    this.dom.btnBatchRemix?.addEventListener('click', () => {
      const selectedItems = this.references.filter(r => this.selectedCardIds.has(r.id));
      if (selectedItems.length === 0) return;

      selectedItems.forEach(item => {
        const noteId = item.noteId || item.id;
        const lens = item.lens || item.vaultType || 'content';
        try {
          if (typeof dispatch === 'function') {
            dispatch({
              type: 'ADD_REMIX_INGREDIENT',
              payload: { lens, noteId }
            });
          }
        } catch (err) {
          console.warn('[LibraryController] Failed to dispatch ADD_REMIX_INGREDIENT in batch:', err);
        }
        window.dispatchEvent(new CustomEvent('mew:remix-select-ingredient', {
          bubbles: true,
          detail: { ...item, noteId, lens }
        }));
        window.dispatchEvent(new CustomEvent('mew_send_to_remix', {
          bubbles: true,
          detail: { ...item, noteId, lens }
        }));
      });

      this.showToast('ส่งวัตถุดิบไป Remix แล้ว', `นำ ${selectedItems.length} คลิปที่เลือกเข้าสู่ Remix Studio เรียบร้อย`, 'violet');
      setTimeout(() => {
        if (typeof window.switchView === 'function') {
          window.switchView('remix');
        }
      }, 250);
    });

    // Global listener for new saves from S03 Save Modal
    if (typeof window !== 'undefined') {
      window.addEventListener('mew:reference-saved', (event) => {
        if (event.detail) {
          this.syncFromStore();
          const savedLens = event.detail.vaultType === 'packaging' || event.detail.lens === 'packaging' ? 'packaging' : 'content';
          this.switchVault(savedLens);
          this.render();
          this.showToast('บันทึกเข้าคลังเรียบร้อย', `เพิ่ม "${event.detail.title || 'Reference'}" เข้าสู่คลังแล้ว`, savedLens === 'packaging' ? 'violet' : 'coral');
        }
      });

      // Global listener for navigation into S04 with specific vault tab
      window.addEventListener('mew:navigate-library', (event) => {
        if (event.detail?.lens) {
          this.syncFromStore();
          this.switchVault(event.detail.lens);
        }
      });
    }
  }

  /**
   * Keyboard accessibility for tabs
   */
  handleTabKey(event, currentVault) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const nextVault = currentVault === 'content' ? 'packaging' : 'content';
      this.switchVault(nextVault);
      if (nextVault === 'content') {
        this.dom.tabContent?.focus();
      } else {
        this.dom.tabPackaging?.focus();
      }
    }
  }

  /**
   * Switches active vault tab (content or packaging)
   * @param {'content'|'packaging'} vault 
   */
  switchVault(vault) {
    if (vault !== 'content' && vault !== 'packaging') return;
    this.activeVault = vault;

    const isContent = vault === 'content';

    // Update Tab states
    if (this.dom.tabContent) {
      this.dom.tabContent.classList.toggle('active', isContent);
      this.dom.tabContent.setAttribute('aria-selected', isContent ? 'true' : 'false');
      this.dom.tabContent.setAttribute('tabindex', isContent ? '0' : '-1');
    }

    if (this.dom.tabPackaging) {
      this.dom.tabPackaging.classList.toggle('active', !isContent);
      this.dom.tabPackaging.setAttribute('aria-selected', !isContent ? 'true' : 'false');
      this.dom.tabPackaging.setAttribute('tabindex', !isContent ? '0' : '-1');
    }

    // Toggle panels
    if (this.dom.panelContent) {
      this.dom.panelContent.classList.toggle('active', isContent);
      this.dom.panelContent.hidden = !isContent;
    }

    if (this.dom.panelPackaging) {
      this.dom.panelPackaging.classList.toggle('active', !isContent);
      this.dom.panelPackaging.hidden = isContent;
    }

    // Sync overview cards active state
    this.dom.overviewSwitchCards?.forEach(card => {
      const isCardActive = card.getAttribute('data-vault-switch') === vault;
      card.classList.toggle('active', isCardActive);
      card.setAttribute('aria-pressed', isCardActive ? 'true' : 'false');
    });

    if (this.root) {
      this.root.setAttribute('data-active-vault', vault);
      const switcherSection = this.root.querySelector('.vault-switcher-section');
      if (switcherSection) {
        switcherSection.classList.toggle('emerald-tone', isContent);
        switcherSection.classList.toggle('violet-tone', !isContent);
      }
    }

    this.render();
  }

  /**
   * Returns references segregated strictly for the given vault lens
   * Content tab displays ONLY notes with lens='content'
   * Packaging tab displays ONLY notes with lens='packaging'
   * Unsaved items ('Analyzed · Not saved') are strictly excluded
   * @param {'content'|'packaging'} vault 
   * @returns {Array<Object>}
   */
  getVaultItems(vault = this.activeVault) {
    return (this.references || []).filter(item => {
      const itemLens = item.lens || item.vaultType;
      return itemLens === vault;
    });
  }

  /**
   * Filters and renders cards for the active vault
   */
  render() {
    this.updateCounters();

    // Segregate by active vault tab (D2/D3: content displays content notes; packaging displays packaging notes)
    const vaultItems = this.getVaultItems(this.activeVault);

    // Apply tag filter and search query
    const filteredItems = vaultItems.filter(item => {
      // Tag filter
      if (this.activeTag !== 'all') {
        const hasTag = item.tags && item.tags.some(t => t.toLowerCase() === this.activeTag.toLowerCase());
        if (!hasTag) return false;
      }

      // Search query
      if (this.searchQuery) {
        const query = this.searchQuery;
        const inTitle = item.title?.toLowerCase().includes(query);
        const inSubtitle = item.subtitle?.toLowerCase().includes(query);
        const inCreator = item.creator?.toLowerCase().includes(query);
        const inWhy = (item.founderWhy || item.why)?.toLowerCase().includes(query);
        const inAi = item.aiInsight?.toLowerCase().includes(query);
        const inTags = item.tags && item.tags.some(t => t.toLowerCase().includes(query));
        return inTitle || inSubtitle || inCreator || inWhy || inAi || inTags;
      }

      return true;
    });

    const isContent = this.activeVault === 'content';
    const gridEl = isContent ? this.dom.gridContent : this.dom.gridPackaging;
    const emptyEl = isContent ? this.dom.emptyContent : this.dom.emptyPackaging;

    if (!gridEl) return;

    // Update summary text
    if (this.dom.summaryText) {
      this.dom.summaryText.textContent = `คลังโน้ต: แสดง ${filteredItems.length} รายการคัดสรร`;
    }

    if (filteredItems.length === 0) {
      gridEl.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    // Render cards with .mew-offer-card style and persistent vault color accent
    gridEl.innerHTML = filteredItems.map(item => this.renderCardHtml(item)).join('');

    // Attach card checkbox listeners for multi-select Remix
    gridEl.querySelectorAll('.card-select-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-chk-id');
        if (chk.checked) {
          this.selectedCardIds.add(id);
        } else {
          this.selectedCardIds.delete(id);
        }
        const card = (this.root || document).querySelector(`#vault-card-${id}`);
        if (card) card.classList.toggle('card-selected', chk.checked);
        this.updateRemixActionBar();
      });
    });

    // Attach card action listeners
    gridEl.querySelectorAll('.btn-card-review').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (card) {
          const id = card.getAttribute('data-id');
          this.openDetailDrawer(id);
        }
      });
    });

    gridEl.querySelectorAll('.btn-card-remix, .btn-use-in-remix').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (card) {
          const id = card.getAttribute('data-id');
          this.useInRemix(id);
        }
      });
    });

    // Make entire card keyboard actionable
    gridEl.querySelectorAll('.reference-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const id = card.getAttribute('data-id');
          this.openDetailDrawer(id);
        }
      });
    });

    this.updateRemixActionBar();
  }

  /**
   * Updates floating/sticky multi-select remix action bar
   */
  updateRemixActionBar() {
    if (!this.dom.remixActionBar) return;
    const selectedCount = this.selectedCardIds.size;
    if (selectedCount > 0) {
      this.dom.remixActionBar.hidden = false;
      const selectedItems = this.references.filter(r => this.selectedCardIds.has(r.id));
      const contentCount = selectedItems.filter(i => (i.lens || i.vaultType) === 'content').length;
      const packagingCount = selectedItems.filter(i => (i.lens || i.vaultType) === 'packaging').length;
      if (this.dom.actionBarSelectionText) {
        this.dom.actionBarSelectionText.textContent = `${contentCount} คลิปจาก Content (WHAT) · ${packagingCount} คลิปจาก Packaging (HOW)`;
      }
    } else {
      this.dom.remixActionBar.hidden = true;
    }
  }

  /**
   * Generates HTML for a reference card (.mew-offer-card style)
   */
  renderCardHtml(item) {
    const isContent = (item.lens || item.vaultType) === 'content';
    const accentClass = isContent ? 'coral-accent' : 'violet-bar violet-accent';
    const vaultPillClass = isContent ? 'coral' : 'violet';
    const vaultLabel = isContent ? 'Content Vault · WHAT' : 'Packaging Vault · HOW';
    const isSelected = this.selectedCardIds.has(item.id);

    const tagsHtml = (item.tags || []).slice(0, 4).map(tag => 
      `<span class="card-tag-pill">${this.escapeHtml(tag)}</span>`
    ).join('');

    const whyText = item.founderWhy || item.why || 'บันทึกเหตุผลโดย Founder';

    // Origin Stamp Badge (คอนเฟิร์มมาจากไหน)
    const originLabel = item.savedOrigin === 'both' || item.lens === 'both'
      ? '✓ คอนเฟิร์มจาก Both Vaults'
      : isContent
      ? '✓ คอนเฟิร์มเข้า Content Vault'
      : '✓ คอนเฟิร์มเข้า Packaging Vault';
    const originClass = item.savedOrigin === 'both' || item.lens === 'both'
      ? 'origin-both'
      : isContent
      ? 'origin-content'
      : 'origin-packaging';

    return `
      <article 
        class="reference-card mew-offer-card ${accentClass} ${isSelected ? 'card-selected' : ''}" 
        id="vault-card-${item.id}"
        data-id="${item.id}" 
        data-note-id="${item.noteId || item.id}"
        data-source-id="${item.sourceId || ''}"
        data-lens="${item.lens || item.vaultType}"
        data-step="2"
        tabindex="0"
      >
        
        <!-- Card Top Bar: Selection Checkbox & Origin Stamp Badge -->
        <div class="card-select-top-bar">
          <label class="card-select-label" title="ติ๊กเลือกคลิปนี้เพื่อนำไป Remix">
            <input type="checkbox" class="card-select-chk" data-chk-id="${item.id}" ${isSelected ? 'checked' : ''} />
            <span class="card-select-box"></span>
            <span class="card-select-txt">เลือกไป Remix</span>
          </label>
          <span class="origin-stamp-badge ${originClass}" data-vault-step="ข้อ 2">${originLabel}</span>
        </div>

        <!-- Card Creator Info & Vault Tag -->
        <div class="card-header-row">
          <div class="card-creator-wrap">
            <div class="card-creator-avatar ${vaultPillClass} font-num">${this.escapeHtml(item.creatorAvatar || 'CR')}</div>
            <div class="card-creator-info">
              <span class="card-creator-name">${this.escapeHtml(item.creator)}</span>
              <span class="card-creator-meta font-num">${this.escapeHtml(item.duration)} · ${this.escapeHtml(item.formattedDate)}</span>
            </div>
          </div>
          <span class="card-vault-pill ${vaultPillClass}">${vaultLabel}</span>
        </div>

        <!-- Card Thumbnail Preview (V6 Styled) -->
        <div class="card-thumbnail-wrap">
          <div class="card-thumbnail-media ${isContent ? 'coral-bg' : 'violet-bg'}">
            ${item.thumbnailUrl ? `<img src="${item.thumbnailUrl}" alt="${this.escapeHtml(item.title)}" class="card-thumbnail-img" loading="lazy" onerror="this.style.display='none'" />` : ''}
            <div class="thumbnail-overlay">
              <span class="thumbnail-play-badge" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </span>
              <span class="thumbnail-duration font-num">${this.escapeHtml(item.duration)}</span>
            </div>
          </div>
        </div>

        <!-- Title & Subtitle -->
        <h3 class="card-title-heading">${this.escapeHtml(item.title)}</h3>
        ${item.subtitle && item.subtitle !== item.title ? `<p class="card-subtitle-text">${this.escapeHtml(item.subtitle)}</p>` : ''}

        <!-- Topic Tags -->
        <div class="card-tags-row">
          ${tagsHtml}
        </div>

        <!-- Founder WHY Note Block (Prominent) -->
        <div class="card-founder-why-block founder-why-box ${isContent ? '' : 'violet'}">
          <div class="founder-why-eyebrow">
            <span class="founder-why-label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              FOUNDER WHY NOTE · ${isContent ? 'WHAT' : 'HOW'}
            </span>
            <span class="founder-why-date">Verified Decision</span>
          </div>
          <p class="founder-why-quote">“${this.escapeHtml(whyText)}”</p>
        </div>

        <!-- AI Insight Short Summary -->
        <div class="card-ai-insight-strip ai-insight-box">
          <div class="ai-strip-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <p class="ai-strip-text">${this.escapeHtml(item.aiInsight)}</p>
        </div>

        <!-- Actions Footer -->
        <div class="card-actions-footer">
          <a href="${this.escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="link-source">
            <span>ชมคลิป</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>

          <div class="card-actions-group" style="display: flex; gap: 0.5rem; align-items: center;">
            <button type="button" class="btn-card-review" aria-label="ดูรายละเอียดคลิป ${this.escapeHtml(item.title)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Review Detail</span>
            </button>

            <button type="button" class="btn-card-remix btn-use-in-remix" aria-label="นำคลิป ${this.escapeHtml(item.title)} ไปใช้ใน Remix">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Use in Remix</span>
            </button>
          </div>
        </div>

      </article>
    `;
  }

  /**
   * Updates real count numbers on vault tabs
   */
  updateCounters() {
    const contentCount = this.getVaultItems('content').length;
    const packagingCount = this.getVaultItems('packaging').length;

    if (this.dom.countContent) {
      this.dom.countContent.textContent = `${contentCount} ชิ้น`;
    }

    if (this.dom.countPackaging) {
      this.dom.countPackaging.textContent = `${packagingCount} ชิ้น`;
    }

    if (this.dom.overviewCountContent) {
      this.dom.overviewCountContent.textContent = `${contentCount} ชิ้น`;
    }

    if (this.dom.overviewCountPackaging) {
      this.dom.overviewCountPackaging.textContent = `${packagingCount} ชิ้น`;
    }
  }

  /**
   * Opens S05 Reference Detail Drawer
   * @param {string} id 
   */
  openDetailDrawer(id) {
    const item = this.references.find(r => r.id === id || r.noteId === id);
    if (!item) return;

    this.activeDetailId = item.id;
    this.lastFocusedElement = document.activeElement;

    const isContent = (item.lens || item.vaultType) === 'content';

    // Set Drawer theme classes
    if (this.dom.drawerPanel) {
      this.dom.drawerPanel.classList.remove('coral-accent', 'violet-bar', 'violet-accent');
      this.dom.drawerPanel.classList.add(isContent ? 'coral-accent' : 'violet-bar');
    }

    // Set badge and timestamps
    if (this.dom.drawerVaultBadge) {
      this.dom.drawerVaultBadge.className = `badge-pill ${isContent ? 'coral' : 'violet'}`;
      this.dom.drawerVaultBadge.textContent = isContent ? 'Content Vault · WHAT' : 'Packaging Vault · HOW';
    }

    if (this.dom.drawerSavedDate) {
      this.dom.drawerSavedDate.textContent = `บันทึกเมื่อ ${item.formattedDate}`;
    }

    if (this.dom.drawerTitle) this.dom.drawerTitle.textContent = item.title;
    if (this.dom.drawerDesc) this.dom.drawerDesc.textContent = item.subtitle || item.title;

    if (this.dom.drawerAuthorAvatar) this.dom.drawerAuthorAvatar.textContent = item.creatorAvatar || 'CR';
    if (this.dom.drawerAuthorName) this.dom.drawerAuthorName.textContent = item.creator;
    if (this.dom.drawerSourceInfo) this.dom.drawerSourceInfo.textContent = `Source Reference · ${item.duration}`;

    if (this.dom.drawerSourceUrl) {
      this.dom.drawerSourceUrl.href = item.sourceUrl || '#';
    }

    // Tags
    if (this.dom.drawerTagsList) {
      this.dom.drawerTagsList.innerHTML = (item.tags || []).map(tag => 
        `<span class="tag-filter-chip">${this.escapeHtml(tag)}</span>`
      ).join('');
    }

    // Reset inline edit mode
    this.cancelNoteEdit();
    if (this.dom.drawerFounderWhyText) this.dom.drawerFounderWhyText.textContent = item.founderWhy || item.why;
    if (this.dom.drawerAiInsightText) this.dom.drawerAiInsightText.textContent = item.aiInsight;

    // Beats timeline
    if (this.dom.drawerBeatsList) {
      this.dom.drawerBeatsList.innerHTML = (item.beats || []).map(b => `
        <div class="beat-strip-item">
          <span class="beat-timestamp font-num">${this.escapeHtml(b.time)}</span>
          <div class="beat-strip-text">
            <strong>${this.escapeHtml(b.title)}:</strong> ${this.escapeHtml(b.desc)}
          </div>
        </div>
      `).join('');
    }

    // Show backdrop
    if (this.dom.drawerBackdrop) {
      this.dom.drawerBackdrop.hidden = false;
      document.body.style.overflow = 'hidden';
      this.dom.btnCloseDrawer?.focus();
    }
  }

  /**
   * Closes S05 Reference Detail Drawer
   */
  closeDrawer() {
    if (this.dom.drawerBackdrop) {
      this.dom.drawerBackdrop.hidden = true;
      document.body.style.overflow = '';
    }

    this.cancelNoteEdit();
    this.activeDetailId = null;

    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
    }
  }

  /**
   * Toggles inline edit mode for Founder WHY Note
   */
  toggleNoteEdit() {
    if (!this.activeDetailId) return;
    const item = this.references.find(r => r.id === this.activeDetailId);
    if (!item) return;

    if (this.dom.displayWhyView) this.dom.displayWhyView.hidden = true;
    if (this.dom.formWhyEdit) this.dom.formWhyEdit.hidden = false;

    if (this.dom.inputDrawerEditNote) {
      const whyVal = item.founderWhy || item.why || '';
      this.dom.inputDrawerEditNote.value = whyVal;
      const count = whyVal.length;
      if (this.dom.drawerEditCharCount) {
        this.dom.drawerEditCharCount.textContent = `${count} ตัวอักษร`;
      }
      this.dom.inputDrawerEditNote.focus();
    }
  }

  /**
   * Cancels inline note editing
   */
  cancelNoteEdit() {
    if (this.dom.displayWhyView) this.dom.displayWhyView.hidden = false;
    if (this.dom.formWhyEdit) this.dom.formWhyEdit.hidden = true;
  }

  /**
   * Saves updated Founder WHY Note to central store and UI
   */
  saveDrawerNote() {
    if (!this.activeDetailId) return;
    const item = this.references.find(r => r.id === this.activeDetailId);
    if (!item) return;

    const newNote = this.dom.inputDrawerEditNote?.value.trim() || '';
    if (!newNote) {
      this.dom.inputDrawerEditNote?.focus();
      return;
    }

    item.founderWhy = newNote;
    item.why = newNote;

    // Dispatch update to central store
    try {
      if (typeof dispatch === 'function') {
        dispatch({
          type: 'UPDATE_NOTE',
          payload: {
            id: item.noteId || item.id,
            why: newNote
          }
        });
      }
    } catch (err) {
      console.warn('[LibraryController] Failed to dispatch UPDATE_NOTE:', err);
    }

    this.saveToStorage();

    // Update display view
    if (this.dom.drawerFounderWhyText) {
      this.dom.drawerFounderWhyText.textContent = newNote;
    }
    this.cancelNoteEdit();

    // Update card in grid immediately
    this.render();

    const isContent = (item.lens || item.vaultType) === 'content';
    this.showToast('Note Updated', 'อัปเดต Founder WHY Note เรียบร้อยแล้ว', isContent ? 'coral' : 'violet');
  }

  /**
   * Marks a reference for Remix Studio and notifies
   * @param {string} id 
   */
  useInRemix(id) {
    const item = this.references.find(r => r.id === id || r.noteId === id);
    if (!item) return;

    const noteId = item.noteId || item.id;
    const lens = item.lens || item.vaultType || 'content';

    // 1. Dispatch to store
    try {
      if (typeof dispatch === 'function') {
        dispatch({
          type: 'ADD_REMIX_INGREDIENT',
          payload: { lens, noteId }
        });
      }
    } catch (err) {
      console.warn('[LibraryController] Failed to dispatch ADD_REMIX_INGREDIENT:', err);
    }

    // 2. Persist to Remix basket in localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        const basket = JSON.parse(localStorage.getItem('mew_remix_basket') || '[]');
        const alreadyInBasket = basket.some(b => b.id === noteId);
        if (!alreadyInBasket) {
          basket.push({
            id: noteId,
            sourceId: item.sourceId,
            title: item.title,
            creator: item.creator,
            vaultType: lens,
            lens: lens,
            founderWhy: item.founderWhy || item.why,
            tags: item.tags
          });
          localStorage.setItem('mew_remix_basket', JSON.stringify(basket));
        }
      }
    } catch (err) {
      console.warn('[LibraryController] Failed to write to remix basket:', err);
    }

    // 3. Dispatch global DOM event for Remix Studio
    if (typeof window !== 'undefined') {
      const remixEvent = new CustomEvent('mew:remix-select-ingredient', {
        bubbles: true,
        detail: { ...item, noteId, lens }
      });
      window.dispatchEvent(remixEvent);
    }

    this.showToast(
      'Added to Remix', 
      `เพิ่ม "${item.title}" เข้าห้องทดลอง Remix Studio แล้ว`, 
      lens === 'content' ? 'coral' : 'violet'
    );

    // Bridge: Navigate directly to Remix Studio if global navigation is present
    if (typeof window !== 'undefined' && typeof window.switchView === 'function') {
      setTimeout(() => window.switchView('remix'), 450);
    }
  }

  /**
   * Saves current references to localStorage fallback
   */
  saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mew_saved_references', JSON.stringify(this.references));
      }
    } catch (err) {
      console.warn('[LibraryController] Failed to persist references:', err);
    }
  }

  /**
   * Displays toast notification
   * @param {string} title 
   * @param {string} desc 
   * @param {'coral'|'violet'|'green'} type 
   */
  showToast(title, desc, type = 'coral') {
    if (!this.dom || !this.dom.toastBox) return;

    if (this.toastTimer) clearTimeout(this.toastTimer);

    if (this.dom.toastTitle) this.dom.toastTitle.textContent = title;
    if (this.dom.toastDesc) this.dom.toastDesc.textContent = desc;

    if (this.dom.toastIcon) {
      this.dom.toastIcon.className = `toast-icon-circle ${type}`;
    }

    this.dom.toastBox.hidden = false;

    this.toastTimer = setTimeout(() => {
      this.hideToast();
    }, 3500);
  }

  /**
   * Hides toast notification
   */
  hideToast() {
    if (this.dom && this.dom.toastBox) {
      this.dom.toastBox.hidden = true;
    }
  }

  /**
   * Utility to safely escape HTML strings
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Global window registration for browser script environments
if (typeof window !== 'undefined') {
  window.FOUNDER_SAMPLE_REFERENCES = FOUNDER_SAMPLE_REFERENCES;
  window.LibraryController = LibraryController;
  window.getSavedReferencesFromStore = getSavedReferencesFromStore;
}

// Auto-initialize when loaded as a module if container exists
if (typeof document !== 'undefined') {
  const initLibrary = () => {
    const root = document.getElementById('library-root');
    if (root && !window.mewLibraryController) {
      window.mewLibraryController = new LibraryController({ rootId: root });
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLibrary);
  } else {
    initLibrary();
  }
}
