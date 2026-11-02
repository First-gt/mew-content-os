/**
 * ==============================================================================
 * MEW CONTENT OS - S08 & S09 Content Board, Script & Director Brief Controller
 * Theme: mewteetawat.com V6.3 (Warm Stone, Coral, Violet & Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG AA/AAA
 * ==============================================================================
 */

// Authentic default founder concepts for Mew Teetawat Content Pipeline
const DEFAULT_BOARD_ITEMS = [
  {
    id: 'board-item-1',
    conceptId: 'concept-story-a',
    title: 'Post and forget it: กฎ 3 ข้อที่ทำให้เลิกแคร์ยอดวิว',
    angle: 'Perspective Shift & Detachment',
    stage: 'ready', // 'draft' | 'review' | 'approved' | 'ready'
    isApproved: true,
    approvedRevision: {
      code: 'REV-2026-004',
      approvedBy: 'Mew Teetawat',
      timestamp: '2026-10-31T14:30:00Z',
      signature: 'MT-LOCKED-PROD-9A71B'
    },
    targetAudience: 'Solo Creator และ Founder ที่เหนื่อยกับการนั่งเฝ้ายอดวิวหลังโพสต์ จนเกิดอาการเบิร์นเอาท์และหมดไฟสร้างสรรค์',
    creativeRationale: 'เปลี่ยนมุมมองของคนทำงานสร้างสรรค์จากการมองคอนเทนต์เป็นเครื่องวัดคุณค่าตนเองชั่วคราว ให้กลายเป็นการสะสม Evergreen Brand Asset ในระยะยาวตามปรัชญาของ MEW Content OS',
    hook: 'ถ้าคุณยังไม่กล้าปล่อยคลิปแล้วเดินออกไปใช้ชีวิต... คุณไม่ได้กำลังทำคอนเทนต์เพื่อคนดู แต่คุณกำลังทำเพื่อสนองอัลกอริทึม',
    teleprompterScript: `[SCENE 1 - 0:00 - 0:04]
ถ้าคุณยังไม่กล้าปล่อยคลิปแล้วเดินออกไปใช้ชีวิต... คุณไม่ได้กำลังทำคอนเทนต์เพื่อคนดู แต่คุณกำลังทำเพื่อสนองอัลกอริทึม

[SCENE 2 - 0:05 - 0:28]
สังเกตไหมครับ? ทันทีที่เรากดปุ่มเผยแพร่ สมองเราจะสั่งให้รีเฟรชหน้าจอทุก 3 นาที ดูยอดวิว ดูยอดไลก์ พอยอดขึ้นช้า เราก็เริ่มสงสัยในคุณค่าของสิ่งที่ตัวเองพูด วงจรนี้แหละครับที่กำลังขโมยพลังงานการคิดงานชิ้นต่อไปของคุณไปจนหมด

[SCENE 3 - 0:29 - 1:12]
ผมใช้วิธีแก้ด้วยกฎเหล็ก 3 ข้อใน MEW Content OS:
ข้อแรก: แยก 'งานสร้าง' ออกจาก 'ผลลัพธ์' คุณค่าของสิ่งที่คุณพูดจบลงตั้งแต่จังหวะที่คุณกดบันทึกแล้ว
ข้อสอง: ปิดแอปพลิเคชันทันทีหลังโพสต์อย่างน้อย 2 ชั่วโมง เพื่อนำโฟกัสกลับมาอยู่กับชีวิตจริงและงานข้างหน้า
ข้อสาม: วัดผลที่ความสม่ำเสมอและคุณภาพของสาระ (Content Vault) ไม่ใช่วัดที่ความผันผวนของระบบจัดอันดับ

[SCENE 4 - 1:13 - 1:30]
ลองทำแบบนี้ในคลิปต่อไปของคุณดูครับ แล้วคุณจะพบว่า ความคิดสร้างสรรค์ที่ดีที่สุดจะเกิดขึ้นตอนที่คุณเลิกเฝ้าหน้าจอ`,
    beats: [
      {
        title: 'Beat 1: Pattern Interrupt Hook',
        timecode: '0:00 - 0:04',
        desc: 'เปิดคลิปด้วยประโยคสะกิดความเชื่อเดิมท้าทายพฤติกรรมรีเฟรชหน้าจอ'
      },
      {
        title: 'Beat 2: Agitation of the Loop',
        timecode: '0:05 - 0:28',
        desc: 'เผยให้เห็นต้นตอความเครียดจากการผูกคุณค่าของงานไว้กับยอดวิวชั่วข้ามคืน'
      },
      {
        title: 'Beat 3: Founder Solution (Rule of 3)',
        timecode: '0:29 - 1:12',
        desc: 'นำเสนอกรอบคิด 3 ข้อ: Detachment, App Shutdown, Consistency Metric'
      },
      {
        title: 'Beat 4: Organic Takeaway & CTA',
        timecode: '1:13 - 1:30',
        desc: 'ชวนให้ทดลองนำระบบนี้ไปใช้ในงานชิ้นถัดไปเพื่อรักษาความต่อเนื่อง'
      }
    ],
    sceneDirection: 'กล้องหลัก A-Cam Eye-level Medium Close-Up คว่ำหน้าจอสมาร์ทโฟนลงบนโต๊ะทำงานไม้ในวินาทีที่ 0:06 จากนั้นตัดสลับไป B-Cam Profile 45 องศาเพื่อเน้นความจริงใจ',
    soundDirection: 'เปิดด้วยเสียงเคาะ Metronome จังหวะคงที่ 3 วินาทีแรกตามด้วยเสียงพูดชัดเจน ไร้เสียงก้อง ดนตรี Ambient โทนสุขุม ducking ที่ -24dB',
    claimVerification: 'ตรวจสอบแล้ว: อิงจากประสบการณ์ตรงของผู้ก่อตั้ง ปราศจากตัวเลขสถิติสมมติ 100%',
    cta: 'ลองวางมือถือหลังโพสต์คลิปนี้ แล้วกลับมาโฟกัสกับสิ่งที่คุณกำลังสร้าง',
    sourceWhat: 'Post and forget it (Mew Teetawat)',
    sourceHow: 'The Ticking Clock (Ali Abdaal)',
    estimatedRuntime: '~90 วินาที',
    wordCount: 168,
    createdAt: '2026-10-30T10:15:00Z'
  },
  {
    id: 'board-item-2',
    conceptId: 'concept-story-b',
    title: 'สูตรสร้างงานสม่ำเสมอ: แยก "สาระ" ออกจาก "วิธีเล่า"',
    angle: 'Framework & Systematic Output',
    stage: 'approved',
    isApproved: true,
    approvedRevision: {
      code: 'REV-2026-003',
      approvedBy: 'Mew Teetawat',
      timestamp: '2026-10-31T11:00:00Z',
      signature: 'MT-LOCKED-REV-4C28E'
    },
    targetAudience: 'ผู้ประกอบการและทีมสร้างคอนเทนต์ที่มักเจอปัญหาทางตัน (Writer\'s Block) เมื่อต้องเริ่มต้นทำคลิป',
    creativeRationale: 'สาธิตพลังของสมการ C(N) + P(N) ที่แยกคลังความคิด (Content Vault) ออกจากคลังลูกเล่น (Packaging Vault) ทำให้สมองไม่แบกรับภาระคิดสองสิ่งพร้อมกัน',
    hook: 'คุณไม่ได้ขาดแรงบันดาลใจ... แต่คุณกำลังพยายามคิดเรื่องที่จะพูด พร้อมกับคิดว่าจะพูดยังไงไปในวินาทีเดียวกัน',
    teleprompterScript: `[SCENE 1 - 0:00 - 0:04]
คุณไม่ได้ขาดแรงบันดาลใจ... แต่คุณกำลังพยายามคิดเรื่องที่จะพูด พร้อมกับคิดว่าจะพูดยังไงไปในวินาทีเดียวกัน

[SCENE 2 - 0:05 - 0:30]
ปัญหาของคนส่วนใหญ่คือเปิดกระดาษเปล่าขึ้นมา แล้วอยากให้มันมีทั้งเนื้อหาที่ลึกซึ้ง และมีท่อนเปิดที่ไวรัลในทันที สมองของเราไม่ได้ถูกออกแบบมาให้ทำหน้าที่นักคิดและนักกำกับการแสดงไปพร้อมกันครับ

[SCENE 3 - 0:31 - 1:15]
ทางออกที่ได้ผลจริงคือการแยก 2 คลังออกจากกัน:
ฝั่งซ้ายคือ Content Vault: เก็บเฉพาะความจริง สัจธรรม และประสบการณ์จริง
ฝั่งขวาคือ Packaging Vault: เก็บเฉพาะจังหวะการตัดต่อ มุมกล้อง และลูกเล่นเสียง
เมื่อถึงเวลาทำงาน คุณเพียงแค่หยิบสาระหนึ่งเรื่องมาประกอบกับวิธีเล่าหนึ่งแบบ ไอเดียจะเกิดขึ้นทันทีโดยไม่ต้องรอแรงบันดาลใจ

[SCENE 4 - 1:16 - 1:35]
เริ่มต้นบันทึกแก่นคิดของคุณแยกไว้ตั้งแต่วันนี้ แล้วคุณจะไม่เคยเจอกับอาการคิดงานไม่ออกอีกเลย`,
    beats: [
      {
        title: 'Beat 1: Direct Observation',
        timecode: '0:00 - 0:04',
        desc: 'ชี้ให้เห็นสาเหตุแท้จริงของอาการทางตันในการสร้างคอนเทนต์'
      },
      {
        title: 'Beat 2: Cognitive Overload',
        timecode: '0:05 - 0:30',
        desc: 'อธิบายภาระสมองเมื่อพยายามคิดสาระและลูกเล่นไปพร้อมกัน'
      },
      {
        title: 'Beat 3: Dual-Vault Solution',
        timecode: '0:31 - 1:15',
        desc: 'แสดงให้เห็นการเชื่อมต่อระหว่าง Content Vault กับ Packaging Vault'
      },
      {
        title: 'Beat 4: Immediate Action',
        timecode: '1:16 - 1:35',
        desc: 'คำแนะนำให้เริ่มแยกบันทึกข้อมูลตั้งแต่วันนี้'
      }
    ],
    sceneDirection: 'กราฟิกสองฝั่ง (Split Visual) แสดงความแตกต่างของสาระและวิธีการนำเสนอ สลับกับช็อตผู้ก่อตั้งอธิบายหน้ากระดานอย่างเป็นขั้นตอน',
    soundDirection: 'เสียงเปิดสมุดบันทึกและเสียงเคาะคีย์บอร์ดเสมือนจริง กระตุ้นให้รู้สึกพร้อมลงมือทำงาน',
    claimVerification: 'ตรวจสอบแล้ว: สรุปจากโมเดลการทำงานจริง ไม่มีสถิติสมมติ',
    cta: 'จัดหมวดหมู่บันทึก 3 ชิ้นล่าสุดของคุณลงในสองคลังนี้ดู',
    sourceWhat: 'The $0 Marketing Playbook (Alex Hormozi)',
    sourceHow: 'One-Breath Delivery Cut (Colin and Samir)',
    estimatedRuntime: '~95 วินาที',
    wordCount: 175,
    createdAt: '2026-10-29T16:20:00Z'
  },
  {
    id: 'board-item-3',
    conceptId: 'concept-story-c',
    title: 'สิ่งที่ไม่มีใครบอกตอนเริ่มต้น: คุณค่าแท้จริงสร้างได้ตอนที่ไม่มีใครดู',
    angle: 'Honest Founder Reflection',
    stage: 'review',
    isApproved: false,
    approvedRevision: null,
    targetAudience: 'ผู้เริ่มต้นสร้างแบรนด์ที่กำลังท้อแท้กับยอดการเข้าถึงในช่วงแรก',
    creativeRationale: 'การสร้างความน่าเชื่อถือและความลุ่มลึกของแบรนด์ต้องสั่งสมในช่วงที่ยังไม่มีแสงสปอตไลต์ เพื่อเป็นรากฐานที่มั่นคง',
    hook: 'ถ้าคอนเทนต์ของคุณมีคุณค่าเฉพาะตอนที่คนหลักหมื่นเข้ามารุมดู... แปลว่ามันไม่ได้มีคุณค่าในตัวมันเองตั้งแต่แรก',
    teleprompterScript: `[SCENE 1 - 0:00 - 0:04]
ถ้าคอนเทนต์ของคุณมีคุณค่าเฉพาะตอนที่คนหลักหมื่นเข้ามารุมดู... แปลว่ามันไม่ได้มีคุณค่าในตัวมันเองตั้งแต่แรก

[SCENE 2 - 0:05 - 0:28]
ช่วงเวลาที่สำคัญที่สุดไม่ใช่ช่วงที่คุณมีผู้ติดตามมากมาย แต่คือช่วงที่คุณกำลังพูดความจริงอย่างตั้งใจต่อหน้าคนดูแค่ 5 คน เพราะนั่นคือช่วงเวลาที่คุณกำลังขัดเกลาตัวตนและแก่นคิดที่แท้จริง

[SCENE 3 - 0:29 - 1:05]
อย่ารีบเปลี่ยนแนวทางเพียงเพื่อแลกกับตัวเลขชั่วข้ามคืน ทำงานทุกชิ้นให้มีคุณภาพจนคุณกล้าภูมิใจแม้เวลาจะผ่านไป 5 ปี

[SCENE 4 - 1:06 - 1:20]
ซื่อสัตย์ต่อแก่นคิดของคุณ แล้วคนที่ใช่จะเดินทางมาหาคุณเอง`,
    beats: [
      {
        title: 'Beat 1: Provocative Truth',
        timecode: '0:00 - 0:04',
        desc: 'ประโยคเปิดตัวสะท้อนนิยามของคุณค่าคอนเทนต์ที่แท้จริง'
      },
      {
        title: 'Beat 2: Early Stage Value',
        timecode: '0:05 - 0:28',
        desc: 'อธิบายว่าช่วงที่คนดูน้อยคือช่วงเวลาทองของการฝึกฝน'
      },
      {
        title: 'Beat 3: Long-term Integrity',
        timecode: '0:29 - 1:05',
        desc: 'การสร้างผลงานที่จะยังคงมีคุณค่าแม้เวลาผ่านไปหลายปี'
      },
      {
        title: 'Beat 4: Encouraging Close',
        timecode: '1:06 - 1:20',
        desc: 'ส่งพลังใจให้มุ่งมั่นพัฒนาเนื้อหาอย่างต่อเนื่อง'
      }
    ],
    sceneDirection: 'มุมกล้องเรียบง่ายแบบ Founder One-on-One แสงธรรมชาติอบอุ่น ให้ความรู้สึกคุยเปิดใจ',
    soundDirection: 'เสียงพูดโทนอบอุ่นและเป็นกันเอง ไม่มีดนตรีประกอบเร้าอารมณ์จนเกินงาม',
    claimVerification: 'ตรวจสอบแล้ว: ข้อคิดจากเส้นทางการสร้างธุรกิจจริง ไร้ตัวเลขโอ้อวด',
    cta: 'สร้างผลงานชิ้นต่อไปของคุณด้วยความตั้งใจเดิม',
    sourceWhat: 'Post and forget it (Mew Teetawat)',
    sourceHow: 'Direct Delivery Pacing',
    estimatedRuntime: '~80 วินาที',
    wordCount: 142,
    createdAt: '2026-10-31T09:00:00Z'
  },
  {
    id: 'board-item-4',
    conceptId: 'concept-story-d',
    title: 'The $0 Marketing Playbook: คอนเทนต์ที่เป็น Asset ถาวร',
    angle: 'Evergreen Brand Asset',
    stage: 'draft',
    isApproved: false,
    approvedRevision: null,
    targetAudience: 'ผู้ประกอบการที่ต้องการสร้างช่องทางสื่อสารของตนเองเป็นสินทรัพย์ระยะยาว',
    creativeRationale: 'เปรียบเทียบคอนเทนต์กระแสไวรัลที่หายไปใน 24 ชม. กับคอนเทนต์ที่ตอบคำถามสำคัญของลูกค้าและดึงดูดความไว้วางใจได้ต่อเนื่อง',
    hook: 'คลิปที่คุณเหนื่อยทำมาทั้งวัน จะยังมีคนค้นหาและสร้างประโยชน์อยู่ไหมหลังจากผ่านไป 6 เดือน?',
    teleprompterScript: `[SCENE 1 - 0:00 - 0:04]
คลิปที่คุณเหนื่อยทำมาทั้งวัน จะยังมีคนค้นหาและสร้างประโยชน์อยู่ไหมหลังจากผ่านไป 6 เดือน?

[SCENE 2 - 0:05 - 0:25]
ถ้าคำตอบคือไม่... คุณกำลังติดกับดักการปั่นกระแสชั่วคราว ยอดวิวอาจจะขึ้นเร็ว แต่มันไม่ทิ้งความน่าเชื่อถือไว้ในใจของลูกค้าเลย

[SCENE 3 - 0:26 - 1:10]
คอนเทนต์ที่เป็น Evergreen Asset ต้องตอบโจทย์ 2 อย่าง:
หนึ่ง คือตอบปัญหาที่คนในวงการของคุณค้นหาอยู่เสมอ
สอง คือนำเสนอทางออกที่คุณเชี่ยวชาญจริงจากประสบการณ์ทำงานจริง

[SCENE 4 - 1:11 - 1:30]
เปลี่ยนจากนักวิ่งตามเทรนด์ มาเป็นผู้สะสมสินทรัพย์ทางความคิด แล้วธุรกิจของคุณจะเติบโตอย่างมั่นคง`,
    beats: [
      {
        title: 'Beat 1: Diagnostic Question',
        timecode: '0:00 - 0:04',
        desc: 'ตั้งคำถามเพื่อตรวจสอบว่างานเป็น Asset หรือแค่กระแสชั่วคราว'
      },
      {
        title: 'Beat 2: The Viral Trap',
        timecode: '0:05 - 0:25',
        desc: 'ข้อเสียของการไล่ตามกระแสที่ไม่ได้สร้างความไว้วางใจ'
      },
      {
        title: 'Beat 3: 2 Pillars of Evergreen Asset',
        timecode: '0:26 - 1:10',
        desc: 'วิเคราะห์โครงสร้างของคอนเทนต์ที่อยู่เหนือกาลเวลา'
      },
      {
        title: 'Beat 4: Strategic Mindset Shift',
        timecode: '1:11 - 1:30',
        desc: 'ชวนปรับวิธีคิดจากการวิ่งตามวิวสู่การสร้างสินทรัพย์'
      }
    ],
    sceneDirection: 'มุมมอง Desk Close-up พร้อมตัวอย่างกระดานวางแผนการตลาดระยะยาว',
    soundDirection: 'เสียงเปิดหน้ากระดาษและเสียงพูดหนักแน่น ชัดถ้อยชัดคำ',
    claimVerification: 'ตรวจสอบแล้ว: อิงหลักการสร้างแบรนด์ที่ยั่งยืน ไม่มีการอ้างสถิติที่พิสูจน์ไม่ได้',
    cta: 'ทบทวนคอนเทนต์ของคุณว่าชิ้นไหนคือ Evergreen Asset ชิ้นแรก',
    sourceWhat: 'The $0 Marketing Playbook (Alex Hormozi)',
    sourceHow: 'Structured Breakdown Cut',
    estimatedRuntime: '~90 วินาที',
    wordCount: 155,
    createdAt: '2026-10-31T08:30:00Z'
  }
];

