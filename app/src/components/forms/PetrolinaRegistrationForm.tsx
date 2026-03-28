import { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle, Contact } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getOrCreateUser, waitForUserSync } from '@/lib/auth-helpers';
import { registrationService } from '@/services/registrationService';

export function PetrolinaRegistrationForm() {
    const { selectedProject } = useProject();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        empresa: '',
        whatsapp: '',
        email: '',
        senha: '',
        colaboradores: '',
        faturamento: '',
        cupom: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'cpf') {
            const numbers = value.replace(/\D/g, '');
            const formatted = numbers
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .substring(0, 14);
            setFormData(prev => ({ ...prev, [name]: formatted }));
            return;
        }

        if (name === 'whatsapp') {
            const numbers = value.replace(/\D/g, '');
            let formatted = numbers;
            if (numbers.length <= 11) {
                formatted = numbers
                    .replace(/(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{5})(\d)/, '$1-$2');
            }
            setFormData(prev => ({ ...prev, [name]: formatted }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateCPF = (cpf: string) => {
        const numbers = cpf.replace(/\D/g, '');
        if (numbers.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(numbers)) return false;
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!validateCPF(formData.cpf)) {
            toast.error('CPF inválido');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Auth / User Creation (Centralized)
            const { userId } = await getOrCreateUser({
                email: formData.email,
                password: formData.senha,
                name: formData.nome,
                phone: formData.whatsapp,
                role: 'participant'
            });

            if (!userId) throw new Error('Falha ao identificar usuário');

            // 2. Sincronização robusta (Para FK)
            await waitForUserSync(userId);

            // 3. Inscrição via Service Layer (Centralizado)
            const rpcResult = await registrationService.registerWithSlots({
                projectId: selectedProject?.id || '',
                userId: userId || '',
                nome: formData.nome,
                email: formData.email,
                telefone: formData.whatsapp,
                cpf: formData.cpf,
                sessionIds: [], // Petrolina ainda não tem sessões específicas no seletor
                tipoInscricao: 'standard',
                evento: selectedProject?.name || 'Growth Experience Petrolina',
                status_pagamento: 'pago',
                status: 'ativo',
                extraData: {
                    empresa: formData.empresa,
                    numero_colaboradores: formData.colaboradores,
                    faturamento_anual: formData.faturamento
                },
                codigoPalestra: formData.cupom || null
            });

            if (!rpcResult?.success) {
                throw new Error(rpcResult?.message || 'Erro ao processar inscrição no banco');
            }

            setIsSuccess(true);
            toast.success('Inscrição confirmada com sucesso!');

            // 4. Redirect to Login after delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 2500);

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
                    Você já está garantido no evento. Estamos te redirecionando para o login...
                </p>
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
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">CPF</label>
                    <input
                        required
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-orange-coral transition-all outline-none"
                        placeholder="000.000.000-00"
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
                <div className="space-y-2 sm:col-span-2">
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
                className="w-full bg-gradient-to-r from-teal-600 to-teal-400 hover:scale-[1.02] text-white font-black py-7 text-xl rounded-2xl shadow-glow-teal mt-8 transition-all group border-none"
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
