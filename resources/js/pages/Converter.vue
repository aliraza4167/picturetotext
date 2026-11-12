<script setup lang="ts">
import { Head, Link, usePage } from '@inertiajs/vue3';
import type { LucideIcon } from '@lucide/vue';
import {
    ChevronsUpDown,
    Download,
    FileDown,
    FileText,
    Image as ImageIcon,
    Languages,
    LoaderCircle,
    Save,
    ScanLine,
    ScanText,
    ShieldCheck,
    Sparkles,
    SquarePen,
    TriangleAlert,
    Zap,
} from '@lucide/vue';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';
import SiteFooter from '@/components/SiteFooter.vue';
import SiteHeader, { type ToolSelection } from '@/components/SiteHeader.vue';
import HistoryList from '@/components/converter/HistoryList.vue';
import Dropzone from '@/components/converter/Dropzone.vue';
import ResultPanel from '@/components/converter/ResultPanel.vue';
import UserInfo from '@/components/UserInfo.vue';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import {
    baseName,
    downloadTextAsPdf,
    extractPdfText,
    recognizeImage,
    type OcrEngine,
} from '@/lib/converters';
import { formatBytes, formatNumber } from '@/lib/format';
import type {
    ConversionStats,
    ConversionSummary,
    ConversionType,
} from '@/types/converter';

type Mode = ConversionType;

const props = defineProps<{
    recentConversions: ConversionSummary[];
    stats: ConversionStats | null;
}>();

const page = usePage();
const user = computed(() => page.props.auth.user);

const modes: Array<{
    id: Mode;
    label: string;
    hint: string;
    title: string;
    description: string;
    action: string;
    icon: LucideIcon;
}> = [
    {
        id: 'image',
        label: 'Image to text',
        hint: 'OCR a photo or scan',
        title: 'Turn an image into editable text',
        description:
            'Upload a photo, screenshot, scan or handwritten note and pull the words out with on-device OCR.',
        action: 'Extract text',
        icon: ImageIcon,
    },
    {
        id: 'pdf',
        label: 'PDF to text',
        hint: 'Copy text from a PDF',
        title: 'Lift the text out of a PDF',
        description:
            'Read the selectable text layer of a PDF and keep the page order intact. Perfect for copying or editing.',
        action: 'Extract text',
        icon: FileText,
    },
    {
        id: 'text',
        label: 'Text to PDF',
        hint: 'Make a clean document',
        title: 'Turn your writing into a PDF',
        description:
            'Paste or type anything, add a title and choose your page setup. We will format and download a clean PDF.',
        action: 'Download PDF',
        icon: FileDown,
    },
];

const activeMode = ref<Mode>('image');
const busy = ref<Mode | null>(null);
const progress = ref(0);
const progressLabel = ref('');
const error = ref('');

const imageFile = ref<File | null>(null);
const imagePreview = ref('');
const imageText = ref('');
const imagePsm = ref('3');
const imageEngine = ref<OcrEngine>('auto');
const enhanceContrast = ref(true);

const pdfFile = ref<File | null>(null);
const pdfText = ref('');
const pdfPages = ref<number | null>(null);

const documentTitle = ref('');
const documentText = ref('');
const pdfPageSize = ref<'a4' | 'letter'>('a4');
const pdfFontSize = ref(12);

const history = ref<ConversionSummary[]>([...props.recentConversions]);
const stats = ref<ConversionStats | null>(
    props.stats ? { ...props.stats } : null,
);
const savingKey = ref<Mode | null>(null);
const loadingHistoryId = ref<number | null>(null);
const deletingHistoryId = ref<number | null>(null);
const saved = reactive<Record<Mode, boolean>>({
    image: false,
    pdf: false,
    text: false,
});

const activeModeConfig = computed(() =>
    modes.find((mode) => mode.id === activeMode.value)!,
);
const isBusy = computed(() => busy.value !== null);
const canSave = computed(() => user.value !== null);

