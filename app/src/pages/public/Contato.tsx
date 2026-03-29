import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Instagram,
  Linkedin,
  MessageCircle,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { EVENT_CONFIG } from '@/config/eventConfig';

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "projetos@cbxgrowth.com.br",
    href: "projetos@cbxgrowth.com.bre"
  },
  {
    icon: Phone,
    title: "WhatsApp",
    value: EVENT_CONFIG.whatsapp.display,
    href: `https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${encodeURIComponent(EVENT_CONFIG.whatsapp.message)}`
  },
  {
    icon: MapPin,
    title: "Localização",
    value: "Sertão do Pajeú, PE",
    href: "#"
  },
  {
    icon: Clock,
    title: "Atendimento",
    value: "Seg-Sex: 9h às 18h",
    href: "#"
  },
];

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/growthexperience2026/' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/caioborgesgrowth/' },
];

const departments = [
  { value: 'geral', label: 'Geral' },
  { value: 'inscricoes', label: 'Inscrições' },
  { value: 'patrocinio', label: 'Patrocínio' },
  { value: 'palestrantes', label: 'Palestrantes' },
  { value: 'expansao', label: 'Expansão / Novas Cidades' },
  { value: 'imprensa', label: 'Imprensa' },
  { value: 'suporte', label: 'Suporte Técnico' },
];

export function Contato() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'geral',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Em desenvolvimento (localhost), as Edge Functions são bloqueadas por CORS.
      // Redirecionar para WhatsApp como fallback.
      if (!import.meta.env.PROD) {
        const msg = encodeURIComponent(`Olá! Mensagem de contato via site:\n\nNome: ${formData.name}\nEmail: ${formData.email}\nAssunto: ${formData.subject}\n\n${formData.message}`);
        window.open(`https://wa.me/${EVENT_CONFIG.whatsapp.number}?text=${msg}`, '_blank');
        toast.success('Redirecionando para WhatsApp (modo desenvolvimento)');
        setFormData({ name: '', email: '', department: 'geral', subject: '', message: '' });
        return;
      }

      toast.loading('Enviando mensagem...');
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'suporte@growthsummit.site',
          subject: `Formulário de Contato: ${formData.subject} [${formData.department}]`,
          html: `
            <h3>Nova mensagem de contato</h3>
            <p><strong>Nome:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Departamento:</strong> ${formData.department}</p>
            <hr/>
            <p>${formData.message.replace(/\n/g, '<br/>')}</p>
          `,
          from: `Growth Site <${formData.email}>`
        }
      });

      if (error) throw error;

      toast.dismiss();
      toast.success('Mensagem enviada com sucesso!');
      setFormData({ name: '', email: '', department: 'geral', subject: '', message: '' });
    } catch (err: unknown) {
      toast.dismiss();
      const error = err as Error;
      toast.error('Erro ao enviar mensagem: ' + error.message);
    }
  };

  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Contato
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Fale com a gente
            </h1>
            <p className="text-xl text-gray-400">
              Estamos aqui para ajudar. Entre em contato por qualquer canal.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 border-y border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="glass-card p-6 hover:border-teal-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-teal-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">{item.title}</h3>
                <p className="text-white">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Social */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Envie uma mensagem
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nome
                    </label>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Departamento
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Assunto
                    </label>
                    <Input
                      type="text"
                      placeholder="Assunto da mensagem"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Mensagem
                  </label>
                  <Textarea
                    placeholder="Como podemos ajudar?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-dark-100 border-dark-300 text-white placeholder:text-gray-500 min-h-[150px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Enviar mensagem
                </Button>
              </form>
            </div>

            {/* Social & Chat */}
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Redes sociais
                </h2>
                <p className="text-gray-400 mb-6">
                  Siga-nos nas redes sociais para ficar por dentro das novidades,
                  bastidores e conteúdos exclusivos.
                </p>

                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-12 h-12 rounded-lg bg-dark-100 flex items-center justify-center text-gray-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                      aria-label={social.name}
                    >
                      <social.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Chat ao vivo
                </h2>
                <p className="text-gray-400 mb-6">
                  Precisa de ajuda imediata? Nosso time de suporte está online
                  para responder suas dúvidas em tempo real.
                </p>

                <Button
                  variant="outline"
                  className="w-full border-teal-500 text-teal-400 hover:bg-teal-500/10"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Iniciar chat
                </Button>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-4">
                  Emails específicos
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Geral</span>
                    <a href="mailto:projetos@cbxgrowth.com.br" className="text-teal-400 hover:underline text-sm">
                      contato@
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card overflow-hidden">
            <div className="aspect-[21/9] w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.1234567890123!2d-39.3156789!3d-7.2134567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTInNDguNCJTIDM5wrAxOCc1Ni40Ilc!5e0!3m2!1spt-BR!2sbr!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Local do Evento"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
