/**
 * Helper para gerenciar URLs de imagens do Supabase Storage
 * 
 * IMPORTANTE: Atualize a variável SUPABASE_URL com a URL do seu projeto
 */

// URL do projeto Supabase - Growth Experience 2026
// Encontre em: Supabase Dashboard > Settings > API > Project URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xeuqtxxhncvechrxerqw.supabase.co';

/**
 * Opções para transformação de imagem do Supabase
 */
export interface TransformationOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'origin';
    resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Retorna a URL pública de uma imagem no Supabase Storage com suporte a transformações
 * @param bucket - Nome do bucket
 * @param path - Caminho do arquivo dentro do bucket
 * @param options - Opções de transformação (opcional)
 * @returns URL pública da imagem otimizada
 */
export function getStorageUrl(bucket: string, path: string, options?: TransformationOptions): string {
    // URL base para objetos públicos
    let url = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

    // Se houver opções, muda para o endpoint de renderização (se o projeto for Pro/Supabase suportar)
    // Nota: O endpoint padrão /object/public/ também aceita parâmetros de query em versões recentes
    if (options) {
        const params = new URLSearchParams();
        if (options.width) params.append('width', options.width.toString());
        if (options.height) params.append('height', options.height.toString());
        if (options.quality) params.append('quality', options.quality.toString());
        if (options.format) params.append('format', options.format);
        if (options.resize) params.append('resize', options.resize);
        
        // Sempre forçar webp se não especificado para economia de egress
        if (!options.format) params.append('format', 'webp');

        url += `?${params.toString()}`;
    }

    return url;
}

/**
 * URLs das imagens dos stands do Growth Experience Triunfo-PE
 */
export const standImages = {
    diamante: getStorageUrl('event-images', 'stands/stand-diamante.png'),
    ouro: getStorageUrl('event-images', 'stands/stand-ouro.png'),
    prataPlus: getStorageUrl('event-images', 'stands/stand-prataplus.png'),
    prata: getStorageUrl('event-images', 'stands/stand-prata.png'),
    bronze: getStorageUrl('event-images', 'stands/stand-bronze.png'),
};

/**
 * URLs das imagens dos palestrantes
 */
export const palestrantesImages = {
    leandroBatista: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/leandro-batista.jpeg',
    vanyltonMatias: getStorageUrl('event-images', 'palestrantes/vanylton-matias.png'),
    carolinneCastro: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/carolinne-castro.jpeg?format=webp',
    jeronimoFreire: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/jeronimo-freire.jpeg?format=webp',
    joaoDaniel: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/palestrantes/joao-daniel.png',
    caioBorges: 'https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/event-images/profiles/fff7192a-3479-4d82-b896-4b05fe081c6f-1774627071551.png',
    palestrantesJuntos: getStorageUrl('event-images', 'palestrantes/palestrantes-juntos.png'),
};

/**
 * Mapeamento de cota para imagem
 */
export function getStandImage(cotaNome: string): string {
    const mapping: Record<string, string> = {
        'DIAMANTE': standImages.diamante,
        'OURO': standImages.ouro,
        'PRATA PLUS': standImages.prataPlus,
        'PRATA': standImages.prata,
        'BRONZE': standImages.bronze,
    };

    return mapping[cotaNome] || standImages.bronze; // fallback para bronze
}

/**
 * Retorna a imagem do palestrante pelo nome
 */
export function getPalestranteImage(nome: string): string {
    const mapping: Record<string, string> = {
        'Leandro Batista': palestrantesImages.leandroBatista,
        'Vanylton Matias': palestrantesImages.vanyltonMatias,
        'Carolinne Castro': palestrantesImages.carolinneCastro,
        'Jeronimo Freire': palestrantesImages.jeronimoFreire,
        'João Daniel': palestrantesImages.joaoDaniel,
        'Caio Borges': palestrantesImages.caioBorges,
    };

    return mapping[nome] || placeholderPalestrante;
}

/**
 * Placeholder para quando a imagem não carregar
 */
export const placeholderStand = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImagem do Stand%3C/text%3E%3C/svg%3E';

export const placeholderPalestrante = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ccircle cx="200" cy="150" r="60" fill="%239CA3AF"/%3E%3Cpath d="M 100 350 Q 200 280 300 350" fill="%239CA3AF"/%3E%3C/svg%3E';

/**
 * URLs das logos de patrocinadores e expositores
 */
export const logosPatrocinadores = {
    sebrae: getStorageUrl('event-images', 'logos/sebrae.png'),
    prefeituraTriunfo: getStorageUrl('event-images', 'logos/prefeitura-triunfo.png'),
    governoPE: getStorageUrl('event-images', 'logos/governo-pe.png'),
};

/**
 * Retorna a URL da logo de um expositor
 * @param categoria - Categoria do expositor (tech, servicos, comercio)
 * @param numero - Número do expositor (1, 2, 3, etc.)
 */
export function getLogoExpositor(categoria: 'tech' | 'servicos' | 'comercio', numero: number): string {
    return getStorageUrl('event-images', `logos/expositor-${categoria}-${numero}.png`);
}

/**
 * Placeholder para logos
 */
export const placeholderLogo = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ELogo%3C/text%3E%3C/svg%3E';
