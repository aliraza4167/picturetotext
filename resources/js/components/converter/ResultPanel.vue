<script setup lang="ts">
import {
    Check,
    Copy,
    Download,
    LoaderCircle,
    Save,
    ScanText,
    ShieldCheck,
} from '@lucide/vue';
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { downloadText } from '@/lib/converters';
import { formatNumber } from '@/lib/format';
import { toast } from 'vue-sonner';

const props = withDefaults(
    defineProps<{
        modelValue: string;
        filename: string;
        canSave?: boolean;
        saving?: boolean;
        saved?: boolean;
        language?: string;
    }>(),
    {
        canSave: false,
        saving: false,
        saved: false,
        language: 'English',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
    save: [];
    clear: [];
}>();

const characterCount = computed(() => props.modelValue.length);
const wordCount = computed(() => {
    const words = props.modelValue.trim().match(/\S+/g);

    return words ? words.length : 0;
});
const lineCount = computed(() => {
    if (!props.modelValue) {
        return 0;
    }

    return props.modelValue.split(/\r?\n/).length;
});

async function copyText(): Promise<void> {
    try {
        await navigator.clipboard.writeText(props.modelValue);
        toast.success('Copied to clipboard');
    } catch {
        toast.error('Could not access the clipboard');
    }
}

function download(): void {
    downloadText(props.modelValue, props.filename);
    toast.success('Text file downloaded');
}
</script>

<template>
    <div
        class="flex min-h-[28rem] flex-col overflow-hidden rounded-xl border bg-card"
    >
        <div
            class="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3.5"
        >
            <div class="flex items-center gap-2.5">
                <span
                    class="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300"
                >
                    <ScanText class="size-4" />
                </span>
                <div>
                    <p class="text-sm leading-tight font-semibold">
                        Extracted text
                    </p>
                    <p class="text-xs text-muted-foreground">
                        {{ language }} · editable
                    </p>
                </div>
            </div>

            <div
                class="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
            >
                <span>{{ formatNumber(characterCount) }} characters</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatNumber(wordCount) }} words</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatNumber(lineCount) }} lines</span>
            </div>
        </div>

        <div
            v-if="!modelValue"
            class="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center"
        >
            <div
                class="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
            >
                <ScanText class="size-7" />
            </div>
            <div class="max-w-xs space-y-1.5">
                <p class="text-sm font-semibold">Your text will show up here</p>
                <p class="text-sm text-muted-foreground">
                    Upload a file and run the conversion. Everything happens in
                    your browser — your file never leaves this device.
                </p>
            </div>
            <div
                class="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground"
            >
                <ShieldCheck class="size-3.5 text-emerald-500" />
                Private by design
            </div>
        </div>

        <template v-else>
            <textarea
                :value="modelValue"
                class="min-h-72 flex-1 resize-none bg-transparent px-5 py-4 font-mono text-sm leading-6 outline-none"
                spellcheck="false"
                aria-label="Extracted text"
                @input="
                    emit(
                        'update:modelValue',
                        ($event.target as HTMLTextAreaElement).value,
                    )
                "
            />

            <div
                class="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-5 py-3"
            >
                <div class="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        @click="copyText"
                    >
                        <Copy />
                        Copy
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        @click="download"
                    >
                        <Download />
                        Download .txt
                    </Button>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <Button
                        v-if="canSave"
                        type="button"
                        size="sm"
                        :disabled="saving"
                        @click="emit('save')"
                    >
                        <LoaderCircle v-if="saving" class="animate-spin" />
                        <Check v-else-if="saved" />
                        <Save v-else />
                        {{ saved ? 'Saved' : 'Save to history' }}
                    </Button>
                    <span v-else class="text-xs text-muted-foreground">
                        Sign in to save your history.
                    </span>
                </div>
            </div>
        </template>
    </div>
</template>
