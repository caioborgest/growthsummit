import { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  QrCode,
  UserPlus,
  Mail,
  Phone,
  CreditCard,
  Briefcase,
  X,
  Download,
  CheckCircle2,
  Clock,
  Shield,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  Type,
  Search,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePartnerTeam } from '@/hooks/useData';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import QRCode from 'qrcode';

interface PartnerTeamModalProps {
  partner: any;
  onClose: () => void;
}

export function PartnerTeamModal({ partner, onClose }: PartnerTeamModalProps) {
  const { data: allTeamMembers, create, remove, isLoading } = usePartnerTeam();
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedMemberForQR, setSelectedMemberForQR] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    role: '',
  });

  const teamMembers = useMemo(() => {
    return allTeamMembers.filter(m => m.partnerId === partner.id);
  }, [allTeamMembers, partner.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const qrCode = `GE-PARTNER|${partner.id}|${Date.now()}`;
      await create({
        ...formData,
        partnerId: partner.id,
        projectId: partner.projectId,
        qrCode,
        checkedIn: false,
      } as any);
      toast.success('Membro da equipe adicionado!');
      setIsAddMode(false);
      setFormData({ name: '', email: '', phone: '', cpf: '', role: '' });
    } catch (err) {
      logger.error('Erro ao adicionar membro da equipe:', err);
      toast.error('Erro ao adicionar membro');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remover este membro da equipe?')) {
      try {
        await remove(id);
        toast.success('Membro removido');
      } catch (err) {
        logger.error('Erro ao remover membro:', err);
        toast.error('Erro ao remover membro');
      }
    }
  };

  const generateQR = async (member: any) => {
    try {
      const url = await QRCode.toDataURL(member.qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(url);
      setSelectedMemberForQR(member);
    } catch (err) {
      logger.error('Erro ao gerar QR Code:', err);
      toast.error('Erro ao gerar QR Code');
    }
  };

  const downloadQR = () => {
    if (!qrCodeDataUrl || !selectedMemberForQR) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `QR_PARCEIRO_${selectedMemberForQR.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="admin-modal-content max-w-2xl bg-[#0c0e12] border-none p-0 overflow-hidden shadow-2xl">
        <div className="admin-modal-header">
          <div>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
              <Users className="h-7 w-7 text-brand-orange-coral" />
              Equipe: <span className="text-brand-orange-coral">{partner.name}</span>
            </DialogTitle>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
              {isAddMode ? 'Cadastrar novo colaborador' : selectedMemberForQR ? 'Visualização de Credencial' : 'Gerencie os membros da equipe'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isAddMode && !selectedMemberForQR && (
              <Button
                onClick={() => setIsAddMode(true)}
                className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black h-10 px-6 rounded-xl text-[10px] uppercase tracking-widest"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                ADICIONAR
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="admin-modal-body">
          {selectedMemberForQR ? (
            <div className="flex flex-col items-center justify-center gap-8 py-10 animate-in fade-in zoom-in-95 duration-300">
               <div className="p-8 bg-white rounded-[3rem] shadow-2xl shadow-brand-orange-coral/20 border-8 border-white/5">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-56 h-56 object-contain" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{selectedMemberForQR?.name}</h3>
                <p className="text-xs font-bold text-brand-orange-coral uppercase tracking-[0.3em]">{selectedMemberForQR?.role}</p>
                <div className="pt-4">
                   <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] mb-2">CÓDIGO DE ACESSO</p>
                   <p className="text-white font-mono text-xl bg-white/5 px-6 py-2 rounded-xl border border-white/10">{selectedMemberForQR?.qrCode?.split('|').pop()}</p>
                </div>
              </div>
            </div>
          ) : isAddMode ? (
            <form id="add-member-form" onSubmit={handleSubmit} className="space-y-8 py-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nome Completo *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 h-12 text-white font-bold"
                    placeholder="Nome do colaborador"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Cargo / Função *</Label>
                  <Input
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-white/5 border-white/10 h-12 text-white font-bold"
                    placeholder="Ex: Supervisor, Staff"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 md:col-span-1">
                  <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">E-mail</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/10 h-12 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/5 border-white/10 h-12 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">CPF / Doc</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="bg-white/5 border-white/10 h-12 text-white"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              {teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5">
                  <Users className="h-12 w-12 text-gray-700" />
                  <div>
                    <p className="text-white font-bold italic uppercase tracking-tight">Nenhum membro cadastrado</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Adicione colaboradores para esta empresa.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 text-brand-orange-coral flex items-center justify-center font-black italic border border-brand-orange-coral/20 group-hover:scale-110 transition-transform">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black italic uppercase tracking-tight text-white">{member.name}</h4>
                            <Badge className="bg-white/5 text-gray-500 border-none text-[8px] font-black uppercase h-4 px-2 tracking-widest">
                              {member.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase text-gray-700 flex items-center gap-1"><Mail className="h-3 w-3" /> {member.email || '—'}</span>
                            <span className="text-[9px] font-black uppercase text-gray-700 flex items-center gap-1"><CreditCard className="h-3 w-3" /> {member.cpf || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => generateQR(member)}
                          className="w-10 h-10 bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white rounded-xl border border-teal-500/20 transition-all"
                        >
                          <QrCode className="h-5 w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(member.id)}
                          className="w-10 h-10 bg-red-500/10 text-red-500/50 hover:text-white hover:bg-red-500 rounded-xl border border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="admin-modal-footer">
          {selectedMemberForQR ? (
            <>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedMemberForQR(null)} 
                className="text-gray-400 hover:text-white font-bold h-12 px-8 rounded-xl border border-white/5"
              >
                VOLTAR
              </Button>
              <Button 
                onClick={downloadQR}
                className="bg-teal-500 hover:bg-teal-600 text-white font-black px-10 h-12 rounded-xl shadow-glow-teal flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                BAIXAR QR CODE
              </Button>
            </>
          ) : isAddMode ? (
            <>
              <Button 
                variant="ghost" 
                onClick={() => setIsAddMode(false)}
                className="text-gray-400 hover:text-white font-bold h-12 px-8 rounded-xl border border-white/5"
              >
                CANCELAR
              </Button>
              <Button 
                type="submit"
                form="add-member-form"
                disabled={isLoading}
                className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-10 h-12 rounded-xl shadow-xl shadow-brand-orange-coral/20"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'CONFIRMAR CADASTRO'}
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-400 hover:text-white font-bold h-12 px-8 rounded-xl border border-white/5"
            >
              FECHAR PAINEL
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
