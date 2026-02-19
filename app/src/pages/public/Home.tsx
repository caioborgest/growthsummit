import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Megaphone,
  Handshake,
  Brain,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  Rocket,
  Zap,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { eventInfo, stats, tracks, speakers, ticketTypes, testimonials } from '@/data/eventData';

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-05-21T09:00:00-03:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-dark-200 rounded-xl border border-dark-300 flex items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-teal-400">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-gray-400 mt-2">{label}</span>
    </div>
  );

  return (
    <div className="flex space-x-3 sm:space-x-4">
      <TimeUnit value={timeLeft.days} label="Dias" />
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </div>
  );
}

// Animated Counter Component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

// Track Icon Component
function TrackIcon({ name }: { name: string }) {
  const icons: Record<string, React.ElementType> = {
    TrendingUp,
    Megaphone,
    Handshake,
    Brain,
    Users,
  };
  const Icon = icons[name] || TrendingUp;
  return <Icon className="h-6 w-6" />;
}

// Testimonials Carousel
function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
              <div className="glass-card p-8 max-w-2xl mx-auto">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-lg mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 p-2 rounded-full bg-dark-200 border border-dark-300 text-gray-400 hover:text-white hover:border-teal-500 transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 p-2 rounded-full bg-dark-200 border border-dark-300 text-gray-400 hover:text-white hover:border-teal-500 transition-all"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-teal-500 w-6' : 'bg-dark-300'
              }`}
          />
        ))}
      </div>
    </div>
  );
}

export function Home() {
  return (
    <div className="bg-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="mb-6 bg-teal-500/10 text-teal-400 border-teal-500/30 px-4 py-1">
            21-22 de maio de 2026 · Juazeiro do Norte, CE
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Growth Summit 2026
            <span className="block text-teal-400">Gestão e Inovação</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            {eventInfo.tagline}
          </p>

          {/* Countdown */}
          <div className="flex justify-center mb-10">
            <CountdownTimer />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-lg animate-glow-pulse"
              asChild
            >
              <Link to="/inscricoes">
                Garantir minha vaga
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-dark-300 text-gray-300 hover:text-white hover:border-teal-500 px-8 py-6 text-lg"
              asChild
            >
              <Link to="/programacao">Ver programação</Link>
            </Button>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-teal-400" />
              <span>2 dias de evento</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-teal-400" />
              <span>Juazeiro do Norte, CE</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-teal-400" />
              <span>700+ participantes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-dark-300 bg-dark-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-teal-400 mb-2">
                <AnimatedCounter value={stats.participants} suffix="+" />
              </p>
              <p className="text-gray-400">Participantes</p>
            </div>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-teal-400 mb-2">
                <AnimatedCounter value={stats.speakers} suffix="+" />
              </p>
              <p className="text-gray-400">Palestrantes</p>
            </div>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-teal-400 mb-2">
                <AnimatedCounter value={stats.mentorias} suffix="+" />
              </p>
              <p className="text-gray-400">Mentorias</p>
            </div>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-teal-400 mb-2">
                <AnimatedCounter value={stats.b2bMeetings} suffix="+" />
              </p>
              <p className="text-gray-400">Reuniões B2B</p>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Experience Triunfo Exclusive Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange-coral/20 via-dark to-brand-blue/10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-orange-coral/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Imagem/Visual */}
            <div className="order-2 lg:order-1 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1511578334221-d3023916020e?q=80&w=2069&auto=format&fit=crop"
                  alt="Growth Experience Triunfo"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />

                {/* Overlay Info */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-orange-coral flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Triunfo - Pernambuco</p>
                      <p className="text-brand-orange-coral text-sm font-semibold">09 de Abril, 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 */}
              <div className="absolute -top-6 -left-6 z-20 glass-card p-4 border-brand-orange-coral/30 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-orange-coral/20 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-brand-orange-coral" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Arena Pitch</p>
                    <p className="text-gray-400 text-xs">R$ 5k em Prêmios</p>
                  </div>
                </div>
              </div>

              {/* Floating Element 2 */}
              <div className="absolute bottom-12 -right-6 z-20 glass-card p-4 border-brand-blue/30 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-blue/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Rodada B2B</p>
                    <p className="text-gray-400 text-xs">Networking Direto</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                  PRÓXIMO EVENTO REGIONAL
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Growth Experience<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient">
                    Triunfo-PE 2026
                  </span>
                </h2>
                <p className="text-xl text-gray-400">
                  A Maior Exposição de Negócios do Sertão do Pajeú. Uma edição épica focada em impulsionar o ecossistema regional.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Award, title: 'Arena Pitch', desc: 'Premiação para Startups' },
                  { icon: Users, title: 'Mentorias 1:1', desc: 'Acesso aos melhores CEOs' },
                  { icon: Handshake, title: 'Rodada B2B', desc: 'Conexões Estratégicas' },
                  { icon: TrendingUp, title: 'Expo Negócios', desc: 'Visibilidade para PMEs' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange-coral transition-colors">
                      <item.icon className="h-5 w-5 text-brand-orange-coral" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button
                  size="lg"
                  className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white px-8 h-14 text-lg font-bold shadow-lg shadow-brand-orange-coral/20 group"
                  asChild
                >
                  <Link to="/growth-experience-triunfo">
                    Quero Garantir minha Vaga
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  * Vagas limitadas para mentorias e Arena Pitch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
                Sobre o Evento
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                A maior conferência de <span className="text-teal-400">Growth</span> do Nordeste
              </h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  O Growth Summit 2026 é um evento de dois dias focado em gestão, inovação e
                  crescimento de negócios. Reunimos os melhores especialistas em Growth Marketing,
                  Vendas B2B, Inteligência Artificial e Liderança.
                </p>
                <p>
                  Com palestras inspiradoras, workshops práticos, mentorias individuais e
                  rodadas de negócios B2B, o evento oferece uma experiência completa para
                  quem quer acelerar o crescimento da sua empresa.
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  'Palestras com especialistas renomados',
                  'Workshops práticos e hands-on',
                  'Mentorias individuais 1:1',
                  'Rodada de negócios B2B',
                  'Networking de alta qualidade',
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 mr-3 text-teal-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button className="mt-8 bg-teal-500 hover:bg-teal-600 text-white" asChild>
                <Link to="/sobre">Conheça mais</Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500/20 to-orange-500/20 border border-dark-300">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop"
                  alt="Evento Growth Summit"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-dark-200 rounded-xl border border-dark-300 p-6">
                <p className="text-3xl font-bold text-teal-400">15+</p>
                <p className="text-gray-400 text-sm">Startups na Expo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Trilhas Temáticas
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              5 Eixos de Conteúdo
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Conteúdo especializado para cada etapa do seu negócio, desde aquisição até gestão
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="group glass-card p-6 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${track.color === 'teal' ? 'bg-teal-500/20 text-teal-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                  <TrackIcon name={track.icon} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{track.name}</h3>
                <p className="text-gray-400 mb-4">{track.description}</p>
                <ul className="space-y-2">
                  {track.topics.map((topic, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-500">
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${track.color === 'teal' ? 'bg-teal-400' : 'bg-orange-400'
                        }`} />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers Preview */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
                Palestrantes
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Quem vai estar no palco
              </h2>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0 border-dark-300 text-gray-300 hover:text-white" asChild>
              <Link to="/palestrantes">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.slice(0, 6).map((speaker) => (
              <div
                key={speaker.id}
                className="group glass-card overflow-hidden hover:border-teal-500/50 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={speaker.image}
                    alt={speaker.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <Badge className="mb-2 bg-teal-500/10 text-teal-400 border-teal-500/30">
                    {speaker.track}
                  </Badge>
                  <h3 className="text-lg font-semibold text-white">{speaker.name}</h3>
                  <p className="text-teal-400 text-sm">{speaker.role}</p>
                  <p className="text-gray-500 text-sm">{speaker.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section className="py-20 lg:py-28 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              Inscrições
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Escolha sua experiência
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Do acesso básico à experiência VIP premium, temos a opção ideal para você
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {ticketTypes.map((ticket) => (
              <div
                key={ticket.id}
                className={`relative glass-card p-8 ${ticket.popular ? 'border-teal-500/50 scale-105' : ''
                  }`}
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

                <h3 className="text-xl font-semibold text-white mb-2">{ticket.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{ticket.description}</p>

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
                      <Check className="h-4 w-4 mr-2 text-teal-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${ticket.popular
                    ? 'bg-teal-500 hover:bg-teal-600 text-white'
                    : 'bg-dark-100 hover:bg-dark-300 text-white border border-dark-300'
                    }`}
                  asChild
                >
                  <Link to="/inscricoes">Escolher este</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              Depoimentos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              O que dizem sobre nós
            </h2>
          </div>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-orange-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para acelerar seu <span className="text-teal-400">crescimento</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 700 profissionais em busca de crescimento.
            Garanta sua vaga agora com preço especial de lançamento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-lg animate-glow-pulse"
              asChild
            >
              <Link to="/inscricoes">
                Garantir minha vaga
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-dark-300 text-gray-300 hover:text-white hover:border-teal-500 px-8 py-6 text-lg"
              asChild
            >
              <Link to="/contato">Falar com organização</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
