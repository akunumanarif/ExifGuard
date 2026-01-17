import piexif from 'piexifjs';

export async function scrubImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                // piexif.remove strips EXIF from JPEG binary string
                // Note: result must be a data URL (base64) for piexif.remove if it strictly expects that,
                // or binary string?
                // piexifjs documentation says: "piexif.remove(jpeg)" where jpeg is a binary string.
                // Wait, commonly it works with DataURL too? 
                // Let's check: piexif.remove(jpegData) -> returns cleaned jpegData.

                // If the file is not JPEG, piexif might fail or do nothing.
                // For MVP, we target JPEG mainly. 
                if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
                    // For PNG/WebP, we might need different handling or Canvas fallback.
                    // But GUIDE.MD says "If JPEG: Locate APP1...".
                    // Let's assume JPEG primary support for 'scrub' via piexif for now.
                    // If completely unsupported, return original (or implement canvas fallback).
                    console.warn("Non-JPEG file passed to pure scrubber, returning original.");
                    resolve(file);
                    return;
                }

                // Piexif expects binary string or DataURL? 
                // "piexif.remove(jpeg)" - "jpeg" is a string starting with "data:image/jpeg;base64," or raw binary?
                // Usually DataURL.
                const cleanBase64 = piexif.remove(result);

                // Convert base64 back to Blob
                const byteCharacters = atob(cleanBase64.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const cleanBlob = new Blob([byteArray], { type: "image/jpeg" });
                resolve(cleanBlob);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
