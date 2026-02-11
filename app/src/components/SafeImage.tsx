import { useState, type ImgHTMLAttributes } from 'react';
import { logger } from '@/lib/logger';

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    onErrorCallback?: (error: Event) => void;
}

/**
 * SafeImage Component
 * 
 * Componente de imagem com fallback automático caso a imagem não carregue.
 * Previne erros 404 no console e melhora a experiência do usuário.
 */
export function SafeImage({
    src,
    fallbackSrc = '/placeholder.png',
    alt = '',
    onErrorCallback,
    ...props
}: SafeImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (!hasError) {
            logger.warn('Imagem falhou ao carregar, usando fallback:', {
                originalSrc: src,
                fallbackSrc
            });

            setHasError(true);
            setImgSrc(fallbackSrc);
            setIsLoading(false);

            // Callback customizado se fornecido
            if (onErrorCallback) {
                onErrorCallback(e.nativeEvent);
            }
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const wrapperClassName = props.className || '';
    const imgClassName = `${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full object-cover`;

    return (
        <div className={`relative ${wrapperClassName}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" />
            )}
            <img
                {...props}
                src={imgSrc}
                alt={alt}
                onError={handleError}
                onLoad={handleLoad}
                loading="lazy"
                className={imgClassName}
            />
        </div>
    );
}

/**
 * SafeBackgroundImage Component
 * 
 * Componente para imagens de fundo com fallback
 */
interface SafeBackgroundImageProps {
    src: string;
    fallbackSrc?: string;
    children?: React.ReactNode;
    className?: string;
}

export function SafeBackgroundImage({
    src,
    fallbackSrc = '/placeholder.png',
    children,
    className = ''
}: SafeBackgroundImageProps) {
    const [bgSrc, setBgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            logger.warn('Background image falhou ao carregar, usando fallback:', {
                originalSrc: src,
                fallbackSrc
            });

            setHasError(true);
            setBgSrc(fallbackSrc);
        }
    };

    return (
        <div
            className={className}
            style={{
                backgroundImage: `url(${bgSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Imagem invisível para detectar erro de carregamento */}
            <img
                src={bgSrc}
                alt=""
                onError={handleError}
                style={{ display: 'none' }}
            />
            {children}
        </div>
    );
}
