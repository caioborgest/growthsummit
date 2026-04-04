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

const PAJEU_CITIES = [
    'SERRA TALHADA', 'AFOGADOS DA INGAZEIRA', 'SÃO JOSÉ DO EGITO', 'TRIUNFO',
    'TABIRA', 'FLORES', 'CARNAÍBA', 'ITAPETIM', 'BREJINHO',
    'SANTA CRUZ DA BAIXA VERDE', 'IGUARACI', 'SANTA TEREZINHA',
    'TUPARETAMA', 'QUIXABA', 'SOLIDÃO'
].sort();

interface Step2DadosPessoaisProps {
    dados: DadosInscricao;
    onContinuar: (dados: Partial<DadosInscricao>) => void;
    onVoltar: () => void;
    onUpdate?: (novosDados: Partial<DadosInscricao>) => void;
}

export function Step2DadosPessoais(props: Step2DadosPessoaisProps) {
    const { dados, onContinuar, onVoltar, onUpdate } = props;
    const [nome, setNome] = useState(dados.nome || '');  
    const [cpf, setCpf] = useState(dados.cpf || '');
    const [email, setEmail] = useState(dados.email || '');
    const [telefone, setTelefone] = useState(dados.phone || '');
    const [senha, setSenha] = useState(dados.senha || '');
    const [indicacaoTipo, setIndicacaoTipo] = useState<DadosInscricao['indicacaoTipo']>(dados.indicacaoTipo || 'nenhum');
    const [indicacaoNome, setIndicacaoNome] = useState(dados.indicacaoNome || '');
    const [code, setCode] = useState(dados.code || '');
    const [loteId, setLoteId] = useState(dados.loteId || '');
    const [voucherEmpresa, setVoucherEmpresa] = useState(dados.voucherEmpresa || '');
    const [confirmSenha, setConfirmSenha] = useState(dados.senha || '');
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmSenha, setShowConfirmSenha] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validating, setValidating] = useState(false);
    const [desconto, setDesconto] = useState(dados.descontoSocial || 0);
    const [codigoValidado, setCodigoValidado] = useState(!!dados.code);
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

    const handleValidarCodigo = async () => {
        if (!code.trim()) return;
        setValidating(true);
        setErrors(prev => ({ ...prev, code: '' }));

        const cleanCodigo = code.trim().toUpperCase();
        logger.debug('[Step2] Validating code:', { cleanCodigo, type: indicacaoTipo, project: projectId });

        try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId);

            let lotQuery = supabase
                .from('company_registration_batches')
                .select('id,project_id,company_name,voucher_code,total_slots,used_slots,tipo_ingresso,payment_status')
                .eq('voucher_code', cleanCodigo);
            
            if (isUuid) {
                lotQuery = lotQuery.eq('project_id', projectId);
            }

            const { data: lot, error } = await lotQuery.maybeSingle();

            if (error) throw error;

            if (lot) {
                const isPaid = lot.payment_status === 'pago' || lot.payment_status === 'paid';
                if (lot.used_slots >= lot.total_slots || !isPaid) {
                    setErrors(prev => ({ ...prev, code: 'Voucher inválido, limite excedido ou pagamento pendente' }));
                    setCodigoValidado(false);
                } else {
                    setCodigoValidado(true);
                    setLoteId(lot.id);
                    setVoucherEmpresa(lot.voucher_code);
                    setIndicacaoNome(lot.company_name);
                    setIndicacaoTipo('empresa');
                    setDesconto(100);
                    if (onUpdate) {
                        onUpdate({ 
                            code: cleanCodigo,
                            indicacaoNome: lot.company_name, 
                            descontoSocial: 100, 
                            loteId: (lot as any).id, 
                            voucherEmpresa: lot.voucher_code,
                            tipoInscricao: ((lot as any).tipo_ingresso || 'pro') as any
                        });
                    }
                    toast.success('Voucher corporativo validado!');
                }
                return;
            }

            let partnerQuery = (supabase as any)
                .from('partners')
                .select('id, name, access_code, max_team_members')
                .eq('access_code', cleanCodigo)
                .eq('status', 'active');
            
            if (isUuid) {
                partnerQuery = partnerQuery.eq('project_id', projectId);
            }

            const { data: partner, error: partnerError } = await partnerQuery.maybeSingle();

            if (partnerError) logger.error('[Step2] Error fetching partner:', partnerError);

            if (partner) {
                const { data: usageData, error: usageErr } = await (supabase as any).rpc('get_parceiro_equipe_usage', {
                    p_partner_id: (partner as any).id,
                });
                if (usageErr) logger.error('[Step2] Error counting team members:', usageErr);

                const usedMembers = (usageData as { member_count?: number })?.member_count ?? 0;
                const limit = (usageData as { max_members?: number })?.max_members ?? partner.max_team_members ?? 10;

                if (usedMembers >= limit) {
                    setErrors(prev => ({ ...prev, code: `Limite de equipe atingido para este parceiro (${limit})` }));
                    setCodigoValidado(false);
                } else {
                    setCodigoValidado(true);
                    setPartnerId(partner.id);
                    setIndicacaoNome(partner.name);
                    setDesconto(100);
                    if (onUpdate) {
                        onUpdate({ 
                            code: cleanCodigo,
                            partnerAccessCode: cleanCodigo,
                            indicacaoNome: partner.name, 
                            partnerId: partner.id, 
                            descontoSocial: 100,
                            tipoInscricao: 'pro'
                        });
                    }
                    toast.success('Código de parceiro validado!');
                }
                return;
            }

            let couponQuery = supabase
                .from('social_partnership_coupons')
                .select('id,project_id,code,discount_percentage,usage_limit,current_usage,is_active,expires_at,referral_type')
                .eq('code', cleanCodigo);
            
            if (isUuid) {
                couponQuery = couponQuery.eq('project_id', projectId);
            }

            const { data: couponData, error: couponError } = await couponQuery.maybeSingle();

            if (couponError) throw couponError;

            if (couponData) {
                const isExpired = couponData.expires_at && new Date(couponData.expires_at) < new Date();
                const isFull = couponData.usage_limit && couponData.current_usage >= couponData.usage_limit;

                if (!couponData.is_active || isExpired || isFull) {
                    setErrors(prev => ({ ...prev, code: 'Cupom inativo, expirado ou limite de uso atingido' }));
                    setCodigoValidado(false);
                } else {
                    setCodigoValidado(true);
                    setDesconto(couponData.discount_percentage);
                    if (couponData.referral_type) {
                        setIndicacaoTipo(couponData.referral_type as any);
                    }
                    if (onUpdate) {
                        onUpdate({ 
                            descontoSocial: couponData.discount_percentage,
                            indicacaoTipo: (couponData.referral_type || indicacaoTipo) as any 
                        });
                    }
                    toast.success(`Cupom de ${couponData.discount_percentage}% aplicado!`);
                }
            } else {
                logger.warn('[Step2] Code not found in any category:', cleanCodigo);
                setErrors(prev => ({ ...prev, code: 'Código não encontrado. Verifique e tente novamente.' }));
                setCodigoValidado(false);
            }
        } catch (err) {
            logger.error('[Step2] Critical error validating code:', err);
            setErrors(prev => ({ ...prev, code: 'Erro de conexão ao validar' }));
            setCodigoValidado(false);
        } finally {
            setValidating(false);
        }
    };

    const handleContinuar = async () => {
        const newErrors: Record<string, string> = {};
        if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
        else if (nome.trim().length < 3) newErrors.nome = 'O nome deve ter pelo menos 3 caracteres';
        if (!cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
        else if (!validateCPF(cpf)) newErrors.cpf = 'CPF inválido';
        if (!email.trim()) newErrors.email = 'E-mail é obrigatório';
        else if (!validateEmail(email)) newErrors.email = 'E-mail inválido';
        if (!telefone.trim()) newErrors.phone = 'Telefone é obrigatório';
        else if (telefone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefone inválido';
        if (!senha) newErrors.senha = 'Senha é obrigatória';
        else if (senha.length < 6) newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
        if (!confirmSenha) newErrors.confirmSenha = 'Confirme sua senha';
        else if (senha !== confirmSenha) newErrors.confirmSenha = 'As senhas não coincidem';
        if (indicacaoTipo !== 'nenhum' && code.trim() && !codigoValidado) newErrors.code = 'Por favor, valide o código antes de continuar';
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onContinuar({
                nome,
                cpf,
                email,
                phone: telefone,
                senha,
                indicacaoTipo,
                indicacaoNome: indicacaoTipo !== 'nenhum' ? indicacaoNome : '',
                partnerId: partnerId || '',
                partnerAccessCode: partnerId ? code.trim().toUpperCase() : undefined,
                code: indicacaoTipo !== 'nenhum' ? code.trim().toUpperCase() : '',
                descontoSocial: indicacaoTipo !== 'nenhum' ? desconto : 0,
                loteId: indicacaoTipo === 'empresa' ? loteId : '',
                voucherEmpresa: indicacaoTipo === 'empresa' ? voucherEmpresa : ''
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 uppercase italic">
                    Suas Informações <span className="text-brand-orange-coral">Pessoais</span>
                </h3>
                <p className="text-gray-500 text-sm sm:text-base font-medium">
                    Preencha seus dados para criar sua conta de acesso
                </p>
            </div>

            <div className="form-card">
                <div className="space-y-5">

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

                    <div className="form-field">
                        <label htmlFor="email" className="form-label">
                            <Mail className="h-4 w-4" />E-mail
                        </label>
                        <input
                            id="email" type="email" inputMode="email" value={email} autoComplete="email"
                            onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                            placeholder="seu@email.com.br"
                            className={`form-input${errors.email ? ' error' : ''}`}
                        />
                        {errors.email && <p className="form-error"><AlertCircle />{errors.email}</p>}
                        <p className="form-hint">Você usará este e-mail para acessar o aplicativo</p>
                    </div>

                    <div className="form-field">
                        <label htmlFor="telefone" className="form-label">
                            <Phone className="h-4 w-4" />Telefone / WhatsApp
                        </label>
                        <input
                            id="telefone" type="tel" inputMode="tel" value={telefone} autoComplete="tel"
                            onChange={e => { setTelefone(formatTelefone(e.target.value)); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                            placeholder="(87) 9.8888-7777"
                            className={`form-input${errors.phone ? ' error' : ''}`}
                        />
                        {errors.phone && <p className="form-error"><AlertCircle />{errors.phone}</p>}
                    </div>

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
                            <button type="button" onClick={() => setShowSenha(!showSenha)} className="form-input-icon-end text-gray-400">
                                {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.senha && <p className="form-error"><AlertCircle />{errors.senha}</p>}
                        <p className="form-hint">Use esta senha para acessar o App do Growth Experience</p>
                    </div>

                    <div className="form-field">
                        <label htmlFor="confirmSenha" className="form-label">
                            <Lock className="h-4 w-4" />Confirmar Senha
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="confirmSenha" type={showConfirmSenha ? 'text' : 'password'} value={confirmSenha} autoComplete="new-password"
                                onChange={e => { setConfirmSenha(e.target.value); if (errors.confirmSenha) setErrors({ ...errors, confirmSenha: '' }); }}
                                placeholder="Digite sua senha novamente"
                                className={`form-input${errors.confirmSenha ? ' error' : ''}`}
                            />
                            <button type="button" onClick={() => setShowConfirmSenha(!showConfirmSenha)} className="form-input-icon-end text-gray-400">
                                {showConfirmSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmSenha && <p className="form-error"><AlertCircle />{errors.confirmSenha}</p>}
                    </div>

                    <div className="form-section-divider">
                        <div className="form-section-divider-label">
                            <Award className="h-4 w-4" />Programa de Inscrição Social
                        </div>
                    </div>
                    <p className="form-hint -mt-2">
                        Sua inscrição é fruto de parceria com Prefeitura, Empresa ou Liderança local?
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
                            { id: 'promocional', label: '🎁 Promocional' },
                            { id: 'nenhum', label: '✕ Nenhum' },
                        ].map(tipo => (
                            <button
                                key={tipo.id} type="button"
                                onClick={() => {
                                    setIndicacaoTipo(tipo.id as DadosInscricao['indicacaoTipo']);
                                    setCodigoValidado(false);
                                    setCode('');
                                    setLoteId('');
                                    setVoucherEmpresa('');
                                    setPartnerId('');
                                    setDesconto(0);
                                    setIndicacaoNome('');
                                    onUpdate?.({
                                        code: '',
                                        descontoSocial: 0,
                                        loteId: '',
                                        voucherEmpresa: '',
                                        partnerId: '',
                                        indicacaoNome: '',
                                        partnerAccessCode: ''
                                    });
                                }}
                                className={`form-badge-btn${indicacaoTipo === tipo.id ? ' active' : ''}`}
                            >
                                {tipo.label}
                            </button>
                        ))}
                    </div>

                    {indicacaoTipo && indicacaoTipo !== 'nenhum' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="form-field">
                                <label htmlFor="indicacaoNome" className="form-label" style={{ fontSize: '0.72rem' }}>
                                    {indicacaoTipo === 'prefeitura' ? 'Qual a Prefeitura?' :
                                        indicacaoTipo === 'politico' ? 'Qual o Político / Liderança?' :
                                            indicacaoTipo === 'empresa' ? 'Nome da Empresa / Equipe?' :
                                                indicacaoTipo === 'influenciador' ? 'Qual o Influenciador?' :
                                                    indicacaoTipo === 'associacao' ? 'Qual a Associação?' :
                                                        indicacaoTipo === 'instituicao' ? 'Qual a Instituição?' :
                                                            'Nome da Origem / Parceiro?'}
                                </label>
                                {indicacaoTipo === 'prefeitura' ? (
                                    <Select value={indicacaoNome} onValueChange={setIndicacaoNome}>
                                        <SelectTrigger className="form-input h-auto">
                                            <SelectValue placeholder="Selecione a cidade" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-100 border-white/10 text-white">
                                            {PAJEU_CITIES.map(cidade => (
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
                                        placeholder="Nome do parceiro ou empresa"
                                        className={`form-input${errors.indicacaoNome ? ' error' : ''}`}
                                    />
                                )}
                                {errors.indicacaoNome && <p className="form-error"><AlertCircle />{errors.indicacaoNome}</p>}
                            </div>

                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: '0.72rem' }}>
                                    <Key className="h-4 w-4" />
                                    {indicacaoTipo === 'empresa' ? 'Código do Voucher Corporativo' : 'Código de Parceria'}
                                </label>
                                <div className="form-code-row">
                                    <input
                                        type="text" value={code} disabled={validating}
                                        onChange={e => { setCode(e.target.value); setCodigoValidado(false); if (errors.code) setErrors({ ...errors, code: '' }); }}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleValidarCodigo(); } }}
                                        placeholder={indicacaoTipo === 'empresa' ? 'EX: GROWTH-XXX' : 'DIGITE O CÓDIGO'}
                                        className={`form-input form-code-input${errors.code ? ' error' : ''}`}
                                    />
                                    <button
                                        type="button" onClick={handleValidarCodigo}
                                        disabled={validating || !code.trim() || codigoValidado}
                                        className={`form-code-validate-btn${codigoValidado ? ' validated' : ''}`}
                                    >
                                        {validating ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                            codigoValidado ? <CheckCircle className="h-4 w-4" /> : 'Validar'}
                                    </button>
                                </div>
                                {errors.code && <p className="form-error"><AlertCircle />{errors.code}</p>}
                                {codigoValidado && (
                                    <p className="form-success-badge"><CheckCircle />CÓDIGO CONFIRMADO! (-{desconto}% OFF)</p>
                                )}
                                <p className="form-hint">
                                    {indicacaoTipo === 'empresa'
                                        ? 'Este código foi enviado ao responsável pela compra do lote corporativo.'
                                        : 'Este código é fornecido pela sua empresa ou organização do GX.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
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
