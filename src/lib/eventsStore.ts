import { EventItem } from './types';
import { mockEvents as defaultMockEvents } from './data';

// Persistent in-memory global store across server API routes and server components
const globalEventsStore = globalThis as unknown as {
  __epay_events_store__?: EventItem[];
};

if (!globalEventsStore.__epay_events_store__) {
  globalEventsStore.__epay_events_store__ = [...defaultMockEvents];
  console.log('[eventsStore] Initialized global in-memory events store with default events');
}

export function getStoredEvents(): EventItem[] {
  if (!globalEventsStore.__epay_events_store__) {
    globalEventsStore.__epay_events_store__ = [...defaultMockEvents];
  }
  return globalEventsStore.__epay_events_store__;
}

export function saveStoredEvents(events: EventItem[]): boolean {
  globalEventsStore.__epay_events_store__ = events;
  console.log(`[eventsStore] Successfully stored ${events.length} events in global memory`);
  return true;
}

export function addEventToStore(event: EventItem): EventItem {
  const currentEvents = getStoredEvents();
  const existingIndex = currentEvents.findIndex(e => e.id === event.id || e.slug === event.slug);
  let updatedList: EventItem[];

  if (existingIndex >= 0) {
    updatedList = [...currentEvents];
    updatedList[existingIndex] = event;
    console.log(`[eventsStore] Updated existing event in store: ${event.slug}`);
  } else {
    // Add to top of array so newly published event appears first
    updatedList = [event, ...currentEvents];
    console.log(`[eventsStore] Added new event to store: ${event.slug} (Total: ${updatedList.length})`);
  }

  saveStoredEvents(updatedList);
  return event;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove non-word characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim leading -
    .replace(/-+$/, ''); // Trim trailing -
}

