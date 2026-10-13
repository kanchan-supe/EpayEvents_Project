import { supabase } from './client';

export interface EventRow {
  id: number | string;
  created_at: string;
  [key: string]: any;
}

/**
 * Fetch all records from the Events table
 */
export async function getEvents(): Promise<{ data: EventRow[] | null; error: any }> {
  const { data, error } = await supabase
    .from('Events')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Insert a new record into the Events table
 */
export async function insertEvent(record?: Partial<EventRow>): Promise<{ data: EventRow | null; error: any }> {
  const payload = record || {};
  const { data, error } = await supabase
    .from('Events')
    .insert([payload])
    .select()
    .single();

  return { data, error };
}

/**
 * Subscribe to realtime updates on Events table
 */
export function subscribeToEvents(onUpdate: (payload: any) => void) {
  const channel = supabase
    .channel('events_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Events' },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Keep backward-compatible aliases
export const getEpayEvents = getEvents;
export const insertEpayEvent = insertEvent;
export const subscribeToEpayEvents = subscribeToEvents;
