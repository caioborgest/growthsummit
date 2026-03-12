import React, { useState } from 'react';
import { 
  Award, 
  User, 
  Calendar, 
  Type, 
  CheckCircle2,
  Search,
  Loader2,
  Settings,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import { useRegistrations } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ManualCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

export function ManualCertificateModal({ isOpen, onClose, projectId, onSuccess }: ManualCertificateModalProps) {
  const { data: registrations } = useRegistrations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [activityName, setActivityName] = useState('Participação Geral');
  const [type, setType] = useState('event');
  const [totalHours, setTotalHours] = useState(8);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Overrides
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const filteredInscricoes = (registrations || []).filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async () => {
    if (!selectedRegId || !projectId) {
      toast.error('Selecione um participante');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const payload = {
        registration_id: selectedRegId,
        user_id: selectedUser?.userId,
        project_id: projectId,
        activity_name: activityName,
        type: type,
        code: code,
        issue_date: new Date(issueDate).toISOString(),
        status: 'issued',
        metadata: { 
          manual: true, 
          issued_by: 'admin',
          total_hours: totalHours,
          overrides: {
            title: customTitle || undefined,
            description: customDescription || undefined
          }
        }
      };

      const { error } = await supabase
        .from('certificates' as any)
        .insert(payload as any);

      if (error) throw error;

      toast.success('Certificado emitido com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao emitir certificado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUser = registrations?.find(r => r.id === selectedRegId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-dark-200 border border-white/5 rounded-3xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 border-b border-white/5 bg-gradient-to-r from-brand-orange-coral/5 to-transparent">
          <DialogTitle className="text-2xl font-black text-white flex items-center gap-4">
            <Award className="h-8 w-8 text-brand-orange-coral" />
            Emissão Personalizada
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            Configure e emita um certificado exclusivo para o participante.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-8 space-y-8">
            {/* Busca de Participante */}
            <div className="space-y-4">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                <Search className="h-3 w-3" /> Localizar Participante
              </label>
              <Input 
                placeholder="Ex: Caio Diniz ou caio@growth.com"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-100 border-none h-12 text-white placeholder:text-gray-700"
              />
              {searchTerm && filteredInscricoes.length > 0 && (
                <div className="bg-dark-300 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                  {filteredInscricoes.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                          setSelectedRegId(r.id);
                          setSearchTerm('');
                      }}
                      className={`w-full p-4 text-left hover:bg-brand-orange-coral/10 flex items-center justify-between transition-colors border-b border-white/5 last:border-0 ${selectedRegId === r.id ? 'bg-brand-orange-coral/20' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{r.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{r.email}</p>
                        </div>
                      </div>
                      {selectedRegId === r.id && <CheckCircle2 className="h-5 w-5 text-brand-orange-coral" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedRegId && (
              <div className="bg-brand-orange-coral/5 p-6 rounded-3xl border border-brand-orange-coral/20 flex items-center gap-5 animate-in fade-in slide-in-from-top-4">
                 <div className="w-14 h-14 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                    <User className="text-brand-orange-coral h-7 w-7" />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] text-brand-orange-coral font-black uppercase tracking-widest mb-1">Participante Selecionado</p>
                    <p className="text-xl text-white font-black tracking-tight truncate">{selectedUser?.name}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{selectedUser?.email}</p>
                 </div>
              </div>
            )}

            {/* Configurações da Atividade */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                  <Type className="h-3 w-3" /> Atividade
                </label>
                <Input 
                  value={activityName}
                  onChange={e => setActivityName(e.target.value)}
                  className="bg-dark-100 border-none h-12 text-white font-bold"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Carga Horária
                </label>
                <Input 
                  type="number"
                  value={totalHours}
                  onChange={e => setTotalHours(parseInt(e.target.value))}
                  className="bg-dark-100 border-none h-12 text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Data de Emissão
              </label>
              <Input 
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="bg-dark-100 border-none h-12 text-white font-bold [color-scheme:dark]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Modalidade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['event', 'course', 'lecture', 'workshop', 'oficina'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-brand-orange-coral border-brand-orange-coral text-white shadow-lg shadow-brand-orange-coral/20' : 'bg-dark-100 border-white/5 text-gray-500 hover:border-white/20'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Opções Avançadas (Texto Editado) */}
            <div className="pt-4 pb-6">
              <button 
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-brand-orange-coral text-xs font-black uppercase tracking-widest hover:text-brand-orange-gradient transition-colors"
              >
                <Settings className={`h-4 w-4 ${showAdvanced ? 'rotate-90' : ''} transition-transform`} />
                Opções de Conteúdo Editável
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2">
                   <div className="space-y-3">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Título Customizado (Ex: MENÇÃO HONROSA)</label>
                    <Input 
                      placeholder="Deixe em branco para usar o padrão"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      className="bg-dark-100 border-none h-12 text-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Descrição Customizada para este Certificado</label>
                    <textarea
                      rows={4}
                      placeholder="Deixe em branco para usar a descrição do projeto..."
                      value={customDescription}
                      onChange={e => setCustomDescription(e.target.value)}
                      className="w-full bg-dark-100 border-none rounded-2xl p-4 text-white text-sm resize-none focus:ring-2 focus:ring-brand-orange-coral"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-8 bg-dark-300 border-t border-white/5">
          <Button variant="ghost" type="button" onClick={onClose} className="text-gray-400 hover:text-white font-bold h-14 px-8 rounded-2xl border-white/5 border">Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedRegId || isSubmitting}
            className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-12 h-14 rounded-2xl shadow-xl shadow-brand-orange-coral/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Emitir Certificado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
