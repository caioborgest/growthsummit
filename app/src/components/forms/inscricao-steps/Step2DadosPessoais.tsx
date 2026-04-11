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
    const [name, setName] = useState(dados.name || '');  
    const [cpf, setCpf] = useState(dados.cpf || '');
    const [email, setEmail] = useState(dados.email || '');
    const [phone, setPhone] = useState(dados.phone || '');
    const [password, setPassword] = useState(dados.password || '');
    const [referralType, setReferralType] = useState<DadosInscricao['referralType']>(dados.referralType || 'nenhum');
    const [referralName, setReferralName] = useState(dados.referralName || '');
    const [code, setCode] = useState(dados.code || '');
    const [batchId, setBatchId] = useState(dados.batchId || '');
    const [companyVoucher, setCompanyVoucher] = useState(dados.companyVoucher || '');
    const [confirmPassword, setConfirmPassword] = useState(dados.password || '');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validating, setValidating] = useState(false);
    const [socialDiscount, setSocialDiscount] = useState(dados.socialDiscount || 0);
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
        return phone;
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
        logger.debug('[Step2] Validating code:', { cleanCodigo, project: projectId });

        try {
            const voucher = await registrationService.resolveVoucher(cleanCodigo, projectId);

            if (voucher) {
                if (!voucher.isValid) {
                    setErrors(prev => ({ ...prev, code: voucher.error || 'Voucher inválido' }));
                    setCodigoValidado(false);
                } else {
                    const discount = voucher.discountPercentage || 0;
                    setCodigoValidado(true);
                    setBatchId(voucher.id);
                    setCompanyVoucher(voucher.voucher_code);
                    setReferralName(voucher.name);
                    setReferralType('empresa');
                    setSocialDiscount(discount);
                    if (onUpdate) {
                        onUpdate({ 
                            code: cleanCodigo,
                            referralName: voucher.name, 
                            socialDiscount: discount, 
                            batchId: voucher.id, 
                            companyVoucher: voucher.voucher_code,
                            registrationType: (voucher.ticket_type || 'pro') as any,
                            referralType: 'empresa'
                        });
                    }
                    toast.success(`Voucher corporativo validado! (-${discount}%)`);
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
                    setReferralName(partner.name);
                    setReferralType('parceiro');
                    setSocialDiscount(100);
                    if (onUpdate) {
                        onUpdate({ 
                            code: cleanCodigo,
                            partnerAccessCode: cleanCodigo,
                            referralName: partner.name, 
                            partnerId: partner.id, 
                            socialDiscount: 100,
                            registrationType: 'pro',
                            referralType: 'parceiro'
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
                const now = new Date();
                const expiryDate = couponData.expires_at ? new Date(couponData.expires_at) : null;
                const isExpired = expiryDate && expiryDate < now;
                const isOverLimit = couponData.usage_limit && couponData.current_usage >= couponData.usage_limit;

                if (!couponData.is_active || isExpired || isOverLimit) {
                    setErrors(prev => ({ ...prev, code: 'Cupom inativo, expirado ou com limite excedido' }));
                    setCodigoValidado(false);
                } else {
                    setCodigoValidado(true);
                    setSocialDiscount(couponData.discount_percentage);
                    setReferralType(couponData.referral_type as any);
                    setReferralName(cleanCodigo); // For coupons, referral name is usually the code
                    if (onUpdate) {
                        onUpdate({ 
                            code: cleanCodigo, 
                            socialDiscount: couponData.discount_percentage,
                            referralType: couponData.referral_type as any,
                            referralName: cleanCodigo
                        });
                    }
                    toast.success(`Cupom validado! ${couponData.discount_percentage}% de desconto.`);
                }
                return;
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
        if (!name.trim()) newErrors.name = 'Nome é obrigatório';
        else if (name.trim().length < 3) newErrors.name = 'O nome deve ter pelo menos 3 caracteres';
        if (!cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
        else if (!validateCPF(cpf)) newErrors.cpf = 'CPF inválido';
        if (!email.trim()) newErrors.email = 'E-mail é obrigatório';
        else if (!validateEmail(email)) newErrors.email = 'E-mail inválido';
        if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório';
        else if (phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefone inválido';
        if (!password) newErrors.password = 'Senha é obrigatória';
        else if (password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
        if (!confirmPassword) newErrors.confirmPassword = 'Confirme sua senha';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
        if (code.trim() && !codigoValidado) newErrors.code = 'Por favor, valide o código antes de continuar';
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onContinuar({
                name,
                cpf,
                email,
                phone,
                password,
                referralType: codigoValidado ? referralType : 'nenhum',
                referralName: codigoValidado ? (referralName || code.trim()) : '',
                partnerId: partnerId || '',
                partnerAccessCode: partnerId ? code.trim().toUpperCase() : undefined,
                code: code.trim().toUpperCase(),
                socialDiscount: codigoValidado ? socialDiscount : 0,
                batchId: referralType === 'empresa' ? batchId : '',
                companyVoucher: referralType === 'empresa' ? companyVoucher : ''
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
                        <label htmlFor="name" className="form-label">
                            <User className="h-4 w-4" />Nome Completo
                        </label>
                        <input
                            id="name" type="text" value={name} autoComplete="name"
                            onChange={e => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: '' }); }}
                            placeholder="Seu nome completo"
                            className={`form-input${errors.name ? ' error' : ''}`}
                        />
                        {errors.name && <p className="form-error"><AlertCircle />{errors.name}</p>}
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
                        <label htmlFor="phone" className="form-label">
                            <Phone className="h-4 w-4" />Telefone / WhatsApp
                        </label>
                        <input
                            id="phone" type="tel" inputMode="tel" value={phone} autoComplete="tel"
                            onChange={e => { setPhone(formatTelefone(e.target.value)); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                            placeholder="(87) 9.8888-7777"
                            className={`form-input${errors.phone ? ' error' : ''}`}
                        />
                        {errors.phone && <p className="form-error"><AlertCircle />{errors.phone}</p>}
                    </div>

                    <div className="form-field">
                        <label htmlFor="password" className="form-label">
                            <Lock className="h-4 w-4" />Criar Senha
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="password" type={showPassword ? 'text' : 'password'} value={password} autoComplete="new-password"
                                onChange={e => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                                placeholder="Mínimo 6 caracteres"
                                className={`form-input${errors.password ? ' error' : ''}`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="form-input-icon-end text-gray-400">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="form-error"><AlertCircle />{errors.password}</p>}
                        <p className="form-hint">Use esta senha para acessar o App do Growth Experience</p>
                    </div>

                    <div className="form-field">
                        <label htmlFor="confirmPassword" className="form-label">
                            <Lock className="h-4 w-4" />Confirmar Senha
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} autoComplete="new-password"
                                onChange={e => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }); }}
                                placeholder="Digite sua senha novamente"
                                className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="form-input-icon-end text-gray-400">
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="form-error"><AlertCircle />{errors.confirmPassword}</p>}
                    </div>

                    <div className="form-section-divider">
                        <div className="form-section-divider-label">
                            <Award className="h-4 w-4" />Código de Desconto ou Voucher
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="form-field">
                            <label className="form-label" style={{ fontSize: '0.72rem' }}>
                                <Key className="h-4 w-4" />
                                Código Social ou Corporativo
                            </label>
                            <div className="form-code-row">
                                <input
                                    type="text" value={code} disabled={validating}
                                    onChange={e => { setCode(e.target.value); setCodigoValidado(false); if (errors.code) setErrors({ ...errors, code: '' }); }}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleValidarCodigo(); } }}
                                    placeholder="DIGITE O CÓDIGO AQUI"
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
                                <p className="form-success-badge">
                                    <CheckCircle />CÓDIGO {referralType === 'empresa' ? 'CORPORATIVO' : 'SOCIAL'} VALIDADO! (-{socialDiscount}% OFF)
                                </p>
                            )}
                            <p className="form-hint">
                                Digite seu código de parceria ou voucher corporativo para aplicar o desconto.
                            </p>
                        </div>
                    </div>
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
