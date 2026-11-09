/**
 * ==============================================================================
 * MEW CONTENT OS — Topic T35: Keep-Going Inactivity Reminder & 20 Content Lifesaver Ideas Modal
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies · Zero Fake Metrics
 * Theme: mewteetawat.com V6.3 + Lime Lifesaver Accent (#C6F24E)
 *
 * Adapted from creator workflow philosophy:
 * - "หมดมุกแล้ว แต่ยังต้องโพสต์ทุกวัน · 20 ไอเดียช่วยชีวิตคนทำคอนเทนต์"
 * - "ทำยังไม่ดีก็ไม่เป็นไร ทำต่อไป ห้ามหยุด"
 *
 * Strict Compliance:
 * - Zero Fake Metrics: All inactivity days and vault counts are computed from real getState().
 * - Zero External Sales Pitch: No external course or LINE sales pitch.
 * - Approved UX Copy: Adheres strictly to scripts/lint-copy.js.
 * ==============================================================================
 */

import { getState, subscribe as subscribeStore } from './store.js';

export const SESSION_AUTOCONFIRM_KEY = 'mew-keep-going-autoconfirm-v1';
export const LOCAL_ACK_KEY = 'mew-keep-going-ack-v1';

export const CORE_KEEP_GOING_MANTRA =
  'ทำยังไม่ดีก็ไม่เป็นไร ทำต่อไป ห้ามหยุด — คอนเทนต์ที่ดีไม่ต้องเริ่มจากไอเดียใหม่เสมอ หยิบสิ่งที่มีอยู่แล้วมาเล่าต่อได้ทันที';

export const CATEGORY_LABELS = {
  all: 'ทั้งหมด (20)',
  customer: 'คำถาม & รีวิวลูกค้า',
  product: 'สินค้า & วิธีใช้งาน',
  'behind-the-scenes': 'เบื้องหลัง & มุมมองแบรนด์',
  repurpose: 'ต่อยอด & อัปเดตงานเดิม'
};

export const LENS_LABELS = {
  all: 'ทุกมิติ (WHAT + HOW)',
  content: 'Content (WHAT · แก่นสาระ)',
  packaging: 'Packaging (HOW · ลีลาการเล่า)'
};

/**
 * 20 Structured Content Lifesaver Ideas rewritten in MEW Content OS voice
 */
