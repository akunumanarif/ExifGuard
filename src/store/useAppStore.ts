import { create } from 'zustand';
import { ImageFile, ExifData } from '@/types';

interface AppState {
    files: ImageFile[];
    selectedFileId: string | null;

    addFiles: (newFiles: File[]) => void;
    removeFile: (id: string) => void;
    selectFile: (id: string) => void;
    updateFileStatus: (id: string, status: ImageFile['status'], error?: string) => void;
    setMetadata: (id: string, metadata: ExifData) => void;
    setCleanBlob: (id: string, blob: Blob) => void;
}

export const useAppStore = create<AppState>((set) => ({
    files: [],
    selectedFileId: null,

    addFiles: (newFiles) => set((state) => {
        const newImageFiles: ImageFile[] = newFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            metadata: null,
            status: 'pending'
        }));
        return { files: [...state.files, ...newImageFiles] };
    }),

    removeFile: (id) => set((state) => {
        const fileToRemove = state.files.find(f => f.id === id);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.preview); // Cleanup
        }
        const nextFiles = state.files.filter((f) => f.id !== id);
        // If selected file is removed, deselect or select another?
        let nextSelected = state.selectedFileId;
        if (state.selectedFileId === id) {
            nextSelected = null;
        }
        return { files: nextFiles, selectedFileId: nextSelected };
    }),

    selectFile: (id) => set({ selectedFileId: id }),

    updateFileStatus: (id, status, error) => set((state) => ({
        files: state.files.map((f) =>
            f.id === id ? { ...f, status, error } : f
        )
    })),

    setMetadata: (id, metadata) => set((state) => ({
        files: state.files.map((f) =>
            f.id === id ? { ...f, metadata } : f
        )
    })),

    setCleanBlob: (id, blob) => set((state) => ({
        files: state.files.map((f) =>
            f.id === id ? { ...f, cleanBlob: blob, status: 'done' } : f
        )
    }))
}));
