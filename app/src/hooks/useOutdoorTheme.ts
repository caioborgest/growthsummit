import { useSyncExternalStore, useCallback, useEffect } from 'react';

const KEY = 'ge_theme_outdoor';

function getSnapshot(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEY) === '1';
}

let listeners: Array<() => void> = [];
function subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}

function emitChange() {
    listeners.forEach((l) => l());
}

export function useOutdoorTheme() {
    const isOutdoor = useSyncExternalStore(subscribe, getSnapshot, () => false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isOutdoor ? 'outdoor' : '');
    }, [isOutdoor]);

    const toggle = useCallback(() => {
        const next = !getSnapshot();
        localStorage.setItem(KEY, next ? '1' : '0');
        document.documentElement.setAttribute('data-theme', next ? 'outdoor' : '');
        emitChange();
    }, []);

    return { isOutdoor, toggle };
}
