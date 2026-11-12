<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import {
    ArrowRight,
    Check,
    FileDown,
    FileText,
    HelpCircle,
    Image as ImageIcon,
    Layers,
    PenLine,
    ShieldCheck,
    Sparkles,
    Zap,
} from '@lucide/vue';
import { ref } from 'vue';
import SiteFooter from '@/components/SiteFooter.vue';
import SiteHeader from '@/components/SiteHeader.vue';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

const isAnnual = ref(true);

const plans = [
    {
        name: 'Free Starter',
        badge: 'Free Forever',
        monthlyPrice: '$0',
        annualPrice: '$0',
        period: 'forever',
        description:
            'Essential on-device OCR and document conversion without signing up or uploading files.',
        features: [
            '100% private, on-device browser processing',
            'Image to Text OCR (Tesseract)',
            'PDF to Text layer extractor',
            'Text to PDF generator & download',
            'Export results as .txt or formatted .pdf',
            'Up to 25 MB images & 50 MB PDFs',
            'No credit card or account needed to use',
        ],
        cta: 'Start converting now',
        href: '/?tool=image',
        highlighted: false,
    },
    {
        name: 'Pro Creator',
        badge: 'Most Popular',
        monthlyPrice: '$8',
        annualPrice: '$6',
        period: 'per month',
        description:
            'For professionals, researchers and students who need high-accuracy handwriting AI and saved history.',
        features: [
            'Everything in Free Starter',
            'Microsoft TrOCR Handwriting AI engine',
            'Auto background cleaning & contrast booster',
            'Save unlimited conversion history in your account',
            'Re-open & edit past conversions from any device',
            'Formatted numbered list & cursive auto-correction',
            'Priority customer support',
        ],
        cta: 'Get started with Pro',
        href: '/register',
        highlighted: true,
    },
    {
        name: 'Team / Business',
        badge: 'Scale',
        monthlyPrice: '$24',
        annualPrice: '$19',
        period: 'per user / month',
        description:
            'For organizations handling high volumes of confidential scans, contracts, and notes.',
        features: [
            'Everything in Pro Creator',
            'Shared team workspaces & history',
            'Centralized team billing & invoices',
            'Custom OCR traineddata models upon request',
            'Dedicated onboarding & 24/7 priority support',
            'SLA & confidentiality agreements',
        ],
        cta: 'Contact for Team',
        href: '/contact?topic=enterprise',
        highlighted: false,
    },
];

const faqs = [
    {
        q: 'Is the basic converter truly free and private?',
        a: 'Yes! The core tools run entirely inside your browser using WebAssembly. Your images and documents never leave your machine and are never uploaded to any remote cloud server.',
    },
    {
        q: 'What is the difference between Standard OCR and Handwriting AI?',
        a: 'Standard OCR is powered by Tesseract and is tuned for typed fonts (books, articles, screenshots, receipts). Handwriting AI uses a neural vision transformer model (Microsoft TrOCR) specifically trained to read cursive, handwritten letters, and informal notes with exceptional accuracy.',
    },
    {
        q: 'Can I cancel or change my plan anytime?',
        a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time with one click from your account settings. If you cancel, your benefits remain active until the end of your billing cycle.',
    },
    {
        q: 'Which file formats can I convert?',
        a: 'You can upload PNG, JPG, JPEG, WebP, BMP, and TIFF images, as well as text-based PDF documents. You can export results to plain text (.txt) or styled PDFs (.pdf).',
    },
];
</script>

