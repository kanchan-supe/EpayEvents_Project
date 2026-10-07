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
    },
    venue: {
      name: 'International Tech Convention Center',
      address: 'Plot 42, Cyber City, BKC',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
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
        id: 'tkt-101',
        name: 'General Pass',
        description: 'Full 2-day pass for all talks, tech track, lunch, and coffee breaks.',
        price: 2499,
        quantity: 500,
        remainingQuantity: 142,
        minPerOrder: 1,
        maxPerOrder: 5,
      },
      {
        id: 'tkt-102',
        name: 'VIP Developer Pass',
        description: 'General Pass + VIP workshop access, speaker dinner, and fast-track entry.',
        price: 5999,
        quantity: 100,
        remainingQuantity: 18,
        minPerOrder: 1,
        maxPerOrder: 3,
      },
      {
        id: 'tkt-103',
        name: 'Virtual Stream Pass',
        description: 'Watch all main stage talks live online from anywhere.',
        price: 0,
        quantity: 2000,
        remainingQuantity: 1540,
        minPerOrder: 1,
        maxPerOrder: 1,
      },
    ],
    speakers: [
      { 
        name: 'Rajesh Malhotra', 
        role: 'VP of Engineering', 
        company: 'ePay Digital', 
        avatar: '/speakers/speaker1.jpg',
        bio: 'Rajesh heads backend systems at ePay. He loves high-concurrency systems, Go, and building low-latency payment rails.',
      },
      { 
        name: 'Sarah Jenkins', 
        role: 'Head of Product', 
        company: 'Stripe Asia', 
        avatar: '/speakers/speaker2.jpg',
        bio: 'Sarah leads open banking API products across Asia. She focuses on clean developer docs and seamless checkout flows.',
      },
      { 
        name: 'Dr. Vikram Sethi', 
        role: 'Senior System Architect', 
        company: 'FinPulse Labs', 
        avatar: '/speakers/speaker3.jpg',
        bio: 'Vikram works on high-throughput microservices and automated fraud detection for enterprise payment gateways.',
      },
      { 
        name: 'Aarav Sharma', 
        role: 'Co-Founder & CTO', 
        company: 'DevFlow Systems', 
        avatar: '/speakers/speaker4.jpg',
        bio: 'Aarav is a startup founder and open-source contributor building real-time event-driven architectures.',
      },
    ],
    agenda: [
      { time: '09:00 AM - 10:00 AM', title: 'Badge Check-in & Morning Coffee', description: 'Grab your badge, check in with QR, and get coffee.' },
      { time: '10:00 AM - 11:30 AM', title: 'Keynote: Scaling Payment Infrastructure to 100k TPS', description: 'Practical lessons from handling high-volume payment spikes.', speaker: 'Rajesh Malhotra' },
      { time: '11:45 AM - 01:00 PM', title: 'Panel: Designing APIs Developers Actually Enjoy Using', description: 'Interactive panel with Sarah, Vikram, and Aarav.', speaker: 'Sarah, Vikram & Aarav' },
    ],
    faqs: [
      { question: 'When do I get my ticket after paying?', answer: 'Immediately! Your QR pass is shown right on screen and sent to your email as a PDF.' },
      { question: 'Can I get a refund if my plans change?', answer: 'Sure. Cancel up to 7 days before the event and we will refund your ticket.' },
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
    facilities: [
      { icon: 'Cpu', title: '$250,000 GPU Cloud Credits', description: 'Free H100 and A100 GPU compute access for all hackathon teams.' },
      { icon: 'Coffee', title: '24/7 Hacker Energy Stations', description: 'Overnight energy drinks, snacks, pizza, and breakfast catering.' },
      { icon: 'Moon', title: 'Overnight Sleeping Lounges', description: 'Dedicated quiet sleeping pods and shower facilities on campus.' },
      { icon: 'Award', title: '$25,000 Cash Prizes', description: 'Direct cash prizes across 5 tracks: LLMs, Agents, Vision, Healthcare & FinTech.' },
    ],
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
      {
        id: 'tkt-202',
        name: 'Demo Day Visitor Pass',
        description: 'Access to main auditorium for finalist presentations and networking.',
        price: 0,
        quantity: 200,
        remainingQuantity: 80,
        minPerOrder: 1,
        maxPerOrder: 2,
      },
    ],
    speakers: [
      { 
        name: 'Dr. Priya Nambiar', 
        role: 'Lead AI Scientist', 
        company: 'Neural Systems', 
        avatar: '/speakers/speaker2.jpg',
        bio: 'Priya leads AI research in autonomous multimodal agents and LLM optimization.',
      },
      { 
        name: 'Aarav Sharma', 
        role: 'CTO', 
        company: 'DevFlow Systems', 
        avatar: '/speakers/speaker4.jpg',
        bio: 'Aarav advises hackers on agentic architecture and scalable vector database design.',
      },
    ],
  },
  {
    id: 'evt-103',
    title: 'Design Systems & UI Architecture Workshop',
    slug: 'design-systems-workshop',
    shortDescription: 'Master modern Tailwind CSS, shadcn/ui, design tokens, and scalable React component libraries.',
    description: 'A comprehensive 1-day masterclass taught by leading Frontend Architects on building production-ready UI toolkits.',
    bannerUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1400&q=80',
    eventType: 'online',
    status: 'published',
    startDate: '2026-12-05T10:00:00Z',
    endDate: '2026-12-05T17:00:00Z',
    timezone: 'IST',
    featured: false,
    category: mockCategories[3],
    organization: {
      id: 'org-3',
      name: 'UX Craft Academy',
      slug: 'ux-craft',
      verified: true,
      contactEmail: 'hello@uxcraft.org',
    },
    venue: {
      name: 'Online Zoom Workshop',
      address: 'Virtual Interactive Room',
      city: 'Online',
      country: 'Global',
      onlineUrl: 'https://zoom.us/j/epay-design-systems',
    },
    ticketTypes: [
      {
        id: 'tkt-301',
        name: 'Live Ticket + Code Repository Access',
        description: 'Includes full workshop access, exercise repos, Figma UI kit, and certificate.',
        price: 1299,
        quantity: 100,
        remainingQuantity: 28,
        minPerOrder: 1,
        maxPerOrder: 2,
      },
    ],
    speakers: [
      { 
        name: 'Sarah Jenkins', 
        role: 'Design System Architect', 
        company: 'UX Craft', 
        avatar: '/speakers/speaker2.jpg',
        bio: 'Sarah teaches component architecture, accessibility, and design tokens for web apps.',
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
    facilities: [
      { icon: 'Music', title: 'Acoustic Surround Sound Stage', description: 'State-of-the-art Bose spatial audio setup.' },
      { icon: 'Utensils', title: 'Artisan Food & Craft Beer Stalls', description: '12+ curated gourmet food trucks and craft brew bars.' },
      { icon: 'Sun', title: 'Open-Air Amphitheater Seating', description: 'Comfortable lawn cushions & VIP lounge seating.' },
    ],
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
    speakers: [
      { 
        name: 'Rajesh Malhotra', 
        role: 'Lead Acoustic Vocalist', 
        company: 'Soundwave Collective', 
        avatar: '/speakers/speaker1.jpg',
        bio: 'Singer-songwriter performing soul acoustic tracks.',
      },
    ],
  },
  {
    id: 'evt-105',
    title: 'Web3 & Decentralized Commerce Summit 2026',
    slug: 'web3-decentralized-commerce-summit-2026',
    shortDescription: 'Explore micro-payments, smart contract auditing, zero-knowledge proofs, and decentralized merchant gateways.',
    description: 'A 2-day technical gathering for blockchain engineers, protocol designers, and Web3 startup founders.',
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    eventType: 'physical',
    status: 'published',
    startDate: '2026-12-18T09:30:00Z',
    endDate: '2026-12-19T18:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[0],
    organization: {
      id: 'org-5',
      name: 'ChainLabs Network',
      slug: 'chainlabs',
      contactEmail: 'contact@chainlabs.io',
    },
    venue: {
      name: 'Leela Palace Grand Ballroom',
      address: 'Diplomatic Enclave, Chanakyapuri',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-501',
        name: 'Conference Pass',
        description: 'Full access to developer track keynotes, networking lounge, and swag.',
        price: 3499,
        quantity: 250,
        remainingQuantity: 64,
        minPerOrder: 1,
        maxPerOrder: 4,
      },
    ],
    speakers: [
      { 
        name: 'Dr. Vikram Sethi', 
        role: 'Protocol Auditor', 
        company: 'ChainLabs', 
        avatar: '/speakers/speaker3.jpg',
        bio: 'Vikram specializes in smart contract security auditing and ZK cryptography.',
      },
    ],
  },
  {
    id: 'evt-106',
    title: 'Startup Founders & Angel Investors Pitch Fest',
    slug: 'startup-founders-angel-investors-pitch-fest',
    shortDescription: '50 curated early-stage startups pitching live to 100+ active angel investors and VC partners.',
    description: 'Connect directly with early-stage investors, seed funds, and incubators looking for high-growth tech ventures.',
    bannerUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
    eventType: 'hybrid',
    status: 'published',
    startDate: '2027-01-10T10:00:00Z',
    endDate: '2027-01-10T17:00:00Z',
    timezone: 'IST',
    featured: true,
    category: mockCategories[1],
    organization: {
      id: 'org-6',
      name: 'Venture Catalyst Network',
      slug: 'venture-catalyst',
      contactEmail: 'pitch@venturecatalyst.in',
    },
    venue: {
      name: 'WeWork Galaxy Auditorium',
      address: '43 Residency Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
    },
    ticketTypes: [
      {
        id: 'tkt-601',
        name: 'Founder Pitch Ticket',
        description: 'Includes 3-minute pitch slot on main stage + 1-on-1 VC office hours.',
        price: 4999,
        quantity: 50,
        remainingQuantity: 9,
        minPerOrder: 1,
        maxPerOrder: 1,
      },
    ],
    speakers: [
      { 
        name: 'Aarav Sharma', 
        role: 'Angel Investor', 
        company: 'Venture Catalyst', 
        avatar: '/speakers/speaker4.jpg',
        bio: 'Active angel investor in developer tools, fintech, and AI startups.',
      },
    ],
  },
];

export async function getEvents(filters?: { query?: string; category?: string; location?: string; eventType?: string; price?: string }) {
  let list = [...mockEvents];

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
  return mockEvents.find(e => e.slug === slug) || mockEvents[0];
}
