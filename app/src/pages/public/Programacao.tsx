import React, { useState, useEffect } from 'react';
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
import { useSessions } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';

const eventTypeIcons: Record<string, React.ElementType> = {
  keynote: Mic,
  talk: Mic,
  workshop: Wrench,
  panel: Users,
  networking: Coffee,
  break: Coffee,
  tracks: BookOpen,
  mentoring: Users,
  social: PartyPopper,
};

const eventTypeLabels: Record<string, string> = {
  keynote: 'Keynote',
  talk: 'Palestra',
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
  talk: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
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
  speaker?: string | string[] | null;
}

function EventItem({ time, title, type, description, speaker }: EventItemProps) {
  const Icon = eventTypeIcons[type] || Clock;
  const speakerText = Array.isArray(speaker) ? speaker.join(', ') : speaker;

  return (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-dark-100/50 transition-colors border border-transparent hover:border-white/5">
      <div className="flex-shrink-0 w-24 sm:w-32">
        <span className="text-teal-400 font-mono text-sm">{time}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Badge className={`${eventTypeColors[type] || 'bg-gray-500/20 text-gray-400'} text-xs`}>
            <Icon className="h-3 w-3 mr-1" />
            {eventTypeLabels[type] || type}
          </Badge>
          {speakerText && (
            <span className="text-gray-500 text-sm">{speakerText}</span>
          )}
        </div>

        <h3 className="text-white font-semibold mb-1">{title}</h3>
        {description && (
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

export function Programacao() {
  const { projectId } = useProject();
  const { data: sessions, isLoading } = useSessions();
  const [activeTab, setActiveTab] = useState('1');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // load saved filters
  useEffect(() => {
    try {
      const saved = localStorage.getItem('programacao_filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedTypes(parsed);
      }
    } catch {
      // ignore JSON errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('programacao_filters', JSON.stringify(selectedTypes));
  }, [selectedTypes]);

  const filteredSessions = sessions
    .filter(s => s.day?.toString() === activeTab)
    .filter(s => selectedTypes.length === 0 || selectedTypes.includes(s.type))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const days = Array.from(new Set(sessions.map(s => s.day?.toString() || '1'))).sort();

  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30 px-4 py-1">
              Programação Real-time
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter uppercase">
              Agenda do Evento
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Confira a programação completa e atualizada em tempo real para os dias do evento.
            </p>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtros de tipo de evento */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {Object.entries(eventTypeLabels).map(([type, label]) => {
              const active = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedTypes(prev =>
                      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                    );
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                    active
                      ? 'bg-brand-orange-coral text-white border-brand-orange-coral shadow-lg shadow-brand-orange-coral/20'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-dark-200 p-1 rounded-2xl mb-8">
              <TabsTrigger
                value="1"
                className="data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl h-12 font-bold"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Dia 1
              </TabsTrigger>
              <TabsTrigger
                value="2"
                className="data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-xl h-12 font-bold"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Dia 2
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="glass-card p-6 sm:p-8 border-white/5">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                      Dia {activeTab}
                    </h2>
                    <p className="text-gray-500 text-sm">Listagem completa de atividades confirmadas</p>
                  </div>
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 px-3 py-1">
                    {filteredSessions.length} atividades
                  </Badge>
                </div>

                {isLoading ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-500 mt-4 font-medium">Carregando programação...</p>
                  </div>
                ) : filteredSessions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSessions.map((event) => (
                      <EventItem
                        key={event.id}
                        time={`${event.startTime.substring(0, 5)} - ${event.endTime.substring(0, 5)}`}
                        title={event.title}
                        type={event.type}
                        description={event.description}
                        speaker={event.speakers}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                    <Users className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Nenhuma atividade encontrada</p>
                    <p className="text-gray-600 text-xs mt-1">Tente remover os filtros ou escolha outro dia.</p>
                  </div>
                )}
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
