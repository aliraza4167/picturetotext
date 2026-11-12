<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import {
    Check,
    ChevronDown,
    ChevronsUpDown,
    FileDown,
    FileText,
    Image as ImageIcon,
    Layers,
    Menu,
    PenLine,
    ScanText,
    Sparkles,
    X,
} from '@lucide/vue';
import { computed, ref } from 'vue';
import UserInfo from '@/components/UserInfo.vue';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatNumber } from '@/lib/format';

export type ToolSelection = 'image' | 'handwriting' | 'pdf' | 'text';

const props = withDefaults(
    defineProps<{
        savedCount?: number | null;
        isConverterPage?: boolean;
    }>(),
    {
        savedCount: null,
        isConverterPage: false,
    },
);

const emit = defineEmits<{
    'select-tool': [tool: ToolSelection];
}>();

const page = usePage();
const user = computed(() => page.props.auth?.user);
const currentUrl = computed(() => page.url);

const mobileMenuOpen = ref(false);

const toolsList: Array<{
    id: ToolSelection;
    title: string;
    description: string;
    badge: string;
    icon: any;
    color: string;
}> = [
    {
        id: 'image',
        title: 'Image to Text (OCR)',
        description: 'Extract printed text from photos, scans, and documents',
        badge: 'Fast',
        icon: ImageIcon,
        color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
    },
    {
        id: 'handwriting',
        title: 'Handwriting OCR (AI)',
        description:
            'Transcribe handwritten notes, cursive, letters, and lists',
        badge: 'AI Neural',
        icon: PenLine,
        color: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10',
    },
    {
        id: 'pdf',
        title: 'PDF to Text',
        description: 'Extract cleanly formatted text from multi-page PDFs',
        badge: 'Document',
        icon: FileText,
        color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
    },
    {
        id: 'text',
        title: 'Text to PDF',
        description: 'Format plain writing into downloadable, styled PDFs',
        badge: 'Export',
        icon: FileDown,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    },
];

function handleToolClick(toolId: ToolSelection): void {
    mobileMenuOpen.value = false;
    if (props.isConverterPage) {
        emit('select-tool', toolId);
    } else {
        window.location.href = `/?tool=${toolId}`;
    }
}
</script>

