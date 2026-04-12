import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Trash2,
    Pencil,
    QrCode,
    MapPin,
    Users,
    Filter,
    TrendingUp,
    Store,
    Download,
    CheckCircle2,
    XCircle,
    X,
    AlertCircle,
    Trophy
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStands, useStandCheckIns, useInscricoes, useStartups, useCompanies } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import type { Stand, Registration } from '@/types';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import QRCode from 'qrcode';

export default function AdminStands() {
    const { projectId, isProjectSelected } = useProject();
    const navigate = useNavigate();
    const { data: stands, create, update, remove, isLoading, refetch } = useStands();
    const { data: checkins } = useStandCheckIns();
    const { data: inscricoes } = useInscricoes();
    const { data: startups } = useStartups();
    const { data: companies } = useCompanies();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStand, setEditingStand] = useState<Stand | null>(null);
    const [selectedStandForQR, setSelectedStandForQR] = useState<Stand | null>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

    const [activeTab, setActiveTab] = useState<'stands' | 'sorteio' | 'monitoramento'>('stands');
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<Registration | null>(null);
    const [previousWinners, setPreviousWinners] = useState<Registration[]>([]);
    const [scrollingName, setScrollingName] = useState<string>('');

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        logoUrl: '',
        ownerId: '',
        ownerType: '' as 'startup' | 'company' | 'sponsor' | ''
    });

    // Otimização: Map para busca rápida de check-ins por participante
    const checkinsByRegistration = useMemo(() => {
        const map = new Map<string, Set<string>>();
        checkins.forEach(c => {
            if (c.registrationId && c.standId) {
                if (!map.has(c.registrationId)) {
                    map.set(c.registrationId, new Set<string>());
                }
                map.get(c.registrationId)?.add(c.standId);
            }
        });
        return map;
    }, [checkins]);

    // Otimização: Map para contagem de check-ins por stand
    const checkinCountByStand = useMemo(() => {
        const map = new Map<string, number>();
        checkins.forEach(c => {
            if (c.standId) {
                map.set(c.standId, (map.get(c.standId) || 0) + 1);
            }
        });
        return map;
    }, [checkins]);

    const standRanking = useMemo(() => {
        return [...stands].map(s => ({
            ...s,
            checkins: checkinCountByStand.get(s.id) || 0
        })).sort((a, b) => b.checkins - a.checkins);
    }, [stands, checkinCountByStand]);

    const recentCheckins = useMemo(() => {
        return [...checkins]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
            .map(c => {
                const reg = inscricoes.find(r => r.id === c.registrationId);
                const stand = stands.find(s => s.id === c.standId);
                return {
                    ...c,
                    participantName: reg?.nome || reg?.name || 'Participante',
                    standName: stand?.name || 'Stand'
                };
            });
    }, [checkins, inscricoes, stands]);

    const eligibleParticipants = useMemo(() => {
        if (stands.length === 0) return [];
        return inscricoes.filter(reg => {
            // Check if already won
            if (previousWinners.some(w => w.id === reg.id)) return false;
            
            const visitedCount = checkinsByRegistration.get(reg.id)?.size || 0;
            return visitedCount >= stands.length;
        });
    }, [inscricoes, stands, checkinsByRegistration, previousWinners]);

    const handleDraw = () => {
        if (eligibleParticipants.length === 0) {
            toast.error('Nenhum participante elegível ou todos já foram sorteados.');
            return;
        }

        setIsDrawing(true);
        setWinner(null);

        // Slot machine effect: scroll names quickly
        let counter = 0;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
            setScrollingName(eligibleParticipants[randomIndex].nome || eligibleParticipants[randomIndex].name || 'Sorteando...');
            counter++;
            
            if (counter > 30) {
                clearInterval(interval);
                const finalWinner = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
                setWinner(finalWinner);
                setPreviousWinners(prev => [...prev, finalWinner]);
                setIsDrawing(false);
                setScrollingName('');
                toast.success('Ganhador sorteado com sucesso!');
                
                // Trigger feedback
                if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
            }
        }, 100);
    };

    const filteredStands = stands.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStand) {
                await update(editingStand.id, {
                    name: formData.name,
                    location: formData.location,
                    description: formData.description,
                    logoUrl: formData.logoUrl,
                    ownerId: formData.ownerId || undefined,
                    ownerType: (formData.ownerType as any) || undefined,
                });
                toast.success('Stand atualizado com sucesso!');
            } else {
                await create({
                    projectId: projectId || '',
                    name: formData.name,
                    location: formData.location,
                    description: formData.description,
                    logoUrl: formData.logoUrl,
                    ownerId: formData.ownerId || undefined,
                    ownerType: (formData.ownerType as 'startup' | 'company' | 'sponsor' | undefined),
                });
                toast.success('Novo stand cadastrado com sucesso!');
            }

            setIsModalOpen(false);
            resetForm();
            await refetch(true);
        } catch (err) {
            const error = err as Error;
            logger.error('Erro ao salvar stand:', error);
            toast.error(error.message || 'Erro ao salvar stand.');
        }
    };

    const resetForm = () => {
        setEditingStand(null);
        setFormData({
            name: '',
            location: '',
            description: '',
            logoUrl: '',
            ownerId: '',
            ownerType: ''
        });
    };

    const handleEdit = (stand: Stand) => {
        setEditingStand(stand);
        setFormData({
            name: stand.name,
            location: stand.location || '',
            description: stand.description || '',
            logoUrl: stand.logoUrl || '',
            ownerId: stand.ownerId || '',
            ownerType: stand.ownerType || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este stand?')) {
            try {
                await remove(id);
                toast.success('Stand excluído com sucesso');
            } catch (err) {
                logger.error('Erro ao excluir stand:', err);
                toast.error('Erro ao excluir stand');
            }
        }
    };

    const generateQR = async (stand: Stand) => {
        try {
            const data = `GE-STAND|${stand.id}|${stand.name}`;
            const url = await QRCode.toDataURL(data, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrCodeDataUrl(url);
            setSelectedStandForQR(stand);
        } catch (err) {
            console.error(err);
            toast.error('Erro ao gerar QR Code');
        }
    };

    const downloadQR = () => {
        if (!qrCodeDataUrl || !selectedStandForQR) return;
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `QR_STAND_${selectedStandForQR.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStandCheckInCount = (standId: string) => {
        return checkinCountByStand.get(standId) || 0;
    };

    if (!isProjectSelected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="glass-card max-w-lg w-full p-8 text-center border-orange-500/20 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                        <Filter className="w-10 h-10 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                        Selecione um Projeto
                    </h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Para gerenciar stands e gamificação, você precisa selecionar um projeto específico primeiro.
                    </p>
                    <Button
                        onClick={() => navigate('/admin/projetos')}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8"
                    >
                        Ir para Projetos
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tab Selector */}
            <div className="flex sm:inline-flex gap-1 sm:gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-full sm:w-auto overflow-x-auto custom-scrollbar no-scrollbar-mobile">
                <Button
                    variant="ghost"
                    onClick={() => {
                        setActiveTab('stands');
                        setWinner(null);
                    }}
                    className={`flex-1 sm:flex-none rounded-xl px-4 sm:px-6 py-2 h-9 sm:h-10 text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'stands' ? 'bg-orange-500 text-white shadow-glow-orange' : 'text-gray-500 hover:text-white'}`}
                >
                    Gerenciar
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('sorteio')}
                    className={`flex-1 sm:flex-none rounded-xl px-4 sm:px-6 py-2 h-9 sm:h-10 text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'sorteio' ? 'bg-orange-500 text-white shadow-glow-orange' : 'text-gray-500 hover:text-white'}`}
                >
                    Sorteio
                    {eligibleParticipants.length > 0 && (
                        <Badge className="ml-1 sm:ml-2 bg-white/20 text-white border-none py-0 px-1 text-[8px] sm:text-[10px]">
                            {eligibleParticipants.length}
                        </Badge>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('monitoramento')}
                    className={`flex-1 sm:flex-none rounded-xl px-4 sm:px-6 py-2 h-9 sm:h-10 text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'monitoramento' ? 'bg-teal-500 text-white shadow-glow-teal' : 'text-gray-500 hover:text-white'}`}
                >
                    Live
                    <div className="ml-1 sm:ml-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-400 rounded-full animate-pulse" />
                </Button>
            </div>

            {activeTab === 'stands' ? (
                <>
                    {/* Header Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 sm:min-w-[320px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nome ou localização..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 h-11 sm:h-12 w-full bg-dark-100 border-dark-300 text-white text-sm"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-glow-orange"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Stand
                        </Button>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            {
                                label: 'Total de Stands',
                                value: stands.length,
                                icon: Store,
                                color: 'orange',
                                detail: 'Pontos de visitação'
                            },
                            {
                                label: 'Total de Check-ins',
                                value: checkins.length,
                                icon: CheckCircle2,
                                color: 'teal',
                                detail: 'Visitas registradas'
                            },
                            {
                                label: 'Visitantes Únicos',
                                value: new Set(checkins.map(c => c.registrationId)).size,
                                icon: Users,
                                color: 'blue',
                                detail: 'Pessoas participando'
                            },
                            {
                                label: 'Taxa de Engajamento',
                                value: `${stands.length > 0 && inscricoes.length > 0 ? ((checkins.length / (stands.length * inscricoes.length)) * 100).toFixed(1) : 0}%`,
                                icon: TrendingUp,
                                color: 'purple',
                                detail: 'Média de visitas'
                            }
                        ].map((stat, i) => (
                            <div key={i} className={`relative overflow-hidden glass-card p-4 sm:p-6 border-l-4 border-${stat.color}-500 group hover:translate-y-[-4px] transition-all duration-300 shadow-lg shadow-black/20`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                        <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter tabular-nums">{stat.value}</p>
                                        <p className="text-gray-600 text-[8px] sm:text-[10px] mt-1 font-medium">{stat.detail}</p>
                                    </div>
                                    <div className={`p-2 sm:p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                        <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* List */}
                    <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/5">
                                        <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Stand</th>
                                        <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Localização</th>
                                        <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Check-ins</th>
                                        <th className="px-6 py-5 text-right text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredStands.map((stand) => (
                                        <tr key={stand.id} className="hover:bg-white/[0.03] transition-all group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-dark-300 border border-white/10 flex items-center justify-center overflow-hidden">
                                                        {stand.logoUrl ? (
                                                            <img src={stand.logoUrl} alt={stand.name} className="w-full h-full object-contain p-2" />
                                                        ) : (
                                                            <Store className="h-6 w-6 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm tracking-tight">{stand.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest truncate max-w-[150px]">
                                                                {stand.description || 'Sem descrição'}
                                                            </p>
                                                            {stand.ownerId && (
                                                                <Badge variant="outline" className="text-[8px] h-3.5 border-teal-500/30 text-teal-400 py-0 px-1 font-black">
                                                                    {stand.ownerType === 'startup' ? 'Startup' : 'Expositor B2B'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                                                    {stand.location || 'Não definida'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-black text-lg tracking-tighter">
                                                        {getStandCheckInCount(stand.id)}
                                                    </span>
                                                    <div className="flex -space-x-2">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-6 h-6 rounded-full bg-dark-300 border-2 border-dark-200 flex items-center justify-center">
                                                                <Users className="h-3 w-3 text-gray-600" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 w-9 p-0 text-orange-400 hover:text-white hover:bg-orange-500/10 rounded-xl border border-transparent hover:border-orange-500/20 transition-all"
                                                        onClick={() => generateQR(stand)}
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl border border-transparent hover:border-white/10 transition-all"
                                                        onClick={() => handleEdit(stand)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 w-9 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                                                        onClick={() => handleDelete(stand.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : activeTab === 'sorteio' ? (
                <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="text-left space-y-2">
                            <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase">Sorteio <span className="text-orange-500">Gamificado</span></h2>
                            <p className="text-gray-500 font-medium font-mono text-xs">CIRCUITO DE STANDS · ALGORITMO DE SELEÇÃO RANDÔMICA</p>
                        </div>

                        <div className="glass-card w-full p-10 border-orange-500/20 shadow-2xl relative overflow-hidden text-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] -z-10" />
                            
                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-center gap-12">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Elegíveis Agora</p>
                                        <p className="text-5xl font-black text-white tracking-tighter">{eligibleParticipants.length}</p>
                                    </div>
                                    <div className="w-px h-12 bg-white/10 mt-4" />
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stands no Circuito</p>
                                        <p className="text-5xl font-black text-orange-500 tracking-tighter">{stands.length}</p>
                                    </div>
                                </div>

                                {winner ? (
                                    <div className="p-10 bg-orange-500/10 border-2 border-orange-500/30 rounded-[3rem] animate-in zoom-in-95 duration-500 relative group">
                                        <div className="absolute -top-4 -right-4 bg-orange-500 text-white font-black text-[10px] px-4 py-2 rounded-full shadow-lg">PRÊMIO LIBERADO</div>
                                        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-orange group-hover:scale-110 transition-transform">
                                            <Trophy className="h-12 w-12 text-white" />
                                        </div>
                                        <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-2">🏅 TEMOS UM GANHADOR!</h3>
                                        <p className="text-4xl font-black text-white tracking-tighter mb-1">{winner.name || winner.nome}</p>
                                        <p className="text-gray-400 text-sm font-bold opacity-60">{winner.email}</p>
                                        <div className="flex justify-center mt-6">
                                            <Badge className="bg-white/5 text-gray-400 border-white/10 font-bold px-4 py-1">#{winner.id.slice(0, 8)}</Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`p-16 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 ${isDrawing ? 'bg-orange-500/5' : ''}`}>
                                        {isDrawing ? (
                                            <div className="space-y-6">
                                                <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                                <div className="h-12 overflow-hidden">
                                                    <p className="text-3xl font-black text-white uppercase italic tracking-tighter animate-pulse">
                                                        {scrollingName}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Processando base de dados...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                                    <Store className="h-10 w-10 text-gray-700" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Pronto para o Sorteio</p>
                                                    <p className="text-gray-600 text-[10px] uppercase font-medium">Clique no botão abaixo para começar</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleDraw}
                                        disabled={isDrawing || eligibleParticipants.length === 0}
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-10 rounded-3xl text-xl shadow-glow-orange group active:scale-95 transition-all"
                                    >
                                        {isDrawing ? 'SORTEANDO...' : winner ? 'REALIZAR NOVO SORTEIO' : 'INICIAR SORTEIO AGORA'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-6 border-white/5 h-fit">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-orange-500" /> Histórico de Ganhadores
                            </h3>
                            <div className="space-y-4">
                                {previousWinners.length > 0 ? (
                                    [...previousWinners].reverse().map((pw, i) => (
                                        <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center font-black text-orange-500">
                                                {previousWinners.length - i}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold text-sm truncate">{pw.name || pw.nome}</p>
                                                <p className="text-gray-500 text-[10px] font-mono">#{pw.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum ganhador ainda</p>
                                    </div>
                                )}
                            </div>
                            {previousWinners.length > 0 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full mt-6 text-gray-500 hover:text-red-400 hover:bg-red-400/5 text-[10px] font-black uppercase"
                                    onClick={() => setPreviousWinners([])}
                                >
                                    Limpar Histórico
                                </Button>
                            )}
                        </div>

                        <div className="glass-card p-6 border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Users className="h-4 w-4 text-blue-400" />
                                </div>
                                <h4 className="text-sm font-bold text-white">Base de Dados</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Total Participantes</span>
                                    <span className="text-white font-bold">{inscricoes.length}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Check-ins em Stands</span>
                                    <span className="text-white font-bold">{checkins.length}</span>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-[10px] text-gray-500 italic leading-relaxed">
                                        Apenas participantes que visitaram os <strong>{stands.length} stands</strong> deste projeto são incluídos no sorteio.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 border-teal-500/20 bg-teal-500/5">
                            <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Visitantes Ativos</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-white tracking-tighter">
                                    {new Set(checkins.map(c => c.registrationId)).size}
                                </p>
                                <p className="text-gray-500 text-xs font-bold mb-1.5 uppercase">PARTICIPANTES</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Média de Visitas</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-white tracking-tighter">
                                    {(checkins.length / Math.max(1, new Set(checkins.map(c => c.registrationId)).size)).toFixed(1)}
                                </p>
                                <p className="text-gray-500 text-xs font-bold mb-1.5 uppercase">POR PESSOA</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Cobertura do Evento</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-white tracking-tighter">
                                    {stands.length > 0 ? ((new Set(checkins.map(c => c.standId)).size / stands.length) * 100).toFixed(0) : 0}%
                                </p>
                                <p className="text-gray-500 text-xs font-bold mb-1.5 uppercase">STANDS VISITADOS</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Rankings Collumn */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Top Ranking */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                        <TrendingUp className="h-6 w-6 text-teal-400" /> Líderes de <span className="text-teal-400">Engajamento</span>
                                    </h3>
                                    <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 px-3 py-1 font-black text-[10px]">MAIS VISITADOS</Badge>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {standRanking.slice(0, 5).map((stand, index) => {
                                        const maxCheckins = standRanking[0]?.checkins || 1;
                                        const percentage = (stand.checkins / maxCheckins) * 100;

                                        return (
                                            <div key={stand.id} className="glass-card p-6 relative overflow-hidden group hover:bg-white/[0.03] transition-all">
                                                {/* Progress fill background */}
                                                <div 
                                                    className="absolute bottom-0 left-0 h-1 bg-teal-500/30 transition-all duration-1000" 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                                
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-10 h-10 rounded-full bg-dark-300 border border-white/10 flex items-center justify-center font-black text-white text-lg">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-2">
                                                                {stand.logoUrl ? (
                                                                    <img src={stand.logoUrl} alt={stand.name} className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <Store className="h-6 w-6 text-gray-600" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-white font-black uppercase tracking-tight">{stand.name}</h4>
                                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stand.location || 'Área de Exposição'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-white tracking-tighter">{stand.checkins}</p>
                                                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">VISITAS</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Attention Needed Ranking */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                                        <AlertCircle className="h-6 w-6 text-orange-500" /> Merecem <span className="text-orange-500">Atenção</span>
                                    </h3>
                                    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-3 py-1 font-black text-[10px]">MENOR ENGAJAMENTO</Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[...standRanking].reverse().slice(0, 4).map((stand) => (
                                        <div key={stand.id} className="glass-card p-5 border-orange-500/10 bg-orange-500/[0.02] flex items-center justify-between group hover:border-orange-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-dark-300 border border-orange-500/20 flex items-center justify-center overflow-hidden p-2 opacity-60">
                                                    {stand.logoUrl ? (
                                                        <img src={stand.logoUrl} alt={stand.name} className="w-full h-full object-contain grayscale" />
                                                    ) : (
                                                        <Store className="h-5 w-5 text-gray-700" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-xs uppercase truncate max-w-[120px]">{stand.name}</h4>
                                                    <p className="text-orange-500/60 text-[8px] font-black uppercase tracking-tighter">ESTIMULAR VISITAS</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-white opacity-40 capitalize">{stand.checkins}</p>
                                                <p className="text-[8px] text-gray-600 font-bold uppercase">CHECK-INS</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-400" /> Feed ao Vivo
                            </h3>
                            <div className="glass-card overflow-hidden border-white/5 bg-black/20">
                                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Atividade Recente</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-bold text-teal-500 uppercase">Live</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {recentCheckins.length > 0 ? (
                                        recentCheckins.map((c) => (
                                            <div key={c.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{c.participantName}</p>
                                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest truncate">visita <span className="text-orange-500">{c.standName}</span></p>
                                                </div>
                                                <div className="text-[9px] font-bold text-gray-600 shrink-0">
                                                    {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center opacity-30 italic text-xs text-gray-500">
                                            Aguardando as primeiras visitas...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Criação/Edição */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="admin-modal-content p-0 border-none max-w-2xl">
                    <div className="admin-modal-header">
                        <div>
                            <DialogTitle className="text-xl font-black text-white italic tracking-tight uppercase leading-none">
                                {editingStand ? 'Editar Stand' : 'Novo Stand de Experiência'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                                Configuração de gamificação e visibilidade
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
                        <div className="admin-modal-body overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Nome do Stand</label>
                                        <Input
                                            required
                                            placeholder="Ex: Coca-Cola Experience"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-dark-100 border-dark-300 text-white"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Localização / Número</label>
                                        <Input
                                            placeholder="Ex: Pavilhão A - Stand 04"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="bg-dark-100 border-dark-300 text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">URL do Logotipo / Imagem</label>
                                    <Input
                                        placeholder="https://exemplo.com/logo.png"
                                        value={formData.logoUrl}
                                        onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                                        className="bg-dark-100 border-dark-300 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Expositor Responsável (Geração de Leads)</label>
                                    <select
                                        value={`${formData.ownerType}|${formData.ownerId}`}
                                        onChange={(e) => {
                                            const [type, id] = e.target.value.split('|');
                                            setFormData({ 
                                                ...formData, 
                                                ownerType: (type as 'startup' | 'company' | 'sponsor') || '', 
                                                ownerId: id || '' 
                                            });
                                        }}
                                        className="w-full bg-dark-100 border border-dark-300 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="|">Nenhum (Apenas Gamificação)</option>
                                        <optgroup label="Startups">
                                            {startups.map(s => (
                                                <option key={s.id} value={`startup|${s.id}`}>{s.name} (Startup)</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Empresas B2B">
                                            {companies.map(c => (
                                                <option key={c.id} value={`company|${c.id}`}>{c.name} (B2B)</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <p className="text-[9px] text-gray-500 mt-1 font-medium">Ao vincular um expositor, ele receberá os dados dos visitantes em tempo real.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Descrição Curta</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-dark-100 border border-dark-300 rounded-lg p-4 text-white text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="O que o visitante encontrará neste stand?"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="border-dark-300 text-gray-400 hover:bg-dark-300 hover:text-white"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processando...' : editingStand ? 'Salvar Alterações' : 'Cadastrar Stand'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal QR Code */}
            <Dialog open={!!selectedStandForQR} onOpenChange={(open) => !open && setSelectedStandForQR(null)}>
                <DialogContent className="admin-modal-content p-0 border-none max-w-sm bg-white overflow-hidden">
                    <VisuallyHidden.Root>
                        <DialogTitle>QR Code do Stand</DialogTitle>
                        <DialogDescription>Visualize e baixe o QR Code para este stand</DialogDescription>
                    </VisuallyHidden.Root>
                    
                    <div className="p-8 text-center space-y-6">
                        <div className="flex justify-between items-center text-dark-500 mb-2">
                            <Store className="h-6 w-6 text-orange-500" />
                            <Button variant="ghost" size="sm" onClick={() => setSelectedStandForQR(null)} className="h-8 w-8 p-0 rounded-full">
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-dark-500 uppercase tracking-tight">{selectedStandForQR?.name}</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{selectedStandForQR?.location || 'Local não definido'}</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center">
                            {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code Stand" className="w-full h-auto rounded-xl" />}
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={downloadQR}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-2"
                            >
                                <Download className="h-5 w-5" />
                                DOWNLOAD PARA IMPRESSÃO
                            </Button>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                Imprima este QR Code e coloque-o visível no stand.<br/>O participante deverá scanear para ganhar pontos.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

