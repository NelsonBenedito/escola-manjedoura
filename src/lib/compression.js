import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;

/**
 * Compresses an image file
 */
export async function compressImage(file, { maxSizeMB = 1, maxWidthOrHeight = 1920 } = {}) {
    const options = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
    };
    try {
        const compressedFile = await imageCompression(file, options);
        console.log(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        return file; // Fallback to original
    }
}

/**
 * Loads FFmpeg library
 */
async function loadFFmpeg() {
    if (ffmpeg) return ffmpeg;

    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    console.log("Iniciando motor de compressão...");
    
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    return ffmpeg;
}

/**
 * Compresses a video file
 */
export async function compressVideo(file, onProgress = () => {}) {
    try {
        const ffmpeg = await loadFFmpeg();
        const { name } = file;
        
        ffmpeg.on('log', ({ message }) => {
            // Log apenas progresso para não poluir o console
            if (message.includes('frame=')) console.log("Processando:", message);
        });

        ffmpeg.on('progress', ({ progress }) => {
            onProgress(Math.round(progress * 100));
        });

        await ffmpeg.writeFile(name, await fetchFile(file));

        console.log(`Comprimindo ${name}... (Otimizado para VELOCIDADE: 720p + Ultrafast)`);

        /**
         * ESTRATÉGIA DE VELOCIDADE MÁXIMA:
         * 1. scale=1280:-2 -> Reduz para 720p (se for maior), o que economiza MUITO tempo.
         * 2. -preset ultrafast -> O ajuste mais rápido possível do encoder x264.
         * 3. -crf 32 -> Comprime um pouco mais agressivamente para terminar logo (qualidade ainda boa para web).
         * 4. -tune fastdecode -> Otimiza para decodificar rápido.
         */
        await ffmpeg.exec([
            '-i', name, 
            '-vf', "scale='min(1280,iw)':-2", 
            '-vcodec', 'libx264', 
            '-crf', '32', 
            '-preset', 'ultrafast',
            '-tune', 'fastdecode',
            '-movflags', 'faststart',
            'output.mp4'
        ]);

        const data = await ffmpeg.readFile('output.mp4');
        const compressedFile = new File([data.buffer], name.replace(/\.[^/.]+$/, "") + "_compressed.mp4", { type: 'video/mp4' });

        console.log(`Concluído! De ${(file.size / 1024 / 1024).toFixed(2)}MB para ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        
        // Limpeza
        await ffmpeg.deleteFile(name);
        await ffmpeg.deleteFile('output.mp4');

        return compressedFile;
    } catch (error) {
        console.error('Falha na compressão:', error);
        return file; // Fallback para original em caso de erro
    }
}
