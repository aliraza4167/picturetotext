export function formatBytes(bytes: number): string {
    if (!bytes) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / 1024 ** exponent;

    return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`;
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat().format(value);
}

export function formatRelativeDate(value: string | null): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const diff = date.getTime() - Date.now();
    const minutes = Math.round(diff / 60000);

    if (Math.abs(minutes) < 1) {
        return 'just now';
    }

    if (Math.abs(minutes) < 60) {
        return new Intl.RelativeTimeFormat(undefined, {
            numeric: 'auto',
        }).format(minutes, 'minute');
    }

    const hours = Math.round(minutes / 60);

    if (Math.abs(hours) < 24) {
        return new Intl.RelativeTimeFormat(undefined, {
            numeric: 'auto',
        }).format(hours, 'hour');
    }

    const days = Math.round(hours / 24);

    if (Math.abs(days) < 7) {
        return new Intl.RelativeTimeFormat(undefined, {
            numeric: 'auto',
        }).format(days, 'day');
    }

    return new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year:
            date.getFullYear() === new Date().getFullYear()
                ? undefined
                : 'numeric',
    }).format(date);
}
