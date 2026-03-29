import { useState } from 'react';
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Layers, 
  Layout, 
  Smartphone, 
  Monitor, 
  Zap,
  Check,
  Globe,
  Share2,
  Ticket,
  Rocket,
  Users,
  Handshake,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';

interface IntegrationModule {
  id: string;
  name: string;
  icon: any;
  description: string;
  path: string;
  color: string;
}

const modules: IntegrationModule[] = [
  {
    id: 'inscricoes',
    name: 'Inscrição de Participantes',
    icon: Users,
    description: 'Fluxo principal de inscrição (Standard e Pro/VIP).',
    path: '/inscricoes',
    color: 'orange'
  },
  {
    id: 'lotes-equipes',
    name: 'Inscrições em Lote',
    icon: Ticket,
    description: 'Venda de pacotes corporativos e vouchers.',
    path: '/inscricoes?type=batch',
    color: 'teal'
  },
  {
    id: 'startups',
    name: 'Arena Pitch (Startups)',
    icon: Rocket,
    description: 'Formulário de submissão de startups.',
    path: '/startups',
    color: 'purple'
  },
  {
    id: 'rodada-negocios',
    name: 'Rodada B2B',
    icon: Handshake,
    description: 'Inscrição de empresas para rodada de negócios.',
    path: '/rodada-negocios',
    color: 'blue'
  },
  {
    id: 'mentores',
    name: 'Seja um Mentor',
    icon: Star,
    description: 'Captação de novos mentores para o evento.',
    path: '/seja-mentor',
    color: 'amber'
  },
  {
    id: 'patrocinadores',
    name: 'Seja Patrocinador',
    icon: Globe,
    description: 'Proposta comercial de cotas de patrocínio.',
    path: '/seja-patrocinador',
    color: 'emerald'
  }
];

