import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Send, 
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EVENT_CONFIG } from '@/config/eventConfig';

export function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de envio
    alert('Sua mensagem foi enviada com sucesso! Logo entraremos em contato.');
  };

  return (
    <div className="bg-brand-grafite min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="py-20 lg:py-32 relative text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[400px] bg-brand-orange/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6 relative z-10">
          <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-6 py-2 rounded-full font-black tracking-widest uppercase text-[10px]">
            CANAIS DE ATENDIMENTO
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
            VAMOS <span className="text-brand-orange text-transparent bg-clip-text bg-[image:var(--brand-gradient)]">CONVERSAR</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Tem dúvidas sobre inscrições, parcerias ou deseja levar o GX para sua cidade? 
            Escolha o melhor canal e fale conosco.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Info Column */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">CONTATO DIRETO</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                 <a 
                   href={`https://wa.me/${EVENT_CONFIG.whatsapp.number}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] group hover:border-brand-orange/30 transition-all"
                 >
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <MessageCircle className="h-6 w-6 text-brand-orange" />
                    </div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">WhatsApp</p>
                    <p className="text-white font-bold text-lg">{EVENT_CONFIG.whatsapp.display}</p>
                 </a>
                 <a 
                   href={`mailto:${EVENT_CONFIG.email}`}
                   className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] group hover:border-brand-orange/30 transition-all"
                 >
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Mail className="h-6 w-6 text-brand-orange" />
                    </div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-white font-bold text-base truncate">{EVENT_CONFIG.email}</p>
                 </a>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">BASE DE OPERAÇÕES</h2>
              <div className="space-y-6">
                 {[
                   { icon: MapPin, title: 'Presença Regional', desc: 'Edições em Triunfo, Petrolina e Juazeiro do Norte.' },
                   { icon: Clock, title: 'Atendimento', desc: 'Segunda a Sexta, das 09h às 18h.' },
                   { icon: CheckCircle2, title: 'Suporte VIP', desc: 'Canal exclusivo para patrocinadores e mentores.' }
                 ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 shrink-0 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-gray-500" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-white font-bold">{item.title}</h4>
                          <p className="text-gray-500 font-medium">{item.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="relative">
            <div className="absolute inset-0 bg-brand-orange/5 blur-[80px] rounded-full -z-10" />
            <form 
              onSubmit={handleSubmit}
              className="bg-white/5 border border-white/10 p-8 lg:p-12 rounded-[3.5rem] space-y-8 backdrop-blur-md"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-14 text-white focus:border-brand-orange transition-all outline-none"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Executivo</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-14 text-white focus:border-brand-orange transition-all outline-none"
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Assunto</label>
                 <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 h-14 text-white focus:border-brand-orange transition-all outline-none appearance-none">
                    <option value="inscricoes" className="bg-brand-grafite">Inscrições e Ingressos</option>
                    <option value="parcerias" className="bg-brand-grafite">Parcerias e Patrocínio</option>
                    <option value="imprensa" className="bg-brand-grafite">Imprensa / Divulgação</option>
                    <option value="expansao" className="bg-brand-grafite">Expansão / Levar o GX para minha cidade</option>
                    <option value="outros" className="bg-brand-grafite">Outros Assuntos</option>
                 </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Sua Mensagem</label>
                <textarea 
                  rows={5}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white focus:border-brand-orange transition-all outline-none resize-none"
                  placeholder="Como podemos ajudar você ou sua empresa?"
                />
              </div>

              <Button type="submit" className="w-full bg-[image:var(--brand-gradient)] hover:brightness-110 text-white font-black py-8 rounded-2xl text-lg shadow-2xl flex gap-3 group">
                 ENVIAR MENSAGEM
                 <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
