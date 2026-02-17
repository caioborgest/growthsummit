import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { DadosInscricao } from './types';

interface Step2DadosPessoaisProps {
    dados: DadosInscricao;
    onContinuar: (dados: Partial<DadosInscricao>) => void;
    onVoltar: () => void;
}

export function Step2DadosPessoais({ dados, onContinuar, onVoltar }: Step2DadosPessoaisProps) {
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

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleContinuar = () => {
        const newErrors: Record<string, string> = {};

        // Validações
        if (!nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        } else if (nome.trim().length < 3) {
            newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
        }

        if (!email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Email inválido';
        }

        if (!telefone.trim()) {
            newErrors.telefone = 'Telefone é obrigatório';
        } else if (telefone.replace(/\D/g, '').length < 10) {
            newErrors.telefone = 'Telefone inválido';
        }

        if (!senha) {
            newErrors.senha = 'Senha é obrigatória';
        } else if (senha.length < 8) {
            newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
        }

        if (!confirmSenha) {
            newErrors.confirmSenha = 'Confirme sua senha';
        } else if (senha !== confirmSenha) {
            newErrors.confirmSenha = 'As senhas não coincidem';
        }

        setErrors(newErrors);

        // Se não houver erros, continuar
        if (Object.keys(newErrors).length === 0) {
            onContinuar({ nome, email, telefone, senha });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-3">
                    Seus Dados Pessoais
                </h3>
                <p className="text-gray-400 text-lg">
                    Preencha seus dados para criar sua conta
                </p>
            </div>

            {/* Formulário */}
            <Card className="glass-card p-8 border-white/10">
                <div className="space-y-6">
                    {/* Nome Completo */}
                    <div>
                        <Label htmlFor="nome" className="text-white mb-2 flex items-center gap-2">
                            <User className="h-4 w-4 text-brand-orange-coral" />
                            Nome Completo
                        </Label>
                        <Input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => {
                                setNome(e.target.value);
                                if (errors.nome) setErrors({ ...errors, nome: '' });
                            }}
                            placeholder="Seu nome completo"
                            className={`bg-dark-200 border-white/10 text-white ${errors.nome ? 'border-red-500' : ''
                                }`}
                        />
                        {errors.nome && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.nome}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="text-white mb-2 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-brand-orange-coral" />
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            placeholder="seu@email.com"
                            className={`bg-dark-200 border-white/10 text-white ${errors.email ? 'border-red-500' : ''
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.email}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Você usará este email para fazer login no app
                        </p>
                    </div>

                    {/* Telefone */}
                    <div>
                        <Label htmlFor="telefone" className="text-white mb-2 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-brand-orange-coral" />
                            Telefone/WhatsApp
                        </Label>
                        <Input
                            id="telefone"
                            type="tel"
                            value={telefone}
                            onChange={(e) => {
                                setTelefone(formatTelefone(e.target.value));
                                if (errors.telefone) setErrors({ ...errors, telefone: '' });
                            }}
                            placeholder="(88) 98843-2310"
                            className={`bg-dark-200 border-white/10 text-white ${errors.telefone ? 'border-red-500' : ''
                                }`}
                        />
                        {errors.telefone && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.telefone}
                            </p>
                        )}
                    </div>

                    {/* Senha */}
                    <div>
                        <Label htmlFor="senha" className="text-white mb-2 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-brand-orange-coral" />
                            Criar Senha
                        </Label>
                        <div className="relative">
                            <Input
                                id="senha"
                                type={showSenha ? 'text' : 'password'}
                                value={senha}
                                onChange={(e) => {
                                    setSenha(e.target.value);
                                    if (errors.senha) setErrors({ ...errors, senha: '' });
                                }}
                                placeholder="Mínimo 8 caracteres"
                                className={`bg-dark-200 border-white/10 text-white pr-10 ${errors.senha ? 'border-red-500' : ''
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowSenha(!showSenha)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.senha && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.senha}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Use esta senha para acessar o app Growth Experience
                        </p>
                    </div>

                    {/* Confirmar Senha */}
                    <div>
                        <Label htmlFor="confirmSenha" className="text-white mb-2 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-brand-orange-coral" />
                            Confirmar Senha
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmSenha"
                                type={showConfirmSenha ? 'text' : 'password'}
                                value={confirmSenha}
                                onChange={(e) => {
                                    setConfirmSenha(e.target.value);
                                    if (errors.confirmSenha) setErrors({ ...errors, confirmSenha: '' });
                                }}
                                placeholder="Digite a senha novamente"
                                className={`bg-dark-200 border-white/10 text-white pr-10 ${errors.confirmSenha ? 'border-red-500' : ''
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmSenha(!showConfirmSenha)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showConfirmSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmSenha && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.confirmSenha}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Botões */}
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onVoltar}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                    Voltar
                </Button>
                <Button
                    size="lg"
                    onClick={handleContinuar}
                    className="flex-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-lg"
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
}
