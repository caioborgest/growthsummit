import { MapPin, Plane, Car, Hotel, Bus, Navigation, Clock, Phone, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LocalViagem() {
  return (
    <div className="bg-dark min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              <MapPin className="h-3 w-3 mr-1" />
              Local do Evento
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Como Chegar ao <span className="text-teal-400">Growth Experience</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Todas as informações que você precisa para chegar ao evento em Juazeiro do Norte, Ceará.
            </p>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="py-16 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Boulevard Hotel & Convention
              </h2>
              <p className="text-gray-400 mb-6 text-lg">
                O maior centro de convenções da região do Cariri, com estrutura completa
                para receber mais de 1.500 participantes em grande estilo e conforto.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Endereço</p>
                    <p className="text-gray-400">Rua São Pedro, 1200, Centro</p>
                    <p className="text-gray-400">Juazeiro do Norte - CE, 63010-010</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Horário do Evento</p>
                    <p className="text-gray-400">21-22 de maio de 2026</p>
                    <p className="text-gray-400">08:00 às 21:00</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Telefone do Hotel</p>
                    <p className="text-gray-400">(88) 99999-8888</p>
                  </div>
                </div>
              </div>

              <Button className="bg-teal-500 hover:bg-teal-600 text-white" asChild>
                <a href="https://maps.google.com/?q=Boulevard+Hotel+Juazeiro+do+Norte" target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4 mr-2" />
                  Ver no Google Maps
                </a>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500/20 to-orange-500/20 border border-dark-300">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=450&fit=crop"
                  alt="Boulevard Hotel"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transport Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/30">
              <Plane className="h-3 w-3 mr-1" />
              Opções de Transporte
            </Badge>
            <h2 className="text-3xl font-bold text-white">
              Como Chegar a Juazeiro do Norte
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* By Air */}
            <Card className="bg-dark-200 border-dark-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-4">
                  <Plane className="h-6 w-6 text-teal-400" />
                </div>
                <CardTitle className="text-white">Por Avião</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Aeroporto Regional Orlando Bezerra de Menezes (JDO) recebe voos de
                  Fortaleza, Recife e outras capitais.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-2" />
                    10 min do centro
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-2" />
                    Táxi/UBER disponível
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-2" />
                    Transfer do hotel
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* By Bus */}
            <Card className="bg-dark-200 border-dark-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                  <Bus className="h-6 w-6 text-orange-400" />
                </div>
                <CardTitle className="text-white">Por Ônibus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Rodoviária de Juazeiro do Norte com linhas de todas as regiões do
                  Nordeste e principais capitais brasileiras.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                    5 min do hotel
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                    Táxi na porta
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                    Ônibus urbano
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* By Car */}
            <Card className="bg-dark-200 border-dark-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Car className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Por Carro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Acesso fácil pela BR-116 e CE-060. Estacionamento disponível
                  no hotel e proximidades.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                    Estacionamento coberto
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                    Manobrista disponível
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                    Posto de combustível próximo
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Hotels */}
      <section className="py-16 bg-dark-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-500/10 text-teal-400 border-teal-500/30">
              <Hotel className="h-3 w-3 mr-1" />
              Hospedagem
            </Badge>
            <h2 className="text-3xl font-bold text-white">
              Onde Ficar
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Descontos especiais para participantes do Growth Experience em hotéis partners.
              Use o código <span className="text-teal-400 font-semibold">GROWTH2026</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Boulevard Hotel',
                type: 'Hotel Oficial',
                distance: 'No local do evento',
                price: 'R$ 280/noite',
                featured: true,
              },
              {
                name: 'Hotel Cariri',
                type: 'Hotel Parceiro',
                distance: '800m do evento',
                price: 'R$ 180/noite',
                featured: false,
              },
              {
                name: 'Iu-á Hotel',
                type: 'Hotel Parceiro',
                distance: '1,2km do evento',
                price: 'R$ 150/noite',
                featured: false,
              },
            ].map((hotel, i) => (
              <Card key={i} className={`bg-dark-200 border-dark-300 ${hotel.featured ? 'border-teal-500/50' : ''}`}>
                <CardContent className="p-6">
                  {hotel.featured && (
                    <Badge className="mb-3 bg-teal-500/20 text-teal-400">Hotel Oficial</Badge>
                  )}
                  <h3 className="text-xl font-semibold text-white mb-2">{hotel.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{hotel.type}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-teal-400" />
                      {hotel.distance}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Hotel className="h-4 w-4 mr-2 text-teal-400" />
                      A partir de {hotel.price}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full border-dark-300 text-gray-300 hover:text-white">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Reservar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card overflow-hidden">
            <div className="aspect-video bg-dark-300 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                <p className="text-white text-lg font-medium mb-2">Mapa Interativo</p>
                <p className="text-gray-400 mb-4">Boulevard Hotel & Convention</p>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white" asChild>
                  <a href="https://maps.google.com/?q=Boulevard+Hotel+Juazeiro+do+Norte" target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4 mr-2" />
                    Abrir no Google Maps
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
