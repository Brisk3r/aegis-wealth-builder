// Real-Time Cross-Device & Cross-Tab Synchronization Bus
// Utilizes Web BroadcastChannel for 0ms local tabs + Background Server Polling for Wi-Fi multi-device sync

export type SyncEventType = 
  | 'LOG_ADDED'
  | 'MED_ADMINISTERED'
  | 'POD_SWITCHED'
  | 'THEME_CHANGED'
  | 'CARER_SWITCHED'
  | 'WIDGETS_UPDATED'
  | 'STATE_HYDRATED'
  | 'SYNC_PING';

export interface SyncMessage {
  type: SyncEventType;
  podId?: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  payload?: any;
}

class CareSyncBusService {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(msg: SyncMessage) => void> = [];
  private senderId: string;
  private lastPolledTime: number = Date.now();
  private isPollingActive: boolean = false;
  private pollTimer: any = null;

  constructor() {
    this.senderId = typeof window !== 'undefined' 
      ? `client_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
      : 'server_client';

    if (typeof window !== 'undefined') {
      // 1. Local BroadcastChannel
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel('aegis_care_sync_bus');
          this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
            if (event.data && event.data.senderId !== this.senderId) {
              this.notifyListeners(event.data);
            }
          };
        } catch (e) {
          console.warn('BroadcastChannel initialization error:', e);
        }
      }

      // 2. Storage event fallback for cross-tab sync
      window.addEventListener('storage', (event) => {
        if (event.key === 'aegis_sync_bus_event' && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue) as SyncMessage;
            if (parsed && parsed.senderId !== this.senderId) {
              this.notifyListeners(parsed);
            }
          } catch (e) {
            // ignore
          }
        }
      });

      // 3. Multi-Device Network Polling Loop (Phone <-> PC Sync)
      this.startNetworkPolling();

      // Immediate poll on screen unlock / tab focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.pollServerEvents();
        }
      });
    }
  }

  public getSenderId(): string {
    return this.senderId;
  }

  private startNetworkPolling() {
    if (this.isPollingActive) return;
    this.isPollingActive = true;

    const poll = async () => {
      await this.pollServerEvents();
      if (this.isPollingActive) {
        this.pollTimer = setTimeout(poll, 1200);
      }
    };

    this.pollTimer = setTimeout(poll, 800);
  }

  public async pollServerEvents() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch(
        `/api/palliative/sync?since=${this.lastPolledTime}&clientId=${encodeURIComponent(this.senderId)}`,
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.serverTime) {
        this.lastPolledTime = data.serverTime;
      }
      if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        for (const ev of data.events) {
          const msg: SyncMessage = {
            type: ev.type as SyncEventType,
            podId: ev.podId,
            senderId: ev.senderId,
            senderName: ev.senderName,
            timestamp: ev.timestamp,
            payload: ev.payload,
          };
          this.notifyListeners(msg);
        }
      }
    } catch {
      // Network retry on next tick
    }
  }

  public broadcast(type: SyncEventType, payload?: any, senderName: string = 'Care Team Member', podId?: string) {
    const msg: SyncMessage = {
      type,
      podId,
      senderId: this.senderId,
      senderName,
      timestamp: Date.now(),
      payload,
    };

    // 1. Same-device BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('Failed to postMessage on BroadcastChannel:', e);
      }
    }

    // 2. Storage event fallback
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aegis_sync_bus_event', JSON.stringify(msg));
      } catch {
        // ignore
      }
    }

    // 3. Post to Server Sync API so Phones & PCs on Wi-Fi receive it
    if (typeof window !== 'undefined') {
      fetch('/api/palliative/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: msg,
          podId: podId || msg.podId,
          log: payload?.log,
          medication: payload?.medication,
          podUpdate: payload?.podUpdate,
        }),
      }).catch(() => {
        // Optimistic offline queue handles retry
      });
    }

    // Notify local in-component listeners
    this.notifyListeners(msg);
  }

  public subscribe(callback: (msg: SyncMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(msg: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in sync bus listener:', err);
      }
    });
  }
}

export const CareSyncBus = new CareSyncBusService();