class ContentBoardController {
  /**
   * Initializes the Content Board & Script Controller
   * @param {Object} options Configuration options
   * @param {HTMLElement|string} options.rootId Root container element or selector
   */
  constructor(options = {}) {
    this.rootId = options.rootId || '#content-board-root';
    this.root = typeof this.rootId === 'string' ? document.querySelector(this.rootId) : this.rootId;
    
    this.items = [];
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.activeItemId = null;
    this.draggedItemId = null;

    if (this.root) {
      this.init();
    }
  }

  /**
   * Main entry point
   */
  init() {
    this.loadItemsFromStorage();
    this.cacheDomElements();
    this.bindEvents();
    this.renderBoard();
    this.updateCounters();
  }

  /**
   * Loads board items from localStorage or falls back to authentic default items
   */
  loadItemsFromStorage() {
    try {
      const stored = localStorage.getItem('mew_content_board_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize stages if needed
          this.items = parsed.map(item => this.normalizeItem(item));
          return;
        }
      }
    } catch (e) {
      console.warn('[ContentBoardController] Error reading stored items:', e);
    }

    // Default seed
    this.items = DEFAULT_BOARD_ITEMS.map(item => ({ ...item }));
    this.saveItemsToStorage();
  }

  /**
   * Normalizes stage names across modules (remix sends 'idea', we map to 'draft')
   */
  normalizeItem(item) {
    let stage = (item.stage || 'draft').toLowerCase();
    if (stage === 'idea' || stage === 'scripting') stage = 'draft';
    if (stage === 'needs_review' || stage === 'review') stage = 'review';
    if (stage === 'approved') stage = 'approved';
    if (stage === 'filming' || stage === 'ready' || stage === 'production') stage = 'ready';

    return {
      id: item.id || `board-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conceptId: item.conceptId || `concept-${Date.now()}`,
      title: item.title || 'Untitled Concept',
      angle: item.angle || 'Creative Angle',
      stage: stage,
      isApproved: Boolean(item.isApproved || stage === 'approved' || stage === 'ready'),
      approvedRevision: item.approvedRevision || (stage === 'ready' ? {
        code: 'REV-2026-001',
        approvedBy: 'Mew Teetawat',
        timestamp: new Date().toISOString(),
        signature: 'MT-LOCKED-PROD'
      } : null),
      targetAudience: item.targetAudience || 'ผู้ติดตามและกลุ่มเป้าหมายของแบรนด์ที่มองหาคุณค่าที่แท้จริง',
      creativeRationale: item.creativeRationale || 'สร้างสรรค์ขึ้นเพื่อสื่อสารแก่นคิดที่ซื่อสัตย์และจับต้องได้',
      hook: item.hook || 'ประโยคเปิดตัวที่น่าสนใจและดึงดูดสายตา',
      teleprompterScript: item.teleprompterScript || item.hook || '',
      beats: Array.isArray(item.beats) && item.beats.length > 0 ? item.beats : [
        { title: 'Beat 1: Hook', timecode: '0:00 - 0:04', desc: item.hook || 'Pattern Interrupt' },
        { title: 'Beat 2: Problem', timecode: '0:05 - 0:30', desc: 'ขยายความเข้าใจในปัญหา' },
        { title: 'Beat 3: Solution', timecode: '0:31 - 1:15', desc: 'นำเสนอทางออกที่ยั่งยืน' },
        { title: 'Beat 4: CTA', timecode: '1:16 - 1:30', desc: 'บทสรุปและชวนลงมือทำ' }
      ],
      sceneDirection: item.sceneDirection || 'มุมมองกล้อง A-Cam Medium Close-Up โทนแสง Daylight 5600K โต๊ะทำงานสะอาดตา',
      soundDirection: item.soundDirection || 'เสียงบันทึกชัดเจน ไร้เสียงสะท้อน พร้อมดนตรีเบาๆ คลอประกอบ',
      claimVerification: item.claimVerification || 'ตรวจสอบแล้ว: อิงจากประสบการณ์จริง ปราศจากสถิติสมมติ 100%',
      cta: item.cta || 'ติดตามเพื่อรับมุมมองการสร้างสรรค์ที่ซื่อสัตย์',
      sourceWhat: item.sourceWhat || 'Founder Vault Reference',
      sourceHow: item.sourceHow || 'Original Pacing',
      estimatedRuntime: item.estimatedRuntime || '~90 วินาที',
      wordCount: item.wordCount || 150,
      createdAt: item.createdAt || new Date().toISOString()
    };
  }

  /**
   * Persists current items to localStorage
   */
  saveItemsToStorage() {
    try {
      localStorage.setItem('mew_content_board_items', JSON.stringify(this.items));
    } catch (e) {
      console.warn('[ContentBoardController] Error saving items to storage:', e);
    }
  }

  /**
   * Cache DOM elements for efficient access
   */
  cacheDomElements() {
    this.dom = {
      // Dropzones
      dropzoneDraft: this.root.querySelector('#dropzone-draft'),
      dropzoneReview: this.root.querySelector('#dropzone-review'),
      dropzoneApproved: this.root.querySelector('#dropzone-approved'),
      dropzoneReady: this.root.querySelector('#dropzone-ready'),

      // Counters
      countStageDraft: this.root.querySelector('#count-stage-draft'),
      countStageReview: this.root.querySelector('#count-stage-review'),
      countStageApproved: this.root.querySelector('#count-stage-approved'),
      countStageReady: this.root.querySelector('#count-stage-ready'),

      // Filter tabs
      filterTabs: this.root.querySelectorAll('.filter-tab'),
      filterCountAll: this.root.querySelector('#filter-count-all'),
      filterCountDraft: this.root.querySelector('#filter-count-draft'),
      filterCountReview: this.root.querySelector('#filter-count-review'),
      filterCountApproved: this.root.querySelector('#filter-count-approved'),
      filterCountReady: this.root.querySelector('#filter-count-ready'),

      // Search
      searchInput: this.root.querySelector('#board-search-input'),
      searchClear: this.root.querySelector('#board-search-clear'),
      btnRefresh: this.root.querySelector('#btn-refresh-board'),

      // S08 Drawer
      drawerOverlay: document.getElementById('concept-drawer-overlay') || this.root.querySelector('#concept-drawer-overlay'),
      drawer: document.getElementById('concept-drawer') || this.root.querySelector('#concept-drawer'),
      btnCloseDrawer: document.getElementById('btn-close-drawer') || this.root.querySelector('#btn-close-drawer'),
      drawerStageBadge: document.getElementById('drawer-stage-badge') || this.root.querySelector('#drawer-stage-badge'),
      drawerStageDot: document.getElementById('drawer-stage-dot') || this.root.querySelector('#drawer-stage-dot'),
      drawerStageText: document.getElementById('drawer-stage-text') || this.root.querySelector('#drawer-stage-text'),
      drawerRevisionBadge: document.getElementById('drawer-revision-badge') || this.root.querySelector('#drawer-revision-badge'),
      drawerEstimatedTime: document.getElementById('drawer-estimated-time') || this.root.querySelector('#drawer-estimated-time'),
      drawerConceptAngle: document.getElementById('drawer-concept-angle') || this.root.querySelector('#drawer-concept-angle'),
      drawerConceptTitle: document.getElementById('drawer-concept-title') || this.root.querySelector('#drawer-concept-title'),
      drawerSourceChips: document.getElementById('drawer-source-chips') || this.root.querySelector('#drawer-source-chips'),
      drawerRationaleText: document.getElementById('drawer-rationale-text') || this.root.querySelector('#drawer-rationale-text'),
      drawerAudienceText: document.getElementById('drawer-audience-text') || this.root.querySelector('#drawer-audience-text'),
      drawerHookText: document.getElementById('drawer-hook-text') || this.root.querySelector('#drawer-hook-text'),
      drawerTeleprompterText: document.getElementById('drawer-teleprompter-text') || this.root.querySelector('#drawer-teleprompter-text'),
      drawerBeatsTimeline: document.getElementById('drawer-beats-timeline') || this.root.querySelector('#drawer-beats-timeline'),
      drawerSceneDirection: document.getElementById('drawer-scene-direction') || this.root.querySelector('#drawer-scene-direction'),
      drawerSoundDirection: document.getElementById('drawer-sound-direction') || this.root.querySelector('#drawer-sound-direction'),
      drawerClaimVerificationText: document.getElementById('drawer-claim-verification-text') || this.root.querySelector('#drawer-claim-verification-text'),
      drawerCtaText: document.getElementById('drawer-cta-text') || this.root.querySelector('#drawer-cta-text'),
      drawerRevisionStampBox: document.getElementById('drawer-revision-stamp-box') || this.root.querySelector('#drawer-revision-stamp-box'),
      drawerStampMeta: document.getElementById('drawer-stamp-meta') || this.root.querySelector('#drawer-stamp-meta'),
      btnCopyHook: document.getElementById('btn-copy-hook') || this.root.querySelector('#btn-copy-hook'),
      btnDrawerDelete: document.getElementById('btn-drawer-delete') || this.root.querySelector('#btn-drawer-delete'),
      btnApproveConcept: document.getElementById('btn-approve-concept') || this.root.querySelector('#btn-approve-concept'),
      btnExportDirectorBrief: document.getElementById('btn-export-director-brief') || this.root.querySelector('#btn-export-director-brief'),

      // S09 Director Brief Modal
      briefOverlay: document.getElementById('director-brief-modal-overlay') || this.root.querySelector('#director-brief-modal-overlay'),
      briefModal: document.getElementById('director-brief-modal') || this.root.querySelector('#director-brief-modal'),
      btnCloseBriefModal: document.getElementById('btn-close-brief-modal') || this.root.querySelector('#btn-close-brief-modal'),
      briefModalRevCode: document.getElementById('brief-modal-rev-code') || this.root.querySelector('#brief-modal-rev-code'),
      briefTitleVal: document.getElementById('brief-title-val') || this.root.querySelector('#brief-title-val'),
      briefRuntimeVal: document.getElementById('brief-runtime-val') || this.root.querySelector('#brief-runtime-val'),
      briefSignatureVal: document.getElementById('brief-signature-val') || this.root.querySelector('#brief-signature-val'),
      briefDateVal: document.getElementById('brief-date-val') || this.root.querySelector('#brief-date-val'),
      briefCreativeIntentText: document.getElementById('brief-creative-intent-text') || this.root.querySelector('#brief-creative-intent-text'),
      briefCueTableBody: document.getElementById('brief-cue-table-body') || this.root.querySelector('#brief-cue-table-body'),
      briefAttributionText: document.getElementById('brief-attribution-text') || this.root.querySelector('#brief-attribution-text'),
      btnCopyBriefMarkdown: document.getElementById('btn-copy-brief-markdown') || this.root.querySelector('#btn-copy-brief-markdown'),
      btnPrintBrief: document.getElementById('btnPrintBrief') || document.getElementById('btn-print-brief') || this.root.querySelector('#btn-print-brief'),

      // Quick Create Modal
      btnCreateConceptCard: document.getElementById('btn-create-concept-card') || this.root.querySelector('#btn-create-concept-card'),
      quickCreateOverlay: document.getElementById('quick-create-modal-overlay') || this.root.querySelector('#quick-create-modal-overlay'),
      quickCreateForm: document.getElementById('quick-create-form') || this.root.querySelector('#quick-create-form'),
      btnCloseCreateModal: document.getElementById('btn-close-create-modal') || this.root.querySelector('#btn-close-create-modal'),
      btnCancelCreate: document.getElementById('btn-cancel-create') || this.root.querySelector('#btn-cancel-create'),

      // Toast container
      toastContainer: document.getElementById('board-toast-container') || this.root.querySelector('#board-toast-container')
    };
  }

  /**
   * Bind event listeners for UI interactions
   */
  bindEvents() {
    // 1. Search input
    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (this.dom.searchClear) {
          this.dom.searchClear.hidden = this.searchQuery.length === 0;
        }
        this.renderBoard();
      });
    }

    // 2. Search clear
    if (this.dom.searchClear) {
      this.dom.searchClear.addEventListener('click', () => {
        if (this.dom.searchInput) this.dom.searchInput.value = '';
        this.searchQuery = '';
        this.dom.searchClear.hidden = true;
        this.renderBoard();
      });
    }

    // 3. Stage filter tabs
    this.dom.filterTabs?.forEach(tab => {
      tab.addEventListener('click', () => {
        this.dom.filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        this.activeFilter = tab.getAttribute('data-stage') || 'all';
        this.renderBoard();
      });
    });

    // 4. Sync / Refresh button
    if (this.dom.btnRefresh) {
      this.dom.btnRefresh.addEventListener('click', () => {
        this.loadItemsFromStorage();
        this.renderBoard();
        this.updateCounters();
        this.showToast('บอร์ดอัปเดตข้อมูลล่าสุดเรียบร้อย', 'green');
      });
    }

    // 5. Drag and Drop events on columns
    const columns = [
      { el: this.dom.dropzoneDraft, stage: 'draft' },
      { el: this.dom.dropzoneReview, stage: 'review' },
      { el: this.dom.dropzoneApproved, stage: 'approved' },
      { el: this.dom.dropzoneReady, stage: 'ready' }
    ];

    columns.forEach(({ el, stage }) => {
      if (!el) return;

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('drag-over');
      });

      el.addEventListener('dragleave', () => {
        el.classList.remove('drag-over');
      });

      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const itemId = e.dataTransfer.getData('text/plain');
        if (itemId) {
          this.moveItemToStage(itemId, stage);
        }
      });
    });

    // 6. S08 Drawer actions
    this.dom.btnCloseDrawer?.addEventListener('click', () => this.closeDrawer());
    this.dom.drawerOverlay?.addEventListener('click', (e) => {
      if (e.target === this.dom.drawerOverlay) this.closeDrawer();
    });

    this.dom.btnCopyHook?.addEventListener('click', () => this.copyHookText());
    this.dom.btnDrawerDelete?.addEventListener('click', () => this.deleteActiveItem());
    this.dom.btnApproveConcept?.addEventListener('click', () => this.approveActiveConcept());
    this.dom.btnExportDirectorBrief?.addEventListener('click', () => this.openDirectorBriefModal(this.activeItemId));

    // 7. S09 Director Brief Modal actions
    this.dom.btnCloseBriefModal?.addEventListener('click', () => this.closeDirectorBriefModal());
    this.dom.briefOverlay?.addEventListener('click', (e) => {
      if (e.target === this.dom.briefOverlay) this.closeDirectorBriefModal();
    });
    this.dom.btnCopyBriefMarkdown?.addEventListener('click', () => this.copyBriefAsMarkdown());
    this.dom.btnPrintBrief?.addEventListener('click', () => window.print());

    // 8. Quick Create Modal
    this.dom.btnCreateConceptCard?.addEventListener('click', () => this.openQuickCreateModal());
    this.dom.btnCloseCreateModal?.addEventListener('click', () => this.closeQuickCreateModal());
    this.dom.btnCancelCreate?.addEventListener('click', () => this.closeQuickCreateModal());
    this.dom.quickCreateOverlay?.addEventListener('click', (e) => {
      if (e.target === this.dom.quickCreateOverlay) this.closeQuickCreateModal();
    });
    this.dom.quickCreateForm?.addEventListener('submit', (e) => this.handleQuickCreateSubmit(e));

    // 9. Keyboard Accessibility (Escape to close any modal)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!this.dom.briefOverlay?.hidden) {
          this.closeDirectorBriefModal();
        } else if (!this.dom.drawerOverlay?.hidden) {
          this.closeDrawer();
        } else if (!this.dom.quickCreateOverlay?.hidden) {
          this.closeQuickCreateModal();
        }
      }
    });

    // 10. Listen to external storage updates (e.g., from Remix Studio sendConceptToBoard)
    window.addEventListener('storage', (e) => {
      if (e.key === 'mew_content_board_items') {
        this.loadItemsFromStorage();
        this.renderBoard();
        this.updateCounters();
      }
    });

    // 11. Listen to same-window custom broadcast events
    window.addEventListener('mew:board-item-added', (e) => {
      if (e.detail) {
        const normalized = this.normalizeItem(e.detail);
        if (!this.items.some(i => i.id === normalized.id)) {
          this.items.unshift(normalized);
          this.saveItemsToStorage();
        }
        this.activeFilter = 'all';
        this.renderBoard();
        this.updateCounters();
        this.showToast(`เพิ่ม "${normalized.title}" ลงในคอลัมน์ Draft เรียบร้อย`, 'coral');
      } else {
        this.loadItemsFromStorage();
        this.renderBoard();
        this.updateCounters();
      }
    });
    window.addEventListener('mew:board-updated', () => {
      this.loadItemsFromStorage();
      this.renderBoard();
      this.updateCounters();
    });
    window.addEventListener('mew:concept-saved', () => {
      this.loadItemsFromStorage();
      this.renderBoard();
      this.updateCounters();
    });
  }

  /**
   * Renders the 4-stage Kanban columns
   */
  renderBoard() {
    const stages = ['draft', 'review', 'approved', 'ready'];

    stages.forEach(stage => {
      const dropzone = this.getDropzoneForStage(stage);
      if (!dropzone) return;

      // Filter items matching stage and current search query
      const stageItems = this.items.filter(item => {
        const matchesStage = item.stage === stage;
        if (!matchesStage) return false;

        // Apply search query
        if (this.searchQuery) {
          const hay = `${item.title} ${item.hook} ${item.angle} ${item.creativeRationale}`.toLowerCase();
          if (!hay.includes(this.searchQuery)) return false;
        }

        // Apply active stage filter (if not 'all')
        if (this.activeFilter !== 'all' && this.activeFilter !== stage) {
          return false;
        }

        return true;
      });

      // Clear dropzone
      dropzone.innerHTML = '';

      if (stageItems.length === 0) {
        dropzone.innerHTML = this.renderEmptyState(stage);
      } else {
        stageItems.forEach(item => {
          dropzone.appendChild(this.createCardElement(item));
        });
      }
    });

    this.updateCounters();
  }

  /**
   * Creates an interactive Card DOM Element for a board item
   */
  createCardElement(item) {
    const card = document.createElement('article');
    card.className = `mew-offer-card board-concept-card accent-${this.getAccentColorForStage(item.stage)}`;
    card.setAttribute('draggable', 'true');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'article');
    card.setAttribute('data-id', item.id);
    card.id = `card-${item.id}`;

    // Drag start / end
    card.addEventListener('dragstart', (e) => {
      this.draggedItemId = item.id;
      e.dataTransfer.setData('text/plain', item.id);
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      this.draggedItemId = null;
      card.classList.remove('dragging');
    });

    // Keyboard enter or click to open S08 Drawer
    card.addEventListener('click', (e) => {
      // If clicked on quick-move button, don't open drawer
      if (e.target.closest('.btn-advance') || e.target.closest('.btn-card-action')) {
        return;
      }
      this.openDrawer(item.id);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!e.target.closest('.btn-card-action')) {
          e.preventDefault();
          this.openDrawer(item.id);
        }
      }
    });

    // Revision badge text
    const revBadgeText = item.isApproved && item.approvedRevision 
      ? item.approvedRevision.code 
      : 'DRAFT';

    // Beats indicator HTML
    const beatsCount = Array.isArray(item.beats) ? item.beats.length : 4;
    let beatDots = '';
    for (let i = 0; i < beatsCount; i++) {
      beatDots += `<span class="beat-dot active" aria-hidden="true"></span>`;
    }

    // Quick next stage action label
    const nextAction = this.getNextStageAction(item.stage);

    card.innerHTML = `
      <div class="card-top-meta">
        <span class="card-angle-tag">${this.escapeHtml(item.angle || 'Perspective')}</span>
        <span class="card-revision-pill" title="รหัสเวอร์ชันที่อนุมัติ">${revBadgeText}</span>
      </div>

      <h3 class="card-concept-title">${this.escapeHtml(item.title)}</h3>

      <div class="card-hook-preview" title="ประโยค Hook เปิดคลิป">
        "${this.escapeHtml(this.truncate(item.hook, 90))}"
      </div>

      <div class="card-beats-summary">
        <span class="beat-dot-indicator">${beatDots}</span>
        <span>${beatsCount} Story Beats · ${item.estimatedRuntime || '~90 วินาที'}</span>
      </div>

      <div class="card-footer-meta">
        <span class="card-origin-tag" title="ที่มา C(N) + P(N)">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          ${this.escapeHtml(this.truncate(item.sourceWhat || 'Founder Vault', 22))}
        </span>
        <div class="card-actions-row">
          <button type="button" class="btn-card-action" aria-label="ดูรายละเอียดบท" onclick="window.contentBoardCtrl.openDrawer('${item.id}')">
            View Script
          </button>
          ${nextAction ? `
            <button type="button" class="btn-card-action btn-advance" aria-label="${nextAction.label}" onclick="window.contentBoardCtrl.moveItemToStage('${item.id}', '${nextAction.targetStage}')">
              ${nextAction.label}
            </button>
          ` : ''}
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Returns empty state HTML for a given stage
   */
  renderEmptyState(stage) {
    let msg = 'ไม่มีรายการในขั้นตอนนี้';
    if (stage === 'draft') msg = 'ยังไม่มีไอเดียในสถานะ Draft<br>คลิก "+ New Concept Draft" เพื่อเริ่มต้น';
    if (stage === 'review') msg = 'ไม่มีบทที่รอการตรวจทานในขณะนี้';
    if (stage === 'approved') msg = 'ยังไม่มีบทที่อนุมัติแล้ว<br>ตรวจทานและกด "Approve Concept" เพื่อล็อกเวอร์ชัน';
    if (stage === 'ready') msg = 'ไม่มีคลิปในคิวพร้อมถ่ายทำ<br>อนุมัติบทเพื่อเตรียมส่งมอบ Director Brief';

    return `
      <div class="column-empty-state">
        <div class="column-empty-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
        </div>
        <p class="column-empty-text">${msg}</p>
      </div>
    `;
  }

  /**
   * Determines next stage progression
   */
  getNextStageAction(currentStage) {
    switch (currentStage) {
      case 'draft':
        return { label: 'To Review →', targetStage: 'review' };
      case 'review':
        return { label: 'Approve ✓', targetStage: 'approved' };
      case 'approved':
        return { label: 'Ready ⚡', targetStage: 'ready' };
      case 'ready':
        return null;
      default:
        return null;
    }
  }

  /**
   * Moves an item to a new stage and handles approval locking if moving to 'approved'
   */
  moveItemToStage(itemId, targetStage) {
    const item = this.items.find(i => i.id === itemId);
    if (!item || item.stage === targetStage) return;

    item.stage = targetStage;

    // If moving to approved or ready, ensure it has an immutable revision stamp
    if ((targetStage === 'approved' || targetStage === 'ready') && !item.isApproved) {
      item.isApproved = true;
      item.approvedRevision = {
        code: `REV-2026-${String(this.items.filter(i => i.isApproved).length + 1).padStart(3, '0')}`,
        approvedBy: 'Mew Teetawat',
        timestamp: new Date().toISOString(),
        signature: `MT-LOCKED-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };
      this.showToast(`อนุมัติ "${item.title}" และสร้าง Revision ${item.approvedRevision.code} เรียบร้อย`, 'green');
    } else {
      const stageLabels = {
        draft: 'Draft',
        review: 'Needs Review',
        approved: 'Approved',
        ready: 'Ready for Production'
      };
      this.showToast(`ย้าย "${item.title}" ไปยัง ${stageLabels[targetStage] || targetStage}`, 'coral');
    }

    this.saveItemsToStorage();
    this.renderBoard();
    this.updateCounters();

    // If drawer is currently open for this item, update it
    if (this.activeItemId === itemId && !this.dom.drawerOverlay?.hidden) {
      this.openDrawer(itemId);
    }
  }

  /**
   * Opens S08 Concept Detail & Script Draft Drawer
   */
  openDrawer(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    this.activeItemId = itemId;

    // 1. Stage and revision badges
    const stageMap = {
      draft: { text: 'Draft', dotClass: 'dot-draft' },
      review: { text: 'Needs Review', dotClass: 'dot-review' },
      approved: { text: 'Approved', dotClass: 'dot-approved' },
      ready: { text: 'Ready for Production', dotClass: 'dot-ready' }
    };
    const currentMeta = stageMap[item.stage] || { text: item.stage, dotClass: 'dot-draft' };

    if (this.dom.drawerStageText) this.dom.drawerStageText.textContent = currentMeta.text;
    if (this.dom.drawerStageDot) {
      this.dom.drawerStageDot.className = `status-indicator-dot ${currentMeta.dotClass}`;
    }

    if (this.dom.drawerRevisionBadge) {
      this.dom.drawerRevisionBadge.textContent = item.isApproved && item.approvedRevision
        ? item.approvedRevision.code
        : 'REV-DRAFT';
    }

    if (this.dom.drawerEstimatedTime) {
      this.dom.drawerEstimatedTime.textContent = item.estimatedRuntime || '~90 วินาที';
    }

    // 2. Title & Angle
    if (this.dom.drawerConceptAngle) this.dom.drawerConceptAngle.textContent = `Angle: ${item.angle || 'Perspective Shift'}`;
    if (this.dom.drawerConceptTitle) this.dom.drawerConceptTitle.textContent = item.title;

    // 3. Source attribution chips
    if (this.dom.drawerSourceChips) {
      this.dom.drawerSourceChips.innerHTML = `
        <span class="source-chip"><strong>Content (WHAT):</strong> ${this.escapeHtml(item.sourceWhat || 'Founder Vault')}</span>
        <span class="source-chip"><strong>Packaging (HOW):</strong> ${this.escapeHtml(item.sourceHow || 'Sensory Audio Delivery')}</span>
      `;
    }

    // 4. Creative Rationale & Audience
    if (this.dom.drawerRationaleText) this.dom.drawerRationaleText.textContent = item.creativeRationale;
    if (this.dom.drawerAudienceText) this.dom.drawerAudienceText.textContent = item.targetAudience;

    // 5. Hook & Teleprompter
    if (this.dom.drawerHookText) this.dom.drawerHookText.textContent = `"${item.hook}"`;
    if (this.dom.drawerTeleprompterText) {
      this.dom.drawerTeleprompterText.textContent = item.teleprompterScript || item.hook;
    }

    // 6. Narrative Beats
    if (this.dom.drawerBeatsTimeline) {
      this.dom.drawerBeatsTimeline.innerHTML = (item.beats || []).map((beat, idx) => `
        <div class="beat-item">
          <div class="beat-item-header">
            <span class="beat-item-title">${this.escapeHtml(beat.title || `Beat ${idx + 1}`)}</span>
            <span class="beat-timecode">${this.escapeHtml(beat.timecode || '')}</span>
          </div>
          <p class="beat-desc">${this.escapeHtml(beat.desc || '')}</p>
        </div>
      `).join('');
    }

    // 7. Scene & Sound Directions
    if (this.dom.drawerSceneDirection) this.dom.drawerSceneDirection.textContent = item.sceneDirection;
    if (this.dom.drawerSoundDirection) this.dom.drawerSoundDirection.textContent = item.soundDirection;

    // 8. Proof Checklist
    if (this.dom.drawerClaimVerificationText) {
      this.dom.drawerClaimVerificationText.textContent = item.claimVerification || 'ตรวจสอบแล้ว: อิงจากประสบการณ์จริง ปราศจากสถิติสมมติ 100%';
    }

    // 9. CTA
    if (this.dom.drawerCtaText) this.dom.drawerCtaText.textContent = `"${item.cta}"`;

    // 10. Approved Stamp Box
    if (this.dom.drawerRevisionStampBox) {
      if (item.isApproved && item.approvedRevision) {
        this.dom.drawerRevisionStampBox.hidden = false;
        if (this.dom.drawerStampMeta) {
          const formattedDate = new Date(item.approvedRevision.timestamp).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          this.dom.drawerStampMeta.textContent = `Revision: ${item.approvedRevision.code} · ลงนามโดย ${item.approvedRevision.approvedBy} (${formattedDate}) · ล็อกบทเรียบร้อย`;
        }
      } else {
        this.dom.drawerRevisionStampBox.hidden = true;
      }
    }

    // 11. Toggle Approve button state
    if (this.dom.btnApproveConcept) {
      if (item.isApproved) {
        this.dom.btnApproveConcept.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Approved (${item.approvedRevision ? item.approvedRevision.code : 'Locked'})</span>
        `;
        this.dom.btnApproveConcept.disabled = true;
        this.dom.btnApproveConcept.style.opacity = '0.75';
      } else {
        this.dom.btnApproveConcept.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
          <span>Approve Concept</span>
        `;
        this.dom.btnApproveConcept.disabled = false;
        this.dom.btnApproveConcept.style.opacity = '1';
      }
    }

    // Show Drawer Overlay and reset scroll to top so it's never cut off
    if (this.dom.drawerOverlay) {
      this.dom.drawerOverlay.hidden = false;
      this.dom.drawerOverlay.setAttribute('aria-hidden', 'false');
      this.dom.drawerOverlay.scrollTop = 0;
      document.body.style.overflow = 'hidden';
    }
    if (this.dom.drawerScrollBody) {
      this.dom.drawerScrollBody.scrollTop = 0;
    }
  }

  /**
   * Closes the S08 Drawer
   */
  closeDrawer() {
    if (this.dom.drawerOverlay) {
      this.dom.drawerOverlay.hidden = true;
      this.dom.drawerOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    this.activeItemId = null;
  }

  /**
   * Approves the currently active concept in drawer
   */
  approveActiveConcept() {
    if (!this.activeItemId) return;
    const item = this.items.find(i => i.id === this.activeItemId);
    if (!item) return;

    item.isApproved = true;
    item.stage = 'approved';
    item.approvedRevision = {
      code: `REV-2026-${String(this.items.filter(i => i.isApproved).length + 1).padStart(3, '0')}`,
      approvedBy: 'Mew Teetawat',
      timestamp: new Date().toISOString(),
      signature: `MT-LOCKED-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };

    this.saveItemsToStorage();
    this.renderBoard();
    this.updateCounters();
    this.openDrawer(this.activeItemId); // Refresh drawer view

    this.showToast(`สร้าง Immutable Revision ${item.approvedRevision.code} และอนุมัติบทเรียบร้อย`, 'green');
  }

  /**
   * Deletes the currently active item
   */
  deleteActiveItem() {
    if (!this.activeItemId) return;
    const item = this.items.find(i => i.id === this.activeItemId);
    if (!item) return;

    if (confirm(`คุณต้องการลบ "${item.title}" ออกจากบอร์ดใช่หรือไม่?`)) {
      this.items = this.items.filter(i => i.id !== this.activeItemId);
      this.saveItemsToStorage();
      this.closeDrawer();
      this.renderBoard();
      this.updateCounters();
      this.showToast(`ลบ "${item.title}" เรียบร้อย`, 'coral');
    }
  }

  /**
   * Copies Hook text to clipboard
   */
  copyHookText() {
    if (!this.activeItemId) return;
    const item = this.items.find(i => i.id === this.activeItemId);
    if (!item || !item.hook) return;

    navigator.clipboard?.writeText(item.hook).then(() => {
      this.showToast('คัดลอกประโยค Hook ไปยังคลิปบอร์ดแล้ว', 'green');
    }).catch(() => {
      this.showToast('ไม่สามารถเข้าถึงคลิปบอร์ดได้', 'coral');
    });
  }

  /**
   * Opens S09 Director Brief Modal
   */
  openDirectorBriefModal(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    const revCode = item.isApproved && item.approvedRevision ? item.approvedRevision.code : 'REV-DRAFT';
    const currentDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (this.dom.briefModalRevCode) this.dom.briefModalRevCode.textContent = revCode;
    if (this.dom.briefTitleVal) this.dom.briefTitleVal.textContent = item.title;
    if (this.dom.briefRuntimeVal) this.dom.briefRuntimeVal.textContent = item.estimatedRuntime || '~90 วินาที';
    if (this.dom.briefDateVal) this.dom.briefDateVal.textContent = currentDate;
    if (this.dom.briefCreativeIntentText) {
      this.dom.briefCreativeIntentText.innerHTML = `<strong>Creative Rationale:</strong> ${this.escapeHtml(item.creativeRationale)}<br><strong>Target Audience:</strong> ${this.escapeHtml(item.targetAudience)}`;
    }

    if (this.dom.briefAttributionText) {
      this.dom.briefAttributionText.textContent = `WHAT: ${item.sourceWhat || 'Founder Vault'} | HOW: ${item.sourceHow || 'Original Pacing'}`;
    }

    // Build Cue Sheet Rows
    if (this.dom.briefCueTableBody) {
      this.dom.briefCueTableBody.innerHTML = (item.beats || []).map((beat, idx) => `
        <tr>
          <td><span class="cue-timecode">${this.escapeHtml(beat.timecode || '')}</span></td>
          <td>
            <div class="cue-framing">${this.escapeHtml(beat.title || `Scene ${idx + 1}`)}</div>
            <div style="font-size: 0.725rem; color: #6b6762; margin-top: 2px;">
              ${idx === 0 ? 'A-Cam Eye-level Medium' : idx === 1 ? 'A-Cam Close-up' : idx === 2 ? 'Split Screen / B-Cam' : 'A-Cam Direct View'}
            </div>
          </td>
          <td>
            <div class="cue-teleprompter">
              ${idx === 0 ? `"${this.escapeHtml(item.hook)}"` : this.escapeHtml(beat.desc || '')}
            </div>
          </td>
          <td>
            <div class="cue-sfx">
              ${idx === 0 ? 'Metronome click (3s) + Clean voice' : idx === 1 ? 'Subtle ambient hum' : idx === 2 ? 'Tactile keyboard sound' : 'Smooth fade-out'}
            </div>
          </td>
        </tr>
      `).join('');
    }

    if (this.dom.briefOverlay) {
      this.dom.briefOverlay.hidden = false;
      this.dom.briefOverlay.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Closes S09 Director Brief Modal
   */
  closeDirectorBriefModal() {
    if (this.dom.briefOverlay) {
      this.dom.briefOverlay.hidden = true;
      this.dom.briefOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Copies formatted Director Brief as Markdown to clipboard
   */
  copyBriefAsMarkdown() {
    const item = this.items.find(i => i.id === this.activeItemId);
    if (!item) return;

    const revCode = item.isApproved && item.approvedRevision ? item.approvedRevision.code : 'REV-DRAFT';
    const beatsMd = (item.beats || []).map((b, i) => `| ${b.timecode} | Scene ${i + 1}: ${b.title} | ${i === 0 ? item.hook : b.desc} | SFX / Ambient |`).join('\n');

    const markdown = `# DIRECTOR & PRODUCTION BRIEF
**Project:** MEW CONTENT OS
**Title:** ${item.title}
**Revision:** ${revCode}
**Host:** Mew Teetawat
**Runtime:** ${item.estimatedRuntime || '~90 วินาที'}
**Format:** 9:16 Vertical Reel (1080x1920) @ 24fps

---

### 1. Executive Creative Intent
- **Creative Rationale:** ${item.creativeRationale}
- **Target Audience:** ${item.targetAudience}
- **Tone:** ถ่อมตน จริงใจ หนักแน่น ไม่สั่งสอนหรือโอ้อวด

---

### 2. Shot List & Scene Cue Sheet
| Timecode | Beat & Visual | Dialogue / Teleprompter | Audio & SFX |
| :--- | :--- | :--- | :--- |
${beatsMd}

---

### 3. Production Specs
- **Camera:** A-Cam Medium Eye-level 35mm f/2.0, B-Cam 45-degree close-up
- **Lighting:** Key light softbox 45-degree @ 5600K
- **Audio:** Lav mic zero echo, music ducked to -24dB

---

### 4. Copyright & Ethical Compliance
- Zero Plagiarism: Synthesized original thoughts
- Zero Fake Metrics: ปราศจากตัวเลขสถิติหลอกตา 100%
- Audio Rights: Royalty-Free / Custom MEW OS audio
`;

    navigator.clipboard?.writeText(markdown).then(() => {
      this.showToast('คัดลอก Director Brief (Markdown) เรียบร้อย', 'green');
    }).catch(() => {
      this.showToast('ไม่สามารถเข้าถึงคลิปบอร์ดได้', 'coral');
    });
  }

  /**
   * Opens Quick Create Draft Modal
   */
  openQuickCreateModal() {
    if (this.dom.quickCreateOverlay) {
      this.dom.quickCreateOverlay.hidden = false;
      this.dom.quickCreateOverlay.setAttribute('aria-hidden', 'false');
      const firstInput = this.dom.quickCreateForm?.querySelector('#create-concept-title');
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }
  }

  /**
   * Closes Quick Create Draft Modal
   */
  closeQuickCreateModal() {
    if (this.dom.quickCreateOverlay) {
      this.dom.quickCreateOverlay.hidden = true;
      this.dom.quickCreateOverlay.setAttribute('aria-hidden', 'true');
      this.dom.quickCreateForm?.reset();
    }
  }

  /**
   * Handles submission of Quick Create Form
   */
  handleQuickCreateSubmit(e) {
    e.preventDefault();

    const titleInput = this.root.querySelector('#create-concept-title');
    const angleInput = this.root.querySelector('#create-concept-angle');
    const hookInput = this.root.querySelector('#create-concept-hook');
    const rationaleInput = this.root.querySelector('#create-concept-rationale');

    const title = titleInput?.value.trim();
    const angle = angleInput?.value.trim() || 'Perspective Shift';
    const hook = hookInput?.value.trim();
    const rationale = rationaleInput?.value.trim() || 'มุ่งเน้นการสร้างคุณค่าที่แท้จริงและซื่อสัตย์ต่อแบรนด์';

    if (!title || !hook) {
      alert('กรุณากรอกชื่อเรื่องและประโยค Hook เปิดคลิป');
      return;
    }

    const newItem = {
      id: `board-${Date.now()}`,
      conceptId: `concept-${Date.now()}`,
      title,
      angle,
      stage: 'draft',
      isApproved: false,
      approvedRevision: null,
      targetAudience: 'ผู้ประกอบการและนักสร้างคอนเทนต์ที่ให้ความสำคัญกับเนื้อหาคุณภาพ',
      creativeRationale: rationale,
      hook,
      teleprompterScript: hook,
      beats: [
        { title: 'Beat 1: Pattern Interrupt Hook', timecode: '0:00 - 0:04', desc: hook },
        { title: 'Beat 2: Problem Agitation', timecode: '0:05 - 0:30', desc: 'ลงลึกในปัญหาที่คนดูต้องเผชิญ' },
        { title: 'Beat 3: Solution Framework', timecode: '0:31 - 1:15', desc: 'นำเสนอทางออกที่เป็นรูปธรรม' },
        { title: 'Beat 4: Organic Action', timecode: '1:16 - 1:30', desc: 'ชวนให้ลองนำไปปรับใช้จริง' }
      ],
      sceneDirection: 'มุมมอง A-Cam Eye-level Medium Close-Up แสงธรรมชาติ โต๊ะทำงานสะอาดตา',
      soundDirection: 'เสียงพูดชัดเจน ไร้เสียงสะท้อน พร้อมดนตรีเบาๆ คลอประกอบ',
      claimVerification: 'ตรวจสอบแล้ว: อิงจากประสบการณ์ตรง ปราศจากสถิติสมมติ 100%',
      cta: 'ลองนำระบบนี้ไปใช้ในการทำงานชิ้นถัดไปของคุณ',
      sourceWhat: 'Manual Draft Entry',
      sourceHow: 'Direct Delivery',
      estimatedRuntime: '~90 วินาที',
      wordCount: 150,
      createdAt: new Date().toISOString()
    };

    this.items.unshift(newItem);
    this.saveItemsToStorage();
    this.closeQuickCreateModal();
    this.renderBoard();
    this.updateCounters();

    this.showToast(`สร้าง Concept Draft "${title}" เรียบร้อย`, 'coral');
  }

  /**
   * Updates count badges across toolbar and columns
   */
  updateCounters() {
    const counts = {
      all: this.items.length,
      draft: this.items.filter(i => i.stage === 'draft').length,
      review: this.items.filter(i => i.stage === 'review').length,
      approved: this.items.filter(i => i.stage === 'approved').length,
      ready: this.items.filter(i => i.stage === 'ready').length
    };

    // Column headers
    if (this.dom.countStageDraft) this.dom.countStageDraft.textContent = counts.draft;
    if (this.dom.countStageReview) this.dom.countStageReview.textContent = counts.review;
    if (this.dom.countStageApproved) this.dom.countStageApproved.textContent = counts.approved;
    if (this.dom.countStageReady) this.dom.countStageReady.textContent = counts.ready;

    // Filter tabs
    if (this.dom.filterCountAll) this.dom.filterCountAll.textContent = counts.all;
    if (this.dom.filterCountDraft) this.dom.filterCountDraft.textContent = counts.draft;
    if (this.dom.filterCountReview) this.dom.filterCountReview.textContent = counts.review;
    if (this.dom.filterCountApproved) this.dom.filterCountApproved.textContent = counts.approved;
    if (this.dom.filterCountReady) this.dom.filterCountReady.textContent = counts.ready;
  }

  /**
   * Utility helper to get dropzone element by stage
   */
  getDropzoneForStage(stage) {
    switch (stage) {
      case 'draft': return this.dom.dropzoneDraft;
      case 'review': return this.dom.dropzoneReview;
      case 'approved': return this.dom.dropzoneApproved;
      case 'ready': return this.dom.dropzoneReady;
      default: return null;
    }
  }

  /**
   * Accent color mappings
   */
  getAccentColorForStage(stage) {
    switch (stage) {
      case 'draft': return 'coral';
      case 'review': return 'amber';
      case 'approved': return 'green';
      case 'ready': return 'violet';
      default: return 'coral';
    }
  }

  /**
   * Accessible Toast Feedback
   */
  showToast(message, type = 'coral') {
    if (!this.dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `board-toast toast-${type}`;
    toast.setAttribute('role', 'status');

    const iconSvg = type === 'green'
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `${iconSvg}<span>${this.escapeHtml(message)}</span>`;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /**
   * Helper to truncate strings cleanly
   */
  truncate(str, length = 80) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  /**
   * HTML escape helper
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

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  const initBoard = () => {
    const rootEl = document.querySelector('#content-board-root');
    if (rootEl && !window.contentBoardCtrl) {
      window.contentBoardCtrl = new ContentBoardController({ rootId: '#content-board-root' });
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBoard);
  } else {
    initBoard();
  }
}

// Universal Global & CommonJS Export
if (typeof window !== 'undefined') {
  window.DEFAULT_BOARD_ITEMS = DEFAULT_BOARD_ITEMS;
  window.ContentBoardController = ContentBoardController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_BOARD_ITEMS, ContentBoardController };
}