const imageFilename = computed(
    () => `${baseName(imageFile.value?.name ?? 'extracted-text')}-text`,
);
const pdfFilename = computed(
    () => `${baseName(pdfFile.value?.name ?? 'extracted-text')}-text`,
);
const pdfPreviewFilename = computed(
    () => `${baseName(documentTitle.value || 'document')}`,
);
const pageSizeLabel = computed(() =>
    pdfPageSize.value === 'a4' ? 'A4' : 'US Letter',
);
const documentCharacterCount = computed(() => documentText.value.length);
const documentWordCount = computed(() => {
    const words = documentText.value.trim().match(/\S+/g);

    return words ? words.length : 0;
});

const psmOptions = [
    { value: '3', label: 'Automatic page layout' },
    { value: '4', label: 'Single column of text' },
    { value: '6', label: 'Single uniform block' },
    { value: '11', label: 'Sparse text (labels, signs)' },
    { value: '7', label: 'Single line' },
];

const engineOptions: Array<{ value: OcrEngine; label: string }> = [
    { value: 'auto', label: 'Auto (Smart handwriting & document recognition)' },
    { value: 'handwriting', label: 'Handwriting & Notes AI (TrOCR)' },
    { value: 'standard', label: 'Standard OCR (Printed documents)' },
];

function setMode(mode: Mode): void {
    activeMode.value = mode;
    error.value = '';
    progress.value = 0;
    progressLabel.value = '';
}

function selectImage(file: File): void {
    if (!file.type.startsWith('image/')) {
        toast.error('Please choose an image file');
        return;
    }

    if (file.size > 25 * 1024 * 1024) {
        toast.error('Images must be 25 MB or smaller');
        return;
    }

    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }

    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
    imageText.value = '';
    saved.image = false;
    error.value = '';
}

function clearImage(): void {
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }

    imageFile.value = null;
    imagePreview.value = '';
    imageText.value = '';
    saved.image = false;
}

function selectPdf(file: File): void {
    const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
        toast.error('Please choose a PDF file');
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        toast.error('PDFs must be 50 MB or smaller');
        return;
    }

    pdfFile.value = file;
    pdfText.value = '';
    pdfPages.value = null;
    saved.pdf = false;
    error.value = '';
}

function clearPdf(): void {
    pdfFile.value = null;
    pdfText.value = '';
    pdfPages.value = null;
    saved.pdf = false;
}

function friendlyStatus(status: string): string {
    const lower = status.toLowerCase();
    const labels: Record<string, string> = {
        'loading tesseract core': 'Loading the OCR engine…',
        'initializing tesseract': 'Waking up the OCR engine…',
        'loading language traineddata': 'Loading the English language model…',
        'initializing api': 'Preparing the recognizer…',
        'reading image': 'Reading the image…',
        'recognizing text': 'Reading the image…',
        'loading image…': 'Loading the image…',
        'enhancing image contrast & background…':
            'Cleaning background & boosting contrast…',
        'evaluating document text layout…':
            'Evaluating document text structure…',
        'detecting text layout and line boundaries…':
            'Detecting lines and handwriting layout…',
        'loading handwriting ai model…': 'Loading handwriting AI model…',
        'handwriting detected! activating handwriting ai…':
            'Handwriting detected! Activating Handwriting AI…',
    };

    if (labels[lower]) {
        return labels[lower];
    }

    if (
        status.startsWith('Transcribing line') ||
        status.startsWith('Reading page')
    ) {
        return status;
    }

    return (
        labels[status] ?? `${status.charAt(0).toUpperCase()}${status.slice(1)}`
    );
}

async function extractImage(): Promise<void> {
    if (!imageFile.value || isBusy.value) {
        return;
    }

    busy.value = 'image';
    error.value = '';
    progress.value = 0;
    progressLabel.value = 'Preparing the OCR engine…';
    saved.image = false;

    try {
        const text = await recognizeImage(imageFile.value, {
            engine: imageEngine.value,
            enhanceContrast: enhanceContrast.value,
            pageSegMode: imagePsm.value,
            onProgress: (value, status) => {
                progress.value = value;
                progressLabel.value = friendlyStatus(status);
            },
        });

        imageText.value = text;
        progress.value = 100;

        if (text.trim() === '') {
            toast.warning('No readable text found', {
                description:
                    'Try a sharper, higher-contrast image or switch the recognition mode.',
            });
        } else {
            toast.success('Image converted to text');
        }
    } catch (cause) {
        error.value =
            cause instanceof Error
                ? cause.message
                : 'Something went wrong while reading the image.';
        toast.error('Could not read this image', {
            description: error.value,
        });
    } finally {
        busy.value = null;
    }
}