export const LIFESAVER_IDEAS = [
  {
    id: 'idea-01',
    number: 1,
    title: 'ตอบคำถามที่ลูกค้าถามบ่อย',
    subtitle: 'หยิบคำถามซ้ำ ๆ จากแชตหรือคอมเมนต์มาตอบทีละข้อแบบเข้าใจง่าย',
    category: 'customer',
    lens: 'content',
    formatHint: 'Q&A คลิปสั้น / สรุปคำตอบชัด ๆ',
    recommendedView: 'remix',
    promptHint: 'หยิบคำถามที่ลูกค้าถามซ้ำบ่อยที่สุดมาสกัดเป็นแก่นความรู้ ตอบตรงประเด็นโดยไม่อ้อมค้อม'
  },
  {
    id: 'idea-02',
    number: 2,
    title: 'โชว์การใช้งานจริงของสินค้า',
    subtitle: 'สาธิตเป็น How-to สั้น ๆ ให้เห็นขั้นตอนและผลลัพธ์ชัดเจน',
    category: 'product',
    lens: 'packaging',
    formatHint: 'Step-by-Step Demo / Hands-on Clip',
    recommendedView: 'research',
    promptHint: 'สาธิตขั้นตอนการใช้งานจริงแบบกระชับ ให้เห็นผลลัพธ์ตั้งแต่ 3 วินาทีแรก'
  },
  {
    id: 'idea-03',
    number: 3,
    title: 'แชร์ดีเทลเล็ก ๆ ที่ซ่อนอยู่ในสินค้า',
    subtitle: 'เล่าเหตุผลของวัสดุ ดีไซน์ หรือจุดเล็ก ๆ ที่ตั้งใจทำ',
    category: 'product',
    lens: 'content',
    formatHint: 'Close-up Detail / Craftsmanship Story',
    recommendedView: 'remix',
    promptHint: 'เจาะลึกเหตุผลเบื้องหลังการออกแบบหรือรายละเอียดเล็ก ๆ ที่สร้างคุณค่าให้ลูกค้าจริง'
  },
  {
    id: 'idea-04',
    number: 4,
    title: 'หยิบคอนเทนต์เก่าที่เคยเวิร์กมาเล่ามุมใหม่',
    subtitle: 'คนที่เพิ่งติดตามอาจยังไม่เคยเห็นหยิบมาอัปเดตให้เข้ากับวันนี้',
    category: 'repurpose',
    lens: 'packaging',
    formatHint: 'New Hook on Proven Core Idea',
    recommendedView: 'remix',
    promptHint: 'นำแก่นสาระเดิมที่พิสูจน์แล้วว่าคนสนใจ มาเปลี่ยน Hook และจังหวะการเล่าใหม่'
  },
  {
    id: 'idea-05',
    number: 5,
    title: 'เล่ารีวิวลูกค้าที่มีเรื่องราว',
    subtitle: 'เลือกเคสที่เห็นปัญหาก่อนใช้และการเปลี่ยนแปลงหลังใช้จริง',
    category: 'customer',
    lens: 'content',
    formatHint: 'Customer Story / Problem-to-Solution',
    recommendedView: 'remix',
    promptHint: 'เล่าเรื่องจริงของลูกค้าตั้งแต่จุดที่เจอปัญหา จนถึงวันที่แก้ปัญหาได้ด้วยสินค้าของเรา'
  },
  {
    id: 'idea-06',
    number: 6,
    title: 'พาไปดูเบื้องหลังการทำงานของแบรนด์',
    subtitle: 'ขั้นตอนคิดงาน ผลิต แพ็กของ หรือบรรยากาศทีม',
    category: 'behind-the-scenes',
    lens: 'packaging',
    formatHint: 'Behind the Scenes / Process Cut',
    recommendedView: 'research',
    promptHint: 'เปิดเผยขั้นตอนการทำงานจริงหลังบ้านเพื่อสร้างความโปร่งใสและความผูกพันกับผู้ติดตาม'
  },
  {
    id: 'idea-07',
    number: 7,
    title: 'เปรียบเทียบสินค้าหรือทางเลือก 2 แบบ',
    subtitle: 'สรุปชัด ๆ ว่าตัวไหนเหมาะกับใคร ต่างกันอย่างไร',
    category: 'product',
    lens: 'packaging',
    formatHint: 'Side-by-Side Comparison / Split Screen',
    recommendedView: 'remix',
    promptHint: 'เปรียบเทียบทางเลือก 2 แบบอย่างเป็นกลาง ชี้ชัดว่าแต่ละแบบเหมาะกับโจทย์ของใคร'
  },
  {
    id: 'idea-08',
    number: 8,
    title: 'โชว์วิธีใช้สินค้าในมุมที่คนคาดไม่ถึง',
    subtitle: 'ทริคหรือวิธีประยุกต์ใช้งานที่แปลกแต่มีประโยชน์จริง',
    category: 'product',
    lens: 'packaging',
    formatHint: 'Unexpected Use Case / Pattern Interrupt',
    recommendedView: 'research',
    promptHint: 'เปิดคลิปด้วยวิธีประยุกต์ใช้งานที่คนไม่ค่อยรู้แต่ช่วยแก้ปัญหาในชีวิตประจำวันได้จริง'
  },
  {
    id: 'idea-09',
    number: 9,
    title: 'แสดงมุมมองต่อเรื่องที่กำลังเป็นกระแส',
    subtitle: 'เชื่อมประเด็นร้อนเข้ากับจุดยืนและประสบการณ์ของแบรนด์',
    category: 'behind-the-scenes',
    lens: 'content',
    formatHint: 'Founder POV / Timely Commentary',
    recommendedView: 'remix',
    promptHint: 'เชื่อมโยงประเด็นที่คนกำลังพูดถึงเข้ากับมุมมองและปรัชญาการทำงานของแบรนด์อย่างจริงใจ'
  },
  {
    id: 'idea-10',
    number: 10,
    title: 'หยิบคอมเมนต์ลูกค้ามาต่อยอดเป็นโพสต์',
    subtitle: 'ตอบกลับด้วยเนื้อหาเต็มรูปแบบ ได้ทั้งใจและไอเดียสดใหม่',
    category: 'customer',
    lens: 'packaging',
    formatHint: 'Comment Callout / Visual Reply',
    recommendedView: 'remix',
    promptHint: 'ยกคอมเมนต์จริงของลูกค้าขึ้นหน้าจอเป็น Hook แล้วขยายคำตอบให้เป็นประโยชน์กับทุกคน'
  },
  {
    id: 'idea-11',
    number: 11,
    title: 'แนะนำชิ้นเริ่มต้นสำหรับลูกค้าใหม่',
    subtitle: 'ถ้าเพิ่งรู้จักแบรนด์วันนี้ ควรเริ่มจากตัวไหนเพราะอะไร',
    category: 'product',
    lens: 'content',
    formatHint: 'Starter Guide / First-Time Pick',
    recommendedView: 'remix',
    promptHint: 'ช่วยลดความลังเลของลูกค้าใหม่ด้วยการชี้เป้าตัวเริ่มต้นที่คุ้มค่าและเข้าใจง่ายที่สุด'
  },
  {
    id: 'idea-12',
    number: 12,
    title: 'เปิดรับคำถามจากผู้ติดตาม',
    subtitle: 'รวบรวมข้อสงสัยจริงมาทำคอนเทนต์ตอบหรือปรับปรุงสินค้า',
    category: 'customer',
    lens: 'content',
    formatHint: 'Audience Listening / Community Q&A',
    recommendedView: 'research',
    promptHint: 'ชวนผู้ติดตามส่งคำถามหรือปัญหาที่ติดอยู่ เพื่อนำมาสกัดเป็นซีรีส์คอนเทนต์แก้ปัญหาจริง'
  },
  {
    id: 'idea-13',
    number: 13,
    title: 'ทำคู่มือพื้นฐานสำหรับมือใหม่',
    subtitle: 'อธิบายตั้งแต่ศูนย์แบบคนไม่เคยรู้มาก่อน เข้าใจได้ทันที',
    category: 'product',
    lens: 'content',
    formatHint: 'Beginner Playbook / Zero-Jargon Guide',
    recommendedView: 'remix',
    promptHint: 'ปูพื้นฐานเรื่องยากให้กลายเป็นเรื่องง่ายแบบเป็นขั้นตอนสำหรับคนที่เพิ่งเริ่มต้นจากศูนย์'
  },
  {
    id: 'idea-14',
    number: 14,
    title: 'โชว์สินค้าในรูทีนชีวิตประจำวัน',
    subtitle: 'เช้า เย็น ก่อนนอน หรือเวลาทำงาน อยู่ตรงไหนของชีวิตลูกค้า',
    category: 'behind-the-scenes',
    lens: 'packaging',
    formatHint: 'Daily Routine / Real-Life Context',
    recommendedView: 'research',
    promptHint: 'ถ่ายทอดจังหวะการใช้งานจริงในชีวิตประจำวันให้คนดูจินตนาการภาพตัวเองใช้งานตามได้ทันที'
  },
  {
    id: 'idea-15',
    number: 15,
    title: 'จัดอันดับยอดนิยมจากข้อมูลจริง',
    subtitle: 'สินค้าขายดี ฟีเจอร์ที่คนถามถึงบ่อย หรือตัวเลือกที่คนชอบที่สุด',
    category: 'repurpose',
    lens: 'packaging',
    formatHint: 'Numbered Ranking / Honest Data Reveal',
    recommendedView: 'remix',
    promptHint: 'จัดอันดับจากข้อมูลจริงที่มีในระบบหรือเสียงตอบรับจริงของลูกค้า โดยไม่แต่งตัวเลขสมมติ'
  },
  {
    id: 'idea-16',
    number: 16,
    title: 'โชว์ 3 วิธีใช้สินค้าชิ้นเดียวกัน',
    subtitle: 'เปลี่ยนสถานการณ์ คนใช้ หรือโอกาสในการใช้งาน',
    category: 'repurpose',
    lens: 'packaging',
    formatHint: '3-Way Showcase / Multi-Scenario Cut',
    recommendedView: 'remix',
    promptHint: 'นำเสนอความคุ้มค่าด้วยโครงสร้าง 3 สถานการณ์ที่แตกต่างกันในคลิปเดียว'
  },
  {
    id: 'idea-17',
    number: 17,
    title: 'ทำคอนเทนต์ Before & After',
    subtitle: 'เทียบความต่างก่อนและหลังใช้งานให้เห็นภาพชัดเจน',
    category: 'product',
    lens: 'packaging',
    formatHint: 'Visual Transformation / Before vs After',
    recommendedView: 'research',
    promptHint: 'เปิดด้วยภาพเปรียบเทียบก่อนและหลังแก้ไขปัญหาอย่างซื่อสัตย์ ชัดเจนในพริบตา'
  },
  {
    id: 'idea-18',
    number: 18,
    title: 'เล่าเรื่องที่คนมักเข้าใจผิดเกี่ยวกับแบรนด์หรือสินค้า',
    subtitle: 'คลายความเข้าใจผิดด้วยข้อเท็จจริงที่ตรงไปตรงมา',
    category: 'behind-the-scenes',
    lens: 'content',
    formatHint: 'Myth vs Truth / Misconception Hook',
    recommendedView: 'remix',
    promptHint: 'เปิดด้วยความเชื่อที่คนมักเข้าใจผิด แล้วค่อยเฉลยข้อเท็จจริงอย่างตรงไปตรงมาและให้เกียรติคนดู'
  },
  {
    id: 'idea-19',
    number: 19,
    title: 'หยิบ 1 คำถามยอดฮิตมาอธิบายแบบเจาะลึก',
    subtitle: 'เปลี่ยนคำถามสั้น ๆ ให้เป็นคอนเทนต์วิเคราะห์เต็มโพสต์',
    category: 'customer',
    lens: 'content',
    formatHint: 'Deep-Dive Breakdown / Single Question',
    recommendedView: 'remix',
    promptHint: 'เลือกคำถามเดียวที่สำคัญที่สุด แล้วอธิบายเบื้องหลัง เหตุผล และวิธีนำไปใช้จริงอย่างละเอียด'
  },
  {
    id: 'idea-20',
    number: 20,
    title: 'อัปเดตคอนเทนต์เก่าด้วยข้อมูลและมุมมองใหม่',
    subtitle: 'ถ้าทำเรื่องนี้อีกครั้งในวันนี้ จะเปลี่ยนหรือเติมอะไรบ้าง',
    category: 'repurpose',
    lens: 'content',
    formatHint: 'Updated Perspective / Revisiting Proven Topic',
    recommendedView: 'remix',
    promptHint: 'ทบทวนคอนเทนต์ที่เคยทำไว้ในอดีต แล้วเติมมุมมองหรือบทเรียนใหม่ที่ได้เรียนรู้เพิ่มขึ้นในวันนี้'
  }
];

