<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import {
    FileDown,
    FileText,
    Image as ImageIcon,
    PenLine,
    ScanText,
    ShieldCheck,
    Sparkles,
} from '@lucide/vue';
</script>

<template>
    <footer class="border-t border-border/70 bg-card/40">
        <div class="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
            <div
                class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12"
            >
                <!-- Brand Info -->
                <div class="space-y-3 sm:col-span-2 md:col-span-1">
                    <Link href="/" class="flex items-center gap-2.5">
                        <span
                            class="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/25"
                        >
                            <ScanText class="size-4" />
                        </span>
                        <span class="text-sm font-semibold text-foreground">
                            Picture to Text
                        </span>
                    </Link>
                    <p class="text-xs leading-relaxed text-muted-foreground">
                        Turn photos, handwriting, scans and PDFs into editable
                        text, or build clean PDFs. 100% private, on-device
                        conversions.
                    </p>
                    <div
                        class="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-1 text-[11px] text-emerald-600 dark:text-emerald-400"
                    >
                        <ShieldCheck class="size-3.5" />
                        <span>Zero server file uploads</span>
                    </div>
                </div>

                <!-- Conversion Tools -->
                <div class="space-y-3">
                    <h3
                        class="text-xs font-semibold tracking-wider text-foreground uppercase"
                    >
                        Conversion Tools
                    </h3>
                    <ul class="space-y-2 text-xs">
                        <li>
                            <Link
                                href="/?tool=image"
                                class="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ImageIcon class="size-3.5 text-violet-500" />
                                <span>Image to Text (OCR)</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/?tool=handwriting"
                                class="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <PenLine class="size-3.5 text-fuchsia-500" />
                                <span>Handwriting OCR (AI)</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/?tool=pdf"
                                class="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <FileText class="size-3.5 text-sky-500" />
                                <span>PDF to Text</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/?tool=text"
                                class="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <FileDown class="size-3.5 text-emerald-500" />
                                <span>Text to PDF</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                <!-- Company -->
                <div class="space-y-3">
                    <h3
                        class="text-xs font-semibold tracking-wider text-foreground uppercase"
                    >
                        Company
                    </h3>
                    <ul class="space-y-2 text-xs text-muted-foreground">
                        <li>
                            <Link
                                href="/pricing"
                                class="transition-colors hover:text-foreground"
                            >
                                Pricing Plans
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/about"
                                class="transition-colors hover:text-foreground"
                            >
                                About Our Tech
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/contact"
                                class="transition-colors hover:text-foreground"
                            >
                                Contact Support
                            </Link>
                        </li>
                    </ul>
                </div>

                <!-- Account & Access -->
                <div class="space-y-3">
                    <h3
                        class="text-xs font-semibold tracking-wider text-foreground uppercase"
                    >
                        Account
                    </h3>
                    <ul class="space-y-2 text-xs text-muted-foreground">
                        <li>
                            <Link
                                href="/login"
                                class="transition-colors hover:text-foreground"
                            >
                                Sign in
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/register"
                                class="transition-colors hover:text-foreground"
                            >
                                Create free account
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard"
                                class="transition-colors hover:text-foreground"
                            >
                                My Dashboard
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Bottom Copyright -->
            <div
                class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-[11px] text-muted-foreground sm:flex-row"
            >
                <p>© 2026 Picture to Text. All rights reserved.</p>
                <p class="flex items-center gap-1.5">
                    <Sparkles class="size-3 text-violet-500" />
                    Built with Laravel, Inertia, Vue & WebAssembly.
                </p>
            </div>
        </div>
    </footer>
</template>
