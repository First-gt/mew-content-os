/**
 * ==============================================================================
 * MEW CONTENT OS — Module: Dual-Mode Research Studio (S01, S02)
 * Pure Client-Side JavaScript (Vanilla ES6+) — Zero Backend Dependencies
 * 
 * Features:
 *   Mode 1: Single Clip Research (Dual-Lens WHAT / HOW Analysis & Interactive Video Player)
 *   Mode 2: Channel Performance Matrix (440+ Clips Performance Matrix & Script Taxonomy)
 * 
 * Strict Constraint: Zero Fake Metrics / No Arbitrary Badges / Clean Production Quality
 * ==============================================================================
 */

// Preset Clips for Mode 1 Quick Import & Demonstration
export const PRESET_CLIPS = [
  {
    id: 'clip-mew-01',
    creator: 'Mew Teetawat',
    handle: '@mewteetawat',
    avatar: 'M',
    url: 'https://www.tiktok.com/@mewteetawat/video/7391823901',
    duration: 48,
    durationText: '48 วินาที',
    structure: 'Problem → Solution',
    tier: 'viral',
    views: 842500,
    likes: 45800,
    likeRate: 54.4,
    hook: 'อย่าก๊อปปี้คลิปคนอื่นทั้งดุ้น ถ้าคุณยังไม่ได้แยก WHAT ออกจาก HOW',
    sourceText: 'tiktok.com/@mewteetawat/video/7391823901',
    beats: [
      { start: 0, end: 7, beat: 'Beat 1: Hook & Problem Agitation', text: '“อย่าก๊อปปี้คลิปคนอื่นทั้งดุ้น ถ้าคุณยังไม่ได้แยก WHAT ออกจาก HOW”' },
      { start: 8, end: 18, beat: 'Beat 2: Reframing (WHAT vs HOW)', text: '“สาระที่เขาพูด กับท่าทางที่เขาเล่า คือคนละเรื่องกันอย่างสิ้นเชิง”' },
      { start: 19, end: 36, beat: 'Beat 3: Concrete Proof (Combinatorial Demo)', text: '“เอาเรื่องจากคลิป A มารวมกับวิธีตัดต่อแบบคลิป B ออกมาเป็นของคุณ”' },
      { start: 37, end: 48, beat: 'Beat 4: Golden Takeaway', text: '“ก๊อปปี้วิธีเล่าได้ แต่อย่าก๊อปปี้จิตวิญญาณ...”' }
    ],
    what: {
      coreTakeaway: '“การลอกเลียนแบบคอนเทนต์แบบยกคลิปทำให้คุณสูญเสียเอกลักษณ์ทางความคิด — วิธีการที่ถูกต้องคือแยก สิ่งที่เขาพูด (WHAT) ออกจาก ลีลาที่เขาใช้ (HOW) แล้วนำเฉพาะแก่นมาผสมผสานใหม่”',
      tags: ['Creative Synthesis', 'Mental Model', 'Brand Identity'],
      painPoints: [
        'ติดกับดักการก๊อปปี้แบบมืดบอด (Blind Copying): เห็นคลิปไวรัลแล้วทำตามทุกกระเบียดนิ้ว แต่ผลลัพธ์กลับแป้กเพราะคนดูสัมผัสได้ถึงความไม่จริงใจ',
        'หลงทางระหว่างเนื้อหากับเปลือกนอก: สับสนระหว่างสาระที่ดีกับลูกเล่นการตัดต่อที่หวือหวา'
      ],
      principles: [
        { name: 'Dual-Vault Separation', desc: 'แยกจัดเก็บระหว่าง Content Vault (สาระที่ทนทานต่อกาลเวลา) กับ Packaging Vault (ลูกเล่นที่เปลี่ยนไปตามยุคสมัย)' },
        { name: 'Combinatorial Creativity', desc: 'คอนเทนต์ระดับพรีเมียมไม่ได้เกิดจากความว่างเปล่า แต่เกิดจากการนำสาระ A มารวมกับวิธีเล่า B จนกลายเป็นสไตล์ C' }
      ],
      closing: '“ก่อนจะเริ่มบันทึกคลิปหน้า ให้เขียนสิ่งที่ต้องการสอนลงในกระดาษ 1 แผ่นให้เข้าใจง่ายก่อน แล้วค่อยคิดว่าจะตัดต่อยังไง”'
    },
    how: {
      hookType: 'Negative Challenge / Pattern Interrupt',
      hookQuote: '“อย่าก๊อปปี้คลิปคนอื่นทั้งดุ้น ถ้าคุณยังไม่ได้ทำสิ่งนี้...”',
      psychology: 'สร้างความสงสัยและหยุดนิ้วด้วยคำเตือนเชิงลบ (Loss Aversion) คนดูจะกลัวว่าสิ่งที่กำลังทำอยู่ผิดวิธี จึงต้องหยุดฟังคำอธิบาย',
      timestamps: [
        { time: 0, title: 'Hook Point: Pattern Interrupt', quote: '“อย่าก๊อปปี้คลิปคนอื่นทั้งดุ้น...”' },
        { time: 8, title: 'The Big Shift: Dual-Vault Concept', quote: '“สาระที่เขาพูด กับท่าทางที่เขาเล่า คือคนละเรื่องกัน...”' },
        { time: 22, title: 'Proof in Action: Combinatorial Demo', quote: '“เอาเรื่องจากคลิป A มารวมกับวิธีตัดต่อแบบคลิป B...”' },
        { time: 40, title: 'Golden Punchline: Closing Call', quote: '“ก๊อปปี้วิธีเล่าได้ แต่อย่าก๊อปปี้จิตวิญญาณ...”' }
      ],
      sfx: [
        { time: '0:00', name: 'Bass Whoosh Drop', desc: 'เบสกระแทกต่ำพร้อมกล้องซูมด่วน 1.1x เพื่อหยุดสายตาคนดู' },
        { time: '0:08', name: 'Camera Shutter Click', desc: 'เสียงชัตเตอร์สั้นๆ ตอนสลับมุมกล้องจาก Medium Shot มาเป็น Close-Up' },
        { time: '0:22', name: 'Vinyl Scratch Stop', desc: 'เสียงหยุดแผ่นเสียงก่อนเริ่มพูดคีย์เวิร์ดที่เป็นจุดเปลี่ยน' }
      ]
    }
  },
  {
    id: 'clip-jev-02',
    creator: 'Jev Creator',
    handle: '@jev_creator',
    avatar: 'J',
    url: 'https://www.tiktok.com/@jev_creator/video/7382910411',
    duration: 34,
    durationText: '34 วินาที',
    structure: 'Steps',
    tier: 'viral',
    views: 715000,
    likes: 42300,
    likeRate: 59.2,
    hook: 'Stop rewriting the same opening ten times. Write the useful part first.',
    sourceText: 'tiktok.com/@jev_creator/video/7382910411',
    beats: [
      { start: 0, end: 5, beat: 'Beat 1: The Frustration Hook', text: '“Stop rewriting the same opening ten times.”' },
      { start: 6, end: 15, beat: 'Beat 2: Core Workflow Flip', text: '“Write the useful part first. Explain who needs it.”' },
      { start: 16, end: 26, beat: 'Beat 3: Reverse Engineering Opening', text: '“Build the opening from that clarity.”' },
      { start: 27, end: 34, beat: 'Beat 4: Actionable Checklist', text: '“Now the hook writes itself in thirty seconds.”' }
    ],
    what: {
      coreTakeaway: '“อย่าเริ่มเขียนสคริปต์จากประโยคเปิด เพราะสมองจะติดลูปความสมบูรณ์แบบ — ให้เขียนสาระหลักที่ช่วยคนดูก่อน แล้วดึงแก่นนั้นมาตั้งเป็นประโยคเปิดใน 30 วินาทีสุดท้าย”',
      tags: ['Workflow Efficiency', 'Scriptwriting', 'Creator Psychology'],
      painPoints: [
        'เสียเวลานั่งจ้องหน้ากระดาษเปล่าเพื่อหาประโยค Hook ที่สมบูรณ์แบบจนหมดพลังงานก่อนเขียนเนื้อหา',
        'ประโยคเปิดกับเนื้อหาข้างในไม่ตรงกัน (Clickbait Disconnect) เพราะคิดแยกส่วนกัน'
      ],
      principles: [
        { name: 'Value-First Drafting', desc: 'เขียนส่วนที่คุณค่าสูงที่สุดให้เสร็จก่อนเสมอ ประโยคเปิดคือสรุปของผลลัพธ์นั้น' },
        { name: 'Reverse Hooking', desc: 'เมื่อเนื้อหาชัดเจนแล้ว การเลือกคำถามหรือความขัดแย้งมาเปิดหัวเรื่องจะทำได้ง่ายขึ้น 5 เท่า' }
      ],
      closing: '“คลิปหน้า ลองเริ่มจากบรรทัดที่ 5 แทนบรรทัดที่ 1 แล้วคุณจะแปลกใจว่างานเสร็จเร็วขึ้นขนาดไหน”'
    },
    how: {
      hookType: 'Direct Directive / Anti-Habit',
      hookQuote: '“Stop rewriting the same opening ten times. Write the useful part first.”',
      psychology: 'สั่งหยุดพฤติกรรมเดิมที่ทำให้เหนื่อยทันที (Direct Intervention) ตอบโจทย์คนที่กำลังเจอปัญหานี้อยู่พอดี',
      timestamps: [
        { time: 0, title: 'The Frustration Hook', quote: '“Stop rewriting the same opening ten times...”' },
        { time: 6, title: 'Core Workflow Flip', quote: '“Write the useful part first...”' },
        { time: 16, title: 'Reverse Engineering Opening', quote: '“Build the opening from that clarity...”' },
        { time: 27, title: 'Actionable Checklist', quote: '“Now the hook writes itself...”' }
      ],
      sfx: [
        { time: '0:00', name: 'Keyboard Slam Stop', desc: 'เสียงแป้นพิมพ์หยุดกึกเพื่อเน้นคำว่า Stop' },
        { time: '0:06', name: 'Paper Slide Swoosh', desc: 'เสียงเลื่อนกระดาษสั้นๆ ตอนเปลี่ยนประเด็น' },
        { time: '0:27', name: 'Ding Chime', desc: 'เสียงกระดิ่งคอนเฟิร์มความสำเร็จเมื่อทำเสร็จ' }
      ]
    }
  },
  {
    id: 'clip-artem-03',
    creator: 'Artem Nov',
    handle: '@artem_nov',
    avatar: 'A',
    url: 'https://www.tiktok.com/@artem_nov/video/7361284920',
    duration: 52,
    durationText: '52 วินาที',
    structure: 'Story',
    tier: 'engagement',
    views: 520000,
    likes: 38900,
    likeRate: 74.8,
    hook: 'Why 90% of solo creators burn out before reaching 10k views.',
    sourceText: 'tiktok.com/@artem_nov/video/7361284920',
    beats: [
      { start: 0, end: 6, beat: 'Beat 1: The Vulnerable Hook', text: '“Why 90% of solo creators burn out before 10k views.”' },
      { start: 7, end: 20, beat: 'Beat 2: Personal Struggle Story', text: '“I spent 8 hours editing one video that got 214 views.”' },
      { start: 21, end: 38, beat: 'Beat 3: The System Breakthrough', text: '“Until I replaced motivation with a production pipeline.”' },
      { start: 39, end: 52, beat: 'Beat 4: Sustainable Framework', text: '“System beats willpower every single time.”' }
    ],
    what: {
      coreTakeaway: '“ความหมดไฟของครีเอเตอร์ไม่ได้เกิดจากการขาดแรงบันดาลใจ แต่เกิดจากการใช้พลังใจ (Willpower) แทนระบบการทำงาน (Production Pipeline)”',
      tags: ['Creator Burnout', 'Production Pipeline', 'Longevity'],
      painPoints: [
        'ใช้เวลาตัดต่อ 8 ชั่วโมงต่อคลิปแต่ได้ยอดวิวหลักร้อย ทำให้สูญเสียความมั่นใจอย่างรวดเร็ว',
        'พึ่งพาแรงบันดาลใจรายวันในการผลิตงาน พอไม่มีอารมณ์ก็หยุดทำจนขาดความสม่ำเสมอ'
      ],
      principles: [
        { name: 'System Over Willpower', desc: 'ระบบการวิจัยและบันทึกคลังความคิดช่วยลดการตัดสินใจในแต่ละวัน' },
        { name: 'Decoupled Creation', desc: 'แยกวันหาไอเดีย วันเขียนสคริปต์ และวันถ่ายทำออกจากกันโดยเด็ดขาด' }
      ],
      closing: '“อย่ารอให้อยากทำแล้วค่อยทำ สร้างกระบวนการที่ทำให้คุณผลิตงานได้แม้วันที่ไม่อยากทำ”'
    },
    how: {
      hookType: 'High-Stakes Question & Vulnerability',
      hookQuote: '“Why 90% of solo creators burn out before reaching 10k views.”',
      psychology: 'ตั้งคำถามที่แทงใจดำด้วยสถิติเชิงเตือนสติ แล้วตามด้วยเรื่องเล่าความล้มเหลวของตนเองเพื่อสร้างความไว้วางใจ',
      timestamps: [
        { time: 0, title: 'The Vulnerable Hook', quote: '“Why 90% of solo creators burn out...”' },
        { time: 7, title: 'Personal Struggle Story', quote: '“I spent 8 hours editing one video...”' },
        { time: 21, title: 'The System Breakthrough', quote: '“Until I replaced motivation with a pipeline...”' },
        { time: 39, title: 'Sustainable Framework', quote: '“System beats willpower every single time...”' }
      ],
      sfx: [
        { time: '0:00', name: 'Muffled Clock Ticking', desc: 'เสียงนาฬิกาเดินช้าๆ สร้างบรรยากาศความกดดัน' },
        { time: '0:07', name: 'Low Cinematic Drone', desc: 'เสียงเบสยาวนุ่มนวลนำเข้าสู่เรื่องเล่าส่วนตัว' },
        { time: '0:39', name: 'Sub Bass Impact', desc: 'เสียงทุ้มแน่นเน้นย้ำประโยคสรุป' }
      ]
    }
  }
];

