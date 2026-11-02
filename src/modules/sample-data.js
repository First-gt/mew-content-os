/**
 * ==============================================================================
 * MEW CONTENT OS — Sample Data (Topic T02)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Reference: MEW_Content_OS_Founder_UX_Spec_TH.md (Section 6 & 0)
 * 
 * Spec 6 Sample Data:
 * - Story A: "Post and forget it" (Content Vault only)
 * - Story B: "The Ticking Clock" (Packaging Vault only)
 * - Story C: Remix A + B (Original concept synthesis)
 * - Story D: Multi-source C1 + C2 + C3 + P1 + P2
 * - Story E: Single source saved to Both vaults (Content & Packaging notes share 1 sourceId)
 * 
 * STRICT NEGATIVE CONSTRAINT:
 * No fake/arbitrary statistics like "arbitrary weeks", "+arbitrary weeksนี้", or fake percentage badges.
 * ==============================================================================
 */

/**
 * Canonical video sources (1 clip = 1 source record)
 */
export const SAMPLE_SOURCES = [
  {
    id: 'source-a',
    title: 'Post and forget it (อย่าเฝ้ายอด)',
    creator: 'Creator A',
    url: 'https://example.com/watch?v=post-and-forget',
    duration: '02:15',
    thumbnail: 'assets/video_preview.png',
    hasPermission: true,
    tags: ['Mindset', 'Workflow', 'Content Creation'],
    createdAt: '2026-10-28T10:00:00.000Z'
  },
  {
    id: 'source-b',
    title: 'The Ticking Clock (โครงสร้างนาฬิกากดดัน)',
    creator: 'Creator B',
    url: 'https://example.com/watch?v=the-ticking-clock',
    duration: '01:10',
    thumbnail: 'assets/video_preview.png',
    hasPermission: true,
    tags: ['Pacing', 'Hook', 'Sound Design'],
    createdAt: '2026-10-29T14:00:00.000Z'
  },
  {
    id: 'source-c2',
    title: 'Audience questions are market research (คำถามคอมเมนต์ช่วยหา pain)',
    creator: 'Creator C',
    url: 'https://example.com/watch?v=comment-market-research',
    duration: '03:20',
    thumbnail: 'assets/video_preview.png',
    hasPermission: true,
    tags: ['Customer Feedback', 'Market Research', 'Audience'],
    createdAt: '2026-10-29T16:00:00.000Z'
  },
  {
    id: 'source-c3',
    title: 'Automate repetitive follow-up responsibly (ระบบช่วยคัด/ตอบงานซ้ำ ๆ)',
    creator: 'Creator D',
    url: 'https://example.com/watch?v=responsible-automation',
    duration: '04:05',
    thumbnail: 'assets/video_preview.png',
    hasPermission: true,
    tags: ['Automation', 'AI Ethics', 'Customer Support'],
    createdAt: '2026-10-30T09:15:00.000Z'
  },
  {
    id: 'source-p2',
    title: 'Numbered reveal / visual comparison structure (โครงสร้าง 3 ข้อเทียบภาพ)',
    creator: 'Creator P',
    url: 'https://example.com/watch?v=numbered-reveal',
    duration: '01:45',
    thumbnail: 'assets/video_preview.png',
    hasPermission: true,
    tags: ['Structure', 'Visual Comparison', 'Numbered List'],
    createdAt: '2026-10-30T11:30:00.000Z'
  },
  {
    id: 'source-e',
    title: 'Myth vs Reality: การสร้างแบรนด์ที่แท้จริง (Story E: Single Source -> Both Vaults)',
    creator: 'Creator E',
    url: 'https://example.com/watch?v=brand-myth-vs-reality',
    duration: '02:40',
    thumbnail: 'assets/video_preview.png',
    hasPermission: true,
    tags: ['Brand Strategy', 'Mythbusting', 'Business Operations'],
    createdAt: '2026-10-30T15:00:00.000Z'
  },
  {
    id: 'source-x',
    title: 'Fast Editing Workflow (Analyzed · Not saved Demonstration)',
    creator: 'Creator X',
    url: 'https://example.com/watch?v=fast-editing-demo',
    duration: '01:30',
    thumbnail: 'assets/video_preview.png',
    hasPermission: true,
    tags: ['Editing', 'Workflow'],
    createdAt: '2026-10-31T08:00:00.000Z'
  }
];

