import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Video, 
  Filter, 
  Maximize2, 
  X,
  Play,
  ArrowRight,
  MapPin,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/hooks/useData';
import { GalleryItem } from '@/types';

const categories = [
  { id: 'all', name: 'Tudo' },
  { id: 'triunfo', name: 'Triunfo' },
  { id: 'petrolina', name: 'Petrolina' },
  { id: 'videos', name: 'Vídeos' },
];

export function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { data: galleryItems, isLoading } = useData<GalleryItem>([], 'gallery_items', {
    projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Global ou pivot
    filters: { active: true }
  });

  const [selectedItem, setSelectedItem] = useState<null | GalleryItem>(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return galleryItems;
    if (activeCategory === 'videos') return galleryItems.filter(item => item.type === 'video');
    return galleryItems.filter(item => item.category?.toLowerCase() === activeCategory);
  }, [galleryItems, activeCategory]);

  return (
    <div className="bg-brand-grafite min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="py-20 lg:py-32 relative text-center">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-orange/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
          <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 px-6 py-2 rounded-full font-black tracking-widest uppercase text-[10px]">
            REGISTROS VISUAIS
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
            A EXPERIÊNCIA EM <span className="text-brand-orange text-transparent bg-clip-text bg-[image:var(--brand-gradient)]">FOCO</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Mergulhe nos momentos que definem o maior circuito de negócios do interior.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mb-16">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                activeCategory === cat.id 
                  ? 'bg-brand-orange text-white shadow-xl shadow-brand-orange/20' 
                  : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 text-brand-orange animate-spin opacity-40" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Carregando Galeria...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div 
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode='popLayout'>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedItem(item)}
                  className="group relative aspect-square rounded-[3rem] overflow-hidden cursor-pointer border border-white/5"
                >
                  <img 
                    src={item.type === 'video' ? (item.thumbnailUrl || item.mediaUrl) : item.mediaUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-grafite via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      {item.type === 'video' ? <Play className="w-6 h-6 text-white fill-white" /> : <Maximize2 className="w-6 h-6 text-white" />}
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 delay-75">
                    <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">
                      {item.category?.toUpperCase() || (item.type === 'video' ? 'VIDEO' : 'GALLERY')}
                    </p>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{item.title}</h4>
                  </div>

                  {item.type === 'video' && (
                    <div className="absolute top-6 right-6">
                      <Video className="w-5 h-5 text-brand-orange" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-white/5">
            <Camera className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">NENHUM REGISTRO ENCONTRADO</h3>
            <p className="text-gray-500 font-medium">Os momentos deste circuito estão sendo processados.</p>
          </div>
        )}
      </section>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-20 bg-brand-grafite/95 backdrop-blur-xl"
          >
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-10 right-10 text-white hover:text-brand-orange transition-colors"
            >
              <X className="w-10 h-10" />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl aspect-[16/10] sm:aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl bg-black"
            >
              {selectedItem.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                   <p className="text-gray-500 font-bold uppercase tracking-widest">Player de Vídeo (ID: {selectedItem.id})</p>
                   {/* Aqui entraria um embed de YouTube/Vimeo ou player nativo */}
                </div>
              ) : (
                <img 
                  src={selectedItem.url} 
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              )}
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div className="space-y-2">
                  <Badge className="bg-brand-orange">{selectedItem.category.toUpperCase()}</Badge>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedItem.title}</h3>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestion Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
           <div className="bg-white/5 border border-white/10 p-12 lg:p-24 rounded-[4rem] text-center space-y-8">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">VEJA O MOVIMENTO EM TEMPO REAL</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Acompanhe os bastidores e registros oficiais através das nossas redes sociais.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="bg-white text-dark hover:bg-brand-orange hover:text-white font-black px-12 h-16 rounded-2xl text-lg transition-all">
                  <a href="https://instagram.com/cxbgrowth" target="_blank" rel="noopener noreferrer">Nosso Instagram</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/10 text-white hover:bg-white/5 font-bold px-12 h-16 rounded-2xl text-lg">
                   <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">Canal YouTube</a>
                </Button>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
