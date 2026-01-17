'use client';

import React from 'react';
import { ImageFile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, CircleDashed, FileImage, Trash2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageListProps {
    files: ImageFile[];
    onRemove: (id: string) => void;
    onSelect: (id: string) => void;
    selectedId: string | null;
}

export function ImageList({ files, onRemove, onSelect, selectedId }: ImageListProps) {
    if (files.length === 0) return null;

    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Uploaded Images ({files.length})</h3>
            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={cn(
                            "relative flex items-center p-3 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:bg-muted/50 cursor-pointer",
                            selectedId === file.id && "ring-2 ring-primary border-primary"
                        )}
                        onClick={() => onSelect(file.id)}
                    >
                        {/* Preview */}
                        <div className="h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0 mr-4 border">
                            {/* Note: In a real app we'd use file.preview (object URL) */}
                            {/* We assume preview is already generated. */}
                            <img src={file.preview} alt="preview" className="h-full w-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 mr-2">
                            {file.status === 'processing' && <CircleDashed className="w-4 h-4 animate-spin text-blue-500" />}
                            {file.status === 'done' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {file.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>

                        {/* Actions */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(file.id);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
