import { Link, Outlet, useLocation } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { BarChart3, FormInput, ActivitySquare, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminNPSLayout() {
  const { isProjectSelected } = useProject();
  const location = useLocation();

  const tabs = [
    { label: 'Dashboard', path: '/admin/nps/dashboard', icon: BarChart3 },
    { label: 'Formulários', path: '/admin/nps/forms', icon: FormInput },
    { label: 'Inbox (Loop)', path: '/admin/nps/inbox', icon: Inbox },
    { label: 'Automações', path: '/admin/nps/automations', icon: ActivitySquare },
  ];

  if (!isProjectSelected) {
    return (
      <div className="p-20 text-center opacity-50">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-xl font-black uppercase tracking-widest text-white">Selecione um projeto</h2>
        <p className="text-sm text-gray-400">Para acessar o Módulo NPS, escolha um projeto no menu lateral.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          Módulo <span className="text-brand-orange-coral">NPS</span>
        </h1>
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">
          Net Promoter Score & Fechamento de Loop
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-dark-200 border border-white/5 rounded-2xl p-1.5 w-fit">
        {tabs.map((tab) => {
          const isActive = location.pathname.includes(tab.path);
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all z-10 ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nps-nav-pill"
                  className="absolute inset-0 bg-white/10 rounded-xl -z-10 border border-white/5"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Renders the sub-pages */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
