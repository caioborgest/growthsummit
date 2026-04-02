import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, Award, Key, Loader2, Contact, CheckCircle } from 'lucide-react';
import type { DadosInscricao } from './inscricaoTypes';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

const CIDADES_PAJEU = [
    'SERRA TALHADA', 'AFOGADOS DA INGAZEIRA', 'SÃO JOSÉ DO EGITO', 'TRIUNFO',
    'TABIRA', 'FLORES', 'CARNAÍBA', 'ITAPETIM', 'BREJINHO',
    'SANTA CRUZ DA BAIXA VERDE', 'IGUARACI', 'SANTA TEREZINHA',
    'TUPARETAMA', 'QUIXABA', 'SOLIDÃO'
].sort();

interface Step2DadosPessoaisProps {
    dados: DadosInscricao;
    onContinuar: (dados: Partial<DadosInscricao>) => void;
    onVoltar: () => void;
}

export function Step2DadosPessoais({ dados, onContinuar, onVoltar }: Step2DadosPessoaisProps) {
    const [nome, setNome] = useState(dados.nome);
    const [cpf, setCpf] = useState(dados.cpf || '');
    const [email, setEmail] = useState(dados.email);
    const [telefone, setTelefone] = useState(dados.telefone);
    const [senha, setSenha] = useState(dados.senha);
    const [indicacaoTipo, setIndicacaoTipo] = useState<DadosInscricao['indicacaoTipo']>(dados.indicacaoTipo || 'nenhum');
    const [indicacaoNome, setIndicacaoNome] = useState(dados.indicacaoNome || '');
    const [codigo, setCodigo] = useState(dados.codigo || '');
    const [loteId, setLoteId] = useState(dados.loteId || '');
    const [voucherEmpresa, setVoucherEmpresa] = useState(dados.voucherEmpresa || '');
    const [confirmSenha, setConfirmSenha] = useState(dados.senha || '');
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmSenha, setShowConfirmSenha] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validating, setValidating] = useState(false);
    const [desconto, setDesconto] = useState(dados.descontoSocial || 0);
    const [codigoValidado, setCodigoValidado] = useState(!!dados.codigo);
    const { projectId } = useProject();

    const formatTelefone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
        return telefone;
    };

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        return numbers
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const validateCPF = (cpf: string) => {
        const numbers = cpf.replace(/\D/g, '');
        if (numbers.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(numbers)) return false;
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(numbers.charAt(i)) * (10 - i);
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(numbers.charAt(9))) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(numbers.charAt(i)) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(numbers.charAt(10))) return false;
        return true;
    };

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validarCodigo = async () => {
        if (!codigo.trim()) return;
        const cleanCodigo = codigo.trim().toUpperCase();
        setValidating(true);
        setErrors(prev => ({ ...prev, codigo: '' }));
        
        logger.debug(`[Step2] Validando código: ${cleanCodigo} para projeto: ${projectId} (Tipo: ${indicacaoTipo})`);
        
        try {
            if (indicacaoTipo === 'empresa') {
                const { data, error } = await supabase
                    .from('lotes_inscricao_empresa')
                    .select('id,project_id,nome_empresa,voucher_code,quantidade_vagas,vagas_utilizadas,tipo_ingresso,status_pagamento')
                    .eq('project_id', projectId)
                    .eq('voucher_code', cleanCodigo)
                    .single();
                
                if (error || !data) {
                    logger.warn(`[Step2] Voucher corporativo não encontrado: ${cleanCodigo}`, error);
                    setErrors(prev => ({ ...prev, codigo: 'Voucher corporativo não encontrado' }));
                } else if (data.status_pagamento !== 'pago') {
                    setErrors(prev => ({ ...prev, codigo: 'Este voucher aguarda confirmação de pagamento' }));
                } else if (data.vagas_utilizadas >= data.quantidade_vagas) {
                    setErrors(prev => ({ ...prev, codigo: 'Limite de vagas deste voucher esgotado' }));
                } else {
                    setDesconto(100);
                    setCodigoValidado(true);
                    setLoteId(data.id);
                    setVoucherEmpresa(data.voucher_code);
                    setIndicacaoNome(data.nome_empresa);
                    toast.success('PAGAMENTO CONFIRMADO PELA EMPRESA! 🎉');
                }
            } else {
                const { data, error } = await supabase
                    .from('cupons_parceria_social')
                    .select('id,project_id,codigo,porcentagem_desconto,uso_limite,uso_atual,ativo,vencimento,indicacao_tipo')
                    .eq('project_id', projectId)
                    .eq('codigo', cleanCodigo)
                    .eq('ativo', true)
                    .single();
                
                if (error || !data) {
                    logger.warn(`[Step2] Cupom não encontrado: ${cleanCodigo} no projeto ${projectId}`, error);
                    setErrors(prev => ({ ...prev, codigo: 'Código inválido ou inativo' }));
                } else {
                    const couponData = data;
                    const isCompatible = couponData.indicacao_tipo === indicacaoTipo || couponData.indicacao_tipo === 'promocional';
                    
                    // Verificação de expiração robusta
                    const now = new Date();
                    const expiry = couponData.vencimento ? new Date(couponData.vencimento) : null;
                    const isExpired = expiry ? expiry < now : false;

                    if (!isCompatible) {
                        setErrors(prev => ({ ...prev, codigo: `Este código pertence à outra categoria. Selecione a correta acima.` }));
                    } else if (isExpired) {
                        logger.warn(`[Step2] Cupom expirado: ${cleanCodigo} (Vencimento: ${couponData.vencimento})`);
                        setErrors(prev => ({ ...prev, codigo: 'Este código de parceria já expirou' }));
                    } else if (couponData.uso_limite && couponData.uso_atual >= couponData.uso_limite) {
                        setErrors(prev => ({ ...prev, codigo: 'Limite de usos atingido' }));
                    } else {
                        setDesconto(couponData.porcentagem_desconto);
                        setCodigoValidado(true);
                        toast.success(`CÓDIGO CONFIRMADO! -${couponData.porcentagem_desconto}% de desconto.`);
                    }
                }
            }
        } catch (err) {
            logger.error('[Step2] Erro ao validar código', err);
            setErrors(prev => ({ ...prev, codigo: 'Erro de conexão ao validar' }));
            setCodigoValidado(false);
        } finally {
            setValidating(false);
        }
    };

    const handleContinuar = async () => {
        const newErrors: Record<string, string> = {};
        if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
        else if (nome.trim().length < 3) newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
        if (!cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
        else if (!validateCPF(cpf)) newErrors.cpf = 'CPF inválido';
        if (!email.trim()) newErrors.email = 'Email é obrigatório';
        else if (!validateEmail(email)) newErrors.email = 'Email inválido';
        if (!telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
        else if (telefone.replace(/\D/g, '').length < 10) newErrors.telefone = 'Telefone inválido';
        if (!senha) newErrors.senha = 'Senha é obrigatória';
        else if (senha.length < 8) newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
        if (!confirmSenha) newErrors.confirmSenha = 'Confirme sua senha';
        else if (senha !== confirmSenha) newErrors.confirmSenha = 'As senhas não coincidem';
        if (indicacaoTipo !== 'nenhum' && !codigoValidado) newErrors.codigo = 'Por favor, valide o código antes de continuar';
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onContinuar({
                nome, cpf, email, telefone, senha,
                indicacaoTipo,
                indicacaoNome: indicacaoTipo !== 'nenhum' ? indicacaoNome : '',
                codigo: indicacaoTipo !== 'nenhum' ? codigo.trim().toUpperCase() : '',
                descontoSocial: indicacaoTipo !== 'nenhum' ? desconto : 0,
                loteId: indicacaoTipo === 'empresa' ? loteId : '',
                voucherEmpresa: indicacaoTipo === 'empresa' ? voucherEmpresa : ''
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-1">
                    Seus Dados Pessoais
                </h3>
                <p className="text-foreground/40 text-sm sm:text-base font-medium">
                    Preencha seus dados para criar sua conta
                </p>
            </div>

            {/* Formulário */}
            <div className="form-card">
                <div className="space-y-5">

                    {/* Nome */}
                    <div className="form-field">
                        <label htmlFor="nome" className="form-label">
                            <User className="h-4 w-4" />Nome Completo
                        </label>
                        <input
                            id="nome" type="text" value={nome} autoComplete="name"
                            onChange={e => { setNome(e.target.value); if (errors.nome) setErrors({ ...errors, nome: '' }); }}
                            placeholder="Seu nome completo"
                            className={`form-input${errors.nome ? ' error' : ''}`}
                        />
                        {errors.nome && <p className="form-error"><AlertCircle />{errors.nome}</p>}
                    </div>

                    {/* CPF */}
                    <div className="form-field">
                        <label htmlFor="cpf" className="form-label">
                            <Contact className="h-4 w-4" />CPF
                        </label>
                        <input
                            id="cpf" type="text" inputMode="numeric" value={cpf} autoComplete="off"
                            onChange={e => { setCpf(formatCPF(e.target.value)); if (errors.cpf) setErrors({ ...errors, cpf: '' }); }}
                            placeholder="000.000.000-00"
                            className={`form-input${errors.cpf ? ' error' : ''}`}
                        />
                        {errors.cpf && <p className="form-error"><AlertCircle />{errors.cpf}</p>}
                    </div>

                    {/* Email */}
                    <div className="form-field">
                        <label htmlFor="email" className="form-label">
                            <Mail className="h-4 w-4" />Email
                        </label>
                        <input
                            id="email" type="email" inputMode="email" value={email} autoComplete="email"
                            onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                            placeholder="seu@email.com"
                            className={`form-input${errors.email ? ' error' : ''}`}
                        />
                        {errors.email && <p className="form-error"><AlertCircle />{errors.email}</p>}
                        <p className="form-hint">Você usará este email para fazer login no app</p>
                    </div>

                    {/* Telefone */}
                    <div className="form-field">
                        <label htmlFor="telefone" className="form-label">
                            <Phone className="h-4 w-4" />Telefone / WhatsApp
                        </label>
                        <input
                            id="telefone" type="tel" inputMode="tel" value={telefone} autoComplete="tel"
                            onChange={e => { setTelefone(formatTelefone(e.target.value)); if (errors.telefone) setErrors({ ...errors, telefone: '' }); }}
                            placeholder="(88) 98843-2310"
                            className={`form-input${errors.telefone ? ' error' : ''}`}
                        />
                        {errors.telefone && <p className="form-error"><AlertCircle />{errors.telefone}</p>}
                    </div>

                    {/* Senha */}
                    <div className="form-field">
                        <label htmlFor="senha" className="form-label">
                            <Lock className="h-4 w-4" />Criar Senha
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="senha" type={showSenha ? 'text' : 'password'} value={senha} autoComplete="new-password"
                                onChange={e => { setSenha(e.target.value); if (errors.senha) setErrors({ ...errors, senha: '' }); }}
                                placeholder="Mínimo 8 caracteres"
                                className={`form-input${errors.senha ? ' error' : ''}`}
                            />
                            <button type="button" onClick={() => setShowSenha(!showSenha)} className="form-input-icon-end">
                                {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.senha && <p className="form-error"><AlertCircle />{errors.senha}</p>}
                        <p className="form-hint">Use esta senha para acessar o app Growth Experience</p>
                    </div>

                    {/* Confirmar Senha */}
                    <div className="form-field">
                        <label htmlFor="confirmSenha" className="form-label">
                            <Lock className="h-4 w-4" />Confirmar Senha
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="confirmSenha" type={showConfirmSenha ? 'text' : 'password'} value={confirmSenha} autoComplete="new-password"
                                onChange={e => { setConfirmSenha(e.target.value); if (errors.confirmSenha) setErrors({ ...errors, confirmSenha: '' }); }}
                                placeholder="Digite a senha novamente"
                                className={`form-input${errors.confirmSenha ? ' error' : ''}`}
                            />
                            <button type="button" onClick={() => setShowConfirmSenha(!showConfirmSenha)} className="form-input-icon-end">
                                {showConfirmSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmSenha && <p className="form-error"><AlertCircle />{errors.confirmSenha}</p>}
                    </div>

                    {/* Programa Social */}
                    <div className="form-section-divider">
                        <div className="form-section-divider-label">
                            <Award className="h-4 w-4" />Programa de Inscrição Social
                        </div>
                    </div>
                    <p className="form-hint -mt-2">
                        Sua inscrição faz parte de uma parceria com Prefeitura, Empresa ou Liderança da região?
                    </p>

                    <div className="form-badge-group">
                        {[
                            { id: 'prefeitura', label: '🏛️ Prefeitura' },
                            { id: 'politico', label: '⚖️ Político' },
                            { id: 'empresa', label: '🏢 Empresa' },
                            { id: 'influenciador', label: '📱 Influencer' },
                            { id: 'associacao', label: '🤝 Associação' },
                            { id: 'instituicao', label: '🎓 Instituição' },
                            { id: 'promocional', label: '🎁 Promoção' },
                            { id: 'nenhum', label: '✕ Nenhum' },
                        ].map(tipo => (
                            <button
                                key={tipo.id} type="button"
                                onClick={() => { setIndicacaoTipo(tipo.id as DadosInscricao['indicacaoTipo']); setCodigoValidado(false); setCodigo(''); }}
                                className={`form-badge-btn${indicacaoTipo === tipo.id ? ' active' : ''}`}
                            >
                                {tipo.label}
                            </button>
                        ))}
                    </div>

                    {indicacaoTipo && indicacaoTipo !== 'nenhum' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Nome indicação */}
                            <div className="form-field">
                                <label htmlFor="indicacaoNome" className="form-label" style={{ fontSize: '0.72rem' }}>
                                    {indicacaoTipo === 'prefeitura' ? 'Qual Prefeitura?' :
                                        indicacaoTipo === 'politico' ? 'Qual Deputado ou Vereador?' :
                                            indicacaoTipo === 'empresa' ? 'Nome da Empresa / Equipe?' :
                                                indicacaoTipo === 'influenciador' ? 'Nome do Influenciador?' :
                                                    indicacaoTipo === 'associacao' ? 'Nome da Associação?' :
                                                        indicacaoTipo === 'instituicao' ? 'Nome da Instituição?' :
                                                            'Nome da Origem / Parceiro?'}
                                </label>
                                {indicacaoTipo === 'prefeitura' ? (
                                    <Select value={indicacaoNome} onValueChange={setIndicacaoNome}>
                                        <SelectTrigger className="form-input h-auto">
                                            <SelectValue placeholder="Selecione a cidade" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-100 border-white/10 text-white">
                                            {CIDADES_PAJEU.map(cidade => (
                                                <SelectItem key={cidade} value={cidade} className="focus:bg-brand-orange-coral/20 focus:text-white">
                                                    {cidade}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <input
                                        id="indicacaoNome" type="text" value={indicacaoNome}
                                        onChange={e => { setIndicacaoNome(e.target.value); if (errors.indicacaoNome) setErrors({ ...errors, indicacaoNome: '' }); }}
                                        placeholder="CBX ou Empresa que trabalho"
                                        className={`form-input${errors.indicacaoNome ? ' error' : ''}`}
                                    />
                                )}
                                {errors.indicacaoNome && <p className="form-error"><AlertCircle />{errors.indicacaoNome}</p>}
                            </div>

                            {/* Código */}
                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: '0.72rem' }}>
                                    <Key className="h-4 w-4" />
                                    {indicacaoTipo === 'empresa' ? 'Código do Voucher Corporativo' : 'Código da Parceria'}
                                </label>
                                <div className="form-code-row">
                                    <input
                                        type="text" value={codigo} disabled={validating}
                                        onChange={e => { setCodigo(e.target.value); setCodigoValidado(false); if (errors.codigo) setErrors({ ...errors, codigo: '' }); }}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); validarCodigo(); } }}
                                        placeholder={indicacaoTipo === 'empresa' ? 'EX: GROWTH-XXX' : 'INSIRA O CÓDIGO'}
                                        className={`form-input form-code-input${errors.codigo ? ' error' : ''}`}
                                    />
                                    <button
                                        type="button" onClick={validarCodigo}
                                        disabled={validating || !codigo.trim() || codigoValidado}
                                        className={`form-code-validate-btn${codigoValidado ? ' validated' : ''}`}
                                    >
                                        {validating ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                            codigoValidado ? <CheckCircle className="h-4 w-4" /> : 'Validar'}
                                    </button>
                                </div>
                                {errors.codigo && <p className="form-error"><AlertCircle />{errors.codigo}</p>}
                                {codigoValidado && (
                                    <p className="form-success-badge"><CheckCircle />CÓDIGO CONFIRMADO! (-{desconto}% OFF)</p>
                                )}
                                <p className="form-hint">
                                    {indicacaoTipo === 'empresa'
                                        ? 'Este código foi enviado ao responsável pela compra do lote da empresa.'
                                        : 'Esse código é fornecido pela sua empresa ou pela organizadora do GX.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Ações */}
            <div className="form-actions">
                <button type="button" onClick={onVoltar} disabled={validating} className="btn-form-back">
                    Voltar
                </button>
                <button type="button" onClick={handleContinuar} disabled={validating} className="btn-form-primary flex-1">
                    {validating
                        ? <><Loader2 className="h-5 w-5 animate-spin" />Validando...</>
                        : 'Continuar para Confirmação'
                    }
                </button>
            </div>
        </div>
    );
}
