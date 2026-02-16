import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ShieldCheck, ShieldOff, QrCode, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';

export function TwoFactorAuth() {
    const { user, enable2FA, verify2FA, disable2FA } = useAuth();
    const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [secret, setSecret] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleEnable2FA = async () => {
        setLoading(true);
        setError('');

        try {
            const { qrCode, secret: generatedSecret } = await enable2FA();
            setSecret(generatedSecret);

            // Gerar QR Code
            const qrUrl = await QRCode.toDataURL(qrCode);
            setQrCodeUrl(qrUrl);

            setStep('setup');
        } catch (err: any) {
            setError(err.message || 'Erro ao habilitar 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (verificationCode.length !== 6) {
            setError('O código deve ter 6 dígitos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const isValid = await verify2FA(verificationCode);

            if (isValid) {
                setStep('initial');
                setVerificationCode('');
                alert('2FA habilitado com sucesso!');
            } else {
                setError('Código inválido. Tente novamente.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao verificar código');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm('Tem certeza que deseja desabilitar a autenticação de dois fatores? Isso tornará sua conta menos segura.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await disable2FA();
            setStep('initial');
            alert('2FA desabilitado com sucesso');
        } catch (err: any) {
            setError(err.message || 'Erro ao desabilitar 2FA');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Card className="glass-card p-8 border-white/10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user.twoFactorEnabled ? 'bg-green-500/20' : 'bg-yellow-500/20'
                        }`}>
                        {user.twoFactorEnabled ? (
                            <ShieldCheck className="h-6 w-6 text-green-500" />
                        ) : (
                            <Shield className="h-6 w-6 text-yellow-500" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Autenticação de Dois Fatores (2FA)</h3>
                        <p className="text-sm text-gray-400">
                            {user.twoFactorEnabled
                                ? 'Sua conta está protegida com 2FA'
                                : 'Adicione uma camada extra de segurança'}
                        </p>
                    </div>
                </div>
                <Badge className={user.twoFactorEnabled ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                    {user.twoFactorEnabled ? 'Ativado' : 'Desativado'}
                </Badge>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            )}

            {step === 'initial' && (
                <div className="space-y-6">
                    {!user.twoFactorEnabled ? (
                        <>
                            <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-2">Por que usar 2FA?</h4>
                                <ul className="text-sm text-gray-300 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange-coral mt-1">•</span>
                                        <span>Protege sua conta mesmo se sua senha for comprometida</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange-coral mt-1">•</span>
                                        <span>Requer um código temporário do seu celular para fazer login</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange-coral mt-1">•</span>
                                        <span>Recomendado para contas de administrador</span>
                                    </li>
                                </ul>
                            </div>

                            <Button
                                onClick={handleEnable2FA}
                                disabled={loading}
                                className="w-full bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold"
                            >
                                {loading ? 'Configurando...' : 'Habilitar 2FA'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-2">2FA Ativo</h4>
                                <p className="text-sm text-gray-300">
                                    Sua conta está protegida com autenticação de dois fatores.
                                    Você precisará inserir um código do seu aplicativo autenticador toda vez que fizer login.
                                </p>
                            </div>

                            {user.role === 'admin' && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-white font-semibold mb-1">Aviso para Administradores</h4>
                                        <p className="text-sm text-gray-300">
                                            Como administrador, é altamente recomendado manter o 2FA ativado para proteger
                                            o acesso às áreas sensíveis do sistema.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleDisable2FA}
                                disabled={loading}
                                variant="outline"
                                className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
                            >
                                <ShieldOff className="h-4 w-4 mr-2" />
                                {loading ? 'Desabilitando...' : 'Desabilitar 2FA'}
                            </Button>
                        </>
                    )}
                </div>
            )}

            {step === 'setup' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h4 className="text-white font-semibold mb-4">Escaneie o QR Code</h4>
                        <p className="text-sm text-gray-400 mb-6">
                            Use um aplicativo autenticador como Google Authenticator, Authy ou Microsoft Authenticator
                        </p>

                        {qrCodeUrl && (
                            <div className="inline-block p-4 bg-white rounded-xl mb-4">
                                <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48" />
                            </div>
                        )}

                        <div className="bg-dark-200 rounded-lg p-4 mb-6">
                            <p className="text-xs text-gray-400 mb-2">Ou insira manualmente o código:</p>
                            <code className="text-brand-orange-coral font-mono text-sm break-all">{secret}</code>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="verification-code" className="text-white mb-2 block">
                                Código de Verificação
                            </Label>
                            <Input
                                id="verification-code"
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                className="text-center text-2xl tracking-widest"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Digite o código de 6 dígitos do seu aplicativo autenticador
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    setStep('initial');
                                    setVerificationCode('');
                                    setError('');
                                }}
                                variant="outline"
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleVerify2FA}
                                disabled={loading || verificationCode.length !== 6}
                                className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100 font-bold"
                            >
                                {loading ? 'Verificando...' : 'Verificar e Ativar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
