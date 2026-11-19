import { API } from './routes';

// In the browser: the server's socket (GET /v1/ws). It opens with the access
// token as the `bearer` subprotocol, keeps the last seq in sessionStorage so
// a reconnect gets what it missed, renews the token with an `auth` frame
// before it expires, and reconnects with backoff. Frames become DOM events:
// sn:update (detail: the frame), sn:reset, sn:typing.

interface Ticket {
  url: string;
  token: string;
  expiresAt: string;
}

export interface Socket {
  /** Sends a frame while the socket is open; drops it otherwise. */
  send(frame: object): void;
}

const SEQ = 'sn:ws-seq';
const store = {
  get: () => {
    try {
      return sessionStorage.getItem(SEQ) ?? '';
    } catch {
      return '';
    }
  },
  set: (seq: number) => {
    try {
      sessionStorage.setItem(SEQ, String(seq));
    } catch {
      // Without storage a reconnect starts from now.
    }
  },
};

/** The ticket, or null for a guest; throws when this site is out of reach. */
async function ticket(): Promise<Ticket | null> {
  const res = await fetch(API.socket, { cache: 'no-store' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export function connectSocket(): Socket {
  // Only `current` acts: events from a socket that was replaced or closed are ignored.
  let current: WebSocket | null = null;
  let opening = false;
  let stopped = false;
  let tries = 0;
  let retryTimer = 0;
  let renewTimer = 0;
  const emit = (name: string, detail?: unknown) => document.dispatchEvent(new CustomEvent(name, { detail }));

  // A minute before the token expires, a new one goes over the open socket.
  const renewAt = (ws: WebSocket, t: Ticket) => {
    clearTimeout(renewTimer);
    const wait = Math.max(5_000, Date.parse(t.expiresAt) - Date.now() - 60_000);
    renewTimer = window.setTimeout(async () => {
      const next = await ticket().catch(() => null);
      if (next && ws === current && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'auth', token: next.token }));
        renewAt(ws, next);
      }
    }, wait);
  };

  // 1 s, 2 s, 4 s … up to 30 s, with jitter; at once after a server restart.
  const retry = (now = false) => {
    if (stopped) return;
    clearTimeout(retryTimer);
    const ms = now ? 0 : Math.min(30_000, 1000 * 2 ** tries) * (0.75 + Math.random() / 2);
    tries++;
    retryTimer = window.setTimeout(open, ms);
  };

  async function open() {
    if (stopped || current || opening) return;
    opening = true;
    let t: Ticket | null;
    try {
      t = await ticket();
    } catch {
      opening = false;
      retry();
      return;
    }
    opening = false;
    if (!t || stopped || current) return;
    const url = new URL(t.url);
    const since = store.get();
    if (since) url.searchParams.set('since', since);
    // A refused token or origin closes before the upgrade (1006); the next try gets a fresh ticket.
    const ws = new WebSocket(url, ['bearer', t.token]);
    current = ws;
    ws.addEventListener('message', (e) => {
      if (ws !== current) return;
      let f: { type: string; seq?: number };
      try {
        f = JSON.parse(String(e.data));
      } catch {
        return;
      }
      if (typeof f.seq === 'number') store.set(f.seq);
      if (f.type === 'ready') {
        tries = 0;
        renewAt(ws, t);
      } else if (f.type === 'reset') emit('sn:reset', f);
      else if (f.type === 'update') emit('sn:update', f);
      else if (f.type === 'typing') emit('sn:typing', f);
    });
    ws.addEventListener('close', (e) => {
      if (ws !== current) return;
      current = null;
      clearTimeout(renewTimer);
      if (e.code === 4003) stopped = true;
      else retry(e.code === 1001 || (e.code === 4001 && tries === 0));
    });
  }

  open();
  addEventListener('pagehide', () => {
    stopped = true;
    clearTimeout(retryTimer);
    clearTimeout(renewTimer);
    const ws = current;
    current = null;
    ws?.close(1000);
  });
  // Back from the page cache, it opens again.
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    stopped = false;
    tries = 0;
    open();
  });
  return {
    send(frame) {
      if (current?.readyState === WebSocket.OPEN) current.send(JSON.stringify(frame));
    },
  };
}
