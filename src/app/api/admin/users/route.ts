import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAllOrders, getAllRegistrations } from '@/lib/repositories/orderRepository';

export const dynamic = 'force-dynamic';

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: 'attendee' | 'organizer' | 'admin';
  phone?: string;
  status: 'active' | 'suspended';
  verified: boolean;
  totalOrders: number;
  totalSpent: number;
  eventsHosted: number;
  joinedAt: string;
}

// In-memory mock users storage for demonstration & SSR fallbacks
const initialUsers: AdminUserRecord[] = [
  {
    id: 'USR-ADMIN-01',
    email: 'admin@epayevents.com',
    name: 'Super Administrator',
    role: 'admin',
    phone: '+91 98765 00001',
    status: 'active',
    verified: true,
    totalOrders: 14,
    totalSpent: 42800,
    eventsHosted: 6,
    joinedAt: '2026-06-01',
  },
  {
    id: 'USR-ORG-101',
    email: 'organizer@epayevents.com',
    name: 'Rajesh Malhotra',
    role: 'organizer',
    phone: '+91 98765 43210',
    status: 'active',
    verified: true,
    totalOrders: 5,
    totalSpent: 12500,
    eventsHosted: 4,
    joinedAt: '2026-07-15',
  },
  {
    id: 'USR-ORG-102',
    email: 'priya@neural.ai',
    name: 'Priya Nambiar',
    role: 'organizer',
    phone: '+91 98765 11223',
    status: 'active',
    verified: true,
    totalOrders: 2,
    totalSpent: 4998,
    eventsHosted: 3,
    joinedAt: '2026-08-10',
  },
  {
    id: 'USR-ATT-201',
    email: 'attendee@epayevents.com',
    name: 'Rohit Kulkarni',
    role: 'attendee',
    phone: '+91 91234 56789',
    status: 'active',
    verified: false,
    totalOrders: 3,
    totalSpent: 7497,
    eventsHosted: 0,
    joinedAt: '2026-09-01',
  },
  {
    id: 'USR-ATT-202',
    email: 'ananya.iyer@gmail.com',
    name: 'Ananya Iyer',
    role: 'attendee',
    phone: '+91 98888 22114',
    status: 'active',
    verified: false,
    totalOrders: 2,
    totalSpent: 3998,
    eventsHosted: 0,
    joinedAt: '2026-09-18',
  },
  {
    id: 'USR-ORG-103',
    email: 'vikram@quantum.io',
    name: 'Vikram Joshi',
    role: 'organizer',
    phone: '+91 97777 44332',
    status: 'suspended',
    verified: false,
    totalOrders: 1,
    totalSpent: 999,
    eventsHosted: 1,
    joinedAt: '2026-06-15',
  },
];

const globalStore = globalThis as unknown as {
  __epay_admin_users__?: AdminUserRecord[];
};

if (!globalStore.__epay_admin_users__) {
  globalStore.__epay_admin_users__ = [...initialUsers];
}

/**
 * GET /api/admin/users
 * Returns list of platform users merged with live order data.
 */
export async function GET(request: NextRequest) {
  try {
    const list = [...(globalStore.__epay_admin_users__ || initialUsers)];

    // Dynamically augment with buyers from confirmed orders
    try {
      const orders = await getAllOrders();
      orders.forEach(o => {
        if (!o.buyerEmail) return;
        const existing = list.find(u => u.email.toLowerCase() === o.buyerEmail.toLowerCase());
        if (existing) {
          existing.totalOrders = (existing.totalOrders || 0) + 1;
          existing.totalSpent = (existing.totalSpent || 0) + (Number(o.total) || 0);
        } else {
          list.push({
            id: `USR-${Math.abs(o.buyerEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)).toString(16).toUpperCase()}`,
            email: o.buyerEmail,
            name: o.buyerName || o.buyerEmail.split('@')[0],
            role: 'attendee',
            phone: o.buyerPhone,
            status: 'active',
            verified: false,
            totalOrders: 1,
            totalSpent: Number(o.total) || 0,
            eventsHosted: 0,
            joinedAt: o.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          });
        }
      });
    } catch (e) {
      console.warn('[AdminUsers API] Error merging orders into users:', e);
    }

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (err: any) {
    console.error('[AdminUsers API GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users
 * Updates a user's role (attendee/organizer/admin), status (active/suspended), or verification status.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, role, status, verified } = body;

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'User id or email is required' },
        { status: 400 }
      );
    }

    const list = globalStore.__epay_admin_users__ || initialUsers;
    const userIndex = list.findIndex(u => (id && u.id === id) || (email && u.email.toLowerCase() === email.toLowerCase()));

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (role) list[userIndex].role = role;
    if (status) list[userIndex].status = status;
    if (verified !== undefined) list[userIndex].verified = Boolean(verified);

    globalStore.__epay_admin_users__ = list;

    console.log(`[AdminUsers API PUT] Updated user ${list[userIndex].email} -> role: ${list[userIndex].role}, status: ${list[userIndex].status}`);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: list[userIndex],
    });
  } catch (err: any) {
    console.error('[AdminUsers API PUT] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

