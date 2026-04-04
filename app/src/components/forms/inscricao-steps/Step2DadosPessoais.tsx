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
                    setErrors(prev => ({ ...prev, code: 'Invalid voucher, limit exceeded or pending payment' }));
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
                    toast.success('Corporate voucher validated!');
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
                    setErrors(prev => ({ ...prev, code: `Team limit reached for this partner (${limit})` }));
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
                    toast.success('Partner code validated!');
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
                    setErrors(prev => ({ ...prev, code: 'Coupon inactive, expired or usage limit reached' }));
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
                    toast.success(`Coupon for ${couponData.discount_percentage}% applied!`);
                }
            } else {
                logger.warn('[Step2] Code not found in any category:', cleanCodigo);
                setErrors(prev => ({ ...prev, code: 'Code not found. Please check and try again.' }));
                setCodigoValidado(false);
            }
        } catch (err) {
            logger.error('[Step2] Critical error validating code:', err);
            setErrors(prev => ({ ...prev, code: 'Connection error while validating' }));
            setCodigoValidado(false);
        } finally {
            setValidating(false);
        }
    };

    const handleContinuar = async () => {
        const newErrors: Record<string, string> = {};
        if (!nome.trim()) newErrors.nome = 'Name is required';
        else if (nome.trim().length < 3) newErrors.nome = 'Name must be at least 3 characters';
        if (!cpf.trim()) newErrors.cpf = 'CPF is required';
        else if (!validateCPF(cpf)) newErrors.cpf = 'Invalid CPF';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(email)) newErrors.email = 'Invalid email';
        if (!telefone.trim()) newErrors.phone = 'Phone is required';
        else if (telefone.replace(/\D/g, '').length < 10) newErrors.phone = 'Invalid phone number';
        if (!senha) newErrors.senha = 'Password is required';
        else if (senha.length < 6) newErrors.senha = 'Password must be at least 6 characters';
        if (!confirmSenha) newErrors.confirmSenha = 'Confirm your password';
        else if (senha !== confirmSenha) newErrors.confirmSenha = 'Passwords do not match';
        if (indicacaoTipo !== 'nenhum' && code.trim() && !codigoValidado) newErrors.code = 'Please validate the code before continuing';
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
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-1">
                    Your Personal Details
                </h3>
                <p className="text-foreground/40 text-sm sm:text-base font-medium">
                    Fill in your details to create your account
                </p>
            </div>

            <div className="form-card">
                <div className="space-y-5">

                    <div className="form-field">
                        <label htmlFor="nome" className="form-label">
                            <User className="h-4 w-4" />Full Name
                        </label>
                        <input
                            id="nome" type="text" value={nome} autoComplete="name"
                            onChange={e => { setNome(e.target.value); if (errors.nome) setErrors({ ...errors, nome: '' }); }}
                            placeholder="Your full name"
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
                            <Mail className="h-4 w-4" />Email
                        </label>
                        <input
                            id="email" type="email" inputMode="email" value={email} autoComplete="email"
                            onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                            placeholder="your@email.com"
                            className={`form-input${errors.email ? ' error' : ''}`}
                        />
                        {errors.email && <p className="form-error"><AlertCircle />{errors.email}</p>}
                        <p className="form-hint">You will use this email to log in to the app</p>
                    </div>

                    <div className="form-field">
                        <label htmlFor="telefone" className="form-label">
                            <Phone className="h-4 w-4" />Phone / WhatsApp
                        </label>
                        <input
                            id="telefone" type="tel" inputMode="tel" value={telefone} autoComplete="tel"
                            onChange={e => { setTelefone(formatTelefone(e.target.value)); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                            placeholder="(88) 98843-2310"
                            className={`form-input${errors.phone ? ' error' : ''}`}
                        />
                        {errors.phone && <p className="form-error"><AlertCircle />{errors.phone}</p>}
                    </div>

                    <div className="form-field">
                        <label htmlFor="senha" className="form-label">
                            <Lock className="h-4 w-4" />Create Password
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="senha" type={showSenha ? 'text' : 'password'} value={senha} autoComplete="new-password"
                                onChange={e => { setSenha(e.target.value); if (errors.senha) setErrors({ ...errors, senha: '' }); }}
                                placeholder="Minimum 6 characters"
                                className={`form-input${errors.senha ? ' error' : ''}`}
                            />
                            <button type="button" onClick={() => setShowSenha(!showSenha)} className="form-input-icon-end">
                                {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.senha && <p className="form-error"><AlertCircle />{errors.senha}</p>}
                        <p className="form-hint">Use this password to access the Growth Experience app</p>
                    </div>

                    <div className="form-field">
                        <label htmlFor="confirmSenha" className="form-label">
                            <Lock className="h-4 w-4" />Confirm Password
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="confirmSenha" type={showConfirmSenha ? 'text' : 'password'} value={confirmSenha} autoComplete="new-password"
                                onChange={e => { setConfirmSenha(e.target.value); if (errors.confirmSenha) setErrors({ ...errors, confirmSenha: '' }); }}
                                placeholder="Type your password again"
                                className={`form-input${errors.confirmSenha ? ' error' : ''}`}
                            />
                            <button type="button" onClick={() => setShowConfirmSenha(!showConfirmSenha)} className="form-input-icon-end">
                                {showConfirmSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmSenha && <p className="form-error"><AlertCircle />{errors.confirmSenha}</p>}
                    </div>

                    <div className="form-section-divider">
                        <div className="form-section-divider-label">
                            <Award className="h-4 w-4" />Social Registration Program
                        </div>
                    </div>
                    <p className="form-hint -mt-2">
                        Is your registration part of a partnership with a City Hall, Company or local Leadership?
                    </p>

                    <div className="form-badge-group">
                        {[
                            { id: 'prefeitura', label: '🏛️ City Hall' },
                            { id: 'politico', label: '⚖️ Political' },
                            { id: 'empresa', label: '🏢 Company' },
                            { id: 'influenciador', label: '📱 Influencer' },
                            { id: 'associacao', label: '🤝 Association' },
                            { id: 'instituicao', label: '🎓 Institution' },
                            { id: 'parceiro', label: '🎖️ Partner/Vex' },
                            { id: 'promocional', label: '🎁 Promotion' },
                            { id: 'nenhum', label: '✕ None' },
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
                                    {indicacaoTipo === 'prefeitura' ? 'Which City Hall?' :
                                        indicacaoTipo === 'politico' ? 'Which Politician?' :
                                            indicacaoTipo === 'empresa' ? 'Company / Team Name?' :
                                                indicacaoTipo === 'influenciador' ? 'Influencer Name?' :
                                                    indicacaoTipo === 'associacao' ? 'Association Name?' :
                                                        indicacaoTipo === 'instituicao' ? 'Institution Name?' :
                                                            'Origin Name / Partner?'}
                                </label>
                                {indicacaoTipo === 'prefeitura' ? (
                                    <Select value={indicacaoNome} onValueChange={setIndicacaoNome}>
                                        <SelectTrigger className="form-input h-auto">
                                            <SelectValue placeholder="Select city" />
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
                                        placeholder="Company or partner name"
                                        className={`form-input${errors.indicacaoNome ? ' error' : ''}`}
                                    />
                                )}
                                {errors.indicacaoNome && <p className="form-error"><AlertCircle />{errors.indicacaoNome}</p>}
                            </div>

                            <div className="form-field">
                                <label className="form-label" style={{ fontSize: '0.72rem' }}>
                                    <Key className="h-4 w-4" />
                                    {indicacaoTipo === 'empresa' ? 'Corporate Voucher Code' : 'Partnership Code'}
                                </label>
                                <div className="form-code-row">
                                    <input
                                        type="text" value={code} disabled={validating}
                                        onChange={e => { setCode(e.target.value); setCodigoValidado(false); if (errors.code) setErrors({ ...errors, code: '' }); }}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleValidarCodigo(); } }}
                                        placeholder={indicacaoTipo === 'empresa' ? 'EX: GROWTH-XXX' : 'ENTER CODE'}
                                        className={`form-input form-code-input${errors.code ? ' error' : ''}`}
                                    />
                                    <button
                                        type="button" onClick={handleValidarCodigo}
                                        disabled={validating || !code.trim() || codigoValidado}
                                        className={`form-code-validate-btn${codigoValidado ? ' validated' : ''}`}
                                    >
                                        {validating ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                            codigoValidado ? <CheckCircle className="h-4 w-4" /> : 'Validate'}
                                    </button>
                                </div>
                                {errors.code && <p className="form-error"><AlertCircle />{errors.code}</p>}
                                {codigoValidado && (
                                    <p className="form-success-badge"><CheckCircle />CODE CONFIRMED! (-{desconto}% OFF)</p>
                                )}
                                <p className="form-hint">
                                    {indicacaoTipo === 'empresa'
                                        ? 'This code was sent to the person responsible for the company purchase.'
                                        : 'This code is provided by your company or GX organizers.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
                <button type="button" onClick={onVoltar} disabled={validating} className="btn-form-back">
                    Back
                </button>
                <button type="button" onClick={handleContinuar} disabled={validating} className="btn-form-primary flex-1">
                    {validating
                        ? <><Loader2 className="h-5 w-5 animate-spin" />Validating...</>
                        : 'Continue to Confirmation'
                    }
                </button>
            </div>
        </div>
    );
}
