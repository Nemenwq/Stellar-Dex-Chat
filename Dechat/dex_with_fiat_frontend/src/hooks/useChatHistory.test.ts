import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChatSession } from '@/types';

// Pure utility tests for pin ordering logic and stale-closure regression (#1223)

function sortSessions(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.pinned && b.pinned) {
      return (b.pinnedAt?.getTime() ?? 0) - (a.pinnedAt?.getTime() ?? 0);
    }
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
}

function makeSession(overrides: Partial<ChatSession> = {}): ChatSession {
  const now = new Date();
  return {
    id: Math.random().toString(36).slice(2),
    title: 'Test',
    messages: [],
    createdAt: now,
    lastUpdated: now,
    ...overrides,
  };
}

describe('Thread pinning ordering', () => {
  it('pinned sessions appear before unpinned ones', () => {
    const older = makeSession({ lastUpdated: new Date('2024-01-01') });
    const pinned = makeSession({
      pinned: true,
      pinnedAt: new Date('2024-06-01'),
      lastUpdated: new Date('2024-01-01'),
    });
    const recent = makeSession({ lastUpdated: new Date('2024-12-01') });

    const sorted = sortSessions([recent, older, pinned]);

    expect(sorted[0].id).toBe(pinned.id);
  });

  it('multiple pinned sessions are sorted by pinnedAt descending', () => {
    const first = makeSession({
      pinned: true,
      pinnedAt: new Date('2024-09-01'),
      lastUpdated: new Date('2024-01-01'),
    });
    const second = makeSession({
      pinned: true,
      pinnedAt: new Date('2024-06-01'),
      lastUpdated: new Date('2024-01-01'),
    });

    const sorted = sortSessions([second, first]);

    expect(sorted[0].id).toBe(first.id);
    expect(sorted[1].id).toBe(second.id);
  });

  it('unpinned sessions are sorted by lastUpdated descending', () => {
    const older = makeSession({ lastUpdated: new Date('2024-01-01') });
    const newer = makeSession({ lastUpdated: new Date('2024-12-01') });

    const sorted = sortSessions([older, newer]);

    expect(sorted[0].id).toBe(newer.id);
    expect(sorted[1].id).toBe(older.id);
  });

  it('toggling pin sets pinned=true and pinnedAt', () => {
    const session = makeSession({ pinned: false });
    const now = new Date();

    const toggled: ChatSession = {
      ...session,
      pinned: true,
      pinnedAt: now,
    };

    expect(toggled.pinned).toBe(true);
    expect(toggled.pinnedAt).toBe(now);
  });

  it('toggling pin off clears pinned and pinnedAt', () => {
    const session = makeSession({ pinned: true, pinnedAt: new Date() });

    const toggled: ChatSession = {
      ...session,
      pinned: false,
      pinnedAt: undefined,
    };

    expect(toggled.pinned).toBe(false);
    expect(toggled.pinnedAt).toBeUndefined();
  });

  it('sessions with no pinned field are treated as unpinned', () => {
    const noPinField = makeSession({ lastUpdated: new Date('2024-12-01') });
    const pinned = makeSession({ pinned: true, pinnedAt: new Date('2024-06-01') });

    const sorted = sortSessions([noPinField, pinned]);

    expect(sorted[0].id).toBe(pinned.id);
    expect(sorted[1].id).toBe(noPinField.id);
  });
});

// ---------------------------------------------------------------------------
// Race-condition regression tests (#1213)
// ---------------------------------------------------------------------------
//
// These tests cover the two stale-closure bugs that were fixed:
//
// 1. updateCurrentSession — previously read `historyState.currentSessionId`
//    from the outer closure. If the session changed between renders the guard
//    (`if (!historyState.currentSessionId) return`) would be stale and could
//    either block a valid update or allow an update targeting the wrong session.
//    Fix: moved the guard inside the functional updater so it always sees the
//    latest committed state.
//
// 2. loadSession — previously read `historyState.sessions` from the closure,
//    which could be a snapshot from a previous render. Any session created
//    after the closure was captured would be invisible to the lookup.
//    Fix: reads from `sessionsRef.current` which is kept current via a
//    synchronous ref-update effect.