/**
 * Extracts all valid epoch timestamps from the store state collections.
 * Inspects savedNotes, concepts, boardItems, sources, analyses (updatedAt & createdAt).
 *
 * @param {object} state
 * @returns {number[]} Array of valid millisecond timestamps
 */
function collectStateTimestamps(state) {
  if (!state || typeof state !== 'object') return [];

  const collections = [
    state.savedNotes,
    state.concepts,
    state.boardItems,
    state.sources,
    state.analyses
  ];

  const timestamps = [];

  for (const list of collections) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      for (const field of ['updatedAt', 'createdAt']) {
        const raw = item[field];
        if (raw !== undefined && raw !== null && raw !== '') {
          const ms = typeof raw === 'number' ? raw : new Date(raw).getTime();
          if (Number.isFinite(ms) && ms > 0) {
            timestamps.push(ms);
          }
        }
      }
    }
  }

  if (state.lastKeepGoingAckAt) {
    const ackMs = typeof state.lastKeepGoingAckAt === 'number'
      ? state.lastKeepGoingAckAt
      : new Date(state.lastKeepGoingAckAt).getTime();
    if (Number.isFinite(ackMs) && ackMs > 0) {
      timestamps.push(ackMs);
    }
  }

  return timestamps;
}

/**
 * Computes honest inactivity status from central Store state.
 * Zero Fake Metrics: all counts and days are derived strictly from `state`.
 *
 * @param {object} [state=getState()]
 * @param {number|string|Date} [now=Date.now()]
 * @param {number} [thresholdDays=2]
 * @returns {{
 *   lastActivityAt: string|null,
 *   daysSinceLastActivity: number|null,
 *   thresholdDays: number,
 *   isInactive: boolean,
 *   severity: 'active' | 'nudge' | 'urgent',
 *   headline: string,
 *   subheadline: string,
 *   mantra: string,
 *   stats: { savedNotesCount: number, conceptsCount: number, boardItemsCount: number }
 * }}
 */
export function computeInactivityStatus(state = getState(), now = Date.now(), thresholdDays = 2) {
  const safeState = state && typeof state === 'object' ? state : {};
  const nowMs = typeof now === 'number' ? now : new Date(now).getTime();
  const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const safeThreshold = Number.isFinite(thresholdDays) && thresholdDays > 0 ? thresholdDays : 2;

  const stats = {
    savedNotesCount: Array.isArray(safeState.savedNotes) ? safeState.savedNotes.length : 0,
    conceptsCount: Array.isArray(safeState.concepts) ? safeState.concepts.length : 0,
    boardItemsCount: Array.isArray(safeState.boardItems) ? safeState.boardItems.length : 0
  };

  const timestamps = collectStateTimestamps(safeState);

  if (timestamps.length === 0) {
    return {
      lastActivityAt: null,
      daysSinceLastActivity: null,
      thresholdDays: safeThreshold,
      isInactive: true,
      severity: 'urgent',
      headline: 'แจ้งเตือน: ยังไม่มีกิจกรรมบันทึกหรือต่อยอดไอเดียในระบบ — เริ่มลงมือทำวันนี้ ห้ามหยุด!',
      subheadline:
        'อย่าปล่อยให้จังหวะหยุดชะงัก เลือก 1 ไอเดียช่วยชีวิตจาก 20 แนวทางด้านล่างเพื่อเริ่มบันทึกหรือสังเคราะห์คอนเทนต์ชิ้นแรกทันที',
      mantra: CORE_KEEP_GOING_MANTRA,
      stats
    };
  }

  const maxMs = Math.max(...timestamps);
  const lastActivityAt = new Date(maxMs).toISOString();
  const diffMs = Math.max(0, safeNowMs - maxMs);
  const daysSinceLastActivity = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isInactive = daysSinceLastActivity >= safeThreshold;

  let severity = 'active';
  if (daysSinceLastActivity >= 5) {
    severity = 'urgent';
  } else if (daysSinceLastActivity >= 2 || isInactive) {
    severity = 'nudge';
  }

  let headline = '';
  let subheadline = '';

  if (!isInactive) {
    headline =
      daysSinceLastActivity === 0
        ? 'วันนี้เครื่องกำลังร้อน ลุยต่อได้เลย! (อัปเดตล่าสุดวันนี้)'
        : `อัปเดตล่าสุดเมื่อ ${daysSinceLastActivity} วันที่แล้ว — วันนี้เครื่องกำลังร้อน ลุยต่อได้เลย!`;
    subheadline =
      `คลังของคุณมี ${stats.savedNotesCount} วัตถุดิบ, ${stats.conceptsCount} แนวคิด และ ${stats.boardItemsCount} รายการบนบอร์ด หยิบ 20 ไอเดียช่วยชีวิตไปต่อยอดความสม่ำเสมอได้ทันที`;
  } else if (severity === 'nudge') {
    headline = `แจ้งเตือนว่าไม่ได้บันทึกหรือต่อยอดไอเดียมา ${daysSinceLastActivity} วันแล้ว — ทำต่อไป ห้ามหยุด!`;
    subheadline =
      `อย่าปล่อยให้จังหวะหยุดชะงัก! คุณมีวัตถุดิบในคลัง ${stats.savedNotesCount} ชิ้น พร้อมหยิบมาผสมกับ 20 ไอเดียช่วยชีวิตด้านล่างได้ทันที`;
  } else {
    headline = `แจ้งเตือนด่วน: ไม่ได้บันทึกหรือต่อยอดไอเดียมา ${daysSinceLastActivity} วันแล้ว — กลับมาเดินเครื่องเดี๋ยวนี้ ห้ามหยุด!`;
    subheadline =
      `หมดมุกใช่ไหม? ไม่ต้องเริ่มจากศูนย์ เลือก 1 ไอเดียจาก 20 ไอเดียช่วยชีวิตคนทำคอนเทนต์ด้านล่าง แล้วส่งเข้า Remix Studio หรือ Research ทันที`;
  }

  return {
    lastActivityAt,
    daysSinceLastActivity,
    thresholdDays: safeThreshold,
    isInactive,
    severity,
    headline,
    subheadline,
    mantra: CORE_KEEP_GOING_MANTRA,
    stats
  };
}

/**
 * Filters the 20 Lifesaver Ideas by category, lens, and search query.
 *
 * @param {Array} [ideas=LIFESAVER_IDEAS]
 * @param {{ category?: string, lens?: string, query?: string }} [filters={}]
 * @returns {Array}
 */