async function extractPdf(): Promise<void> {
    if (!pdfFile.value || isBusy.value) {
        return;
    }

    busy.value = 'pdf';
    error.value = '';
    progress.value = 0;
    progressLabel.value = 'Opening the PDF…';
    saved.pdf = false;

    try {
        const result = await extractPdfText(pdfFile.value, (value, status) => {
            progress.value = value;
            progressLabel.value = status;
        });

        pdfText.value = result.text;
        pdfPages.value = result.pages;
        progress.value = 100;

        const hasSelectableText =
            result.text
                .replace(/--- Page \d+ ---/g, '')
                .replace(/\[No selectable text on this page\]/g, '')
                .trim() !== '';

        if (hasSelectableText) {
            toast.success(
                `Extracted text from ${formatNumber(result.pages)} ${result.pages === 1 ? 'page' : 'pages'}`,
            );
        } else {
            toast.warning('This PDF looks like a scan', {
                description:
                    'There is no selectable text layer. Export the pages as images and use the image OCR tab instead.',
            });
        }
    } catch (cause) {
        error.value =
            cause instanceof Error
                ? cause.message
                : 'Something went wrong while reading the PDF.';
        toast.error('Could not read this PDF', {
            description: error.value,
        });
    } finally {
        busy.value = null;
    }
}

async function createPdf(): Promise<void> {
    if (documentText.value.trim() === '') {
        toast.error('Add some text before creating the PDF');
        return;
    }

    if (isBusy.value) {
        return;
    }

    busy.value = 'text';
    error.value = '';
    progress.value = 20;
    progressLabel.value = 'Laying out your document…';
    saved.text = false;

    try {
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 0);
        });

        progress.value = 70;

        await downloadTextAsPdf(documentText.value, pdfPreviewFilename.value, {
            title: documentTitle.value,
            pageSize: pdfPageSize.value,
            fontSize: pdfFontSize.value,
        });

        progress.value = 100;
        toast.success('PDF downloaded');
    } catch (cause) {
        error.value =
            cause instanceof Error
                ? cause.message
                : 'Something went wrong while creating the PDF.';
        toast.error('Could not create this PDF', {
            description: error.value,
        });
    } finally {
        busy.value = null;
    }
}

function csrfToken(): string {
    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

async function saveConversion(
    type: Mode,
    sourceName: string,
    sourceSize: number,
    pageCount: number | null,
    text: string,
): Promise<void> {
    if (!user.value) {
        toast.info('Sign in to save your history');
        return;
    }

    if (text.trim() === '') {
        toast.error('There is nothing to save yet');
        return;
    }

    savingKey.value = type;

    try {
        const response = await fetch('/conversions', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': csrfToken(),
            },
            body: JSON.stringify({
                type,
                source_name: sourceName,
                source_size: sourceSize,
                page_count: pageCount,
                output_text: text,
            }),
        });

        if (!response.ok) {
            throw new Error('The conversion could not be saved.');
        }

        const payload = (await response.json()) as {
            conversion: ConversionSummary;
        };

        history.value = [payload.conversion, ...history.value].slice(0, 12);
        saved[type] = true;

        if (stats.value) {
            stats.value.total += 1;
            stats.value.characters += payload.conversion.character_count;

            if (type === 'image') {
                stats.value.images += 1;
            }

            if (type === 'pdf') {
                stats.value.pdfs += 1;
            }
        }

        toast.success('Saved to your history');
    } catch (cause) {
        toast.error('Could not save this conversion', {
            description: cause instanceof Error ? cause.message : undefined,
        });
    } finally {
        savingKey.value = null;
    }
}

function saveImage(): void {
    void saveConversion(
        'image',
        imageFile.value?.name ?? 'Image OCR',
        imageFile.value?.size ?? 0,
        null,
        imageText.value,
    );
}

function savePdf(): void {
    void saveConversion(
        'pdf',
        pdfFile.value?.name ?? 'PDF conversion',
        pdfFile.value?.size ?? 0,
        pdfPages.value,
        pdfText.value,
    );
}

