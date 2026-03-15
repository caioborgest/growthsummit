import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Trash2,
    Edit3,
    QrCode,
    MapPin,
    Users,
    Filter,
    TrendingUp,
    Store,
    Download,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStands, useStandCheckIns, useInscricoes, useStartups, useCompanies } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import type { Stand, Startup, Company } from '@/types';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import QRCode from 'qrcode';

export default function AdminStands() {
    const { projectId, isProjectSelected } = useProject();
    const navigate = useNavigate();
    const { data: stands, create, update, remove, isLoading } = useStands();
    const { data: checkins } = useStandCheckIns();
    const { data: inscricoes } = useInscricoes();
    const { data: startups } = useStartups();
    const { data: companies } = useCompanies();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStand, setEditingStand] = useState<Stand | null>(null);
    const [selectedStandForQR, setSelectedStandForQR] = useState<Stand | null>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

    const [activeTab, setActiveTab] = useState<'stands' | 'sorteio'>('stands');
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<any>(null);

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

    const eligibleParticipants = useMemo(() => {
        if (stands.length === 0) return [];
        return inscricoes.filter(reg => {
            const visitedCount = checkinsByRegistration.get(reg.id)?.size || 0;
            return visitedCount >= stands.length;
        });
    }, [inscricoes, stands, checkinsByRegistration]);

    const handleDraw = () => {
        if (eligibleParticipants.length === 0) {
            toast.error('Nenhum participante elegível (visitou todos os stands).');
            return;
        }

        setIsDrawing(true);
        setWinner(null);

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
            setWinner(eligibleParticipants[randomIndex]);
            setIsDrawing(false);
            toast.success('Ganhador sorteado com sucesso!');
        }, 3000);
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
                    ownerType: (formData.ownerType as any) || undefined,
                });
                toast.success('Novo stand cadastrado com sucesso!');
            }

            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            logger.error('Erro ao salvar stand:', err);
            toast.error(err.message || 'Erro ao salvar stand.');
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
            } catch (err: any) {
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
            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                <Button
                    variant="ghost"
                    onClick={() => {
                        setActiveTab('stands');
                        setWinner(null);
                    }}
                    className={`rounded-xl px-6 py-2 h-auto text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'stands' ? 'bg-orange-500 text-white shadow-glow-orange' : 'text-gray-500 hover:text-white'}`}
                >
                    Gerenciar Stands
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('sorteio')}
                    className={`rounded-xl px-6 py-2 h-auto text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'sorteio' ? 'bg-orange-500 text-white shadow-glow-orange' : 'text-gray-500 hover:text-white'}`}
                >
                    Realizar Sorteio
                    {eligibleParticipants.length > 0 && (
                        <Badge className="ml-2 bg-white/20 text-white border-none py-0 px-1.5 text-[10px]">
                            {eligibleParticipants.length}
                        </Badge>
                    )}
                </Button>
            </div>

            {activeTab === 'stands' ? (
                <>
                    {/* Header Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="relative flex-1 sm:min-w-[320px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nome ou localização..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 w-full bg-dark-100 border-dark-300 text-white"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <div key={i} className={`relative overflow-hidden glass-card p-6 border-l-4 border-${stat.color}-500 group hover:translate-y-[-4px] transition-all duration-300 shadow-lg shadow-black/20`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                        <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                                        <p className="text-gray-600 text-[10px] mt-1 font-medium">{stat.detail}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                        <stat.icon className="h-6 w-6" />
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
                                                        <Edit3 className="h-4 w-4" />
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
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in fade-in duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Sorteio Gamificado</h2>
                        <p className="text-gray-500 font-medium">Sorteie prêmios entre os participantes que completaram o circuito de stands.</p>
                    </div>

                    <div className="glass-card max-w-2xl w-full p-10 border-orange-500/20 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] -z-10" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-center gap-12">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Elegíveis</p>
                                    <p className="text-5xl font-black text-white tracking-tighter">{eligibleParticipants.length}</p>
                                </div>
                                <div className="w-px h-12 bg-white/10 mt-4" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Stands</p>
                                    <p className="text-5xl font-black text-orange-500 tracking-tighter">{stands.length}</p>
                                </div>
                            </div>

                            {winner ? (
                                <div className="p-8 bg-orange-500/10 border-2 border-orange-500/30 rounded-[2.5rem] animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-orange">
                                        <Trophy className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-2">🏅 GANHADOR(A) ENCONTRADO!</h3>
                                    <p className="text-3xl font-black text-white tracking-tight mb-1">{winner.name || winner.nome}</p>
                                    <p className="text-gray-500 text-sm font-bold">{winner.email}</p>
                                    <p className="text-gray-600 text-[10px] mt-4 font-black uppercase tracking-widest italic">{winner.ticketType || 'Experience Pro'}</p>
                                </div>
                            ) : (
                                <div className={`p-12 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 ${isDrawing ? 'animate-pulse' : ''}`}>
                                    {isDrawing ? (
                                        <>
                                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-xl font-black text-white uppercase italic tracking-tighter">Sorteando agora...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Users className="h-12 w-12 text-gray-600 mb-2" />
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Aguardando início do sorteio</p>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    onClick={handleDraw}
                                    disabled={isDrawing || eligibleParticipants.length === 0}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-8 rounded-2xl text-lg shadow-glow-orange group"
                                >
                                    {isDrawing ? 'SORTEANDO...' : winner ? 'SORTEAR NOVAMENTE' : 'INICIAR SORTEIO AGORA'}
                                </Button>
                            </div>

                            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">
                                O sistema seleciona aleatoriamente um participante que tenha<br/>registrado check-in em todos os {stands.length} stands ativos do projeto.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Novo/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-card max-w-xl w-full p-0 overflow-hidden shadow-2xl border-orange-500/20">
                        <div className="p-6 border-b border-dark-300 flex justify-between items-center bg-dark-300/30">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editingStand ? 'Editar Stand' : 'Novo Stand'}
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">Configure o ponto de visitação para gamificação.</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="text-gray-500">
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
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
                                            ownerType: (type as any) || '', 
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

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 border-dark-300 text-gray-400 hover:bg-dark-300 hover:text-white"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processando...' : editingStand ? 'Salvar Alterações' : 'Cadastrar Stand'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal QR Code */}
            {selectedStandForQR && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-8 text-center space-y-6">
                        <div className="flex justify-between items-center text-dark-500 mb-2">
                            <Store className="h-6 w-6 text-orange-500" />
                            <Button variant="ghost" size="sm" onClick={() => setSelectedStandForQR(null)} className="h-8 w-8 p-0 rounded-full">
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-dark-500 uppercase tracking-tight">{selectedStandForQR.name}</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{selectedStandForQR.location || 'Local não definido'}</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center">
                            <img src={qrCodeDataUrl} alt="QR Code Stand" className="w-full h-auto rounded-xl" />
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
                </div>
            )}
        </div>
    );
}

function Trophy(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
