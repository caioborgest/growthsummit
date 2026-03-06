import { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Mail, Phone, Building2, Briefcase, Globe, Linkedin, MapPin, Calendar, Camera, Shield, Bell, Save, Loader2, Target } from 'lucide-react';
import { useProfile, useMentors } from '@/hooks/useData';

import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';


export function ProfileForm() {
    const { user, updateProfile } = useAuth();
    const { data: profile, update: updateProfileData, isLoading: isProfileLoading } = useProfile(user?.id);
    const { data: mentors } = useMentors();
    const { projectId } = useProject();

    // Find mentor record if exists
    const mentorRecord = mentors?.find(m => m.userId === user?.id);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        company: '',
        position: '',
        bio: '',
        website: '',
        linkedin: '',
        city: '',
        state: '',
        birthDate: '',
        newsletterOptIn: true,
        yearsExperience: 0,
        maxMentories: 3
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                company: profile.company || '',
                position: profile.position || '',
                bio: profile.bio || '',
                website: profile.website || '',
                linkedin: profile.linkedin || '',
                city: profile.city || '',
                state: profile.state || '',
                birthDate: profile.birthDate || '',
                newsletterOptIn: profile.newsletterOptIn ?? true,
                yearsExperience: mentorRecord?.yearsExperience || 0,
                maxMentories: mentorRecord?.maxMentories || 3
            }));
        }
    }, [profile, mentorRecord]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            // Update User table (name, phone)
            await updateProfile({
                name: formData.name,
                phone: formData.phone
            });

            // Update Profile table - wrapped in try/catch to not block other updates if table is missing
            try {
                await updateProfileData({
                    company: formData.company,
                    position: formData.position,
                    bio: formData.bio,
                    website: formData.website,
                    linkedin: formData.linkedin,
                    city: formData.city,
                    state: formData.state,
                    birthDate: formData.birthDate,
                    newsletterOptIn: formData.newsletterOptIn
                });
            } catch (profileError) {
                logger.warn('Erro ao atualizar tabela profiles (pode não existir):', profileError);
                // Non-fatal error
            }

            // SYNC with Mentor table if user is mentor
            if (user?.role === 'mentor' && mentorRecord) {
                try {
                    // We use the raw supabase client here to ensure we hit the right table with project slug if needed
                    // or we could use the update function from useData if it was exposed correctly.
                    // For now, let's use direct supabase to be sure about the mapping.
                    const { error: mentorError } = await supabase
                        .from('mentores_growth_experience')
                        .update({
                            nome: formData.name,
                            telefone: formData.phone,
                            empresa: formData.company,
                            cargo: formData.position,
                            bio: formData.bio,
                            linkedin_url: formData.linkedin,
                            years_experience: Number(formData.yearsExperience) || 0,
                            max_mentories: Number(formData.maxMentories) || 0
                        })
                        .eq('id', mentorRecord.id);

                    if (mentorError) logger.error('Erro ao sincronizar dados do mentor:', mentorError);
                } catch (e) {
                    logger.error('Sync mentor error:', e);
                }
            }

            toast.success('Perfil atualizado com sucesso!');
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : 'Erro desconhecido';
            toast.error('Erro ao atualizar perfil: ' + errMsg);
            logger.error('Erro ao atualizar perfil:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB.');
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;

            // Tenta no bucket 'avatars', se falhar tenta 'event-images/avatars'
            let photoUrl = '';
            const buckets = [
                { bucket: 'avatars', path: fileName },
                { bucket: 'event-images', path: `avatars/${fileName}` },
            ];

            let uploadOk = false;
            for (const { bucket, path } of buckets) {
                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(path, file, { upsert: true });

                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
                    photoUrl = urlData.publicUrl;
                    uploadOk = true;
                    break;
                }
            }

            if (!uploadOk || !photoUrl) {
                throw new Error('Não foi possível fazer upload da imagem. Verifique as configurações do Storage.');
            }

            await updateProfile({ avatar: photoUrl });

            // Also sync mentor photo if needed
            if (user?.role === 'mentor' && mentorRecord) {
                await supabase
                    .from('mentores_growth_experience')
                    .update({ foto_url: photoUrl })
                    .eq('id', mentorRecord.id);
            }
            toast.success('✅ Foto de perfil atualizada!');
        } catch (error: unknown) {
            logger.error('Erro no upload da foto:', error);
            const msg = error instanceof Error ? error.message : 'Tente novamente.';
            toast.error('Erro ao enviar foto: ' + msg);
        } finally {
            setIsUploading(false);
            // Reset input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8">
            {/* Bio & Basic Info */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="glass-card p-8 flex flex-col items-center text-center">
                        <div className="relative mb-6 group">
                            <img
                                src={user?.avatar || (user as any)?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=21808D&color=fff&size=128`}
                                alt={user?.name}
                                className="w-32 h-32 rounded-3xl object-cover border-4 border-teal-500/20 shadow-2xl transition-transform group-hover:scale-105"
                            />
                            {/* Input oculto com ref explícita para garantir abertura do file picker */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoUpload}
                                disabled={isUploading}
                            />
                            <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-brand-orange-coral p-3 rounded-2xl text-white shadow-xl hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Alterar foto de perfil"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Camera className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{user?.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 uppercase tracking-widest">{user?.role}</p>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="border-teal-500/30 text-teal-400">Verificado</Badge>
                            {user?.twoFactorEnabled && (
                                <Badge variant="outline" className="border-blue-500/30 text-blue-400">2FA Ativo</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                            <UserIcon className="h-5 w-5 mr-3 text-teal-400" />
                            Informações Pessoais
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-12 bg-dark-100 border-dark-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email (Não editável)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input value={user?.email} disabled className="pl-12 bg-dark-100 border-dark-300 opacity-60 cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        className="pl-12 bg-dark-100 border-dark-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data de Nascimento</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="pl-12 bg-dark-100 border-dark-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Info */}
            <div className="glass-card p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <Briefcase className="h-5 w-5 mr-3 text-teal-400" />
                    Carreira & Atuação
                </h3>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Empresa / Instituição</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Ex: Growth Summit"
                                className="pl-12 bg-dark-100 border-dark-300"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cargo Atual</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                value={formData.position}
                                onChange={e => setFormData({ ...formData, position: e.target.value })}
                                placeholder="Ex: Diretor de Marketing"
                                className="pl-12 bg-dark-100 border-dark-300"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bio / Resumo Profissional</label>
                    <textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Conte um pouco sobre sua trajetória profissional..."
                        rows={4}
                        className="w-full bg-dark-100 border border-dark-300 rounded-xl p-4 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                    />
                </div>

                {user?.role === 'mentor' && (
                    <div className="grid sm:grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Anos de Experiência
                            </label>
                            <Input
                                type="number"
                                value={formData.yearsExperience}
                                onChange={e => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                                className="bg-dark-100 border-dark-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Target className="h-3 w-3" /> Capacidade de Mentorias (Slots)
                            </label>
                            <Input
                                type="number"
                                value={formData.maxMentories}
                                onChange={e => setFormData({ ...formData, maxMentories: parseInt(e.target.value) || 0 })}
                                className="bg-dark-100 border-dark-300"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Links & Location */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <Globe className="h-5 w-5 mr-3 text-teal-400" />
                        Social & Links
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">LinkedIn</label>
                            <div className="relative">
                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    value={formData.linkedin}
                                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                    placeholder="linkedin.com/in/seuuser"
                                    className="pl-12 bg-dark-100 border-dark-300"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Website / Portfolio</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="www.seusite.com.br"
                                    className="pl-12 bg-dark-100 border-dark-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-teal-400" />
                        Localização
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cidade</label>
                            <Input
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Ex: Triunfo"
                                className="bg-dark-100 border-dark-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</label>
                            <Input
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                placeholder="Ex: PE"
                                className="bg-dark-100 border-dark-300"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Security & Preferences */}
            <div className="glass-card p-8 border-orange-500/10">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <Shield className="h-5 w-5 mr-3 text-orange-400" />
                    Segurança e Preferências
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex items-center justify-between p-6 bg-dark-100 rounded-2xl border border-dark-300">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mr-4">
                                <Bell className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold">Newsletter</p>
                                <p className="text-gray-500 text-xs">Receba novidades e atualizações</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, newsletterOptIn: !formData.newsletterOptIn })}
                            className={`w-12 h-6 rounded-full transition-all relative ${formData.newsletterOptIn ? 'bg-orange-500' : 'bg-dark-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.newsletterOptIn ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-dark-100 rounded-2xl border border-dark-300">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mr-4">
                                <Shield className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold">Autenticação 2FA</p>
                                <p className="text-gray-500 text-xs">Aumente a segurança da sua conta</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-teal-400 hover:bg-teal-500/10 font-bold">Configurar</Button>
                    </div>
                </div>
            </div>

            {/* Floating Save Actions */}
            <div className="flex justify-end gap-4 pt-4 sticky shadow-2xl">
                <Button
                    type="submit"
                    disabled={isSaving || isProfileLoading}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl px-12 h-14 text-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