function saveText(): void {
    void saveConversion(
        'text',
        `${documentTitle.value || 'Document'}.pdf`,
        0,
        null,
        documentText.value,
    );
}

async function openConversion(item: ConversionSummary): Promise<void> {
    loadingHistoryId.value = item.id;

    try {
        const response = await fetch(`/conversions/${item.id}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            throw new Error('The saved conversion could not be opened.');
        }

        const payload = (await response.json()) as {
            conversion: ConversionSummary & { output_text: string | null };
        };
        const text = payload.conversion.output_text ?? '';

        if (item.type === 'image') {
            clearImage();
            imageText.value = text;
            activeMode.value = 'image';
        } else if (item.type === 'pdf') {
            clearPdf();
            pdfText.value = text;
            pdfPages.value = item.page_count;
            activeMode.value = 'pdf';
        } else {
            documentText.value = text;
            documentTitle.value = baseName(item.source_name ?? 'document');
            activeMode.value = 'text';
        }

        saved[item.type] = true;
        toast.success('Opened from your history');
        scrollToWorkspace();
    } catch (cause) {
        toast.error('Could not open this conversion', {
            description: cause instanceof Error ? cause.message : undefined,
        });
    } finally {
        loadingHistoryId.value = null;
    }
}

async function deleteConversion(item: ConversionSummary): Promise<void> {
    deletingHistoryId.value = item.id;

    try {
        const response = await fetch(`/conversions/${item.id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': csrfToken(),
            },
        });

        if (!response.ok) {
            throw new Error('The saved conversion could not be deleted.');
        }

        history.value = history.value.filter(
            (conversion) => conversion.id !== item.id,
        );

        if (stats.value) {
            stats.value.total = Math.max(0, stats.value.total - 1);
            stats.value.characters = Math.max(
                0,
                stats.value.characters - item.character_count,
            );

            if (item.type === 'image') {
                stats.value.images = Math.max(0, stats.value.images - 1);
            }

            if (item.type === 'pdf') {
                stats.value.pdfs = Math.max(0, stats.value.pdfs - 1);
            }
        }

        toast.success('Removed from history');
    } catch (cause) {
        toast.error('Could not delete this conversion', {
            description: cause instanceof Error ? cause.message : undefined,
        });
    } finally {
        deletingHistoryId.value = null;
    }
}

function scrollToWorkspace(): void {
    setTimeout(() => {
        document
            .getElementById('workspace')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
}

function onSelectTool(tool: ToolSelection): void {
    if (tool === 'image') {
        setMode('image');
        imageEngine.value = 'auto';
    } else if (tool === 'handwriting') {
        setMode('image');
        imageEngine.value = 'handwriting';
    } else if (tool === 'pdf') {
        setMode('pdf');
    } else if (tool === 'text') {
        setMode('text');
    }
    scrollToWorkspace();
}

onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get('tool') as ToolSelection | null;
    if (toolParam) {
        onSelectTool(toolParam);
    }
});

onBeforeUnmount(() => {
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }
});
</script>

