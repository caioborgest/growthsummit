import { 
  Users, 
  Calendar, 
  Clock, 
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMentors, useMentoringSessions } from '@/hooks/useData';
import { MentorCard } from '@/components/growth-experience/MentorCard';
import { MentoriaMultiStepModal } from '@/components/forms/MentoriaMultiStepModal';
import { useState } from 'react';

const benefits = [
  "Sessões individuais de 20 minutos",
  "Mentores especialistas em suas áreas",
  "Agendamento flexível durante o evento",
  "Follow-up pós-mentoria disponível",
  "Ambiente privado e confidencial",
];

const howItWorks = [
  {
    step: 1,
    title: "Escolha seu mentor",
    description: "Navegue pelos perfis e escolha o especialista que melhor atende suas necessidades."
  },
  {
    step: 2,
    title: "Agende seu horário",
    description: "Selecione um horário disponível durante o evento que se encaixe na sua agenda."
  },
  {
    step: 3,
    title: "Prepare-se",
    description: "Defina seus objetivos e perguntas para aproveitar ao máximo os 20 minutos."
  },
  {
    step: 4,
    title: "Mentoria",
    description: "Encontre-se com seu mentor no local designado durante o evento."
  },
];

export function Mentorias() {
  const { data: mentorsData, isLoading: mentorsLoading } = useMentors();
  const { data: allSessions } = useMentoringSessions();
  const [modalAberto, setModalAberto] = useState(false);

  const approvedMentors = (mentorsData || []).filter(m => m.status === 'approved');

  return (
    <div className="bg-dark min-h-screen">
      <MentoriaMultiStepModal isOpen={modalAberto} onClose={() => setModalAberto(false)} />

      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Mentorias
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Mentorias 1:1
            </h1>
            <p className="text-xl text-gray-400">
              Sessões individuais com especialistas para acelerar seu crescimento
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 border-y border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center text-gray-300">
              <Users className="h-5 w-5 mr-2 text-teal-400" />
              <span>{approvedMentors.length || '30+'} mentores disponíveis</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Clock className="h-5 w-5 mr-2 text-teal-400" />
              <span>Sessões de 20 minutos</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Calendar className="h-5 w-5 mr-2 text-teal-400" />
              <span>Agendamento no evento</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Como Funciona
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Em 4 passos simples
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-400">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="py-20 lg:py-28 bg-dark-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Nossos Mentores
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Especialistas prontos para ajudar
            </h2>
          </div>
          
          {mentorsLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {approvedMentors.map((mentor) => {
                const mentorSlots = (allSessions || []).filter(s => 
                  s.mentorId === mentor.id && 
                  s.status === 'scheduled' && 
                  (!s.menteeId || s.menteeId === '00000000-0000-0000-0000-000000000000' || s.menteeName === 'Disponível' || s.menteeName === 'Slot Livre')
                );
                return (
                  <MentorCard 
                    key={mentor.id} 
                    mentor={mentor as any} 
                    availableSlots={mentorSlots}
                    onBookClick={() => setModalAberto(true)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Detail */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
                Benefícios
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Por que participar das mentorias?
              </h2>
              <p className="text-gray-400 mb-8">
                As mentorias 1:1 são uma das experiências mais valiosas do Growth Summit. 
                Você terá acesso direto a especialistas que já passaram pelos desafios 
                que você enfrenta hoje.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="glass-card p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Quantas mentorias você recebe?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-100 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Passe Standard</p>
                    <p className="text-gray-400 text-sm">1 mentoria (sorteio)</p>
                  </div>
                  <span className="text-teal-400 font-bold">1</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-dark-100 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Passe Pro</p>
                    <p className="text-gray-400 text-sm">2 mentorias garantidas</p>
                  </div>
                  <span className="text-teal-400 font-bold">2</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Growth Experience</p>
                    <p className="text-gray-400 text-sm">2 mentorias premium + follow-up</p>
                  </div>
                  <span className="text-teal-400 font-bold">2+</span>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white">
                Ver opções de ingresso
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-orange-500/10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Quer ser mentor?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Se você é especialista em growth, marketing, vendas ou IA, 
            junte-se ao nosso time de mentores.
          </p>
          
          <Button 
            size="lg" 
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            Candidate-se como mentor
          </Button>
        </div>
      </section>
    </div>
  );
}