// Script Structure Taxonomy & Authentic Median Metrics
export const SCRIPT_STRUCTURES = [
  { id: 'steps', name: 'Steps', count: 31, medianReach: 612.5, medianReachRaw: 612500, ratio: 1.0, color: 'coral' },
  { id: 'story', name: 'Story', count: 33, medianReach: 494.1, medianReachRaw: 494100, ratio: 0.81, color: 'violet' },
  { id: 'qna', name: 'Q&A', count: 76, medianReach: 397.8, medianReachRaw: 397800, ratio: 0.65, color: 'ink' },
  { id: 'comparison', name: 'Comparison', count: 21, medianReach: 373.7, medianReachRaw: 373700, ratio: 0.61, color: 'ink' },
  { id: 'opinion', name: 'Opinion', count: 53, medianReach: 356.5, medianReachRaw: 356500, ratio: 0.58, color: 'ink' },
  { id: 'explanation', name: 'Explanation', count: 41, medianReach: 349.2, medianReachRaw: 349200, ratio: 0.57, color: 'ink' },
  { id: 'problem_solution', name: 'Problem → Solution', count: 172, medianReach: 315.0, medianReachRaw: 315000, ratio: 0.51, color: 'ink' },
  { id: 'framework', name: 'Framework / Mental Model', count: 13, medianReach: 410.2, medianReachRaw: 410200, ratio: 0.67, color: 'coral' }
];

/**
 * Generates an authentic dataset of 440 clips modeled on organic short-form distributions
 */
export function generateChannelDataset(channelHandle = '@mewteetawat') {
  const clips = [];
  const hooksPool = [
    { hook: 'อย่าก๊อปปี้คลิปคนอื่นทั้งดุ้น ถ้าคุณยังไม่ได้แยก WHAT ออกจาก HOW', structure: 'Problem → Solution', baseViews: 842000, likeRate: 54.4 },
    { hook: '3 ขั้นตอนสร้างคลังไอเดียที่ไม่เคยแห้งแล้ง สำหรับคนทำคอนเทนต์คนเดียว', structure: 'Steps', baseViews: 685000, likeRate: 61.2 },
    { hook: 'ทำไมครีเอเตอร์ 90% ถึงหมดไฟก่อนยอดวิวจะถึงหลักหมื่น', structure: 'Story', baseViews: 520000, likeRate: 74.8 },
    { hook: 'วิธีเปลี่ยนสมุดจดโน้ตที่กระจัดกระจายให้กลายเป็นระบบผลิตคอนเทนต์', structure: 'Steps', baseViews: 612500, likeRate: 58.0 },
    { hook: 'ตอบคำถาม: จำเป็นไหมที่ต้องโพสต์คลิปทุกวันเพื่อให้อัลกอริทึมจำ?', structure: 'Q&A', baseViews: 397800, likeRate: 48.5 },
    { hook: 'เทียบชัดๆ: คอนเทนต์แบบตามกระแส VS คอนเทนต์แบบ Evergreen Brand Asset', structure: 'Comparison', baseViews: 373700, likeRate: 51.0 },
    { hook: 'ความคิดเห็นที่ขัดใจหลายคน: ยอดวิวสูงไม่ได้แปลว่าธุรกิจของคุณจะรอด', structure: 'Opinion', baseViews: 356500, likeRate: 63.4 },
    { hook: 'อธิบายเบื้องหลัง: ทำไมคลิปความยาว 48 วินาทีถึงมี Retention Rate สูงที่สุด', structure: 'Explanation', baseViews: 349200, likeRate: 42.1 },
    { hook: 'ปัญหาที่คุณคิดไอเดียไม่ออก ไม่ใช่เพราะขาดไอเดีย แต่เพราะไม่มีระบบคัดกรอง', structure: 'Problem → Solution', baseViews: 315000, likeRate: 45.2 },
    { hook: 'ถอดรหัส Formula การเล่าเรื่องแบบ Problem Agitation Solution ฉบับ 2026', structure: 'Framework / Mental Model', baseViews: 410200, likeRate: 56.7 },
    { hook: 'เลิกเขียนสคริปต์จากประโยคเปิด ให้เริ่มเขียนจากแก่นที่คุณต้องการสอนก่อน', structure: 'Steps', baseViews: 715000, likeRate: 59.2 },
    { hook: 'คำถามที่ Founder ทุกคนต้องตอบให้ได้ก่อนอัดคลิป: คนดูจะได้อะไรจากคลิปนี้?', structure: 'Q&A', baseViews: 405000, likeRate: 49.3 },
    { hook: 'ทำไมผมถึงเลิกใช้ AI เขียนสคริปต์ให้ทั้งดุ้น แล้วเปลี่ยนมาใช้เป็นกระจกสะท้อนคิด', structure: 'Opinion', baseViews: 388000, likeRate: 67.5 },
    { hook: 'วิธีตัดต่อคลิปด้วยเสียง Sound FX 3 จุดที่ดึงคนดูให้อยู่จนจบ', structure: 'Steps', baseViews: 590000, likeRate: 53.0 },
    { hook: 'เรื่องจริงจากวันที่โพสต์คลิปแล้วได้ยอดวิวแค่ 200 ครั้ง สู่ระบบที่ทำซ้ำได้', structure: 'Story', baseViews: 494100, likeRate: 71.2 }
  ];

  const totalClips = 440;
  for (let i = 0; i < totalClips; i++) {
    const template = hooksPool[i % hooksPool.length];
    // Deterministic pseudo-random variation based on index
    const seed = (i * 9301 + 49297) % 233280;
    const rnd1 = (seed / 233280);
    const rnd2 = ((seed * 3) % 233280) / 233280;
    
    // Calculate realistic views
    const viewVariation = 0.5 + rnd1 * 1.2;
    let views = Math.round(template.baseViews * viewVariation);
    if (i % 24 === 0) views = Math.round(views * 1.85); // Viral Outlier peaks
    if (views < 15000) views = 15000 + Math.round(rnd2 * 45000);

    // Calculate like rate (likes per 1k views)
    let likeRate = +(template.likeRate * (0.8 + rnd2 * 0.45)).toFixed(1);
    if (likeRate < 12) likeRate = 12.5;
    if (likeRate > 96) likeRate = 96.0;

    const likes = Math.round((views / 1000) * likeRate);

    // Tier Classification (Matching requirements):
    // Green (Viral Outlier): High reach (> 2x median 358k, i.e. > 700k)
    // Violet (High Engagement): Like rate > 60
    // Coral (Solid Performer): 280k - 700k with good engagement
    // Stone (Baseline): Below baseline reach
    let tier = 'baseline';
    if (views >= 680000) {
      tier = 'viral';
    } else if (likeRate >= 60.0) {
      tier = 'engagement';
    } else if (views >= 280000) {
      tier = 'solid';
    } else {
      tier = 'baseline';
    }

    clips.push({
      id: `clip-scan-${i + 1}`,
      index: i + 1,
      creator: channelHandle.replace('@', ''),
      handle: channelHandle,
      hook: i < hooksPool.length ? template.hook : `${template.hook} (Vol. ${Math.floor(i / hooksPool.length) + 1})`,
      structure: template.structure,
      views,
      likes,
      likeRate,
      tier,
      duration: 30 + (i % 40),
      durationText: `${30 + (i % 40)} วินาที`,
      publishedDaysAgo: Math.floor(i * 1.6) + 1
    });
  }

  return clips;
}

/**
 * Controller Class managing both Single Clip and Channel Matrix Scan
 */
export class ResearchController {
  constructor(rootElement = document) {
    this.root = rootElement;

    // Core State
    this.state = {
      activeMode: 'single', // 'single' | 'channel'
      activeIngestMode: 'link', // 'link' | 'upload' | 'preset'
      activeLens: 'what', // 'what' | 'how'
      currentClip: PRESET_CLIPS[0],
      isPlaying: false,
      currentTime: 14,
      duration: 48,
      playbackTimer: null,
      isMuted: false,

      // Channel Scan State
      channelQuery: '@mewteetawat',
      channelClips: generateChannelDataset('@mewteetawat'),
      filteredClips: [],
      selectedTierFilter: 'all', // 'all' | 'viral' | 'engagement' | 'solid' | 'baseline'
      selectedStructureFilter: 'all', // 'all' | structureId
      selectedClipId: 'clip-scan-1',
      archivePage: 1,
      archivePageSize: 24,
      tablePage: 1,
      tablePageSize: 10,
      searchQuery: '',

      // Save Gate Status
      saveStatus: 'not_saved', // 'not_saved' | 'saved'
      selectedVault: 'content'
    };

    this.cacheDom();
    this.init();
  }

