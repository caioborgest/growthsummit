import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { npsModuleService } from '@/services/npsModuleService';
import { BarChart3, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function NPSDashboard() {
  const { projectId } = useProject();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadStats();
    }
  }, [projectId]);

  const loadStats = async () => {
    setLoading(true);
    const data = await npsModuleService.getDashboardStats(projectId!);
    setStats(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Action Bar */}
      <div className="glass-card p-6 border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
            <TrendingUp className="h-6 w-6 text-brand-orange-coral" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg italic uppercase tracking-tight">Visão Geral</h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Análise de Desempenho do Evento</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NPS Score Card */}
        <Card className="bg-dark-200 border-white/5 rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BarChart3 className="h-16 w-16 text-white" />
          </div>
          <CardContent className="pt-8 pb-6 text-center">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">NPS Global</p>
            <div className="relative inline-block">
              <span className={`text-6xl font-black italic tracking-tighter ${
                (stats?.score || 0) >= 70 ? 'text-emerald-400' : 
                (stats?.score || 0) >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {stats?.score || 0}
              </span>
              <div className="absolute -top-1 -right-4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[9px] font-bold text-gray-500 mt-4 uppercase tracking-widest">
              ZONA DE {(stats?.score || 0) >= 70 ? 'EXCELÊNCIA' : (stats?.score || 0) >= 40 ? 'QUALIDADE' : 'APERFEIÇOAMENTO'}
            </p>
          </CardContent>
        </Card>

        {/* Public Ratio Card */}
        <Card className="col-span-1 md:col-span-2 bg-dark-200 border-white/5 rounded-[2rem] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Distribuição de Público</h3>
            <Badge variant="outline" className="text-gray-500 border-white/5 uppercase text-[8px] font-black tracking-[0.2em]">
              Total: {stats?.total || 0} Respostas
            </Badge>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Promotores (9-10)', count: stats?.promoters || 0, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Neutros (7-8)', count: stats?.passives || 0, color: 'bg-yellow-500', text: 'text-yellow-400' },
              { label: 'Detratores (0-6)', count: stats?.detractors || 0, color: 'bg-red-500', text: 'text-red-400' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={item.text}>{item.count} ({stats?.total ? Math.round((item.count / stats.total) * 100) : 0}%)</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stats?.total ? `${(item.count / stats.total) * 100}%` : '0%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${item.color} rounded-full`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
    </div>
  );
}
