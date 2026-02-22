export function PageLoader() {
    return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral" />
                <p className="text-gray-500 text-sm">Carregando...</p>
            </div>
        </div>
    );
}
