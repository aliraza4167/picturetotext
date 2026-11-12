<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    HelpCircle,
    Layers,
    LoaderCircle,
    Mail,
    MessageSquare,
    Send,
    Sparkles,
} from '@lucide/vue';
import { onMounted, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';
import SiteFooter from '@/components/SiteFooter.vue';
import SiteHeader from '@/components/SiteHeader.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';

const form = reactive({
    name: '',
    email: '',
    topic: 'general',
    subject: '',
    message: '',
});

const isSubmitting = ref(false);
const submitted = ref(false);
const errorMessage = ref('');

onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const topicParam = params.get('topic');
    if (topicParam) {
        form.topic = topicParam;
        if (topicParam === 'enterprise') {
            form.subject = 'Enterprise / Team Plan Inquiry';
        }
    }
});

function csrfToken(): string {
    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

async function submitContact(): Promise<void> {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        toast.error('Please fill in all required fields');
        return;
    }

    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        const response = await fetch('/contact', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': csrfToken(),
            },
            body: JSON.stringify(form),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(
                data.message || 'Something went wrong. Please try again.',
            );
        }

        submitted.value = true;
        toast.success('Your message has been sent successfully!');
    } catch (err) {
        errorMessage.value =
            err instanceof Error
                ? err.message
                : 'Could not send your message. Please try again.';
        toast.error(errorMessage.value);
    } finally {
        isSubmitting.value = false;
    }
}

function resetForm(): void {
    form.name = '';
    form.email = '';
    form.topic = 'general';
    form.subject = '';
    form.message = '';
    submitted.value = false;
    errorMessage.value = '';
}
</script>

