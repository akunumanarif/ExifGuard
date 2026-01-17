import piexif from 'piexifjs';

self.onmessage = async (e: MessageEvent) => {
    const { id, file } = e.data;

    try {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;

            // Scrub
            const cleanBase64 = piexif.remove(result);

            // Convert to Blob
            const byteCharacters = atob(cleanBase64.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: file.type });

            self.postMessage({ id, success: true, blob });
        };
        reader.onerror = () => {
            self.postMessage({ id, success: false, error: 'Failed to read file' });
        };
        reader.readAsDataURL(file);
    } catch (error: any) {
        self.postMessage({ id, success: false, error: error.message });
    }
};
