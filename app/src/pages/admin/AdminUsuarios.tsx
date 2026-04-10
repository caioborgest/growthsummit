import { useState, useMemo } from 'react';
import {
    Search,
    Download,
    UserPlus,
    Shield,
    Briefcase,
    Mail,
    MoreVertical,
    Edit2,
    Trash2,
    PhoneCall,
    Package,
    Contact,
    CheckCircle2,
    HeartHandshake,
    HardHat,
    Monitor,
    Ticket,
    ShoppingCart,
    Filter,
    Users,
    X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers } from '@/hooks/useData';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { createAuthUserWithoutSession } from '@/lib/auth-helpers';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { exportToCSV } from '@/utils/csv';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AccreditationChecklistModal } from '@/components/admin/AccreditationChecklistModal';
import { useCheckIns } from '@/hooks/useData';
import type { User } from '@/types';

const departmentIcons: Record<string, React.ElementType> = {
    'sponsorship': HeartHandshake,
    'stands': HardHat,
    'programming': Monitor,
    'accreditation': Ticket,
    'sales': ShoppingCart,
    'support': PhoneCall,
    'cleaning': Trash2,
    'marketing': Mail,
    'finance': Briefcase,
    'security': Shield,
    'admin': Shield,
};

const departmentLabels: Record<string, string> = {
    'sponsorship': 'Patrocínios',
    'stands': 'Stands',
    'programming': 'Programação',
    'accreditation': 'Credenciamento',
    'sales': 'Vendas',
    'support': 'Suporte',
    'cleaning': 'Limpeza',
    'marketing': 'Marketing',
    'finance': 'Financeiro',
    'security': 'Segurança',
    'admin': 'Administrativo',
    'logistics': 'Logística'
};

const staffRoleLabels: Record<string, string> = {
    'coordinator': 'Coordenador',
    'responsible': 'Responsável',
    'assistant': 'Auxiliar',
    'volunteer': 'Voluntário'
};

const roleColors: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-400 border-red-500/50',
    staff: 'bg-teal-500/20 text-teal-400 border-teal-500/50',
    mentor: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    sponsor: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    company: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    startup: 'bg-green-500/20 text-green-400 border-green-500/50',
    participant: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
};

const INTERNAL_ROLES = ['admin', 'staff', 'mentor', 'sponsor', 'company', 'startup'];

