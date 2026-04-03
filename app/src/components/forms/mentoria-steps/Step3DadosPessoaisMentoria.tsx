
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import type { DadosMentoria } from './mentoriaTypes';

interface Step3DadosPessoaisMentoriaProps {
    dados: DadosMentoria;
    onContinuar: (dados: Partial<DadosMentoria>) => void;
    onVoltar: () => void;
}

export function Step3DadosPessoaisMentoria({ dados, onContinuar, onVoltar }: Step3DadosPessoaisMentoriaProps) {
    const [nome, setNome] = useState(dados.nome);
    const [email, setEmail] = useState(dados.email);
    const [telefone, setTelefone] = useState(dados.telefone);
    const [senha, setSenha] = useState(dados.senha);
    const [confirmSenha, setConfirmSenha] = useState(dados.senha || '');
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmSenha, setShowConfirmSenha] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const formatTelefone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
        return value;
    };

    const handleContinuar = () => {
        const newErrors: Record<string, string> = {};
        if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';
        if (!telefone.trim() || telefone.replace(/\D/g, '').length < 10) newErrors.telefone = 'Telefone inválido';
        if (!senha || senha.length < 6) newErrors.senha = 'Senha de no mínimo 6 caracteres';
        if (senha !== confirmSenha) newErrors.confirmSenha = 'As senhas não coincidem';

        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onContinuar({ nome, email, telefone, senha });
        }
    };

    return (
        <div className="space-y-10">
            <div className="text-left sm:text-center max-w-2xl mx-auto">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Quase <span className="text-brand-orange-coral">lá!</span></h3>
                <p className="text-gray-400 text-sm sm:text-lg">Preencha seus dados para criar sua conta e acessar seu painel de mentorias.</p>
            </div>

            <Card className="glass-card p-6 sm:p-10 border-white/5 bg-dark-200/40 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck size={120} className="text-brand-orange-coral" />
                </div>

                <div className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Nome Completo */}
                        <div className="space-y-2">
                            <Label htmlFor="nome" className="text-white font-bold flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-brand-orange-coral" /> Nome Completo
                            </Label>
                            <Input
                                id="nome"
                                value={nome}
                                placeholder="Seu nome completo"
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    if (errors.nome) setErrors(prev => ({ ...prev, nome: '' }));
                                }}
                                className={`h-12 bg-dark-200/50 border-white/10 text-white rounded-xl focus:ring-brand-orange-coral ${errors.nome ? 'border-red-500' : ''}`}
                            />
                            {errors.nome && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.nome}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white font-bold flex items-center gap-2 mb-1">
                                <Mail className="h-4 w-4 text-brand-orange-coral" /> Seu melhor E-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                placeholder="exemplo@gmail.com"
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                                }}
                                className={`h-12 bg-dark-200/50 border-white/10 text-white rounded-xl focus:ring-brand-orange-coral ${errors.email ? 'border-red-500' : ''}`}
                            />
                            {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</p>}
                        </div>

                        {/* Telefone */}
                        <div className="space-y-2">
                            <Label htmlFor="telefone" className="text-white font-bold flex items-center gap-2 mb-1">
                                <Phone className="h-4 w-4 text-brand-orange-coral" /> WhatsApp
                            </Label>
                            <Input
                                id="telefone"
                                value={telefone}
                                placeholder="(00) 00000-0000"
                                onChange={(e) => {
                                    setTelefone(formatTelefone(e.target.value));
                                    if (errors.telefone) setErrors(prev => ({ ...prev, telefone: '' }));
                                }}
                                className={`h-12 bg-dark-200/50 border-white/10 text-white rounded-xl focus:ring-brand-orange-coral ${errors.telefone ? 'border-red-500' : ''}`}
                            />
                            {errors.telefone && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.telefone}</p>}
                        </div>

                        {/* Placeholder/Empty to align passwords */}
                        <div className="hidden sm:block opacity-40">
                            <div className="h-full flex items-center">
                                <p className="text-gray-500 text-xs italic">Seus dados estão protegidos sob criptografia de ponta a ponta.</p>
                            </div>
                        </div>

                        {/* Senhas */}
                        <div className="space-y-2">
                            <Label htmlFor="senha" className="text-white font-bold flex items-center gap-2 mb-1">
                                <Lock className="h-4 w-4 text-brand-orange-coral" /> Criar Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="senha"
                                    placeholder="Mínimo 6 caracteres"
                                    type={showSenha ? 'text' : 'password'}
                                    value={senha}
                                    onChange={(e) => {
                                        setSenha(e.target.value);
                                        if (errors.senha) setErrors(prev => ({ ...prev, senha: '' }));
                                    }}
                                    className={`h-12 bg-dark-200/50 border-white/10 text-white rounded-xl pr-12 focus:ring-brand-orange-coral ${errors.senha ? 'border-red-500' : ''}`}
                                />
                                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                                    {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.senha && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.senha}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmSenha" className="text-white font-bold flex items-center gap-2 mb-1">
                                <Lock className="h-4 w-4 text-brand-orange-coral" /> Confirmar Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmSenha"
                                    placeholder="Repita sua senha"
                                    type={showConfirmSenha ? 'text' : 'password'}
                                    value={confirmSenha}
                                    onChange={(e) => {
                                        setConfirmSenha(e.target.value);
                                        if (errors.confirmSenha) setErrors(prev => ({ ...prev, confirmSenha: '' }));
                                    }}
                                    className={`h-12 bg-dark-200/50 border-white/10 text-white rounded-xl pr-12 focus:ring-brand-orange-coral ${errors.confirmSenha ? 'border-red-500' : ''}`}
                                />
                                <button type="button" onClick={() => setShowConfirmSenha(!showConfirmSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                                    {showConfirmSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmSenha && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.confirmSenha}</p>}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 pt-10 sticky bottom-0 bg-dark-100/10 backdrop-blur-sm -mx-4 pb-2">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onVoltar}
                    className="flex-1 border-white/10 text-white hover:bg-white/10 font-bold h-14 sm:h-16 rounded-2xl"
                >
                    Voltar
                </Button>
                <Button
                    size="lg"
                    onClick={handleContinuar}
                    className="flex-[2] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-14 sm:h-16 text-xl rounded-2xl shadow-glow-orange transition-all hover:scale-105"
                >
                    Finalizar Cadastro
                </Button>
            </div>
        </div>
    );
}

