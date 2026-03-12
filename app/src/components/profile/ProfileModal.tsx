import { useState, useEffect } from 'react';
import {
    X,
    User,
    Building2,
    Globe,
    Linkedin,
    MapPin,
    Calendar,
    Mail,
    Phone,
    Save,
    Loader2,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useData';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'pessoal' | 'profissional' | 'social' | 'endereco';

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, updateProfile: updateAuthUser } = useAuth();
    const { data: profile, update: updateProfileData, isLoading: isProfileLoading } = useProfile(user?.id);

    const [activeTab, setActiveTab] = useState<TabType>('pessoal');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [consents, setConsents] = useState<Array<{id:string; consent_type:string; granted_at:string; revoked_at:string|null;}>>([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        birthDate: '',
        gender: '',
        company: '',
        position: '',
        bio: '',
        website: '',
        linkedin: '',
        city: '',
        state: '',
        country: 'Brasil',
        cpf: '',
        cnpj: '',
        photoPreview: '',
        photoFile: null as File | null
    });

    const fetchConsents = async () => {
        if (!user?.id) return;
        const { data } = await supabase
            .from('user_consents')
            .select('id,user_id,consent_type,granted_at,revoked_at')
            .eq('user_id', user.id)
            .order('granted_at', { ascending: false });
        setConsents(data || []);
    };

    const revokeConsent = async (id: string) => {
        await supabase
            .from('user_consents')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', id);
        fetchConsents();
    };

    useEffect(() => {
        if (user || profile) {
            setFormData({
                name: user?.name || '',
                phone: profile?.phone || user?.phone || '',
                birthDate: profile?.birthDate || '',
                gender: profile?.gender || '',
                company: profile?.company || '',
                position: profile?.position || '',
                bio: profile?.bio || '',
                website: profile?.website || '',
                linkedin: profile?.linkedin || '',
                city: profile?.city || '',
                state: profile?.state || '',
                country: profile?.country || 'Brasil',
                cpf: profile?.cpf || '',
                cnpj: profile?.cnpj || '',
                photoPreview: user?.avatar || '',
                photoFile: null
            });
        }
    }, [user, profile, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchConsents();
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem válida.'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 2MB.'); return; }
        setFormData(prev => ({ ...prev, photoFile: file, photoPreview: URL.createObjectURL(file) }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let photoUrl = user?.avatar || '';

            // 1. Upload new photo if selected
            if (formData.photoFile) {
                setIsUploading(true);
                const ext = formData.photoFile.name.split('.').pop();
                const path = `profiles/${user?.id}-${Date.now()}.${ext}`;
                const { error: uploadError } = await (supabase.storage as any)
                    .from('event-images')
                    .upload(path, formData.photoFile, { upsert: true });

                if (uploadError) throw new Error('Erro no upload da foto: ' + uploadError.message);

                const { data: urlData } = (supabase.storage as any).from('event-images').getPublicUrl(path);
                photoUrl = urlData.publicUrl;
                setIsUploading(false);
            }

            // 2. Update Auth User & Global User State
            await updateAuthUser({
                name: formData.name,
                avatar: photoUrl,
                phone: formData.phone
            });

            // 3. Update Extended Profile
            await updateProfileData({
                phone: formData.phone,
                birthDate: formData.birthDate,
                gender: formData.gender as any,
                company: formData.company,
                position: formData.position,
                bio: formData.bio,
                website: formData.website,
                linkedin: formData.linkedin,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                cpf: formData.cpf,
                cnpj: formData.cnpj
            });

            toast.success('Perfil atualizado com sucesso!');
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Erro ao atualizar perfil');
        } finally {
            setIsSaving(false);
            setIsUploading(false);
        }
    };

    const tabs = [
        { id: 'pessoal', label: 'Pessoal', icon: User },
        { id: 'profissional', label: 'Profissional', icon: Briefcase },
        { id: 'social', label: 'Social & Web', icon: Globe },
        { id: 'endereco', label: 'Endereço', icon: MapPin },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#161920] border border-white/10 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-brand-orange-coral" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Meu Perfil</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Gestão de Identidade</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex px-6 sm:px-8 py-4 gap-2 border-b border-white/5 bg-white/[0.01] overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-brand-orange-coral text-white shadow-lg shadow-brand-orange-coral/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                    <div className="space-y-6">
                        {activeTab === 'pessoal' && (
                            <div className="animate-in slide-in-from-bottom-2 duration-300 space-y-8">
                                {/* Photo Upload Section */}
                                <div className="flex flex-col items-center gap-4 pb-4 border-b border-white/5">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-3xl bg-brand-orange-coral/10 border-2 border-dashed border-brand-orange-coral/30 overflow-hidden flex items-center justify-center group-hover:border-brand-orange-coral/60 transition-all">
                                            {formData.photoPreview ? (
                                                <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-10 w-10 text-gray-500" />
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 p-2 bg-brand-orange-coral rounded-xl cursor-pointer shadow-lg hover:bg-brand-orange-intense transition-all hover:scale-105">
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <ShieldCheck className="h-4 w-4 text-white" />}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center">
                                        Clique no ícone para alterar sua foto de perfil<br />(JPEG, PNG, WebP • Máx. 2MB)
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-brand-orange-coral" /> Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-brand-orange-coral" /> E-mail
                                        </label>
                                        <input
                                            type="email"
                                            readOnly
                                            disabled
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed outline-none"
                                            value={user?.email || ''}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-brand-orange-coral" /> WhatsApp / Celular
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="(00) 00000-0000"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-brand-orange-coral" /> Data de Nascimento
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all"
                                            value={formData.birthDate}
                                            onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profissional' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                            <Building2 className="h-3.5 w-3.5 text-brand-orange-coral" /> Empresa
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all"
                                            value={formData.company}
                                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                            <Briefcase className="h-3.5 w-3.5 text-brand-orange-coral" /> Cargo
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all"
                                            value={formData.position}
                                            onChange={e => setFormData({ ...formData, position: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400">Mini Biografia</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all resize-none text-sm leading-relaxed"
                                        placeholder="Conte um pouco sobre sua trajetória profissional..."
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                        <Linkedin className="h-3.5 w-3.5 text-brand-orange-coral" /> LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/seu-perfil"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all"
                                        value={formData.linkedin}
                                        onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                        <Globe className="h-3.5 w-3.5 text-brand-orange-coral" /> Website / Portfólio
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://suaempresa.com.br"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all"
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'endereco' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-brand-orange-coral" /> Cidade
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400">Estado (UF)</label>
                                    <input
                                        type="text"
                                        maxLength={2}
                                        placeholder="EX: PE"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-orange-coral outline-none transition-all uppercase"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Consents (LGPD) */}
                {consents.length > 0 && (
                    <div className="p-6 sm:p-8 border-t border-white/5 bg-white/[0.02] space-y-2">
                        <h4 className="text-sm font-bold text-white">Consentimentos de Dados</h4>
                        <ul className="space-y-1 text-xs text-gray-400">
                            {consents.map(c => (
                                <li key={c.id} className="flex justify-between items-center">
                                    <span>
                                        {c.consent_type.replace(/_/g, ' ')}
                                        <br />
                                        <small className="text-[10px] text-gray-500">
                                            {new Date(c.granted_at).toLocaleDateString('pt-BR')} {c.revoked_at ? '(revogado)' : ''}
                                        </small>
                                    </span>
                                    {!c.revoked_at && (
                                        <button
                                            className="text-red-400 hover:underline text-[10px]"
                                            onClick={() => revokeConsent(c.id)}
                                        >
                                            Revogar
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <p className="text-[10px] text-gray-500">
                            Revogar um consentimento não exclui automaticamente os dados,
                            entre em contato com suporte se desejar remoção completa.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 sm:p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                    <p className="hidden sm:block text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">
                        Suas informações estão protegidas por RLS
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 sm:flex-none h-12 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || isProfileLoading}
                            className="flex-1 sm:flex-none h-12 rounded-2xl bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-8 shadow-lg shadow-brand-orange-coral/20 min-w-[140px]"
                        >
                            {isSaving ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
