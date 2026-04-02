import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Building2,
  Paperclip,
  Smile
} from 'lucide-react';
import { useB2BChat } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface B2BChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  otherCompany: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

export function B2BChatModal({ isOpen, onClose, matchId, otherCompany }: B2BChatModalProps) {
  const { user } = useAuth();
  const { messages, create, isLoading } = useB2BChat(matchId);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await create({
        matchId,
        senderId: user.id,
        content: newMessage.trim(),
        projectId: (messages[0]?.projectId) || (window as any).selectedProject?.id || '',
      } as any);
      setNewMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar mensagem');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 bg-dark-200 border-dark-300 rounded-3xl overflow-hidden">
        <DialogHeader className="p-4 border-b border-dark-300 flex flex-row items-center gap-4 space-y-0">
          <div className="w-10 h-10 rounded-xl bg-dark-300 p-1 flex items-center justify-center border border-white/5">
            {otherCompany.logoUrl ? (
              <img src={otherCompany.logoUrl} alt={otherCompany.name} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="text-teal-400 w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <DialogTitle className="text-white text-base font-black uppercase tracking-tight">
              {otherCompany.name}
            </DialogTitle>
            <DialogDescription className="text-teal-400 text-[10px] font-black uppercase tracking-widest leading-none">
              Chat B2B Online
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 bg-dark-100/50">
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-dark-200 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <MessageSquare className="text-gray-600 h-8 w-8" />
                </div>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Inicie a conversa!</p>
                <p className="text-gray-600 text-[10px] mt-1">Envie uma mensagem para {otherCompany.name}</p>
              </div>
            )}
            
            {messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    isMine 
                      ? 'bg-teal-500 text-white rounded-tr-none shadow-lg shadow-teal-500/10' 
                      : 'bg-dark-300 text-gray-200 rounded-tl-none border border-white/5'
                  }`}>
                    <p className="font-medium mb-1">{msg.content}</p>
                    <p className={`text-[9px] font-black uppercase tracking-tighter ${isMine ? 'text-teal-100' : 'text-gray-500'}`}>
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="p-4 bg-dark-200 border-t border-dark-300">
          <div className="flex items-center gap-2 bg-dark-300 p-2 rounded-2xl border border-white/5 focus-within:border-teal-500/50 transition-all">
            <button type="button" className="p-2 text-gray-500 hover:text-teal-400 transition-colors">
              <Smile className="h-5 w-5" />
            </button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-gray-600 h-10 px-0"
            />
            <button type="button" className="p-2 text-gray-500 hover:text-teal-400 transition-colors hidden sm:block">
              <Paperclip className="h-5 w-5" />
            </button>
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isLoading}
              className="bg-teal-500 hover:bg-teal-400 text-white p-2 h-10 w-10 rounded-xl shadow-lg shadow-teal-500/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
