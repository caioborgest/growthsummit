/**
 * Helper para gerenciar URLs de imagens do Supabase Storage
 * 
 * IMPORTANTE: Atualize a variável SUPABASE_URL com a URL do seu projeto
 */

// URL do projeto Supabase - Growth Summit 2026
// Encontre em: Supabase Dashboard > Settings > API > Project URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zczfutmymobgypbbamme.supabase.co';

/**
 * Retorna a URL pública de uma imagem no Supabase Storage
 * @param bucket - Nome do bucket
 * @param path - Caminho do arquivo dentro do bucket
 * @returns URL pública da imagem
 */
export function getStorageUrl(bucket: string, path: string): string {
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * URLs das imagens dos stands do Growth Experience Triunfo-PE
 */
export const standImages = {
    diamante: getStorageUrl('event-images', 'stands/stand-diamante.jpg'),
    ouro: getStorageUrl('event-images', 'stands/stand-ouro.jpg'),
    prataPlus: getStorageUrl('event-images', 'stands/stand-prata-plus.jpg'),
    prata: getStorageUrl('event-images', 'stands/stand-prata.jpg'),
    bronze: getStorageUrl('event-images', 'stands/stand-bronze.jpg'),
};

/**
 * URLs das imagens dos palestrantes
 */
export const palestrantesImages = {
    leandroBatista: getStorageUrl('event-images', 'palestrantes/leandro-batista.jpg'),
    vanyltonMatias: getStorageUrl('event-images', 'palestrantes/vanylton-matias.jpg'),
    palestrantesJuntos: getStorageUrl('event-images', 'palestrantes/palestrantes-juntos.jpg'),
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