<template>
    <header
        class="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl"
    >
        <div
            class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
        >
            <!-- Logo -->
            <Link href="/" class="flex min-w-0 items-center gap-2.5">
                <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/25"
                >
                    <ScanText class="size-5" />
                </span>
                <span class="min-w-0 leading-tight">
                    <span class="block truncate text-sm font-semibold">
                        Picture to Text
                    </span>
                    <span
                        class="hidden text-[11px] text-muted-foreground sm:block"
                    >
                        Image · PDF · Documents
                    </span>
                </span>
            </Link>

            <!-- Desktop Navigation -->
            <div class="hidden items-center gap-1 md:flex md:gap-2">
                <!-- Other Tools Dropdown Button -->
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button
                            variant="ghost"
                            size="sm"
                            class="inline-flex items-center gap-1.5 font-medium text-foreground/80 hover:bg-accent hover:text-foreground"
                        >
                            <Layers class="size-4 text-violet-500" />
                            <span>Other Tools</span>
                            <ChevronDown class="size-3.5 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        class="w-[340px] p-2 sm:w-[380px]"
                    >
                        <div class="px-2 py-1.5">
                            <p
                                class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                            >
                                All Conversion Tools
                            </p>
                            <p class="text-[11px] text-muted-foreground">
                                Everything runs 100% locally in your browser
                            </p>
                        </div>
                        <DropdownMenuSeparator />

                        <div class="flex flex-col gap-1 py-1">
                            <button
                                v-for="t in toolsList"
                                :key="t.id"
                                type="button"
                                class="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                                @click="handleToolClick(t.id)"
                            >
                                <div
                                    class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                                    :class="t.color"
                                >
                                    <component :is="t.icon" class="size-4" />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div
                                        class="flex items-center justify-between gap-2"
                                    >
                                        <span
                                            class="text-xs font-semibold text-foreground"
                                        >
                                            {{ t.title }}
                                        </span>
                                        <span
                                            class="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                                        >
                                            {{ t.badge }}
                                        </span>
                                    </div>
                                    <p
                                        class="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground"
                                    >
                                        {{ t.description }}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <!-- Pricing Link -->
                <Button
                    as-child
                    variant="ghost"
                    size="sm"
                    :class="
                        currentUrl.startsWith('/pricing')
                            ? 'bg-accent font-semibold text-foreground'
                            : 'text-foreground/80 hover:text-foreground'
                    "
                >
                    <Link href="/pricing">Pricing</Link>
                </Button>

                <!-- About Link -->
                <Button
                    as-child
                    variant="ghost"
                    size="sm"
                    :class="
                        currentUrl.startsWith('/about')
                            ? 'bg-accent font-semibold text-foreground'
                            : 'text-foreground/80 hover:text-foreground'
                    "
                >
                    <Link href="/about">About</Link>
                </Button>

                <!-- Contact Us Link -->
                <Button
                    as-child
                    variant="ghost"
                    size="sm"
                    :class="
                        currentUrl.startsWith('/contact')
                            ? 'bg-accent font-semibold text-foreground'
                            : 'text-foreground/80 hover:text-foreground'
                    "
                >
                    <Link href="/contact">Contact Us</Link>
                </Button>
            </div>

            <!-- Right-side Auth / User section -->
            <nav class="flex items-center gap-1.5 sm:gap-2">
                <template v-if="user">
                    <span
                        v-if="savedCount !== null"
                        class="mr-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"
                    >
                        <span class="size-1.5 rounded-full bg-emerald-500" />
                        {{ formatNumber(savedCount) }} saved
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <button
                                type="button"
                                class="flex items-center gap-2 rounded-full border bg-card p-1 pr-2.5 text-left shadow-sm transition-colors hover:bg-accent"
                            >
                                <UserInfo :user="user" />
                                <ChevronsUpDown
                                    class="size-3.5 shrink-0 text-muted-foreground"
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" class="w-56">
                            <UserMenuContent :user="user" />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </template>

                <template v-else>
                    <Button as-child variant="ghost" size="sm">
                        <Link href="/login">Log in</Link>
                    </Button>
                    <Button as-child size="sm">
                        <Link href="/register">Get started</Link>
                    </Button>
                </template>

                <!-- Mobile Menu Toggle -->
                <Button
                    variant="ghost"
                    size="icon"
                    class="size-9 md:hidden"
                    @click="mobileMenuOpen = !mobileMenuOpen"
                >
                    <X v-if="mobileMenuOpen" class="size-5" />
                    <Menu v-else class="size-5" />
                    <span class="sr-only">Toggle menu</span>
                </Button>
            </nav>
        </div>

        <!-- Mobile Menu Dropdown -->
        <div
            v-if="mobileMenuOpen"
            class="border-b border-border/80 bg-background/95 px-4 pt-2 pb-6 backdrop-blur-xl md:hidden"
        >
            <div class="mb-4 space-y-1">
                <p
                    class="px-2 pt-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                >
                    All Conversion Tools
                </p>
                <div class="grid gap-1 pt-1">
                    <button
                        v-for="t in toolsList"
                        :key="t.id"
                        type="button"
                        class="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent"
                        @click="handleToolClick(t.id)"
                    >
                        <div
                            class="flex size-7 shrink-0 items-center justify-center rounded-lg"
                            :class="t.color"
                        >
                            <component :is="t.icon" class="size-3.5" />
                        </div>
                        <span class="text-xs font-medium text-foreground">
                            {{ t.title }}
                        </span>
                    </button>
                </div>
            </div>

            <div class="space-y-1 border-t border-border/60 pt-3">
                <Link
                    href="/pricing"
                    class="flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    :class="
                        currentUrl.startsWith('/pricing')
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    "
                    @click="mobileMenuOpen = false"
                >
                    Pricing
                </Link>
                <Link
                    href="/about"
                    class="flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    :class="
                        currentUrl.startsWith('/about')
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    "
                    @click="mobileMenuOpen = false"
                >
                    About
                </Link>
                <Link
                    href="/contact"
                    class="flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    :class="
                        currentUrl.startsWith('/contact')
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    "
                    @click="mobileMenuOpen = false"
                >
                    Contact Us
                </Link>
            </div>
        </div>
    </header>
</template>
