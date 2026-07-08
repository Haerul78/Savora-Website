import { router } from '@inertiajs/react';

export default function Pagination({ meta }) {
    if (!meta || meta.last_page <= 1) return null;

    const { current_page, last_page, prev_page_url, next_page_url, from, to, total } = meta;

    function goTo(url) {
        if (url) router.get(url, {}, { preserveState: true });
    }

    const pages = buildPageRange(current_page, last_page);

    return (
        <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-on-surface-variant">
                {from}–{to} dari {total} resep
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => goTo(prev_page_url)}
                    disabled={!prev_page_url}
                    className="px-3 py-1.5 text-sm rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-high disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    ←
                </button>

                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-sm text-on-surface-variant">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => goTo(buildPageUrl(next_page_url || prev_page_url, p))}
                            className={`w-8 h-8 text-sm rounded-xl border transition ${
                                p === current_page
                                    ? 'bg-primary text-white border-primary font-semibold'
                                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-high'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => goTo(next_page_url)}
                    disabled={!next_page_url}
                    className="px-3 py-1.5 text-sm rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-high disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    →
                </button>
            </div>
        </div>
    );
}

function buildPageRange(current, last) {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '...', last];
    if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
    return [1, '...', current - 1, current, current + 1, '...', last];
}

function buildPageUrl(referenceUrl, page) {
    if (!referenceUrl) return null;
    const url = new URL(referenceUrl);
    url.searchParams.set('page', page);
    return url.toString();
}
