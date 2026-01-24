'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let mounted = true;

        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' }
                });
                if (mounted) {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                if (mounted) {
                    setError("Could not access camera. Please check permissions.");
                }
            }
        };

        startCamera();

        return () => {
            mounted = false;
            // Cleanup stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to blob/file
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

                        // Stop stream before closing
                        if (stream) {
                            stream.getTracks().forEach(track => track.stop());
                        }

                        onCapture(file);
                    }
                }, 'image/jpeg', 0.95);
            }
        }
    };

    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl bg-black border-zinc-800 relative overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-4 flex justify-between items-center absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <h3 className="text-white font-medium flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Take Photo
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Video Area */}
                <div className="relative aspect-video bg-black flex items-center justify-center">
                    {error ? (
                        <div className="text-red-400 p-4 text-center">
                            <p>{error}</p>
                            <Button variant="outline" onClick={handleClose} className="mt-4 text-white border-white/20 hover:bg-white/10">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted // Muted to avoid feedback loops if audio was enabled (though we only asked for video)
                            className="w-full h-full object-contain transform scale-x-[-1]" // Mirror effect for user convenience
                        />
                    )}
                </div>

                {/* Controls */}
                <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-center gap-4">
                    <Button
                        size="lg"
                        onClick={takePhoto}
                        disabled={!!error || !stream}
                        className="rounded-full w-16 h-16 p-0 border-4 border-white/20 hover:border-white/40 bg-red-600 hover:bg-red-500 shadow-lg transition-all active:scale-95"
                    >
                        <div className="w-full h-full rounded-full border-2 border-white/50" />
                        <span className="sr-only">Capture</span>
                    </Button>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </Card>
        </div>
    );
}
