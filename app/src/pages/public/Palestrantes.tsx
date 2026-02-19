import {
  Linkedin,
  Globe,
  Mic
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { speakers } from '@/data/eventData';

export function Palestrantes() {
  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Palestrantes
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Quem vai estar no palco
            </h1>
            <p className="text-xl text-gray-400">
              Especialistas renomados que vão compartilhar conhecimento e experiências práticas
            </p>
          </div>
        </div>
      </section>

      {/* Speakers Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {speakers.map((speaker) => (
              <div
                key={speaker.id}
                className="group glass-card overflow-hidden hover:border-teal-500/50 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={speaker.image}
                    alt={speaker.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Social Links */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                      <Globe className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <Badge className="mb-3 bg-teal-500/10 text-teal-400 border-teal-500/30">
                    <Mic className="h-3 w-3 mr-1" />
                    {speaker.track}
                  </Badge>
                  <h3 className="text-xl font-semibold text-white mb-1">{speaker.name}</h3>
                  <p className="text-teal-400 text-sm mb-1">{speaker.role}</p>
                  <p className="text-gray-500 text-sm mb-4">{speaker.company}</p>
                  <p className="text-gray-400 text-sm">{speaker.bio}</p>
                </div>
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