/**
 * AI Dual-Lens Analyses (WHAT vs HOW) with versioning
 */
export const SAMPLE_ANALYSES = [
  {
    id: 'analysis-source-a-v1',
    sourceId: 'source-a',
    version: 1,
    createdAt: '2026-10-28T10:05:00.000Z',
    content: {
      coreIdea: 'โพสต์เสร็จอย่าคอยเปิดยอดทุกชั่วโมง เอาเวลาไปทำคอนเทนต์ใหม่',
      audience: 'Content Creators, ผู้ประกอบการเดี่ยว (Solopreneurs)',
      keyPoints: [
        'การเฝ้า analytics รายชั่วโมงสร้าง cognitive load และความเครียดโดยไม่ช่วยเพิ่มยอด',
        'เวลาที่มีค่าที่สุดคือเวลาคิดและสร้างสรรค์ชิ้นงานถัดไป',
        'คุณภาพและคุณค่าระยะยาวสำคัญกว่า spike ตัวเลขในชั่วโมงแรก'
      ],
      claimsAndEvidence: [
        {
          claim: 'การเปิดดูยอดทุกชั่วโมงลดประสิทธิภาพการทำงานอย่างมีนัยสำคัญ',
          evidence: 'ประสบการณ์ตรงของผู้พูด (ไม่มีตัวเลขงานวิจัยรองรับชัดเจน)'
        }
      ],
      examples: [
        'พฤติกรรมเปิดแอปดูยอดวิวทุก 5 นาทีหลังโพสต์คลิป'
      ],
      extendableAngles: [
        'นำความคิดนี้ไปเชื่อมกับระบบ Automation ที่ช่วยตอบลูกค้าและคัดกรองคอมเมนต์',
        'คืนเวลาให้คนทำคอนเทนต์ไม่ต้องนั่งเฝ้าหน้าจอ'
      ],
      whatIsGood: 'Mindset ไม่ต้องหมกมุ่นกับ metrics / preserve time to create'
    },
    packaging: {
      hook: 'คำถามสะกิดใจเรื่องการเปิดเช็กยอด',
      openingPattern: 'Direct Question / Talking Head',
      beats: ['ถามประเด็นแทงใจดำ', 'ชี้ให้เห็นเวลาที่สูญเปล่า', 'เสนอ Mindset ใหม่', 'สรุปให้เริ่มทำคลิปถัดไป'],
      pacing: 'เร็วปานกลาง ชัดถ้อยชัดคำ',
      musicSfx: 'Lo-fi beat เบาๆ คลอเบื้องหลัง',
      editingMechanics: 'Jump cut สั้นๆ เมื่อจบประโยค',
      timestampHighlights: [
        { time: '00:00', label: 'Hook: ถามเรื่องการเช็กยอด' },
        { time: '00:45', label: 'Pivot: ความเครียดและเวลาที่หายไป' },
        { time: '01:30', label: 'Takeaway: ปิดหน้าจอแล้วลงมือทำคลิปใหม่' }
      ],
      whatIsGood: 'การพูดกระชับ ตรงประเด็น'
    }
  },
  {
    id: 'analysis-source-b-v1',
    sourceId: 'source-b',
    version: 1,
    createdAt: '2026-10-29T14:05:00.000Z',
    content: {
      coreIdea: 'เรื่องเล่าส่วนตัวที่ไม่เกี่ยวกับธุรกิจหรือซอฟต์แวร์',
      audience: 'ผู้ชมทั่วไป',
      keyPoints: ['เรื่องเล่าความตื่นเต้นส่วนบุคคล'],
      claimsAndEvidence: [],
      examples: [],
      extendableAngles: [],
      whatIsGood: 'เนื้อหาไม่เกี่ยวกับธุรกิจเรา แต่มีพลังในการดึงดูดความสนใจสูง'
    },
    packaging: {
      hook: 'Anger / Curiosity hook: เริ่มด้วยความขัดแย้งที่ดึงดูดความสนใจทันที',
      openingPattern: 'เปิดด้วยภาพนาฬิกาเดินและความเงียบ ก่อนตัดเข้าประโยคขัดแย้ง',
      beats: 'Intro conflict -> ticking beat -> tension ramp -> twist -> payoff',
      pacing: 'Escalating stakes, cuts กระชับ ตัดภาพถี่ขึ้นทีละช่วง',
      musicSfx: 'เสียงติ๊กนาฬิกาเป็นจังหวะหลัก ค่อยๆ เร่งความถี่เพื่อบีบอารมณ์',
      editingMechanics: 'Gradual reveal เผยข้อมูลทีละชั้น ให้คนดูคาดเดาและติดตามจนจบ',
      timestampHighlights: [
        { time: '00:00', label: 'Hook ขัดแย้ง + เสียงนาฬิกาเดิน' },
        { time: '00:20', label: 'Tension ramp เร่งจังหวะตัดภาพถี่ขึ้น' },
        { time: '00:50', label: 'Twist หักมุมประเด็น' },
        { time: '01:05', label: 'Payoff เฉลยคลี่คลาย' }
      ],
      whatIsGood: 'Intro conflict -> ticking beat -> tension ramp -> twist -> payoff'
    }
  },
  {
    id: 'analysis-source-c2-v1',
    sourceId: 'source-c2',
    version: 1,
    createdAt: '2026-10-29T16:05:00.000Z',
    content: {
      coreIdea: 'คำถามในคอมเมนต์คือเข็มทิศความต้องการของตลาดที่ดีที่สุด',
      audience: 'ผู้ประกอบการและนักสร้างคอนเทนต์',
      keyPoints: [
        'คอมเมนต์ใต้โพสต์คือ unprompted feedback ที่ผู้ใช้ส่งมาด้วยปัญหาจริง',
        'การจัดหมวดหมู่คำถามซ้ำๆ ช่วยให้เห็น unmet needs ของลูกค้าชัดเจน'
      ],
      claimsAndEvidence: [
        { claim: 'คอมเมนต์มี insights ที่ลึกกว่าแบบสอบถามทั่วไป', evidence: 'เปรียบเทียบคำถามจริงจากคอมเมนต์กับการตอบแบบสอบถาม' }
      ],
      examples: ['การรวบรวมคำถามที่ลูกค้าถามซ้ำเกิน 5 ครั้งมาทำเป็นซีรีส์คลิป'],
      extendableAngles: ['การจัดระเบียบคำถามซ้ำๆ เพื่อสร้างเป็นคลังความรู้หรือระบบตอบอัตโนมัติ'],
      whatIsGood: 'การมองคอมเมนต์เป็นข้อมูลวิจัยการตลาด ไม่ใช่แค่กล่องข้อความทักทาย'
    },
    packaging: {
      hook: 'อย่าเพิ่งคิดไอเดียคลิปใหม่ ถ้ายังไม่ได้อ่าน 10 คอมเมนต์นี้',
      openingPattern: 'Directive statement + Screen recording',
      beats: 'Problem -> Proof in comments -> Framework -> Solution',
      pacing: 'มั่นคง หนักแน่น มีภาพประกอบ',
      musicSfx: 'Subtle corporate acoustic',
      editingMechanics: 'Zoom-in เข้าคอมเมนต์จริงบนหน้าจอ',
      timestampHighlights: [
        { time: '00:00', label: 'Hook: Directive statement' },
        { time: '01:10', label: 'วิธีคัดคอมเมนต์ทองคำ' }
      ],
      whatIsGood: 'การนำหลักฐานคอมเมนต์มาขึ้นจอชัดเจน'
    }
  },
  {
    id: 'analysis-source-c3-v1',
    sourceId: 'source-c3',
    version: 1,
    createdAt: '2026-10-30T09:20:00.000Z',
    content: {
      coreIdea: 'ระบบช่วยคัด/ตอบงานซ้ำ ๆ ได้บางส่วนอย่างมีความรับผิดชอบ',
      audience: 'ธุรกิจ SME และทีมคอนเทนต์ที่เริ่มมีคำถามล้น',
      keyPoints: [
        'อย่าปล่อยให้ AI ตอบแทนทุกอย่างโดยไม่มีมนุษย์ตรวจสอบ (Human-in-the-loop)',
        'แยกงานเป็น 3 ระดับ: สิ่งที่ควร Auto, สิ่งที่ต้อง Human Review, และสิ่งที่ต้อง Measure'
      ],
      claimsAndEvidence: [
        { claim: 'ระบบอัตโนมัติที่ไม่มีการตรวจทานเสี่ยงต่อการให้ข้อมูลผิดพลาด', evidence: 'เคสตัวอย่างคำตอบ AI หลุดบริบท' }
      ],
      examples: ['คัดกรองคำถามเกี่ยวกับเวลาเปิดปิดและราคาด้วยระบบ แต่ส่งเรื่องร้องเรียนให้มนุษย์'],
      extendableAngles: ['MEW Workflow: Auto-triage + Human review loop อย่างซื่อสัตย์'],
      whatIsGood: 'การเน้นความรับผิดชอบและขอบเขตที่ปลอดภัยของระบบอัตโนมัติ'
    },
    packaging: {
      hook: 'เมื่อ AI ตอบลูกค้าแทนคุณ…แต่พังทั้งระบบ',
      openingPattern: 'Warning / Mistake hook',
      beats: 'Warning -> Cause -> Guardrail framework -> Safe implementation',
      pacing: 'ตื่นตัว ระมัดระวัง',
      musicSfx: 'Ambient pulse',
      editingMechanics: 'กล่องข้อความเตือนสีแดงสลับเขียว',
      timestampHighlights: [
        { time: '00:00', label: 'Hook เตือนภัย' },
        { time: '02:00', label: '3 Guardrails ที่ห้ามข้าม' }
      ],
      whatIsGood: 'การสร้างความตระหนักเรื่องความเสี่ยงอย่างเป็นรูปธรรม'
    }
  },
  {
    id: 'analysis-source-p2-v1',
    sourceId: 'source-p2',
    version: 1,
    createdAt: '2026-10-30T11:35:00.000Z',
    content: {
      coreIdea: 'เคล็ดลับการจัดองค์ประกอบภาพในงานวิดีโอ',
      audience: 'นักตัดต่อวิดีโอ',
      keyPoints: ['การแบ่งสัดส่วนภาพ', 'ความเปรียบต่างเชิงสายตา'],
      claimsAndEvidence: [],
      examples: [],
      extendableAngles: [],
      whatIsGood: 'เทคนิคการจัดลำดับภาพ'
    },
    packaging: {
      hook: '3 สิ่งที่คุณกำลังทำผิดในการจัดภาพ โดยไม่รู้ตัว',
      openingPattern: 'Numbered Hook + Immediate Split Screen',
      beats: ['Point 1: ผิด vs ถูก', 'Point 2: ก่อน vs หลัง', 'Point 3: ช้า vs เร็ว', 'Payoff: สรุปหลักการ'],
      pacing: 'เร็ว กระชับ มีตัวเลขนับถอยหลังชัดเจน',
      musicSfx: 'Whoosh transitions + Pop sound effects',
      editingMechanics: 'แบ่งจอเปรียบเทียบซ้าย-ขวา ชัดเจนตั้งแต่ 5 วินาทีแรก',
      timestampHighlights: [
        { time: '00:00', label: 'Hook: 3 สิ่งที่ทำผิด' },
        { time: '00:25', label: 'ข้อ 1 เทียบซ้ายขวา' },
        { time: '00:55', label: 'ข้อ 2 เทียบก่อนหลัง' },
        { time: '01:25', label: 'ข้อ 3 สรุปวิธีแก้' }
      ],
      whatIsGood: 'Numbered reveal / visual comparison structure ทำให้เข้าใจในพริบตา'
    }
  },
  {
    id: 'analysis-source-e-v1',
    sourceId: 'source-e',
    version: 1,
    createdAt: '2026-10-30T15:05:00.000Z',
    content: {
      coreIdea: 'ความเข้าใจผิดเรื่องต้องโพสต์ทุกวันจนลืมพัฒนาแก่นสินค้า',
      audience: 'ผู้ก่อตั้งธุรกิจและแบรนด์รุ่นใหม่',
      keyPoints: [
        'ปริมาณคอนเทนต์ไม่สามารถทดแทนสินค้าที่ไม่ตอบโจทย์ได้',
        'การสร้างแบรนด์ที่ยั่งยืนเริ่มจากระบบการส่งมอบคุณค่า ไม่ใช่แค่จำนวนการโพสต์'
      ],
      claimsAndEvidence: [
        { claim: 'การลงโพสต์ทุกวันโดยไม่มีกลยุทธ์ทำให้ทีมล้าและ engagement ลดลง', evidence: 'การเปรียบเทียบแบรนด์ที่โฟกัสคุณภาพสินค้ากับแบรนด์ที่ปั๊มคอนเทนต์' }
      ],
      examples: ['แบรนด์ที่มัวแต่ทำคลิปเต้นจนสินค้าส่งช้าและคุณภาพตก'],
      extendableAngles: ['การสร้างระบบ Content OS ที่เน้นคุณภาพและระบบ Automation เพื่อไม่ให้ Founder หมดไฟ'],
      whatIsGood: 'ประเด็นแก้ความเข้าใจผิดเรื่องการสร้างแบรนด์ที่ลึกซึ้งและท้าทายกระแสนิยม'
    },
    packaging: {
      hook: 'สิ่งที่คุณคิดว่าจำเป็นที่สุดในการทำแบรนด์…อาจกำลังทำร้ายธุรกิจคุณ',
      openingPattern: 'Misconception Hook -> Gradual Myth Busting',
      beats: ['โยนความเชื่อเดิม (Myth)', 'ชี้จุดที่พังในชีวิตจริง', 'เปิดเผยความจริง (Truth)', 'แนวทางใหม่'],
      pacing: 'เปิดช้าสร้างความสงสัย แล้วค่อยเร่งจังหวะตอนเฉลยความจริง',
      musicSfx: 'ดนตรีแนวสารคดีลึกลับ ก่อนเปลี่ยนเป็นโทนสว่างเมื่อเฉลย',
      editingMechanics: 'กราฟิกเปรียบเทียบ Myth ฝั่งซ้าย vs Reality ฝั่งขวา',
      timestampHighlights: [
        { time: '00:00', label: 'Misconception Hook' },
        { time: '00:50', label: 'เปิดเผยหลุมพราง' },
        { time: '01:40', label: 'เฉลยแนวทางที่ยั่งยืน' }
      ],
      whatIsGood: 'วิธีเปิดด้วย misconception แล้วค่อยเฉลย (Gradual Myth Busting)'
    }
  },
  {
    id: 'analysis-source-x-v1',
    sourceId: 'source-x',
    version: 1,
    createdAt: '2026-10-31T08:05:00.000Z',
    content: {
      coreIdea: 'เทคนิคการจัดคีย์ลัดในโปรแกรมตัดต่อ',
      audience: 'นักตัดต่อ',
      keyPoints: ['การแมปคีย์บอร์ดมือเดียว'],
      claimsAndEvidence: [],
      examples: [],
      extendableAngles: [],
      whatIsGood: 'เทคนิคคีย์ลัด'
    },
    packaging: {
      hook: 'คีย์ลัดที่โปรตัดต่อใช้ทุกวัน',
      openingPattern: 'Screen demo',
      beats: 'Keyboard layout -> Demo speed -> Summary',
      pacing: 'เร็วมาก',
      musicSfx: 'Upbeat electronic',
      editingMechanics: 'Speed ramp',
      timestampHighlights: [{ time: '00:00', label: 'Start' }],
      whatIsGood: 'กระชับ รวดเร็ว'
    }
  }
];