<template>
    <Head title="Pricing — Picture to Text">
        <meta
            name="description"
            content="Transparent pricing for Picture to Text. Start 100% free with on-device OCR, or upgrade for cloud history and Handwriting AI."
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
            <!-- Header Section -->
            <section class="text-center">
                <div
                    class="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
                >
                    <Sparkles class="size-3.5 text-violet-500" />
                    Simple, transparent plans
                </div>

                <h1
                    class="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                >
                    Pick the plan that fits
                    <span
                        class="bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent"
                    >
                        your workflow.
                    </span>
                </h1>

                <p
                    class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                >
                    Start completely free with zero file uploads and on-device
                    processing. Upgrade when you need cloud sync, team tools, or
                    advanced handwriting neural OCR.
                </p>

                <!-- Billing Toggle -->
                <div
                    class="mt-8 flex items-center justify-center gap-3 text-sm"
                >
                    <span
                        :class="
                            !isAnnual
                                ? 'font-semibold text-foreground'
                                : 'text-muted-foreground'
                        "
                    >
                        Monthly billing
                    </span>
                    <button
                        type="button"
                        role="switch"
                        :aria-checked="isAnnual"
                        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                        :class="isAnnual ? 'bg-violet-600' : 'bg-muted'"
                        @click="isAnnual = !isAnnual"
                    >
                        <span
                            aria-hidden="true"
                            class="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                            :class="
                                isAnnual ? 'translate-x-5' : 'translate-x-0'
                            "
                        />
                    </button>
                    <span
                        :class="
                            isAnnual
                                ? 'font-semibold text-foreground'
                                : 'text-muted-foreground'
                        "
                        class="inline-flex items-center gap-1.5"
                    >
                        <span>Annual billing</span>
                        <span
                            class="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400"
                        >
                            Save 20%
                        </span>
                    </span>
                </div>
            </section>

            <!-- Pricing Cards Grid -->
            <section
                class="mt-14 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8"
            >
                <div
                    v-for="plan in plans"
                    :key="plan.name"
                    class="relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all sm:p-8"
                    :class="
                        plan.highlighted
                            ? 'border-violet-500/80 ring-2 shadow-violet-500/10 ring-violet-500/20'
                            : 'border-border/80'
                    "
                >
                    <div
                        v-if="plan.highlighted"
                        class="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                    >
                        {{ plan.badge }}
                    </div>

                    <div>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-foreground">
                                {{ plan.name }}
                            </h3>
                            <span
                                v-if="!plan.highlighted"
                                class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                                {{ plan.badge }}
                            </span>
                        </div>

                        <p
                            class="mt-2 text-xs leading-relaxed text-muted-foreground"
                        >
                            {{ plan.description }}
                        </p>

                        <div class="mt-6 flex items-baseline gap-1">
                            <span
                                class="text-4xl font-bold tracking-tight text-foreground"
                            >
                                {{
                                    isAnnual
                                        ? plan.annualPrice
                                        : plan.monthlyPrice
                                }}
                            </span>
                            <span class="text-xs text-muted-foreground">
                                / {{ plan.period }}
                            </span>
                        </div>

                        <div class="mt-6 border-t border-border/70 pt-6">
                            <p class="text-xs font-semibold text-foreground">
                                Includes:
                            </p>
                            <ul
                                class="mt-3 space-y-2.5 text-xs text-muted-foreground"
                            >
                                <li
                                    v-for="feature in plan.features"
                                    :key="feature"
                                    class="flex items-start gap-2.5"
                                >
                                    <Check
                                        class="mt-0.5 size-3.5 shrink-0 text-violet-500"
                                    />
                                    <span>{{ feature }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="mt-8 pt-4">
                        <Button
                            as-child
                            class="w-full"
                            :variant="plan.highlighted ? 'default' : 'outline'"
                            size="lg"
                        >
                            <Link :href="plan.href">
                                {{ plan.cta }}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <!-- All Tools in One Place Showcase Banner -->
            <section
                class="mt-20 overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-900/10 via-indigo-900/5 to-transparent p-6 sm:p-10"
            >
                <div
                    class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"
                >
                    <div class="max-w-xl space-y-2">
                        <div
                            class="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400"
                        >
                            <Layers class="size-3.5" />
                            All Tools in One Place
                        </div>
                        <h2
                            class="text-2xl font-bold text-foreground sm:text-3xl"
                        >
                            Ready to convert right now?
                        </h2>
                        <p class="text-sm text-muted-foreground">
                            Switch between our specialized tools anytime from
                            the top navigation button or directly below.
                        </p>
                    </div>

                    <div
                        class="grid w-full grid-cols-2 gap-2.5 sm:w-auto sm:grid-cols-2"
                    >
                        <Button
                            as-child
                            variant="outline"
                            size="sm"
                            class="justify-start gap-2"
                        >
                            <Link href="/?tool=image">
                                <ImageIcon class="size-4 text-violet-500" />
                                <span>Image to Text</span>
                            </Link>
                        </Button>
                        <Button
                            as-child
                            variant="outline"
                            size="sm"
                            class="justify-start gap-2"
                        >
                            <Link href="/?tool=handwriting">
                                <PenLine class="size-4 text-fuchsia-500" />
                                <span>Handwriting AI</span>
                            </Link>
                        </Button>
                        <Button
                            as-child
                            variant="outline"
                            size="sm"
                            class="justify-start gap-2"
                        >
                            <Link href="/?tool=pdf">
                                <FileText class="size-4 text-sky-500" />
                                <span>PDF to Text</span>
                            </Link>
                        </Button>
                        <Button
                            as-child
                            variant="outline"
                            size="sm"
                            class="justify-start gap-2"
                        >
                            <Link href="/?tool=text">
                                <FileDown class="size-4 text-emerald-500" />
                                <span>Text to PDF</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <!-- FAQs -->
            <section class="mt-20">
                <div class="text-center">
                    <h2
                        class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                    >
                        Frequently Asked Questions
                    </h2>
                    <p class="mt-2 text-sm text-muted-foreground">
                        Everything you need to know about our technology,
                        privacy, and plans.
                    </p>
                </div>

                <div class="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
                    <div
                        v-for="faq in faqs"
                        :key="faq.q"
                        class="rounded-xl border bg-card p-5 text-left shadow-xs"
                    >
                        <h3
                            class="flex items-start gap-2 text-sm font-semibold text-foreground"
                        >
                            <HelpCircle
                                class="mt-0.5 size-4 shrink-0 text-violet-500"
                            />
                            <span>{{ faq.q }}</span>
                        </h3>
                        <p
                            class="mt-2 text-xs leading-relaxed text-muted-foreground"
                        >
                            {{ faq.a }}
                        </p>
                    </div>
                </div>
            </section>
        </main>

        <SiteFooter />
        <Toaster position="top-center" rich-colors />
    </div>
</template>
