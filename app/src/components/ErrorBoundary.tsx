import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 * 
 * Captura erros em qualquer componente filho e exibe uma UI de fallback
 * ao invés de crashar toda a aplicação.
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Atualiza o state para que a próxima renderização mostre a UI de fallback
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log do erro
        logger.error('ErrorBoundary capturou um erro:', error, {
            componentStack: errorInfo.componentStack
        });

        // Atualiza o state com informações do erro
        this.setState({
            error,
            errorInfo
        });

        // Callback customizado se fornecido
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            // Se um fallback customizado foi fornecido, use-o
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // UI de fallback padrão
            return (
                <div className="min-h-screen bg-dark flex items-center justify-center p-4">
                    <div className="bg-dark-lighter rounded-lg p-8 max-w-md w-full">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
                                <svg
                                    className="w-8 h-8 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Algo deu errado
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Desculpe, ocorreu um erro inesperado. Por favor, tente recarregar a página.
                            </p>
                        </div>

                        {/* Detalhes do erro (Mais elegante) */}
                        <div className="mb-6 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl text-left">
                            <p className="text-[10px] font-black text-red-500/50 uppercase tracking-widest mb-2">Referência do Erro</p>
                            <p className="text-sm font-mono text-red-400 break-all bg-dark/50 p-3 rounded-lg border border-red-500/10 mb-4">
                                {this.state.error ? this.state.error.message : 'Erro desconhecido'}
                            </p>
                            
                            {import.meta.env.DEV ? (
                                <details className="text-xs text-gray-500">
                                    <summary className="cursor-pointer hover:text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                                        Stack Trace (Dev Only)
                                    </summary>
                                    <pre className="mt-4 p-4 bg-black/40 rounded-xl overflow-auto max-h-40 font-mono text-[10px] leading-relaxed">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            ) : (
                                <p className="text-[10px] text-gray-600 font-medium italic">
                                    Os detalhes técnicos foram ocultados por segurança. <br/>
                                    Informe a mensagem acima ao suporte se o problema persistir.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl transition-all font-bold text-sm"
                                >
                                    Tentar Novamente
                                </button>
                                <button
                                    onClick={this.handleReload}
                                    className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense text-white px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-lg shadow-brand-orange-coral/20"
                                >
                                    Recarregar
                                </button>
                            </div>
                            <a
                                href="/"
                                className="w-full text-center py-3 text-sm font-bold text-gray-500 hover:text-white transition-colors"
                            >
                                Voltar para a Home do App
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook para usar Error Boundary de forma funcional
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