/**
 * Human Saved Notes with WHY in Thai (Spec Section 6 & 0)
 * Note A: Content-only (Story A)
 * Note B: Packaging-only (Story B)
 * Note C2, C3: Content Vault (Story D)
 * Note P2: Packaging Vault (Story D)
 * Note E (Content) & Note E (Packaging): Both share source-e (Story E)
 */
export const SAMPLE_SAVED_NOTES = [
  // Story A: Content Vault only
  {
    id: 'note-a',
    sourceId: 'source-a',
    lens: 'content',
    why: 'ชอบสารหลัก อยากต่อยอดว่าเราไม่ควรต้องคอยนั่งตอบลูกค้า/เฝ้าคอมเมนต์ทุกชั่วโมงเหมือนกัน MEW มีแนวทางช่วยทำงานซ้ำ ๆ ด้วย Automation; จะใช้ตัวอย่างที่ระบบเราทำได้จริง',
    tags: ['Automation', 'Mindset', 'Workflow'],
    createdAt: '2026-10-28T10:15:00.000Z'
  },
  // Story B: Packaging Vault only
  {
    id: 'note-b',
    sourceId: 'source-b',
    lens: 'packaging',
    why: 'อยากลองโครงสร้างเปิดเรื่องที่กดดันแบบนี้กับเนื้อหางานธุรกิจ ใช้ SFX และภาพที่เรามีสิทธิ์เอง ไม่เอาเสียงต้นฉบับ',
    tags: ['Tension', 'Pacing', 'Hook-Conflict', 'SFX'],
    createdAt: '2026-10-29T14:20:00.000Z'
  },
  // Story D: C2 (Content)
  {
    id: 'note-c2',
    sourceId: 'source-c2',
    lens: 'content',
    why: 'คำถามในคอมเมนต์คือขุมทรัพย์ Market Research ชั้นดี อยากหยิบประเด็นนี้มาสอนว่าอย่ามองข้ามเสียงของลูกค้า',
    tags: ['Market Research', 'Customer Voice', 'Comments'],
    createdAt: '2026-10-29T16:15:00.000Z'
  },
  // Story D: C3 (Content)
  {
    id: 'note-c3',
    sourceId: 'source-c3',
    lens: 'content',
    why: 'ระบบช่วยคัดกรองและตอบคำถามซ้ำ ๆ ได้อย่างมีความรับผิดชอบ ช่วยคืนเวลาให้ Creator โฟกัสงานที่มีมูลค่าสูง',
    tags: ['Automation', 'Human Review', 'Workflow'],
    createdAt: '2026-10-30T09:30:00.000Z'
  },
  // Story D: P2 (Packaging)
  {
    id: 'note-p2',
    sourceId: 'source-p2',
    lens: 'packaging',
    why: 'โครงสร้างการเล่าแบบแบ่ง 3 ข้อ พร้อมภาพเปรียบเทียบซ้ายขวา ทำให้ผู้ชมเห็นความต่างได้ทันทีใน 5 วินาทีแรก',
    tags: ['Numbered List', 'Visual Comparison', 'Split Screen'],
    createdAt: '2026-10-30T11:45:00.000Z'
  },
  // Story E: Source E -> Content Note (Shares source-e with Packaging Note)
  {
    id: 'note-e-content',
    sourceId: 'source-e',
    lens: 'content',
    why: 'อยากพัฒนาประเด็นแก้ความเข้าใจผิดเรื่องการสร้างแบรนด์ที่คิดว่าต้องลงคอนเทนต์ทุกวันจนไม่มีเวลาพัฒนาสินค้าจริง',
    tags: ['Brand Strategy', 'Quality Over Quantity', 'Business Model'],
    createdAt: '2026-10-30T15:20:00.000Z'
  },
  // Story E: Source E -> Packaging Note (Shares source-e with Content Note)
  {
    id: 'note-e-packaging',
    sourceId: 'source-e',
    lens: 'packaging',
    why: 'อยากยืมวิธีเปิดด้วย misconception แล้วค่อยเฉลย (Gradual Myth Busting) โครงสร้างภาพเทียบฝั่งซ้ายขวาชัดเจน',
    tags: ['Misconception Hook', 'Gradual Reveal', 'Myth Busting'],
    createdAt: '2026-10-30T15:21:00.000Z'
  }
];

