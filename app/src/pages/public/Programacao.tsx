import { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Mic, 
  Wrench, 
  BookOpen,
  Coffee,
  PartyPopper,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { schedule } from '@/data/eventData';

const eventTypeIcons: Record<string, React.ElementType> = {
  keynote: Mic,
  workshop: Wrench,
  panel: Users,
  networking: Coffee,
  break: Coffee,
  tracks: BookOpen,
  mentoring: Users,
  social: PartyPopper,
};

const eventTypeLabels: Record<string, string> = {
  keynote: 'Palestra',
  workshop: 'Workshop',
  panel: 'Painel',
  networking: 'Networking',
  break: 'Intervalo',
  tracks: 'Trilhas',
  mentoring: 'Mentoria',
  social: 'Social',
};

const eventTypeColors: Record<string, string> = {
  keynote: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  workshop: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  panel: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  networking: 'bg-green-500/20 text-green-400 border-green-500/30',
  break: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  tracks: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  mentoring: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  social: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

interface EventItemProps {
  time: string;
  title: string;
  type: string;
  description?: string;
  speaker?: string | null;
}

function EventItem({ time, title, type, description, speaker }: EventItemProps) {
  const Icon = eventTypeIcons[type] || Clock;
  
  return (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-dark-100/50 transition-colors">
      <div className="flex-shrink-0 w-24 sm:w-32">
        <span className="text-teal-400 font-mono text-sm">{time}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Badge className={`${eventTypeColors[type]} text-xs`}>
            <Icon className="h-3 w-3 mr-1" />
            {eventTypeLabels[type]}
          </Badge>
          {speaker && (
            <span className="text-gray-500 text-sm">{speaker}</span>
          )}
        </div>
        
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        {description && (
          <p className="text-gray-400 text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}

export function Programacao() {
  const [activeTab, setActiveTab] = useState('day1');

  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Programação
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Agenda do Evento
            </h1>
            <p className="text-xl text-gray-400">
              Dois dias intensos de conteúdo, networking e oportunidades de aprendizado
            </p>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-dark-200 mb-8">
              <TabsTrigger 
                value="day1" 
                className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Dia 1 - 21/05
              </TabsTrigger>
              <TabsTrigger 
                value="day2"
                className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Dia 2 - 22/05
              </TabsTrigger>
            </TabsList>

            <TabsContent value="day1" className="mt-0">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-300">
                  <div>
                    <h2 className="text-xl font-bold text-white">Quinta-feira, 21 de maio</h2>
                    <p className="text-gray-400 text-sm">Dia de abertura e trilhas temáticas</p>
                  </div>
                  <Badge className="bg-teal-500/10 text-teal-400">
                    {schedule.day1.events.length} atividades
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {schedule.day1.events.map((event, index) => (
                    <EventItem
                      key={index}
                      time={event.time}
                      title={event.title}
                      type={event.type}
                      description={event.description}
                      speaker={event.speaker}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="day2" className="mt-0">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-300">
                  <div>
                    <h2 className="text-xl font-bold text-white">Sexta-feira, 22 de maio</h2>
                    <p className="text-gray-400 text-sm">Workshops, mentorias e encerramento</p>
                  </div>
                  <Badge className="bg-teal-500/10 text-teal-400">
                    {schedule.day2.events.length} atividades
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {schedule.day2.events.map((event, index) => (
                    <EventItem
                      key={index}
                      time={event.time}
                      title={event.title}
                      type={event.type}
                      description={event.description}
                      speaker={event.speaker}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Legend */}
      <section className="py-12 border-t border-dark-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg font-semibold text-white mb-6">Tipos de Atividade</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(eventTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center">
                <Badge className={`${eventTypeColors[type]} text-xs mr-2`}>
                  {label}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="py-12 lg:py-20 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 text-center">
              <Clock className="h-8 w-8 text-teal-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Horários</h3>
              <p className="text-gray-400 text-sm">
                O evento começa às 08:00 nos dois dias. Recomendamos chegar com 30 minutos de antecedência.
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <MapPin className="h-8 w-8 text-teal-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Local</h3>
              <p className="text-gray-400 text-sm">
                Boulevard Hotel, Juazeiro do Norte - CE. Estacionamento disponível para participantes.
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <Users className="h-8 w-8 text-teal-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Trilhas</h3>
              <p className="text-gray-400 text-sm">
                Escolha entre 5 trilhas temáticas. Algumas atividades acontecem em paralelo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
