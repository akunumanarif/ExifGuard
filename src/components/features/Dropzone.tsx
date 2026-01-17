'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileImage, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface DropzoneProps {
    onFilesDropped: (files: File[]) => void;
    className?: string;
}

export function Dropzone({ onFilesDropped, className }: DropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);

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
    }, [onFilesDropped]);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn("w-full cursor-pointer", className)}
        >
            <label htmlFor="file-upload" className="w-full">
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
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInput}
                    />
                </Card>
            </label>
        </div>
    );
}
