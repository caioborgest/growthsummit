import { useState } from 'react';
import { Users, Star, Calendar, Award, CheckCircle, ArrowRight, Lightbulb, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { mentorService } from '@/services/mentorService';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export function SejaMentor() {
  const { projectId } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    expertise: '',
    bio: '',
    linkedin: '',
    photo: null as File | null,
    photoPreview: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    if (!projectId) {
      toast.error('Nenhum projeto selecionado. Selecione um evento no topo da página.');
      return;
    }

    setIsSubmitting(true);
    try {
      let photoUrl = '';

      // 1. Upload da foto se houver
      if (formData.photo) {
        const file = formData.photo;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `candidaturas_mentores/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);

        if (uploadError) {
          logger.error('Erro no upload da foto do mentor:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('event-images')
            .getPublicUrl(filePath);
          photoUrl = urlData.publicUrl;
        }
      }

      // 2. Enviar candidatura
      await mentorService.apply({
        projectId,
        nome: formData.name,
        email: formData.email,
        telefone: formData.phone,
        empresa: formData.company,
        cargo: formData.position,
        especialidades: formData.expertise.split(',').map(s => s.trim()),
        bio: formData.bio || formData.expertise,
        linkedinUrl: formData.linkedin,
        fotoUrl: photoUrl
      });

      toast.success('Sua candidatura foi enviada com sucesso! Analisaremos seu perfil e entraremos em contato.');

      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        expertise: '',
        bio: '',
        linkedin: '',
        photo: null,
        photoPreview: ''
      });
    } catch (error: any) {
      logger.error('Erro ao enviar candidatura de mentor:', error);
      toast.error('Erro ao enviar candidatura: ' + (error.message || 'Erro de conexão'));
    } finally {
      setIsSubmitting(false);
    }
  };
  const benefits = [
    {
      icon: Users,
      title: 'Networking Premium',
      description: 'Conecte-se com outros líderes e especialistas da região.',
    },
    {
      icon: Star,
      title: 'Reconhecimento',
      description: 'Seu perfil destacado nos materiais oficiais do evento.',
    },
    {
      icon: TrendingUp,
      title: 'Gerar Oportunidades',
      description: 'Aumente sua visibilidade e gere leads qualificados.',
    },
    {
      icon: Lightbulb,
      title: 'Impacto Real',
      description: 'Contribua para o desenvolvimento de novos negócios.',
    },
  ];

  const requirements = [
    'Mínimo 5 anos de experiência na sua área de atuação',
    'Disponibilidade para realizar até 5 mentorias durante o evento',
    'Experiência comprovada em gestão, empreendedorismo ou tecnologia',
    'Desejo genuíno de compartilhar conhecimento e ajudar outros',
    'Presença no evento nos dias 21 e 22 de maio de 2026',
  ];

  return (
    <div className="bg-dark min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              <Users className="h-3 w-3 mr-1" />
              Seja um Mentor
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Compartilhe seu <span className="text-teal-400">Conhecimento</span>
            </h1>
            <p className="text-xl text-gray-400">
              Junte-se ao time de mentores do Growth Summit 2026 e ajude a transformar
              negócios e carreiras no maior evento de Growth do Nordeste.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Por que ser Mentor?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Ser mentor no Growth Summit é uma oportunidade única de impactar
              empreendedores e profissionais em crescimento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <Card key={i} className="bg-dark-200 border-dark-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              <Calendar className="h-3 w-3 mr-1" />
              Como Funciona
            </Badge>
            <h2 className="text-3xl font-bold text-white">
              O Processo de Mentoria
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Inscrição', desc: 'Preencha o formulário de candidatura' },
              { step: '02', title: 'Seleção', desc: 'Avaliaremos seu perfil e experiência' },
              { step: '03', title: 'Match', desc: 'Conectamos você com participantes' },
              { step: '04', title: 'Mentoria', desc: 'Realize sessões de 25 minutos no evento' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Requirements */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Requisitos
          </h2>
          <div className="space-y-4">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-teal-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300">{req}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-teal-500/10 rounded-xl border border-teal-500/30">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Award className="h-5 w-5 mr-2 text-teal-400" />
              Certificado de Participação
            </h3>
            <p className="text-gray-400 text-sm">
              Todos os mentores recebem certificado de participação e destaque
              especial nos materiais de comunicação do evento.
            </p>
          </div>
        </div>

        {/* Form */}
        <div>
          <Card className="bg-dark-200 border-dark-300">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Candidate-se como Mentor
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Foto de Perfil */}
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-dark-100 border-2 border-dashed border-dark-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-teal-500/50">
                      {formData.photoPreview ? (
                        <img src={formData.photoPreview} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <Users className="h-10 w-10 text-gray-500" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-teal-500 rounded-full cursor-pointer shadow-lg hover:bg-teal-600 transition-colors">
                      <TrendingUp className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({
                              ...formData,
                              photo: file,
                              photoPreview: URL.createObjectURL(file)
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">Foto de Identificação *</p>
                    <p className="text-xs text-gray-500">Obrigatória para visualização no evento</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Nome Completo *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-dark-100 border-dark-300 text-white mt-1"
                    placeholder="Seu nome"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Email *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white mt-1"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Telefone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white mt-1"
                      placeholder="(88) 98843-2310"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Empresa *</Label>
                    <Input
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white mt-1"
                      placeholder="Onde trabalha"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Cargo *</Label>
                    <Input
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white mt-1"
                      placeholder="Seu cargo"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Áreas de Especialidade *</Label>
                  <Input
                    required
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    className="bg-dark-100 border-dark-300 text-white mt-1"
                    placeholder="Ex: Growth, Marketing, Vendas, Produto..."
                  />
                </div>

                <div>
                  <Label className="text-gray-300">LinkedIn (Opcional)</Label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="bg-dark-100 border-dark-300 text-white mt-1"
                    placeholder="linkedin.com/in/seuperfil"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-6"
                >
                  Enviar Candidatura
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-gray-500 text-xs text-center">
                  Nossa equipe analisará sua candidatura e entrará em contato em até 5 dias úteis.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
