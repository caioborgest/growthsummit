import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Shield,
    AlertTriangle,
    Activity,
    Users,
    Lock,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface AuditLog {
    id: string;
    event: string;
    user_id: string;
    metadata: any;
    ip_address: string;
    browser_agent: string;
    created_at: string; // Unificado de timestamp para created_at
}

interface SuspiciousLogin {
    email: string;
    ip_address: string;
    attempt_count: number;
    last_attempt: string;
    failed_attempts: number;
}

interface UserActivity {
    id: string;
    email: string;
    name: string;
    role: string;
    last_login_at: string;
    last_login_ip: string;
    two_factor_enabled: boolean;
    active_sessions: number;
    recent_events: number;
}

export function SecurityDashboard() {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [suspiciousLogins, setSuspiciousLogins] = useState<SuspiciousLogin[]>([]);
    const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        users2FA: 0,
        activeSessions: 0,
        recentLogins: 0,
        failedLogins: 0,
    });

    useEffect(() => {
        loadSecurityData();
    }, []);

    const [tablesMissing, setTablesMissing] = useState(false);

    const loadSecurityData = async () => {
        setLoading(true);
        setTablesMissing(false);
        try {
            // Cada busca é independente e falha silenciosamente se a tabela não existir
            
            // Carregar logs de auditoria (últimos 100)
            try {
                const { data: logs, error: logsErr } = await supabase
                    .from('audit_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);
                if (logsErr) {
                    if (logsErr.code === '42P01') setTablesMissing(true);
                    throw logsErr;
                }
                if (logs) setAuditLogs(logs);
            } catch (e) { 
                logger.debug('Audit logs table potentially missing or inaccessible');
            }

            // Carregar logins suspeitos
            try {
                const { data: suspicious, error: suspErr } = await supabase
                    .from('security_suspicious_logins')
                    .select('*');
                if (suspErr) throw suspErr;
                if (suspicious) setSuspiciousLogins(suspicious);
            } catch { /* Table potentially missing */ }

            // Carregar atividade de usuários
            try {
                const { data: activity, error: actErr } = await supabase
                    .from('security_user_activity')
                    .select('*')
                    .order('last_login_at', { ascending: false });
                if (actErr) throw actErr;
                if (activity) setUserActivity(activity);
            } catch { /* Table potentially missing */ }

            // Calcular estatísticas básicas com cautela
            let usersData: any[] = [];
            try {
                const { data: users, error: usersErr } = await supabase
                    .from('users')
                    .select('id, two_factor_enabled');
                if (usersErr) throw usersErr;
                if (users) usersData = users;
            } catch { /* ignore */ }

            let activeSessionsCount = 0;
            try {
                const { data: sessions } = await supabase
                    .from('active_sessions')
                    .select('id')
                    .gt('expires_at', new Date().toISOString())
                    .limit(1);
                if (sessions) activeSessionsCount = sessions.length;
            } catch { /* ignore */ }

            let recentLoginsData: any[] = [];
            try {
                const { data: recentLogins } = await supabase
                    .from('login_attempts')
                    .select('id, success')
                    .gte('attempted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
                if (recentLogins) recentLoginsData = recentLogins;
            } catch { /* ignore */ }

            setStats({
                totalUsers: usersData.length,
                users2FA: usersData.filter(u => u.two_factor_enabled).length,
                activeSessions: activeSessionsCount,
                recentLogins: recentLoginsData.filter(l => l.success).length,
                failedLogins: recentLoginsData.filter(l => !l.success).length,
            });

        } catch (error) {
            logger.debug('Algumas tabelas de segurança estão indisponíveis.');
            logger.error('Erro ao carregar dados de segurança:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportAuditLogs = async () => {
        try {
            const csv = [
                ['Timestamp', 'Event', 'User ID', 'IP Address', 'User Agent'].join(','),
                ...auditLogs.map(log => [
                    log.created_at,
                    log.event,
                    log.user_id || 'N/A',
                    log.ip_address || 'N/A',
                    `"${log.browser_agent || 'N/A'}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString()}.csv`;
            a.click();
        } catch (error) {
            logger.error('Erro ao exportar logs:', error);
        }
    };

    const getEventBadgeColor = (event: string) => {
        if (event.includes('failed') || event.includes('error')) return 'bg-red-500/20 text-red-500';
        if (event.includes('success') || event.includes('verified')) return 'bg-green-500/20 text-green-500';
        if (event.includes('2fa')) return 'bg-blue-500/20 text-blue-500';
        return 'bg-gray-500/20 text-gray-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Segurança</h1>
                    <p className="text-gray-400">Monitoramento e auditoria de segurança do sistema</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={loadSecurityData}
                        variant="outline"
                        className="border-white/20"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                    <Button
                        onClick={exportAuditLogs}
                        className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-dark-100"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Logs
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="glass-card p-6 border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="h-8 w-8 text-brand-orange-coral" />
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral">
                            Total
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-400">Usuários Cadastrados</p>
                </Card>

                <Card className="glass-card p-6 border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <Shield className="h-8 w-8 text-green-500" />
                        <Badge className="bg-green-500/20 text-green-500">
                            {Math.round((stats.users2FA / stats.totalUsers) * 100)}%
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.users2FA}</p>
                    <p className="text-sm text-gray-400">Com 2FA Ativo</p>
                </Card>

                <Card className="glass-card p-6 border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <Activity className="h-8 w-8 text-blue-500" />
                        <Badge className="bg-blue-500/20 text-blue-500">
                            Ativas
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.activeSessions}</p>
                    <p className="text-sm text-gray-400">Sessões Ativas</p>
                </Card>

                <Card className="glass-card p-6 border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <Lock className="h-8 w-8 text-green-500" />
                        <Badge className="bg-green-500/20 text-green-500">
                            24h
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.recentLogins}</p>
                    <p className="text-sm text-gray-400">Logins Bem-sucedidos</p>
                </Card>

                <Card className="glass-card p-6 border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                        <Badge className="bg-red-500/20 text-red-500">
                            24h
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.failedLogins}</p>
                    <p className="text-sm text-gray-400">Tentativas Falhadas</p>
                </Card>
            </div>

            {/* Suspicious Logins */}
            {suspiciousLogins.length > 0 && (
                <Card className="glass-card p-6 border-red-500/30">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Atividade Suspeita Detectada</h2>
                            <p className="text-sm text-gray-400">Múltiplas tentativas de login falhadas</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {suspiciousLogins.map((login, idx) => (
                            <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-semibold">{login.email}</p>
                                        <p className="text-sm text-gray-400">IP: {login.ip_address}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-red-500/20 text-red-500 mb-2">
                                            {login.failed_attempts} tentativas falhadas
                                        </Badge>
                                        <p className="text-xs text-gray-400">
                                            Última: {new Date(login.last_attempt).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Recent Audit Logs */}
            <Card className="glass-card p-6 border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <Eye className="h-6 w-6 text-brand-orange-coral" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Logs de Auditoria Recentes</h2>
                        <p className="text-sm text-gray-400">Últimas 100 atividades do sistema</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Timestamp</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Evento</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Usuário</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.slice(0, 20).map((log) => (
                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                        {new Date(log.created_at).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge className={getEventBadgeColor(log.event)}>
                                            {log.event}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                        {log.user_id?.substring(0, 8) || 'Sistema'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                        {log.ip_address || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* User Activity */}
            <Card className="glass-card p-6 border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="h-6 w-6 text-brand-orange-coral" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Atividade de Usuários</h2>
                        <p className="text-sm text-gray-400">Status de segurança por usuário</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Usuário</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Role</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">2FA</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Sessões</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Último Login</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userActivity.map((user) => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="text-sm font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge className="bg-brand-blue/20 text-brand-blue">
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4">
                                        {user.two_factor_enabled ? (
                                            <Badge className="bg-green-500/20 text-green-500">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Ativo
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-yellow-500/20 text-yellow-500">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Inativo
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                        {user.active_sessions}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                        {user.last_login_at
                                            ? new Date(user.last_login_at).toLocaleString('pt-BR')
                                            : 'Nunca'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                        {user.last_login_ip || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

// Export com nome esperado pelo App.tsx
export const AdminSecurity = SecurityDashboard;
