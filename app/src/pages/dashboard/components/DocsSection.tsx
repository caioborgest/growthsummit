import { FileText, Download, Loader2, Sparkles, FolderOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DocsSectionProps {
    documentos: any[];
    loadingDocs: boolean;
}

export function DocsSection({ documentos, loadingDocs }: DocsSectionProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4 border border-teal-500/20 shadow-lg shadow-teal-500/10">
                    <FolderOpen className="h-6 w-6 text-teal-400" />
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">Base de Conhecimento</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">Acesso rápido aos materiais, apresentações e guias oficiais do Growth Experience 2026.</p>
            </div>

            <div className="glass-card p-8 border-white/5 relative overflow-hidden">
                {/* Background mesh */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] -mr-32 -mt-32"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-white font-bold text-lg flex items-center gap-3 italic uppercase">
                        <div className="w-2 h-6 bg-teal-500 rounded-full"></div>
                        Documentos Disponíveis
                    </h3>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{documentos.length} ARQUIVOS</span>
                </div>

                {loadingDocs ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest animate-pulse">Sincronizando arquivos...</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4 relative z-10">
                        {documentos.map((doc) => (
                            <div
                                key={doc.fullPath}
                                className="flex items-center justify-between p-5 bg-dark-200/50 rounded-[1.5rem] border border-white/5 hover:border-teal-500/40 transition-all group overflow-hidden relative"
                            >
                                {/* Hover line effect */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>

                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-dark-400 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                        <FileText className="h-6 w-6 text-teal-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-black text-sm truncate uppercase italic tracking-tight mb-1">{doc.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-gray-600 text-[9px] font-bold uppercase">{doc.size} · PDF</p>
                                            <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                                            <p className="text-gray-600 text-[9px] font-bold uppercase">{doc.updatedAt}</p>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    onClick={() => toast.success(`Baixando: ${doc.name}`)}
                                    className="ml-2 flex-shrink-0"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-10 h-10 rounded-xl bg-white/5 text-gray-500 hover:text-white hover:bg-teal-500 transition-all"
                                    >
                                        <Download className="h-5 w-5" />
                                    </Button>
                                </a>
                            </div>
                        ))}

                        {documentos.length === 0 && (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                <FileText className="h-12 w-12 text-gray-800 mx-auto mb-4 opacity-50" />
                                <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">Nenhum documento compartilhado ainda</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Help Card */}
            <div className="flex items-center gap-5 p-6 bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 rounded-[2rem] group cursor-pointer hover:from-teal-500/15 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-black uppercase text-sm italic tracking-tight">Precisa de algum material específico?</h4>
                    <p className="text-gray-500 text-xs">Fale com nosso suporte técnico para solicitar kits de imprensa ou logos oficiais.</p>
                </div>
                <ChevronRight className="h-6 w-6 text-teal-500 opacity-50 group-hover:translate-x-2 transition-transform" />
            </div>
        </div>
    );
}
