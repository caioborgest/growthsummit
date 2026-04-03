import { useEffect } from 'react';

interface SEOHeadProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url: string;
    type?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
    if (typeof document === 'undefined') return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

export function SEOHead({
    title,
    description,
    keywords,
    image = '/og-image-default.jpg',
    url,
    type = 'website',
}: SEOHeadProps) {
    const siteName = 'Growth Experience';
    const fullTitle = `${title} | ${siteName}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const absImage = image.startsWith('http') ? image : `${origin}${image.startsWith('/') ? image : `/${image}`}`;
    const pageUrl = url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? url : `/${url}`}`;

    useEffect(() => {
        document.title = fullTitle;

        upsertMeta('name', 'description', description);
        if (keywords) {
            upsertMeta('name', 'keywords', keywords);
        }

        upsertMeta('property', 'og:title', fullTitle);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:image', absImage);
        upsertMeta('property', 'og:url', pageUrl);
        upsertMeta('property', 'og:type', type);
        upsertMeta('property', 'og:site_name', siteName);
        upsertMeta('property', 'og:locale', 'pt_BR');

        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', fullTitle);
        upsertMeta('name', 'twitter:description', description);
        upsertMeta('name', 'twitter:image', absImage);
    }, [fullTitle, description, keywords, absImage, pageUrl, type]);

    return null;
}
