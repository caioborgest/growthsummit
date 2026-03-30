import { useSyncExternalStore, useCallback, useEffect } from 'react';
import { safeStorage } from '@/utils/safeStorage';

const KEY = 'ge_theme_outdoor';
const THEME_KEY = 'ge_color_theme';

function getSnapshot(): boolean {
    if (typeof window === 'undefined') return false;
    return safeStorage.getItem(KEY) === '1';
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
        const storedColorTheme = safeStorage.getItem(THEME_KEY) || 'dark';
        document.documentElement.setAttribute(
            'data-theme',
            isOutdoor ? 'outdoor' : storedColorTheme
        );
    }, [isOutdoor]);

    const toggle = useCallback(() => {
        const next = !getSnapshot();
        localStorage.setItem(KEY, next ? '1' : '0');
        const storedColorTheme = safeStorage.getItem(THEME_KEY) || 'dark';
        document.documentElement.setAttribute(
            'data-theme',
            next ? 'outdoor' : storedColorTheme
        );
        emitChange();
    }, []);

    return { isOutdoor, toggle };
}
