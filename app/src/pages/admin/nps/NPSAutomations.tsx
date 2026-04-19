import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { npsModuleService } from '@/services/npsModuleService';
import { ActivitySquare, Plus, Mail, Clock, MessageSquare, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { NPSForm, NPSAutomation } from '@/types';

export default function NPSAutomations() {
  const { projectId } = useProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [automations, setAutomations] = useState<Partial<NPSAutomation>[]>([]);
  const [forms, setForms] = useState<NPSForm[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    trigger: 'check_out',
    channel: 'whatsapp',
    delayValue: '2',
    delayUnit: 'horas',
    formId: ''
  });

  useEffect(() => {
    if (projectId) {
      // Mock loading automations for now
      setAutomations([
        {
          id: '1',
          projectId,
          formId: '', // To be associated
          triggerName: 'check_out',
          delayMinutes: 120, // 2 horas
          channel: 'whatsapp',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
      loadForms();
    }
  }, [projectId]);

  const loadForms = async () => {
    const data = await npsModuleService.getForms(projectId!);
    setForms(data.filter(f => f.status === 'active'));
    if (data.length > 0) {
      setFormData(prev => ({ ...prev, formId: data.find(f => f.status === 'active')?.id || '' }));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.formId) {
      toast.error('Você precisa selecionar um Formulário Ativo.');
      return;
    }

    const multiplier = formData.delayUnit === 'minutos' ? 1 : formData.delayUnit === 'horas' ? 60 : 1440;
    const delayMinutes = parseInt(formData.delayValue) * multiplier;

    const newAutomation: Partial<NPSAutomation> = {
      id: Date.now().toString(),
      projectId: projectId!,
      formId: formData.formId,
      triggerName: formData.trigger as any,
      delayMinutes,
      channel: formData.channel as any,
      isActive: true,
      audienceRules: { type: 'all' },
      quietHours: { enabled: true, start: '20:00', end: '08:00' },
      createdAt: new Date().toISOString()
    };

    setAutomations([newAutomation, ...automations]);
    setIsModalOpen(false);
    toast.success('Gatilho de automação configurado na esteira!');
  };

  const formatDelay = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.floor(minutes/60)} h`;
    return `${Math.floor(minutes/1440)} d`;
  };

  const getFormName = (fId: string) => {
    return forms.find(f => f.id === fId)?.internalName || 'Desconhecido';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-dark-200 border border-white/5 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight">Cadência & Disparos</h2>
          <p className="text-[12px] font-bold text-gray-400 tracking-widest uppercase mt-1">Gatilhos de envio automático de NPS</p>
        </div>
        <Button 
          onClick={() => {
            setFormData({ ...formData, name: '', trigger: 'check_out', channel: 'whatsapp', delayValue: '2', delayUnit: 'horas' });
            setIsModalOpen(true);
          }}
          className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black rounded-2xl h-12 px-8 shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-5 w-5 mr-2" /> NOVO GATILHO
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {automations.map((auto) => (
          <Card key={auto.id} className={`bg-dark-200 border-white/5 rounded-[1.5rem] transition-all ${!auto.isActive ? 'opacity-60 grayscale hover:grayscale-0' : 'hover:border-white/20'}`}>
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-5 w-full md:w-auto">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                    {auto.channel === 'email' ? <Mail className="w-6 h-6 text-[#14B8A6]" /> : <MessageSquare className="w-6 h-6 text-brand-orange-coral" />}
                 </div>
                 <div>
                    <h3 className="text-white font-black uppercase text-lg italic tracking-tight">{auto.triggerName || auto.id} - {auto.channel}</h3>
                    <p className="text-[11px] text-gray-400 font-bold mb-1.5 flex items-center">
                       <Settings className="w-3 h-3 mr-1" /> Form: {getFormName(auto.formId!)}
                    </p>
                    <div className="flex items-center gap-3">
                       <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest flex items-center bg-white/5 rounded-full px-2 py-0.5 border border-white/5">
                         Gatilho: {auto.triggerName}
                       </span>
                       <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest flex items-center">
                         <Clock className="w-3 h-3 mr-1" />
                         Delay: {formatDelay(auto.delayMinutes || 0)}
                       </span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t border-white/5 pt-4 md:border-0 md:pt-0">
                <Button variant="ghost" className="text-brand-orange-coral bg-brand-orange-coral/10 hover:bg-brand-orange-coral/20 rounded-xl h-9 text-xs font-bold px-4" onClick={() => toast.info('Apenas simulação visual no Mock V2')}>
                  Configurar
                </Button>
                <span className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-full border ${
                  auto.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 text-gray-500 border-white/10'
                }`}>
                  {auto.isActive ? 'RODANDO' : 'PAUSADO'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-dark-200 border-white/10 text-white rounded-[2.5rem] p-0 max-w-xl overflow-hidden">
           <div className="p-8 border-b border-white/5 bg-gradient-to-r from-dark-200 to-black">
              <DialogTitle className="text-2xl font-black italic uppercase text-[#14B8A6] flex items-center">
                Criar Automação NPS
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-2">
                Defina o momento exato em que a pesquisa será disparada usando a Arquitetura V2.
              </DialogDescription>
           </div>

           <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-2">
                 <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Formulário a Mapear</Label>
                 <select 
                    required
                    value={formData.formId} 
                    onChange={(e) => setFormData({...formData, formId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 h-12 rounded-2xl px-4 text-white font-medium focus:border-[#14B8A6] focus:ring-0 appearance-none"
                 >
                    <option value="" disabled className="bg-dark-100 text-gray-500">Selecione um Form Activo...</option>
                    {forms.map(f => (
                       <option key={f.id} value={f.id} className="bg-dark-100 text-white">{f.internalName}</option>
                    ))}
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Momento (Gatilho)</Label>
                   <select 
                      value={formData.trigger} 
                      onChange={(e) => setFormData({...formData, trigger: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 h-12 rounded-2xl px-4 text-white font-medium focus:border-[#14B8A6] focus:ring-0 appearance-none"
                   >
                      <option value="post_event" className="bg-dark-100 text-white">Fim do Evento</option>
                      <option value="post_session" className="bg-dark-100 text-white">Término de Sessão</option>
                      <option value="check_out" className="bg-dark-100 text-white">Após Check-out</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Canal</Label>
                   <select 
                      value={formData.channel} 
                      onChange={(e) => setFormData({...formData, channel: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 h-12 rounded-2xl px-4 text-white font-medium focus:border-[#14B8A6] focus:ring-0 appearance-none"
                   >
                      <option value="email" className="bg-dark-100 text-white">E-mail</option>
                      <option value="in_app" className="bg-dark-100 text-white">Notificação no App PWA</option>
                      <option value="whatsapp" className="bg-dark-100 text-white">WhatsApp</option>
                      <option value="sms" className="bg-dark-100 text-white">SMS</option>
                   </select>
                 </div>
              </div>

              <div className="space-y-2">
                <Label className="uppercase text-[10px] font-black text-brand-orange-coral tracking-widest ml-1">Atraso Programado (Delay)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    required 
                    placeholder="2" 
                    value={formData.delayValue}
                    onChange={e => setFormData({ ...formData, delayValue: e.target.value })}
                    className="bg-brand-orange-coral/5 border-brand-orange-coral/20 h-12 rounded-2xl text-white font-black text-center w-24" 
                  />
                  <select 
                      value={formData.delayUnit} 
                      onChange={(e) => setFormData({...formData, delayUnit: e.target.value as any})}
                      className="flex-1 bg-white/5 border border-white/10 h-12 rounded-2xl px-4 text-white font-bold focus:border-brand-orange-coral focus:ring-0 appearance-none"
                   >
                      <option value="minutos" className="bg-dark-100 text-white">Minuto(s)</option>
                      <option value="horas" className="bg-dark-100 text-white">Hora(s)</option>
                      <option value="dias" className="bg-dark-100 text-white">Dia(s)</option>
                   </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-white/10 hover:bg-white/5 text-gray-400 h-12 rounded-2xl text-xs font-bold uppercase tracking-widest">
                  CANCELAR
                </Button>
                <Button type="submit" className="flex-[2] bg-[#14B8A6] hover:bg-teal-600 text-white font-black h-12 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-teal-500/20">
                  <Save className="w-4 h-4 mr-2" /> ATIVAR GATILHO
                </Button>
              </div>
           </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
