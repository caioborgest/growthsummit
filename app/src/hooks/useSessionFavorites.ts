import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = (projectId: string) => `ge_favoritos_${projectId}`;

let lastProjectId: string | null = null;
let lastRaw: string | null = null;
let lastSnapshot: string[] = [];

function getSnapshot(projectId: string | null): string[] {
    if (!projectId) return [];
    
    try {
        const raw = localStorage.getItem(STORAGE_KEY(projectId));
        
        // Se o projectId ou o conteúdo do localStorage mudou, recalcula o array
        if (projectId !== lastProjectId || raw !== lastRaw) {
            lastProjectId = projectId;
            lastRaw = raw;
            
            if (!raw) {
                lastSnapshot = [];
            } else {
                const arr = JSON.parse(raw);
                lastSnapshot = Array.isArray(arr) ? arr.filter((x: unknown) => typeof x === 'string') : [];
            }
        }
        
        return lastSnapshot;
    } catch {
        return [];
    }
}

let listeners: Array<() => void> = [];
function emitChange() {
    listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
    listeners.push(listener);
    const onStorage = () => emitChange();
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', onStorage);
    }
    return () => {
        listeners = listeners.filter((l) => l !== listener);
        if (typeof window !== 'undefined') {
            window.removeEventListener('storage', onStorage);
        }
    };
}

export function useSessionFavorites(projectId: string | null) {
    const favorites = useSyncExternalStore(
        subscribe,
        () => getSnapshot(projectId),
        () => getSnapshot(projectId)
    );

    const toggle = useCallback(
        (sessionId: string) => {
            if (!projectId) return;
            const key = STORAGE_KEY(projectId);
            const current = getSnapshot(projectId);
            const next = current.includes(sessionId)
                ? current.filter((id) => id !== sessionId)
                : [...current, sessionId];
            localStorage.setItem(key, JSON.stringify(next));
            emitChange();
        },
        [projectId]
    );

    const isFavorite = useCallback(
        (sessionId: string) => favorites.includes(sessionId),
        [favorites]
    );

    return { favorites, toggle, isFavorite };
}
