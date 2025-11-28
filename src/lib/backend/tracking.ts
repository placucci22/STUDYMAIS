/**
 * Tracking System (Web Version)
 * Gerencia a captura, persistência local (localStorage) e sincronização de eventos analíticos.
 */

const STORAGE_KEY = 'cognitive_events';
const SYNC_ENDPOINT = 'https://api.cognitive-os.app/v1/events'; // Mock

interface AnalyticsEvent {
    id: string;
    event: string;
    payload: any;
    timestamp: string;
    synced: boolean;
}

// Queue in memory to avoid constant storage writes (batching)
let eventQueue: AnalyticsEvent[] = [];
const BATCH_SIZE = 5;
const FLUSH_INTERVAL = 5000; // 5s

function loadEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveEvents(events: AnalyticsEvent[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/**
 * Registra um evento no sistema.
 * @param {string} eventName - Nome do evento (ex: 'ingest_start')
 * @param {Object} payload - Dados contextuais
 */
export async function track_event(eventName: string, payload: any = {}) {
    const event: AnalyticsEvent = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        event: eventName,
        payload,
        timestamp: new Date().toISOString(),
        synced: false
    };

    console.log(`[TRACKING] ${eventName}`, payload);

    // Add to memory queue
    eventQueue.push(event);

    // Persist immediately for safety
    const allEvents = loadEvents();
    allEvents.push(event);
    saveEvents(allEvents);

    // Trigger Sync Check
    if (eventQueue.length >= BATCH_SIZE) {
        await syncEvents();
    }
}

/**
 * Sincroniza eventos não enviados com o servidor.
 */
export async function syncEvents() {
    const allEvents = loadEvents();
    const unsynced = allEvents.filter(e => !e.synced);

    if (unsynced.length === 0) return;

    console.log(`[SYNC] Syncing ${unsynced.length} events to cloud...`);

    try {
        // Simulate Network Request
        await new Promise(r => setTimeout(r, 1000));

        // Mark as synced
        const syncedEvents = allEvents.map(e => ({ ...e, synced: true }));
        saveEvents(syncedEvents);
        eventQueue = []; // Clear memory queue

        console.log(`[SYNC] Success. All events up to date.`);
    } catch (e: any) {
        console.error(`[SYNC] Failed: ${e.message}`);
    }
}

// Auto-sync interval (Client-side only)
if (typeof window !== 'undefined') {
    setInterval(() => {
        if (eventQueue.length > 0) syncEvents();
    }, FLUSH_INTERVAL);
}
