import { useSyncExternalStore, useCallback, useEffect } from 'react';
import { safeStorage } from '@/utils/safeStorage';

const KEY = 'ge_color_theme';

type Theme = 'dark' | 'light';

function getSnapshot(): Theme {
    if (typeof window === 'undefined') return 'dark';
    const stored = safeStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Detecta preferência do sistema
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
}

let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}

function emitChange() {
    listeners.forEach(l => l());
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    // Só aplica se não estiver em outdoor mode
    if (root.getAttribute('data-theme') !== 'outdoor') {
        root.setAttribute('data-theme', theme);
    }
}

export function useTheme() {
    const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'dark' as Theme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        const current = getSnapshot();
        const next: Theme = current === 'dark' ? 'light' : 'dark';
        safeStorage.setItem(KEY, next);
        applyTheme(next);
        emitChange();
    }, []);

    const setTheme = useCallback((t: Theme) => {
        safeStorage.setItem(KEY, t);
        applyTheme(t);
        emitChange();
    }, []);

    return { theme, toggleTheme, setTheme };
}
