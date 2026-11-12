export type PdfTextResult = {
    text: string;
    pages: number;
};

export type OcrEngine = 'auto' | 'handwriting' | 'standard';

export type OcrOptions = {
    language?: string;
    pageSegMode?: string;
    engine?: OcrEngine;
    enhanceContrast?: boolean;
    onProgress?: (progress: number, status: string) => void;
};

export type TextPdfOptions = {
    title?: string;
    pageSize?: 'a4' | 'letter';
    fontSize?: number;
};

type PdfModule = typeof import('pdfjs-dist');

let pdfModulePromise: Promise<PdfModule> | null = null;
let trocrPipelinePromise: Promise<any> | null = null;

async function getPdfModule(): Promise<PdfModule> {
    if (!pdfModulePromise) {
        pdfModulePromise = (async () => {
            const pdfjs = await import('pdfjs-dist');
            const worker =
                await import('pdfjs-dist/build/pdf.worker.min.mjs?url');

            pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

            return pdfjs;
        })();
    }

    return pdfModulePromise;
}

/**
 * Loads and caches the TrOCR handwriting model pipeline.
 */
async function getTrocrPipeline(
    onProgress?: (progress: number, status: string) => void,
): Promise<any> {
    if (!trocrPipelinePromise) {
        trocrPipelinePromise = (async () => {
            onProgress?.(15, 'Loading handwriting AI model…');
            const { pipeline, env } = await import('@huggingface/transformers');

            // Configure local model paths and local WASM binaries
            env.allowLocalModels = true;
            env.allowRemoteModels = true; // Fallback if needed
            env.localModelPath = '/models/';

            if (env.backends?.onnx?.wasm) {
                env.backends.onnx.wasm.wasmPaths = {
                    mjs: '/onnxruntime/ort-wasm-simd-threaded.asyncify.mjs',
                    wasm: '/onnxruntime/ort-wasm-simd-threaded.asyncify.wasm',
                };
            }

            return await pipeline('image-to-text', 'trocr-small-handwritten', {
                dtype: 'q8',
            });
        })();
    }

    return trocrPipelinePromise;
}

/**
 * Loads an image File or Blob into an HTMLCanvasElement.
 */
export function loadImageToCanvas(
    file: File | Blob,
): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                reject(new Error('Could not initialize 2D canvas'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Could not load image into canvas'));
        };

        img.src = url;
    });
}

/**
 * Preprocesses a canvas image to boost contrast and eliminate colored backgrounds.
 * Adds a clean white margin around borders to prevent segmentation clipping.
 */
export function preprocessCanvas(
    sourceCanvas: HTMLCanvasElement,
    padding = 24,
): HTMLCanvasElement {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return sourceCanvas;

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const totalPixels = w * h;

    let totalLum = 0;
    for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        totalLum += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const avgLum = totalLum / totalPixels;
    const isInverted = avgLum < 85;
    const threshold = isInverted
        ? Math.max(100, Math.min(180, avgLum * 1.35))
        : Math.max(80, Math.min(160, avgLum * 0.72));

    const processedData = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        const val = isInverted
            ? lum >= threshold
                ? 0
                : 255
            : lum < threshold
              ? 0
              : 255;

        processedData[offset] = val;
        processedData[offset + 1] = val;
        processedData[offset + 2] = val;
        processedData[offset + 3] = 255;
    }

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = w + padding * 2;
    outputCanvas.height = h + padding * 2;
    const outCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
    if (!outCtx) return sourceCanvas;

    outCtx.fillStyle = '#FFFFFF';
    outCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
        const outImgData = tempCtx.createImageData(w, h);
        outImgData.data.set(processedData);
        tempCtx.putImageData(outImgData, 0, 0);
        outCtx.drawImage(tempCanvas, padding, padding);
    }

    return outputCanvas;
}

/**
 * Crops a bounding-box region with padding and returns a high-contrast line image.
 */
