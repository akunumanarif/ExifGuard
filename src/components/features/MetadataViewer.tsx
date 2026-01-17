'use client';

import React from 'react';
import { ExifData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { AlertTriangle, Calendar, Camera, MapPin } from 'lucide-react';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./MapView'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-muted animate-pulse rounded-md" />
});

interface MetadataViewerProps {
    data: ExifData;
}

export function MetadataViewer({ data }: MetadataViewerProps) {
    if (!data) return null;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Metadata Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Camera className="w-4 h-4" /> Device
                            </div>
                            <p>{data.make} {data.model || 'Unknown Device'}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Calendar className="w-4 h-4" /> Captured At
                            </div>
                            <p>{data.dateTime || 'Unknown Date'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm border-t pt-4">
                        <div><span className="text-muted-foreground">ISO:</span> {data.iso ?? 'N/A'}</div>
                        <div><span className="text-muted-foreground">F-Number:</span> {data.fNumber ? `f/${data.fNumber}` : 'N/A'}</div>
                    </div>

                    {data.hasGps && data.latitude && data.longitude ? (
                        <div className="pt-4 border-t space-y-2">
                            <div className="flex items-center gap-2 text-red-500 font-bold">
                                <AlertTriangle className="w-5 h-5" />
                                GPS Coordinates Found!
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lat: {data.latitude.toFixed(6)}, Lng: {data.longitude.toFixed(6)}
                            </p>
                            <MapView lat={data.latitude} lng={data.longitude} />
                        </div>
                    ) : (
                        <div className="pt-4 border-t flex items-center gap-2 text-green-600">
                            <MapPin className="w-5 h-5" />
                            No GPS Data Found
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Raw Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 overflow-y-auto text-xs font-mono bg-muted p-2 rounded">
                        {Object.keys(data.rawTags).length > 0 ? (
                            <pre>{JSON.stringify(data.rawTags, (key, value) => {
                                // Avoid circular refs or huge objects if any
                                if (key === 'MakerNote') return '[Binary Data]';
                                if (key === 'UserComment') return '[Binary Data]';
                                return value;
                            }, 2)}</pre>
                        ) : (
                            <p>No valid tags found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
