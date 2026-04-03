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
    const [partnerId, setPartnerId] = useState(dados.partnerId || '');
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
        setValidating(true);
        setErrors(prev => ({ ...prev, codigo: '' }));

        const cleanCodigo = codigo.trim().toUpperCase();
        logger.debug('[Step2] Validando código:', { cleanCodigo, tipo: indicacaoTipo, project: projectId });

        try {
            // Priority 1: Lote de Empresa (Voucher Corporativo)
            if (indicacaoTipo === 'empresa') {
                const { data: lot, error } = await supabase
                    .from('lotes_inscricao_empresa')
                    .select('id,project_id,nome_empresa,voucher_code,quantidade_vagas,vagas_utilizadas,tipo_ingresso,status_pagamento')
                    .eq('voucher_code', cleanCodigo)
                    .eq('project_id', projectId)
                    .maybeSingle();

                if (error) throw error;

                if (lot) {
                    if (lot.vagas_utilizadas >= lot.quantidade_vagas || lot.status_pagamento !== 'pago') {
                        setErrors(prev => ({ ...prev, codigo: 'Voucher inválido, limite excedido ou pagamento pendente' }));
                        setCodigoValidado(false);
                    } else {
                        setCodigoValidado(true);
                        setLoteId(lot.id);
                        setVoucherEmpresa(lot.voucher_code);
                        setIndicacaoNome(lot.nome_empresa);
                        setDesconto(100);
                        onUpdate?.({ 
                            indicacaoNome: lot.nome_empresa, 
                            descontoSocial: 100, 
                            loteId: lot.id, 
                            voucherEmpresa: lot.voucher_code,
                            tipoInscricao: (lot.tipo_ingresso || 'pro') as any
                        });
                        toast.success('Voucher corporativo validado!');
                    }
                    return;
                }
            }

            // Priority 2: Parceiros Diretos (Expositores/Vex)
            // Estes usam um access_code na tabela 'parceiros'
            const { data: partner, error: partnerError } = await supabase
                .from('parceiros')
                .select('id, name, access_code, max_team_members')
                .eq('access_code', cleanCodigo)
                .eq('project_id', projectId)
                .eq('status', 'active')
                .maybeSingle();

            if (partnerError) logger.error('[Step2] Erro ao buscar parceiro:', partnerError);

            if (partner) {
                // Verificar limite de membros da equipe
                const { count, error: countError } = await supabase
                    .from('parceiros_equipe')
                    .select('*', { count: 'exact', head: true })
                    .eq('partner_id', partner.id);

                if (countError) logger.error('[Step2] Erro ao contar equipe:', countError);

                const usedMembers = count || 0;
                const limit = partner.max_team_members || 10;

                if (usedMembers >= limit) {
                    setErrors(prev => ({ ...prev, codigo: `Limite de equipe atingido para este parceiro (${limit})` }));
                    setCodigoValidado(false);
                } else {
                    setCodigoValidado(true);
                    setPartnerId(partner.id);
                    setIndicacaoNome(partner.name);
                    setDesconto(100);
                    onUpdate?.({ 
                        indicacaoNome: partner.name, 
                        partnerId: partner.id, 
                        descontoSocial: 100,
                        tipoInscricao: 'pro'
                    });
                    toast.success('Código de parceiro validado!');
                }
                return;
            }

            // Priority 3: Cupons Sociais e Promocionais
            const { data: couponData, error: couponError } = await supabase
                .from('cupons_parceria_social')
                .select('id,project_id,codigo,porcentagem_desconto,uso_limite,uso_atual,ativo,vencimento,indicacao_tipo')
                .eq('codigo', cleanCodigo)
                .eq('project_id', projectId)
                .maybeSingle();

            if (couponError) throw couponError;

            if (couponData) {
                const isExpired = couponData.vencimento && new Date(couponData.vencimento) < new Date();
                const isFull = couponData.uso_limite && couponData.uso_atual >= couponData.uso_limite;
                const isCompatible = couponData.indicacao_tipo === indicacaoTipo || 
                                   couponData.indicacao_tipo === 'promocional' || 
                                   indicacaoTipo === 'nenhum';

                if (!couponData.ativo || isExpired || isFull) {
                    setErrors(prev => ({ ...prev, codigo: 'Cupom inativo, expirado ou limite de uso atingido' }));
                    setCodigoValidado(false);
                } else if (!isCompatible) {
                    setErrors(prev => ({ ...prev, codigo: `Cupom incompatível com a categoria selecionada (${couponData.indicacao_tipo})` }));
                    setCodigoValidado(false);
                } else {
                    setCodigoValidado(true);
                    setDesconto(couponData.porcentagem_desconto);
                    onUpdate?.({ descontoSocial: couponData.porcentagem_desconto });
                    toast.success(`Cupom de ${couponData.porcentagem_desconto}% aplicado!`);
                }
            } else {
                logger.warn('[Step2] Código não encontrado em nenhuma categoria:', cleanCodigo);
                setErrors(prev => ({ ...prev, codigo: 'Código não encontrado para este evento. Verifique a categoria selecionada.' }));
                setCodigoValidado(false);
            }
        } catch (err) {
            logger.error('[Step2] Erro crítico ao validar código:', err);
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
        else if (senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
        if (!confirmSenha) newErrors.confirmSenha = 'Confirme sua senha';
        else if (senha !== confirmSenha) newErrors.confirmSenha = 'As senhas não coincidem';
        if (indicacaoTipo !== 'nenhum' && !codigoValidado) newErrors.codigo = 'Por favor, valide o código antes de continuar';
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onContinuar({
                nome, cpf, email, telefone, senha,
                indicacaoTipo,
                indicacaoNome: indicacaoTipo !== 'nenhum' ? indicacaoNome : '',
                partnerId: partnerId || '',
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
                                placeholder="Mínimo 6 caracteres"
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
                            { id: 'parceiro', label: '🎖️ Parceiro/Vex' },
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
