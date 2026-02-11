import { useState } from 'react';
import { 
  Check, 
  Star, 
  Zap, 
  Crown,
  ArrowRight,
  Shield,
  CreditCard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ticketTypes } from '@/data/eventData';

const trustBadges = [
  "Pagamento seguro",
  "Cancelamento até 30 dias",
  "Certificado garantido",
  "Suporte 24/7",
];

export function Inscricoes() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const getTicketIcon = (id: string) => {
    switch (id) {
      case 'standard':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <Star className="h-6 w-6" />;
      case 'vip':
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Inscrições
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Garanta sua vaga
            </h1>
            <p className="text-xl text-gray-400">
              Escolha a experiência ideal para você e faça parte do maior evento de Growth do Nordeste
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 border-y border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center text-gray-400">
                <Shield className="h-4 w-4 mr-2 text-teal-400" />
                <span className="text-sm">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {ticketTypes.map((ticket) => (
              <div
                key={ticket.id}
                className={`relative glass-card p-8 transition-all duration-300 ${
                  selectedTicket === ticket.id 
                    ? 'border-teal-500 ring-2 ring-teal-500/20' 
                    : 'hover:border-dark-300'
                } ${ticket.popular ? 'md:scale-105 md:-my-4' : ''}`}
                onClick={() => setSelectedTicket(ticket.id)}
              >
                {ticket.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white">
                    Mais Popular
                  </Badge>
                )}
                {ticket.limited && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white">
                    Apenas {ticket.limit} vagas
                  </Badge>
                )}
                
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  ticket.color === 'teal' ? 'bg-teal-500/20 text-teal-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {getTicketIcon(ticket.id)}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{ticket.name}</h3>
                <p className="text-gray-400 mb-6">{ticket.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    R$ {ticket.price.toLocaleString()}
                  </span>
                  {ticket.originalPrice && (
                    <span className="text-gray-500 line-through ml-2">
                      R$ {ticket.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {ticket.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-300">
                      <Check className="h-4 w-4 mr-3 text-teal-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    selectedTicket === ticket.id || ticket.popular
                      ? 'bg-teal-500 hover:bg-teal-600 text-white'
                      : 'bg-dark-100 hover:bg-dark-300 text-white border border-dark-300'
                  }`}
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Escolher este
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Dúvidas
            </Badge>
            <h2 className="text-3xl font-bold text-white">
              Perguntas frequentes
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "Posso cancelar minha inscrição?",
                a: "Sim, cancelamentos podem ser solicitados até 30 dias antes do evento com reembolso integral. Entre 30 e 7 dias, reembolso de 50%."
              },
              {
                q: "O que está incluído no ingresso?",
                a: "Todos os ingressos incluem acesso às palestras, coffee breaks, material do evento e certificado. Passes superiores incluem mentorias, almoço e outros benefícios."
              },
              {
                q: "Posso transferir meu ingresso?",
                a: "Sim, você pode transferir seu ingresso para outra pessoa até 7 dias antes do evento."
              },
              {
                q: "Haverá certificado?",
                a: "Sim, todos os participantes recebem certificado de participação digital após o evento."
              },
            ].map((item, i) => (
              <div key={i} className="glass-card p-6">
                <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                <p className="text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-orange-500/10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ainda tem dúvidas?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Nossa equipe está pronta para ajudar você a escolher a melhor opção
          </p>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-dark-300 text-gray-300 hover:text-white hover:border-teal-500"
          >
            Falar com organização
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
