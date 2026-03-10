import { motion } from 'framer-motion';
import { Home as HomeIcon, ArrowLeft, Rocket, Sparkles, Clock, Bell } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PremiumBackground } from './dashboard/components/shared/PremiumBackground';

export function ComingSoon() {
  const { feature } = useParams();
  const navigate = useNavigate();

  // Format feature name from slug: "export-csv" -> "Exportação de CSV"
  const featureName = feature 
    ? feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Esta Funcionalidade';

  return (
    <div className="min-h-screen bg-dark relative flex items-center justify-center px-4 overflow-hidden">
      <PremiumBackground />
      
      <div className="max-w-2xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-brand-orange-coral/20 rounded-3xl flex items-center justify-center animate-pulse">
                <Rocket className="h-10 w-10 text-brand-orange-coral" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4"
              >
                <Sparkles className="h-8 w-8 text-teal-400 opacity-50" />
              </motion.div>
            </div>
          </div>

          <Badge variant="outline" className="mb-6 border-brand-orange-coral/30 text-brand-orange-coral px-4 py-1 text-xs uppercase font-black tracking-widest">
            Coming Soon • Em Breve
          </Badge>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
            {featureName}
          </h1>
          
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Nossa equipe de engenharia está trabalhando intensamente para entregar esta funcionalidade com o padrão de excelência do <strong>Growth Summit 2026</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div className="bg-dark-100 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <Clock className="h-6 w-6 text-teal-400" />
              <div className="text-left">
                <p className="text-white font-bold text-sm">Status</p>
                <p className="text-gray-500 text-xs">Em Desenvolvimento</p>
              </div>
            </div>
            <div className="bg-dark-100 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <Bell className="h-6 w-6 text-brand-orange-coral" />
              <div className="text-left">
                <p className="text-white font-bold text-sm">Notificar</p>
                <p className="text-gray-500 text-xs">Disponível em breve</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-10 py-6 rounded-2xl h-auto"
            >
              <Link to="/">
                <HomeIcon className="h-5 w-5 mr-3" />
                VOLTAR AO INÍCIO
              </Link>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-dark-300 text-gray-400 hover:text-white px-10 py-6 rounded-2xl h-auto backdrop-blur-md"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              VOLTAR
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Inline Badge component if not imported
function Badge({ children, className, variant }: any) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
