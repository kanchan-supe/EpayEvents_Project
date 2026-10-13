import { EventCategory, EventItem } from './types';

export const mockCategories: EventCategory[] = [
  { id: 'cat-1', name: 'Technology & AI', slug: 'tech-ai', icon: 'Cpu', description: 'Tech conferences, AI hackathons, software meetups', count: 18 },
  { id: 'cat-2', name: 'Business & Fintech', slug: 'business-fintech', icon: 'Briefcase', description: 'Finance summits, investor pitch events, startup founders expo', count: 14 },
  { id: 'cat-3', name: 'Music & Concerts', slug: 'music-concerts', icon: 'Music', description: 'Live concerts, music festivals, acoustic nights', count: 22 },
  { id: 'cat-4', name: 'Workshops & Education', slug: 'workshops', icon: 'BookOpen', description: 'Masterclasses, design bootcamps, hands-on training', count: 16 },
  { id: 'cat-5', name: 'Health & Wellness', slug: 'health-fitness', icon: 'HeartPulse', description: 'Yoga retreats, marathons, wellness conventions', count: 10 },
  { id: 'cat-6', name: 'Arts & Culture', slug: 'arts-culture', icon: 'Palette', description: 'Art exhibitions, theater plays, photography walks', count: 12 },
];

export const mockEvents: EventItem[] = [
  {
    id: 'evt_9f3k2',
    title: 'AI Business Summit 2026',
    slug: 'ai-business-summit-2026',
    shortDescription: 'Discover enterprise generative AI applications, agentic workflows, and executive leadership strategies shaping Indian and global business.',
    description: `
Welcome to the flagship AI Business Summit 2026 at the Bombay Exhibition Centre, Mumbai.

Join over 3,000 executive leaders, founders, AI researchers, and solution architects discussing the real-world deployment of generative AI, automated business pipelines, and agentic systems.

### Key Highlights
- **Executive Keynotes**: Insights from visionary tech leaders scaling enterprise AI.
- **Hands-on Masterclasses**: Deep dives into LLM fine-tuning, security guardrails, and automated agents.
- **Networking Lounges**: Connect with VCs, industry peers, and enterprise partners.
- **Expo Floor**: Live demos of cutting-edge AI software and robotics.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-11-15T10:00:00Z',
    endDate: '2026-11-16T18:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[0],
    organization: {
      id: 'org-techforward',
      name: 'TechForward India',
      slug: 'techforward-india',
      verified: true,
      contactEmail: 'contact@techforward.in',
      avatar: '/team/rahul.jpg',
      bio: 'TechForward India hosts world-class technology, AI, and leadership summits across Asia.',
    },
    venue: {
      name: 'Bombay Exhibition Centre',
      address: 'NESCO, Western Express Highway, Goregaon East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.1551,
      longitude: 72.8541,
    },
    facilities: [
      { icon: 'Wifi', title: 'Gigabit Event Wi-Fi', description: 'Enterprise mesh Wi-Fi across all exhibition halls.' },
      { icon: 'Utensils', title: 'Executive Lunch Buffet', description: 'Gourmet lunch and networking beverages included.' },
      { icon: 'QrCode', title: 'Rapid QR Check-in', description: 'Scan your mobile pass at entry in under a second.' },
      { icon: 'Video', title: 'Keynote Replays', description: 'Access on-demand recordings of all presentations.' },
    ],
    ticketTypes: [
      {
        id: 'tkt-ai-early',
        name: 'Early Bird Conference Pass',
        description: 'Complete 2-day summit access, keynote tracks, lunch buffet, and developer swag.',
        price: 1499,
        originalPrice: 2499,
        quantity: 500,
        remainingQuantity: 342,
        minPerOrder: 1,
        maxPerOrder: 5,
        category: 'General',
        isEarlyBird: true,
        earlyBirdDeadline: 'Ends Soon (342 Seats Available)',
        isTransferrable: true,
        isRefundable: true,
        refundPolicyDays: 7,
        features: ['Access to all Keynotes & AI Tracks', 'Full Lunch & Networking Buffet', 'Digital Swag Bag & Certificate', 'Instant QR Pass with Gate Scanner'],
        isPopular: true,
      },
      {
        id: 'tkt-ai-vip',
        name: 'VIP Executive Pass',
        description: 'VIP lounge access, priority front-row seating, and private dinner with keynote speakers.',
        price: 4999,
        originalPrice: 5999,
        quantity: 100,
        remainingQuantity: 48,
        minPerOrder: 1,
        maxPerOrder: 4,
        category: 'VIP',
        features: ['VIP Front Row Seating', 'Exclusive Speaker Dinner Access', 'Priority Fast-Track Entry', 'All Session Video Replays'],
        isPopular: false,
      },
    ],
    speakers: [
      {
        name: 'Dr. Rajesh Verma',
        role: 'Head of AI Engineering',
        company: 'TechCorp India',
        avatar: '/speakers/speaker1.jpg',
        bio: 'Leading enterprise LLM adoption and autonomous agent architectures.',
      },
      {
        name: 'Priya Sharma',
        role: 'VP of Product',
        company: 'CognitiveLabs',
        avatar: '/speakers/speaker2.jpg',
        bio: 'Designing human-centric agentic AI workflows and tools.',
      },
    ],
    agenda: [
      {
        time: '10:00 AM - 11:30 AM',
        title: 'Opening Keynote: The Enterprise AI Landscape 2026',
        description: 'Executive briefing on modern multimodal models and agentic automation.',
        speaker: 'Dr. Rajesh Verma',
      },
      {
        time: '11:45 AM - 01:00 PM',
        title: 'Autonomous Agents in Production',
        description: 'Case studies of deploying robust agentic loops in real business applications.',
        speaker: 'Priya Sharma',
      },
    ],
  },
  {
    id: 'evt-101',
    title: 'ePay Global FinTech & Payments Summit 2026',
    slug: 'epay-global-fintech-summit-2026',
    shortDescription: 'Join 2,000+ engineers, founders, and product teams building the future of instant payments, UPI integrations, and open banking APIs.',
    description: `
We built the ePay Global FinTech Summit to bring together developers, founders, and financial engineers who just want to ship fast and reliable payment infrastructure.

### What we will cover:
- **Keynote Talks**: How we scale payment gateways to 100k+ transactions per second without dropping requests.
- **Developer Track**: Real code walkthroughs for UPI auto-debits, webhooks, micro-settlements, and fraud detection algorithms.
- **Networking**: Hang out with VCs, fintech founders, and engineering leads over coffee and lunch.
- **Hands-on Demos**: Early access to new developer APIs and integration toolkits.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    eventType: 'hybrid',
    status: 'published',
    startDate: '2026-11-15T09:00:00Z',
    endDate: '2026-11-16T18:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[1],
    organization: {
      id: 'org-1',
      name: 'ePay Global Tech',
      slug: 'epay-global',
      verified: true,
      contactEmail: 'events@epay.com',
      avatar: '/team/rahul.jpg',
      bio: 'ePay Global Tech builds developer-first event management platforms and high-throughput instant payment infrastructure across Asia.',
    },
    venue: {
      name: 'International Tech Convention Center',
      address: 'Plot 42, Cyber City, BKC',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0657,
      longitude: 72.8687,
      onlineUrl: 'https://live.epayevents.com/fintech2026',
    },
    facilities: [
      { icon: 'Wifi', title: 'High-Speed 1 Gbps Wi-Fi', description: 'Fast Wi-Fi across all halls so you can test code live.' },
      { icon: 'Utensils', title: 'Food & Unlimited Coffee', description: 'Breakfast, lunch buffet, and coffee bar included with your pass.' },
      { icon: 'QrCode', title: 'Instant QR Check-in', description: 'Just show your phone QR ticket at the gate and walk right in.' },
      { icon: 'Video', title: 'Recording Access', description: 'We will send video recordings of all talks to your email after the event.' },
    ],
    ticketTypes: [
      {
        id: 'tkt-100',
        name: 'Early Bird Developer Pass',
        description: 'Discounted 2-day pass for early registrations with full keynote & lunch access.',
        price: 1499,
        originalPrice: 2499,
        quantity: 200,
        remainingQuantity: 12,
        minPerOrder: 1,
        maxPerOrder: 4,
        category: 'General',
        isEarlyBird: true,
        earlyBirdDeadline: 'Ends Soon (Last 12 seats)',
        isTransferrable: true,
        isRefundable: true,
        refundPolicyDays: 7,
        features: ['Full 2-Day Conference Access', 'Lunch & Coffee Bar Included', 'Digital Swag Bag & Certificate', 'Recorded Video Sessions'],
        isPopular: false,
      },
      {
        id: 'tkt-101',
        name: 'General Admission Pass',
        description: 'Full 2-day pass for all talks, tech track, lunch, and coffee breaks.',
        price: 2499,
        originalPrice: 2499,
        quantity: 500,
        remainingQuantity: 142,
        minPerOrder: 1,
        maxPerOrder: 8,
        category: 'General',
        isGroupDiscount: true,
        groupMinQty: 4,
        groupDiscountPercent: 15,
        isDynamicPricing: true,
        dynamicSurgePercent: 10,
        isTransferrable: true,
        isRefundable: true,
        refundPolicyDays: 5,
        features: ['Full 2-Day Conference Access', 'Keynote & Developer Tracks', '15% Off on 4+ Passes (Group Discount)', 'Instant QR Check-in Pass'],
        isPopular: true,
      },
      {
        id: 'tkt-102',
        name: 'VIP Executive Masterclass',
        description: 'General Pass + VIP workshop access, speaker dinner, and fast-track entry.',
        price: 5999,
        originalPrice: 7999,
        quantity: 100,
        remainingQuantity: 18,
        minPerOrder: 1,
        maxPerOrder: 3,
        category: 'VIP',
        isTransferrable: true,
        isRefundable: true,
        refundPolicyDays: 3,
        features: ['Everything in General Pass', 'VIP Speaker Networking Dinner', 'Exclusive Masterclass Workshop', 'Fast-Track Gate VIP Lane'],
        isPopular: false,
      },
      {
        id: 'tkt-103',
        name: 'Startup Founder Grant Pass',
        description: 'Complimentary sponsored ticket for pre-seed startup founders (Approval-based verification).',
        price: 0,
        originalPrice: 2499,
        quantity: 50,
        remainingQuantity: 8,
        minPerOrder: 1,
        maxPerOrder: 1,
        category: 'Corporate',
        isComplimentary: true,
        isApprovalRequired: true,
        isTransferrable: false,
        isRefundable: false,
        features: ['100% Free / Complimentary', 'Requires Startup URL & Pitch Review', 'Access to Investor Lounge', 'Digital Delegate Badge'],
        isPopular: false,
      },
      {
        id: 'tkt-104',
        name: 'Private Backstage Access (Secret Pass)',
        description: 'Hidden tier unlocked only via exclusive organizer passcode.',
        price: 9999,
        originalPrice: 12999,
        quantity: 25,
        remainingQuantity: 5,
        minPerOrder: 1,
        maxPerOrder: 2,
        category: 'VIP',
        isHidden: true,
        accessPasscode: 'EPAYVIP',
        isTransferrable: true,
        isRefundable: true,
        refundPolicyDays: 2,
        features: ['Green Room Access', 'Direct Speaker 1-on-1 Mentorship', 'Complimentary Luxury Lunch Buffet', 'Priority Valet Parking'],
        isPopular: false,
      },
      {
        id: 'tkt-105',
        name: 'Hands-on AI Workshop Intensive',
        description: 'Deep-dive LLM prompt engineering and fine-tuning lab. Currently sold out — waitlist open.',
        price: 3499,
        originalPrice: 3499,
        quantity: 80,
        remainingQuantity: 0,
        minPerOrder: 1,
        maxPerOrder: 2,
        category: 'Workshop',
        isWaitlist: true,
        isTransferrable: true,
        isRefundable: true,
        features: ['Hands-on GPU Cloud Sandbox', 'Instructor Guided Practice', 'Waitlist: Next in Line on Drops', 'Completion Certificate'],
        isPopular: false,
      },
    ],
    speakers: [
      { 
        name: 'Rajesh Malhotra', 
        role: 'VP of Engineering', 
        company: 'ePay Digital', 
        avatar: '/speakers/speaker1.jpg',
        bio: 'Rajesh heads backend systems at ePay. He loves high-concurrency systems, Go, and building low-latency payment rails.',
        linkedinUrl: 'https://linkedin.com',
      },
      { 
        name: 'Sarah Jenkins', 
        role: 'Head of Product', 
        company: 'Stripe Asia', 
        avatar: '/speakers/speaker2.jpg',
        bio: 'Sarah leads open banking API products across Asia. She focuses on clean developer docs and seamless checkout flows.',
        linkedinUrl: 'https://linkedin.com',
      },
      { 
        name: 'Vikram Sengupta', 
        role: 'Chief Security Officer', 
        company: 'CyberShield Systems', 
        avatar: '/speakers/speaker3.jpg',
        bio: 'Vikram specializes in PCI-DSS compliance, tokenization, and protecting financial APIs against zero-day threats.',
        linkedinUrl: 'https://linkedin.com',
      },
      { 
        name: 'Ananya Rao', 
        role: 'Lead Fintech Architect', 
        company: 'PayFlow Global', 
        avatar: '/speakers/speaker4.jpg',
        bio: 'Ananya crafts distributed microservice architectures for real-time UPI auto-debit payments.',
        linkedinUrl: 'https://linkedin.com',
      },
    ],
    agenda: [
      { time: '09:00 AM - 10:00 AM', title: 'Badge Collection & Instant QR Gate Check-in', description: 'Walk through our instant QR scanner gate, collect your lanyard badge, and enjoy welcome coffee.' },
      { time: '10:00 AM - 11:30 AM', title: 'Opening Keynote: Scaling UPI & Instant Payment Infrastructure', description: 'Engineering breakdown of scaling payment gateway microservices to handle 100k+ transactions per second.' },
      { time: '11:30 AM - 01:00 PM', title: 'Developer Deep-Dive: Open Banking APIs & Webhooks', description: 'Live coding session demonstrating micro-settlement webhooks, idempotency keys, and retry handlers.' },
      { time: '01:00 PM - 02:15 PM', title: 'Networking Buffet Lunch & Sponsor Expo Walkthrough', description: 'Connect with founders, product leads, and engineering recruiters over lunch buffet.' },
      { time: '02:15 PM - 04:00 PM', title: 'Panel Discussion: AI Fraud Detection & Real-Time Risk Engine', description: 'Senior security experts analyze machine learning risk models for instant anomaly detection.' },
      { time: '04:00 PM - 05:30 PM', title: 'Closing Fireside Chat & VIP Speaker Mixer', description: 'Wrap-up session followed by exclusive VIP networking lounge access.' },
    ],
    sponsors: [
      { name: 'Stripe Asia', logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', tier: 'Title', websiteUrl: 'https://stripe.com' },
      { name: 'AWS Cloud India', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80', tier: 'Platinum', websiteUrl: 'https://aws.amazon.com' },
      { name: 'Razorpay Systems', logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80', tier: 'Gold', websiteUrl: 'https://razorpay.com' },
      { name: 'MongoDB Cloud', logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', tier: 'Silver', websiteUrl: 'https://mongodb.com' },
    ],
    exhibitors: [
      { name: 'PayFlow Security Systems', logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80', category: 'Payment Security', boothNumber: 'Booth A-12', description: 'Demonstrating real-time API encryption and fraud prevention toolkits.' },
      { name: 'CloudScale Infrastructure', logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80', category: 'DevOps & Cloud', boothNumber: 'Booth B-04', description: 'High-concurrency serverless deployment pipelines for fintech applications.' },
      { name: 'UPI Auto-Debit Labs', logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80', category: 'Banking SDKs', boothNumber: 'Booth C-08', description: 'Plug-and-play recurring subscription engines for mobile apps.' },
    ],
    faqs: [
      { question: 'How do I receive my event ticket after booking?', answer: 'Immediately after completing your checkout, your unique PDF ticket with a scannable QR code will be generated on screen and sent to your registered email address.' },
      { question: 'Is food and beverage included with the General Pass?', answer: 'Yes! Both General and VIP passes include the full lunch buffet, morning snacks, and unlimited coffee bar access across both days.' },
      { question: 'What is the refund policy if I cannot attend?', answer: 'Full refunds are available up to 7 days before the event start date. Cancellations made within 7 days can transfer their pass to a colleague at no extra cost.' },
      { question: 'Will video recordings of the keynotes be shared?', answer: 'Yes, video recordings of all keynote talks and developer sessions will be emailed to registered attendees within 5 business days after the summit.' },
    ],
    termsAndPolicy: [
      'Tickets are non-refundable within 7 days of the event start date, but ticket holder names can be updated free of charge.',
      'Attendees must present their digital QR ticket code on a mobile device or printed PDF pass at the gate entrance for badge issuance.',
      'Organizer reserves the right to substitute speakers or modify agenda timings due to unforeseen travel schedules.',
      'By registering, attendees agree to comply with venue safety standards and code of conduct policies.',
    ],
    couponCodes: [
      { code: 'EPAY20', discountPercent: 20, description: 'Get 20% off on all General and VIP passes' },
      { code: 'EARLYDEV', discountPercent: 15, description: 'Special 15% discount for developer teams' },
    ],
  },
  {
    id: 'evt-102',
    title: 'AI Innovators Hackathon & Expo 2026',
    slug: 'ai-innovators-hackathon-2026',
    shortDescription: 'Build next-gen LLM applications, multimodal autonomous agents, and computer vision models in a 36-hour sprint.',
    description: 'Connect with senior AI engineers and researchers. $25,000 in prize pools, GPU credits, and direct investor office hours.',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-11-28T08:00:00Z',
    endDate: '2026-11-29T20:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[0],
    organization: {
      id: 'org-2',
      name: 'AI Builders Club Collective',
      slug: 'ai-builders-club',
      verified: true,
      contactEmail: 'hack@aibuilders.org',
    },
    venue: {
      name: 'T-Hub Innovation Campus',
      address: 'Knowledge City, Hitec City',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-201',
        name: 'Hacker Ticket (Team / Solo)',
        description: 'Includes meals, swag bag, overnight stay space, and GPU cloud computing credits.',
        price: 499,
        quantity: 350,
        remainingQuantity: 45,
        minPerOrder: 1,
        maxPerOrder: 4,
      },
    ],
  },
  {
    id: 'evt-104',
    title: 'Indie Music Night: Acoustic Sunset Sessions',
    slug: 'indie-music-night-acoustic-sunset',
    shortDescription: 'An intimate evening featuring emerging indie singer-songwriters and live band performances under open skies.',
    description: 'Experience soul-stirring original acoustic music, artisan food trucks, and craft beverages at an open amphitheater.',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-12T17:00:00Z',
    endDate: '2026-12-12T22:30:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[2],
    organization: {
      id: 'org-4',
      name: 'Soundwave Collective',
      slug: 'soundwave',
      verified: true,
      contactEmail: 'contact@soundwave.in',
    },
    venue: {
      name: 'The Green Amphitheatre',
      address: 'Outer Ring Road, Near Eco Park',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-401',
        name: 'Early Bird Single Pass',
        description: 'Entry pass including 1 complimentary welcome drink.',
        price: 799,
        quantity: 150,
        remainingQuantity: 12,
        minPerOrder: 1,
        maxPerOrder: 6,
      },
    ],
  },
  {
    id: 'evt-105',
    title: 'NextGen Web3 & Blockchain Summit 2026',
    slug: 'nextgen-web3-blockchain-summit-2026',
    shortDescription: 'Discover smart contract security, zero-knowledge proofs, and decentralized finance infrastructure with 1,500+ builders.',
    description: 'An intensive 2-day conference bringing together blockchain architects, protocol engineers, and Web3 investors.',
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-05T09:30:00Z',
    endDate: '2026-12-06T18:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[0],
    organization: {
      id: 'org-5',
      name: 'Web3 India Builders Guild',
      slug: 'web3-india',
      verified: true,
      contactEmail: 'contact@web3guild.org',
    },
    venue: {
      name: 'NESCO Exhibition Center',
      address: 'Western Express Highway, Goregaon',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-501',
        name: 'Developer Pass',
        description: 'Full 2-day pass with workshop access, lunch, and hackathon entrance.',
        price: 1999,
        quantity: 300,
        remainingQuantity: 68,
        minPerOrder: 1,
        maxPerOrder: 4,
      },
    ],
  },
  {
    id: 'evt-106',
    title: 'National UX & Product Design Conclave 2026',
    slug: 'national-ux-product-design-conclave-2026',
    shortDescription: 'Master modern design tokens, accessibility standards, and AI-assisted prototyping with industry design leaders.',
    description: 'A hands-on interactive conclave featuring design system teardowns, portfolio reviews, and product strategy masterclasses.',
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=80',
    eventType: 'hybrid',
    status: 'published',
    startDate: '2026-12-20T10:00:00Z',
    endDate: '2026-12-20T17:30:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[3],
    organization: {
      id: 'org-6',
      name: 'Design Craft Society',
      slug: 'design-craft',
      verified: true,
      contactEmail: 'hello@designcraft.in',
    },
    venue: {
      name: 'Koramangala Club Convention Hall',
      address: '8th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      onlineUrl: 'https://live.epayevents.com/ux2026',
    },
    ticketTypes: [
      {
        id: 'tkt-601',
        name: 'Early Bird Pass',
        description: 'Access to live stream, design kit resources, and recorded video sessions.',
        price: 1299,
        quantity: 250,
        remainingQuantity: 34,
        minPerOrder: 1,
        maxPerOrder: 5,
      },
    ],
  },
  {
    id: 'evt-107',
    title: 'FullStack Next.js 15 & React 19 Masterclass 2026',
    slug: 'fullstack-nextjs-react-masterclass-2026',
    shortDescription: 'Deep-dive into Server Components, Server Actions, App Router caching, and production deployment masterclass.',
    description: 'Learn step-by-step how to architect ultra-fast full-stack web applications with Next.js 15, React 19, TypeScript, and Prisma.',
    bannerUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80',
    eventType: 'hybrid',
    status: 'published',
    startDate: '2026-12-28T09:30:00Z',
    endDate: '2026-12-28T17:30:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[0],
    organization: {
      id: 'org-7',
      name: 'FullStack Developers Guild',
      slug: 'fullstack-guild',
      verified: true,
      contactEmail: 'workshop@fullstackguild.io',
    },
    venue: {
      name: 'WeWork Galaxy Auditorium',
      address: '43 Residency Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      onlineUrl: 'https://live.epayevents.com/nextjs2026',
    },
    ticketTypes: [
      {
        id: 'tkt-701',
        name: 'Developer Workshop Pass',
        description: 'Includes full-day live workshop, interactive starter codebase, lunch, and certificate.',
        price: 1899,
        quantity: 200,
        remainingQuantity: 52,
        minPerOrder: 1,
        maxPerOrder: 4,
      },
    ],
  },
  {
    id: 'evt-108',
    title: 'E-Commerce & Retail Tech Expo 2026',
    slug: 'ecommerce-retail-tech-expo-2026',
    shortDescription: 'Discover direct-to-consumer growth hacks, automated logistics, omni-channel checkout, and AI recommendation engines.',
    description: 'Connect with over 1,500 retail founders, D2C brand owners, payment gateway partners, and supply chain technology providers.',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2027-01-10T10:00:00Z',
    endDate: '2027-01-11T18:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[1],
    organization: {
      id: 'org-8',
      name: 'Retail Technology Association',
      slug: 'retail-tech-assoc',
      verified: true,
      contactEmail: 'contact@retailtech.in',
    },
    venue: {
      name: 'Pragati Maidan Exhibition Center',
      address: 'Mathura Road',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-801',
        name: 'Expo Visitor Pass',
        description: 'Access to exhibition floor, keynote stage, networking lounge, and partner booths.',
        price: 799,
        quantity: 600,
        remainingQuantity: 180,
        minPerOrder: 1,
        maxPerOrder: 6,
      },
    ],
  },
  {
    id: 'evt-109',
    title: 'CyberSecurity & Ethical Hacking Summit 2026',
    slug: 'cybersecurity-ethical-hacking-summit-2026',
    shortDescription: 'Learn threat hunting, zero-trust API security, penetration testing, and cloud infrastructure defense techniques.',
    description: 'Hands-on red team vs blue team live security drills, bug bounty strategy sessions, and cloud security posture management.',
    bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2027-01-22T09:00:00Z',
    endDate: '2027-01-23T17:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[0],
    organization: {
      id: 'org-9',
      name: 'InfoSec Cyber Guild',
      slug: 'infosec-guild',
      verified: true,
      contactEmail: 'summit@infosecguild.org',
    },
    venue: {
      name: 'Hyderabad International Convention Centre (HICC)',
      address: 'Novotel & HICC Complex, Cyberabad',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-901',
        name: 'Security Engineer Pass',
        description: 'Full access to technical talks, live hacking arena, and CTF tournament entry.',
        price: 2999,
        quantity: 350,
        remainingQuantity: 88,
        minPerOrder: 1,
        maxPerOrder: 3,
      },
    ],
  },
  {
    id: 'evt-110',
    title: 'Holistic Yoga & Mindfulness Retreat 2026',
    slug: 'holistic-yoga-mindfulness-retreat-2026',
    shortDescription: 'Recharge your mind and body with immersive pranayama, sound healing, guided meditation, and organic dining.',
    description: 'A soothing weekend retreat led by renowned yoga masters and wellness coaches surrounded by peaceful nature.',
    bannerUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2027-02-05T07:00:00Z',
    endDate: '2027-02-07T16:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[4],
    organization: {
      id: 'org-10',
      name: 'Prana Wellness Collective',
      slug: 'prana-wellness',
      verified: true,
      contactEmail: 'retreat@pranawellness.in',
    },
    venue: {
      name: 'Atmantan Wellness Resort',
      address: 'Mulshi Lake Road',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-1001',
        name: 'Full Weekend Wellness Pass',
        description: 'Includes accommodation, all yoga & meditation sessions, organic meals, and wellness kit.',
        price: 4999,
        quantity: 120,
        remainingQuantity: 24,
        minPerOrder: 1,
        maxPerOrder: 2,
      },
    ],
  },
  // --- PAST EVENTS ---
  {
    id: 'evt-past-1',
    title: 'India Developer Summit & Cloud Conf 2025',
    slug: 'india-developer-summit-2025',
    shortDescription: 'Over 1,800+ developers joined live in Bengaluru for microservices, Go, and cloud-native architecture talks.',
    description: 'Successful past summit featuring keynotes by cloud architects, hands-on workshop labs, and high-throughput system architecture panels.',
    bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'ended',
    startDate: '2025-09-10T09:00:00Z',
    endDate: '2025-09-11T18:00:00Z',
    timezone: 'IST',
    featured: false,
    category: mockCategories[0],
    organization: {
      id: 'org-past-1',
      name: 'Cloud Native India Community',
      slug: 'cloud-native-india',
      verified: true,
    },
    venue: {
      name: 'NIMHANS Convention Center',
      address: 'Hosur Road',
      city: 'Bengaluru',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-p1',
        name: 'Past General Pass',
        description: 'Past event - tickets closed',
        price: 1499,
        quantity: 1800,
        remainingQuantity: 0,
        minPerOrder: 1,
        maxPerOrder: 1,
      },
    ],
  },
  {
    id: 'evt-past-2',
    title: 'Asia FinTech Founders Conclave 2025',
    slug: 'asia-fintech-founders-conclave-2025',
    shortDescription: 'Gathered 500+ CEOs, founders, and banking leads to discuss open API standards and digital merchant payments.',
    description: 'A successful executive conclave held in Mumbai focusing on payment gateway security, PCI-DSS compliance, and cross-border settlement rails.',
    bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80',
    eventType: 'hybrid',
    status: 'ended',
    startDate: '2025-06-20T10:00:00Z',
    endDate: '2025-06-21T17:00:00Z',
    timezone: 'IST',
    featured: false,
    category: mockCategories[1],
    organization: {
      id: 'org-past-2',
      name: 'FinTech Founders Network',
      slug: 'fintech-founders',
      verified: true,
    },
    venue: {
      name: 'St. Regis Hotel Ballrooms',
      address: 'Lower Parel',
      city: 'Mumbai',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-p2',
        name: 'Past Executive Pass',
        description: 'Past event - tickets closed',
        price: 3999,
        quantity: 500,
        remainingQuantity: 0,
        minPerOrder: 1,
        maxPerOrder: 1,
      },
    ],
  },
  {
    id: 'evt-past-3',
    title: 'Design Systems & UI Engineering Expo 2025',
    slug: 'design-systems-ui-engineering-expo-2025',
    shortDescription: '1,200+ UI architects and frontend developers gathered online to build accessible design system token pipelines.',
    description: 'A popular virtual conference covering Tailwind CSS, React Server Components, component testing, and design system governance.',
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=80',
    eventType: 'online',
    status: 'ended',
    startDate: '2025-04-15T10:00:00Z',
    endDate: '2025-04-15T18:00:00Z',
    timezone: 'IST',
    featured: false,
    category: mockCategories[3],
    organization: {
      id: 'org-past-3',
      name: 'UX Craft Academy',
      slug: 'ux-craft',
      verified: true,
    },
    venue: {
      name: 'Virtual Interactive Zoom Stage',
      address: 'Online Stream',
      city: 'Online',
      country: 'Global',
    },
    ticketTypes: [
      {
        id: 'tkt-p3',
        name: 'Past Online Ticket',
        description: 'Past event - tickets closed',
        price: 0,
        quantity: 1200,
        remainingQuantity: 0,
        minPerOrder: 1,
        maxPerOrder: 1,
      },
    ],
  },
];

