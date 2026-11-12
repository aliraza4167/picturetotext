<script setup lang="ts">
import type { LucideIcon } from '@lucide/vue';
import {
    FileDown,
    FileText,
    History,
    Image as ImageIcon,
    LoaderCircle,
    Trash2,
} from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import type { ConversionSummary, ConversionType } from '@/types/converter';

defineProps<{
    conversions: ConversionSummary[];
    loadingId?: number | null;
    deletingId?: number | null;
}>();

defineEmits<{
    load: [conversion: ConversionSummary];
    delete: [conversion: ConversionSummary];
}>();

const typeMeta: Record<
    ConversionType,
    { label: string; icon: LucideIcon; className: string }
> = {
    image: {
        label: 'Image to text',
        icon: ImageIcon,
        className: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
    },
    pdf: {
        label: 'PDF to text',
        icon: FileText,
        className: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
    },
    text: {
        label: 'Text to PDF',
        icon: FileDown,
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    },
};
</script>

<template>
    <section class="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
                <span
                    class="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                >
                    <History class="size-4" />
                </span>
                <div>
                    <h2 class="text-sm font-semibold">Recent conversions</h2>
                    <p class="text-xs text-muted-foreground">
                        Saved to your account
                    </p>
                </div>
            </div>
            <span class="text-xs text-muted-foreground">
                {{ conversions.length }} saved
            </span>
        </div>

        <div
            v-if="conversions.length === 0"
            class="mt-5 rounded-xl border border-dashed px-5 py-8 text-center"
        >
            <p class="text-sm font-medium">No conversions saved yet</p>
            <p class="mt-1 text-sm text-muted-foreground">
                Run a conversion and press “Save to history” to keep it here.
            </p>
        </div>

        <ul v-else class="mt-4 divide-y">
            <li
                v-for="conversion in conversions"
                :key="conversion.id"
                class="flex flex-col gap-3 py-3.5 first:pt-1 last:pb-0 sm:flex-row sm:items-center"
            >
                <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-lg"
                    :class="typeMeta[conversion.type].className"
                >
                    <component
                        :is="typeMeta[conversion.type].icon"
                        class="size-4"
                    />
                </span>

                <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p class="truncate text-sm font-medium">
                            {{
                                conversion.source_name ||
                                typeMeta[conversion.type].label
                            }}
                        </p>
                        <span
                            class="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                            {{ typeMeta[conversion.type].label }}
                        </span>
                    </div>
                    <p
                        v-if="conversion.preview"
                        class="mt-0.5 line-clamp-1 text-xs text-muted-foreground"
                    >
                        {{ conversion.preview }}
                    </p>
                    <p class="mt-1 text-[11px] text-muted-foreground">
                        {{ formatNumber(conversion.character_count) }}
                        characters
                        <template v-if="conversion.page_count">
                            · {{ conversion.page_count }} pages
                        </template>
                        · {{ formatRelativeDate(conversion.created_at) }}
                    </p>
                </div>

                <div class="flex shrink-0 items-center gap-1.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        :disabled="loadingId === conversion.id"
                        @click="$emit('load', conversion)"
                    >
                        <LoaderCircle
                            v-if="loadingId === conversion.id"
                            class="animate-spin"
                        />
                        Open
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Delete conversion"
                        :disabled="deletingId === conversion.id"
                        @click="$emit('delete', conversion)"
                    >
                        <LoaderCircle
                            v-if="deletingId === conversion.id"
                            class="animate-spin"
                        />
                        <Trash2 v-else />
                        <span class="sr-only">Delete conversion</span>
                    </Button>
                </div>
            </li>
        </ul>
    </section>
</template>
