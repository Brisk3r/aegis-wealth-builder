import { NextRequest, NextResponse } from 'next/server';

// Server-side in-memory real-time sync store for multi-device care coordination
// Connects Phones, Tablets, and PCs across the local network instantly.

interface ServerSyncEvent {
  id: string;
  type: string;
  podId?: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  payload?: any;
}

interface CareServerState {
  events: ServerSyncEvent[];
  lastEventId: number;
  podStates: Record<string, {
    logs: any[];
    medications: any[];
    podData?: any;
    updatedAt: number;
  }>;
}

// Global server memory singleton that persists across API invocations in development
const globalForSync = global as unknown as {
  __careServerState?: CareServerState;
};

if (!globalForSync.__careServerState) {
  globalForSync.__careServerState = {
    events: [],
    lastEventId: 0,
    podStates: {},
  };
}

const state = globalForSync.__careServerState;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const since = parseInt(searchParams.get('since') || '0', 10);
  const clientId = searchParams.get('clientId') || '';
  const full = searchParams.get('full') === 'true';
  const podId = searchParams.get('podId');

  // Return full state for initialization / cold start on a new phone
  if (full) {
    return NextResponse.json({
      status: 'online',
      serverTime: Date.now(),
      podStates: state.podStates,
      recentEvents: state.events.slice(-50),
    });
  }

  // Filter events that happened strictly after `since` and not created by this clientId
  const newEvents = state.events.filter(
    (e) => e.timestamp > since && e.senderId !== clientId
  );

  return NextResponse.json({
    status: 'online',
    serverTime: Date.now(),
    events: newEvents,
    count: newEvents.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, log, medication, podUpdate, podId } = body;

    const targetPodId = podId || event?.podId || 'pod-margaret-smith';
    const now = Date.now();

    if (!state.podStates[targetPodId]) {
      state.podStates[targetPodId] = {
        logs: [],
        medications: [],
        updatedAt: now,
      };
    }

    const podState = state.podStates[targetPodId];

    // If a new care log is submitted
    if (log) {
      // De-duplicate by id
      const existingIdx = podState.logs.findIndex((l) => l.id === log.id);
      if (existingIdx >= 0) {
        podState.logs[existingIdx] = log;
      } else {
        podState.logs.unshift(log);
      }
      podState.updatedAt = now;
    }

    // If medication state is updated
    if (medication) {
      const existingMedIdx = podState.medications.findIndex((m) => m.id === medication.id);
      if (existingMedIdx >= 0) {
        podState.medications[existingMedIdx] = medication;
      } else {
        podState.medications.push(medication);
      }
      podState.updatedAt = now;
    }

    // If full pod configuration is updated
    if (podUpdate) {
      podState.podData = { ...(podState.podData || {}), ...podUpdate };
      podState.updatedAt = now;
    }

    // Record the real-time sync event
    if (event) {
      state.lastEventId += 1;
      const syncEvent: ServerSyncEvent = {
        id: `ev_${state.lastEventId}_${now}`,
        type: event.type || 'SYNC_UPDATE',
        podId: targetPodId,
        senderId: event.senderId || 'unknown_client',
        senderName: event.senderName || 'Care Team Member',
        timestamp: event.timestamp || now,
        payload: event.payload || { log, medication, podUpdate },
      };

      state.events.push(syncEvent);

      // Keep event history capped at latest 500 events
      if (state.events.length > 500) {
        state.events = state.events.slice(-500);
      }

      return NextResponse.json({
        success: true,
        eventId: syncEvent.id,
        serverTime: now,
        event: syncEvent,
      });
    }

    return NextResponse.json({
      success: true,
      serverTime: now,
      podId: targetPodId,
    });
  } catch (err: any) {
    console.error('Palliative Sync API Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process sync payload' },
      { status: 500 }
    );
  }
}
