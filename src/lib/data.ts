import { EventCategory, EventItem } from './types';
import { supabase, isSupabaseConfigured } from './supabase/client';

export const mockCategories: EventCategory[] = [
  // Existing 6 categories (Preserved exactly as-is)
  { id: 'cat-1', name: 'Technology & AI', slug: 'tech-ai', icon: 'Cpu', description: 'Tech conferences, AI hackathons, software meetups', count: 18 },
  { id: 'cat-2', name: 'Business & Fintech', slug: 'business-fintech', icon: 'Briefcase', description: 'Finance summits, investor pitch events, startup founders expo', count: 14 },
  { id: 'cat-3', name: 'Music & Concerts', slug: 'music-concerts', icon: 'Music', description: 'Live concerts, music festivals, acoustic nights', count: 22 },
  { id: 'cat-4', name: 'Workshops & Education', slug: 'workshops', icon: 'BookOpen', description: 'Masterclasses, design bootcamps, hands-on training', count: 16 },
  { id: 'cat-5', name: 'Health & Wellness', slug: 'health-fitness', icon: 'HeartPulse', description: 'Yoga retreats, marathons, wellness conventions', count: 10 },
  { id: 'cat-6', name: 'Arts & Culture', slug: 'arts-culture', icon: 'Palette', description: 'Art exhibitions, theater plays, photography walks', count: 12 },

  // New Categories Added as requested
  { id: 'cat-7', name: 'Small Local Events', slug: 'small-local-events', icon: 'Users', description: 'Society gatherings, local fairs, cultural programs, community meetups, charity events', count: 15 },
  { id: 'cat-8', name: 'Party Events', slug: 'party-events', icon: 'PartyPopper', description: 'Birthday parties, DJ nights, private parties, engagement parties, baby showers', count: 19 },
  { id: 'cat-9', name: 'Fashion Shows', slug: 'fashion-shows', icon: 'Sparkles', description: 'Fashion weeks, local designer shows, modeling competitions, boutique launches, ethnic-wear exhibitions', count: 8 },
  { id: 'cat-10', name: 'Matrimony Committee Meetings', slug: 'matrimony-meetings', icon: 'Heart', description: "Community matchmaking, bride and groom introduction events, parents' meetings, matrimony registration programs", count: 9 },
  { id: 'cat-11', name: 'Stand-up Comedy', slug: 'standup-comedy', icon: 'Mic2', description: 'Comedy shows, open mics, Marathi comedy, improv shows, storytelling events', count: 14 },
  { id: 'cat-12', name: 'Spiritual Events', slug: 'spiritual-events', icon: 'Sun', description: 'Bhajan, kirtan, satsang, pravachan, meditation, yoga, temple festivals', count: 11 },
  { id: 'cat-13', name: 'Sports Events', slug: 'sports-events', icon: 'Trophy', description: 'Cricket, football, badminton, marathons, gaming tournaments', count: 17 },
  { id: 'cat-14', name: 'Food Events', slug: 'food-events', icon: 'UtensilsCrossed', description: 'Food festivals, street food events, cooking competitions, tasting events', count: 13 },
  { id: 'cat-15', name: 'Social & Charity Events', slug: 'social-charity', icon: 'HandHeart', description: 'Blood donation camps, volunteering, community service, awareness programs', count: 7 },
  { id: 'cat-16', name: 'Shopping & Exhibitions', slug: 'shopping-exhibitions', icon: 'ShoppingBag', description: 'Flea markets, handicraft fairs, shopping exhibitions, trade fairs', count: 12 },
  { id: 'cat-17', name: 'Family & Kids Events', slug: 'family-kids', icon: 'Smile', description: "Kids' workshops, family fun days, school activities, children's entertainment", count: 8 },
  { id: 'cat-18', name: 'Wedding Events', slug: 'wedding-events', icon: 'Gem', description: 'Wedding exhibitions, bridal shows, wedding planning meetups', count: 6 },
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
    startDate: '2026-11-15T10:00:00',
    endDate: '2026-11-16T18:00:00',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    date: '2026-11-15',
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
      {
        id: 'tkt-ai-workshop-lab',
        name: 'Hands-on AI Workshop Intensive',
        description: 'Deep-dive LLM prompt engineering, fine-tuning and agent architecture lab. Currently sold out — waitlist open.',
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
        features: ['Dedicated GPU Sandbox Access', 'Code Repos & Colab Notebooks', 'Certificate of Workshop Attendance', '1-on-1 Mentor Support'],
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
    startDate: '2026-11-15T10:00:00',
    endDate: '2026-11-16T18:00:00',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    date: '2026-11-15',
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
    startDate: '2026-11-28T08:00:00',
    endDate: '2026-11-29T20:00:00',
    startTime: '08:00 AM',
    endTime: '08:00 PM',
    date: '2026-11-28',
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
    startDate: '2026-12-12T17:00:00',
    endDate: '2026-12-12T22:30:00',
    startTime: '05:00 PM',
    endTime: '10:30 PM',
    date: '2026-12-12',
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
  // --- NEW CATEGORY SHOWCASE EVENTS ---
  {
    id: 'evt-small-local-01',
    title: 'Green Meadows Annual Society Fair & Cultural Conclave',
    slug: 'green-meadows-society-cultural-fair-2026',
    shortDescription: 'Local society gathering featuring community talent performances, traditional handicraft stalls, games, and charity food drives.',
    description: `
Join neighbors and families at the Green Meadows Annual Society Fair & Cultural Conclave in Pune.

### Event Highlights
- **Society Talent Stage**: Live dance and singing performances by local residents of all ages.
- **Local Art & Craft Fair**: 30+ homegrown artisans showcasing handmade decor and jewelry.
- **Community Food Stalls**: Authentic homemade Maharashtrian, North Indian, and South Indian cuisines.
- **Charity Book & Clothes Drive**: Direct donations to local NGO partners.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-11-28T16:00:00Z',
    endDate: '2026-11-28T22:00:00Z',
    startTime: '04:00 PM',
    endTime: '10:00 PM',
    date: '2026-11-28',
    timezone: 'IST',
    featured: false,
    category: mockCategories[6], // Small Local Events
    organization: {
      id: 'org-green-meadows',
      name: 'Pune Residential Welfare Council',
      slug: 'pune-rwa-council',
      verified: true,
      contactEmail: 'events@greenmeadows.org',
    },
    venue: {
      name: 'Green Meadows Amphitheatre Grounds',
      address: 'Baner-Pashan Link Road',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.5590,
      longitude: 73.7868,
    },
    ticketTypes: [
      {
        id: 'tkt-sm-01',
        name: 'Family Entry Pass',
        description: 'All-inclusive entry for family up to 4 members with game coupons.',
        price: 199,
        quantity: 400,
        remainingQuantity: 285,
        minPerOrder: 1,
        maxPerOrder: 4,
        category: 'General',
        features: ['Full Fair Access', 'Game Stall Tokens', 'Live Musical Stage Access'],
      },
    ],
  },
  {
    id: 'evt-party-01',
    title: 'Neon Groove Bollywood DJ Night & Rooftop Bash',
    slug: 'neon-groove-bollywood-dj-night-mumbai',
    shortDescription: 'High-energy Bollywood EDM rooftop party featuring top celebrity DJs, strobe light show, and signature mocktails.',
    description: `
Experience Mumbai's most electric rooftop party with DJ Nikhil and DJ Ayesha dropping Bollywood dance beats, remixes, and live percussion.

### Party Experience
- **Rooftop City Skyline View**: Overlooking the Mumbai skyline under open stars.
- **Laser & Strobe Light Show**: Immersive sound and projection mapping.
- **VIP Cabana Lounges**: Dedicated steward service and gourmet appetizers.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-05T20:00:00Z',
    endDate: '2026-12-06T02:00:00Z',
    startTime: '08:00 PM',
    endTime: '02:00 AM',
    date: '2026-12-05',
    timezone: 'IST',
    featured: true,
    category: mockCategories[7], // Party Events
    organization: {
      id: 'org-skyline-club',
      name: 'Skyline Nightlife & Entertainment',
      slug: 'skyline-nightlife',
      verified: true,
      contactEmail: 'reservations@skylinenightlife.com',
    },
    venue: {
      name: 'SkyLounge Rooftop Deck',
      address: 'Senapati Bapat Marg, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.9986,
      longitude: 72.8258,
    },
    ticketTypes: [
      {
        id: 'tkt-party-stag',
        name: 'Stag Entry Pass',
        description: 'Single guest admission with 1 complimentary beverage.',
        price: 999,
        quantity: 250,
        remainingQuantity: 84,
        minPerOrder: 1,
        maxPerOrder: 3,
        category: 'General',
      },
      {
        id: 'tkt-party-couple',
        name: 'Couple Entry Pass',
        description: 'Couples pass with 2 welcome drinks and appetizers.',
        price: 1599,
        quantity: 150,
        remainingQuantity: 42,
        minPerOrder: 1,
        maxPerOrder: 2,
        category: 'VIP',
      },
    ],
  },
  {
    id: 'evt-fashion-01',
    title: 'India Couture & Ethnic Runway Week 2026',
    slug: 'india-couture-ethnic-runway-week-mumbai',
    shortDescription: 'Premier fashion runway show presenting bridal couture, handloom heritage, and new-age indie designer collections.',
    description: `
India Couture & Ethnic Runway Week celebrates India's finest artisans, heritage silks, and contemporary fashion houses.

### What to Expect
- **Designer Runway Showcases**: 12 top designers exhibiting bridal, festive, and fusion collections.
- **Boutique Exhibition Lounge**: Exclusive spot-order opportunities directly from designers.
- **Red Carpet & Media Conclave**: Celebrity guests, fashion influencers, and industry stylists.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-12T17:00:00Z',
    endDate: '2026-12-13T22:00:00Z',
    startTime: '05:00 PM',
    endTime: '10:00 PM',
    date: '2026-12-12',
    timezone: 'IST',
    featured: true,
    category: mockCategories[8], // Fashion Shows
    organization: {
      id: 'org-fashion-council',
      name: 'Indian Haute Couture Guild',
      slug: 'indian-haute-couture',
      verified: true,
      contactEmail: 'runway@coutureguild.in',
    },
    venue: {
      name: 'Grand Hyatt Convention Center',
      address: 'Bandra Kurla Complex Vicinity, Santacruz East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0805,
      longitude: 72.8530,
    },
    ticketTypes: [
      {
        id: 'tkt-fsh-standard',
        name: 'Runway Viewer Pass',
        description: 'Access to runway rows 4-8 and exhibition lounge.',
        price: 1899,
        quantity: 200,
        remainingQuantity: 114,
        minPerOrder: 1,
        maxPerOrder: 4,
        category: 'General',
      },
      {
        id: 'tkt-fsh-front',
        name: 'Front-Row VIP Pass',
        description: 'Row 1 front row seating, gift hamper, and after-party networking invite.',
        price: 4999,
        quantity: 50,
        remainingQuantity: 16,
        minPerOrder: 1,
        maxPerOrder: 2,
        category: 'VIP',
      },
    ],
  },
  {
    id: 'evt-matrimony-01',
    title: 'Maharashtra Parinay Grand Matrimony Meet & Sammelan',
    slug: 'maharashtra-parinay-matrimony-meet-2026',
    shortDescription: 'Dignified community matchmaking conclave with verified biodata portfolios, direct family interactions, and counseling booths.',
    description: `
A structured and respectful matchmaking conference facilitating open introductions between prospective brides, grooms, and their families.

### Program Outline
- **Verified Biodata Directory**: Pre-screened background profiles categorized by profession and education.
- **Direct Candidate Introductions**: One-on-one guided conversation rounds in comfortable private lounges.
- **Astrology & Counseling Kiosks**: Complimentary horoscopic consultation and relationship counselors.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-11-22T09:00:00Z',
    endDate: '2026-11-22T18:00:00Z',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    date: '2026-11-22',
    timezone: 'IST',
    featured: false,
    category: mockCategories[9], // Matrimony Committee Meetings
    organization: {
      id: 'org-parinay-trust',
      name: 'Parinay Foundation Trust',
      slug: 'parinay-foundation',
      verified: true,
      contactEmail: 'contact@parinaytrust.org',
    },
    venue: {
      name: 'Yashwantrao Chavan Smruti Bhavan',
      address: 'Kothrud, Paud Road',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.5074,
      longitude: 73.8077,
    },
    ticketTypes: [
      {
        id: 'tkt-matri-candidate',
        name: 'Candidate & Family Registration (Up to 3 Persons)',
        description: 'Complete registration booklet, tea & high lunch buffet, and profile inclusion.',
        price: 1200,
        quantity: 300,
        remainingQuantity: 140,
        minPerOrder: 1,
        maxPerOrder: 1,
        category: 'General',
      },
    ],
  },
  {
    id: 'evt-comedy-01',
    title: 'Puneri Hasya Katta – Stand-up Comedy Special & Open Mic',
    slug: 'puneri-hasya-katta-standup-comedy-pune',
    shortDescription: 'Evening of unfiltered Marathi & Hinglish observational comedy, satirical storytelling, and rising open mic stars.',
    description: `
Prepare for non-stop laughter with Pune's top stand-up comics covering everyday IT life, traffic tales, college drama, and cultural quirks.

### Lineup Highlights
- **Headliners**: 3 veteran TV and YouTube Marathi & Hindi comedians.
- **Rising Stars Open Mic**: 5 handpicked local comedy talents showcasing fresh sets.
- **Chilled Vibe**: Auditorium seating with snack bar and photo booth.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-04T19:00:00Z',
    endDate: '2026-12-04T21:30:00Z',
    startTime: '07:00 PM',
    endTime: '09:30 PM',
    date: '2026-12-04',
    timezone: 'IST',
    featured: true,
    category: mockCategories[10], // Stand-up Comedy
    organization: {
      id: 'org-laugh-factory',
      name: 'Hasya Katta Comedy Club',
      slug: 'hasya-katta-club',
      verified: true,
      contactEmail: 'bookings@hasyakatta.in',
    },
    venue: {
      name: 'Bal Gandharva Ranga Mandir',
      address: 'JM Road, Shivajinagar',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.5246,
      longitude: 73.8507,
    },
    ticketTypes: [
      {
        id: 'tkt-comedy-gen',
        name: 'General Balcony Seating',
        description: 'Auditorium admission with free parking access.',
        price: 349,
        quantity: 450,
        remainingQuantity: 180,
        minPerOrder: 1,
        maxPerOrder: 6,
        category: 'General',
      },
      {
        id: 'tkt-comedy-vip',
        name: 'VIP Front Row Seating',
        description: 'First 5 rows with meet & greet photo session post show.',
        price: 699,
        quantity: 100,
        remainingQuantity: 28,
        minPerOrder: 1,
        maxPerOrder: 4,
        category: 'VIP',
      },
    ],
  },
  {
    id: 'evt-spiritual-01',
    title: 'Ananda Mahotsav: Bhajan, Kirtan & Guided Dhyana Conclave',
    slug: 'ananda-mahotsav-bhajan-kirtan-dhyana-bengaluru',
    shortDescription: 'Devotional musical evening, Vedic chanting, transformative meditation sessions, and spiritual discourses by revered mentors.',
    description: `
Experience tranquility, soul-stirring live bhajans, and inner peace in this serene spiritual gathering.

### Sacred Activities
- **Live Kirtan & Harmonium Choir**: Traditional ragas and community call-and-response singing.
- **Guided Mindfulness Dhyana**: 45-minute deep meditation technique for stress relief.
- **Maha Mahaprasad**: Wholesome satvik sanctified dinner served to all attendees.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-19T16:30:00Z',
    endDate: '2026-12-19T21:00:00Z',
    startTime: '04:30 PM',
    endTime: '09:00 PM',
    date: '2026-12-19',
    timezone: 'IST',
    featured: false,
    category: mockCategories[11], // Spiritual Events
    organization: {
      id: 'org-ananda-seva',
      name: 'Sanatana Peace & Seva Foundation',
      slug: 'sanatana-peace-seva',
      verified: true,
      contactEmail: 'seva@sanatanatrust.org',
    },
    venue: {
      name: 'Art of Living International Center',
      address: 'Kanakapura Road, Udayapura',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.8398,
      longitude: 77.5147,
    },
    ticketTypes: [
      {
        id: 'tkt-spirit-free',
        name: 'Complimentary Satsang Pass',
        description: 'Free entry pass including Mahaprasad meal coupon.',
        price: 0,
        quantity: 1000,
        remainingQuantity: 412,
        minPerOrder: 1,
        maxPerOrder: 5,
        category: 'General',
        isComplimentary: true,
      },
      {
        id: 'tkt-spirit-donor',
        name: 'Seva Donor Pass',
        description: 'Reserved front seating with Vedic blessing shawl.',
        price: 501,
        quantity: 200,
        remainingQuantity: 86,
        minPerOrder: 1,
        maxPerOrder: 4,
        category: 'VIP',
      },
    ],
  },
  {
    id: 'evt-sports-01',
    title: 'Hyderabad Corporate Box-Cricket & Turf Championship',
    slug: 'hyderabad-corporate-box-cricket-championship',
    shortDescription: 'Fast-paced 6-a-side tennis ball corporate cricket tournament with live scoring, medals, and ₹1,00,000 cash prizes.',
    description: `
Assemble your company squad and battle for glory at Hyderabad's premier corporate cricket tournament.

### Tournament Features
- **Matches Under Floodlights**: 8-over league format on FIFA-grade international artificial turf.
- **Live Video Streaming**: Multi-camera digital broadcast with real-time ball-by-ball commentary.
- **Prizes & Trophies**: Championship trophy, runners-up cup, best batsman & bowler awards.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-13T08:00:00Z',
    endDate: '2026-12-13T20:00:00Z',
    startTime: '08:00 AM',
    endTime: '08:00 PM',
    date: '2026-12-13',
    timezone: 'IST',
    featured: true,
    category: mockCategories[12], // Sports Events
    organization: {
      id: 'org-arena-sports',
      name: 'Deccan Sports & Turf League',
      slug: 'deccan-sports-turf',
      verified: true,
      contactEmail: 'tournaments@deccansports.in',
    },
    venue: {
      name: 'HotFut Arena Sports Complex',
      address: 'Gachibowli Stadium Road',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      latitude: 17.4435,
      longitude: 78.3489,
    },
    ticketTypes: [
      {
        id: 'tkt-sports-team',
        name: 'Full Team Registration (8 Players)',
        description: 'Includes tournament jersey kit, energy drinks, match balls, and lunch.',
        price: 3999,
        quantity: 32,
        remainingQuantity: 11,
        minPerOrder: 1,
        maxPerOrder: 1,
        category: 'Corporate',
      },
      {
        id: 'tkt-sports-spectator',
        name: 'Spectator Fan Pass',
        description: 'Grandstand spectator seat with refreshments coupon.',
        price: 99,
        quantity: 300,
        remainingQuantity: 215,
        minPerOrder: 1,
        maxPerOrder: 6,
        category: 'General',
      },
    ],
  },
  {
    id: 'evt-food-01',
    title: 'The Great Indian Street Food & Craft Brew Festival',
    slug: 'great-indian-street-food-craft-brew-festival-bengaluru',
    shortDescription: 'Epic culinary festival with 80+ street food stalls from 18 states, artisanal desserts, and live music performances.',
    description: `
Celebrate the rich tapestry of Indian regional gastronomy from spicy Kolhapuri misal and Lucknowi kebabs to Kolkata kathi rolls and craft desserts.

### Festival Highlights
- **80+ Authentic Food Kiosks**: Curated street chefs and gourmet culinary masters.
- **Live Cooking Masterclasses**: Interactive cook-offs and chef tastings.
- **Acoustic Sunset Stage**: Live indie bands playing soul tunes while you dine.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-06T12:00:00Z',
    endDate: '2026-12-06T23:00:00Z',
    startTime: '12:00 PM',
    endTime: '11:00 PM',
    date: '2026-12-06',
    timezone: 'IST',
    featured: true,
    category: mockCategories[13], // Food Events
    organization: {
      id: 'org-foodies-guild',
      name: 'Bengaluru Food Crawlers Guild',
      slug: 'bengaluru-food-crawlers',
      verified: true,
      contactEmail: 'festivals@foodcrawlers.in',
    },
    venue: {
      name: 'Jaymahal Palace Gardens',
      address: 'Near Cantonment Railway Station, Jayamahal',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.9972,
      longitude: 77.5968,
    },
    ticketTypes: [
      {
        id: 'tkt-food-tasting',
        name: 'Single Entry + ₹200 Tasting Coupons',
        description: 'Admission to festival grounds with instant food tokens.',
        price: 299,
        quantity: 1500,
        remainingQuantity: 640,
        minPerOrder: 1,
        maxPerOrder: 8,
        category: 'General',
      },
    ],
  },
  {
    id: 'evt-charity-01',
    title: 'Hope For Tomorrow: Mega Blood Donation & Wellness Drive',
    slug: 'hope-for-tomorrow-mega-blood-donation-drive-delhi',
    shortDescription: 'Community social impact initiative featuring voluntary blood donation, free health screenings, and CPR awareness workshops.',
    description: `
Give the gift of life. Partnering with certified government blood banks and leading hospitals to support critical surgery patients and pediatric needs.

### Drive Features
- **Certified Safe Environment**: 10 medical stations with licensed doctors and sterile equipment.
- **Complimentary Health Checks**: Free Hb, blood pressure, sugar, and BMI screening for all donors.
- **Donor Certificate & Care Kit**: Verified digital donor card and nutrition care pack.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-11-29T08:30:00Z',
    endDate: '2026-11-29T17:00:00Z',
    startTime: '08:30 AM',
    endTime: '05:00 PM',
    date: '2026-11-29',
    timezone: 'IST',
    featured: false,
    category: mockCategories[14], // Social & Charity Events
    organization: {
      id: 'org-redcross-partner',
      name: 'Yuva Seva Social Foundation',
      slug: 'yuva-seva-foundation',
      verified: true,
      contactEmail: 'contact@yuvaseva.org',
    },
    venue: {
      name: 'Talkatora Indoor Stadium Annexe',
      address: 'Presidential Estate, Talkatora Garden',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      latitude: 28.6210,
      longitude: 77.1950,
    },
    ticketTypes: [
      {
        id: 'tkt-donor-reg',
        name: 'Volunteer Blood Donor Registration',
        description: 'Complimentary donor slot reservation with wellness pack and badge.',
        price: 0,
        quantity: 800,
        remainingQuantity: 410,
        minPerOrder: 1,
        maxPerOrder: 2,
        category: 'General',
        isComplimentary: true,
      },
    ],
  },
  {
    id: 'evt-shopping-01',
    title: 'Dastkar Crafts & Flea Market Winter Carnival 2026',
    slug: 'dastkar-crafts-flea-market-winter-carnival-mumbai',
    shortDescription: 'Over 120+ authentic stalls featuring handmade ceramics, Khadi wear, vintage decor, artisan jewelry, and live pottery workshops.',
    description: `
Explore India's vibrant handcrafted traditions. Meet master weavers, potters, and boutique creators in an open-air carnival setting.

### Carnival Highlights
- **120+ Curated Stalls**: Sustainable apparel, brassware, handmade soaps, handloom sarees, and quirky accessories.
- **Hands-on Clay Workshops**: Free pottery wheel sessions guided by master artisans.
- **Live Acoustic Music & Cafe**: Cozy artisan coffee and snacks under fairy lights.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-18T11:00:00Z',
    endDate: '2026-12-20T21:00:00Z',
    startTime: '11:00 AM',
    endTime: '09:00 PM',
    date: '2026-12-18',
    timezone: 'IST',
    featured: true,
    category: mockCategories[15], // Shopping & Exhibitions
    organization: {
      id: 'org-crafts-council',
      name: 'Heritage Artisan Guild',
      slug: 'heritage-artisan-guild',
      verified: true,
      contactEmail: 'stalls@heritageguild.in',
    },
    venue: {
      name: 'MMRDA Exhibition Grounds',
      address: 'Bandra Kurla Complex (BKC)',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0660,
      longitude: 72.8680,
    },
    ticketTypes: [
      {
        id: 'tkt-flea-day',
        name: 'Single Day Entry Pass',
        description: 'Full day flea market entry with complimentary cotton tote bag.',
        price: 149,
        quantity: 2000,
        remainingQuantity: 1120,
        minPerOrder: 1,
        maxPerOrder: 6,
        category: 'General',
      },
    ],
  },
  {
    id: 'evt-family-01',
    title: 'Little Innovators: STEM & Robotics Family Fun Fest',
    slug: 'little-innovators-stem-robotics-family-fun-fest',
    shortDescription: 'Hands-on weekend learning carnival for kids aged 5-14 with LEGO robotics, drone arenas, science magic shows, and family games.',
    description: `
Spark curiosity in young minds. An unforgettable interactive weekend where children discover coding, rocket physics, and robotics through fun games.

### Activity Zones
- **Robotics Arena**: Build and drive mini rover bots on simulated lunar tracks.
- **Science Magic Theater**: Explosive, colorful, and completely safe physics & chemistry stage experiments.
- **Parents & Kids Coding Jam**: Easy drag-and-drop game design workshops for families.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-11-21T10:00:00Z',
    endDate: '2026-11-22T18:00:00Z',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    date: '2026-11-21',
    timezone: 'IST',
    featured: false,
    category: mockCategories[16], // Family & Kids Events
    organization: {
      id: 'org-stem-academy',
      name: 'Young Explorers STEM Academy',
      slug: 'young-explorers-stem',
      verified: true,
      contactEmail: 'info@youngexplorers.org',
    },
    venue: {
      name: 'Nehru Science Centre Grounds',
      address: 'Dr. E. Moses Road, Worli',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0163,
      longitude: 72.8228,
    },
    ticketTypes: [
      {
        id: 'tkt-kid-parent',
        name: '1 Child + 1 Parent Duo Pass',
        description: 'Includes entry to all 6 STEM workshops, science kit, and theater shows.',
        price: 799,
        quantity: 350,
        remainingQuantity: 164,
        minPerOrder: 1,
        maxPerOrder: 3,
        category: 'General',
      },
    ],
  },
  {
    id: 'evt-wedding-01',
    title: 'The Royal Wedding & Bridal Expo 2026',
    slug: 'the-royal-wedding-bridal-expo-2026-mumbai',
    shortDescription: 'Luxury wedding planning expo with 100+ celebrity bridal designers, luxury jewelry houses, destination decor leads, and invitation suites.',
    description: `
Plan your dream wedding under one roof. Meet top wedding planners, destination venue managers, trousseau curators, and photographers.

### Expo Features
- **Bridal Trousseau & Haute Couture**: Exclusive runway reveals of upcoming bridal fashion trends.
- **Destination Wedding Pavilion**: Top heritage palaces from Udaipur, Goa, and Jaipur offering exclusive booking packages.
- **Tasting Lounge**: Sample curated wedding catering menus and designer wedding cakes.
    `,
    bannerUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-19T10:30:00Z',
    endDate: '2026-12-21T20:00:00Z',
    startTime: '10:30 AM',
    endTime: '08:00 PM',
    date: '2026-12-19',
    timezone: 'IST',
    featured: true,
    category: mockCategories[17], // Wedding Events
    organization: {
      id: 'org-wedding-guild',
      name: 'Elite Wedding Concierge Network',
      slug: 'elite-wedding-concierge',
      verified: true,
      contactEmail: 'expo@eliteweddings.in',
    },
    venue: {
      name: 'Jio World Convention Centre',
      address: 'G Block, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0620,
      longitude: 72.8680,
    },
    ticketTypes: [
      {
        id: 'tkt-bridal-couple',
        name: 'Couple Bridal Pass',
        description: 'VIP admission for bride & groom + complimentary Wedding Planning Lookbook.',
        price: 499,
        quantity: 600,
        remainingQuantity: 280,
        minPerOrder: 1,
        maxPerOrder: 2,
        category: 'General',
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

// In-memory global store to keep newly published and edited events across requests
const globalDataStore = globalThis as unknown as {
  __epay_events__?: EventItem[];
  __epay_edited_events__?: Record<string, EventItem>;
};

if (!globalDataStore.__epay_events__) {
  globalDataStore.__epay_events__ = [...mockEvents];
}
if (!globalDataStore.__epay_edited_events__) {
  globalDataStore.__epay_edited_events__ = {};
}

export const LOCAL_STORAGE_EVENTS_KEY = 'epay_persisted_events';

export function getAllEvents(): EventItem[] {
  if (!globalDataStore.__epay_events__) {
    globalDataStore.__epay_events__ = [...mockEvents];
  }
  const events = [...globalDataStore.__epay_events__];
  if (globalDataStore.__epay_edited_events__) {
    for (let i = 0; i < events.length; i++) {
      const edited = globalDataStore.__epay_edited_events__[events[i].id] || globalDataStore.__epay_edited_events__[events[i].slug];
      if (edited) {
        events[i] = { ...events[i], ...edited };
      }
    }
  }
  return events;
}

export function recordEditedEvent(event: EventItem): EventItem {
  if (!globalDataStore.__epay_edited_events__) {
    globalDataStore.__epay_edited_events__ = {};
  }
  globalDataStore.__epay_edited_events__[event.id] = event;
  globalDataStore.__epay_edited_events__[event.slug] = event;

  addPublishedEvent(event);
  return event;
}

export function getEditedEvent(idOrSlug: string): EventItem | null {
  if (!idOrSlug) return null;
  const norm = idOrSlug.toLowerCase().trim();

  // 1. Check in-memory store
  if (globalDataStore.__epay_edited_events__) {
    if (globalDataStore.__epay_edited_events__[idOrSlug]) return globalDataStore.__epay_edited_events__[idOrSlug];
    if (globalDataStore.__epay_edited_events__[norm]) return globalDataStore.__epay_edited_events__[norm];
    const found = Object.values(globalDataStore.__epay_edited_events__).find(e => 
      (e.id && e.id.toLowerCase() === norm) || 
      (e.slug && e.slug.toLowerCase() === norm) ||
      (e.title && e.title.toLowerCase() === norm)
    );
    if (found) return found;
  }

  // 2. Check localStorage in browser context
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
      if (raw) {
        const map = JSON.parse(raw);
        if (typeof map === 'object' && map !== null) {
          if (map[idOrSlug]) return map[idOrSlug];
          if (map[norm]) return map[norm];
          const foundLocal = Object.values(map).find((e: any) => 
            (e?.id && String(e.id).toLowerCase() === norm) || 
            (e?.slug && String(e.slug).toLowerCase() === norm) ||
            (e?.title && String(e.title).toLowerCase() === norm)
          );
          if (foundLocal) return foundLocal as EventItem;
        }
      }
    } catch {}
  }

  return null;
}

export function saveLocalPersistedEvent(event: EventItem): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    if (event.id) map[event.id] = event;
    if (event.slug) map[event.slug] = event;
    localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[data.ts] Failed to save event to localStorage:', e);
  }
}

export function getLocalPersistedEvent(idOrSlug: string): EventItem | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[idOrSlug] || null;
  } catch {
    return null;
  }
}

export function getAllLocalPersistedEvents(): Record<string, EventItem> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function addPublishedEvent(event: EventItem): EventItem {
  const current = globalDataStore.__epay_events__ || [...mockEvents];
  const idx = current.findIndex(e => e.id === event.id || e.slug === event.slug);
  if (idx >= 0) {
    current[idx] = event;
  } else {
    current.unshift(event);
  }
  globalDataStore.__epay_events__ = current;
  return event;
}

export async function getEvents(filters?: { query?: string; category?: string; location?: string; eventType?: string; price?: string }): Promise<EventItem[]> {
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

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const all = getAllEvents();
  return all.find(e => e.slug === slug) || all[0] || null;
}