export default function AdminUsuarios() {
    const navigate = useNavigate();
    const { projectId } = useProject();
    
    // Memoize the filters object to ensure it's stable across renders
    const userFilters = useMemo(() => ({ 
        role: INTERNAL_ROLES 
    }), [projectId]);

    // Filter by roles to avoid full table scans on 'users'
    const { data: users, create, update, remove, isLoading } = useUsers(userFilters);
    const { data: checkIns } = useCheckIns();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Otimização: Criar um Map para busca rápida de check-ins
    const checkInsByUserId = useMemo(() => {
        const map = new Map<string, any[]>();
        checkIns.forEach(c => {
            if (c.userId) {
                if (!map.has(c.userId)) map.set(c.userId, []);
                map.get(c.userId)?.push(c);
            }
        });
        return map;
    }, [checkIns]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff' as User['role'],
        department: '',
        staffRole: '',
    });

    const [selectedEntity, setSelectedEntity] = useState<any>(null);
    const [selectedRole, setSelectedRole] = useState<'participant' | 'mentor' | 'company' | 'startup'>('participant');
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);

    const filteredUsers = users.filter(user => {
        // Base filtering: Internal team and partners only
        if (user.role === 'participant' || user.role === 'visitor') return false;

        // Ensure super admin is only shown as admin and not in other categorizations
        if (user.email === 'projetos@cbxgrowth.com.br' && user.role !== 'admin') return false;

        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesDept = deptFilter === 'all' || user.department === deptFilter;
        return matchesSearch && matchesRole && matchesDept;
    });

    const handleEdit = (user: User) => {
        setEditingUser({ ...user });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingUser) return;

        try {
            await update(editingUser.id, {
                role: editingUser.role,
                department: editingUser.department,
                staffRole: editingUser.staffRole,
            });
            toast.success('Usuário atualizado com sucesso!');
            setIsEditDialogOpen(false);
        } catch (error) {
            logger.error('Erro ao atualizar usuário:', error);
            toast.error('Erro ao atualizar usuário');
        }
    };

    const handleCreate = async () => {
        if (!newUserData.email || !newUserData.name) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        try {
            // ── STEP 1: Criar no Supabase Auth
            let authUserId: string | undefined;
            try {
                const authUser = await createAuthUserWithoutSession({
                    email: newUserData.email,
                    password: newUserData.password || 'Growth@2026',
                    name: newUserData.name,
                    role: newUserData.role
                });
                authUserId = authUser?.id;
            } catch (authErr: any) {
                const msg = authErr.message?.toLowerCase() || '';
                if (!msg.includes('already registered') && !msg.includes('email matching')) {
                    throw authErr;
                }
            }

            // ── STEP 2: Criar na tabela public.users (via create do useUsers)
            await create({
                id: authUserId,
                name: newUserData.name,
                email: newUserData.email,
                role: newUserData.role,
                department: newUserData.department,
                staffRole: newUserData.staffRole,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as any);

            toast.success('Membro adicionado com sucesso e conta criada!');
            setIsCreateDialogOpen(false);
            setNewUserData({
                name: '',
                email: '',
                password: '',
                role: 'staff',
                department: '',
                staffRole: '',
            });
        } catch (error: any) {
            logger.error('Erro ao adicionar membro:', error);
            toast.error('Erro ao adicionar membro: ' + (error.message || 'Erro desconhecido'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este usuário?')) return;

        try {
            await remove(id);
            toast.success('Usuário removido com sucesso!');
        } catch (error) {
            logger.error('Erro ao remover usuário:', error);
            toast.error('Erro ao remover usuário');
        }
    };

    const staffCount = users.filter(u => u.role === 'staff').length;
    const mentorCount = users.filter(u => u.role === 'mentor').length;
    const totalUsers = users.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Equipe e Parceiros</h1>
                    <p className="text-gray-400">Gestão de membros da equipe, mentores, palestrantes e administradores.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-dark-300 text-gray-300" onClick={() => exportToCSV(users, 'equipe_projeto')}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black h-14 px-8 rounded-2xl text-[10px] uppercase tracking-widest shadow-glow-teal flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                                <UserPlus className="h-5 w-5" />
                                ADICIONAR MEMBRO
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="admin-modal-content max-w-md bg-dark-200 border-none p-0 overflow-hidden shadow-2xl">
                            <div className="admin-modal-header">
                                <div>
                                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                                    <UserPlus className="h-7 w-7 text-teal-500" />
                                    Novo <span className="text-teal-500">Membro</span>
                                </DialogTitle>
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                        Equipe interna ou parceiro estratégico
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    className="h-10 w-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="admin-modal-body">
                                <div className="space-y-6 py-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="create-name" className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome Completo *</Label>
                                        <Input
                                            id="create-name"
                                            value={newUserData.name}
                                            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                            className="h-12 bg-white/5 border-white/10 text-white font-bold"
                                            placeholder="Ex: João Silva"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="create-email" className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">E-mail Corporativo *</Label>
                                        <Input
                                            id="create-email"
                                            type="email"
                                            value={newUserData.email}
                                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                            className="h-12 bg-white/5 border-white/10 text-white font-bold"
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="create-password" className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Senha Provisória</Label>
                                        <Input
                                            id="create-password"
                                            type="password"
                                            value={newUserData.password}
                                            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                                            className="h-12 bg-white/5 border-white/10 text-white font-bold"
                                            placeholder="Deixe em branco para 'Growth@2026'"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="create-role" className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Cargo Principal</Label>
                                            <select
                                                id="create-role"
                                                value={newUserData.role}
                                                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as User['role'] })}
                                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                            >
                                                <option value="staff">Staff</option>
                                                <option value="admin">Administrador</option>
                                                <option value="mentor">Mentor</option>
                                                <option value="speaker">Palestrante</option>
                                                <option value="sponsor">Patrocinador</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="create-dept" className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Departamento</Label>
                                            <select
                                                id="create-dept"
                                                value={newUserData.department}
                                                onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                            >
                                                <option value="">Nenhum / Geral</option>
                                                {Object.entries(departmentLabels).map(([val, label]) => (
                                                    <option key={val} value={val}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    className="text-gray-400 hover:text-white font-bold h-12 px-8 rounded-xl border border-white/5"
                                >
                                    CANCELAR
                                </Button>
                                <Button 
                                    onClick={handleCreate} 
                                    className="bg-teal-500 hover:bg-teal-600 text-white font-black px-10 h-12 rounded-xl shadow-glow-teal border-none uppercase"
                                >
                                    CRIAR MEMBRO
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="h-5 w-5 text-teal-400" />
                        <Badge variant="outline" className="border-teal-500/30 text-teal-400">Total</Badge>
                    </div>
                    <p className="text-2xl font-bold text-white">{totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">Usuários no sistema</p>
                </div>
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Briefcase className="h-5 w-5 text-orange-400" />
                        <Badge variant="outline" className="border-orange-500/30 text-orange-400">Staff</Badge>
                    </div>
                    <p className="text-2xl font-bold text-white">{staffCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Membros da equipe</p>
                </div>
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="h-5 w-5 text-purple-400" />
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">Mentores</Badge>
                    </div>
                    <p className="text-2xl font-bold text-white">{mentorCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Especialistas cadastrados</p>
                </div>
                <div className="glass-card p-4 hidden lg:block">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <Badge variant="outline" className="border-green-500/30 text-green-400">Membros</Badge>
                    </div>
                    <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total filtrado</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 bg-dark-200 p-4 rounded-xl border border-dark-300">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-dark-300 border-dark-400 text-white"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-dark-300 px-3 py-1 rounded-lg border border-dark-400">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-transparent text-sm text-gray-300 focus:outline-none"
                        >
                            <option value="all">Todos os Cargos</option>
                            <option value="admin">Administrador</option>
                            <option value="staff">Staff</option>
                            <option value="mentor">Mentor</option>
                            <option value="speaker">Palestrante</option>
                            <option value="sponsor">Patrocinador</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-dark-300 px-3 py-1 rounded-lg border border-dark-400">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="bg-transparent text-sm text-gray-300 focus:outline-none"
                        >
                            <option value="all">Todos Departamentos</option>
                            {Object.entries(departmentLabels).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                <div className="overflow-x-auto responsive-table">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-4 text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Usuário</th>
                                <th className="p-4 text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Cargo / Nível</th>
                                <th className="p-4 text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Departamento</th>
                                <th className="p-4 text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Acreditação</th>
                                <th className="p-4 text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Entrou em</th>
                                <th className="p-4 text-gray-500 font-extrabold text-[10px] uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-300">
                            {filteredUsers.map((user) => {
                                const DeptIcon = user.department ? departmentIcons[user.department] || Shield : null;

                                return (
                                    <tr key={user.id} className="hover:bg-white/[0.04] transition-all group">
                                        <td className="p-4" data-label="Usuário">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=14B8A6&color=fff`}
                                                    alt={user.name}
                                                    className="h-10 w-10 rounded-full border border-white/10 shadow-lg"
                                                />
                                                <div>
                                                    <p className="text-white font-bold italic tracking-tight">{user.name}</p>
                                                    <p className="text-gray-500 text-[10px] font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4" data-label="Cargo">
                                            <Badge className={`${roleColors[user.role] || roleColors.participant} font-black text-[10px] uppercase tracking-widest px-2 py-0.5`}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="p-4" data-label="Dep.">
                                            {user.department ? (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    {DeptIcon && <DeptIcon className="h-4 w-4 text-teal-400/70" />}
                                                    <span className="text-xs font-bold uppercase tracking-wider">{departmentLabels[user.department] || user.department}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-700 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4" data-label="Acredt.">
                                            <div className="flex items-center gap-1.5 lg:justify-start justify-end">
                                                {(() => {
                                                    const userCheckIns = (checkInsByUserId.get(user.id) || []).filter(c => c.location && c.location.includes('Credenciamento'));
                                                    const entrance = userCheckIns.length > 0;
                                                    const kit = userCheckIns.some(c => c.location && c.location.includes('Kit: Sim'));
                                                    const badge = userCheckIns.some(c => c.location && c.location.includes('Crachá: Sim'));
                                                    return (
                                                        <>
                                                            <div title="Entrada" className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${entrance ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-lg shadow-green-500/10' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div title="Crachá" className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${badge ? 'bg-brand-orange-coral/10 border-brand-orange-coral/30 text-brand-orange-coral shadow-lg shadow-brand-orange-coral/10' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                                                <Contact className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div title="Kit" className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${kit ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-lg shadow-teal-500/10' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                                                <Package className="h-3.5 w-3.5" />
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500 text-xs font-black uppercase tracking-widest" data-label="Entrou">
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4 text-right" data-label="Ações">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-500 hover:text-white rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-dark-200 border-dark-300">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedEntity({ ...user, projectId: 'GS2026' }); // Default project context
                                                            setSelectedRole(user.role as any);
                                                            setIsChecklistOpen(true);
                                                        }}
                                                        className="text-teal-400 hover:bg-teal-500/10 cursor-pointer font-bold"
                                                    >
                                                        <Ticket className="h-4 w-4 mr-2" />
                                                        Acreditar / Entrega
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(user)}
                                                        className="text-gray-300 hover:bg-dark-300 cursor-pointer"
                                                    >
                                                        <Edit2 className="h-4 w-4 mr-2" />
                                                        Editar Acesso
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-gray-300 hover:bg-dark-300 cursor-pointer" onClick={() => navigate('/em-breve/contato-membro')}>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Enviar Mensagem
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remover Acesso
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="admin-modal-content max-w-md bg-dark-200 border-none p-0 overflow-hidden shadow-2xl">
                    <div className="admin-modal-header">
                        <div>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                            <Edit2 className="h-7 w-7 text-teal-500" />
                            Editar <span className="text-teal-500">Acesso</span>
                        </DialogTitle>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                Usuário: {editingUser?.name}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="h-10 w-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="admin-modal-body">
                        <div className="space-y-6 py-4">
                            <div className="space-y-3">
                                <Label htmlFor="role" className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Cargo Principal</Label>
                                <select
                                    id="role"
                                    value={editingUser?.role || ''}
                                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value as User['role'] } : null)}
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Administrador</option>
                                    <option value="mentor">Mentor</option>
                                    <option value="speaker">Palestrante</option>
                                    <option value="sponsor">Patrocinador</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="department" className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Departamento / Área</Label>
                                <select
                                    id="department"
                                    value={editingUser?.department || ''}
                                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, department: e.target.value } : null)}
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                >
                                    <option value="">Nenhum / Geral</option>
                                    {Object.entries(departmentLabels).map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="staffRole" className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nível de Responsabilidade</Label>
                                <select
                                    id="staffRole"
                                    value={editingUser?.staffRole || ''}
                                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, staffRole: e.target.value } : null)}
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                >
                                    <option value="">Selecione...</option>
                                    {Object.entries(staffRoleLabels).map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsEditDialogOpen(false)}
                            className="text-gray-400 hover:text-white font-bold h-12 px-8 rounded-xl border border-white/5"
                        >
                            CANCELAR
                        </Button>
                        <Button 
                            onClick={handleUpdate} 
                            disabled={isLoading}
                            className="bg-teal-500 hover:bg-teal-600 text-white font-black px-10 h-12 rounded-xl shadow-glow-teal border-none uppercase"
                        >
                            SALVAR ALTERAÇÕES
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {isChecklistOpen && (
                <AccreditationChecklistModal
                    isOpen={isChecklistOpen}
                    onClose={() => {
                        setIsChecklistOpen(false);
                        setSelectedEntity(null);
                    }}
                    entity={selectedEntity}
                    role={selectedRole}
                    onSuccess={() => {}}
                />
            )}
        </div>
    );
}
