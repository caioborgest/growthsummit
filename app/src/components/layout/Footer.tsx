import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Youtube,
  Twitter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const footerLinks = {
  evento: [
    { name: 'Sobre', href: '/sobre' },
    { name: 'Programação', href: '/programacao' },
    { name: 'Palestrantes', href: '/palestrantes' },
    { name: 'Local', href: '/local-viagem' },
    { name: 'FAQ', href: '/faq' },
  ],
  participar: [
    { name: 'Inscrições', href: '/inscricoes' },
    { name: 'Mentorias', href: '/mentorias' },
    { name: 'Rodada B2B', href: '/rodada-negocios' },
    { name: 'Startups', href: '/startups' },
    { name: 'Growth Experience', href: '/growth-experience' },
    { name: 'Growth Experience Triunfo-PE', href: '/growth-experience-triunfo' },
  ],
  parcerias: [
    { name: 'Seja Patrocinador', href: '/seja-patrocinador' },
    { name: 'Seja Mentor', href: '/seja-mentor' },
    { name: 'Parceiros', href: '/parceiros' },
    { name: 'Imprensa', href: '/contato' },
  ],
  legal: [
    { name: 'Termos de Uso', href: '/termos' },
    { name: 'Política de Privacidade', href: '/privacidade' },
    { name: 'LGPD', href: '/lgpd' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-dark-200 border-t border-dark-300">
      {/* Newsletter Section */}
      <div className="border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Fique por dentro das novidades
              </h3>
              <p className="text-gray-400">
                Receba atualizações sobre palestrantes, programação e promoções exclusivas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full lg:w-auto">
              <Input
                type="email"
                placeholder="Seu melhor email"
                className="bg-dark-100 border-dark-300 text-white placeholder:text-gray-500 flex-1"
              />
              <Button className="bg-brand-yellow hover:bg-brand-yellow/90 text-dark-100 font-bold whitespace-nowrap">
                Inscrever
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-yellow flex items-center justify-center">
                <span className="text-dark-100 font-bold text-lg">GS</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-tight">Growth Summit</span>
                <span className="text-brand-yellow text-xs block font-bold">2026</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              A maior conferência de Growth, Marketing, Vendas e IA do Nordeste.
              21-22 de maio de 2026 em Juazeiro do Norte, CE.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:contato@growthsummit.com.br"
                className="flex items-center text-gray-400 hover:text-teal-400 text-sm transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                contato@growthsummit.com.br
              </a>
              <a
                href="tel:+5588999999999"
                className="flex items-center text-gray-400 hover:text-teal-400 text-sm transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                (88) 99999-9999
              </a>
              <div className="flex items-start text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Boulevard Hotel, Juazeiro do Norte - CE
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-semibold mb-4">Evento</h4>
            <ul className="space-y-2">
              {footerLinks.evento.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-brand-yellow text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Participar</h4>
            <ul className="space-y-2">
              {footerLinks.participar.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-brand-yellow text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Parcerias</h4>
            <ul className="space-y-2">
              {footerLinks.parcerias.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Growth Summit. Todos os direitos reservados.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-brand-yellow transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
