import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin
} from 'lucide-react';
import { EVENT_CONFIG } from '@/config/eventConfig';

const footerLinks = {
  evento: [
    { name: 'Triunfo-PE', href: '/triunfo' },
    { name: 'Petrolina-PE', href: '/petrolina' },
    { name: 'Inscrições', href: '/inscricoes' },
    { name: 'Validar Certificado', href: '/validar' },
    { name: 'FAQ', href: '/faq' },
  ],
  participar: [
    { name: 'Inscrições', href: '/inscricoes' },
    { name: 'Contato', href: '/contato' },
  ],
  parcerias: [
    { name: 'Seja Patrocinador', href: '/seja-patrocinador' },
    { name: 'Seja Mentor', href: '/seja-mentor' },
    { name: 'Contato', href: '/contato' },
  ],
  legal: [
    { name: 'Termos de Uso', href: '/termos' },
    { name: 'Política de Privacidade', href: '/privacidade' },
    { name: 'LGPD', href: '/lgpd' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: EVENT_CONFIG.social.instagram },
  { name: 'LinkedIn', icon: Linkedin, href: EVENT_CONFIG.social.linkedin },
];

export function Footer() {

  return (
    <footer className="bg-brand-grafite border-t border-white/5">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          
          {/* Brand Column */}
          <div className="space-y-8">
            <Link to="/" className="inline-block group transition-transform hover:scale-105">
              <img
                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/LOGO-growthexperience-fundoescuro.v2.png"
                alt="Growth Experience"
                className="h-12 w-auto drop-shadow-[0_0_8px_rgba(255,138,76,0.3)]"
              />
            </Link>
            
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              O movimento que está transformando o interior do Nordeste através de Growth, 
              Liderança e Inteligência Artificial. Junte-se à elite empresarial da região.
            </p>

            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] leading-none">Realização</p>
              <img
                src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/logomarca-cbx-growth-ia.png"
                alt="CBX Growth"
                className="h-9 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all object-contain self-start"
              />
            </div>
          </div>

          {/* Links Column */}
          <div className="grid grid-cols-2 gap-8 md:gap-4">
            <div className="space-y-6">
              <h4 className="text-white font-black text-sm uppercase tracking-widest">Navegação</h4>
              <ul className="space-y-4">
                {[
                  { name: 'O GX', href: '/sobre' },
                  { name: 'Edições', href: '/edicoes' },
                  { name: 'Parceiros', href: '/parceiros' },
                  { name: 'Galeria', href: '/galeria' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-500 hover:text-brand-orange transition-colors font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-white font-black text-sm uppercase tracking-widest">Participar</h4>
              <ul className="space-y-4">
                {[
                  { name: 'Inscrições', href: '/inscricoes' },
                  { name: 'Contato', href: '/contato' },
                  { name: 'FAQ', href: '/faq' },
                  { name: 'Termos', href: '/termos' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-500 hover:text-brand-orange transition-colors font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Social Column */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-white font-black text-sm uppercase tracking-widest">Conecte-se</h4>
              <div className="space-y-4">
                <a
                  href={`https://wa.me/${EVENT_CONFIG.whatsapp.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors">
                    <Phone className="h-5 w-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">WhatsApp</p>
                    <p className="text-gray-300 font-bold group-hover:text-white transition-colors">{EVENT_CONFIG.whatsapp.display}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${EVENT_CONFIG.email}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors">
                    <Mail className="h-5 w-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Email</p>
                    <p className="text-gray-300 font-bold group-hover:text-white transition-colors text-sm">{EVENT_CONFIG.email}</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-orange transition-all hover:-translate-y-1 shadow-lg"
                  aria-label={social.name}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-500 text-sm break-words">
              © 2026 Growth Experience. Todos os direitos reservados.
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