<template>
    <Head title="Picture to Text">
        <meta
            name="description"
            content="Extract text from images and PDFs, or turn plain text into a polished PDF. Free, private and entirely browser-based."
        />
    </Head>

    <div class="relative min-h-screen overflow-x-hidden bg-background">
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] overflow-hidden"
        >
            <div
                class="absolute -top-56 left-1/2 h-[32rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-300/40 via-indigo-300/30 to-sky-300/20 blur-3xl dark:from-violet-700/20 dark:via-indigo-700/15 dark:to-sky-700/10"
            />
            <div
                class="absolute top-24 -right-40 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-700/10"
            />
        </div>

        <SiteHeader
            :saved-count="stats?.total ?? null"
            :is-converter-page="true"
            @select-tool="onSelectTool"
        />

        <main class="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <section class="pt-14 pb-10 text-center sm:pt-20 sm:pb-14">
                <div
                    class="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
                >
                    <Sparkles class="size-3.5 text-violet-500" />
                    Private, browser-based text tools
                </div>

                <h1
                    class="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                >
                    Every file,
                    <span
                        class="bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent"
                    >
                        made readable.
                    </span>
                </h1>

                <p
                    class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                >
                    Pull text out of images and PDFs, or turn your writing into
                    a polished PDF. No uploads, no accounts required — the
                    conversion happens right here in your browser.
                </p>

                <div
                    class="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground"
                >
                    <span class="inline-flex items-center gap-1.5">
                        <ShieldCheck class="size-4 text-emerald-500" />
                        100% local processing
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                        <Zap class="size-4 text-amber-500" />
                        Instant results
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                        <Languages class="size-4 text-sky-500" />
                        English OCR
                    </span>
                </div>
            </section>

            <section id="workspace" class="scroll-mt-24">
                <div
                    class="mx-auto mb-6 flex w-full max-w-3xl flex-col gap-1.5 rounded-2xl border bg-card p-1.5 shadow-sm sm:flex-row"
                >
                    <button
                        v-for="mode in modes"
                        :key="mode.id"
                        type="button"
                        class="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                        :class="
                            activeMode === mode.id
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        "
                        @click="setMode(mode.id)"
                    >
                        <span
                            class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                            :class="
                                activeMode === mode.id
                                    ? 'bg-primary-foreground/15'
                                    : 'bg-muted'
                            "
                        >
                            <component :is="mode.icon" class="size-4" />
                        </span>
                        <span class="min-w-0">
                            <span class="block truncate text-sm font-semibold">
                                {{ mode.label }}
                            </span>
                            <span
                                class="block truncate text-[11px]"
                                :class="
                                    activeMode === mode.id
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground'
                                "
                            >
                                {{ mode.hint }}
                            </span>
                        </span>
                    </button>
                </div>

                <div
                    class="grid items-start gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
                >
                    <section
                        class="flex min-w-0 flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
                    >
                        <div class="flex items-start justify-between gap-4">
                            <div class="space-y-1">
                                <h2 class="text-lg font-semibold">
                                    {{ activeModeConfig.title }}
                                </h2>
                                <p
                                    class="text-sm leading-relaxed text-muted-foreground"
                                >
                                    {{ activeModeConfig.description }}
                                </p>
                            </div>
                            <span
                                class="hidden shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:inline"
                            >
                                Step 1
                            </span>
                        </div>

                        <template v-if="activeMode === 'image'">
                            <Dropzone
                                accept="image/png,image/jpeg,image/webp,image/bmp,image/gif,image/tiff"
                                :file="imageFile"
                                title="Drop an image to read"
                                description="PNG, JPG, WebP, BMP or TIFF · up to 25 MB"
                                :disabled="isBusy"
                                @select="selectImage"
                                @clear="clearImage"
                            >
                                <template #icon>
                                    <ScanText class="size-7" />
                                </template>
                                <template #preview>
                                    <div class="w-full space-y-3">
                                        <img
                                            v-if="imagePreview"
                                            :src="imagePreview"
                                            alt="Selected image preview"
                                            class="mx-auto max-h-64 w-auto max-w-full rounded-lg border object-contain shadow-sm"
                                        />
                                        <p
                                            class="truncate text-xs text-muted-foreground"
                                        >
                                            <span
                                                class="font-medium text-foreground"
                                            >
                                                {{ imageFile?.name }}
                                            </span>
                                            ·
                                            {{
                                                formatBytes(
                                                    imageFile?.size ?? 0,
                                                )
                                            }}
                                        </p>
                                    </div>
                                </template>
                            </Dropzone>

                            <div class="space-y-1.5">
                                <Label for="ocr-engine"
                                    >Recognition Engine</Label
                                >
                                <select
                                    id="ocr-engine"
                                    v-model="imageEngine"
                                    class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                    :disabled="isBusy"
                                >
                                    <option
                                        v-for="option in engineOptions"
                                        :key="option.value"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                            </div>

                            <div class="grid gap-3 sm:grid-cols-2">
                                <div class="space-y-1.5">
                                    <Label for="ocr-mode">Layout</Label>
                                    <select
                                        id="ocr-mode"
                                        v-model="imagePsm"
                                        class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                        :disabled="isBusy"
                                    >
                                        <option
                                            v-for="option in psmOptions"
                                            :key="option.value"
                                            :value="option.value"
                                        >
                                            {{ option.label }}
                                        </option>
                                    </select>
                                </div>
                                <div class="space-y-1.5">
                                    <Label for="ocr-language">Language</Label>
                                    <select
                                        id="ocr-language"
                                        class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                        disabled
                                    >
                                        <option>English</option>
                                    </select>
                                    <p
                                        class="text-[11px] text-muted-foreground"
                                    >
                                        English language model included.
                                    </p>
                                </div>
                            </div>

                            <label
                                class="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <input
                                    v-model="enhanceContrast"
                                    type="checkbox"
                                    class="size-4 rounded border-input text-primary focus:ring-primary"
                                    :disabled="isBusy"
                                />
                                <span
                                    >Clean colored background & boost contrast
                                    (improves accuracy)</span
                                >
                            </label>

                            <Button
                                type="button"
                                size="lg"
                                class="w-full"
                                :disabled="!imageFile || isBusy"
                                @click="extractImage"
                            >
                                <LoaderCircle
                                    v-if="busy === 'image'"
                                    class="animate-spin"
                                />
                                <ScanText v-else />
                                {{ activeModeConfig.action }}
                            </Button>
                        </template>

                        <template v-else-if="activeMode === 'pdf'">
                            <Dropzone
                                accept="application/pdf,.pdf"
                                :file="pdfFile"
                                title="Drop a PDF to read"
                                description="Text-based PDFs up to 50 MB"
                                :disabled="isBusy"
                                @select="selectPdf"
                                @clear="clearPdf"
                            >
                                <template #icon>
                                    <FileText class="size-7" />
                                </template>
                                <template #preview>
                                    <div
                                        class="flex flex-col items-center gap-2"
                                    >
                                        <div
                                            class="flex size-14 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300"
                                        >
                                            <FileText class="size-6" />
                                        </div>
                                        <p
                                            class="max-w-xs truncate text-sm font-medium"
                                        >
                                            {{ pdfFile?.name }}
                                        </p>
                                        <p
                                            class="text-xs text-muted-foreground"
                                        >
                                            {{
                                                formatBytes(pdfFile?.size ?? 0)
                                            }}
                                        </p>
                                    </div>
                                </template>
                            </Dropzone>

                            <div
                                class="flex items-start gap-2.5 rounded-lg border border-dashed bg-muted/40 px-3.5 py-3 text-xs text-muted-foreground"
                            >
                                <FileText class="mt-0.5 size-4 shrink-0" />
                                <p>
                                    Scanned PDFs without a text layer will come
                                    out empty. For those, export the pages as
                                    images and use the
                                    <button
                                        type="button"
                                        class="font-medium text-foreground underline underline-offset-2"
                                        @click="setMode('image')"
                                    >
                                        image OCR tab
                                    </button>
                                    instead.
                                </p>
                            </div>

                            <Button
                                type="button"
                                size="lg"
                                class="w-full"
                                :disabled="!pdfFile || isBusy"
                                @click="extractPdf"
                            >
                                <LoaderCircle
                                    v-if="busy === 'pdf'"
                                    class="animate-spin"
                                />
                                <FileText v-else />
                                {{ activeModeConfig.action }}
                            </Button>
                        </template>

                        <template v-else>
                            <div class="space-y-1.5">
                                <Label for="document-title">
                                    Document title
                                    <span
                                        class="font-normal text-muted-foreground"
                                    >
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="document-title"
                                    v-model="documentTitle"
                                    maxlength="120"
                                    placeholder="e.g. Project proposal"
                                    :disabled="isBusy"
                                />
                            </div>

                            <div class="space-y-1.5">
                                <Label for="document-text">Your text</Label>
                                <textarea
                                    id="document-text"
                                    v-model="documentText"
                                    rows="10"
                                    class="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                    placeholder="Start typing or paste your text here…"
                                    :disabled="isBusy"
                                />
                                <p class="text-[11px] text-muted-foreground">
                                    {{ formatNumber(documentCharacterCount) }}
                                    characters ·
                                    {{ formatNumber(documentWordCount) }}
                                    words
                                </p>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-1.5">
                                    <Label for="page-size">Page size</Label>
                                    <select
                                        id="page-size"
                                        v-model="pdfPageSize"
                                        class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                        :disabled="isBusy"
                                    >
                                        <option value="a4">A4</option>
                                        <option value="letter">
                                            US Letter
                                        </option>
                                    </select>
                                </div>
                                <div class="space-y-1.5">
                                    <Label for="font-size">Font size</Label>
                                    <select
                                        id="font-size"
                                        v-model.number="pdfFontSize"
                                        class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                        :disabled="isBusy"
                                    >
                                        <option :value="11">11 pt</option>
                                        <option :value="12">12 pt</option>
                                        <option :value="14">14 pt</option>
                                        <option :value="16">16 pt</option>
                                    </select>
                                </div>
                            </div>

                            <Button
                                type="button"
                                size="lg"
                                class="w-full"
                                :disabled="documentText.trim() === '' || isBusy"
                                @click="createPdf"
                            >
                                <LoaderCircle
                                    v-if="busy === 'text'"
                                    class="animate-spin"
                                />
                                <Download v-else />
                                {{ activeModeConfig.action }}
                            </Button>
                        </template>

                        <div
                            v-if="busy === activeMode"
                            class="space-y-2 rounded-lg border bg-muted/40 px-3.5 py-3"
                        >
                            <div
                                class="flex items-center justify-between gap-3"
                            >
                                <p class="text-xs font-medium">
                                    {{ progressLabel }}
                                </p>
                                <span
                                    class="text-xs text-muted-foreground tabular-nums"
                                >
                                    {{ progress }}%
                                </span>
                            </div>
                            <div
                                class="h-1.5 overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    class="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-[width] duration-300"
                                    :style="{ width: `${progress}%` }"
                                />
                            </div>
                        </div>

                        <div
                            v-if="error"
                            class="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-xs text-destructive"
                        >
                            <TriangleAlert class="mt-0.5 size-4 shrink-0" />
                            <p>{{ error }}</p>
                        </div>

                        <p
                            class="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                        >
                            <ShieldCheck class="size-3.5 text-emerald-500" />
                            Your files are processed locally and never uploaded.
                        </p>
                    </section>

                    <section v-if="activeMode !== 'text'" class="min-w-0">
                        <ResultPanel
                            v-if="activeMode === 'image'"
                            v-model="imageText"
                            :filename="imageFilename"
                            :can-save="canSave"
                            :saving="savingKey === 'image'"
                            :saved="saved.image"
                            @save="saveImage"
                        />
                        <ResultPanel
                            v-else
                            v-model="pdfText"
                            :filename="pdfFilename"
                            :can-save="canSave"
                            :saving="savingKey === 'pdf'"
                            :saved="saved.pdf"
                            @save="savePdf"
                        />
                    </section>

                    <section v-else class="min-w-0">
                        <div
                            class="flex min-h-[28rem] flex-col overflow-hidden rounded-xl border bg-card"
                        >
                            <div
                                class="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3.5"
                            >
                                <div class="flex items-center gap-2.5">
                                    <span
                                        class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                    >
                                        <FileDown class="size-4" />
                                    </span>
                                    <div>
                                        <p
                                            class="text-sm leading-tight font-semibold"
                                        >
                                            Live preview
                                        </p>
                                        <p
                                            class="text-xs text-muted-foreground"
                                        >
                                            {{ pageSizeLabel }} ·
                                            {{ pdfFontSize }} pt
                                        </p>
                                    </div>
                                </div>
                                <span
                                    class="text-xs text-muted-foreground tabular-nums"
                                >
                                    {{ formatNumber(documentWordCount) }} words
                                </span>
                            </div>

                            <div
                                class="flex-1 overflow-auto bg-muted/50 p-5 sm:p-6"
                            >
                                <div
                                    class="mx-auto flex min-h-[22rem] max-w-md flex-col bg-white px-7 py-9 text-slate-900 shadow-xl ring-1 ring-black/5"
                                >
                                    <h3
                                        v-if="documentTitle"
                                        class="mb-4 leading-snug font-semibold"
                                        :style="{
                                            fontSize: `${pdfFontSize + 6}px`,
                                        }"
                                    >
                                        {{ documentTitle }}
                                    </h3>
                                    <p
                                        v-if="documentText"
                                        class="leading-relaxed whitespace-pre-wrap"
                                        :style="{
                                            fontSize: `${pdfFontSize}px`,
                                        }"
                                    >
                                        {{ documentText }}
                                    </p>
                                    <p
                                        v-else
                                        class="text-slate-400"
                                        :style="{
                                            fontSize: `${pdfFontSize}px`,
                                        }"
                                    >
                                        Your document will appear here as you
                                        type. Add a title and some text, then
                                        download a clean, paginated PDF.
                                    </p>
                                </div>
                            </div>

                            <div
                                class="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-5 py-3"
                            >
                                <p class="text-xs text-muted-foreground">
                                    {{ formatNumber(documentCharacterCount) }}
                                    characters ready to export
                                </p>
                                <Button
                                    v-if="canSave"
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    :disabled="
                                        documentText.trim() === '' ||
                                        savingKey === 'text'
                                    "
                                    @click="saveText"
                                >
                                    <LoaderCircle
                                        v-if="savingKey === 'text'"
                                        class="animate-spin"
                                    />
                                    <Save v-else />
                                    {{
                                        saved.text ? 'Saved' : 'Save to history'
                                    }}
                                </Button>
                                <span
                                    v-else
                                    class="text-xs text-muted-foreground"
                                >
                                    Sign in to save your history.
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </section>

            <section class="mt-12 grid gap-4 sm:grid-cols-3">
                <div class="rounded-xl border bg-card p-5 shadow-sm">
                    <span
                        class="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    >
                        <ShieldCheck class="size-4" />
                    </span>
                    <h3 class="mt-3 text-sm font-semibold">
                        Private by default
                    </h3>
                    <p class="mt-1 text-sm text-muted-foreground">
                        Files are read in your browser with WebAssembly. Nothing
                        is uploaded to a server.
                    </p>
                </div>
                <div class="rounded-xl border bg-card p-5 shadow-sm">
                    <span
                        class="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300"
                    >
                        <ScanLine class="size-4" />
                    </span>
                    <h3 class="mt-3 text-sm font-semibold">
                        Made for real scans
                    </h3>
                    <p class="mt-1 text-sm text-muted-foreground">
                        Photos, screenshots and document scans are all fair
                        game. Tune the layout mode for tricky images.
                    </p>
                </div>
                <div class="rounded-xl border bg-card p-5 shadow-sm">
                    <span
                        class="flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300"
                    >
                        <SquarePen class="size-4" />
                    </span>
                    <h3 class="mt-3 text-sm font-semibold">Editable output</h3>
                    <p class="mt-1 text-sm text-muted-foreground">
                        Fix any OCR mistakes inline, then copy or download the
                        text — or save it to your history.
                    </p>
                </div>
            </section>

            <div class="mt-10">
                <HistoryList
                    v-if="user"
                    :conversions="history"
                    :loading-id="loadingHistoryId"
                    :deleting-id="deletingHistoryId"
                    @load="openConversion"
                    @delete="deleteConversion"
                />

                <section
                    v-else
                    class="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-7 text-white shadow-lg shadow-violet-600/20 sm:px-8"
                >
                    <div
                        aria-hidden="true"
                        class="absolute -top-20 -right-10 size-56 rounded-full bg-white/10 blur-2xl"
                    />
                    <div
                        class="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"
                    >
                        <div class="max-w-xl">
                            <h2 class="text-lg font-semibold">
                                Want to keep your conversions?
                            </h2>
                            <p class="mt-1 text-sm text-white/80">
                                Create a free account to save extracted text and
                                reopen it from any device. Your files stay local
                                either way.
                            </p>
                        </div>
                        <div class="flex shrink-0 items-center gap-2">
                            <Button
                                as-child
                                variant="secondary"
                                class="bg-white text-violet-700 hover:bg-white/90"
                            >
                                <Link href="/register">Create account</Link>
                            </Button>
                            <Button
                                as-child
                                variant="ghost"
                                class="text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href="/login">Log in</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </main>

        <SiteFooter />

        <Toaster position="top-center" rich-colors />
    </div>
</template>