/**
 * Research Inbox Items with statuses
 * Reflecting the 7 official spec statuses:
 * - Waiting for analysis
 * - Analyzing
 * - Analyzed · Not saved
 * - Saved to Content
 * - Saved to Packaging
 * - Saved to Both
 * - Analysis unavailable
 */
export const SAMPLE_RESEARCH_ITEMS = [
  {
    id: 'item-source-a',
    sourceId: 'source-a',
    status: 'Saved to Content',
    createdAt: '2026-10-28T10:00:00.000Z'
  },
  {
    id: 'item-source-b',
    sourceId: 'source-b',
    status: 'Saved to Packaging',
    createdAt: '2026-10-29T14:00:00.000Z'
  },
  {
    id: 'item-source-c2',
    sourceId: 'source-c2',
    status: 'Saved to Content',
    createdAt: '2026-10-29T16:00:00.000Z'
  },
  {
    id: 'item-source-c3',
    sourceId: 'source-c3',
    status: 'Saved to Content',
    createdAt: '2026-10-30T09:15:00.000Z'
  },
  {
    id: 'item-source-p2',
    sourceId: 'source-p2',
    status: 'Saved to Packaging',
    createdAt: '2026-10-30T11:30:00.000Z'
  },
  {
    id: 'item-source-e',
    sourceId: 'source-e',
    status: 'Saved to Both',
    createdAt: '2026-10-30T15:00:00.000Z'
  },
  {
    id: 'item-source-x',
    sourceId: 'source-x',
    status: 'Analyzed · Not saved',
    createdAt: '2026-10-31T08:00:00.000Z'
  }
];

