import React, { useState } from 'react';
import { 
  Award, 
  User, 
  Calendar, 
  Type, 
  CheckCircle2,
  Search,
  Loader2
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredInscricoes = registrations.filter(r => 
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
      
      const { error } = await supabase
        .from('certificates' as any)
        .insert({
          registration_id: selectedRegId,
          project_id: projectId,
          activity_name: activityName,
          type: type,
          code: code,
          issue_date: new Date().toISOString(),
          status: 'issued',
          metadata: { manual: true, issued_by: 'admin' }
        } as any);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-dark-200 border-dark-300 rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/5">
          <DialogTitle className="text-xl font-black text-white flex items-center gap-3">
            <Award className="h-6 w-6 text-teal-400" />
            Emissão Manual
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Emita um certificado avulso para um participante específico.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
              <Search className="h-3 w-3" /> Buscar Participante
            </label>
            <Input 
              placeholder="Nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-100 border-dark-400 text-white"
            />
            {searchTerm && (
              <div className="bg-dark-300 rounded-xl border border-white/5 overflow-hidden">
                {filteredInscricoes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                        setSelectedRegId(r.id);
                        setSearchTerm('');
                    }}
                    className={`w-full p-3 text-left hover:bg-teal-500/10 flex items-center justify-between transition-colors ${selectedRegId === r.id ? 'bg-teal-500/20' : ''}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{r.name}</p>
                      <p className="text-[10px] text-gray-500">{r.email}</p>
                    </div>
                    {selectedRegId === r.id && <CheckCircle2 className="h-4 w-4 text-teal-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedRegId && (
            <div className="bg-teal-500/5 p-4 rounded-2xl border border-teal-500/20 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <User className="text-teal-400 h-5 w-5" />
               </div>
               <div>
                  <p className="text-xs text-teal-400 font-black uppercase tracking-widest">Selecionado</p>
                  <p className="text-white font-bold">{registrations.find(r => r.id === selectedRegId)?.name}</p>
               </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                <Type className="h-3 w-3" /> Nome da Atividade
              </label>
              <Input 
                value={activityName}
                onChange={e => setActivityName(e.target.value)}
                className="bg-dark-100 border-dark-400 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Tipo de Certificado
              </label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-dark-100 border border-dark-400 rounded-lg p-2 text-white text-sm"
              >
                <option value="event">Evento Completo</option>
                <option value="course">Curso / Workshop</option>
                <option value="lecture">Palestra Individual</option>
                <option value="mentoria">Mentoria</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-dark-300 border-t border-white/5">
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedRegId || isSubmitting}
            className="bg-teal-500 hover:bg-teal-600 text-white font-black px-8"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Confirmar Emissão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
