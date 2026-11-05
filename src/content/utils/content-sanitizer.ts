export interface SafeContentLink {
    label: string;
    url: string;
}

/**
 * Strips HTML tags and script elements, returning clean structured plain text.
 */
export function sanitizeText(input?: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim();
}

/**
 * Validates and sanitizes a URL, allowing only safe HTTP/HTTPS and mailto protocols.
 * Prevents javascript:, data:, and other unsafe vectors.
 */
export function sanitizeUrl(url?: string): string | null {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const trimmed = url.trim();
    const isSafe = /^https?:\/\//i.test(trimmed) || /^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(trimmed);

    return isSafe ? trimmed : null;
}

/**
 * Sanitizes an array of content links, dropping any with invalid or unsafe URLs.
 */
export function sanitizeLinks(links?: Array<{ label?: string; url?: string }>): SafeContentLink[] {
    if (!Array.isArray(links)) {
        return [];
    }

    const sanitized: SafeContentLink[] = [];

    for (const link of links) {
        if (!link) continue;
        const safeUrl = sanitizeUrl(link.url);
        const safeLabel = sanitizeText(link.label);

        if (safeUrl && safeLabel) {
            sanitized.push({
                label: safeLabel,
                url: safeUrl,
            });
        }
    }

    return sanitized;
}

