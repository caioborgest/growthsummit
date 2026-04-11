import { useState, useEffect, useCallback, useRef } from 'react';
import { toggleCheckInRegistrationAtomic } from '@/lib/checkInAtomic';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

const QUEUE_STORAGE_KEY = 'gx_checkin_offline_queue';

interface QueuedCheckIn {
    id: string; // Internal UUID for the queue item
    registrationId: string;
    projectId: string;
    action: 'check-in' | 'check-out';
    userId?: string | null;
    ticketNumber?: string | null;
    operatorId?: string | null;
    timestamp: string;
    name?: string; // For display in UI while offline
}

export function useCheckInQueue() {
    const [queue, setQueue] = useState<QueuedCheckIn[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const syncInProgress = useRef(false);

    // Load queue from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
        if (saved) {
            try {
                setQueue(JSON.parse(saved));
            } catch (e) {
                logger.error('Failed to parse offline queue:', e);
            }
        }
    }, []);

    // Save queue to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }, [queue]);

    const syncQueue = useCallback(async () => {
        if (syncInProgress.current || queue.length === 0 || !navigator.onLine) return;

        syncInProgress.current = true;
        setIsSyncing(true);
        logger.info(`Starting sync of ${queue.length} offline check-ins...`);

        const remainingQueue = [...queue];
        const itemsToProcess = [...queue];

        for (const item of itemsToProcess) {
            try {
                const res = await toggleCheckInRegistrationAtomic({
                    registrationId: item.registrationId,
                    projectId: item.projectId,
                    action: item.action,
                    userId: item.userId,
                    ticketNumber: item.ticketNumber,
                    operatorId: item.operatorId,
                    method: 'offline_sync'
                });

                if (res.ok || res.duplicate) {
                    // Success or already done
                    remainingQueue.shift();
                    setQueue([...remainingQueue]); // Update state as we go
                } else {
                    // Error - stop sync for now to avoid loops or repeated failures
                    logger.warn(`Failed to sync item ${item.registrationId}: ${res.message}`);
                    break;
                }
            } catch (err) {
                logger.error('Sync error:', err);
                break;
            }
        }

        setIsSyncing(false);
        syncInProgress.current = false;
        
        if (remainingQueue.length === 0 && itemsToProcess.length > 0) {
            toast.success('Sincronização offline concluída com sucesso!');
        }
    }, [queue]);

    // Auto-sync when coming back online
    useEffect(() => {
        window.addEventListener('online', syncQueue);
        return () => window.removeEventListener('online', syncQueue);
    }, [syncQueue]);

    // Initial check and periodic sync
    useEffect(() => {
        const interval = setInterval(syncQueue, 30000); // Try every 30s if online
        return () => clearInterval(interval);
    }, [syncQueue]);

    const addToQueue = useCallback((params: Omit<QueuedCheckIn, 'id' | 'timestamp'>) => {
        const newItem: QueuedCheckIn = {
            ...params,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        };
        
        setQueue(prev => [...prev, newItem]);
        toast.info(`Check-in de ${params.name || 'participante'} salvo offline.`, {
            description: 'Será sincronizado automaticamente assim que a internet retornar.'
        });
    }, []);

    const clearQueue = useCallback(() => {
        setQueue([]);
        localStorage.removeItem(QUEUE_STORAGE_KEY);
    }, []);

    return {
        queue,
        pendingCount: queue.length,
        isSyncing,
        addToQueue,
        syncQueue,
        clearQueue
    };
}
