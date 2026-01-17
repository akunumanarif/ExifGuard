import React, { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { parseMetadata } from '@/lib/exifService';
import { scrubImage } from '@/lib/scrubber';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export function useImageProcessor() {
    const {
        files,
        addFiles,
        updateFileStatus,
        setMetadata,
        setCleanBlob
    } = useAppStore();

    const processFiles = useCallback(async (newFiles: File[]) => {
        addFiles(newFiles);

        // We can't easily get the IDs of the *just added* files because addFiles is sync but state update is React-ish (Zustand is sync though).
        // But we don't have the IDs returned.
        // Workaround: We can't access them immediately by ID unless addFiles returns them.
        // Better: Handle parsing in a useEffect or make addFiles return the generated IDs.
        // For now, I'll rely on the fact that I can't easily modify the store signature without updating the file.
        // I'll just iterate over *all* pending files?
        // Or better: Let's separate the logic. 
        // "addFiles" adds them to store. 
        // Then we iterate and process.
    }, [addFiles]);

    const analyzeImage = useCallback(async (id: string, file: File) => {
        try {
            updateFileStatus(id, 'processing');
            const metadata = await parseMetadata(file);
            setMetadata(id, metadata);
            updateFileStatus(id, 'idle'); // Ready for cleaning
        } catch (error) {
            updateFileStatus(id, 'error', 'Failed to parse metadata');
        }
    }, [updateFileStatus, setMetadata]);

    // We need a mechanism to trigger analysis when files are added.
    // We can use a useEffect in the component that calls this hook.

    // Worker integration
    const workerRef = React.useRef<Worker | null>(null);

    React.useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/scrub.worker.ts', import.meta.url));
        workerRef.current.onmessage = (e) => {
            const { id, success, blob, error } = e.data;
            if (success && blob) {
                setCleanBlob(id, blob);
                // Trigger download for single file convenience if we could track it, 
                // but for now state update triggers UI change.
                // We'll trust the user to download or we can modify setCleanBlob to trigger logic.
            } else {
                updateFileStatus(id, 'error', error || 'Worker error');
            }
        };
        return () => workerRef.current?.terminate();
    }, [setCleanBlob, updateFileStatus]);

    const cleanImageAction = useCallback((id: string) => {
        const fileRecord = useAppStore.getState().files.find(f => f.id === id);
        if (!fileRecord) return;

        updateFileStatus(id, 'processing');
        workerRef.current?.postMessage({ id, file: fileRecord.file });
    }, [updateFileStatus]);

    const downloadAll = useCallback(async () => {
        const zip = new JSZip();
        const files = useAppStore.getState().files;
        let count = 0;

        const promises = files.map(async (f) => {
            if (f.cleanBlob) {
                zip.file(`clean_${f.file.name}`, f.cleanBlob);
                count++;
            } else {
                // If not yet cleaned, clean it now?
                try {
                    const cleaned = await scrubImage(f.file);
                    zip.file(`clean_${f.file.name}`, cleaned);
                    count++;
                } catch (e) {
                    console.error(`Failed to batch clean ${f.file.name}`, e);
                }
            }
        });

        await Promise.all(promises);

        if (count > 0) {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "exifguard_batch.zip");
        }
    }, []);

    return {
        processFiles,
        analyzeImage,
        cleanImageAction,
        downloadAll
    };
}