/**
 * Default Remix Selection (Story C: C1 + P1 pre-selected)
 */
export const SAMPLE_REMIX_SELECTION = {
  content: ['note-a'],
  packaging: ['note-b']
};

/**
 * Synthesized Original Concepts (Story C and Story D)
 * Output must be original ideas, angles, and briefs — not video splicing!
 */
export const SAMPLE_CONCEPTS = [
  // Story C: Remix A + B (Output must be original)
  {
    id: 'concept-story-c',
    title: 'คุณโพสต์คลิปเสร็จแล้ว…แต่ทำไมงานคุณยังไม่จบ?',
    hook: 'คุณโพสต์คลิปเสร็จแล้ว…แต่ทำไมงานคุณยังไม่จบ? (เสียงนาฬิกาเดินเบาๆ)',
    targetAudience: 'Creator / Small Business Owner',
    founderPOV: 'อย่าเอาเวลาหลังโพสต์ไปเฝ้า analytics และคอยตอบคำถามเดิม ๆ ถ้าส่วนนี้มีระบบช่วยจัดการได้',
    goal: 'แสดงปัญหาและตัวอย่างการทำงานของ MEW ที่พิสูจน์ได้จริง',
    storyBeats: [
      'Beat 1: ตัวละครเช็ก notification ซ้ำ ๆ พร้อมเสียง clock tick แสดงความตึงเครียดของเวลาที่ไหลไป',
      'Beat 2: พูดถึงเวลาและพลังงานที่เสียไปในการเฝ้ายอด (ใช้ภาษาคุณภาพ ไม่แต่งตัวเลขเวลาที่ยังไม่ได้วัด)',
      'Beat 3: เปลี่ยนมุมจาก view count ไปสู่ repetitive follow-up / comment triage ที่ค้างอยู่เต็มกล่องข้อความ',
      'Beat 4: เดโม Automation เฉพาะสิ่งที่ของจริงทำได้ (คัดแยกคำถามที่พบบ่อยและร่างคำตอบ) ไม่อ้างว่า AI ดูแลทุกอย่าง',
      'Beat 5 (Payoff): คืนเวลาให้คนสร้างสรรค์ได้ผลิตงานใหม่ พร้อม CTA ทดลองดู workflow จริง'
    ],
    sources: [
      {
        noteId: 'note-a',
        lens: 'content',
        sourceTitle: 'Post and forget it',
        contribution: 'แก่นคิดเรื่องอย่าเฝ้ายอด สู่การแก้ปัญหา repetitive follow-up'
      },
      {
        noteId: 'note-b',
        lens: 'packaging',
        sourceTitle: 'The Ticking Clock',
        contribution: 'โครงสร้างความตึงเครียดนาฬิกาเดินและ pacing ค่อยๆ เร่งจังหวะ'
      }
    ],
    rightsCheck: 'ใช้ SFX และภาพที่เรามีสิทธิ์เอง ไม่เอาเสียงต้นฉบับ ห้ามแต่งตัวเลขยอดวิว',
    status: 'Approved',
    createdAt: '2026-10-31T09:00:00.000Z'
  },
  // Story D: Multi-source C1 + C2 + C3 + P1 + P2
  {
    id: 'concept-story-d',
    title: '3 งานหลังโพสต์ที่คุณไม่จำเป็นต้องเฝ้าเองทั้งหมด',
    hook: '3 สิ่งที่คุณเสียเวลาทำซ้ำๆ ทุกครั้งหลังกดโพสต์ โดยที่คุณไม่รู้ตัว',
    targetAudience: 'Creator / Business Founder',
    founderPOV: 'รวมสามแนวคิดให้เป็น value proposition ใหม่ โดยยืมวิธีทำให้ดูจนจบจากสอง Reference ที่ไม่มีหัวข้อเดียวกันเลย',
    goal: 'แยกสิ่งที่ควร Auto, สิ่งที่ต้อง Human Review และสิ่งที่ต้อง Measure อย่างซื่อสัตย์',
    storyBeats: [
      'Beat 1 (P1+P2): เปิดด้วยเสียงเร่งจังหวะและภาพแบ่ง 3 งานที่กินเวลาที่สุด',
      'Beat 2 (C1): งานที่ 1 - การเฝ้ายอดวิว (แนะนำให้หยุดและปรับ mindset)',
      'Beat 3 (C2): งานที่ 2 - การอ่านคอมเมนต์ (ชี้ให้เห็นว่านี่คือ Market Research ชั้นดี แต่ไม่ต้องเฝ้าทั้งวัน)',
      'Beat 4 (C3): งานที่ 3 - การตอบคำถามเดิมๆ (เดโมระบบคัดกรองอัตโนมัติพร้อม Human Review)',
      'Beat 5 (Payoff): สรุปความคุ้มค่าของการคืนเวลาให้ Founder พร้อม CTA ดูเดโมจริง'
    ],
    sources: [
      { noteId: 'note-a', lens: 'content', sourceTitle: 'Post and forget it' },
      { noteId: 'note-c2', lens: 'content', sourceTitle: 'Audience questions are market research' },
      { noteId: 'note-c3', lens: 'content', sourceTitle: 'Automate repetitive follow-up responsibly' },
      { noteId: 'note-b', lens: 'packaging', sourceTitle: 'The Ticking Clock' },
      { noteId: 'note-p2', lens: 'packaging', sourceTitle: 'Numbered reveal / visual comparison structure' }
    ],
    rightsCheck: 'ห้ามแต่งตัวเลขเวลาหรือผลตอบแทนที่ไม่มีการวัดผลจริง แยก Auto vs Review ชัดเจน',
    status: 'Needs Review',
    createdAt: '2026-10-31T10:30:00.000Z'
  }
];

