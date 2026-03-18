import {
  Linkedin,
  Globe,
  Mic
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSpeakers } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';

export function Palestrantes() {
  const { projectId } = useProject();
  const { data: speakers, isLoading } = useSpeakers();

  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30 px-4 py-1">
              Speakers 2026
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter uppercase">
              Quem vai estar no palco
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Especialistas e líderes que estão transformando o ecossistema de negócios através de Growth e IA.
            </p>
          </div>
        </div>
      </section>

      {/* Speakers Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 mt-4 font-medium">Carregando palestrantes...</p>
            </div>
          ) : speakers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {speakers
                .filter(s => !projectId || s.projectId === projectId)
                .map((speaker) => (
                <div
                  key={speaker.id}
                  className="group glass-card overflow-hidden hover:border-teal-500/50 transition-all duration-500 rounded-[2rem] border-white/5"
                >
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img
                      src={speaker.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'}
                      alt={speaker.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Social Links */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      {speaker.linkedin && (
                        <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-teal-500 transition-all border border-white/10">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {speaker.website && (
                        <a href={speaker.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-teal-500 transition-all border border-white/10">
                          <Globe className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 px-3 py-1">
                        <Mic className="h-3 w-3 mr-1" />
                        {speaker.track || 'Convidado'}
                      </Badge>
                      {speaker.isFeatured && (
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                          STAFF
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{speaker.name}</h3>
                    <p className="text-teal-400 font-bold text-sm mb-1">{speaker.role}</p>
                    <p className="text-gray-500 text-sm mb-6 font-medium">{speaker.company}</p>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{speaker.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
              <Mic className="h-16 w-16 text-gray-800 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Nenhum palestrante cadastrado</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Em breve divulgaremos a lista completa de speakers para 2026.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-orange-500/10" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Quer ser palestrante?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Estamos sempre em busca de novos talentos e especialistas para compartilhar
            conhecimento no Growth Summit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:contato@growthsummit.site"
              className="inline-flex items-center px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
            >
              Enviar proposta
            </a>
            <a
              href="mailto:contato@growthsummit.site"
              className="text-gray-400 hover:text-teal-400 transition-colors"
            >
              contato@growthsummit.site
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
