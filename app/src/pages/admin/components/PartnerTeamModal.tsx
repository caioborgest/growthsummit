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
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="bg-[#0c0e12] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="border-b border-white/5 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                Equipe: <span className="text-brand-orange-coral">{partner.name}</span>
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Gerencie os membros da equipe que terão acesso ao evento.
              </DialogDescription>
            </div>
            {!isAddMode && (
              <Button
                onClick={() => setIsAddMode(true)}
                className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black px-6 rounded-xl"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            )}
          </div>
        </DialogHeader>

        {isAddMode ? (
          <form onSubmit={handleSubmit} className="space-y-6 py-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-gray-500">Nome Completo *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 shadow-inner"
                  placeholder="Nome do colaborador"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-gray-500">Cargo / Função *</Label>
                <Input
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-white/5 border-white/10 shadow-inner"
                  placeholder="Ex: Supervisor, Staff, Montagem"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-gray-500">E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-gray-500">Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-gray-500">CPF (Para credenciamento)</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="bg-white/5 border-white/10 shadow-inner"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={() => setIsAddMode(false)} className="text-gray-500 font-bold">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black px-10 rounded-xl">
                {isLoading ? 'Salvando...' : 'Confirmar Adição'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-6 min-h-[300px]">
            {teamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 border-2 border-dashed border-white/5 rounded-3xl">
                <UserPlus className="h-12 w-12 mb-4" />
                <p className="text-lg font-black uppercase tracking-tighter">Nenhum membro cadastrado</p>
                <p className="text-sm font-medium">Adicione membros para gerar os QR Codes de acesso.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-center gap-4 group shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/10 text-brand-orange-coral flex items-center justify-center font-black">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white truncate">{member.name}</h4>
                        <Badge variant="outline" className="text-[9px] py-0 h-4 border-white/10 text-gray-400">
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 opacity-60">
                        <span className="text-[10px] flex items-center gap-1"><Mail className="h-3 w-3" /> {member.email || 'n/a'}</span>
                        <span className="text-[10px] flex items-center gap-1"><CreditCard className="h-3 w-3" /> {member.cpf || 'n/a'}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => generateQR(member)}
                        className="w-9 h-9 border border-white/10 rounded-lg hover:bg-white/5 text-brand-orange-coral"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(member.id)}
                        className="w-9 h-9 border border-white/10 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"
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

        {/* QR Code Viewer Modal */}
        <Dialog open={!!selectedMemberForQR} onOpenChange={() => setSelectedMemberForQR(null)}>
          <DialogContent className="bg-white text-black max-w-sm p-8 rounded-[2rem] overflow-hidden border-none text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-full flex justify-between items-center px-2">
                <img src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png" className="h-6" alt="Logo" />
                <Badge className="bg-black text-white border-none py-1 px-3 text-[10px] font-black italic">CREDENCIAL PARCEIRO</Badge>
              </div>
              
              <div className="w-full aspect-square border-4 border-black p-4 rounded-3xl bg-white shadow-xl">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              </div>
              
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">{selectedMemberForQR?.name}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{selectedMemberForQR?.role}</p>
                <p className="text-[10px] font-black text-brand-orange-coral mt-4 uppercase">Growth Experience 2026</p>
              </div>

              <div className="w-full flex flex-col gap-2 pt-4">
                <Button onClick={downloadQR} className="w-full bg-black text-white hover:bg-gray-900 font-bold rounded-2xl h-12 shadow-lg">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR Code
                </Button>
                <Button variant="ghost" onClick={() => setSelectedMemberForQR(null)} className="text-gray-400 text-xs font-bold">
                  Sair
                </Button>
              </div>
            </div>
            {/* Design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-teal-coral/10 rounded-full blur-3xl -z-10" />
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
