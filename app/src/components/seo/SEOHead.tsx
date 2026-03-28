// SEO Head Component - Temporarily disabled for build
// Use helmet-async in future versions

interface SEOHeadProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url: string;
    type?: string;
}

export function SEOHead({
    title,
    description,
    keywords,
    image = '/og-image-default.jpg',
    url,
    type = 'website',
}: SEOHeadProps) {
    // Update document title for now
    const siteName = 'Growth Experience';
    const fullTitle = `${title} | ${siteName}`;
    
    if (typeof document !== 'undefined') {
        document.title = fullTitle;
        
        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', description);
    }
    
    return null; // Return null for now
}