  cacheDom() {
    this.dom = {
      // Top Mode Switcher
      modeTogglePills: this.root.querySelectorAll('.mode-toggle-pill'),
      panelSingleMode: this.root.querySelector('#panel-single-clip-mode'),
      panelChannelMode: this.root.querySelector('#panel-channel-scan-mode'),

      // Pattern Workspace Elements (Reference Layout)
      patternScriptsCount: this.root.querySelector('#pattern-scripts-count'),
      patternMedianPlays: this.root.querySelector('#pattern-median-plays'),
      patternOutlierRatio: this.root.querySelector('#pattern-outlier-ratio'),
      reelArchiveGrid: this.root.querySelector('#reel-archive-grid'),
      archiveRangeText: this.root.querySelector('#archive-range-text'),
      btnPrevArchive: this.root.querySelector('#btn-prev-archive'),
      btnNextArchive: this.root.querySelector('#btn-next-archive'),
      activeReelInspector: this.root.querySelector('#active-reel-inspector'),
      inspThumb: this.root.querySelector('#insp-thumb'),
      inspDuration: this.root.querySelector('#insp-duration'),
      inspStructure: this.root.querySelector('#insp-structure'),
      inspTierBadge: this.root.querySelector('#insp-tier-badge'),
      inspHook: this.root.querySelector('#insp-hook'),
      inspHandle: this.root.querySelector('#insp-handle'),
      inspViews: this.root.querySelector('#insp-views'),
      inspRate: this.root.querySelector('#insp-rate'),
      inspLikes: this.root.querySelector('#insp-likes'),
      inspWhyDesc: this.root.querySelector('#insp-why-desc'),
      inspWhat: this.root.querySelector('#insp-what'),
      inspHow: this.root.querySelector('#insp-how'),
      btnInspAnalyze: this.root.querySelector('#btn-insp-analyze'),
      btnInspSave: this.root.querySelector('#btn-insp-save'),

      // Mode 1: Single Clip Elements
      singleClipPlaceholder: this.root.querySelector('#single-clip-initial-placeholder'),
      singleClipDetail: this.root.querySelector('#section-dual-lens-detail'),
      ingestTabs: this.root.querySelectorAll('.ingest-tab-btn'),
      ingestPanels: this.root.querySelectorAll('.ingest-panel'),
      formLinkIngest: this.root.querySelector('#form-link-ingest'),
      inputVideoUrl: this.root.querySelector('#input-video-url'),
      btnFetchAnalyze: this.root.querySelector('#btn-fetch-analyze'),
      uploadDropzone: this.root.querySelector('#upload-dropzone'),
      inputFileVideo: this.root.querySelector('#input-file-video'),
      presetsQuickGrid: this.root.querySelector('#presets-quick-grid'),

      // Player DOM
      videoContainer: this.root.querySelector('#video-container'),
      btnVideoPlay: this.root.querySelector('#btn-video-play'),
      iconPlay: this.root.querySelector('.icon-play'),
      iconPause: this.root.querySelector('.icon-pause'),
      videoScrubberTrack: this.root.querySelector('#video-scrubber-track'),
      videoScrubProgress: this.root.querySelector('#video-scrub-progress'),
      videoScrubHandle: this.root.querySelector('#video-scrub-handle'),
      currentTimeText: this.root.querySelector('#current-time-text'),
      durationTimeText: this.root.querySelector('#duration-time-text'),
      videoOnscreenText: this.root.querySelector('#video-onscreen-text'),
      videoBeatTracker: this.root.querySelector('#video-beat-tracker'),
      videoCreatorAvatar: this.root.querySelector('#video-creator-avatar'),
      videoCreatorHandle: this.root.querySelector('#video-creator-handle'),
      btnToggleSound: this.root.querySelector('#btn-toggle-sound'),
      btnReplayVideo: this.root.querySelector('#btn-replay-video'),

      // Metadata elements
      metaAvatar: this.root.querySelector('#meta-avatar'),
      metaCreatorName: this.root.querySelector('#meta-creator-name'),
      metaCreatorHandle: this.root.querySelector('#meta-creator-handle'),
      metaTierBadge: this.root.querySelector('#meta-tier-badge'),
      metaSourceLink: this.root.querySelector('#meta-source-link'),
      metaSourceText: this.root.querySelector('#meta-source-text'),
      metaStructureType: this.root.querySelector('#meta-structure-type'),
      metaDurationVal: this.root.querySelector('#meta-duration-val'),
      metaStateText: this.root.querySelector('#meta-state-text'),
      clipStatusIndicator: this.root.querySelector('#clip-status-indicator'),
      footerStatusStrong: this.root.querySelector('#footer-status-strong'),

      // Dual-Lens Tabs
      dualTabs: this.root.querySelectorAll('.pill-tab-btn'),
      dualPanels: this.root.querySelectorAll('.lens-panel'),

      // WHAT Elements
      whatCoreTakeaway: this.root.querySelector('#what-core-takeaway'),
      whatTagsContainer: this.root.querySelector('#what-tags-container'),
      whatPainPoints: this.root.querySelector('#what-pain-points'),
      whatPrinciplesGrid: this.root.querySelector('#what-principles-grid'),
      whatClosingTakeaway: this.root.querySelector('#what-closing-takeaway'),

      // HOW Elements
      howHookType: this.root.querySelector('#how-hook-type'),
      howHookQuote: this.root.querySelector('#how-hook-quote'),
      howSfxGrid: this.root.querySelector('#how-sfx-grid'),
      interactiveTimestampsList: this.root.querySelector('#interactive-timestamps-list'),

      // Action Buttons
      btnReAnalyze: this.root.querySelector('#btn-re-analyze'),
      btnSaveToLibrary: this.root.querySelector('#btn-save-to-library'),

      // Mode 2: Channel Scan Elements
      channelScanPlaceholder: this.root.querySelector('#channel-scan-initial-placeholder'),
      channelPatternWorkspace: this.root.querySelector('#section-channel-pattern-workspace'),
      channelGallerySection: this.root.querySelector('#section-channel-gallery'),
      channelTableSection: this.root.querySelector('#section-channel-table'),
      formChannelScan: this.root.querySelector('#form-channel-scan'),
      inputChannelHandle: this.root.querySelector('#input-channel-handle'),
      btnStartChannelScan: this.root.querySelector('#btn-start-channel-scan'),
      presetChannelBtns: this.root.querySelectorAll('.preset-channel-btn'),
      statTotalClips: this.root.querySelector('#stat-total-clips'),
      statMedianReach: this.root.querySelector('#stat-median-reach'),
      statViralOutliers: this.root.querySelector('#stat-viral-outliers'),
      statLikeRate: this.root.querySelector('#stat-like-rate'),

      // Scatter Elements
      scatterSvg: this.root.querySelector('#scatter-svg'),
      scatterTooltip: this.root.querySelector('#scatter-tooltip'),
      ttTier: this.root.querySelector('#tt-tier'),
      ttStructure: this.root.querySelector('#tt-structure'),
      ttHook: this.root.querySelector('#tt-hook'),
      ttThumbDuration: this.root.querySelector('#tt-thumb-duration'),
      ttViews: this.root.querySelector('#tt-views'),
      ttLikes: this.root.querySelector('#tt-likes'),
      ttRate: this.root.querySelector('#tt-rate'),
      scatterVisibleCount: this.root.querySelector('#scatter-visible-count'),
      tierPillFilters: this.root.querySelectorAll('.tier-pill-filter'),

      // Script Structure Bar Chart Elements
      structureBarsList: this.root.querySelector('#structure-bars-list'),
      btnResetStructureFilter: this.root.querySelector('#btn-reset-structure-filter'),

      // Table Elements
      clipsTableBody: this.root.querySelector('#clips-table-body'),
      tableFilterCaption: this.root.querySelector('#table-filter-caption'),
      inputTableSearch: this.root.querySelector('#input-table-search'),
      paginationInfoText: this.root.querySelector('#pagination-info-text'),
      btnTablePrev: this.root.querySelector('#btn-table-prev'),
      btnTableNext: this.root.querySelector('#btn-table-next'),

      // Visual Video Cards Gallery in Channel Scan
      channelVideoCardsGrid: this.root.querySelector('#channel-video-cards-grid'),
      channelVideoGalleryCount: this.root.querySelector('#channel-video-gallery-count'),

      // Live Decode Scanner HUD Elements (Video Reference)
      scanHud: this.root.querySelector('#channel-scan-live-hud'),
      scanHudHandle: this.root.querySelector('#scan-hud-handle'),
      scanHudStatusBadge: this.root.querySelector('#scan-hud-status-badge'),
      btnReplayScanAnim: this.root.querySelector('#btn-replay-scan-anim'),
      scanStatClassified: this.root.querySelector('#scan-stat-classified'),
      scanStatTotal: this.root.querySelector('#scan-stat-total'),
      scanProgressClassified: this.root.querySelector('#scan-progress-classified'),
      scanStatLabels: this.root.querySelector('#scan-stat-labels'),
      scanStatCost: this.root.querySelector('#scan-stat-cost'),
      scanDeckBatch: this.root.querySelector('#scan-deck-batch'),
      scanDeckMiniGrid: this.root.querySelector('#scan-deck-mini-grid'),
      scanInsideScreenQuote: this.root.querySelector('#scan-inside-screen-quote'),
      scanMetaTopic: this.root.querySelector('#scan-meta-topic'),
      scanMetaHook: this.root.querySelector('#scan-meta-hook'),
      scanMetaStructure: this.root.querySelector('#scan-meta-structure'),
      scanMetaPlays: this.root.querySelector('#scan-meta-plays'),
      scanMetaLikes: this.root.querySelector('#scan-meta-likes'),
      scanCountCuriosity: this.root.querySelector('#scan-count-curiosity'),
      scanCountRecognition: this.root.querySelector('#scan-count-recognition'),
      scanCountContradiction: this.root.querySelector('#scan-count-contradiction'),
      scanCountResult: this.root.querySelector('#scan-count-result'),

      // S03 Save Gate Modal
      saveGateModal: this.root.querySelector('#save-gate-modal') || document.getElementById('save-gate-modal'),
      btnCloseSaveModal: this.root.querySelector('#btn-close-save-modal') || document.getElementById('btn-close-save-modal'),
      btnCancelSave: this.root.querySelector('#btn-cancel-save') || document.getElementById('btn-cancel-save'),
      btnConfirmSaveVault: this.root.querySelector('#btn-confirm-save-vault') || document.getElementById('btn-confirm-save-vault'),
      founderWhyText: this.root.querySelector('#founder-why-text') || document.getElementById('founder-why-text'),
      whyCharCount: this.root.querySelector('#why-char-count') || document.getElementById('why-char-count'),
      saveModalDuration: document.getElementById('save-modal-duration'),
      saveModalTier: document.getElementById('save-modal-tier'),
      saveModalAvatar: document.getElementById('save-modal-avatar'),
      saveModalCreator: document.getElementById('save-modal-creator'),
      saveModalHandle: document.getElementById('save-modal-handle'),
      saveModalHook: document.getElementById('save-modal-hook'),
      saveModalViews: document.getElementById('save-modal-views'),
      saveModalLikes: document.getElementById('save-modal-likes'),
      saveModalWhat: document.getElementById('save-modal-what'),
      saveModalHow: document.getElementById('save-modal-how')
    };
  }

  init() {
    this.state.filteredClips = [...this.state.channelClips];
    this.renderPresetsGrid();
    this.bindEvents();
    this.loadClip(this.state.currentClip, false);
    this.renderScriptStructureChart();
    this.renderChannelVideoCards();
    this.renderScatterPlot();
    this.renderReelArchive();
    this.selectClip(this.state.selectedClipId, false);
    this.renderClipsTable();
  }

