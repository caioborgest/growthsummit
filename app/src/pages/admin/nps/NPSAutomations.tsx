import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ActivitySquare, Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NPSAutomations() {
  const { projectId } = useProject();

  const handleDemo = () => {
    toast.info('Construção de Automações em andamento.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Automações & Cadência</h2>
          <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Gatilhos de envio automático de NPS</p>
        </div>
        <Button 
          onClick={handleDemo}
          className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black rounded-2xl h-10 px-6 shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-4 w-4 mr-2" /> NOVO GATILHO
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Mock Data for visual structure */}
        <Card className="bg-dark-200 border-white/5 rounded-[1.5rem]">
          <CardContent className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-400" />
               </div>
               <div>
                  <h3 className="text-white font-black uppercase text-sm italic">Pós-Evento Geral</h3>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Dispara 24 horas após término do evento. Formulário: General Satisfaction.</p>
               </div>
            </div>
            <div className="text-right">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-black px-3 py-1 rounded-full border border-emerald-500/20">ATIVO</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-white/5 rounded-[1.5rem] opacity-60 grayscale">
          <CardContent className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <ActivitySquare className="w-5 h-5 text-gray-400" />
               </div>
               <div>
                  <h3 className="text-white font-black uppercase text-sm italic">Sessão VIP</h3>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Dispara 15 minutos após Checkout em sessões VIP.</p>
               </div>
            </div>
            <div className="text-right">
              <span className="bg-white/5 text-gray-500 text-[10px] uppercase font-black px-3 py-1 rounded-full border border-white/10">INATIVO</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
