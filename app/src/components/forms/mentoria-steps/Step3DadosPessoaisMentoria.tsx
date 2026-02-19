
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
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
    const [confirmSenha, setConfirmSenha] = useState('');
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
        return telefone;
    };

    const handleContinuar = () => {
        const newErrors: Record<string, string> = {};
        if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';
        if (!telefone.trim() || telefone.replace(/\D/g, '').length < 10) newErrors.telefone = 'Telefone inválido';
        if (!senha || senha.length < 8) newErrors.senha = 'Senha de no mínimo 8 caracteres';
        if (senha !== confirmSenha) newErrors.confirmSenha = 'As senhas não coincidem';

        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onContinuar({ nome, email, telefone, senha });
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-3">Identificação</h3>
                <p className="text-gray-400 text-lg">Crie sua conta para agendar sua mentoria</p>
            </div>

            <Card className="glass-card p-8 border-white/10">
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="nome" className="text-white mb-2 flex items-center gap-2">
                            <User className="h-4 w-4 text-brand-orange-coral" /> Nome Completo
                        </Label>
                        <Input
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="bg-dark-200 border-white/10 text-white"
                        />
                        {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                    </div>

                    <div>
                        <Label htmlFor="email" className="text-white mb-2 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-brand-orange-coral" /> Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-dark-200 border-white/10 text-white"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <Label htmlFor="telefone" className="text-white mb-2 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-brand-orange-coral" /> Telefone/WhatsApp
                        </Label>
                        <Input
                            id="telefone"
                            value={telefone}
                            onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                            className="bg-dark-200 border-white/10 text-white"
                        />
                        {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="senha" className="text-white mb-2 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-brand-orange-coral" /> Criar Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="senha"
                                    type={showSenha ? 'text' : 'password'}
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="bg-dark-200 border-white/10 text-white pr-10"
                                />
                                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
                        </div>
                        <div>
                            <Label htmlFor="confirmSenha" className="text-white mb-2 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-brand-orange-coral" /> Confirmar
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmSenha"
                                    type={showConfirmSenha ? 'text' : 'password'}
                                    value={confirmSenha}
                                    onChange={(e) => setConfirmSenha(e.target.value)}
                                    className="bg-dark-200 border-white/10 text-white pr-10"
                                />
                                <button type="button" onClick={() => setShowConfirmSenha(!showConfirmSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showConfirmSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex gap-4">
                <Button variant="outline" size="lg" onClick={onVoltar} className="flex-1 border-white/20 text-white">Voltar</Button>
                <Button size="lg" onClick={handleContinuar} className="flex-1 bg-brand-orange-coral text-white font-bold">Continuar</Button>
            </div>
        </div>
    );
}
