import { CheckCircle2, Circle, ArrowRight, Settings as SettingsIcon, Calendar, Users, Ticket, PlayCircle, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '@/types';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  isCompleted: (project: Project, data: any) => boolean;
}

interface SetupWizardProps {
  project: Project;
  data: {
    sessionsCount: number;
    mentorsCount: number;
    registrationsCount: number;
    couponsCount: number;
  };
}

export function SetupWizard({ project, data }: SetupWizardProps) {
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      id: 'basic-info',
      title: 'Informações Básicas',
      description: 'Nome, local, datas e cores do evento.',
      icon: SettingsIcon,
      path: `/admin/projetos?edit=${project.id}`,
      isCompleted: (p) => !!(p.name && p.location && p.startDate),
    },
    {
      id: 'modules',
      title: 'Ativar Módulos',
      description: 'Habilitar Mentorias, B2B, Startups e Check-in.',
      icon: Layout,
      path: `/admin/projetos?edit=${project.id}`,
      isCompleted: (p) => !!p.settings,
    },
    {
      id: 'programacao',
      title: 'Grade de Programação',
      description: 'Cadastrar palestras, talks e horários.',
      icon: Calendar,
      path: '/admin/programacao',
      isCompleted: (_, d) => d.sessionsCount > 0,
    },
    {
      id: 'palestrantes',
      title: 'Palestrantes e Mentores',
      description: 'Vincular experts às atividades.',
      icon: Users,
      path: '/admin/mentores',
      isCompleted: (_, d) => d.mentorsCount > 0,
    },
    {
      id: 'financeiro',
      title: 'Ingressos e Lotes',
      description: 'Configurar preços e cupons de desconto.',
      icon: Ticket,
      path: '/admin/cupons',
      isCompleted: (_, d) => d.couponsCount > 0 || (project.settings?.ticketPrices?.standard ?? 0) > 0,
    },
    {
      id: 'launch',
      title: 'Publicar Projeto',
      description: 'Mudar status para Ativo e abrir inscrições.',
      icon: PlayCircle,
      path: '/admin/projetos',
      isCompleted: (p) => p.status === 'active',
    },
  ];

  const currentStepIndex = steps.findIndex(s => !s.isCompleted(project, data));
  const activeStep = currentStepIndex === -1 ? steps[steps.length - 1] : steps[currentStepIndex];

  return (
    <Card className="bg-[#1E293B] border-[#21808D]/30 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#21808D]/5 blur-3xl rounded-full -mr-32 -mt-32" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[#21808D]" />
              Fluxo de Configuração do Evento
            </CardTitle>
            <p className="text-[#94A3B8] text-xs font-medium mt-1">
              Siga os passos abaixo para preparar seu evento para o lançamento.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white leading-none">
              {Math.round((steps.filter(s => s.isCompleted(project, data)).length / steps.length) * 100)}%
            </p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Concluído</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Progress Bar */}
        <div className="w-full bg-[#0F172A] rounded-full h-1.5 mb-8 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(steps.filter(s => s.isCompleted(project, data)).length / steps.length) * 100}%` }}
            className="bg-gradient-to-r from-[#21808D] to-[#2A9D8F] h-full rounded-full shadow-[0_0_10px_rgba(33,128,141,0.5)]"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, index) => {
            const completed = step.isCompleted(project, data);
            const active = index === currentStepIndex;

            return (
              <motion.div
                key={step.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(step.path)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  completed 
                    ? 'bg-[#21808D]/10 border-[#21808D]/30' 
                    : active 
                      ? 'bg-white/[0.03] border-[#21808D] shadow-glow-teal' 
                      : 'bg-[#0F172A]/50 border-[#334155] opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    completed ? 'bg-[#21808D] text-white' : 'bg-[#1E293B] text-gray-500'
                  }`}>
                    {completed ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold leading-tight ${completed ? 'text-white' : 'text-gray-300'}`}>
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-[10px] text-[#94A3B8] mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {!completed && active && (
                    <ArrowRight className="w-4 h-4 text-[#21808D] animate-bounce-horizontal" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {currentStepIndex !== -1 && (
          <div className="mt-8 p-4 bg-brand-orange-coral/10 border border-brand-orange-coral/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-orange-coral/20 flex items-center justify-center">
                <activeStep.icon className="w-5 h-5 text-brand-orange-coral" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Próxima Ação: {activeStep.title}</p>
                <p className="text-[10px] text-[#94A3B8]">{activeStep.description}</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate(activeStep.path)}
              className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold text-xs"
            >
              Configurar Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
