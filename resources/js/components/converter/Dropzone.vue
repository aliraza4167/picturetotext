<script setup lang="ts">
import { CloudUpload, X } from '@lucide/vue';
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/format';

const props = withDefaults(
    defineProps<{
        accept: string;
        file?: File | null;
        title: string;
        description?: string;
        disabled?: boolean;
    }>(),
    {
        file: null,
        description: '',
        disabled: false,
    },
);

const emit = defineEmits<{
    select: [file: File];
    clear: [];
}>();

const input = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

function openPicker(): void {
    if (props.disabled) {
        return;
    }

    input.value?.click();
}

function onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
        emit('select', file);
    }

    target.value = '';
}

function onDrop(event: DragEvent): void {
    dragging.value = false;

    if (props.disabled) {
        return;
    }

    const file = event.dataTransfer?.files?.[0];

    if (file) {
        emit('select', file);
    }
}
</script>

<template>
    <div
        class="group relative flex min-h-72 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 text-center transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        :class="
            dragging
                ? 'border-violet-500 bg-violet-50/80 dark:bg-violet-500/10'
                : 'border-border bg-muted/30 hover:border-violet-400 hover:bg-muted/50'
        "
        :aria-disabled="disabled"
        role="button"
        tabindex="0"
        @click="openPicker"
        @keydown.enter.prevent="openPicker"
        @keydown.space.prevent="openPicker"
        @dragenter.prevent="dragging = true"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
    >
        <input
            ref="input"
            type="file"
            class="hidden"
            :accept="accept"
            :disabled="disabled"
            @change="onChange"
        />

        <template v-if="!file">
            <div
                class="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-indigo-500/10 text-violet-600 ring-1 ring-violet-500/20 dark:text-violet-300"
            >
                <slot name="icon">
                    <CloudUpload class="size-7" />
                </slot>
            </div>
            <div class="space-y-1">
                <p class="text-base font-semibold">{{ title }}</p>
                <p class="text-sm text-muted-foreground">
                    {{ description }}
                </p>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                class="pointer-events-none"
                tabindex="-1"
            >
                Browse files
            </Button>
            <p class="text-xs text-muted-foreground">
                Drop a file here or click to browse
            </p>
        </template>

        <template v-else>
            <slot name="preview" :file="file" />

            <div
                v-if="!$slots.preview"
                class="flex flex-col items-center gap-3"
            >
                <div
                    class="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
                >
                    <slot name="file-icon">
                        <CloudUpload class="size-7" />
                    </slot>
                </div>
                <div class="max-w-full space-y-1">
                    <p class="truncate text-sm font-medium">{{ file.name }}</p>
                    <p class="text-xs text-muted-foreground">
                        {{ formatBytes(file.size) }}
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2" @click.stop>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="openPicker"
                >
                    Replace
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Remove file"
                    @click="emit('clear')"
                >
                    <X />
                    <span class="sr-only">Remove file</span>
                </Button>
            </div>
        </template>
    </div>
</template>