export function filterLifesaverIdeas(
  ideas = LIFESAVER_IDEAS,
  { category = 'all', lens = 'all', query = '' } = {}
) {
  if (!Array.isArray(ideas)) return [];

  const normCategory = category ? String(category).trim().toLowerCase() : 'all';
  const normLens = lens ? String(lens).trim().toLowerCase() : 'all';
  const normQuery = query ? String(query).trim().toLowerCase() : '';

  return ideas.filter((idea) => {
    if (!idea) return false;

    if (normCategory !== 'all' && String(idea.category).toLowerCase() !== normCategory) {
      return false;
    }

    if (normLens !== 'all' && String(idea.lens).toLowerCase() !== normLens) {
      return false;
    }

    if (normQuery) {
      const searchable = [
        idea.id,
        String(idea.number),
        idea.title,
        idea.subtitle,
        idea.category,
        idea.lens,
        idea.formatHint,
        idea.promptHint,
        CATEGORY_LABELS[idea.category] || '',
        LENS_LABELS[idea.lens] || ''
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchable.includes(normQuery)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Picks a random Lifesaver Idea from the provided array using `randomFn`.
 *
 * @param {Array} [ideas=LIFESAVER_IDEAS]
 * @param {function(): number} [randomFn=Math.random]
 * @returns {object|null}
 */
export function pickRandomLifesaverIdea(ideas = LIFESAVER_IDEAS, randomFn = Math.random) {
  if (!Array.isArray(ideas) || ideas.length === 0) return null;

  const fn = typeof randomFn === 'function' ? randomFn : Math.random;
  const raw = Number(fn());
  const clamped = Number.isFinite(raw) ? Math.max(0, Math.min(0.999999, raw)) : 0;
  const index = Math.floor(clamped * ideas.length);
  return ideas[index] || ideas[0];
}

/**
 * Escapes HTML special characters safely.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * KeepGoingModalController — manages:
 * 1. S00 Keep-Going Overview Banner (`#s00-keep-going-banner`)
 * 2. Header Keep-Going Trigger Button (`#btn-header-keep-going`)
 * 3. Keep-Going Inactivity Reminder & 20 Content Lifesaver Ideas Modal (`#keep-going-modal-overlay`)
 */
export class KeepGoingModalController {
  constructor(options = {}) {
    this.root = options.root || (typeof document !== 'undefined' ? document : null);
    this.getStateFn = typeof options.getState === 'function' ? options.getState : getState;
    this.nowFn = typeof options.now === 'function' ? options.now : () => Date.now();
    this.thresholdDays = options.thresholdDays || 2;
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.sessionStorage =
      options.sessionStorage || (typeof sessionStorage !== 'undefined' ? sessionStorage : null);

    this.categoryFilter = 'all';
    this.lensFilter = 'all';
    this.searchQuery = '';
    this.simDays = 'real'; // 'real' | 0 | 3 | 7
    this.highlightedIdeaId = null;
    this.isOpen = false;
    this.unsubscribeStore = null;

    this.boundClickHandler = this.handleClick.bind(this);
    this.boundInputHandler = this.handleInput.bind(this);
    this.boundKeydownHandler = this.handleKeydown.bind(this);
  }

  /**
   * Initializes the controller, ensures required DOM structures exist, binds events,
   * renders real status, and evaluates session auto-open rules.
   *
   * @param {Document|HTMLElement} [rootElement]
   * @returns {KeepGoingModalController}
   */
  init(rootElement) {
    if (rootElement) {
      this.root = rootElement;
    } else if (!this.root && typeof document !== 'undefined') {
      this.root = document;
    }

    if (!this.root) return this;

    this.ensureDomStructure();
    this.bindEvents();
    this.render();

    if (typeof subscribeStore === 'function') {
      this.unsubscribeStore = subscribeStore(() => {
        this.render();
      });
    }

    this.evaluateAutoOpen();
    return this;
  }

  /**
   * Cleans up event listeners and store subscriptions.
   */
  destroy() {
    const targetDoc = this.getEventTarget();
    if (targetDoc && typeof targetDoc.removeEventListener === 'function') {
      targetDoc.removeEventListener('click', this.boundClickHandler);
      targetDoc.removeEventListener('input', this.boundInputHandler);
      targetDoc.removeEventListener('keydown', this.boundKeydownHandler);
    }

    if (typeof this.unsubscribeStore === 'function') {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
  }

  getEventTarget() {
    if (!this.root) return null;
    return this.root;
  }

  querySelector(selector) {
    if (!this.root || typeof this.root.querySelector !== 'function') return null;
    return this.root.querySelector(selector);
  }

  querySelectorAll(selector) {
    if (!this.root || typeof this.root.querySelectorAll !== 'function') return [];
    return Array.from(this.root.querySelectorAll(selector));
  }

  /**
   * Ensures `#keep-going-modal-overlay`, `#s00-keep-going-banner`, and `#btn-header-keep-going`
   * have their inner markup populated if mounted in a minimal test container.
   */
  ensureDomStructure() {
    const doc = typeof document !== 'undefined' ? document : null;
    const isDocumentRoot = this.root === doc;
    const hostContainer = isDocumentRoot ? doc?.body : this.root;
    if (!hostContainer || typeof hostContainer.appendChild !== 'function' || !doc) return;

    // 1. Ensure modal overlay exists and has inner structure
    let overlay = this.querySelector('#keep-going-modal-overlay');
    if (!overlay && !isDocumentRoot) {
      overlay = doc.createElement('div');
      overlay.id = 'keep-going-modal-overlay';
      overlay.className = 'keep-going-modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'keep-going-modal-title');
      overlay.setAttribute('hidden', '');
      overlay.setAttribute('aria-hidden', 'true');
      hostContainer.appendChild(overlay);
    }

    if (overlay && !overlay.querySelector('#keep-going-ideas-grid')) {
      overlay.innerHTML = this.buildModalInnerHtml();
    }

    // 2. Ensure S00 banner has inner markup if present but empty
    const banner = this.querySelector('#s00-keep-going-banner');
    if (banner && !banner.querySelector('#s00-keep-going-headline')) {
      banner.innerHTML = this.buildBannerInnerHtml();
    }
  }

  buildBannerInnerHtml() {
    return `
      <div class="keep-going-s00-card" id="s00-keep-going-card" data-severity="urgent">
        <div class="keep-going-s00-left">
          <div class="keep-going-s00-eyebrow-row">
            <span class="keep-going-severity-pill" id="s00-keep-going-severity">🔥 แจ้งเตือนความสม่ำเสมอ</span>
            <span class="keep-going-vault-mini-stat" id="s00-keep-going-vault-summary">คลังวัตถุดิบจริง: 0 Note · 0 Concept · 0 Board</span>
          </div>
          <h2 class="keep-going-s00-headline" id="s00-keep-going-headline">กำลังตรวจสอบความสม่ำเสมอในการทำคอนเทนต์...</h2>
          <p class="keep-going-s00-subheadline" id="s00-keep-going-subheadline">หยิบไอเดียช่วยชีวิตไปต่อยอดได้ทันที</p>
          <p class="keep-going-s00-mantra" id="s00-keep-going-mantra">${escapeHtml(CORE_KEEP_GOING_MANTRA)}</p>
        </div>
        <div class="keep-going-s00-actions">
          <button type="button" class="btn-pill btn-keep-going-lime" id="btn-s00-open-keep-going" data-action="open-keep-going-modal">
            <span aria-hidden="true">💡</span>
            <span>เปิดโพย 20 ไอเดียช่วยชีวิต</span>
          </button>
          <button type="button" class="btn-pill btn-ghost btn-keep-going-random-s00" id="btn-s00-random-idea" data-action="open-random-lifesaver">
            <span aria-hidden="true">🎲</span>
            <span>สุ่มไอเดียทำวันนี้</span>
          </button>
        </div>
      </div>
    `;
  }

  buildModalInnerHtml() {
    return `
      <div class="keep-going-modal-card mew-offer-card" role="document">
        <!-- Modal Top Header -->
        <div class="keep-going-modal-header">
          <div class="keep-going-title-group">
            <div class="keep-going-kicker-row">
              <span class="keep-going-lime-tag">KEEP GOING SYSTEM · T35</span>
              <span class="badge-pill soft">20 Content Lifesaver Ideas</span>
              <span class="badge-pill soft">Zero Fake Metrics</span>
            </div>
            <h2 id="keep-going-modal-title" class="keep-going-modal-title">
              หมดมุกแล้ว แต่ยังต้องโพสต์ทุกวัน · <span class="keep-going-highlight-underline">20 ไอเดียช่วยชีวิตคนทำคอนเทนต์</span>
            </h2>
          </div>
          <button type="button" class="btn-close-modal" id="btn-close-keep-going-modal" data-action="close-keep-going-modal" aria-label="ปิดหน้าต่าง 20 ไอเดียช่วยชีวิต">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Top Keep-Going Warning & Encouragement Banner -->
        <section class="keep-going-warning-banner" id="keep-going-warning-banner" data-severity="urgent" aria-label="สถานะความสม่ำเสมอและคำปลุกใจ">
          <div class="keep-going-warning-top">
            <div class="keep-going-warning-main">
              <div class="keep-going-badge-row">
                <span class="keep-going-severity-badge" id="keep-going-severity-badge">🔥 ห้ามหยุด! เตือนความสม่ำเสมอ</span>
                <span class="keep-going-days-pill" id="keep-going-days-pill">ตรวจสอบจากข้อมูลจริงในคลัง</span>
              </div>
              <h3 class="keep-going-warning-headline" id="keep-going-headline">แจ้งเตือนความสม่ำเสมอในการทำคอนเทนต์</h3>
              <p class="keep-going-warning-subheadline" id="keep-going-subheadline">เลือก 1 ไอเดียด้านล่างเพื่อเริ่มต้นทำคอนเทนต์วันนี้</p>
              <blockquote class="keep-going-mantra-box" id="keep-going-mantra">
                “${escapeHtml(CORE_KEEP_GOING_MANTRA)}”
              </blockquote>
            </div>

            <!-- Real Vault Counters + Demo Status Switcher -->
            <div class="keep-going-warning-side">
              <div class="keep-going-real-stats" aria-label="สถิติจริงจากคลังข้อมูล">
                <div class="keep-going-stat-item">
                  <span class="keep-going-stat-val font-num" id="keep-going-stat-notes" data-testid="keep-going-stat-notes">0</span>
                  <span class="keep-going-stat-lbl">Saved Notes</span>
                </div>
                <div class="keep-going-stat-item">
                  <span class="keep-going-stat-val font-num" id="keep-going-stat-concepts" data-testid="keep-going-stat-concepts">0</span>
                  <span class="keep-going-stat-lbl">Concepts</span>
                </div>
                <div class="keep-going-stat-item">
                  <span class="keep-going-stat-val font-num" id="keep-going-stat-board" data-testid="keep-going-stat-board">0</span>
                  <span class="keep-going-stat-lbl">Board Items</span>
                </div>
              </div>

              <div class="keep-going-sim-switcher" role="group" aria-label="ทดสอบสถานะจำนวนวันที่ไม่ได้อัปเดต">
                <span class="sim-switcher-label">จำลองสถานะ:</span>
                <div class="sim-switcher-pills">
                  <button type="button" class="sim-pill active" data-sim-days="real">ข้อมูลจริง</button>
                  <button type="button" class="sim-pill" data-sim-days="0">0 วัน (ไฟแรง)</button>
                  <button type="button" class="sim-pill" data-sim-days="3">3 วัน (เริ่มแผ่ว)</button>
                  <button type="button" class="sim-pill" data-sim-days="7">7 วัน (เตือนด่วน)</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Filter & Search Controls Bar -->
        <section class="keep-going-controls-bar" aria-label="ตัวกรองและค้นหาไอเดียช่วยชีวิต">
          <div class="keep-going-filter-row">
            <div class="keep-going-filter-group" role="group" aria-label="หมวดหมู่ไอเดีย">
              <span class="filter-group-label">หมวดหมู่:</span>
              <button type="button" class="kg-filter-pill active" data-category-filter="all">ทั้งหมด (20)</button>
              <button type="button" class="kg-filter-pill" data-category-filter="customer">ลูกค้า &amp; คำถาม</button>
              <button type="button" class="kg-filter-pill" data-category-filter="product">สินค้า &amp; วิธีใช้</button>
              <button type="button" class="kg-filter-pill" data-category-filter="behind-the-scenes">เบื้องหลัง &amp; มุมมอง</button>
              <button type="button" class="kg-filter-pill" data-category-filter="repurpose">ต่อยอดงานเดิม</button>
            </div>

            <div class="keep-going-filter-group" role="group" aria-label="เลนส์การวิเคราะห์">
              <span class="filter-group-label">Lens:</span>
              <button type="button" class="kg-lens-pill active" data-lens-filter="all">ทุกมิติ</button>
              <button type="button" class="kg-lens-pill lens-coral" data-lens-filter="content">Content (WHAT)</button>
              <button type="button" class="kg-lens-pill lens-violet" data-lens-filter="packaging">Packaging (HOW)</button>
            </div>
          </div>

          <div class="keep-going-search-row">
            <div class="keep-going-search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="search"
                id="keep-going-search"
                class="keep-going-search-input"
                placeholder="ค้นหาจาก 20 ไอเดีย เช่น คำถามลูกค้า, รีวิว, เบื้องหลัง, Before & After..."
                aria-label="ค้นหาไอเดียช่วยชีวิต"
              />
            </div>

            <button type="button" class="btn-pill btn-keep-going-random" id="btn-random-lifesaver">
              <span>🎲 สุ่ม 1 ไอเดียช่วยชีวิต</span>
            </button>
          </div>
        </section>

        <!-- 20 Lifesaver Ideas Grid -->
        <div class="keep-going-ideas-scroll" role="region" aria-label="รายการ 20 ไอเดียช่วยชีวิตคนทำคอนเทนต์">
          <div class="keep-going-ideas-grid" id="keep-going-ideas-grid">
            <!-- Rendered by KeepGoingModalController -->
          </div>
        </div>

        <!-- Modal Footer -->
        <footer class="keep-going-modal-footer">
          <div class="keep-going-footer-meta">
            <span id="keep-going-results-count">แสดง 20 จาก 20 ไอเดียช่วยชีวิต</span>
            <span class="keep-going-footer-sep" aria-hidden="true">·</span>
            <span class="keep-going-footer-hint">เลือกไอเดียเพื่อส่งเข้า Remix Studio หรือค้นหาคลิปอ้างอิงใน Research</span>
          </div>
          <div class="keep-going-footer-actions">
            <button type="button" class="btn-pill btn-primary btn-keep-going-commit" id="btn-keep-going-commit">
              <span>รับทราบ — ลุยทำคอนเทนต์ต่อ ไม่หยุด!</span>
            </button>
          </div>
        </footer>
      </div>
    `;
  }

  /**
   * Binds click, input, and keyboard events via delegation.
   */
  bindEvents() {
    const target = this.getEventTarget();
    if (!target || typeof target.addEventListener !== 'function') return;

    target.removeEventListener('click', this.boundClickHandler);
    target.removeEventListener('input', this.boundInputHandler);
    target.removeEventListener('keydown', this.boundKeydownHandler);

    target.addEventListener('click', this.boundClickHandler);
    target.addEventListener('input', this.boundInputHandler);
    target.addEventListener('keydown', this.boundKeydownHandler);
  }

  /**
   * Retrieves the stored acknowledgment timestamp from localStorage if available.
   * @returns {string|null}
   */
  getStoredAckTimestamp() {
    if (!this.storage || typeof this.storage.getItem !== 'function') return null;
    try {
      return this.storage.getItem(LOCAL_ACK_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Computes the effective inactivity status, taking into account `simDays` override
   * or stored acknowledgment timestamp.
   *
   * @param {object} [baseState]
   * @returns {ReturnType<typeof computeInactivityStatus>}
   */
  getEffectiveStatus(baseState = this.getStateFn()) {
    const rawState = baseState && typeof baseState === 'object' ? baseState : {};
    const nowMs = this.nowFn();

    if (this.simDays !== 'real' && Number.isFinite(Number(this.simDays))) {
      const days = Math.max(0, Number(this.simDays));
      const simulatedIso = new Date(nowMs - days * 86400000 - 1000).toISOString();
      const stripTimestamps = (arr) =>
        Array.isArray(arr)
          ? arr.map((item) => ({ ...item, createdAt: simulatedIso, updatedAt: simulatedIso }))
          : [];

      const simulatedState = {
        ...rawState,
        savedNotes:
          Array.isArray(rawState.savedNotes) && rawState.savedNotes.length > 0
            ? stripTimestamps(rawState.savedNotes)
            : [{ id: 'sim-note', createdAt: simulatedIso }],
        concepts: stripTimestamps(rawState.concepts),
        boardItems: stripTimestamps(rawState.boardItems),
        sources: stripTimestamps(rawState.sources),
        analyses: stripTimestamps(rawState.analyses),
        lastKeepGoingAckAt: simulatedIso
      };

      const computed = computeInactivityStatus(simulatedState, nowMs, this.thresholdDays);
      return {
        ...computed,
        stats: {
          savedNotesCount: Array.isArray(rawState.savedNotes) ? rawState.savedNotes.length : 0,
          conceptsCount: Array.isArray(rawState.concepts) ? rawState.concepts.length : 0,
          boardItemsCount: Array.isArray(rawState.boardItems) ? rawState.boardItems.length : 0
        }
      };
    }

    const ackTimestamp = this.getStoredAckTimestamp();
    const stateWithAck = ackTimestamp
      ? {
          ...rawState,
          lastKeepGoingAckAt: rawState.lastKeepGoingAckAt || ackTimestamp
        }
      : rawState;

    return computeInactivityStatus(stateWithAck, nowMs, this.thresholdDays);
  }

  /**
   * Checks whether the modal should auto-open once per session when inactive.
   * Skips auto-open when `navigator.webdriver === true` unless `?keepGoing=1` is present.
   */
  evaluateAutoOpen() {
    if (typeof window === 'undefined') return;

    let forceByQuery = false;
    try {
      const search = window.location?.search || '';
      const hash = window.location?.hash || '';
      if (search.includes('keepGoing=1') || hash.includes('keepGoing=1')) {
        forceByQuery = true;
      }
    } catch {
      forceByQuery = false;
    }

    if (forceByQuery) {
      this.open();
      return;
    }

    const isWebdriver = typeof navigator !== 'undefined' && navigator.webdriver === true;
    if (isWebdriver) {
      return;
    }

    let alreadyAutoOpened = false;
    if (this.sessionStorage && typeof this.sessionStorage.getItem === 'function') {
      try {
        alreadyAutoOpened = this.sessionStorage.getItem(SESSION_AUTOCONFIRM_KEY) === '1';
      } catch {
        alreadyAutoOpened = false;
      }
    }

    if (alreadyAutoOpened) return;

    const status = this.getEffectiveStatus();
    if (status.isInactive) {
      if (this.sessionStorage && typeof this.sessionStorage.setItem === 'function') {
        try {
          this.sessionStorage.setItem(SESSION_AUTOCONFIRM_KEY, '1');
        } catch {
          // Ignore storage restrictions
        }
      }
      this.open();
    }
  }

  /**
   * Opens the Keep-Going Modal.
   */
  open() {
    this.isOpen = true;
    const overlay = this.querySelector('#keep-going-modal-overlay');
    if (overlay) {
      overlay.removeAttribute('hidden');
      overlay.setAttribute('aria-hidden', 'false');
      if (overlay.classList) {
        overlay.classList.add('is-open');
      }
    }
    this.render();
  }

  /**
   * Closes the Keep-Going Modal.
   */
  close() {
    this.isOpen = false;
    const overlay = this.querySelector('#keep-going-modal-overlay');
    if (overlay) {
      overlay.setAttribute('hidden', '');
      overlay.setAttribute('aria-hidden', 'true');
      if (overlay.classList) {
        overlay.classList.remove('is-open');
      }
    }
  }

  /**
   * Sets simulation days ('real', 0, 3, 7) and re-renders.
   * @param {'real'|number|string} simValue
   */
  setSimulationDays(simValue) {
    if (simValue === 'real' || simValue === null || simValue === undefined) {
      this.simDays = 'real';
    } else {
      const parsed = Number(simValue);
      this.simDays = Number.isFinite(parsed) ? parsed : 'real';
    }
    this.render();
  }

  /**
   * Picks a random Lifesaver Idea, highlights it in the grid, and returns it.
   * @param {function(): number} [randomFn=Math.random]
   * @returns {object|null}
   */
  triggerRandomIdea(randomFn = Math.random) {
    let pool = filterLifesaverIdeas(LIFESAVER_IDEAS, {
      category: this.categoryFilter,
      lens: this.lensFilter,
      query: this.searchQuery
    });

    if (pool.length === 0) {
      this.categoryFilter = 'all';
      this.lensFilter = 'all';
      this.searchQuery = '';
      const searchEl = this.querySelector('#keep-going-search');
      if (searchEl) searchEl.value = '';
      pool = LIFESAVER_IDEAS;
    }

    const picked = pickRandomLifesaverIdea(pool, randomFn);
    if (!picked) return null;

    this.highlightedIdeaId = picked.id;
    this.renderIdeasGrid();

    const cardEl = this.querySelector(`[data-idea-id="${picked.id}"]`);
    if (cardEl && typeof cardEl.scrollIntoView === 'function') {
      try {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch {
        // Ignore in headless/mock DOM
      }
    }

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`🎲 สุ่มได้ไอเดีย #${picked.number}: ${picked.title}`, 'violet');
    }

    return picked;
  }

  /**
   * Dispatches an action for a specific Lifesaver Idea ('remix' or 'research').
   * @param {string} ideaId
   * @param {'remix'|'research'} actionType
   */
  handleIdeaAction(ideaId, actionType) {
    const idea = LIFESAVER_IDEAS.find((item) => item.id === ideaId) || LIFESAVER_IDEAS[0];
    if (!idea) return;

    this.close();

    if (actionType === 'remix') {
      if (typeof window !== 'undefined' && typeof window.switchView === 'function') {
        window.switchView('remix');
      }

      // Pre-fill remix direction input if present
      const directionText = `[ไอเดียช่วยชีวิต #${idea.number}: ${idea.title}] ${idea.subtitle} — ${idea.promptHint}`;
      const directionInputs = [
        this.querySelector('#input-our-pov'),
        this.querySelector('#remix-direction-input'),
        this.querySelector('[data-remix-direction-input]')
      ].filter(Boolean);

      for (const inputEl of directionInputs) {
        inputEl.value = directionText;
        if (typeof inputEl.dispatchEvent === 'function' && typeof Event !== 'undefined') {
          try {
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          } catch {
            // Ignore in minimal mock environments
          }
        }
      }

      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast(
          `ส่งไอเดีย #${idea.number} “${idea.title}” เข้าสู่ Remix Studio แล้ว`,
          'violet'
        );
      }
      return;
    }

    if (actionType === 'research') {
      if (typeof window !== 'undefined' && typeof window.switchView === 'function') {
        window.switchView('research');
      }

      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast(
          `เปิด Research Studio สำหรับหาคลิปอ้างอิงไอเดีย #${idea.number} “${idea.title}”`,
          'coral'
        );
      }
    }
  }

  /**
   * Records Keep-Going commitment acknowledgment in localStorage, refreshes status, and closes modal.
   */
  handleCommitAcknowledgment() {
    const ackIso = new Date(this.nowFn()).toISOString();

    if (this.storage && typeof this.storage.setItem === 'function') {
      try {
        this.storage.setItem(LOCAL_ACK_KEY, ackIso);
      } catch {
        // Ignore storage write errors
      }
    }

    const currentState = this.getStateFn();
    if (currentState && typeof currentState === 'object') {
      currentState.lastKeepGoingAckAt = ackIso;
    }

    this.simDays = 'real';
    this.render();
    this.close();

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast('🔥 รับทราบ! ลุยทำคอนเทนต์ต่อ ไม่หยุด!', 'coral');
    }
  }

  /**
   * Renders the header button, S00 banner, modal warning banner, filter states, and 20 idea cards.
   */
  render() {
    const status = this.getEffectiveStatus();
    this.currentStatus = status;

    this.renderHeaderButton(status);
    this.renderS00Banner(status);
    this.renderModalBanner(status);
    this.renderFilterStates();
    this.renderIdeasGrid();
  }

  renderHeaderButton(status) {
    const btn = this.querySelector('#btn-header-keep-going');
    if (!btn) return;

    btn.setAttribute('data-severity', status.severity);

    const badgeText =
      status.daysSinceLastActivity === null
        ? '🔥 ห้ามหยุด! (เริ่มวันนี้)'
        : status.isInactive
          ? `🔥 ห้ามหยุด! (${status.daysSinceLastActivity} วัน)`
          : '⚡ 20 ไอเดียช่วยชีวิต';

    const labelEl = btn.querySelector('#header-keep-going-label');
    if (labelEl) {
      labelEl.textContent = badgeText;
    } else {
      btn.textContent = badgeText;
    }
  }

  renderS00Banner(status) {
    const banner = this.querySelector('#s00-keep-going-banner');
    if (!banner) return;

    banner.setAttribute('data-severity', status.severity);

    const card = banner.querySelector('#s00-keep-going-card');
    if (card) {
      card.setAttribute('data-severity', status.severity);
    }

    const sevEl = banner.querySelector('#s00-keep-going-severity');
    if (sevEl) {
      sevEl.textContent =
        status.severity === 'urgent'
          ? '🚨 เตือนด่วน · ห้ามหยุดทำคอนเทนต์'
          : status.severity === 'nudge'
            ? '🔥 สะกิดเตือนจังหวะ · อย่าปล่อยให้ขาดช่วง'
            : '⚡ จังหวะต่อเนื่องดีเยี่ยม · เครื่องกำลังร้อน';
    }

    const vaultSummaryEl = banner.querySelector('#s00-keep-going-vault-summary');
    if (vaultSummaryEl) {
      vaultSummaryEl.textContent = `คลังวัตถุดิบจริง: ${status.stats.savedNotesCount} Note · ${status.stats.conceptsCount} Concept · ${status.stats.boardItemsCount} Board`;
    }

    const headlineEl = banner.querySelector('#s00-keep-going-headline');
    if (headlineEl) headlineEl.textContent = status.headline;

    const subheadlineEl = banner.querySelector('#s00-keep-going-subheadline');
    if (subheadlineEl) subheadlineEl.textContent = status.subheadline;

    const mantraEl = banner.querySelector('#s00-keep-going-mantra');
    if (mantraEl) mantraEl.textContent = status.mantra;
  }

  renderModalBanner(status) {
    const warningBanner = this.querySelector('#keep-going-warning-banner');
    if (warningBanner) {
      warningBanner.setAttribute('data-severity', status.severity);
    }

    const sevBadge = this.querySelector('#keep-going-severity-badge');
    if (sevBadge) {
      sevBadge.setAttribute('data-severity', status.severity);
      sevBadge.textContent =
        status.severity === 'urgent'
          ? '🚨 URGENT REMINDER · ห้ามหยุดโพสต์!'
          : status.severity === 'nudge'
            ? '🔥 KEEP-GOING NUDGE · อย่าปล่อยให้จังหวะสะดุด'
            : '⚡ ACTIVE STREAK · เครื่องกำลังร้อน ลุยต่อ!';
    }

    const daysPill = this.querySelector('#keep-going-days-pill');
    if (daysPill) {
      daysPill.textContent =
        status.daysSinceLastActivity === null
          ? 'ยังไม่มีประวัติกิจกรรมในคลัง'
          : status.daysSinceLastActivity === 0
            ? 'อัปเดตคลังล่าสุด: วันนี้ (0 วัน)'
            : `ห่างจากกิจกรรมล่าสุด: ${status.daysSinceLastActivity} วัน`;
    }

    const headlineEl = this.querySelector('#keep-going-headline');
    if (headlineEl) headlineEl.textContent = status.headline;

    const subheadlineEl = this.querySelector('#keep-going-subheadline');
    if (subheadlineEl) subheadlineEl.textContent = status.subheadline;

    const mantraEl = this.querySelector('#keep-going-mantra');
    if (mantraEl) mantraEl.textContent = `“${status.mantra}”`;

    const notesEl = this.querySelector('#keep-going-stat-notes');
    if (notesEl) notesEl.textContent = String(status.stats.savedNotesCount);

    const conceptsEl = this.querySelector('#keep-going-stat-concepts');
    if (conceptsEl) conceptsEl.textContent = String(status.stats.conceptsCount);

    const boardEl = this.querySelector('#keep-going-stat-board');
    if (boardEl) boardEl.textContent = String(status.stats.boardItemsCount);

    // Sync simulation switcher active state
    const simButtons = this.querySelectorAll('[data-sim-days]');
    for (const btn of simButtons) {
      const val = btn.getAttribute('data-sim-days');
      const isMatch = String(this.simDays) === String(val);
      if (btn.classList) {
        btn.classList.toggle('active', isMatch);
      }
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    }
  }

  renderFilterStates() {
    const catButtons = this.querySelectorAll('[data-category-filter]');
    for (const btn of catButtons) {
      const cat = btn.getAttribute('data-category-filter');
      const isActive = cat === this.categoryFilter;
      if (btn.classList) btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }

    const lensButtons = this.querySelectorAll('[data-lens-filter]');
    for (const btn of lensButtons) {
      const lens = btn.getAttribute('data-lens-filter');
      const isActive = lens === this.lensFilter;
      if (btn.classList) btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
  }

  renderIdeasGrid() {
    const grid = this.querySelector('#keep-going-ideas-grid');
    if (!grid) return;

    const filtered = filterLifesaverIdeas(LIFESAVER_IDEAS, {
      category: this.categoryFilter,
      lens: this.lensFilter,
      query: this.searchQuery
    });

    const countEl = this.querySelector('#keep-going-results-count');
    if (countEl) {
      countEl.textContent = `แสดง ${filtered.length} จาก ${LIFESAVER_IDEAS.length} ไอเดียช่วยชีวิต`;
    }

    if (typeof grid.setAttribute === 'function') {
      grid.setAttribute('data-rendered-count', String(filtered.length));
      grid.setAttribute('data-highlighted-idea-id', this.highlightedIdeaId || '');
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="keep-going-empty-state" id="keep-going-empty-state">
          <p class="empty-state-title">ไม่พบไอเดียที่ตรงกับคำค้นหาหรือตัวกรองนี้</p>
          <button type="button" class="btn-pill btn-ghost" data-action="reset-keep-going-filters">
            ล้างตัวกรองเพื่อดูทั้ง 20 ไอเดีย
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((idea) => {
        const isHighlighted = this.highlightedIdeaId === idea.id;
        const lensBadgeClass = idea.lens === 'content' ? 'coral' : 'violet';
        const lensBadgeText = idea.lens === 'content' ? 'WHAT · Content' : 'HOW · Packaging';
        const categoryText = CATEGORY_LABELS[idea.category] || idea.category;

        return `
          <article
            class="lifesaver-idea-card${isHighlighted ? ' is-highlighted' : ''}"
            data-idea-id="${escapeHtml(idea.id)}"
            data-category="${escapeHtml(idea.category)}"
            data-lens="${escapeHtml(idea.lens)}"
          >
            <div class="lifesaver-card-top">
              <div class="lifesaver-number-badge" aria-label="ไอเดียที่ ${idea.number}">${idea.number}</div>
              <div class="lifesaver-badges-wrap">
                <span class="badge-pill ${lensBadgeClass} lifesaver-lens-pill">${escapeHtml(lensBadgeText)}</span>
                <span class="lifesaver-cat-tag">${escapeHtml(categoryText)}</span>
              </div>
            </div>

            <div class="lifesaver-card-body">
              <h3 class="lifesaver-card-title">${escapeHtml(idea.title)}</h3>
              <p class="lifesaver-card-subtitle">${escapeHtml(idea.subtitle)}</p>
              <div class="lifesaver-format-hint">
                <span class="format-label">รูปแบบแนะนำ:</span>
                <span>${escapeHtml(idea.formatHint)}</span>
              </div>
            </div>

            <div class="lifesaver-card-actions">
              <button
                type="button"
                class="btn-lifesaver-action btn-lifesaver-remix"
                data-idea-action="remix"
                data-idea-id="${escapeHtml(idea.id)}"
              >
                <span>นำไป Remix ต่อ</span>
              </button>
              <button
                type="button"
                class="btn-lifesaver-action btn-lifesaver-research"
                data-idea-action="research"
                data-idea-id="${escapeHtml(idea.id)}"
              >
                <span>หาคลิปอ้างอิง</span>
              </button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  handleClick(event) {
    const target = event?.target;
    if (!target || typeof target.closest !== 'function') return;

    // 1. Open modal triggers
    const openBtn = target.closest(
      '#btn-header-keep-going, #btn-s00-open-keep-going, [data-action="open-keep-going-modal"]'
    );
    if (openBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      this.open();
      return;
    }

    // 2. Open modal & immediately roll a random lifesaver idea
    const openRandomBtn = target.closest('#btn-s00-random-idea, [data-action="open-random-lifesaver"]');
    if (openRandomBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      this.open();
      this.triggerRandomIdea();
      return;
    }

    // 3. Close modal button or backdrop click
    const closeBtn = target.closest(
      '#btn-close-keep-going-modal, [data-action="close-keep-going-modal"]'
    );
    if (closeBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      this.close();
      return;
    }

    if (target.id === 'keep-going-modal-overlay') {
      this.close();
      return;
    }

    // 4. Simulation switcher buttons (`[data-sim-days]`)
    const simBtn = target.closest('[data-sim-days]');
    if (simBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      const simDays = simBtn.getAttribute('data-sim-days');
      this.setSimulationDays(simDays);
      return;
    }

    // 5. Category filter pills (`[data-category-filter]`)
    const catBtn = target.closest('[data-category-filter]');
    if (catBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      this.categoryFilter = catBtn.getAttribute('data-category-filter') || 'all';
      this.renderFilterStates();
      this.renderIdeasGrid();
      return;
    }

    // 6. Lens filter pills (`[data-lens-filter]`)
    const lensBtn = target.closest('[data-lens-filter]');
    if (lensBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      this.lensFilter = lensBtn.getAttribute('data-lens-filter') || 'all';
      this.renderFilterStates();
      this.renderIdeasGrid();
      return;
    }

    // 7. Reset filters button
    const resetBtn = target.closest('[data-action="reset-keep-going-filters"]');
    if (resetBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      this.categoryFilter = 'all';
      this.lensFilter = 'all';
      this.searchQuery = '';
      const searchEl = this.querySelector('#keep-going-search');
      if (searchEl) searchEl.value = '';
      this.renderFilterStates();
      this.renderIdeasGrid();
      return;
    }

    // 8. Random Lifesaver Idea button (`#btn-random-lifesaver`)
    const randomBtn = target.closest('#btn-random-lifesaver');
    if (randomBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      this.triggerRandomIdea();
      return;
    }

    // 9. Idea card action buttons (`[data-idea-action="remix" | "research"]`)
    const actionBtn = target.closest('[data-idea-action]');
    if (actionBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      const actionType = actionBtn.getAttribute('data-idea-action');
      const card = actionBtn.closest('[data-idea-id]');
      const ideaId = actionBtn.getAttribute('data-idea-id') || card?.getAttribute('data-idea-id');
      this.handleIdeaAction(ideaId, actionType);
      return;
    }

    // 10. Commit acknowledgment button (`#btn-keep-going-commit`)
    const commitBtn = target.closest('#btn-keep-going-commit');
    if (commitBtn) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      this.handleCommitAcknowledgment();
    }
  }

  handleInput(event) {
    const target = event?.target;
    if (!target) return;

    if (target.id === 'keep-going-search') {
      this.searchQuery = target.value || '';
      this.renderIdeasGrid();
    }
  }

  handleKeydown(event) {
    if (event?.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }
}

export const keepGoingModalController = new KeepGoingModalController();

export function openKeepGoingModal() {
  keepGoingModalController.open();
}

export function closeKeepGoingModal() {
  keepGoingModalController.close();
}

export function initKeepGoingModal(root) {
  return keepGoingModalController.init(root);
}

// Auto-initialize in browser environment and attach global hooks
if (typeof window !== 'undefined') {
  window.KeepGoingModalController = KeepGoingModalController;
  window.keepGoingModalController = keepGoingModalController;
  window.openKeepGoingModal = openKeepGoingModal;
  window.closeKeepGoingModal = closeKeepGoingModal;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initKeepGoingModal(document);
      });
    } else {
      initKeepGoingModal(document);
    }
  }
}
