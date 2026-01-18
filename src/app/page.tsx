'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { Dropzone } from '@/components/features/Dropzone';
import { ImageList } from '@/components/features/ImageList';
import { MetadataViewer } from '@/components/features/MetadataViewer';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Download, Trash2 } from 'lucide-react';

export default function Home() {
    const { files, selectedFileId, selectFile, removeFile, addFiles } = useAppStore();
    const { analyzeImage, cleanImageAction, downloadAll } = useImageProcessor();

    // Auto-analyze new files that are pending
    useEffect(() => {
        files.forEach(f => {
            if (f.status === 'pending' && !f.metadata) {
                analyzeImage(f.id, f.file);
            }
        });
    }, [files, analyzeImage]);

    const selectedFile = files.find(f => f.id === selectedFileId);

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 font-sans text-foreground">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            {/* <ShieldCheck className="w-8 h-8 text-primary" /> */}
                            <img src="/exif_guard_icon.png" alt="ExifGuard Logo" className="w-10 h-10 object-contain text-primary" />
                            ExifGuard
                        </h1>
                        <p className="text-muted-foreground">
                            Client-side privacy tool. Remove GPS and EXIF data instantly.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Reset
                        </Button>
                        <Button onClick={downloadAll} disabled={files.length === 0}>
                            <Download className="w-4 h-4 mr-2" /> Clean All & Zip
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Input and List */}
                    <div className="lg:col-span-4 space-y-4">
                        <Dropzone onFilesDropped={addFiles} />
                        <ImageList
                            files={files}
                            onRemove={removeFile}
                            onSelect={selectFile}
                            selectedId={selectedFileId}
                        />
                    </div>

                    {/* Right Column: Viewer */}
                    <div className="lg:col-span-8">
                        {selectedFile ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold break-all">
                                        {selectedFile.file.name}
                                    </h2>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => cleanImageAction(selectedFile.id)}
                                            disabled={selectedFile.status === 'processing'}
                                        >
                                            {selectedFile.status === 'processing' ? 'Cleaning...' : 'Clean & Download'}
                                        </Button>
                                    </div>
                                </div>

                                {selectedFile.metadata ? (
                                    <MetadataViewer data={selectedFile.metadata} />
                                ) : (
                                    <div className="p-8 text-center border rounded-lg bg-muted/20">
                                        Loading metadata...
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground">
                                <ShieldCheck className="w-16 h-16 opacity-20 mb-4" />
                                <p>Select an image to view details and remove metadata.</p>
                            </div>
                        )}
                    </div>

                </div>

                <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
                    <p>Made with respect by <a href="https://github.com/akunumanarif" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">numanarif</a></p>
                </footer>
            </div>
        </main>
    );
}
