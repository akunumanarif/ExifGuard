export interface ExifData {
    hasGps: boolean;
    latitude?: number;
    longitude?: number;
    make?: string;
    model?: string;
    dateTime?: string;
    fNumber?: number;
    iso?: number;
    rawTags: Record<string, any>; // Relaxed type for now
}

export interface ImageFile {
    id: string;
    file: File;
    preview: string;
    metadata: ExifData | null;
    status: 'idle' | 'pending' | 'processing' | 'done' | 'error';
    cleanBlob?: Blob;
    error?: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'completed';
