import {
  Crown,
  Coffee,
  Users,
  Video,
  Gift,
  MessageCircle,
  Check,
  Star,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EdicaoAnteriorVideo } from '@/components/growth-experience/EdicaoAnteriorVideo';

const benefits = [
  {
    icon: Coffee,
    title: "Coffee com Palestrantes",
    description: "Café da manhã exclusivo com os speakers âncoras do evento"
  },
  {
    icon: Users,
    title: "2 Mentorias 1:1 Premium",
    description: "Sessões individuais com os mentores mais experientes"
  },
  {
    icon: MessageCircle,
    title: "Grupo VIP WhatsApp",
    description: "Networking exclusivo com os 30 participantes do programa"
  },
  {
    icon: Video,
    title: "Gravações 30 Dias",
    description: "Acesso a todas as gravações do evento por 30 dias"
  },
  {
    icon: Gift,
    title: "Kit Premium",
    description: "Kit exclusivo com produtos de alta qualidade"
  },
  {
    icon: Star,
    title: "Follow-up 3 Meses",
    description: "Acompanhamento estruturado após o evento"
  },
];

const schedule = [
  { time: "07:30", activity: "Coffee Morning VIP com Palestrantes" },
  { time: "08:30", activity: "Palestras Principais (área VIP)" },
  { time: "12:30", activity: "Almoço VIP Exclusivo" },
  { time: "15:00", activity: "Mentorias 1:1 Premium" },
  { time: "19:30", activity: "Jantar de Encerramento VIP" },
];

export function GrowthExperience() {
  return (
    <div className="bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Programa VIP
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Growth Experience
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Uma experiência premium de imersão em growth para líderes de alto impacto
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="glass-card px-6 py-3">
                <span className="text-gray-400 text-sm">Investimento</span>
                <p className="text-2xl font-bold text-white">R$ 2.500</p>
              </div>
              <div className="glass-card px-6 py-3">
                <span className="text-gray-400 text-sm">Vagas</span>
                <p className="text-2xl font-bold text-orange-400">30</p>
              </div>
              <div className="glass-card px-6 py-3">
                <span className="text-gray-400 text-sm">Duração</span>
                <p className="text-2xl font-bold text-white">2 dias + 3 meses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proximas Edicoes 2026 */}
      <section className="py-20 bg-dark-100 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Calendário 2026
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Escolha sua <span className="text-gradient">Experiência</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Duas cidades, um único propósito: acelerar o crescimento do interior através da inovação e inteligência artificial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Edition Triunfo */}
            <div className="group relative glass-card p-1 border-white/5 hover:border-orange-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <MapPin className="h-8 w-8 text-orange-400 group-hover:text-white" />
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">TRIUNFO-PE</Badge>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Edição Sertão do Pajeú</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span>16 de Abril, 2026</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed line-clamp-2">
                    A maior imersão de growth em uma das cidades mais charmosas do Sertão. Foco em varejo, agro e serviços.
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 rounded-2xl"
                >
                  <Link to="/growth-experience-triunfo">
                    Acessar Edição Triunfo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Edition Petrolina */}
            <div className="group relative glass-card p-1 border-white/5 hover:border-teal-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white transition-all">
                    <MapPin className="h-8 w-8 text-teal-400 group-hover:text-white" />
                  </div>
                  <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">PETROLINA-PE</Badge>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Edição Vale do São Francisco</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <Calendar className="h-4 w-4 text-teal-400" />
                    <span>30 de Abril, 2026</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed line-clamp-2">
                    O hub de inovação do Vale. Um evento focado em escala global, agrotech e inteligência artificial aplicada.
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-14 rounded-2xl"
                >
                  <Link to="/growth-experience-petrolina">
                    Acessar Edição Petrolina
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Benefícios
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Tudo que está incluído
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="glass-card p-6">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
                Programação
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Uma experiência exclusiva
              </h2>
              <p className="text-gray-400 mb-8">
                O Growth Experience inclui acesso VIP a todas as atividades do evento,
                além de momentos exclusivos projetados para maximizar seu aprendizado
                e networking.
              </p>

              <ul className="space-y-4">
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Acesso prioritário às salas
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Coffee breaks especiais
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Crachá dourado exclusivo
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Certificado especial assinado
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  Desconto 50% edição 2027
                </li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Agenda VIP - Dia 1
              </h3>
              <div className="space-y-4">
                {schedule.map((item, i) => (
                  <div key={i} className="flex items-center">
                    <span className="text-orange-400 font-mono w-16">{item.time}</span>
                    <span className="text-gray-300">{item.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Comparação
            </Badge>
            <h2 className="text-3xl font-bold text-white">
              Growth Experience vs Outros Passes
            </h2>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-300">
                  <th className="text-left p-4 text-gray-400 font-medium">Benefício</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Standard</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Pro</th>
                  <th className="text-center p-4 text-teal-400 font-medium">VIP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { benefit: "Acesso ao evento", std: "✓", pro: "✓", vip: "✓" },
                  { benefit: "Coffee breaks", std: "✓", pro: "✓", vip: "✓" },
                  { benefit: "Almoço", std: "—", pro: "✓", vip: "VIP" },
                  { benefit: "Mentorias", std: "1 (sorteio)", pro: "2", vip: "2 premium" },
                  { benefit: "Grupo VIP", std: "—", pro: "—", vip: "✓" },
                  { benefit: "Coffee com speakers", std: "—", pro: "—", vip: "✓" },
                  { benefit: "Follow-up", std: "—", pro: "—", vip: "3 meses" },
                  { benefit: "Gravações", std: "—", pro: "30 dias", vip: "30 dias" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-dark-300 last:border-0">
                    <td className="p-4 text-gray-300">{row.benefit}</td>
                    <td className="p-4 text-center text-gray-500">{row.std}</td>
                    <td className="p-4 text-center text-gray-500">{row.pro}</td>
                    <td className="p-4 text-center text-teal-400 font-medium">{row.vip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Edição Anterior — Juazeiro do Norte 2025 */}
      <EdicaoAnteriorVideo showTriunfoTeaser={false} />

      {/* CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-teal-500/10" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-8">
            <Crown className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Garanta sua vaga VIP
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Apenas 30 vagas disponíveis. Não perca essa oportunidade única de
            imersão em growth com os melhores do mercado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              <Crown className="h-5 w-5 mr-2" />
              Quero ser VIP
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-dark-300 text-gray-300 hover:text-white"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Falar com consultor
            </Button>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            Dúvidas? Ligue para (88) 98843-2310 ou envie email para contato@growthsummit.site
          </p>
        </div>
      </section>
    </div>
  );
}