export function AdminIntegracoes() {
  const { selectedProject } = useProject();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'link' | 'iframe' | 'widget'>('link');

  const baseUrl = window.location.origin;
  const projectSlug = selectedProject?.slug || 'ge-triunfo-2026';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Código copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIntegrationCode = (module: IntegrationModule, type: 'link' | 'iframe' | 'widget') => {
    const url = `${baseUrl}${module.path}?project=${selectedProject?.id || ''}`;
    
    if (type === 'link') {
      return url;
    }
    
    if (type === 'iframe') {
      return `<iframe \n  src="${url}&embed=true" \n  width="100%" \n  height="800px" \n  frameborder="0" \n  style="border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.1);"\n></iframe>`;
    }
    
    if (type === 'widget') {
      return `<!-- Growth Experience Widget -->\n<script \n  src="${baseUrl}/js/widget.js" \n  data-project="${selectedProject?.id}" \n  data-module="${module.id}" \n  data-color="${module.color}"\n></script>`;
    }

    return '';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Interativo */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange-coral/20 to-teal-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass-card p-8 lg:p-12 border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col lg:flex-row items-center justify-between gap-8 rounded-[2.5rem]">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/10 border border-brand-orange-coral/20 text-brand-orange-coral text-[10px] font-black uppercase tracking-widest mb-6">
              <Share2 className="h-3 w-3 animate-pulse" />
              Ecossistema Conectado
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 uppercase tracking-tight">
              Códigos de <span className="text-gradient">Integração</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Integre os formulários de inscrição e captação do <span className="text-white font-bold">{selectedProject?.name || 'evento'}</span> diretamente no seu site institucional, landing pages de parceiros ou portais de notícias.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-48 h-48 bg-brand-orange-coral/10 rounded-[2.5rem] flex items-center justify-center border border-white/10 relative">
              <Code className="h-20 w-20 text-brand-orange-coral animate-pulse-slow" />
              <div className="absolute -top-4 -right-4 p-4 glass-card border-teal-500/30 bg-teal-500/10 rounded-2xl">
                <Globe className="h-6 w-6 text-teal-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Seleção de Formato */}
      <div className="flex flex-wrap gap-4 p-2 bg-white/5 border border-white/10 rounded-3xl w-fit mx-auto lg:mx-0">
        <Button
          onClick={() => setActiveTab('link')}
          className={`h-12 px-8 rounded-2xl font-black transition-all ${activeTab === 'link' ? 'bg-brand-orange-coral text-white shadow-lg' : 'bg-transparent text-gray-500 hover:text-white'}`}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Links Diretos
        </Button>
        <Button
          onClick={() => setActiveTab('iframe')}
          className={`h-12 px-8 rounded-2xl font-black transition-all ${activeTab === 'iframe' ? 'bg-brand-orange-coral text-white shadow-lg' : 'bg-transparent text-gray-500 hover:text-white'}`}
        >
          <Layout className="h-4 w-4 mr-2" />
          IFrame Embed
        </Button>
        <Button
          onClick={() => setActiveTab('widget')}
          className={`h-12 px-8 rounded-2xl font-black transition-all ${activeTab === 'widget' ? 'bg-brand-orange-coral text-white shadow-lg shadow-brand-orange-coral/20' : 'bg-transparent text-gray-400 hover:text-white'}`}
        >
          <Zap className="h-4 w-4 mr-2 text-brand-orange-coral" />
          Widget Smart (JS)
        </Button>
      </div>

      {!selectedProject && (
        <div className="p-12 glass-card text-center border-brand-orange-coral/20 bg-brand-orange-coral/5 rounded-[2.5rem]">
          <Smartphone className="h-12 w-12 text-brand-orange-coral mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Nenhum Projeto Selecionado</h3>
          <p className="text-gray-500 max-w-md mx-auto">Selecione um projeto na barra lateral para gerar os códigos de integração específicos.</p>
        </div>
      )}

      {selectedProject && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((module) => {
            const code = getIntegrationCode(module, activeTab);
            
            return (
              <div key={module.id} className="glass-card p-8 border-white/5 hover:border-brand-orange-coral/30 hover:bg-brand-orange-coral/[0.02] transition-all group/card rounded-[2rem]">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/card:bg-brand-orange-coral/10 group-hover/card:border-brand-orange-coral/20 transition-all`}>
                    <module.icon className="h-7 w-7 text-gray-400 group-hover/card:text-brand-orange-coral transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1 group-hover/card:text-brand-orange-coral transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">{module.id}</p>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">
                  {module.description}
                </p>

                <div className="relative mb-6">
                  <pre className="p-4 bg-dark-200 border border-white/5 rounded-2xl text-[11px] font-mono text-gray-500 overflow-x-auto custom-scrollbar max-h-32 text-left bg-[#080a0e]">
                    <code>{code}</code>
                  </pre>
                  <Button
                    size="icon"
                    onClick={() => handleCopy(code, module.id)}
                    className={`absolute top-2 right-2 h-9 w-9 rounded-xl border border-white/10 transition-all ${copiedId === module.id ? 'bg-green-500 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                  >
                    {copiedId === module.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold border border-white/5 h-12 rounded-xl"
                  >
                    <a href={`${baseUrl}${module.path}?project=${selectedProject.id}`} target="_blank" rel="noreferrer">
                      Ver Preview
                    </a>
                  </Button>
                  <Button
                    onClick={() => handleCopy(code, module.id)}
                    className="h-12 w-12 rounded-xl bg-brand-orange-coral hover:bg-brand-orange-intense text-white p-0 group"
                  >
                    <Copy className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dicas de Implementação */}
      <div className="glass-card p-8 lg:p-12 border-teal-500/10 bg-teal-500/[0.02] rounded-[2.5rem]">
        <h3 className="text-xl font-bold text-teal-400 mb-6 flex items-center gap-3 uppercase tracking-tight">
          <Layers className="h-6 w-6" />
          Guia de Implementação Rápida
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center font-black text-teal-400 border border-teal-500/20">1</div>
            <h4 className="text-white font-bold">Respeite a Identidade</h4>
            <p className="text-sm text-gray-500">Nossos formulários se adaptam automaticamente à cor primária do seu projeto para manter o branding consistente.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center font-black text-teal-400 border border-teal-500/20">2</div>
            <h4 className="text-white font-bold">Modo Transparente</h4>
            <p className="text-sm text-gray-500">Ao usar o parâmetro <code>&embed=true</code>, removemos o cabeçalho e rodapé do site, ideal para uso dentro de IFrames sem scroll duplo.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center font-black text-teal-400 border border-teal-500/20">3</div>
            <h4 className="text-white font-bold">SEO & Performance</h4>
            <p className="text-sm text-gray-500">A plataforma é otimizada para carregar apenas os chunks necessários, garantindo que o tempo de carregamento do site hospedeiro não seja prejudicado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
