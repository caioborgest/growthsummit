import { useState } from 'react';
import { Rocket, ArrowRight, Loader2, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { autoInviteOnRegistration } from '@/hooks/useWhatsAppGroups';
import { logger } from '@/lib/logger';

export function PetrolinaRegistrationForm() {
    const { selectedProject } = useProject();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        empresa: '',
        whatsapp: '',
        email: '',
        senha: '',
        colaboradores: '',
        faturamento: '',
        cupom: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            // 1. Auth / User Creation
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            let userId = existingSession?.user?.id;

            if (!userId) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        data: {
                            name: formData.nome,
                            phone: formData.whatsapp,
                            role: 'participant'
                        }
                    }
                });

                if (authError) {
                    if (authError.message.includes('already registered')) {
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email: formData.email,
                            password: formData.senha
                        });

                        if (signInError) {
                            throw new Error('Este email já está cadastrado. Por favor, use a senha correta ou outro email.');
                        }
                        userId = signInData.user.id;
                    } else {
                        throw authError;
                    }
                } else {
                    userId = authData?.user?.id;

                    // Tentar login automático se não retornou sessão (Supabase pode exigir confirmação, mas vamos tentar)
                    if (!authData?.session) {
                        await supabase.auth.signInWithPassword({
                            email: formData.email,
                            password: formData.senha
                        }).catch(e => logger.warn('Auto-login skip Petrolina (confirmation required?):', e.message));
                    }
                }
            }

            // 2. Sincronização robusta
            if (userId) {
                try {
                    // Apenas verifica se o perfil básico existe.
                    // A trigger handle_new_user no Supabase cuida da criação automática na tabela public.users.
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('id, role')
                        .eq('id', userId)
                        .maybeSingle();

                    if (userError) logger.warn('Erro ao verificar usuário public:', userError);

                    // Se o usuário já existe mas a role está errada (raro), podemos tentar atualizar
                    if (userData && userData.role !== 'participant' && userData.role !== 'admin') {
                        await supabase.from('users').update({ role: 'participant' }).eq('id', userId);
                    }
                } catch (syncErr: any) {
                    logger.warn('Erro na lógica de verificação Petrolina:', syncErr);
                }
            }

            // 3. Insert Registration
            const { data: inscricaoData, error: regError } = await (supabase.from('inscricoes_growth_experience') as any).insert({
                project_id: selectedProject?.id,
                user_id: userId || null,
                nome: formData.nome,
                email: formData.email,
                telefone: formData.whatsapp,
                empresa: formData.empresa,
                tipo_inscricao: 'standard',
                evento: selectedProject?.name || 'Growth Experience Petrolina',
                status_pagamento: 'pago',
                status: 'ativo',
                numero_colaboradores: formData.colaboradores,
                faturamento_anual: formData.faturamento,
                cupom_palestra: formData.cupom || null
            }).select();

            if (regError) throw regError;

            // 3.5. Auto-invite to WhatsApp Group (Async)
            const finalInscricaoId = (inscricaoData as any)?.[0]?.id;
            if (finalInscricaoId && selectedProject?.id) {
                autoInviteOnRegistration(
                    finalInscricaoId,
                    selectedProject.id,
                    'standard'
                ).catch(e => logger.info('WhatsApp invite info (CORS/SKIP):', e.message || e));
            }

            /* 
            // 4. Send Confirmation Email (Async, non-blocking) - DESATIVADO A PEDIDO DO USUÁRIO
            supabase.functions.invoke('send-email', {
                body: {
                    to: formData.email,
                    subject: `Bem-vindo ao ${selectedProject?.name || 'Growth Experience Petrolina'}!`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 40px; border-radius: 20px;">
                            <h2 style="color: #fe4c38;">Olá, ${formData.nome}!</h2>
                            <p>Sua inscrição no <strong>Growth Experience Petrolina</strong> foi confirmada com sucesso!</p>
                            <p>Estamos muito felizes em ter você conosco nesta jornada de Growth e Inteligência Artificial.</p>
                            
                            <div style="background: rgba(254, 76, 56, 0.1); border: 1px solid rgba(254, 76, 56, 0.2); padding: 20px; border-radius: 12px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #fe4c38;">Informações Importantes:</h3>
                                <ul style="list-style: none; padding: 0;">
                                    <li>📍 <strong>Local:</strong> Petrolina-PE (Local exato no WhatsApp)</li>
                                    <li>📅 <strong>Data:</strong> 30 de Abril de 2026</li>
                                    <li>📱 <strong>App do Evento:</strong> Baixe o app e acesse com seu email.</li>
                                </ul>
                            </div>
                            
                            <p>Para garantir que você não perca nenhuma atualização importante, entre no nosso grupo exclusivo do WhatsApp:</p>
                            <a href="https://chat.whatsapp.com/L1MhM2f9m9n0M9m9M9m9M9" style="display: inline-block; background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Entrar no Grupo do WhatsApp</a>
                            
                            <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">Nos vemos lá!<br/>Equipe Growth Summit</p>
                        </div>
                    `
                }
            }).catch(e => logger.warn('Email confirmation not sent (CORS/SKIP):', e.message || e));
            */

            setIsSuccess(true);
            toast.success('Inscrição confirmada com sucesso!');

            // 4. Redirect to Dashboard after delay
            setTimeout(() => {
                window.location.href = '/minha-area';
            }, 2000);

        } catch (err: any) {
            logger.error('Error:', err);
            toast.error(err.message || 'Erro ao processar inscrição');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-4">Inscrição Confirmada!</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    Você já está garantido no evento. Estamos te redirecionando para a sua área...
                </p>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-6 rounded-xl"
                    onClick={() => window.open("https://chat.whatsapp.com/L1MhM2f9m9n0M9m9M9m9M9", '_blank')}
                >
                    Entrar no Grupo Agora
                </Button>
            </div>
        );
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Nome Completo</label>
                    <input
                        required
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none"
                        placeholder="Como quer ser chamado?"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Nome da Empresa</label>
                    <input
                        required
                        type="text"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none"
                        placeholder="Sua empresa ou projeto"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">WhatsApp</label>
                    <input
                        required
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none"
                        placeholder="(87) 99999-9999"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">E-mail Corporativo</label>
                    <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none"
                        placeholder="seu@email.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Senha para o App</label>
                    <input
                        required
                        type="password"
                        name="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none"
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Quantidade de Colaboradores</label>
                    <select
                        required
                        name="colaboradores"
                        value={formData.colaboradores}
                        onChange={handleChange}
                        className="w-full bg-dark-200 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none appearance-none"
                    >
                        <option value="">Selecione...</option>
                        <option value="1-5">1 a 5</option>
                        <option value="6-20">6 a 20</option>
                        <option value="21-50">21 a 50</option>
                        <option value="51-200">51 a 200</option>
                        <option value="201+">Mais de 200</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Faturamento Médio Anual</label>
                    <select
                        required
                        name="faturamento"
                        value={formData.faturamento}
                        onChange={handleChange}
                        className="w-full bg-dark-200 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none appearance-none"
                    >
                        <option value="">Selecione...</option>
                        <option value="ate-100k">Até R$ 100k</option>
                        <option value="100k-500k">R$ 100k a R$ 500k</option>
                        <option value="500k-2m">R$ 500k a R$ 2M</option>
                        <option value="2m-10m">R$ 2M a R$ 10M</option>
                        <option value="10m+">Acima de R$ 10M</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Cupom (Opcional)</label>
                    <input
                        type="text"
                        name="cupom"
                        value={formData.cupom}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none"
                        placeholder="Possui um cupom?"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:scale-[1.02] text-white font-black py-7 text-xl rounded-2xl shadow-glow-orange mt-8 transition-all group"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        PROCESSANDO...
                    </>
                ) : (
                    <>
                        CONFIRMAR INSCRIÇÃO
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </Button>
        </form>
    );
}