// In-memory global store to keep newly published events across requests
const globalDataStore = globalThis as unknown as {
  __epay_events__?: EventItem[];
};

if (!globalDataStore.__epay_events__) {
  globalDataStore.__epay_events__ = [...mockEvents];
}

export function getAllEvents(): EventItem[] {
  if (!globalDataStore.__epay_events__) {
    globalDataStore.__epay_events__ = [...mockEvents];
  }
  return globalDataStore.__epay_events__;
}

export function addPublishedEvent(event: EventItem): EventItem {
  const current = getAllEvents();
  const idx = current.findIndex(e => e.id === event.id || e.slug === event.slug);
  if (idx >= 0) {
    current[idx] = event;
  } else {
    current.unshift(event);
  }
  globalDataStore.__epay_events__ = current;
  return event;
}

export async function getEvents(filters?: { query?: string; category?: string; location?: string; eventType?: string; price?: string }) {
  let list = [...getAllEvents()];

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(e => e.title.toLowerCase().includes(q) || e.shortDescription.toLowerCase().includes(q) || e.venue.city.toLowerCase().includes(q));
  }

  if (filters?.category && filters.category !== 'all') {
    list = list.filter(e => e.category.slug === filters.category);
  }

  if (filters?.location && filters.location !== 'all') {
    const loc = filters.location.toLowerCase();
    list = list.filter(e => e.venue.city.toLowerCase() === loc);
  }

  if (filters?.eventType && filters.eventType !== 'all') {
    list = list.filter(e => e.eventType === filters.eventType);
  }

  if (filters?.price) {
    if (filters.price === 'free') {
      list = list.filter(e => e.ticketTypes.some(t => t.price === 0));
    } else if (filters.price === 'paid') {
      list = list.filter(e => e.ticketTypes.some(t => t.price > 0));
    }
  }

  return list;
}

export async function getEventBySlug(slug: string) {
  const all = getAllEvents();
  return all.find(e => e.slug === slug) || all[0];
}