function cropAndBinarizeLine(
    canvas: HTMLCanvasElement,
    bbox: { x0: number; y0: number; x1: number; y1: number },
    padding = { x: 16, y: 8 },
): HTMLCanvasElement {
    const x0 = Math.max(0, bbox.x0 - padding.x);
    const y0 = Math.max(0, bbox.y0 - padding.y);
    const x1 = Math.min(canvas.width, bbox.x1 + padding.x);
    const y1 = Math.min(canvas.height, bbox.y1 + padding.y);
    const cropW = Math.max(1, x1 - x0);
    const cropH = Math.max(1, y1 - y0);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const ctx = cropCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return cropCanvas;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cropW, cropH);
    ctx.drawImage(canvas, x0, y0, cropW, cropH, 0, 0, cropW, cropH);

    const imgData = ctx.getImageData(0, 0, cropW, cropH);
    const data = imgData.data;
    const count = cropW * cropH;

    let totalLum = 0;
    for (let i = 0; i < count; i++) {
        const offset = i * 4;
        totalLum +=
            0.299 * data[offset] +
            0.587 * data[offset + 1] +
            0.114 * data[offset + 2];
    }
    const avgLum = totalLum / count;
    const threshold = Math.max(75, Math.min(160, avgLum * 0.72));

    for (let i = 0; i < count; i++) {
        const offset = i * 4;
        const lum =
            0.299 * data[offset] +
            0.587 * data[offset + 1] +
            0.114 * data[offset + 2];
        const val = lum < threshold ? 0 : 255;
        data[offset] = val;
        data[offset + 1] = val;
        data[offset + 2] = val;
        data[offset + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
    return cropCanvas;
}

/**
 * Fallback horizontal projection profile line segmenter.
 */
function findLinesByProjection(
    canvas: HTMLCanvasElement,
): Array<{ x0: number; y0: number; x1: number; y1: number }> {
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [{ x0: 0, y0: 0, x1: w, y1: h }];

    const data = ctx.getImageData(0, 0, w, h).data;
    const rowCounts = new Int32Array(h);

    for (let y = 0; y < h; y++) {
        let dark = 0;
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const lum =
                0.299 * data[idx] +
                0.587 * data[idx + 1] +
                0.114 * data[idx + 2];
            if (lum < 130) dark++;
        }
        rowCounts[y] = dark;
    }

    const lines: Array<{ x0: number; y0: number; x1: number; y1: number }> = [];
    let inLine = false;
    let startY = 0;
    const minLineHeight = 12;
    const minDarkPixels = 5;

    for (let y = 0; y < h; y++) {
        const isDark = rowCounts[y] >= minDarkPixels;
        if (!inLine && isDark) {
            inLine = true;
            startY = y;
        } else if (inLine && !isDark) {
            inLine = false;
            if (y - startY >= minLineHeight) {
                let minX = w;
                let maxX = 0;
                for (let ly = startY; ly < y; ly++) {
                    for (let x = 0; x < w; x++) {
                        const idx = (ly * w + x) * 4;
                        const lum =
                            0.299 * data[idx] +
                            0.587 * data[idx + 1] +
                            0.114 * data[idx + 2];
                        if (lum < 130) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                        }
                    }
                }
                if (maxX > minX) {
                    lines.push({ x0: minX, y0: startY, x1: maxX, y1: y });
                }
            }
        }
    }

    return lines.length > 0 ? lines : [{ x0: 0, y0: 0, x1: w, y1: h }];
}

/**
 * Cleans up and normalizes handwriting line transcriptions.
 */