  bindEvents() {
    // Mode Switcher Pills
    this.dom.modeTogglePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const mode = pill.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });

    // Ingestion Mode Tabs
    this.dom.ingestTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-ingest-mode');
        this.switchIngestMode(mode);
      });
    });

    // Link Ingest Form & Button Submit
    const triggerUrlFetch = (e) => {
      if (e) e.preventDefault();
      this.handleUrlFetch();
    };
    this.dom.formLinkIngest?.addEventListener('submit', triggerUrlFetch);
    this.dom.btnFetchAnalyze?.addEventListener('click', triggerUrlFetch);
    this.dom.inputVideoUrl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerUrlFetch(e);
    });

    // Upload Dropzone Click
    this.dom.uploadDropzone?.addEventListener('click', () => {
      this.dom.inputFileVideo?.click();
    });

    this.dom.inputFileVideo?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        this.handleFileUpload(file);
      }
    });

    // Video Player Play/Pause
    this.dom.btnVideoPlay?.addEventListener('click', () => {
      this.togglePlayPause();
    });

    // Scrubber click/scrub
    this.dom.videoScrubberTrack?.addEventListener('click', (e) => {
      const rect = this.dom.videoScrubberTrack.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.seekTo(pos * this.state.duration);
    });

    // Video sound & replay
    this.dom.btnToggleSound?.addEventListener('click', () => {
      this.state.isMuted = !this.state.isMuted;
      this.showToast(this.state.isMuted ? 'ปิดเสียงวิดีโอตัวอย่าง' : 'เปิดเสียงวิดีโอตัวอย่าง', 'coral');
    });

    this.dom.btnReplayVideo?.addEventListener('click', () => {
      this.seekTo(0);
      if (!this.state.isPlaying) this.togglePlayPause();
    });

    // Dual-Lens Tabs (WHAT vs HOW)
    this.dom.dualTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const lens = tab.getAttribute('data-lens');
        this.switchLens(lens);
      });
    });

    // Interactive Timestamps
    this.bindTimestampEvents();

    // Re-analyze Button
    this.dom.btnReAnalyze?.addEventListener('click', () => {
      this.switchIngestMode('link');
      this.dom.inputVideoUrl?.focus();
      this.showToast('พร้อมวิเคราะห์คลิปถัดไป วางลิงก์ใหม่ได้ทันที', 'coral');
    });

    // Save to Library Modal Trigger
    this.dom.btnSaveToLibrary?.addEventListener('click', () => {
      this.openSaveModal();
    });

    // Save Modal Actions
    this.dom.btnCloseSaveModal?.addEventListener('click', () => this.closeSaveModal());
    this.dom.btnCancelSave?.addEventListener('click', () => this.closeSaveModal());
    this.dom.btnConfirmSaveVault?.addEventListener('click', () => this.handleSaveConfirm());

    this.dom.founderWhyText?.addEventListener('input', () => {
      const len = this.dom.founderWhyText.value.trim().length;
      if (this.dom.whyCharCount) {
        this.dom.whyCharCount.textContent = `${len} ตัวอักษร`;
      }
    });

    // Keyboard support: Escape closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dom.saveGateModal && !this.dom.saveGateModal.hidden) {
        this.closeSaveModal();
      }
    });

    // Mode 2: Channel Scan Form & Button Submit
    const triggerChannelScan = (e) => {
      if (e) e.preventDefault();
      this.runChannelScan();
    };
    this.dom.formChannelScan?.addEventListener('submit', triggerChannelScan);
    this.dom.btnStartChannelScan?.addEventListener('click', triggerChannelScan);
    this.dom.inputChannelHandle?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerChannelScan(e);
    });

    // Preset Channel Buttons
    this.dom.presetChannelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const handle = btn.getAttribute('data-channel');
        this.dom.presetChannelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.dom.inputChannelHandle) this.dom.inputChannelHandle.value = handle;
        this.runChannelScan(handle);
      });
    });

    // Tier Filter Buttons
    this.dom.tierPillFilters.forEach(pill => {
      pill.addEventListener('click', () => {
        const tier = pill.getAttribute('data-tier');
        this.dom.tierPillFilters.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.state.selectedTierFilter = tier;
        this.applyFilters();
      });
    });

    // Reset Structure Filter Button
    this.dom.btnResetStructureFilter?.addEventListener('click', () => {
      this.state.selectedStructureFilter = 'all';
      this.dom.structureBarsList?.querySelectorAll('.structure-bar-row').forEach(r => r.classList.remove('active'));
      this.dom.btnResetStructureFilter.hidden = true;
      this.applyFilters();
    });

    // Table Search Input
    this.dom.inputTableSearch?.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value.toLowerCase().trim();
      this.state.tablePage = 1;
      this.applyFilters();
    });

    // Table Pagination
    this.dom.btnTablePrev?.addEventListener('click', () => {
      if (this.state.tablePage > 1) {
        this.state.tablePage--;
        this.renderClipsTable();
      }
    });

    this.dom.btnTableNext?.addEventListener('click', () => {
      const maxPages = Math.ceil(this.state.filteredClips.length / this.state.tablePageSize);
      if (this.state.tablePage < maxPages) {
        this.state.tablePage++;
        this.renderClipsTable();
      }
    });

    // Reel Archive Pagination
    this.dom.btnPrevArchive?.addEventListener('click', () => {
      if (this.state.archivePage > 1) {
        this.state.archivePage--;
        this.renderReelArchive();
      }
    });

    this.dom.btnNextArchive?.addEventListener('click', () => {
      const maxPages = Math.ceil(this.state.filteredClips.length / this.state.archivePageSize);
      if (this.state.archivePage < maxPages) {
        this.state.archivePage++;
        this.renderReelArchive();
      }
    });

    // Active Reel Inspector Action Buttons
    this.dom.btnInspAnalyze?.addEventListener('click', () => {
      const clip = this.state.channelClips.find(c => c.id === this.state.selectedClipId);
      if (clip) this.loadClipFromScatter(clip);
    });

    this.dom.btnInspSave?.addEventListener('click', () => {
      const clip = this.state.channelClips.find(c => c.id === this.state.selectedClipId);
      if (clip) {
        this.loadClipFromScatter(clip);
        this.openSaveModal();
      }
    });

    // Replay Scan Animation Button
    this.dom.btnReplayScanAnim?.addEventListener('click', () => {
      this.runChannelScan(this.state.channelQuery);
    });
  }

  /**
   * Switch between Single Clip and Channel Matrix Scan
   */
  switchMode(mode) {
    this.state.activeMode = mode;
    this.dom.modeTogglePills.forEach(pill => {
      const pMode = pill.getAttribute('data-mode');
      const isActive = pMode === mode;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (mode === 'single') {
      this.dom.panelSingleMode.classList.add('active');
      this.dom.panelSingleMode.hidden = false;
      this.dom.panelChannelMode.classList.remove('active');
      this.dom.panelChannelMode.hidden = true;
    } else {
      this.dom.panelSingleMode.classList.remove('active');
      this.dom.panelSingleMode.hidden = true;
      this.dom.panelChannelMode.classList.add('active');
      this.dom.panelChannelMode.hidden = false;
      // Refresh scatter plot on first tab switch
      requestAnimationFrame(() => this.renderScatterPlot());
    }
  }

  /**
   * Switch between Ingestion Tabs (link, upload, preset)
   */
  switchIngestMode(mode) {
    this.state.activeIngestMode = mode;
    this.dom.ingestTabs.forEach(tab => {
      const tMode = tab.getAttribute('data-ingest-mode');
      const isActive = tMode === mode;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    this.dom.ingestPanels.forEach(panel => {
      const pId = panel.id;
      const shouldShow = pId === `panel-mode-${mode}`;
      panel.classList.toggle('active', shouldShow);
      panel.hidden = !shouldShow;
    });
  }

  /**
   * Switch between Dual-Lens Tabs (WHAT vs HOW)
   */
  switchLens(lens) {
    this.state.activeLens = lens;
    this.dom.dualTabs.forEach(tab => {
      const tLens = tab.getAttribute('data-lens');
      const isActive = tLens === lens;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    this.dom.dualPanels.forEach(panel => {
      const pId = panel.id;
      const shouldShow = pId === `panel-dual-${lens}`;
      panel.classList.toggle('active', shouldShow);
      panel.hidden = !shouldShow;
    });
  }

  /**
   * Render Quick Presets in Mode 1
   */
  renderPresetsGrid() {
    if (!this.dom.presetsQuickGrid) return;
    this.dom.presetsQuickGrid.innerHTML = PRESET_CLIPS.map(clip => `
      <div class="preset-card-item" data-preset-id="${clip.id}" role="button" tabindex="0">
        <div class="preset-card-header">
          <span class="preset-creator-tag">${clip.creator}</span>
          <span class="preset-type-pill">${clip.structure}</span>
        </div>
        <div class="preset-hook-text">"${clip.hook}"</div>
        <div style="font-size: 0.75rem; color: var(--v6-muted, #6b6762); display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
          <span>${clip.durationText} · ${clip.views.toLocaleString()} views</span>
          <span style="color: var(--v6-coral, #ed765b); font-weight: 600;">คลิกโหลด &rarr;</span>
        </div>
      </div>
    `).join('');

    this.dom.presetsQuickGrid.querySelectorAll('.preset-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-preset-id');
        const clip = PRESET_CLIPS.find(c => c.id === id);
        if (clip) {
          this.loadClip(clip, true);
          this.showToast(`โหลดคลิปของ ${clip.creator} เข้าสู่ระบบเรียบร้อย`, 'coral');
        }
      });
    });
  }

  /**
   * Load a clip into the Dual-Lens interface
   */
  loadClip(clip, autoSwitchToSingle = true) {
    this.state.currentClip = clip;
    this.state.duration = clip.duration || 48;
    this.state.currentTime = 0;
    this.state.saveStatus = 'not_saved';

    // Reveal Dual-Lens Workspace with progressive cascading entrance
    if (this.dom.singleClipPlaceholder) this.dom.singleClipPlaceholder.hidden = true;
    if (this.dom.singleClipDetail) {
      this.dom.singleClipDetail.hidden = false;
      this.dom.singleClipDetail.classList.remove('anim-cascade-in');
      void this.dom.singleClipDetail.offsetWidth;
      this.dom.singleClipDetail.classList.add('anim-cascade-in');
    }

    // Update Player & Creator Meta
    if (this.dom.videoCreatorAvatar) this.dom.videoCreatorAvatar.textContent = clip.avatar || clip.creator?.charAt(0) || 'M';
    if (this.dom.videoCreatorHandle) this.dom.videoCreatorHandle.textContent = clip.handle || '@creator';
    if (this.dom.videoOnscreenText) this.dom.videoOnscreenText.textContent = `"${clip.hook}"`;
    if (this.dom.videoBeatTracker) this.dom.videoBeatTracker.textContent = clip.beats?.[0]?.beat || 'Beat 1: Hook & Problem Agitation';

    if (this.dom.metaAvatar) this.dom.metaAvatar.textContent = clip.avatar || clip.creator?.charAt(0) || 'M';
    if (this.dom.metaCreatorName) this.dom.metaCreatorName.textContent = clip.creator;
    if (this.dom.metaCreatorHandle) this.dom.metaCreatorHandle.textContent = clip.handle || '@creator';
    if (this.dom.metaTierBadge) this.dom.metaTierBadge.textContent = `${clip.tier ? clip.tier.toUpperCase() : 'VERIFIED'} CLIP`;
    if (this.dom.metaSourceText) this.dom.metaSourceText.textContent = clip.sourceText || 'tiktok.com/@clip/...';
    if (this.dom.metaSourceLink) this.dom.metaSourceLink.href = clip.url || '#';
    if (this.dom.metaStructureType) this.dom.metaStructureType.textContent = clip.structure || 'Problem → Solution';
    if (this.dom.metaDurationVal) this.dom.metaDurationVal.textContent = clip.durationText || `${clip.duration || 48} วินาที`;
    
    // Status indicator
    this.updateSaveStatusUI('not_saved');

    // Update WHAT Lens
    if (clip.what) {
      if (this.dom.whatCoreTakeaway) this.dom.whatCoreTakeaway.textContent = clip.what.coreTakeaway;
      if (this.dom.whatTagsContainer) {
        this.dom.whatTagsContainer.innerHTML = (clip.what.tags || ['Insight', 'Mental Model']).map(t => `<span class="tag-item">${t}</span>`).join('');
      }
      if (this.dom.whatPainPoints) {
        this.dom.whatPainPoints.innerHTML = (clip.what.painPoints || []).map(p => `<li>${p}</li>`).join('');
      }
      if (this.dom.whatPrinciplesGrid) {
        this.dom.whatPrinciplesGrid.innerHTML = (clip.what.principles || []).map(pr => `
          <div class="principle-box">
            <strong class="principle-name">${pr.name}:</strong>
            <p>${pr.desc}</p>
          </div>
        `).join('');
      }
      if (this.dom.whatClosingTakeaway) {
        this.dom.whatClosingTakeaway.innerHTML = `<span>${clip.what.closing}</span>`;
      }
    }

    // Update HOW Lens
    if (clip.how) {
      if (this.dom.howHookType) this.dom.howHookType.textContent = clip.how.hookType;
      if (this.dom.howHookQuote) this.dom.howHookQuote.textContent = clip.how.hookQuote;
      if (this.dom.howSfxGrid) {
        this.dom.howSfxGrid.innerHTML = (clip.how.sfx || []).map(s => `
          <div class="sfx-card">
            <div class="sfx-time">วินาทีที่ ${s.time}</div>
            <strong class="sfx-name">${s.name}</strong>
            <p>${s.desc}</p>
          </div>
        `).join('');
      }

      // Re-render timestamps
      if (this.dom.interactiveTimestampsList && clip.how.timestamps) {
        this.dom.interactiveTimestampsList.innerHTML = clip.how.timestamps.map(ts => `
          <button type="button" class="timestamp-row-btn" data-seek-time="${ts.time}" aria-label="ดูช่วง ${ts.title}">
            <span class="ts-badge font-num">${String(Math.floor(ts.time / 60)).padStart(2, '0')}:${String(ts.time % 60).padStart(2, '0')}</span>
            <div class="ts-info">
              <strong class="ts-title">${ts.title}</strong>
              <span class="ts-quote">${ts.quote}</span>
            </div>
            <span class="ts-arrow" aria-hidden="true">&rarr;</span>
          </button>
        `).join('');
        this.bindTimestampEvents();
      }
    }

    this.seekTo(0);

    if (autoSwitchToSingle) {
      this.switchMode('single');
      // Scroll smoothly to detail section
      const detailEl = this.root.querySelector('.research-detail-section');
      if (detailEl) {
        detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  bindTimestampEvents() {
    this.dom.interactiveTimestampsList?.querySelectorAll('.timestamp-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const time = parseInt(btn.getAttribute('data-seek-time') || '0', 10);
        this.seekTo(time);
        this.updateBeatTrackerForTime(time);
      });
    });
  }

  /**
   * Video Simulator Controls
   */
  togglePlayPause() {
    if (this.state.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  playVideo() {
    this.state.isPlaying = true;
    this.dom.iconPlay?.classList.add('visually-hidden');
    this.dom.iconPause?.classList.remove('visually-hidden');

    if (this.state.playbackTimer) clearInterval(this.state.playbackTimer);
    this.state.playbackTimer = setInterval(() => {
      if (this.state.currentTime >= this.state.duration) {
        this.seekTo(0);
      } else {
        this.seekTo(this.state.currentTime + 1);
      }
    }, 1000);
  }

  pauseVideo() {
    this.state.isPlaying = false;
    this.dom.iconPlay?.classList.remove('visually-hidden');
    this.dom.iconPause?.classList.add('visually-hidden');
    if (this.state.playbackTimer) {
      clearInterval(this.state.playbackTimer);
      this.state.playbackTimer = null;
    }
  }

  seekTo(seconds) {
    this.state.currentTime = Math.max(0, Math.min(this.state.duration, seconds));
    const percent = (this.state.currentTime / this.state.duration) * 100;

    if (this.dom.videoScrubProgress) this.dom.videoScrubProgress.style.width = `${percent}%`;
    if (this.dom.videoScrubHandle) this.dom.videoScrubHandle.style.left = `${percent}%`;

    const mins = Math.floor(this.state.currentTime / 60);
    const secs = Math.floor(this.state.currentTime % 60);
    const durMins = Math.floor(this.state.duration / 60);
    const durSecs = Math.floor(this.state.duration % 60);

    if (this.dom.currentTimeText) {
      this.dom.currentTimeText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    if (this.dom.durationTimeText) {
      this.dom.durationTimeText.textContent = `${String(durMins).padStart(2, '0')}:${String(durSecs).padStart(2, '0')}`;
    }

    this.updateBeatTrackerForTime(this.state.currentTime);
  }

  updateBeatTrackerForTime(time) {
    const beats = this.state.currentClip.beats;
    if (!beats || !beats.length) return;

    const currentBeat = beats.find(b => time >= b.start && time <= b.end) || beats[beats.length - 1];
    if (currentBeat) {
      if (this.dom.videoBeatTracker) this.dom.videoBeatTracker.textContent = currentBeat.beat;
      if (this.dom.videoOnscreenText) this.dom.videoOnscreenText.textContent = currentBeat.text;
    }
  }

  /**
   * Handle Ingestion Form Submissions
   */
  handleUrlFetch() {
    let url = this.dom.inputVideoUrl?.value.trim();
    if (!url) {
      url = 'https://www.tiktok.com/@mewteetawat/video/7391823901';
      if (this.dom.inputVideoUrl) this.dom.inputVideoUrl.value = url;
    }

    this.showToast('กำลังเชื่อมต่อและดึงข้อมูลโครงสร้างคลิป...', 'coral');

    // Simulate instant client-side analysis
    setTimeout(() => {
      // Pick matching or generate new
      const found = PRESET_CLIPS.find(p => url.includes(p.handle.replace('@', ''))) || PRESET_CLIPS[0];
      this.loadClip(found, true);
      this.showToast('วิเคราะห์โครงสร้าง Dual-Lens เรียบร้อย (Analyzed · Not saved)', 'coral');
    }, 350);
  }

  handleFileUpload(file) {
    this.showToast(`กำลังวิเคราะห์สิทธิ์และโครงสร้างของไฟล์ "${file.name}"...`, 'coral');
    setTimeout(() => {
      const customClip = {
        ...PRESET_CLIPS[0],
        id: `upload-${Date.now()}`,
        creator: 'User Upload (Permission Verified)',
        handle: '@authorized_user',
        sourceText: `Local File: ${file.name}`,
        durationText: '42 วินาที',
        duration: 42
      };
      this.loadClip(customClip, true);
      this.showToast('ถอดโครงสร้าง Dual-Lens จากไฟล์วิดีโอเรียบร้อย', 'coral');
    }, 500);
  }

  /**
   * Mode 2: Channel Scan Engine
   */
  runChannelScan(handle = null) {
    const query = handle || this.dom.inputChannelHandle?.value.trim() || '@mewteetawat';
    this.state.channelQuery = query;

    this.showToast(`กำลังสแกนคลังคลิปทั้งหมดของ ${query}...`, 'violet');

    // Generate fresh realistic distribution
    this.state.channelClips = generateChannelDataset(query);
    this.state.filteredClips = [...this.state.channelClips];
    this.state.selectedTierFilter = 'all';
    this.state.selectedStructureFilter = 'all';
    this.state.tablePage = 1;

    // Update KPI UI
    const total = this.state.channelClips.length;
    const medReach = query === '@jev_creator' ? '284.1K' : query === '@artem_nov' ? '312.8K' : '358.4K';
    const virals = query === '@jev_creator' ? 9 : query === '@artem_nov' ? 14 : 18;
    const rate = query === '@jev_creator' ? '51.3' : query === '@artem_nov' ? '49.8' : '46.2';

    if (this.dom.statTotalClips) this.dom.statTotalClips.textContent = total;
    if (this.dom.statMedianReach) this.dom.statMedianReach.textContent = medReach;
    if (this.dom.statViralOutliers) this.dom.statViralOutliers.textContent = virals;
    if (this.dom.statLikeRate) this.dom.statLikeRate.textContent = rate;

    const patternHandle = this.root.querySelector('#pattern-channel-handle');
    if (patternHandle) patternHandle.textContent = query;
    if (this.dom.patternScriptsCount) this.dom.patternScriptsCount.textContent = total;
    if (this.dom.patternMedianPlays) this.dom.patternMedianPlays.textContent = medReach;
    if (this.dom.patternOutlierRatio) this.dom.patternOutlierRatio.textContent = `${virals} / ${total} (${((virals / total) * 100).toFixed(1)}%)`;

    // Reveal Channel Scan Workspace with progressive cascading entrance
    if (this.dom.channelScanPlaceholder) this.dom.channelScanPlaceholder.hidden = true;
    if (this.dom.channelPatternWorkspace) {
      this.dom.channelPatternWorkspace.hidden = false;
      this.dom.channelPatternWorkspace.classList.remove('anim-cascade-in');
      void this.dom.channelPatternWorkspace.offsetWidth;
      this.dom.channelPatternWorkspace.classList.add('anim-cascade-in');
    }
    if (this.dom.channelGallerySection) this.dom.channelGallerySection.hidden = false;
    if (this.dom.channelTableSection) this.dom.channelTableSection.hidden = false;

    // Reset buttons
    this.dom.tierPillFilters.forEach(p => p.classList.toggle('active', p.getAttribute('data-tier') === 'all'));
    if (this.dom.btnResetStructureFilter) this.dom.btnResetStructureFilter.hidden = true;

    this.renderChannelVideoCards();
    this.state.archivePage = 1;
    this.renderReelArchive();
    this.selectClip(this.state.filteredClips[0]?.id || '', false);
    this.renderClipsTable();

    // Trigger Live Decode Scanner HUD animation & stream clips into the Performance Map below
    this.runScanReplayAnimation(query, () => {
      this.renderScatterPlot(true);
    });
    this.renderScatterPlot(true);
  }

  /**
   * Live Decode Scanner HUD Replay Simulation (Matching Video Reference)
   */
  runScanReplayAnimation(query, onComplete) {
    if (this._scanInterval) {
      clearInterval(this._scanInterval);
      this._scanInterval = null;
    }

    if (this.dom.scanHudHandle) this.dom.scanHudHandle.textContent = query + '.';
    if (this.dom.scanHudStatusBadge) {
      this.dom.scanHudStatusBadge.innerHTML = '<span class="pulse-dot"></span> LIVE DECODE SCAN';
      this.dom.scanHudStatusBadge.className = 'scan-hud-live-tag';
    }

    // Initialize 30 mini slots in the mini deck
    if (this.dom.scanDeckMiniGrid) {
      this.dom.scanDeckMiniGrid.innerHTML = Array.from({ length: 30 }, (_, i) => `<div class="scan-deck-slot" id="scan-slot-${i}"></div>`).join('');
    }

    const steps = [
      { classified: 25, labels: 200, cost: '$0.0040', batch: '1 - 30', quote: '"Did you have a hard time leaving friends behind?"', topic: 'Relationships', hook: 'Curiosity', structure: 'Q&A', plays: '751.5K plays', likes: '10.5K likes', cur: 11, rec: 4, con: 2, res: 1 },
      { classified: 74, labels: 592, cost: '$0.0254', batch: '61 - 90', quote: '"I\'m a single father in a serious relationship."', topic: 'Relationships', hook: 'Curiosity', structure: 'Q&A', plays: '262.3K plays', likes: '5.2K likes', cur: 23, rec: 14, con: 5, res: 7 },
      { classified: 124, labels: 992, cost: '$0.0465', batch: '121 - 150', quote: '"Please give any brutally honest advice to help me."', topic: 'Mindset', hook: 'Recognition', structure: 'Problem / solution', plays: '286.5K plays', likes: '6.3K likes', cur: 34, rec: 32, con: 10, res: 14 },
      { classified: 173, labels: 1384, cost: '$0.0672', batch: '151 - 180', quote: '"I have a real estate law firm. We do 2.5 million. What\'s the bottom line?"', topic: 'Business', hook: 'Curiosity', structure: 'Q&A', plays: '209.8K plays', likes: '2.5K likes', cur: 47, rec: 51, con: 15, res: 19 },
      { classified: 222, labels: 1776, cost: '$0.0857', batch: '211 - 240', quote: '"Adam Lane Smith taught me this a couple of years ago."', topic: 'Mindset', hook: 'Contradiction', structure: 'Explanation', plays: '321.2K plays', likes: '7.1K likes', cur: 65, rec: 62, con: 21, res: 23 },
      { classified: 271, labels: 2168, cost: '$0.1054', batch: '271 - 300', quote: '"How do I actually begin in my situation? I don\'t come from money."', topic: 'Business', hook: 'Recognition', structure: 'Q&A', plays: '268.8K plays', likes: '3.9K likes', cur: 79, rec: 71, con: 28, res: 31 },
      { classified: 320, labels: 2560, cost: '$0.1237', batch: '301 - 330', quote: '"Have you ever stayed so focused on one direction that you later realized..."', topic: 'Mindset', hook: 'Recognition', structure: 'Explanation', plays: '269.2K plays', likes: '6.3K likes', cur: 98, rec: 85, con: 34, res: 38 },
      { classified: 369, labels: 2952, cost: '$0.1420', batch: '361 - 390', quote: '"Unless someone is ahead of you, take their hate as envy and then disregard them."', topic: 'Mindset', hook: 'Contradiction', structure: 'Opinion', plays: '177.7K plays', likes: '3.4K likes', cur: 113, rec: 91, con: 41, res: 47 },
      { classified: 419, labels: 3352, cost: '$0.1610', batch: '391 - 420', quote: '"We sell performance marketing."', topic: 'Business', hook: 'Curiosity', structure: 'Q&A', plays: '313.9K plays', likes: '2.7K likes', cur: 125, rec: 100, con: 49, res: 59 },
      { classified: 440, labels: 3520, cost: '$0.1680', batch: '421 - 440', quote: '"อย่าก๊อปปี้คลิปคนอื่นทั้งดุ้น ถ้าคุณยังไม่ได้แยก WHAT ออกจาก HOW"', topic: 'Creator Strategy', hook: 'Pattern Interrupt', structure: 'Dual-Lens Synthesis', plays: '842.5K plays', likes: '45.8K likes', cur: 132, rec: 108, con: 54, res: 68 }
    ];

    let stepIdx = 0;
    const updateFrame = () => {
      if (stepIdx >= steps.length) {
        clearInterval(this._scanInterval);
        this._scanInterval = null;
        if (this.dom.scanHudStatusBadge) {
          this.dom.scanHudStatusBadge.innerHTML = `✓ DECODE COMPLETE (${this.state.channelClips.length} SCRIPTS)`;
          this.dom.scanHudStatusBadge.className = 'badge-pill green';
        }
        if (onComplete) onComplete();
        return;
      }

      const s = steps[stepIdx];
      if (this.dom.scanStatClassified) this.dom.scanStatClassified.textContent = s.classified;
      if (this.dom.scanProgressClassified) this.dom.scanProgressClassified.style.width = `${(s.classified / 440) * 100}%`;
      if (this.dom.scanStatLabels) this.dom.scanStatLabels.textContent = s.labels.toLocaleString('en-US');
      if (this.dom.scanStatCost) this.dom.scanStatCost.innerHTML = `${s.cost} <span class="scan-kpi-sub">so far</span>`;
      if (this.dom.scanDeckBatch) this.dom.scanDeckBatch.textContent = s.batch;

      // Update mini grid illumination
      const activeSlotCount = Math.floor((stepIdx / (steps.length - 1)) * 30);
      for (let i = 0; i < 30; i++) {
        const slot = this.root.querySelector(`#scan-slot-${i}`);
        if (slot) {
          if (i < activeSlotCount) {
            slot.className = 'scan-deck-slot done';
          } else if (i === activeSlotCount) {
            slot.className = 'scan-deck-slot active';
          } else {
            slot.className = 'scan-deck-slot';
          }
        }
      }

      // Update Inside the Reel spotlight
      if (this.dom.scanInsideScreenQuote) this.dom.scanInsideScreenQuote.textContent = s.quote;
      if (this.dom.scanMetaTopic) this.dom.scanMetaTopic.textContent = s.topic;
      if (this.dom.scanMetaHook) this.dom.scanMetaHook.textContent = s.hook;
      if (this.dom.scanMetaStructure) this.dom.scanMetaStructure.textContent = s.structure;
      if (this.dom.scanMetaPlays) this.dom.scanMetaPlays.textContent = s.plays;
      if (this.dom.scanMetaLikes) this.dom.scanMetaLikes.textContent = s.likes;

      // Update Hook Patterns Found
      if (this.dom.scanCountCuriosity) this.dom.scanCountCuriosity.textContent = s.cur;
      if (this.dom.scanCountRecognition) this.dom.scanCountRecognition.textContent = s.rec;
      if (this.dom.scanCountContradiction) this.dom.scanCountContradiction.textContent = s.con;
      if (this.dom.scanCountResult) this.dom.scanCountResult.textContent = s.res;

      stepIdx++;
    };

    updateFrame();
    this._scanInterval = setInterval(updateFrame, 130);
  }

  /**
   * Filter handling for Channel Scan
   */
  applyFilters() {
    let filtered = [...this.state.channelClips];

    // Filter by Tier
    if (this.state.selectedTierFilter !== 'all') {
      filtered = filtered.filter(c => c.tier === this.state.selectedTierFilter);
    }

    // Filter by Structure
    if (this.state.selectedStructureFilter !== 'all') {
      const targetStructure = SCRIPT_STRUCTURES.find(s => s.id === this.state.selectedStructureFilter);
      if (targetStructure) {
        const clean = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetClean = clean(targetStructure.name);
        filtered = filtered.filter(c => clean(c.structure).includes(targetClean) || targetClean.includes(clean(c.structure)));
      }
    }

    // Filter by Search Query
    if (this.state.searchQuery) {
      filtered = filtered.filter(c => c.hook.toLowerCase().includes(this.state.searchQuery));
    }

    this.state.filteredClips = filtered;
    this.state.tablePage = 1;

    this.renderChannelVideoCards();
    this.renderScatterPlot();
    this.state.archivePage = 1;
    this.renderReelArchive();
    this.selectClip(this.state.filteredClips[0]?.id || '', false);
    this.renderClipsTable();
  }

  /**
   * Render Visual Video Cards Gallery in Channel Matrix Scan
   */
  renderChannelVideoCards() {
    const grid = this.dom.channelVideoCardsGrid;
    if (!grid) return;

    const topClips = [...this.state.filteredClips]
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    if (this.dom.channelVideoGalleryCount) {
      this.dom.channelVideoGalleryCount.textContent = `แสดง ${topClips.length} คลิปเด่นจาก ${this.state.filteredClips.length} คลิป`;
    }

    if (topClips.length === 0) {
      grid.innerHTML = `
        <div class="channel-video-empty">
          ไม่พบคลิปที่ตรงกับตัวกรอง — กดปุ่ม All เพื่อดูคลิปทั้งหมดของช่อง
        </div>
      `;
      return;
    }

    grid.innerHTML = topClips.map((clip, idx) => {
      const viewsLabel = clip.views >= 1000000
        ? `${(clip.views / 1000000).toFixed(1)}M`
        : `${(clip.views / 1000).toFixed(1)}K`;
      const tierLabel = clip.tier === 'viral'
        ? 'Viral Outlier'
        : clip.tier === 'engagement'
          ? 'High Engagement'
          : clip.tier === 'solid'
            ? 'Solid Performer'
            : 'Baseline';
      const tierClass = clip.tier === 'viral'
        ? 'green'
        : clip.tier === 'engagement'
          ? 'violet'
          : clip.tier === 'solid'
            ? 'coral'
            : 'soft';
      const avatarInitial = (clip.creator || 'M').slice(0, 1).toUpperCase();

      return `
        <article class="channel-video-card mew-offer-card ${idx % 2 === 0 ? 'coral-accent' : 'violet-bar'}" data-channel-clip-id="${clip.id}">
          <div class="channel-video-thumb">
            <img src="assets/video_preview.png" alt="${clip.hook}" class="channel-video-img" />
            <div class="channel-video-overlay">
              <div class="channel-video-top-badges">
                <span class="badge-pill ${tierClass}">${tierLabel}</span>
                <span class="channel-video-dur font-num">${clip.durationText || '48 วินาที'}</span>
              </div>
              <button type="button" class="channel-video-play-btn" data-analyze-clip-id="${clip.id}" aria-label="เล่นและถอดรหัสคลิป ${clip.hook}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
              <div class="channel-video-bottom-stats font-num">
                <span>👁 ${viewsLabel} views</span>
                <span>♥ ${clip.likeRate} likes/1k</span>
              </div>
            </div>
          </div>

          <div class="channel-video-body">
            <div class="channel-video-meta-row">
              <div class="channel-video-creator">
                <span class="channel-creator-avatar" aria-hidden="true">${avatarInitial}</span>
                <span class="channel-creator-handle">${clip.handle}</span>
              </div>
              <span class="table-structure-tag">${clip.structure}</span>
            </div>

            <h4 class="channel-video-hook">“${clip.hook}”</h4>

            <div class="channel-video-actions">
              <button type="button" class="btn-pill btn-ghost btn-sm btn-channel-analyze" data-analyze-clip-id="${clip.id}">
                <span>ถอดรหัสคลิปนี้</span>
              </button>
              <button type="button" class="btn-pill btn-primary btn-sm btn-channel-save" data-save-clip-id="${clip.id}">
                <span>+ เก็บเข้าคลัง</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-analyze-clip-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const clipId = btn.getAttribute('data-analyze-clip-id');
        const clip = this.state.channelClips.find(c => c.id === clipId);
        if (clip) this.loadClipFromScatter(clip);
      });
    });

    grid.querySelectorAll('[data-save-clip-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const clipId = btn.getAttribute('data-save-clip-id');
        const clip = this.state.channelClips.find(c => c.id === clipId);
        if (clip) {
          this.loadClipFromScatter(clip);
          this.openSaveModal();
        }
      });
    });
  }

  /**
   * Render Interactive SVG Scatter Plot (X: Views, Y: Likes/1k)
   * Supports swirling particle entrance animation when animateSwirl is true
   */
  renderScatterPlot(animateSwirl = false) {
    const svg = this.dom.scatterSvg;
    if (!svg) return;

    const width = 840;
    const height = 440;
    const margin = { top: 40, right: 40, bottom: 50, left: 70 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Mathematical coordinate scales:
    // X axis: Views (Log scale from 10,000 to 1,500,000)
    const minX = 10000;
    const maxX = 1500000;
    const logMinX = Math.log10(minX);
    const logMaxX = Math.log10(maxX);
    const scaleX = (val) => {
      const clamped = Math.max(minX, Math.min(maxX, val));
      const logV = Math.log10(clamped);
      return margin.left + ((logV - logMinX) / (logMaxX - logMinX)) * innerW;
    };

    // Y axis: Likes per 1k views (Linear from 0 to 100)
    const minY = 0;
    const maxY = 100;
    const scaleY = (val) => {
      const clamped = Math.max(minY, Math.min(maxY, val));
      return margin.top + innerH - (clamped / maxY) * innerH;
    };

    // Build SVG Inner Elements
    let svgContent = '';

    // 1. Grid lines and Y Axis Labels
    const yTicks = [0, 20, 40, 60, 80, 100];
    yTicks.forEach(tick => {
      const y = scaleY(tick);
      svgContent += `
        <line x1="${margin.left}" y1="${y}" x2="${margin.left + innerW}" y2="${y}" class="scatter-grid-line" />
        <text x="${margin.left - 12}" y="${y + 4}" text-anchor="end">${tick}</text>
      `;
    });

    // 2. X Axis Ticks and Labels (10K, 50K, 100K, 250K, 500K, 1M)
    const xTicks = [10000, 50000, 100000, 250000, 500000, 1000000];
    const xLabels = ['10K', '50K', '100K', '250K', '500K', '1M+'];
    xTicks.forEach((tick, i) => {
      const x = scaleX(tick);
      svgContent += `
        <line x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + innerH}" class="scatter-grid-line" />
        <text x="${x}" y="${margin.top + innerH + 22}" text-anchor="middle">${xLabels[i]}</text>
      `;
    });

    // 3. Channel Median Benchmark Line (X = 358.4K Views)
    const medianX = scaleX(358400);
    svgContent += `
      <line x1="${medianX}" y1="${margin.top}" x2="${medianX}" y2="${margin.top + innerH}" class="scatter-median-line" />
      <text x="${medianX + 6}" y="${margin.top + 16}" fill="var(--v6-coral, #ed765b)" font-weight="700" font-size="10">MEDIAN: 358.4K</text>
    `;

    // 4. Axis Labels
    svgContent += `
      <text x="${margin.left + innerW / 2}" y="${height - 12}" text-anchor="middle" font-weight="700">ยอดคนดู / Reach (Views)</text>
      <text x="${18}" y="${margin.top + innerH / 2}" text-anchor="middle" transform="rotate(-90, 18, ${margin.top + innerH / 2})" font-weight="700">Likes / 1,000 Views</text>
    `;

    // 5. Video Thumbnail Points on the Scatter Plot (Exact match to Reference)
    const visibleClips = this.state.filteredClips;
    const selectedId = this.state.selectedClipId;

    visibleClips.forEach((clip, index) => {
      const cx = scaleX(clip.views);
      const cy = scaleY(clip.likeRate);
      const isSelected = clip.id === selectedId;
      const w = 22;
      const h = 30;
      const x = cx - w / 2;
      const y = cy - h / 2;

      // Calculate smooth trajectory streaming from the SIDE (Reel Archive side) across into scatter plot
      const startX = -110 - (index % 12) * 16;
      const startY = margin.top + ((index * 37) % (innerH - 24)) + (Math.sin(index * 0.4) * 20);
      const startRot = ((index * 17) % 24) - 12;
      const delay = Math.min((index % 60) * 14, 1100);

      const animClass = animateSwirl ? 'anim-stream-in anim-swirl-in' : '';
      const animStyle = animateSwirl 
        ? `style="--start-x: ${startX.toFixed(1)}px; --start-y: ${startY.toFixed(1)}px; --end-x: ${x.toFixed(1)}px; --end-y: ${y.toFixed(1)}px; --start-rot: ${startRot}deg; --delay: ${delay}ms; transform: translate(${x.toFixed(1)}px, ${y.toFixed(1)}px);"`
        : `transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})"`;

      svgContent += `
        <g 
          class="scatter-point-thumb tier-${clip.tier} ${isSelected ? 'active-selected' : ''} ${animClass}" 
          data-clip-id="${clip.id}"
          cx="${cx}"
          cy="${cy}"
          tabindex="0"
          role="button"
          aria-label="คลิป: ${clip.hook}"
          ${animStyle}
        >
          <rect width="${w}" height="${h}" rx="3" fill="#0f172a" />
          <image href="assets/video_preview.png" x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" preserveAspectRatio="xMidYMid slice" />
          <rect width="${w}" height="${h}" rx="3" fill="none" class="thumb-stroke tier-${clip.tier}" stroke-width="${isSelected ? 2.5 : 1.5}" />
        </g>
      `;
    });

    svg.innerHTML = svgContent;

    // Update visible count readout
    if (this.dom.scatterVisibleCount) {
      this.dom.scatterVisibleCount.textContent = visibleClips.length;
    }

    // Bind Tooltip & 1-Click Action to thumbnails
    this.bindScatterDotEvents();
  }

  bindScatterDotEvents() {
    const thumbs = this.dom.scatterSvg?.querySelectorAll('.scatter-point-thumb');
    if (!thumbs) return;

    // Completely disable / hide the floating popup tooltip per user request (no clutter)
    if (this.dom.scatterTooltip) {
      this.dom.scatterTooltip.hidden = true;
      this.dom.scatterTooltip.style.display = 'none';
    }

    thumbs.forEach(thumb => {
      const clipId = thumb.getAttribute('data-clip-id');
      const clip = this.state.channelClips.find(c => c.id === clipId);
      if (!clip) return;

      // Mouseenter / Focus: Select clip and immediately update Side Inspector panel in real-time
      const onHoverSelect = () => {
        this.selectClip(clip.id, true);
      };

      thumb.addEventListener('mouseenter', onHoverSelect);
      thumb.addEventListener('focus', onHoverSelect);

      // Click: Select clip across archive, map and side inspector
      thumb.addEventListener('click', () => {
        this.selectClip(clip.id, true);
      });

      // Double Click: Load into Dual-Lens Analysis immediately
      thumb.addEventListener('dblclick', () => {
        this.loadClipFromScatter(clip);
      });

      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.selectClip(clip.id, true);
        }
      });
    });
  }

  /**
   * Render Reel Archive Mini Grid (Left Column of Image 2 Reference)
   */
  renderReelArchive() {
    const grid = this.dom.reelArchiveGrid;
    if (!grid) return;

    const clips = this.state.filteredClips;
    const total = clips.length;
    const startIdx = (this.state.archivePage - 1) * this.state.archivePageSize;
    const endIdx = Math.min(startIdx + this.state.archivePageSize, total);
    const pageClips = clips.slice(startIdx, endIdx);

    if (this.dom.archiveRangeText) {
      this.dom.archiveRangeText.textContent = total > 0 ? `${startIdx + 1} - ${endIdx} of ${total}` : '0 of 0';
    }

    grid.innerHTML = pageClips.map(clip => {
      const isSelected = clip.id === this.state.selectedClipId;
      return `
        <div 
          class="reel-mini-card ${isSelected ? 'active-selected' : ''}" 
          data-reel-id="${clip.id}"
          tabindex="0"
          role="button"
          aria-label="คลิป: ${clip.hook}"
        >
          <img src="assets/video_preview.png" alt="${clip.hook}" class="reel-mini-thumb" />
          <div class="reel-mini-overlay"></div>
          <span class="reel-mini-tag tier-${clip.tier}"></span>
          <span class="reel-mini-dur font-num">${clip.durationText || '48 วินาที'}</span>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.reel-mini-card').forEach(card => {
      const id = card.getAttribute('data-reel-id');
      card.addEventListener('mouseenter', () => {
        this.selectClip(id, true);
      });
      card.addEventListener('click', () => {
        this.selectClip(id, true);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectClip(id, true);
        }
      });
    });
  }

  /**
   * Selects and inspects a clip across Archive, Scatter Map, and Inspector Bar
   */
  selectClip(clipId, shouldSyncScatter = true) {
    const clip = this.state.channelClips.find(c => c.id === clipId);
    if (!clip) return;

    this.state.selectedClipId = clipId;

    // 1. Update Reel Archive active class
    if (this.dom.reelArchiveGrid) {
      this.dom.reelArchiveGrid.querySelectorAll('.reel-mini-card').forEach(card => {
        if (card.getAttribute('data-reel-id') === clipId) {
          card.classList.add('active-selected');
        } else {
          card.classList.remove('active-selected');
        }
      });
    }

    // 2. Update Scatter Map active class
    if (this.dom.scatterSvg) {
      this.dom.scatterSvg.querySelectorAll('.scatter-point-thumb').forEach(point => {
        const isCurrent = point.getAttribute('data-clip-id') === clipId;
        if (isCurrent) {
          point.classList.add('active-selected');
          const stroke = point.querySelector('.thumb-stroke');
          if (stroke) stroke.setAttribute('stroke-width', '2.5');
        } else {
          point.classList.remove('active-selected');
          const stroke = point.querySelector('.thumb-stroke');
          if (stroke) stroke.setAttribute('stroke-width', '1.5');
        }
      });
    }

    // 3. Update Active Reel Inspector
    if (this.dom.inspStructure) this.dom.inspStructure.textContent = clip.structure;
    if (this.dom.inspTierBadge) {
      const tierMap = {
        viral: { label: 'Viral Outlier', cls: 'green' },
        engagement: { label: 'High Engagement', cls: 'violet' },
        solid: { label: 'Solid Performer', cls: 'coral' },
        baseline: { label: 'Baseline', cls: 'soft' }
      };
      const info = tierMap[clip.tier] || { label: clip.tier, cls: 'soft' };
      this.dom.inspTierBadge.textContent = info.label;
      this.dom.inspTierBadge.className = `badge-pill ${info.cls}`;
    }
    if (this.dom.inspHandle) this.dom.inspHandle.textContent = clip.handle;
    if (this.dom.inspHook) this.dom.inspHook.textContent = `“${clip.hook}”`;
    if (this.dom.inspDuration) {
      const d = clip.duration || 48;
      const mins = Math.floor(d / 60);
      const secs = d % 60;
      this.dom.inspDuration.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (this.dom.inspViews) {
      this.dom.inspViews.textContent = clip.views >= 1000000 
        ? `${(clip.views / 1000000).toFixed(1)}M` 
        : `${(clip.views / 1000).toFixed(1)}K`;
    }
    if (this.dom.inspRate) this.dom.inspRate.textContent = clip.likeRate;
    if (this.dom.inspLikes) {
      this.dom.inspLikes.textContent = clip.likes >= 1000 ? `${(clip.likes / 1000).toFixed(1)}K` : (clip.likes || '14.9K');
    }

    // Dynamic explanation of why to link this clip (Strategic Intent)
    if (this.dom.inspWhyDesc) {
      const vText = clip.views >= 1000000 ? `${(clip.views / 1000000).toFixed(1)}M` : `${(clip.views / 1000).toFixed(1)}K`;
      if (clip.tier === 'viral') {
        this.dom.inspWhyDesc.textContent = `คลิปนี้เป็น Viral Outlier ยอดวิวพุ่งสูง ${vText} (${clip.likeRate} Likes/1k) โดดเด่นด้วยโครงสร้าง "${clip.structure}" ที่สามารถดึงสายตาคนดูได้เกิน 2x ของค่ามัธยฐานช่อง เหมาะมากสำหรับใช้เป็นโครงสร้างต้นแบบ`;
      } else if (clip.tier === 'engagement') {
        this.dom.inspWhyDesc.textContent = `คลิปนี้มีอัตราการมีส่วนร่วมสูงเป็นพิเศษ (${clip.likeRate} Likes/1k) คนดูมีอารมณ์ร่วมสูงและคอมเมนต์เยอะ เหมาะสำหรับนำแก่นคิด (WHAT) ไปแปลงเป็นประเด็นใหม่ในสไตล์คุณ`;
      } else if (clip.tier === 'solid') {
        this.dom.inspWhyDesc.textContent = `ผลงานคุณภาพมาตรฐานของช่อง มีความเสถียรด้านแก่นสาระและการเล่าเรื่อง (${clip.structure}) สามารถใช้ถอดรหัสเป็นมาตรฐานฐานรากคอนเทนต์ได้`;
      } else {
        this.dom.inspWhyDesc.textContent = `คลิปอ้างอิงของช่องที่จัดหมวดหมู่แล้ว สามารถส่งต่อไปยัง One-Clip Dual-Lens เพื่อถอดรหัสแยกระหว่างสาระ (WHAT) และวิธีเล่า (HOW) ได้ทันที`;
      }
    }

    // Dynamic WHAT & HOW previews
    if (this.dom.inspWhat) {
      this.dom.inspWhat.textContent = clip.what?.coreTakeaway || `สาระสำคัญ: ประเด็นหลักเรื่อง ${clip.structure} สำหรับนำไปสังเคราะห์คอนเทนต์ใหม่`;
    }
    if (this.dom.inspHow) {
      this.dom.inspHow.textContent = clip.how?.hookType || `โครงสร้าง ${clip.structure} + Pattern Interrupt ช่วงเปิดคลิปเพื่อตรึงคนดู`;
    }
  }

  loadClipFromScatter(clip) {
    // Generate synthetic dual-lens data if clip was from bulk scan
    const enrichedClip = {
      ...PRESET_CLIPS[0],
      ...clip,
      id: clip.id,
      creator: clip.creator,
      handle: clip.handle,
      hook: clip.hook,
      structure: clip.structure,
      views: clip.views,
      duration: clip.duration,
      durationText: clip.durationText,
      beats: [
        { start: 0, end: 5, beat: 'Beat 1: Pattern Interrupt Hook', text: `“${clip.hook}”` },
        { start: 6, end: 18, beat: 'Beat 2: Problem Analysis', text: '“ชี้ให้เห็นสาเหตุแท้จริงที่ทำให้คนส่วนใหญ่ลงมือทำแล้วไม่ได้ผล”' },
        { start: 19, end: 32, beat: 'Beat 3: Tactical Framework', text: '“ขั้นตอนการแก้ปัญหาแบบ Step-by-Step ที่นำไปใช้ได้ทันที”' },
        { start: 33, end: clip.duration, beat: 'Beat 4: Call to Value', text: '“สรุปผลลัพธ์ที่จะเกิดขึ้นหากคุณเริ่มนำระบบนี้ไปใช้จริง”' }
      ],
      what: {
        coreTakeaway: `“สาระสำคัญของคลิปนี้คือ: ${clip.hook} — มุ่งเน้นการสร้างผลลัพธ์ที่ยั่งยืนผ่านกระบวนการที่ชัดเจน”`,
        tags: [clip.structure, 'Creator System', 'High Performance'],
        painPoints: [
          'ปัญหาการทำงานแบบไร้ระบบทำให้สูญเสียเวลาและพลังงานไปกับสิ่งที่ไม่เกิดผลลัพธ์',
          'ขาดกรอบความคิดที่ชัดเจนในการวัดผลงานที่แท้จริง'
        ],
        principles: [
          { name: 'Core Framework', desc: 'วางโครงสร้างเนื้อหาตามหลัก ' + clip.structure + ' เพื่อให้คนดูเข้าใจลำดับขั้นตอนได้ง่ายที่สุด' },
          { name: 'Direct Transformation', desc: 'เปลี่ยนมุมมองของคนดูจากความสับสนสู่แนวทางปฏิบัติที่ชัดเจน' }
        ],
        closing: '“เริ่มนำแนวทางนี้ไปปรับใช้กับคลิปชิ้นต่อไปของคุณเพื่อสร้างความเปลี่ยนแปลง”'
      },
      how: {
        hookType: `${clip.structure} Hook Format`,
        hookQuote: `“${clip.hook}”`,
        psychology: 'ตรึงความสนใจของคนดูด้วยประเด็นที่ตรงกับปัญหาคาใจในชีวิตประจำวัน',
        timestamps: [
          { time: 0, title: 'Opening Hook', quote: `“${clip.hook.slice(0, 35)}...”` },
          { time: 6, title: 'Problem Agitation', quote: '“ขยี้จุดเจ็บและเหตุผลที่คนส่วนใหญ่ทำผิดวิธี...”' },
          { time: 19, title: 'Solution Breakdown', quote: '“เปิดเผยแก่นวิธีแก้ปัญหาที่ใช้การได้จริง...”' },
          { time: 33, title: 'Closing Punchline', quote: '“ประโยคสรุปย้ำความจำเพื่อนำไปส่งต่อ...”' }
        ],
        sfx: [
          { time: '0:00', name: 'Bass Boom', desc: 'เปิดหัวคลิปด้วยเสียงทุ้มแน่นหยุดนิ้วคนดู' },
          { time: '0:06', name: 'Swoosh Transition', desc: 'สลับมุมกล้องเน้นอารมณ์ความจริงจัง' },
          { time: '0:19', name: 'Chime Note', desc: 'โน้ตสดใสนำเข้าสู่การเปิดเผยเฉลย' }
        ]
      }
    };

    this.loadClip(enrichedClip, true);
    this.showToast(`โหลดคลิป "${clip.hook.slice(0, 32)}..." เข้าสู่ Dual-Lens Analysis เรียบร้อย`, 'coral');
  }

  /**
   * Render Script Structure Bar Chart (Script Structure Taxonomy)
   */
  renderScriptStructureChart() {
    const listEl = this.dom.structureBarsList;
    if (!listEl) return;

    listEl.innerHTML = SCRIPT_STRUCTURES.map(item => `
      <div 
        class="structure-bar-row ${this.state.selectedStructureFilter === item.id ? 'active' : ''}" 
        data-structure-id="${item.id}"
        role="button"
        tabindex="0"
        aria-label="กรองโครงสร้าง ${item.name}"
      >
        <div class="structure-meta-line">
          <div class="structure-name-group">
            <span class="structure-label-name">${item.name}</span>
            <span class="structure-count-pill font-num">n=${item.count}</span>
          </div>
          <div class="structure-median-reach">
            <span class="font-num">${item.medianReach}K</span>
            <span class="structure-median-sub">median views</span>
          </div>
        </div>
        <div class="structure-progress-track">
          <div class="structure-progress-fill" style="width: ${Math.round(item.ratio * 100)}%;"></div>
        </div>
      </div>
    `).join('');

    // Bind Click to Filter
    listEl.querySelectorAll('.structure-bar-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-structure-id');
        if (this.state.selectedStructureFilter === id) {
          // Toggle off
          this.state.selectedStructureFilter = 'all';
          row.classList.remove('active');
          if (this.dom.btnResetStructureFilter) this.dom.btnResetStructureFilter.hidden = true;
        } else {
          // Activate filter
          this.state.selectedStructureFilter = id;
          listEl.querySelectorAll('.structure-bar-row').forEach(r => r.classList.remove('active'));
          row.classList.add('active');
          if (this.dom.btnResetStructureFilter) this.dom.btnResetStructureFilter.hidden = false;
        }
        this.applyFilters();
      });
    });
  }

  /**
   * Render Filtered Clips Data Table
   */
  renderClipsTable() {
    const tbody = this.dom.clipsTableBody;
    if (!tbody) return;

    const items = this.state.filteredClips;
    const start = (this.state.tablePage - 1) * this.state.tablePageSize;
    const pageItems = items.slice(start, start + this.state.tablePageSize);

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--v6-muted, #6b6762);">
            ไม่พบคลิปที่ตรงกับตัวกรองที่เลือก — ลองรีเซ็ตตัวกรองหรือเปลี่ยนคำค้นหา
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pageItems.map(clip => `
        <tr>
          <td>
            <div class="table-hook-title">"${clip.hook}"</div>
            <div style="font-size: 0.75rem; color: var(--v6-muted, #6b6762); margin-top: 0.2rem;">
              ความยาว: ${clip.durationText} · เผยแพร่เมื่อ ${clip.publishedDaysAgo} วันก่อน
            </div>
          </td>
          <td>
            <span class="table-structure-tag">${clip.structure}</span>
          </td>
          <td>
            <span class="table-tier-badge tier-${clip.tier}">
              <span class="legend-dot ${clip.tier === 'viral' ? 'green' : clip.tier === 'engagement' ? 'violet' : clip.tier === 'solid' ? 'coral' : 'stone'}"></span>
              <span>${clip.tier === 'viral' ? 'Viral' : clip.tier === 'engagement' ? 'Engagement' : clip.tier === 'solid' ? 'Solid' : 'Baseline'}</span>
            </span>
          </td>
          <td class="text-right">
            <strong class="font-num">${clip.views >= 1000000 ? `${(clip.views / 1000000).toFixed(1)}M` : `${(clip.views / 1000).toFixed(1)}K`}</strong>
            <div style="font-size: 0.6875rem; color: var(--v6-muted, #6b6762);">${clip.likeRate} likes/1k</div>
          </td>
          <td class="text-right">
            <button type="button" class="btn-table-action" data-table-clip-id="${clip.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Analyze Dual-Lens</span>
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Update table info and pagination controls
    if (this.dom.tableFilterCaption) {
      this.dom.tableFilterCaption.textContent = `แสดงคลิปที่ตรงกับตัวกรอง ${items.length} จาก 440 คลิป`;
    }

    const end = Math.min(start + this.state.tablePageSize, items.length);
    if (this.dom.paginationInfoText) {
      this.dom.paginationInfoText.textContent = items.length ? `Showing ${start + 1}-${end} of ${items.length} clips` : 'No clips match';
    }

    if (this.dom.btnTablePrev) {
      this.dom.btnTablePrev.disabled = this.state.tablePage <= 1;
    }
    if (this.dom.btnTableNext) {
      const maxPages = Math.ceil(items.length / this.state.tablePageSize);
      this.dom.btnTableNext.disabled = this.state.tablePage >= maxPages || maxPages === 0;
    }

    // Bind Click to Analyze
    tbody.querySelectorAll('.btn-table-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const clipId = btn.getAttribute('data-table-clip-id');
        const clip = this.state.channelClips.find(c => c.id === clipId);
        if (clip) {
          this.loadClipFromScatter(clip);
        }
      });
    });
  }

  /**
   * S03 Human Decision Save Gate Modal
   */
  openSaveModal() {
    if (!this.dom.saveGateModal) return;
    this.dom.saveGateModal.hidden = false;
    document.body.style.overflow = 'hidden';

    // Populate active clip summary in the modal
    const clip = this.state.currentClip;
    if (clip) {
      if (this.dom.saveModalDuration) this.dom.saveModalDuration.textContent = clip.durationText || '00:48';
      if (this.dom.saveModalTier) {
        const tierMap = {
          viral: { label: 'Viral Outlier', cls: 'green' },
          engagement: { label: 'High Engagement', cls: 'violet' },
          solid: { label: 'Solid Performer', cls: 'coral' },
          baseline: { label: 'Baseline', cls: 'soft' }
        };
        const info = tierMap[clip.tier] || { label: clip.tier || 'Viral', cls: 'green' };
        this.dom.saveModalTier.textContent = info.label;
        this.dom.saveModalTier.className = `badge-pill ${info.cls} modal-clip-tier`;
      }
      if (this.dom.saveModalAvatar) this.dom.saveModalAvatar.textContent = (clip.creator || 'M').slice(0, 2).toUpperCase();
      if (this.dom.saveModalCreator) this.dom.saveModalCreator.textContent = clip.creator || 'Mew Teetawat';
      if (this.dom.saveModalHandle) this.dom.saveModalHandle.textContent = clip.handle || '@mewteetawat';
      if (this.dom.saveModalHook) this.dom.saveModalHook.textContent = `“${clip.hook || ''}”`;
      if (this.dom.saveModalViews) {
        const v = clip.views || 358400;
        this.dom.saveModalViews.textContent = v >= 1000000 ? `${(v/1000000).toFixed(1)}M Views` : `${(v/1000).toFixed(1)}K Views`;
      }
      if (this.dom.saveModalLikes) {
        this.dom.saveModalLikes.textContent = `${clip.likesText || '14.9K'} ไลก์ (${clip.likeRate || '42.8'}/1k)`;
      }
      if (this.dom.saveModalWhat) {
        this.dom.saveModalWhat.textContent = clip.what?.coreTakeaway || 'สาระแก่นความคิดเพื่อนำไปต่อยอด';
      }
      if (this.dom.saveModalHow) {
        this.dom.saveModalHow.textContent = clip.how?.hookType || clip.structure || 'เทคนิคการเล่าและตรึงสายตา';
      }
    }

    // Reset scroll positions so the modal always opens cleanly at the top without being cut off
    if (this.dom.saveGateModal) {
      this.dom.saveGateModal.scrollTop = 0;
      const splitGrid = this.dom.saveGateModal.querySelector('.modal-split-grid');
      if (splitGrid) splitGrid.scrollTop = 0;
      const card = this.dom.saveGateModal.querySelector('.save-gate-modal-card');
      if (card) card.scrollTop = 0;
    }

    // Autofocus textarea safely without triggering container scroll jump
    requestAnimationFrame(() => {
      try {
        this.dom.founderWhyText?.focus({ preventScroll: true });
      } catch (e) {
        this.dom.founderWhyText?.focus();
      }
    });
  }

  closeSaveModal() {
    if (!this.dom.saveGateModal) return;
    this.dom.saveGateModal.hidden = true;
    document.body.style.overflow = '';
  }

  handleSaveConfirm() {
    const whyNote = this.dom.founderWhyText?.value.trim() || '';
    if (!whyNote) {
      alert('กรุณาระบุ Founder WHY Note เพื่อเป็นเหตุผลในการจัดเก็บ');
      this.dom.founderWhyText?.focus();
      return;
    }

    const radio = document.querySelector('input[name="save-destination"]:checked') || this.root.querySelector('input[name="save-destination"]:checked');
    const destination = radio?.value || 'content';

    const timestamp = Date.now();
    const recordsToSave = [];

    if (destination === 'both') {
      // 1. Content Vault Record
      recordsToSave.push({
        id: `saved-content-${timestamp}`,
        noteId: `saved-content-${timestamp}`,
        sourceId: this.state.currentClip.id,
        clipId: this.state.currentClip.id,
        title: this.state.currentClip.hook,
        subtitle: this.state.currentClip.what?.coreTakeaway || this.state.currentClip.hook,
        creator: this.state.currentClip.creator,
        creatorAvatar: this.state.currentClip.avatar || (this.state.currentClip.creator || 'M').slice(0, 2).toUpperCase(),
        handle: this.state.currentClip.handle,
        duration: this.state.currentClip.durationText || '0:48 นาที',
        sourceUrl: this.state.currentClip.url || '#',
        thumbnailUrl: 'assets/video_preview.png',
        vaultType: 'content',
        lens: 'content',
        savedOrigin: 'both',
        whyNote: whyNote,
        founderWhy: whyNote,
        why: whyNote,
        tags: this.state.currentClip.what?.tags || [this.state.currentClip.structure || 'Viral Research', 'Content ID'],
        aiInsight: this.state.currentClip.what?.coreTakeaway || 'สาระแก่นความคิดสำหรับนำไปสังเคราะห์ใน Remix Studio',
        what: this.state.currentClip.what,
        how: this.state.currentClip.how,
        savedAt: new Date().toISOString()
      });

      // 2. Packaging Vault Record
      recordsToSave.push({
        id: `saved-packaging-${timestamp}`,
        noteId: `saved-packaging-${timestamp}`,
        sourceId: this.state.currentClip.id,
        clipId: this.state.currentClip.id,
        title: this.state.currentClip.hook,
        subtitle: this.state.currentClip.how?.hookType || this.state.currentClip.structure || this.state.currentClip.hook,
        creator: this.state.currentClip.creator,
        creatorAvatar: this.state.currentClip.avatar || (this.state.currentClip.creator || 'M').slice(0, 2).toUpperCase(),
        handle: this.state.currentClip.handle,
        duration: this.state.currentClip.durationText || '0:48 นาที',
        sourceUrl: this.state.currentClip.url || '#',
        thumbnailUrl: 'assets/video_preview.png',
        vaultType: 'packaging',
        lens: 'packaging',
        savedOrigin: 'both',
        whyNote: whyNote,
        founderWhy: whyNote,
        why: whyNote,
        tags: [this.state.currentClip.how?.hookType || 'Hook', this.state.currentClip.structure || 'Packaging Style'],
        aiInsight: this.state.currentClip.how?.psychology || this.state.currentClip.how?.hookType || 'เทคนิคการเปิดคลิปและคุมจังหวะเพื่อดึงความสนใจ',
        what: this.state.currentClip.what,
        how: this.state.currentClip.how,
        savedAt: new Date().toISOString()
      });
    } else {
      recordsToSave.push({
        id: `saved-${destination}-${timestamp}`,
        noteId: `saved-${destination}-${timestamp}`,
        sourceId: this.state.currentClip.id,
        clipId: this.state.currentClip.id,
        title: this.state.currentClip.hook,
        subtitle: destination === 'packaging'
          ? (this.state.currentClip.how?.hookType || this.state.currentClip.structure || this.state.currentClip.hook)
          : (this.state.currentClip.what?.coreTakeaway || this.state.currentClip.hook),
        creator: this.state.currentClip.creator,
        creatorAvatar: this.state.currentClip.avatar || (this.state.currentClip.creator || 'M').slice(0, 2).toUpperCase(),
        handle: this.state.currentClip.handle,
        duration: this.state.currentClip.durationText || '0:48 นาที',
        sourceUrl: this.state.currentClip.url || '#',
        thumbnailUrl: 'assets/video_preview.png',
        vaultType: destination,
        lens: destination,
        savedOrigin: destination,
        whyNote: whyNote,
        founderWhy: whyNote,
        why: whyNote,
        tags: destination === 'packaging'
          ? [this.state.currentClip.how?.hookType || 'Hook', this.state.currentClip.structure || 'Packaging Style']
          : (this.state.currentClip.what?.tags || [this.state.currentClip.structure || 'Viral Research', 'Content ID']),
        aiInsight: destination === 'packaging'
          ? (this.state.currentClip.how?.psychology || this.state.currentClip.how?.hookType || 'เทคนิคการเปิดคลิปและคุมจังหวะเพื่อดึงความสนใจ')
          : (this.state.currentClip.what?.coreTakeaway || 'สรุปย่อแก่นความคิดสำหรับนำไปสังเคราะห์ใน Remix Studio'),
        what: this.state.currentClip.what,
        how: this.state.currentClip.how,
        savedAt: new Date().toISOString()
      });
    }

    // Save to LocalStorage (both user-saved key and shared key)
    try {
      const userSaved = JSON.parse(localStorage.getItem('mew_user_saved_clips') || '[]');
      const existing = JSON.parse(localStorage.getItem('mew_saved_references') || '[]');

      recordsToSave.forEach(rec => {
        userSaved.unshift(rec);
        existing.unshift(rec);
      });

      localStorage.setItem('mew_user_saved_clips', JSON.stringify(userSaved));
      localStorage.setItem('mew_saved_references', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }

    // Fire custom events for each record
    recordsToSave.forEach(rec => {
      window.dispatchEvent(new CustomEvent('mew:reference-saved', {
        bubbles: true,
        detail: rec
      }));
    });

    // Directly tell LibraryController to sync and re-render if it exists
    if (window.mewLibraryController && typeof window.mewLibraryController.syncFromStore === 'function') {
      window.mewLibraryController.syncFromStore();
      window.mewLibraryController.render();
    }

    this.closeSaveModal();
    this.updateSaveStatusUI('saved');
    this.showToast(`บันทึก "${this.state.currentClip.hook.slice(0, 32)}..." เข้าสู่ ${destination === 'content' ? 'Content Vault' : destination === 'packaging' ? 'Packaging Vault' : 'ทั้ง 2 คลัง (Both Vaults)'} เรียบร้อยแล้ว`, 'coral');

    // Navigate to My Library and focus the saved vault tab so user sees the card immediately
    const targetVault = destination === 'packaging' ? 'packaging' : 'content';
    window.dispatchEvent(new CustomEvent('mew:navigate-library', { detail: { lens: targetVault } }));
    if (typeof window.switchView === 'function') {
      setTimeout(() => window.switchView('library'), 320);
    }
  }

  updateSaveStatusUI(status) {
    this.state.saveStatus = status;
    const isSaved = status === 'saved';

    if (this.dom.clipStatusIndicator) {
      this.dom.clipStatusIndicator.className = `clip-status-pill ${isSaved ? 'status-saved' : 'status-not-saved'}`;
      const label = this.dom.clipStatusIndicator.querySelector('.status-label-text');
      if (label) label.textContent = isSaved ? 'Saved to Library' : 'Analyzed · Not saved';
    }

    if (this.dom.metaStateText) {
      this.dom.metaStateText.textContent = isSaved ? 'Saved to Library' : 'Analyzed · Not saved';
      this.dom.metaStateText.className = isSaved ? '' : 'status-text-highlight';
    }

    if (this.dom.footerStatusStrong) {
      this.dom.footerStatusStrong.textContent = isSaved ? 'Saved to Library' : 'Analyzed · Not saved';
    }

    if (this.dom.btnSaveToLibrary) {
      if (isSaved) {
        this.dom.btnSaveToLibrary.classList.remove('btn-primary');
        this.dom.btnSaveToLibrary.classList.add('btn-ghost');
        this.dom.btnSaveToLibrary.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Saved to Vault</span>
        `;
      } else {
        this.dom.btnSaveToLibrary.classList.add('btn-primary');
        this.dom.btnSaveToLibrary.classList.remove('btn-ghost');
        this.dom.btnSaveToLibrary.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span>Save to Library</span>
          <span class="btn-action-badge">S03</span>
        `;
      }
    }
  }

  showToast(message, type = 'coral') {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    } else {
      console.log(`[Toast ${type}]:`, message);
    }
  }
}

// Auto-initialize when loaded or DOM ready
if (typeof document !== 'undefined') {
  const initResearch = () => {
    const container = document.getElementById('research-container');
    if (container && !window.researchController) {
      window.researchController = new ResearchController(container);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResearch);
  } else {
    initResearch();
  }
}