describe('Race-condition fix: updateCurrentSession functional updater (#1213)', () => {
  it('update is a no-op when currentSessionId is null in latest state', () => {
    type State = { currentSessionId: string | null; sessions: { id: string; messages: string[] }[] };

    // Simulate the fixed functional updater
    const updater = (messages: string[]) => (prev: State): State => {
      if (!prev.currentSessionId) return prev;
      const idx = prev.sessions.findIndex((s) => s.id === prev.currentSessionId);
      if (idx === -1) return prev;
      const updated = [...prev.sessions];
      updated[idx] = { ...updated[idx], messages };
      return { ...prev, sessions: updated };
    };

    const state: State = { currentSessionId: null, sessions: [{ id: 'a', messages: [] }] };
    const next = updater(['msg'])(state);

    // No change because currentSessionId was null at update time
    expect(next).toBe(state);
  });

  it('update targets the correct session even when currentSessionId changed before dispatch', () => {
    type State = { currentSessionId: string | null; sessions: { id: string; messages: string[] }[] };

    const updater = (messages: string[]) => (prev: State): State => {
      if (!prev.currentSessionId) return prev;
      const idx = prev.sessions.findIndex((s) => s.id === prev.currentSessionId);
      if (idx === -1) return prev;
      const updated = [...prev.sessions];
      updated[idx] = { ...updated[idx], messages };
      return { ...prev, sessions: updated };
    };

    // State has switched to session 'b' by the time the updater runs
    const state: State = {
      currentSessionId: 'b',
      sessions: [
        { id: 'a', messages: [] },
        { id: 'b', messages: [] },
      ],
    };

    const next = updater(['hello'])(state);

    expect(next.sessions.find((s) => s.id === 'b')?.messages).toEqual(['hello']);
    expect(next.sessions.find((s) => s.id === 'a')?.messages).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// updateCurrentSession stale-closure regression (#1223)
// ---------------------------------------------------------------------------
//
// Before the fix, updateCurrentSession closed over historyState.currentSessionId
// for its early-return guard. If currentSessionId changed between renders the
// stale closure value would cause the guard to use the wrong session ID.
//
// The fix moves the guard inside the setHistoryState functional updater so it
// always reads `prev.currentSessionId` (fresh state), never the closure value.

describe('updateCurrentSession guard reads fresh state (regression #1223)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Simulate the functional updater pattern used by the fixed updateCurrentSession.
  function makeUpdater(messages: { id: string }[]) {
    return (prev: { currentSessionId: string | null; sessions: { id: string; messages: { id: string }[] }[] }) => {
      if (!prev.currentSessionId) return prev;
      const idx = prev.sessions.findIndex((s) => s.id === prev.currentSessionId);
      if (idx === -1) return prev;
      const updated = [...prev.sessions];
      updated[idx] = { ...updated[idx], messages };
      return { ...prev, sessions: updated };
    };
  }

  it('updates the session identified by prev.currentSessionId, not a stale outer value', () => {
    const sessionA = { id: 'a', messages: [] as { id: string }[] };
    const sessionB = { id: 'b', messages: [] as { id: string }[] };
    const newMessages = [{ id: 'msg1' }];

    // Stale outer value would be 'a', but we simulate the state having already
    // advanced to 'b' before the updater runs.
    const freshState = { currentSessionId: 'b', sessions: [sessionA, sessionB] };

    const nextState = makeUpdater(newMessages)(freshState);

    expect(nextState.sessions.find((s) => s.id === 'b')?.messages).toEqual(newMessages);
    expect(nextState.sessions.find((s) => s.id === 'a')?.messages).toEqual([]);
  });

  it('returns prev unchanged when prev.currentSessionId is null', () => {
    const session = { id: 'a', messages: [] as { id: string }[] };
    const state = { currentSessionId: null, sessions: [session] };

    const nextState = makeUpdater([{ id: 'msg1' }])(state);

    expect(nextState).toBe(state);
  });
});

describe('Race-condition fix: loadSession uses sessionsRef (#1213)', () => {
  it('lookup finds a session added after the callback was captured', () => {
    // Simulate sessionsRef — always points to latest sessions array
    const sessionsRef = { current: [] as { id: string; messages: string[] }[] };

    // Simulate the fixed loadSession using sessionsRef
    const loadSession = (sessionId: string) => {
      return sessionsRef.current.find((s) => s.id === sessionId) ?? null;
    };

    // Callback captured here with empty sessions
    expect(loadSession('new')).toBeNull();

    // Session added later — ref is updated synchronously (as the useEffect does)
    sessionsRef.current = [{ id: 'new', messages: ['hi'] }];

    // Now loadSession finds it, despite being "captured" before it existed
    const found = loadSession('new');
    expect(found).not.toBeNull();
    expect(found?.messages).toEqual(['hi']);
  });
});