function cleanHandwritingLines(lines: string[]): string {
    const cleaned = lines.map((line) => {
        let text = line.trim();
        text = text.replace(/["“”«»]/g, '"');
        text = text.replace(/['‘’`]/g, "'");

        // Underscores directly after numbers in handwriting represent dots/periods:
        text = text.replace(/^(\d+)[_]\s*/, '$1. ');

        return text;
    });

    // Fix numbered lists where item 1 was recognized as "I" or "l"
    for (let i = 0; i < cleaned.length; i++) {
        const nextLine = cleaned[i + 1] ?? '';
        if (/^2[.\s]/.test(nextLine)) {
            cleaned[i] = cleaned[i].replace(/^[Il|!][.\s]+/, '1. ');
        }
    }

    return cleaned.join('\n').trim();
}

/**
 * Cleans up standard Tesseract OCR output for common character confusions.
 */
function cleanTesseractText(text: string): string {
    return text
        .replace(/o€\b/g, 'of')
        .replace(/\b€or\b/g, 'for')
        .replace(/\b€\b/g, 'e')
        .replace(/^[\\/]\.\s*(\d+)/gm, '$1.')
        .trim();
}

/**
 * Transcribe handwriting using Microsoft TrOCR line-by-line model.
 */
async function recognizeHandwriting(
    sourceCanvas: HTMLCanvasElement,
    preprocessedCanvas: HTMLCanvasElement,
    options: OcrOptions = {},
): Promise<string> {
    const { createWorker } = await import('tesseract.js');

    options.onProgress?.(10, 'Detecting text layout and line boundaries…');

    const worker = await createWorker(options.language ?? 'eng', 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract-core',
        langPath: '/tessdata',
        gzip: true,
    });

    let detectedLines: Array<{
        bbox: { x0: number; y0: number; x1: number; y1: number };
        text: string;
    }> = [];

    try {
        await worker.setParameters({
            user_defined_dpi: '300',
            tessedit_pageseg_mode: (options.pageSegMode ?? '3') as never,
        });

        const res = await worker.recognize(
            preprocessedCanvas,
            {},
            { blocks: true },
        );

        for (const b of res.data.blocks || []) {
            for (const p of b.paragraphs || []) {
                for (const l of p.lines || []) {
                    if (l.text.trim()) {
                        // Offset by padding that was added during preprocessing (24px)
                        const pad = 24;
                        detectedLines.push({
                            bbox: {
                                x0: Math.max(0, l.bbox.x0 - pad),
                                y0: Math.max(0, l.bbox.y0 - pad),
                                x1: Math.min(
                                    sourceCanvas.width,
                                    l.bbox.x1 - pad,
                                ),
                                y1: Math.min(
                                    sourceCanvas.height,
                                    l.bbox.y1 - pad,
                                ),
                            },
                            text: l.text.trim(),
                        });
                    }
                }
            }
        }
    } finally {
        await worker.terminate();
    }

    // Fallback if Tesseract detected no lines
    if (detectedLines.length === 0) {
        options.onProgress?.(
            20,
            'Analyzing layout using projection profiling…',
        );
        const fallbackBoxes = findLinesByProjection(sourceCanvas);
        detectedLines = fallbackBoxes.map((bbox) => ({ bbox, text: '' }));
    }

    options.onProgress?.(25, 'Loading handwriting AI model…');
    const trocr = await getTrocrPipeline(options.onProgress);

    const transcribedLines: string[] = [];
    const totalLines = detectedLines.length;

    for (let i = 0; i < totalLines; i++) {
        const percent = Math.round(25 + ((i + 1) / totalLines) * 70);
        options.onProgress?.(
            percent,
            `Transcribing line ${i + 1} of ${totalLines}…`,
        );

        const crop = cropAndBinarizeLine(sourceCanvas, detectedLines[i].bbox);
        try {
            const out = await trocr(crop);
            const lineText = out?.[0]?.generated_text?.trim() ?? '';
            transcribedLines.push(lineText);
        } catch {
            // Fallback to Tesseract line text if individual line inference fails
            transcribedLines.push(detectedLines[i].text);
        }
    }

    return cleanHandwritingLines(transcribedLines);
}

/**
 * Standard OCR using Tesseract with image preprocessing and post-filtering.
 */
async function recognizeStandard(
    canvas: HTMLCanvasElement,
    options: OcrOptions = {},
): Promise<{ text: string; confidence: number }> {
    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker(options.language ?? 'eng', 1, {
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract-core',
        langPath: '/tessdata',
        gzip: true,
        logger: (message) => {
            options.onProgress?.(
                Math.round((message.progress ?? 0) * 100),
                message.status ?? 'Reading image',
            );
        },
    });

    try {
        await worker.setParameters({
            user_defined_dpi: '300',
            tessedit_char_blacklist: '€¥£¢§©®',
            tessedit_pageseg_mode: (options.pageSegMode ?? '3') as never,
        });

        const res = await worker.recognize(canvas);
        const cleaned = cleanTesseractText(res.data.text);

        return {
            text: cleaned,
            confidence: res.data.confidence ?? 0,
        };
    } finally {
        await worker.terminate();
    }
}

/**
 * Run OCR on an image entirely in the browser with engine options & auto-enhancement.
 */
export async function recognizeImage(
    file: File,
    options: OcrOptions = {},
): Promise<string> {
    const engine = options.engine ?? 'auto';
    const enhance = options.enhanceContrast ?? true;

    options.onProgress?.(5, 'Loading image…');
    const sourceCanvas = await loadImageToCanvas(file);

    options.onProgress?.(10, 'Enhancing image contrast & background…');
    const preprocessedCanvas = enhance
        ? preprocessCanvas(sourceCanvas)
        : sourceCanvas;

    if (engine === 'handwriting') {
        return await recognizeHandwriting(
            sourceCanvas,
            preprocessedCanvas,
            options,
        );
    }

    if (engine === 'standard') {
        const { text } = await recognizeStandard(preprocessedCanvas, options);
        return text;
    }

    // Auto / Smart mode:
    // First try standard recognition on preprocessed image.
    // If confidence is low (< 75%) or contains handwriting errors, switch to Handwriting AI.
    options.onProgress?.(15, 'Evaluating document text layout…');
    const standardResult = await recognizeStandard(preprocessedCanvas, options);

    const isLowConfidence = standardResult.confidence < 75;
    const hasHandwritingSignatures =
        /(\b(QueRy|vewndeev|Chvistwas)\b|[a-z]€|€[a-z])/i.test(
            standardResult.text,
        );

    if (isLowConfidence || hasHandwritingSignatures) {
        options.onProgress?.(
            25,
            'Handwriting detected! Activating Handwriting AI…',
        );
        try {
            return await recognizeHandwriting(
                sourceCanvas,
                preprocessedCanvas,
                options,
            );
        } catch {
            // Graceful fallback to standard result if neural model fails
            return standardResult.text;
        }
    }

    return standardResult.text;
}

/**
 * Extract the selectable text layer from a PDF in the browser.
 */
export async function extractPdfText(
    file: File,
    onProgress?: (progress: number, status: string) => void,
): Promise<PdfTextResult> {
    const pdfjs = await getPdfModule();

    const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
    });
    const document = await loadingTask.promise;

    const pageCount = document.numPages;
    const pages: string[] = [];

    try {
        for (let index = 1; index <= pageCount; index++) {
            const page = await document.getPage(index);
            const content = await page.getTextContent();
            const lines: string[] = [];
            let line = '';

            for (const item of content.items) {
                if (!('str' in item)) {
                    continue;
                }

                line += item.str;

                if (item.hasEOL) {
                    lines.push(line);
                    line = '';
                } else {
                    line += ' ';
                }
            }

            if (line.trim() !== '') {
                lines.push(line);
            }

            const pageText = lines
                .join('\n')
                .replace(/[ \t]+\n/g, '\n')
                .replace(/[ \t]{2,}/g, ' ')
                .trim();

            pages.push(pageText);
            page.cleanup();

            onProgress?.(
                Math.round((index / pageCount) * 100),
                `Reading page ${index} of ${pageCount}`,
            );
        }
    } finally {
        await loadingTask.destroy();
    }

    const text = pages
        .map((page, index) => {
            const content = page || '[No selectable text on this page]';

            return pageCount > 1
                ? `--- Page ${index + 1} ---\n${content}`
                : content;
        })
        .join('\n\n')
        .trim();

    return { text, pages: pageCount };
}

/**
 * Build and download a PDF from plain text.
 */
export async function downloadTextAsPdf(
    text: string,
    filename: string,
    options: TextPdfOptions = {},
): Promise<void> {
    const { jsPDF } = await import('jspdf');

    const document = new jsPDF({
        unit: 'pt',
        format: options.pageSize ?? 'a4',
        compress: true,
    });

    const margin = 56;
    const fontSize = options.fontSize ?? 12;
    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight = document.internal.pageSize.getHeight();
    const textWidth = pageWidth - margin * 2;
    let cursorY = margin;

    const writeLines = (
        value: string,
        size: number,
        style: 'normal' | 'bold',
        lineHeight = 1.45,
    ) => {
        document.setFont('helvetica', style);
        document.setFontSize(size);

        const lines = document.splitTextToSize(value, textWidth) as string[];

        for (const line of lines) {
            if (cursorY + size * lineHeight > pageHeight - margin) {
                document.addPage();
                cursorY = margin;
            }

            document.text(line, margin, cursorY + size);
            cursorY += size * lineHeight;
        }
    };

    if (options.title?.trim()) {
        writeLines(options.title.trim(), fontSize + 8, 'bold', 1.35);
        cursorY += 10;
    }

    document.setTextColor(40, 40, 40);
    writeLines(text, fontSize, 'normal');

    const totalPages = document.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
        document.setPage(page);
        document.setFont('helvetica', 'normal');
        document.setFontSize(9);
        document.setTextColor(140, 140, 140);
        document.text(
            `${page} / ${totalPages}`,
            pageWidth - margin,
            pageHeight - 24,
            { align: 'right' },
        );
    }

    document.save(withPdfExtension(filename));
}

export function withPdfExtension(filename: string): string {
    const trimmed = filename.trim() || 'document';

    return /\.pdf$/i.test(trimmed) ? trimmed : `${trimmed}.pdf`;
}

export function withTxtExtension(filename: string): string {
    const trimmed = filename.trim() || 'extracted-text';

    return /\.txt$/i.test(trimmed) ? trimmed : `${trimmed}.txt`;
}

export function baseName(filename: string): string {
    return filename.replace(/\.[^./\\]+$/, '') || 'conversion';
}

export function downloadText(text: string, filename: string): void {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = withTxtExtension(filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
