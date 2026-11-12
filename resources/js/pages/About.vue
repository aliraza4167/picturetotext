<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import {
    ArrowRight,
    Cpu,
    EyeOff,
    FileDown,
    FileText,
    HeartHandshake,
    Image as ImageIcon,
    Layers,
    Lock,
    PenLine,
    ScanText,
    ShieldCheck,
    Sparkles,
    Zap,
} from '@lucide/vue';
import SiteFooter from '@/components/SiteFooter.vue';
import SiteHeader from '@/components/SiteHeader.vue';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

const principles = [
    {
        title: 'Zero Server File Uploads',
        description:
            'Your documents and images never touch our servers. Every byte of OCR processing occurs directly inside your browser sandbox.',
        icon: EyeOff,
        color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
        title: 'Neural AI + Proven OCR',
        description:
            'We combine Tesseract.js for fast printed document OCR with Microsoft TrOCR neural vision models for handwritten notes and cursive.',
        icon: Cpu,
        color: 'text-violet-500 bg-violet-500/10',
    },
    {
        title: 'Instant Local Speed',
        description:
            'No uploading large files, no server wait queues, and no network bottlenecks. Processing begins the moment you drop an image.',
        icon: Zap,
        color: 'text-amber-500 bg-amber-500/10',
    },
    {
        title: 'Free & Accessible for All',
        description:
            'Built to empower students, researchers, developers and privacy-conscious users worldwide with clean, ad-free conversion utilities.',
        icon: HeartHandshake,
        color: 'text-sky-500 bg-sky-500/10',
    },
];

const technologies = [
    {
        name: 'Tesseract.js Core',
        role: 'Standard OCR Engine',
        description:
            'A pure JavaScript and WebAssembly port of the famous Tesseract OCR engine, running client-side with full English language model support.',
    },
    {
        name: 'Microsoft TrOCR',
        role: 'Handwriting Vision Model',
        description:
            'An end-to-end transformer-based optical character recognition model compiled for ONNX WebAssembly to read casual handwriting and cursive.',
    },
    {
        name: 'Mozilla PDF.js',
        role: 'PDF Text Extraction',
        description:
            'The industry standard client-side PDF renderer that extracts selectable text layers while preserving page boundaries.',
    },
    {
        name: 'jsPDF',
        role: 'Client-Side PDF Generator',
        description:
            'Fast, lightweight vector PDF generation that turns plain text into formatted, page-numbered, downloadable documents on the fly.',
    },
];
</script>