/**
 * Content Board Items (Stages: Draft -> Needs Review -> Approved -> Ready for Production)
 */
export const SAMPLE_BOARD_ITEMS = [
  {
    id: 'board-item-story-c',
    conceptId: 'concept-story-c',
    title: 'คุณโพสต์คลิปเสร็จแล้ว…แต่ทำไมงานคุณยังไม่จบ?',
    stage: 'Approved',
    targetDate: '2026-11-05',
    assignedTo: 'Founder & Production Team',
    updatedAt: '2026-10-31T10:00:00.000Z'
  },
  {
    id: 'board-item-story-d',
    conceptId: 'concept-story-d',
    title: '3 งานหลังโพสต์ที่คุณไม่จำเป็นต้องเฝ้าเองทั้งหมด',
    stage: 'Needs Review',
    targetDate: '2026-11-08',
    assignedTo: 'Content Lead',
    updatedAt: '2026-10-31T11:00:00.000Z'
  }
];

/**
 * Approved Immutable Revisions (Director Briefs for production handoff)
 */
export const SAMPLE_APPROVED_REVISIONS = [
  {
    revisionId: 'rev-c-001',
    conceptId: 'concept-story-c',
    approvedAt: '2026-10-31T10:00:00.000Z',
    approvedBy: 'Founder',
    brief: {
      directorBrief: 'ถ่ายทำฉากทำงานหน้าคอมพิวเตอร์ ใช้ SFX นาฬิกาที่ได้รับอนุญาตลิขสิทธิ์ถูกต้อง โทนภาพจริงใจ เน้นความเงียบและจังหวะกดดันก่อนผ่อนคลายด้วยเดโมระบบ',
      scriptHook: 'คุณโพสต์คลิปเสร็จแล้ว…แต่ทำไมงานคุณยังไม่จบ?',
      claimsVerified: true,
      constraints: 'ห้ามนำฟุตเทจหรือเสียงต้นฉบับของ reference มาใช้เด็ดขาด'
    }
  }
];

/**
 * Returns a fresh, deep copy of all sample data.
 */
export function getSampleData() {
  return {
    sources: JSON.parse(JSON.stringify(SAMPLE_SOURCES)),
    analyses: JSON.parse(JSON.stringify(SAMPLE_ANALYSES)),
    researchItems: JSON.parse(JSON.stringify(SAMPLE_RESEARCH_ITEMS)),
    savedNotes: JSON.parse(JSON.stringify(SAMPLE_SAVED_NOTES)),
    remixSelection: JSON.parse(JSON.stringify(SAMPLE_REMIX_SELECTION)),
    concepts: JSON.parse(JSON.stringify(SAMPLE_CONCEPTS)),
    boardItems: JSON.parse(JSON.stringify(SAMPLE_BOARD_ITEMS)),
    approvedRevisions: JSON.parse(JSON.stringify(SAMPLE_APPROVED_REVISIONS))
  };
}
