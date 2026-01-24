import ExifReader from 'exifreader';
import { ExifData } from '@/types';

export async function parseMetadata(file: File): Promise<ExifData> {
    try {
        const tags = await ExifReader.load(file);

        // Extract GPS
        let latitude: number | undefined;
        let longitude: number | undefined;

        // Helper to Convert DMS to Decimal if needed, though ExifReader usually provides description
        // But ExifReader's 'GPSLatitude' is usually an array.
        // However, it creates a simplified 'gps' object if available? 
        // Let's rely on common tags. 

        // Note: ExifReader has robust parsing. 
        // We check for 'GPSLatitude' and 'GPSLongitude' which might be in Decimal if using a specific config, 
        // but by default they are complex objects.
        // Luckily, the 'expanded' option or simple access helps.

        // A better way with ExifReader:
        // It usually returns a 'gps' property with converted values.

        // For now, let's look for known keys.
        // For now, let's look for known keys.
        const gpsLat = tags['GPSLatitude'];
        const gpsLon = tags['GPSLongitude'];
        const gpsLatRef = tags['GPSLatitudeRef'];
        const gpsLonRef = tags['GPSLongitudeRef'];

        if (gpsLat && gpsLon && gpsLat.description && gpsLon.description) {
            latitude = parseFloat(gpsLat.description as string);
            longitude = parseFloat(gpsLon.description as string);

            // Fix for Southern/Western Hemisphere
            // ExifReader usually provides the value as positive number, we need to check the Ref tag
            if (gpsLatRef && gpsLatRef.value && (gpsLatRef.value as string[])[0] === 'S') {
                latitude = latitude * -1;
            }
            // Some cameras might return 'South' instead of 'S', but ExifReader usually normalizes or provides the letter in value array
            // Let's check safely. The 'value' is often an array ["S"]

            if (gpsLonRef && gpsLonRef.value && (gpsLonRef.value as string[])[0] === 'W') {
                longitude = longitude * -1;
            }
        }

        // Date
        const dateTime = tags['DateTimeOriginal']?.description || tags['DateTime']?.description;

        return {
            hasGps: !!(latitude && longitude),
            latitude,
            longitude,
            make: tags['Make']?.description,
            model: tags['Model']?.description,
            dateTime,
            iso: tags['ISOSpeedRatings']?.value ? Number(tags['ISOSpeedRatings']?.value) : undefined,
            fNumber: tags['FNumber']?.description ? parseFloat(tags['FNumber']?.description) : undefined,
            rawTags: tags,
        };
    } catch (error) {
        console.error("Error parsing EXIF:", error);
        // Return empty metadata on error instead of breaking
        return {
            hasGps: false,
            rawTags: {},
        };
    }
}
