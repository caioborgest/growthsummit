import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, Award, Key, Loader2 } from 'lucide-react';
import type { DadosInscricao } from './inscricaoTypes';
import { supabase } from '@/lib/supabase';

const CIDADES_PAJEU = [
    'SERRA TALHADA',
    'AFOGADOS DA INGAZEIRA',
    'SÃO JOSÉ DO EGITO',
    'TRIUNFO',
    'TABIRA',
    'FLORES',
    'CARNAÍBA',
    'ITAPETIM',
    'BREJINHO',
    'SANTA CRUZ DA BAIXA VERDE',
    'IGUARACI',
    'SANTA TEREZINHA',
    'TUPARETAMA',
    'QUIXABA',
    'SOLIDÃO'
].sort();

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
    const [indicacaoTipo, setIndicacaoTipo] = useState<DadosInscricao['indicacaoTipo']>(dados.indicacaoTipo || 'nenhum');
    const [indicacaoNome, setIndicacaoNome] = useState(dados.indicacaoNome || '');
    const [codigo, setCodigo] = useState(dados.codigo || '');
    const [confirmSenha, setConfirmSenha] = useState(dados.senha || '');
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmSenha, setShowConfirmSenha] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validating, setValidating] = useState(false);
    const [desconto, setDesconto] = useState(dados.descontoSocial || 0);

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

    const handleContinuar = async () => {
        const newErrors: Record<string, string> = {};

        // Validações Básicas
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

        // Validação de Código (se houver indicação)
        if (indicacaoTipo !== 'nenhum') {
            if (!indicacaoNome) {
                newErrors.indicacaoNome = 'Identificação é obrigatória';
            }
            if (!codigo.trim()) {
                newErrors.codigo = 'O código da parceria é obrigatório';
            } else {
                setValidating(true);
                try {
                    const { data, error } = await (supabase
                        .from('cupons_parceria_social') as any)
                        .select('*')
                        .eq('codigo', codigo.trim().toUpperCase())
                        .eq('ativo', true)
                        .single();

                    if (error || !data) {
                        newErrors.codigo = 'Código inválido ou inativo';
                    } else {
                        const couponData = data as any;
                        if (couponData.indicacao_tipo !== indicacaoTipo) {
                            newErrors.codigo = `Este código pertence à categoria ${couponData.indicacao_tipo}`;
                        } else if (couponData.vencimento && new Date(couponData.vencimento) < new Date()) {
                            newErrors.codigo = 'Este código de parceria já expirou';
                        } else if (couponData.uso_limite && couponData.uso_atual >= couponData.uso_limite) {
                            newErrors.codigo = 'Limite de usos atingido para este código';
                        } else {
                            setDesconto(couponData.porcentagem_desconto);
                        }
                    }
                } catch (validationError) {
                    console.error('Erro na validação pública:', validationError);
                    newErrors.codigo = 'Erro ao validar código';
                } finally {
                    setValidating(false);
                }
            }
        }

        setErrors(newErrors);

        // Se não houver erros, continuar
        if (Object.keys(newErrors).length === 0) {
            onContinuar({
                nome,
                email,
                telefone,
                senha,
                indicacaoTipo,
                indicacaoNome: indicacaoTipo !== 'nenhum' ? indicacaoNome : '',
                codigo: indicacaoTipo !== 'nenhum' ? codigo.trim().toUpperCase() : '',
                descontoSocial: indicacaoTipo !== 'nenhum' ? desconto : 0
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-left sm:text-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                    Seus Dados Pessoais
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg">
                    Preencha seus dados para criar sua conta
                </p>
            </div>

            {/* Formulário */}
            <Card className="glass-card p-4 sm:p-8 border-white/10 bg-dark-200/50">
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

                    {/* Indicação Social/Política */}
                    <div className="pt-4 border-t border-white/5 space-y-4">
                        <Label className="text-white flex items-center gap-2 text-base">
                            <Award className="h-5 w-5 text-brand-orange-coral" />
                            Programa de Inscrição Social
                        </Label>
                        <p className="text-xs text-gray-400">
                            Sua inscrição faz parte de uma parceria com alguma Prefeitura ou Liderança Política da região?
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2">
                            {[
                                { id: 'prefeitura', label: 'Prefeitura' },
                                { id: 'politico', label: 'Político' },
                                { id: 'empresa', label: 'Empresa' },
                                { id: 'influenciador', label: 'Influencer' },
                                { id: 'associacao', label: 'Associação' },
                                { id: 'instituicao', label: 'Instituição' },
                                { id: 'promocional', label: 'Promocional' },
                                { id: 'nenhum', label: 'Nenhum' }
                            ].map((tipo) => (
                                <button
                                    key={tipo.id}
                                    type="button"
                                    onClick={() => setIndicacaoTipo(tipo.id as any)}
                                    className={`px-2 py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all h-full ${indicacaoTipo === tipo.id
                                        ? 'bg-brand-orange-coral/20 border-brand-orange-coral text-white shadow-glow-orange/20'
                                        : 'bg-dark-200 border-white/5 text-gray-400 hover:border-white/10'
                                        }`}
                                >
                                    {tipo.label}
                                </button>
                            ))}
                        </div>

                        {indicacaoTipo && indicacaoTipo !== 'nenhum' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="indicacaoNome" className="text-white mb-2 block text-sm">
                                    {indicacaoTipo === 'prefeitura' ? 'Qual Prefeitura?' :
                                        indicacaoTipo === 'politico' ? 'Qual Deputado ou Vereador?' :
                                            indicacaoTipo === 'empresa' ? 'Nome da Empresa/Equipe?' :
                                                indicacaoTipo === 'influenciador' ? 'Nome do Influenciador?' :
                                                    indicacaoTipo === 'associacao' ? 'Nome da Associação?' :
                                                        indicacaoTipo === 'instituicao' ? 'Nome da Instituição?' :
                                                            'Nome da Origem / Parceiro?'}
                                </Label>

                                {indicacaoTipo === 'prefeitura' ? (
                                    <Select
                                        value={indicacaoNome}
                                        onValueChange={setIndicacaoNome}
                                    >
                                        <SelectTrigger className="w-full bg-dark-200 border-white/10 text-white h-11">
                                            <SelectValue placeholder="Selecione a cidade" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-100 border-white/10 text-white">
                                            {CIDADES_PAJEU.map((cidade) => (
                                                <SelectItem key={cidade} value={cidade} className="focus:bg-brand-orange-coral/20 focus:text-white">
                                                    {cidade}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="indicacaoNome"
                                        type="text"
                                        value={indicacaoNome}
                                        onChange={(e) => {
                                            setIndicacaoNome(e.target.value);
                                            if (errors.indicacaoNome) setErrors({ ...errors, indicacaoNome: '' });
                                        }}
                                        placeholder="Ex: Deputado Fulano de Tal"
                                        className={`bg-dark-200 border-white/10 text-white ${errors.indicacaoNome ? 'border-red-500' : ''}`}
                                    />
                                )}
                                {errors.indicacaoNome && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.indicacaoNome}
                                    </p>
                                )}
                            </div>
                        )}

                        {indicacaoTipo && indicacaoTipo !== 'nenhum' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-400">
                                <Label htmlFor="codigo" className="text-white mb-2 block text-sm flex items-center gap-2">
                                    <Key className="h-4 w-4 text-brand-orange-coral" />
                                    Código da Parceria
                                </Label>
                                <Input
                                    id="codigo"
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => {
                                        setCodigo(e.target.value);
                                        if (errors.codigo) setErrors({ ...errors, codigo: '' });
                                    }}
                                    placeholder="INSIRA O CÓDIGO AQUI"
                                    className={`bg-dark-200 border-white/10 text-white font-mono tracking-widest ${errors.codigo ? 'border-red-500' : ''}`}
                                />
                                {errors.codigo && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.codigo}
                                    </p>
                                )}
                                <p className="text-[10px] text-gray-500 mt-2">
                                    Este código é fornecido pela sua Prefeitura ou Liderança Política parceira do evento.
                                </p>
                            </div>
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
                    disabled={validating}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                    Voltar
                </Button>
                <Button
                    size="lg"
                    onClick={handleContinuar}
                    disabled={validating}
                    className="flex-1 bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-lg"
                >
                    {validating ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Validando...
                        </>
                    ) : (
                        'Continuar'
                    )}
                </Button>
            </div>
        </div>
    );
}