<template>
    <Head title="Contact Us — Picture to Text">
        <meta
            name="description"
            content="Get in touch with the Picture to Text team for support, feature suggestions, or enterprise OCR inquiries."
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
                    <MessageSquare class="size-3.5 text-violet-500" />
                    We're here to help
                </div>

                <h1
                    class="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                >
                    Get in touch with
                    <span
                        class="bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent"
                    >
                        our team.
                    </span>
                </h1>

                <p
                    class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                >
                    Have a question about OCR recognition accuracy, need help
                    with a conversion, or want to explore an enterprise plan?
                    Send us a message.
                </p>
            </section>

            <!-- Main Contact Grid -->
            <section class="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12">
                <!-- Left Info Column -->
                <div class="space-y-6 lg:col-span-5">
                    <div
                        class="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
                    >
                        <h2 class="text-xl font-semibold text-foreground">
                            Contact Information
                        </h2>
                        <p
                            class="mt-2 text-xs leading-relaxed text-muted-foreground"
                        >
                            Fill out the form or reach out directly. We read
                            every inquiry and respond promptly.
                        </p>

                        <div class="mt-6 space-y-4 text-xs">
                            <div class="flex items-start gap-3">
                                <div
                                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                >
                                    <Mail class="size-4" />
                                </div>
                                <div>
                                    <p class="font-medium text-foreground">
                                        Email Support
                                    </p>
                                    <a
                                        href="mailto:support@picturetotext.com"
                                        class="text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        support@picturetotext.com
                                    </a>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div
                                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                >
                                    <Clock class="size-4" />
                                </div>
                                <div>
                                    <p class="font-medium text-foreground">
                                        Response Time
                                    </p>
                                    <p class="text-muted-foreground">
                                        Usually within 24 business hours
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div
                                    class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                >
                                    <HelpCircle class="size-4" />
                                </div>
                                <div>
                                    <p class="font-medium text-foreground">
                                        Quick Answers
                                    </p>
                                    <p class="text-muted-foreground">
                                        Check our
                                        <Link
                                            href="/pricing"
                                            class="underline underline-offset-2 hover:text-foreground"
                                        >
                                            Pricing & FAQ
                                        </Link>
                                        for common questions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Other Tools Quick Link Box -->
                    <div
                        class="rounded-2xl border bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-transparent p-6 shadow-sm"
                    >
                        <div class="flex items-center gap-2">
                            <Layers class="size-4 text-violet-500" />
                            <h3 class="text-sm font-semibold text-foreground">
                                Need to convert a file now?
                            </h3>
                        </div>
                        <p class="mt-1 text-xs text-muted-foreground">
                            All our conversion tools run locally inside your
                            browser. No sign-up required.
                        </p>
                        <div class="mt-4">
                            <Button
                                as-child
                                variant="outline"
                                size="sm"
                                class="gap-1.5"
                            >
                                <Link href="/?tool=image">
                                    <span>Open Converter</span>
                                    <ArrowRight class="size-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <!-- Right Form Column -->
                <div class="lg:col-span-7">
                    <div
                        class="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
                    >
                        <!-- Success Banner -->
                        <div
                            v-if="submitted"
                            class="space-y-4 py-8 text-center"
                        >
                            <div
                                class="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
                            >
                                <CheckCircle2 class="size-7" />
                            </div>
                            <h2 class="text-2xl font-bold text-foreground">
                                Message Sent!
                            </h2>
                            <p
                                class="mx-auto max-w-md text-sm text-muted-foreground"
                            >
                                Thank you for contacting us. Our team has
                                received your message and will get back to you
                                shortly.
                            </p>
                            <div class="pt-4">
                                <Button variant="outline" @click="resetForm">
                                    Send another message
                                </Button>
                            </div>
                        </div>

                        <!-- Form -->
                        <form
                            v-else
                            class="space-y-5"
                            @submit.prevent="submitContact"
                        >
                            <div class="grid gap-4 sm:grid-cols-2">
                                <div class="space-y-1.5">
                                    <Label for="contact-name"
                                        >Your Name *</Label
                                    >
                                    <Input
                                        id="contact-name"
                                        v-model="form.name"
                                        type="text"
                                        placeholder="Alex Mercer"
                                        required
                                        :disabled="isSubmitting"
                                    />
                                </div>

                                <div class="space-y-1.5">
                                    <Label for="contact-email"
                                        >Email Address *</Label
                                    >
                                    <Input
                                        id="contact-email"
                                        v-model="form.email"
                                        type="email"
                                        placeholder="alex@example.com"
                                        required
                                        :disabled="isSubmitting"
                                    />
                                </div>
                            </div>

                            <div class="space-y-1.5">
                                <Label for="contact-topic"
                                    >Topic / Category</Label
                                >
                                <select
                                    id="contact-topic"
                                    v-model="form.topic"
                                    class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                    :disabled="isSubmitting"
                                >
                                    <option value="general">
                                        General Inquiry & Feedback
                                    </option>
                                    <option value="accuracy">
                                        OCR Recognition Accuracy Help
                                    </option>
                                    <option value="enterprise">
                                        Enterprise & Team Licensing
                                    </option>
                                    <option value="bug">Bug Report</option>
                                    <option value="feature">
                                        Feature Suggestion
                                    </option>
                                </select>
                            </div>

                            <div class="space-y-1.5">
                                <Label for="contact-subject">Subject *</Label>
                                <Input
                                    id="contact-subject"
                                    v-model="form.subject"
                                    type="text"
                                    placeholder="Brief summary of your question"
                                    required
                                    :disabled="isSubmitting"
                                />
                            </div>

                            <div class="space-y-1.5">
                                <Label for="contact-message">Message *</Label>
                                <textarea
                                    id="contact-message"
                                    v-model="form.message"
                                    rows="5"
                                    class="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                    placeholder="Provide any details about your question or the image/document you are working with…"
                                    required
                                    :disabled="isSubmitting"
                                />
                            </div>

                            <div
                                v-if="errorMessage"
                                class="rounded-lg bg-destructive/10 p-3 text-xs text-destructive"
                            >
                                {{ errorMessage }}
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                class="w-full sm:w-auto"
                                :disabled="isSubmitting"
                            >
                                <LoaderCircle
                                    v-if="isSubmitting"
                                    class="mr-2 size-4 animate-spin"
                                />
                                <Send v-else class="mr-2 size-4" />
                                <span>Send message</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </section>
        </main>

        <SiteFooter />
        <Toaster position="top-center" rich-colors />
    </div>
</template>
