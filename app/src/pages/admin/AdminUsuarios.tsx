import { useState } from 'react';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers } from '@/hooks/useData';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { createAuthUserWithoutSession } from '@/lib/auth-helpers';
import { useNavigate } from 'react-router-dom';
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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

export default function AdminUsuarios() {
    const navigate = useNavigate();
    const { data: users, create, update, remove, isLoading } = useUsers();
    const { data: checkIns } = useCheckIns();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
        staffRole: '',
    });

    const [selectedEntity, setSelectedEntity] = useState<any>(null);
    const [selectedRole, setSelectedRole] = useState<'participant' | 'mentor' | 'company' | 'startup'>('participant');
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);

    const filteredUsers = users.filter(user => {
        // Base filtering: Internal team and partners only
        if (user.role === 'participant' || user.role === 'visitor') return false;

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
    const adminCount = users.filter(u => u.role === 'admin').length;
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
                            <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => setIsCreateDialogOpen(true)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Adicionar Membro
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-md">
                            <DialogHeader>
                                <DialogTitle>Adicionar Novo Membro</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Cadastre um novo membro da equipe ou administrador.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create-name">Nome Completo *</Label>
                                    <Input
                                        id="create-name"
                                        value={newUserData.name}
                                        onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                        className="bg-dark-300 border-dark-400 text-white"
                                        placeholder="Ex: João Silva"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-email">E-mail *</Label>
                                    <Input
                                        id="create-email"
                                        type="email"
                                        value={newUserData.email}
                                        onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                        className="bg-dark-300 border-dark-400 text-white"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-password">Senha Provisória</Label>
                                    <Input
                                        id="create-password"
                                        type="password"
                                        value={newUserData.password}
                                        onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                                        className="bg-dark-300 border-dark-400 text-white"
                                        placeholder="Deixe em branco para 'Growth@2026'"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-role">Cargo Principal</Label>
                                    <select
                                        id="create-role"
                                        value={newUserData.role}
                                        onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as User['role'] })}
                                        className="w-full bg-dark-300 border border-dark-400 rounded-lg p-2 text-white"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Administrador</option>
                                        <option value="mentor">Mentor</option>
                                        <option value="speaker">Palestrante</option>
                                        <option value="sponsor">Patrocinador</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-dept">Departamento</Label>
                                    <select
                                        id="create-dept"
                                        value={newUserData.department}
                                        onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                                        className="w-full bg-dark-300 border border-dark-400 rounded-lg p-2 text-white"
                                    >
                                        <option value="">Nenhum / Geral</option>
                                        {Object.entries(departmentLabels).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-dark-400 text-white">
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreate} className="bg-teal-500 hover:bg-teal-600 text-white">
                                    Adicionar Membro
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <UserIcon className="h-5 w-5 text-teal-400" />
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
                        <UserIcon className="h-5 w-5 text-purple-400" />
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">Mentores</Badge>
                    </div>
                    <p className="text-2xl font-bold text-white">{mentorCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Especialistas cadastrados</p>
                </div>
                <div className="glass-card p-4 hidden lg:block">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
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
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-300 text-left">
                                <th className="p-4 text-gray-400 font-medium text-sm">Usuário</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Cargo / Nível</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Departamento</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Acreditação</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Entrou em</th>
                                <th className="p-4 text-gray-400 font-medium text-sm text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-300">
                            {filteredUsers.map((user) => {
                                const DeptIcon = user.department ? departmentIcons[user.department] || Shield : null;

                                return (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=21808D&color=fff`}
                                                    alt={user.name}
                                                    className="h-10 w-10 rounded-full border border-white/10"
                                                />
                                                <div>
                                                    <p className="text-white font-medium">{user.name}</p>
                                                    <p className="text-gray-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={roleColors[user.role] || roleColors.participant}>
                                                {user.role.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {user.department ? (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    {DeptIcon && <DeptIcon className="h-4 w-4 text-teal-400" />}
                                                    <span className="text-sm">{departmentLabels[user.department] || user.department}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const userCheckIns = checkIns.filter(c => c.userId === user.id && c.checkInType === 'event');
                                                    const entrance = userCheckIns.length > 0;
                                                    const kit = userCheckIns.some(c => {
                                                        try { return JSON.parse(c.notes || '{}').kit === true; } catch { return false; }
                                                    });
                                                    const badge = userCheckIns.some(c => {
                                                        try { return JSON.parse(c.notes || '{}').badge === true; } catch { return false; }
                                                    });

                                                    return (
                                                        <>
                                                            <div title="Entrada" className={`w-6 h-6 rounded-md flex items-center justify-center border ${entrance ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            </div>
                                                            <div title="Crachá" className={`w-6 h-6 rounded-md flex items-center justify-center border ${badge ? 'bg-brand-orange-coral/10 border-brand-orange-coral/30 text-brand-orange-coral' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                                                <Contact className="h-3 w-3" />
                                                            </div>
                                                            <div title="Kit" className={`w-6 h-6 rounded-md flex items-center justify-center border ${kit ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                                                <Package className="h-3 w-3" />
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm font-mono">
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => navigate('/em-breve/detalhes-usuario')}>
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
                <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Acesso de Usuário</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Altere as responsabilidades e níveis de acesso de {editingUser?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Cargo Principal</Label>
                            <select
                                id="role"
                                value={editingUser?.role || ''}
                                onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value as User['role'] } : null)}
                                className="w-full bg-dark-300 border border-dark-400 rounded-lg p-2 text-white"
                            >
                                <option value="staff">Staff</option>
                                <option value="admin">Administrador</option>
                                <option value="mentor">Mentor</option>
                                <option value="speaker">Palestrante</option>
                                <option value="sponsor">Patrocinador</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Departamento / Área</Label>
                            <select
                                id="department"
                                value={editingUser?.department || ''}
                                onChange={(e) => setEditingUser(prev => prev ? { ...prev, department: e.target.value } : null)}
                                className="w-full bg-dark-300 border border-dark-400 rounded-lg p-2 text-white"
                            >
                                <option value="">Nenhum / Geral</option>
                                {Object.entries(departmentLabels).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="staffRole">Nível de Responsabilidade</Label>
                            <select
                                id="staffRole"
                                value={editingUser?.staffRole || ''}
                                onChange={(e) => setEditingUser(prev => prev ? { ...prev, staffRole: e.target.value } : null)}
                                className="w-full bg-dark-300 border border-dark-400 rounded-lg p-2 text-white"
                            >
                                <option value="">Selecione...</option>
                                {Object.entries(staffRoleLabels).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-dark-400 text-white">
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate} className="bg-teal-500 hover:bg-teal-600 text-white" disabled={isLoading}>
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
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
