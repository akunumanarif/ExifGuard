'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileImage, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { CameraCapture } from './CameraCapture';

interface DropzoneProps {
    onFilesDropped: (files: File[]) => void;
    className?: string;
}

export function Dropzone({ onFilesDropped, className }: DropzoneProps) {
    const [showModal, setShowModal] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const galleryInputRef = React.useRef<HTMLInputElement>(null);
    const cameraInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            // Hide modal if it's open during a drop
            setShowModal(false);

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const files = Array.from(e.dataTransfer.files).filter(file =>
                    file.type.startsWith('image/')
                );
                if (files.length > 0) {
                    onFilesDropped(files);
                }
            }
        },
        [onFilesDropped]
    );

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).filter(file =>
                file.type.startsWith('image/')
            );
            onFilesDropped(files);
        }
        // Reset the input so the same file can be selected again if needed
        e.target.value = '';
        setShowModal(false);
    }, [onFilesDropped]);

    const handleCameraCapture = (file: File) => {
        onFilesDropped([file]);
        setShowCamera(false);
        setShowModal(false);
    };

    const openGallery = () => {
        galleryInputRef.current?.click();
    };

    const openCamera = () => {
        // Simple detection for mobile devices to prefer native camera intent
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            cameraInputRef.current?.click();
        } else {
            // On desktop, show our custom camera capture UI
            setShowCamera(true);
            setShowModal(false); // Close selection modal
        }
    };

    // Close modal when clicking outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

    return (
        <>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => setShowModal(true)}
                className={cn("w-full cursor-pointer relative", className)}
            >
                {/* Remove the label that triggers input directly */}
                <Card className={cn(
                    "border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center py-12 px-4 gap-4",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}>
                    <div className="p-4 bg-muted rounded-full">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium">Click or drag images here</p>
                        <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WEBP</p>
                    </div>
                </Card>

                {/* Hidden inputs */}
                <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                />

                {/* Camera input with capture attribute (for mobile) */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileInput}
                />
            </div>

            {/* Selection Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={handleBackdropClick}
                >
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-semibold">Select Image Source</h3>
                            <p className="text-sm text-muted-foreground">Choose how you want to add photos</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={openCamera}
                                className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-primary/5 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                            >
                                <div className="p-3 bg-background rounded-full shadow-sm">
                                    <div className="w-6 h-6 flex justify-center items-center">📷</div>
                                </div>
                                <span className="font-medium text-sm">Langsung Foto</span>
                            </button>

                            <button
                                onClick={openGallery}
                                className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-primary/5 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                            >
                                <div className="p-3 bg-background rounded-full shadow-sm">
                                    <FileImage className="w-6 h-6" />
                                </div>
                                <span className="font-medium text-sm">Ambil Image</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Camera Capture UI */}
            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </>
    );
}