<template>
    <Head title="About Us — Picture to Text">
        <meta
            name="description"
            content="Learn about Picture to Text. How we use WebAssembly and on-device AI to provide 100% private image OCR, handwriting recognition, and PDF tools."
        />
    </Head>

    <div class="relative min-h-screen overflow-x-hidden bg-background">
        <!-- Background Ambient Glow -->
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] overflow-hidden"
        >
            <div
                class="absolute -top-56 left-1/2 h-[32rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-300/40 via-indigo-300/30 to-sky-300/20 blur-3xl dark:from-violet-700/20 dark:via-indigo-700/15 dark:to-sky-700/10"
            />
        </div>

        <SiteHeader />

        <main class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <!-- Hero Section -->
            <section class="text-center">
                <div
                    class="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
                >
                    <ShieldCheck class="size-3.5 text-emerald-500" />
                    Built for privacy and accuracy
                </div>

                <h1
                    class="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                >
                    Turning pictures into text,
                    <span
                        class="bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent"
                    >
                        without compromising privacy.
                    </span>
                </h1>

                <p
                    class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                >
                    Most online file converters upload your sensitive contracts,
                    tax forms, medical receipts, and personal letters to remote
                    cloud servers. We set out to prove that state-of-the-art OCR
                    can run completely inside your browser.
                </p>
            </section>

            <!-- Mission Story Section -->
            <section
                class="mt-16 rounded-2xl border bg-card/60 p-6 backdrop-blur sm:p-10"
            >
                <div
                    class="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center"
                >
                    <div class="space-y-4">
                        <div
                            class="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400"
                        >
                            <Sparkles class="size-3.5" />
                            Our Philosophy
                        </div>
                        <h2
                            class="text-2xl font-bold text-foreground sm:text-3xl"
                        >
                            Privacy by architecture, not by promise.
                        </h2>
                        <p
                            class="text-sm leading-relaxed text-muted-foreground"
                        >
                            When you drop an image or PDF into Picture to Text,
                            your browser downloads the compiled WebAssembly
                            engine and quantized neural models once. From that
                            moment on, all computations happen directly on your
                            CPU and GPU.
                        </p>
                        <p
                            class="text-sm leading-relaxed text-muted-foreground"
                        >
                            Whether you are converting a quick screenshot, an
                            old historical letter, or a multi-page PDF document,
                            your data never leaves your device. If you
                            disconnect your internet, the OCR continues to work
                            seamlessly.
                        </p>
                    </div>

                    <div
                        class="grid grid-cols-2 gap-3 rounded-xl border border-border/80 bg-background/60 p-4"
                    >
                        <div class="rounded-lg border bg-card p-4 text-center">
                            <span
                                class="text-3xl font-bold text-violet-600 dark:text-violet-400"
                            >
                                0
                            </span>
                            <p class="mt-1 text-xs text-muted-foreground">
                                Server uploads required
                            </p>
                        </div>
                        <div class="rounded-lg border bg-card p-4 text-center">
                            <span
                                class="text-3xl font-bold text-emerald-600 dark:text-emerald-400"
                            >
                                100%
                            </span>
                            <p class="mt-1 text-xs text-muted-foreground">
                                On-device client processing
                            </p>
                        </div>
                        <div class="rounded-lg border bg-card p-4 text-center">
                            <span
                                class="text-3xl font-bold text-sky-600 dark:text-sky-400"
                            >
                                4+
                            </span>
                            <p class="mt-1 text-xs text-muted-foreground">
                                Specialized conversion tools
                            </p>
                        </div>
                        <div class="rounded-lg border bg-card p-4 text-center">
                            <span
                                class="text-3xl font-bold text-fuchsia-600 dark:text-fuchsia-400"
                            >
                                AI
                            </span>
                            <p class="mt-1 text-xs text-muted-foreground">
                                TrOCR handwriting model
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Core Principles Grid -->
            <section class="mt-20">
                <div class="text-center">
                    <h2
                        class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                    >
                        Why people choose Picture to Text
                    </h2>
                    <p class="mt-2 text-sm text-muted-foreground">
                        Our core standards ensure safety, speed, and precision
                        for every task.
                    </p>
                </div>

                <div
                    class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <div
                        v-for="p in principles"
                        :key="p.title"
                        class="rounded-2xl border bg-card p-5 text-left shadow-xs transition-colors hover:border-violet-500/50"
                    >
                        <div
                            class="flex size-10 items-center justify-center rounded-xl"
                            :class="p.color"
                        >
                            <component :is="p.icon" class="size-5" />
                        </div>
                        <h3 class="mt-4 text-sm font-semibold text-foreground">
                            {{ p.title }}
                        </h3>
                        <p
                            class="mt-2 text-xs leading-relaxed text-muted-foreground"
                        >
                            {{ p.description }}
                        </p>
                    </div>
                </div>
            </section>

            <!-- Under the Hood / Tech Stack -->
            <section class="mt-20">
                <div class="text-center">
                    <h2
                        class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                    >
                        Under the Hood
                    </h2>
                    <p class="mt-2 text-sm text-muted-foreground">
                        State-of-the-art open source engineering powering
                        client-side OCR.
                    </p>
                </div>

                <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div
                        v-for="tech in technologies"
                        :key="tech.name"
                        class="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs"
                    >
                        <div>
                            <div
                                class="flex items-center justify-between gap-2"
                            >
                                <h3
                                    class="text-sm font-semibold text-foreground"
                                >
                                    {{ tech.name }}
                                </h3>
                                <span
                                    class="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                                >
                                    {{ tech.role }}
                                </span>
                            </div>
                            <p
                                class="mt-2 text-xs leading-relaxed text-muted-foreground"
                            >
                                {{ tech.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- All Tools in One Place Callout -->
            <section
                class="mt-20 overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-white shadow-lg shadow-violet-600/20 sm:p-10"
            >
                <div
                    class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"
                >
                    <div class="max-w-xl space-y-2">
                        <div
                            class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"
                        >
                            <Layers class="size-3.5" />
                            All Tools in One Place
                        </div>
                        <h2 class="text-2xl font-bold sm:text-3xl">
                            Try any conversion tool for free
                        </h2>
                        <p class="text-sm text-white/80">
                            Access Image OCR, Handwriting AI, PDF Text
                            Extractor, and Text to PDF generator in one seamless
                            workspace.
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <Button
                            as-child
                            variant="secondary"
                            class="bg-white text-violet-700 hover:bg-white/90"
                        >
                            <Link href="/?tool=image">
                                Launch Converter
                                <ArrowRight class="ml-1.5 size-4" />
                            </Link>
                        </Button>
                        <Button
                            as-child
                            variant="ghost"
                            class="text-white hover:bg-white/10 hover:text-white"
                        >
                            <Link href="/pricing">View Pricing</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>

        <SiteFooter />
        <Toaster position="top-center" rich-colors />
    </div>
</template>
